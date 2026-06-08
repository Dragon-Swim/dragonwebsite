/**
 * Sync pending coach records to Firebase Auth.
 *
 * Reads the "coaches" Firestore collection for documents with
 * status === "pending", creates Auth accounts via Admin SDK,
 * writes users/{uid} with role "coach", and marks them active.
 *
 * Usage:
 *   node scripts/create-coaches.mjs
 *
 * Prerequisites:
 *   - serviceAccountKey.json in project root
 *     (Firebase Console → Project Settings → Service Accounts → Generate New Private Key)
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, "..", "serviceAccountKey.json");

// ── Load service account key ──────────────────────────────────
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
} catch (err) {
  console.error(" Could not read serviceAccountKey.json");
  console.error("  Download it from Firebase Console → Project Settings → Service Accounts");
  console.error(`  Then save as: ${keyPath}`);
  process.exit(1);
}

// ── Init Admin SDK ────────────────────────────────────────────
const app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const auth = app.auth();
const db = app.firestore();

console.log(` Connected to project: ${serviceAccount.project_id}\n`);

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const snapshot = await db.collection("coaches").where("status", "==", "pending").get();

  if (snapshot.empty) {
    console.log(" No pending coach records found.");
    console.log(" Add coaches via the admin page first, then run this script.");
    process.exit(0);
  }

  console.log(` Found ${snapshot.size} pending coach record(s).\n`);

  let success = 0;
  let failed = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const { email, displayName, password } = data;

    try {
      // 1. Create Auth account (Admin SDK does NOT send verification email)
      const user = await auth.createUser({
        email,
        password,
        displayName: displayName || email,
      });
      const uid = user.uid;

      // 2. Write users/{uid} with coach role
      await db.collection("users").doc(uid).set({
        email,
        role: "coach",
        displayName: displayName || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 3. Update coach record to active
      await docSnap.ref.update({
        status: "active",
        uid,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`  [OK] ${email} → uid: ${uid} (${displayName || '—'})`);
      success++;
    } catch (err) {
      console.error(`  [FAIL] ${email}: ${err.message}`);
      // Mark as error so admin can retry
      await docSnap.ref.update({ status: "error", error: err.message }).catch(() => {});
      failed++;
    }
  }

  console.log(`\n Done — ${success} created, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
