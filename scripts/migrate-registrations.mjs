/**
 * Data migration script — add parentEmails + editors to existing registrations.
 *
 * Reads all registrations from PRODUCTION Firestore, adds missing fields:
 *   - parentEmails: [parent.email, spouse.email] (spouse only if present)
 *   - editors: [uid] (the registration owner)
 *
 * Uses the admin account (client SDK) — requires updated firestore.rules to
 * already be deployed (admin must be able to update any registration).
 *
 * Usage:
 *   node scripts/migrate-registrations.mjs           # dry-run (show what would change)
 *   node scripts/migrate-registrations.mjs --apply    # actually update
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
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
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
    val = val.slice(1, -1);
  env[trimmed.slice(0, eqIdx).trim()] = val;
}

const DRY_RUN = !process.argv.includes("--apply");
if (DRY_RUN) {
  console.log("🔍 DRY RUN — no changes will be made.\n  Run with --apply to actually update.\n");
} else {
  console.log("⚠️  APPLY mode — will write changes to production!\n");
}

// ── Init Firebase (PRODUCTION — no emulator) ─────────────────────
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

// ── Sign in as admin ─────────────────────────────────────────────
console.log("Signing in as admin@dragonswim.com ...");
try {
  await signInWithEmailAndPassword(auth, "admin@dragonswim.com", "admin1234");
  console.log("Signed in.\n");
} catch (e) {
  console.error("Failed to sign in as admin:", e.message);
  process.exit(1);
}

// ── Read all registrations ───────────────────────────────────────
console.log("Reading registrations...");
const snapshot = await getDocs(collection(db, "registrations"));
console.log(`Found ${snapshot.docs.length} registration(s).\n`);

let needsUpdate = 0;
let skipped = 0;
let errors = 0;

for (const docSnap of snapshot.docs) {
  const data = docSnap.data();
  const docId = docSnap.id;
  const needs = [];

  // Check parentEmails
  if (!data.parentEmails || !Array.isArray(data.parentEmails)) {
    const emails = [];
    if (data.parent?.email) emails.push(data.parent.email.toLowerCase().trim());
    if (data.spouse?.email) emails.push(data.spouse.email.toLowerCase().trim());
    if (emails.length > 0) {
      needs.push(`parentEmails: [${emails.join(", ")}]`);
      data._new_parentEmails = emails;
    } else {
      console.log(`  ⚠️  ${docId}: no parent email found, skipping`);
      skipped++;
      continue;
    }
  }

  // Check editors
  if (!data.editors || !Array.isArray(data.editors)) {
    const editors = data.uid ? [data.uid] : [];
    if (editors.length > 0) {
      needs.push(`editors: [${editors[0]}]`);
      data._new_editors = editors;
    } else {
      console.log(`  ⚠️  ${docId}: no uid found, skipping`);
      skipped++;
      continue;
    }
  }

  if (needs.length === 0) {
    continue; // nothing to do
  }

  needsUpdate++;
  const parentName = `${data.parent?.firstName || "?"} ${data.parent?.lastName || ""}`;
  console.log(`  ${docId} (${parentName}):`);
  for (const n of needs) {
    console.log(`    + ${n}`);
  }

  if (!DRY_RUN) {
    const updateFields = {};
    if (data._new_parentEmails) updateFields.parentEmails = data._new_parentEmails;
    if (data._new_editors) updateFields.editors = data._new_editors;

    try {
      await updateDoc(doc(db, "registrations", docId), updateFields);
      console.log("    ✅ updated");
    } catch (e) {
      console.log(`    ❌ error: ${e.message}`);
      errors++;
    }
  }
}

console.log(`\n─── Summary ───`);
console.log(`  Needs update: ${needsUpdate}`);
console.log(`  Skipped:      ${skipped}`);
if (errors > 0) console.log(`  Errors:       ${errors}`);
console.log(`  OK:           ${snapshot.docs.length - needsUpdate - skipped - errors}`);

if (DRY_RUN && needsUpdate > 0) {
  console.log(`\nRun with --apply to apply these changes.`);
}
