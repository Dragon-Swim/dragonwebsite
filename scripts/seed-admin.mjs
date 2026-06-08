/**
 * Seed script — Admin SDK version for production Firebase.
 *
 * Uses Firebase Admin SDK (server-side) to create users and write
 * Firestore docs. Does NOT send verification emails.
 *
 * Usage:
 *   1. Download service account key from:
 *      Firebase Console → Project Settings → Service Accounts → Generate New Private Key
 *   2. Save as serviceAccountKey.json in project root
 *   3. node scripts/seed-admin.mjs
 *
 * Cleanup (if needed):
 *   - Firebase Console → Authentication → delete test users
 *   - Firebase Console → Firestore → delete registrations/{uid}
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

// ── Seed data ─────────────────────────────────────────────────
const PASSWORD = "test1234";

const families = [
  {
    email: "john.chen@example.com",
    parent: {
      firstName: "John", lastName: "Chen", middleName: null, gender: "male",
      phone: "503-555-1001", email: "john.chen@example.com",
      address: "1420 SW Park Ave, Portland, OR 97201",
    },
    spouse: {
      firstName: "Mei", lastName: "Lin", middleName: null, gender: "female",
      phone: "503-555-1002", email: "mei.lin@example.com",
    },
    swimmers: [
      { firstName: "Jason", lastName: "Chen", middleName: null, gender: "male",
        dob: "2013-05-12", usaSwimmingId: "USA-2024-08123", joinDate: "2024-09-01" },
      { firstName: "Emily", lastName: "Chen", middleName: "Wei", gender: "female",
        dob: "2015-11-03", usaSwimmingId: "USA-2025-01456", joinDate: "2025-01-15" },
    ],
    emergencyContact: { name: "Grandma Li", phone: "503-555-1003" },
    notes: "Jason needs goggles with prescription lenses.",
  },
  {
    email: "sarah.martinez@example.com",
    parent: {
      firstName: "Sarah", lastName: "Martinez", middleName: null, gender: "female",
      phone: "971-555-2001", email: "sarah.martinez@example.com",
      address: "2850 NW Westover Rd, Portland, OR 97210",
    },
    spouse: null,
    swimmers: [
      { firstName: "Sofia", lastName: "Martinez", middleName: "Elena", gender: "female",
        dob: "2012-08-19", usaSwimmingId: "USA-2023-09765", joinDate: "2023-06-01" },
    ],
    emergencyContact: { name: "Carlos Martinez", phone: "971-555-2002" },
    notes: "",
  },
];

// ── Run ───────────────────────────────────────────────────────
let success = 0;
let failed = 0;

for (const [i, fam] of families.entries()) {
  try {
    // 1. Create Auth account (Admin SDK does NOT send verification email)
    const user = await auth.createUser({
      email: fam.email,
      password: PASSWORD,
      displayName: `${fam.parent.firstName} ${fam.parent.lastName}`,
    });
    const uid = user.uid;
    console.log(`[${i + 1}/${families.length}] Auth account: ${fam.email} (uid: ${uid})`);

    // 2. Write users/{uid}
    await db.collection("users").doc(uid).set({
      email: fam.email,
      role: "swimmer",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. Write registrations/{uid}
    await db.collection("registrations").doc(uid).set({
      uid,
      parent: fam.parent,
      spouse: fam.spouse,
      swimmers: fam.swimmers,
      emergencyContact: fam.emergencyContact,
      notes: fam.notes,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const names = fam.swimmers.map(s => s.firstName).join(", ");
    console.log(`     Parent: ${fam.parent.firstName} ${fam.parent.lastName}`);
    console.log(`     Swimmers: ${names}`);
    console.log(`     Registration doc: registrations/${uid}\n`);
    success++;
  } catch (err) {
    console.error(`[${i + 1}/${families.length}]  FAILED: ${fam.email}`);
    console.error(`     ${err.message}\n`);
    failed++;
  }
}

console.log("═══════════════════════════════════════");
console.log(` Done — ${success} succeeded, ${failed} failed`);
console.log("═══════════════════════════════════════");
console.log("\nTo verify: open Firebase Console → Authentication → Users");
console.log("  and Firestore → registrations collection");
process.exit(failed > 0 ? 1 : 0);
