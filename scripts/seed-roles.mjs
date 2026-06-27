/**
 * Quick seed: create admin + coach records via Firebase SDK (emulator).
 * Updated for pre-auth coach flow (June 2026).
 *
 * Usage:
 *   node scripts/seed-roles.mjs
 *
 * What this creates:
 *   - Admin: Auth account + users/{uid} doc + coaches/ doc
 *   - Coach: Auth account + users/{uid} doc + coaches/ doc
 *   - Coach whitelist follows new pre-auth pattern (addDoc, not UID-keyed)
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const envRaw = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envRaw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
    val = val.slice(1, -1);
  env[trimmed.slice(0, eqIdx).trim()] = val;
}

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

console.log("Connected to emulators\n");

// ── Helper ───────────────────────────────────────────────────────
async function createOrSignIn(email, password) {
  let uid;
  try {
    uid = (await createUserWithEmailAndPassword(auth, email, password)).user.uid;
    console.log(`  Auth created: ${email}  (uid: ${uid})`);
  } catch (e) {
    if (e.code === "auth/email-already-exists" || e.code === "auth/email-already-in-use") {
      uid = (await signInWithEmailAndPassword(auth, email, password)).user.uid;
      console.log(`  Auth signed in: ${email}  (uid: ${uid})`);
    } else {
      console.log(`  Error: ${email} — ${e.code || e.message}`);
      return null;
    }
  }
  return uid;
}

// ── Step 1: Create admin ─────────────────────────────────────────
console.log("── Admin ──");

// Create admin auth + users doc
const adminUid = await createOrSignIn("admin@dragonswim.com", "admin1234");
await setDoc(doc(db, "users", adminUid), {
  email: "admin@dragonswim.com",
  displayName: "Admin",
  role: "admin",
  createdAt: new Date(),
});
console.log(`  users/${adminUid} written`);

// Admin creates own coaches doc (already signed in as admin)
const adminCoachRef = await addDoc(collection(db, "coaches"), {
  email: "admin@dragonswim.com",
  displayName: "Admin",
  role: "admin",
  status: "active",
  registeredUid: adminUid,
  createdBy: "seed",
  createdAt: new Date(),
});
console.log(`  coaches/${adminCoachRef.id} written`);

// ── Step 2: Create coach ─────────────────────────────────────────
console.log("\n── Coach Thompson ──");

// Create coach auth + users doc (coach creates their own user profile)
const coachUid = await createOrSignIn("coach.thompson@dragonswim.com", "coach1234");
if (!coachUid) {
  console.log("  Skipped — could not create coach");
} else {
  await setDoc(doc(db, "users", coachUid), {
    email: "coach.thompson@dragonswim.com",
    displayName: "Coach Thompson",
    role: "coach",
    createdAt: new Date(),
  });
  console.log(`  users/${coachUid} written`);

  // Switch back to admin to create the coach whitelist entry
  await signInWithEmailAndPassword(auth, "admin@dragonswim.com", "admin1234");

  const coachRef = await addDoc(collection(db, "coaches"), {
    email: "coach.thompson@dragonswim.com",
    displayName: "Coach Thompson",
    role: "coach",
    status: "active",
    registeredUid: coachUid,
    createdBy: "seed",
    createdAt: new Date(),
  });
  console.log(`  coaches/${coachRef.id} written (status: active)`);
}

console.log("\nDone — refresh the browser and try logging in again.");
console.log("\nAccounts:");
console.log("  admin@dragonswim.com          / admin1234");
console.log("  coach.thompson@dragonswim.com / coach1234");

console.log("Done — refresh the browser and try logging in again.");
console.log("\nAccounts:");
console.log("  admin@dragonswim.com          / admin1234");
console.log("  coach.thompson@dragonswim.com / coach1234");
