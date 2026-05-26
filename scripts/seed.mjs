/**
 * Seed script — creates 2 family accounts with full registration data
 * in the local Firebase emulators.
 *
 * Usage:
 *   node scripts/seed.mjs
 *
 * Prerequisites:
 *   - Firebase emulators running (firebase emulators:start)
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
} from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Read .env.local ──────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const envRaw = readFileSync(envPath, "utf-8");

const env = {};
for (const line of envRaw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  env[key] = val;
}

// ── Init Firebase + connect emulators ────────────────────────────
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);

console.log(" Connected to local emulators\n");

// ── Seed data ────────────────────────────────────────────────────
const PASSWORD = "test1234";

const families = [
  {
    email: "john.chen@example.com",
    password: PASSWORD,
    parent: {
      firstName: "John",
      lastName: "Chen",
      middleName: null,
      gender: "male",
      phone: "503-555-1001",
      email: "john.chen@example.com",
      address: "1420 SW Park Ave, Portland, OR 97201",
    },
    spouse: {
      firstName: "Mei",
      lastName: "Lin",
      middleName: null,
      gender: "female",
      phone: "503-555-1002",
      email: "mei.lin@example.com",
    },
    swimmers: [
      {
        firstName: "Jason",
        lastName: "Chen",
        middleName: null,
        gender: "male",
        dob: "2013-05-12",
        usaSwimmingId: "USA-2024-08123",
        joinDate: "2024-09-01",
      },
      {
        firstName: "Emily",
        lastName: "Chen",
        middleName: "Wei",
        gender: "female",
        dob: "2015-11-03",
        usaSwimmingId: "USA-2025-01456",
        joinDate: "2025-01-15",
      },
    ],
    emergencyContact: {
      name: "Grandma Li",
      phone: "503-555-1003",
    },
    notes: "Jason needs goggles with prescription lenses.",
  },
  {
    email: "sarah.martinez@example.com",
    password: PASSWORD,
    parent: {
      firstName: "Sarah",
      lastName: "Martinez",
      middleName: null,
      gender: "female",
      phone: "971-555-2001",
      email: "sarah.martinez@example.com",
      address: "2850 NW Westover Rd, Portland, OR 97210",
    },
    spouse: null,
    swimmers: [
      {
        firstName: "Sofia",
        lastName: "Martinez",
        middleName: "Elena",
        gender: "female",
        dob: "2012-08-19",
        usaSwimmingId: "USA-2023-09765",
        joinDate: "2023-06-01",
      },
    ],
    emergencyContact: {
      name: "Carlos Martinez",
      phone: "971-555-2002",
    },
    notes: "",
  },
];

// ── Run ──────────────────────────────────────────────────────────
for (const [i, fam] of families.entries()) {
  // 1. Create Auth account
  const userCred = await createUserWithEmailAndPassword(auth, fam.email, fam.password);
  const uid = userCred.user.uid;
  console.log(`[${i + 1}/2] Auth account: ${fam.email}`);

  // 2. Write users/{uid}
  await setDoc(doc(db, "users", uid), {
    email: fam.email,
    role: "swimmer",
    createdAt: new Date(),
  });

  // 3. Write registrations doc
  await setDoc(doc(db, "registrations", uid), {
    uid,
    parent: fam.parent,
    spouse: fam.spouse,
    swimmers: fam.swimmers,
    emergencyContact: fam.emergencyContact,
    notes: fam.notes,
    createdAt: new Date(),
  });

  const names = fam.swimmers.map(s => s.firstName).join(", ");
  console.log(`     Parent: ${fam.parent.firstName} ${fam.parent.lastName}`);
  console.log(`     Swimmers: ${names}`);
  console.log(`     Registration doc: registrations/${uid}\n`);
}

console.log("═══════════════════════════════════════");
console.log(" Seed complete — 2 families ready");
console.log("═══════════════════════════════════════\n");
console.log("Login credentials (both accounts):");
for (const fam of families) {
  console.log(`  ${fam.email} / ${PASSWORD}`);
}
console.log("\nEmulator UI: http://127.0.0.1:4000");
