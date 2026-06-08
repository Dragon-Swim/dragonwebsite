/**
 * Sync pending coach records — local emulator variant.
 *
 * Uses Firebase client SDK connected to local emulators.
 * Reads pending coaches from Firestore, creates Auth accounts, and
 * marks records as active.
 *
 * Usage:
 *   node scripts/create-coaches-local.mjs
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
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
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
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  env[key] = val;
}

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);

console.log(" Connected to local emulators\n");

const q = query(collection(db, "coaches"), where("status", "==", "pending"));
const snapshot = await getDocs(q);

if (snapshot.empty) {
  console.log(" No pending coach records found.");
  process.exit(0);
}

console.log(` Found ${snapshot.size} pending coach record(s).\n`);

let success = 0;
let failed = 0;

for (const docSnap of snapshot.docs) {
  const data = docSnap.data();
  const { email, displayName, password } = data;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    await setDoc(doc(db, "users", uid), {
      email,
      role: "coach",
      displayName: displayName || null,
      createdAt: new Date(),
    });

    await updateDoc(doc(db, "coaches", docSnap.id), {
      status: "active",
      uid,
      processedAt: new Date(),
    });

    console.log(`  [OK] ${email} → uid: ${uid} (${displayName || '—'})`);
    success++;
  } catch (err) {
    console.error(`  [FAIL] ${email}: ${err.message}`);
    await updateDoc(doc(db, "coaches", docSnap.id), { status: "error", error: err.message }).catch(() => {});
    failed++;
  }
}

console.log(`\n Done — ${success} created, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
