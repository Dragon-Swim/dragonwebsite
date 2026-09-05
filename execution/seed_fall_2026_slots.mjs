/**
 * Seed Fall 2026 practice slots (sessionSlots collection).
 *
 * Uses Firebase Admin SDK (server-side, bypasses security rules) to write
 * the 14 weekly session slots derived from the public homepage template.
 * Idempotent: an existing slot matching (period, location, day, startTime,
 * endTime) is skipped.
 *
 * Usage:
 *   1. Ensure serviceAccountKey.json exists in the project root
 *   2. node execution/seed_fall_2026_slots.mjs
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { FALL_2026_SLOT_TEMPLATES } from "../src/data/seasonSchedule.data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, "..", "serviceAccountKey.json");

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
} catch (err) {
  console.error(" Could not read serviceAccountKey.json");
  console.error("  Download it from Firebase Console -> Project Settings -> Service Accounts");
  console.error("  Then save as: " + keyPath);
  process.exit(1);
}

const app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = app.firestore();
console.log(" Connected to project: " + serviceAccount.project_id + "\n");

const col = db.collection("sessionSlots");
let created = 0;
let skipped = 0;

for (const tpl of FALL_2026_SLOT_TEMPLATES) {
  const existing = await col
    .where("period", "==", tpl.period)
    .where("location", "==", tpl.location)
    .where("day", "==", tpl.day)
    .where("startTime", "==", tpl.startTime)
    .where("endTime", "==", tpl.endTime)
    .limit(1)
    .get();

  if (!existing.empty) {
    skipped++;
    console.log(" skip  : " + tpl.day + " " + tpl.startTime + " @ " + tpl.location);
    continue;
  }

  await col.add({
    ...tpl,
    capacity: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  created++;
  console.log(" added : " + tpl.day + " " + tpl.startTime + " @ " + tpl.location);
}

console.log("");
console.log("Done. created=" + created + ", skipped=" + skipped + ", template=" + FALL_2026_SLOT_TEMPLATES.length);
process.exit(0);
