/**
 * Seed admin + coach accounts to production Firebase.
 *
 * Usage:
 *   node scripts/seed-online-accounts.mjs
 *
 * Prerequisites:
 *   - serviceAccountKey.json in project root
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, "..", "serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));

const app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const auth = app.auth();
const db = app.firestore();

console.log(` Connected to project: ${serviceAccount.project_id}\n`);

const accounts = [
  { email: "admin@dragonswim.com", password: "admin1234", displayName: "Admin", role: "admin" },
  { email: "coach.thompson@dragonswim.com", password: "coach1234", displayName: "Coach Thompson", role: "coach" },
];

let success = 0;
let failed = 0;

for (const acct of accounts) {
  try {
    // Create Auth account
    const user = await auth.createUser({
      email: acct.email,
      password: acct.password,
      displayName: acct.displayName,
    });
    const uid = user.uid;

    // Write users/{uid}
    await db.collection("users").doc(uid).set({
      email: acct.email,
      role: acct.role,
      displayName: acct.displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`  [OK] ${acct.email} → uid: ${uid} (role: ${acct.role})`);
    success++;
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      console.log(`  [SKIP] ${acct.email} — already exists`);
      success++;
    } else {
      console.error(`  [FAIL] ${acct.email}: ${err.message}`);
      failed++;
    }
  }
}

console.log(`\n Done — ${success} created/skipped, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
