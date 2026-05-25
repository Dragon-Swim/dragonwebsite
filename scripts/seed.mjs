/**
 * Seed script — populates local Firebase emulators with 10 fake swim team members.
 *
 * Usage:
 *   node scripts/seed.mjs
 *
 * Prerequisites:
 *   - Firebase emulators running (firebase emulators:start)
 *   - npm install (firebase + @faker-js/faker already in project)
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
} from "firebase/firestore";
import { faker } from "@faker-js/faker";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Read .env.local ──────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const envRaw = readFileSync(envPath, "utf-8");

/** @type {Record<string, string>} */
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

console.log(" Connected to local emulators (Auth :9099, Firestore :8080)");

// ── Generate swimmers ────────────────────────────────────────────
const STROKES = ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "Individual Medley"];
const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced", "competitive"];
const GROUPS = ["Junior Dolphins", "Development", "Senior Squad", "Elite"];

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeSwimmer() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const age = faker.number.int({ min: 7, max: 18 });
  const experience = randomPick(EXPERIENCE_LEVELS);

  let group;
  if (age <= 9) group = GROUPS[0];       // Junior Dolphins
  else if (age <= 12) group = GROUPS[1]; // Development
  else if (experience === "competitive") group = GROUPS[3]; // Elite
  else group = GROUPS[2];                // Senior Squad

  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const phone = faker.phone.number();

  return {
    name: `${firstName} ${lastName}`,
    age,
    gender: faker.person.sex(),
    email,
    phone,
    stroke: randomPick(STROKES),
    secondaryStroke: randomPick(STROKES.filter(s => s !== randomPick(STROKES))), // won't be 100% accurate but good enough
    experience,
    group,
    emergencyContact: {
      name: faker.person.fullName(),
      phone: faker.phone.number(),
    },
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }) ?? "",
    joinedAt: faker.date.between({ from: "2024-01-01", to: "2026-05-01" }),
    status: "active",
  };
}

const swimmers = Array.from({ length: 10 }, makeSwimmer);

// ── Write to Firestore & Auth ────────────────────────────────────
const TEST_PASSWORD = "test1234";
const results = [];

for (const [i, swimmer] of swimmers.entries()) {
  // Firestore — members collection
  const docRef = await addDoc(collection(db, "members"), swimmer);
  console.log(`  [${i + 1}/10] Firestore member: ${swimmer.name} (${docRef.id})`);

  // Auth — create account
  try {
    const userCred = await createUserWithEmailAndPassword(auth, swimmer.email, TEST_PASSWORD);
    await updateProfile(userCred.user, { displayName: swimmer.name });
    console.log(`          Auth account: ${swimmer.email} / ${TEST_PASSWORD}`);
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      console.log(`          Auth account: (already exists) ${swimmer.email}`);
    } else {
      console.error(`          Auth FAILED for ${swimmer.email}: ${err.message}`);
    }
  }

  results.push({ name: swimmer.name, email: swimmer.email, docId: docRef.id });
}

// ── Summary ──────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════════");
console.log(" Seed complete — 10 swimmers written to Firestore emulator");
console.log("══════════════════════════════════════════════════════\n");
console.log("Swimmer / Email / Password:");
for (const r of results) {
  console.log(`  ${r.name}`);
  console.log(`    Email:    ${r.email}`);
  console.log(`    Password: ${TEST_PASSWORD}`);
  console.log(`    Doc ID:   ${r.docId}\n`);
}
console.log("Emulator UI: http://127.0.0.1:4000");
