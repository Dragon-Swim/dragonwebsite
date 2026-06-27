/**
 * Seed script — creates 2 family accounts with full registration data
 * in the local Firebase emulators. Updated for spouse-sharing + pre-auth.
 *
 * Usage:
 *   node scripts/seed.mjs
 *
 * Prerequisites:
 *   - Firebase emulators running (firebase emulators:start)
 *
 * What this creates:
 *   - families/ whitelist entries (required for signup flow)
 *   - Auth accounts for primary parents + spouses
 *   - users/{uid} role docs
 *   - registrations/{uid} with parentEmails + editors (spouse sharing)
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
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

console.log("Connected to local emulators\n");

// ── Helpers ──────────────────────────────────────────────────────

async function createOrSignIn(email, password) {
  let uid;
  try {
    uid = (await createUserWithEmailAndPassword(auth, email, password)).user.uid;
    console.log(`  Auth created: ${email}  →  ${uid}`);
  } catch (e) {
    if (e.code === "auth/email-already-in-use" || e.code === "auth/email-already-exists") {
      uid = (await signInWithEmailAndPassword(auth, email, password)).user.uid;
      console.log(`  Auth signed in: ${email}  →  ${uid}`);
    } else {
      throw e;
    }
  }
  return uid;
}

// ── Bootstrap: ensure admin exists ───────────────────────────────
const adminUid = await createOrSignIn("admin@dragonswim.com", "admin1234");
await setDoc(doc(db, "users", adminUid), {
  email: "admin@dragonswim.com",
  displayName: "Admin",
  role: "admin",
  createdAt: new Date(),
});
console.log(`Admin ready: ${adminUid}\n`);

// ── Seed data ────────────────────────────────────────────────────
const PASSWORD = "test1234";

const families = [
  {
    // ── Chen Family (with spouse) ──
    primaryEmail: "john.chen@example.com",
    spouseEmail: "mei.lin@example.com",
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
      { firstName: "Jason", lastName: "Chen", middleName: null, gender: "male", dob: "2013-05-12", usaSwimmingId: "USA-2024-08123", joinDate: "2024-09-01" },
      { firstName: "Emily", lastName: "Chen", middleName: "Wei", gender: "female", dob: "2015-11-03", usaSwimmingId: "USA-2025-01456", joinDate: "2025-01-15" },
    ],
    emergencyContact: { name: "Grandma Li", phone: "503-555-1003" },
    notes: "Jason needs goggles with prescription lenses.",
  },
  {
    // ── Martinez Family (single parent) ──
    primaryEmail: "sarah.martinez@example.com",
    spouseEmail: null,
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
      { firstName: "Sofia", lastName: "Martinez", middleName: "Elena", gender: "female", dob: "2012-08-19", usaSwimmingId: "USA-2023-09765", joinDate: "2023-06-01" },
    ],
    emergencyContact: { name: "Carlos Martinez", phone: "971-555-2002" },
    notes: "",
  },
];

// ── Run ──────────────────────────────────────────────────────────
for (const [i, fam] of families.entries()) {
  const label = fam.parent.lastName;
  console.log(`── [${i + 1}/2] ${label} Family ──`);

  // 1. Add families/ whitelist entries (as admin)
  const parentEmails = [fam.primaryEmail.toLowerCase().trim()];
  if (fam.spouseEmail) parentEmails.push(fam.spouseEmail.toLowerCase().trim());

  for (const email of parentEmails) {
    const isPrimary = email === fam.primaryEmail.toLowerCase().trim();
    const displayName = isPrimary
      ? `${fam.parent.firstName} ${fam.parent.lastName}`
      : `${fam.spouse.firstName} ${fam.spouse.lastName}`;
    const famRef = await addDoc(collection(db, "families"), {
      email,
      parentName: displayName,
      status: "pending",
      registeredUid: null,
      createdBy: adminUid,
      createdAt: new Date(),
    });
    console.log(`  Whitelist: ${email}  →  ${famRef.id}`);
  }

  // 2. Create Auth + users doc for primary parent
  const primaryUid = await createOrSignIn(fam.primaryEmail, PASSWORD);
  await setDoc(doc(db, "users", primaryUid), {
    email: fam.primaryEmail,
    role: "swimmer",
    createdAt: new Date(),
  });

  // 3. Create Auth + users doc for spouse (if applicable)
  let spouseUid = null;
  if (fam.spouseEmail) {
    spouseUid = await createOrSignIn(fam.spouseEmail, PASSWORD);
    await setDoc(doc(db, "users", spouseUid), {
      email: fam.spouseEmail,
      role: "swimmer",
      createdAt: new Date(),
    });
  }

  // 4. Sign back in as PRIMARY parent to write registration doc
  //    (registrations create rule: request.auth.uid == uid)
  await signInWithEmailAndPassword(auth, fam.primaryEmail, PASSWORD);

  const editors = [primaryUid];
  if (spouseUid) editors.push(spouseUid);

  await setDoc(doc(db, "registrations", primaryUid), {
    uid: primaryUid,
    parent: fam.parent,
    spouse: fam.spouse,
    swimmers: fam.swimmers,
    emergencyContact: fam.emergencyContact,
    notes: fam.notes || null,
    parentEmails,
    editors,
    createdAt: new Date(),
  });
  console.log(`  Registration: registrations/${primaryUid}`);
  console.log(`  parentEmails: [${parentEmails.join(", ")}]`);
  console.log(`  editors: ${editors.length} user(s) — ${editors.join(", ")}`);
  console.log();

  // 5. Sign back in as admin to update whitelist statuses
  await signInWithEmailAndPassword(auth, "admin@dragonswim.com", "admin1234");
  for (const email of parentEmails) {
    const snap = await getDocs(query(collection(db, "families"), where("email", "==", email)));
    for (const d of snap.docs) {
      if (d.data().status === "pending") {
        const targetUid = email === fam.primaryEmail.toLowerCase().trim() ? primaryUid : spouseUid;
        await updateDoc(doc(db, "families", d.id), {
          status: "registered",
          registeredUid: targetUid,
        });
      }
    }
  }
}

console.log("═══════════════════════════════════════");
console.log(" Seed complete — 2 families ready");
console.log("═══════════════════════════════════════\n");
console.log("Login credentials:");
console.log("  john.chen@example.com      / test1234   (2 swimmers, spouse: mei.lin@example.com)");
console.log("  mei.lin@example.com        / test1234   (spouse — shares Chen family)");
console.log("  sarah.martinez@example.com / test1234   (1 swimmer, single parent)");
console.log("\nEmulator UI: http://127.0.0.1:4000");
