/**
 * Quick seed: create admin + coach user docs via Firebase SDK (emulator)
 * Usage: node scripts/seed-roles.mjs
 */
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, setDoc } from "firebase/firestore";
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

const accounts = [
  { email: "admin@dragonswim.com", password: "admin1234", displayName: "Admin", role: "admin" },
  { email: "coach.thompson@dragonswim.com", password: "coach1234", displayName: "Coach Thompson", role: "coach" },
];

for (const acct of accounts) {
  let uid = null;

  // Try creating first; if already exists, sign in to get the uid
  try {
    const userCred = await createUserWithEmailAndPassword(auth, acct.email, acct.password);
    uid = userCred.user.uid;
    console.log(`Created: ${acct.email} (uid: ${uid})`);
  } catch (e) {
    if (e.code === "auth/email-already-exists" || e.code === "auth/email-already-in-use") {
      try {
        const userCred = await signInWithEmailAndPassword(auth, acct.email, acct.password);
        uid = userCred.user.uid;
        console.log(`Signed in: ${acct.email} (uid: ${uid})`);
      } catch (e2) {
        console.log(`Failed to sign in as ${acct.email}: ${e2.message}`);
        continue;
      }
    } else {
      console.log(`Error creating ${acct.email}: ${e.code || e.message}`);
      continue;
    }
  }

  // Write user doc (for dashboard role detection)
  await setDoc(doc(db, "users", uid), {
    email: acct.email,
    displayName: acct.displayName,
    role: acct.role,
    createdAt: new Date(),
  });
  console.log(`User doc written: users/${uid} (${acct.role})`);

  // Write coach doc (for admin panel "Manage Coaches" list)
  await setDoc(doc(db, "coaches", uid), {
    uid,
    email: acct.email,
    displayName: acct.displayName,
    role: acct.role,
    status: 'active',
    createdBy: 'seed',
    createdAt: new Date(),
  });
  console.log(`Coach doc written: coaches/${uid}`);
}

console.log("\nDone - refresh the browser and try logging in again.");
