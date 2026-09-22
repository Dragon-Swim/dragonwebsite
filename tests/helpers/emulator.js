/**
 * Emulator helpers for the local Playwright suite.
 *
 * `npm test` wraps `playwright test` in `firebase emulators:exec`, so the Auth
 * and Firestore emulators are already up when these helpers run. Seeding goes
 * through the emulator's REST API, because the `families` whitelist is
 * admin-writable only (firestore.rules L130: `allow create, delete: if isAdmin()`).
 *
 * The REST API still enforces security rules, so every write must carry the
 * emulator's admin credential `Authorization: Bearer owner` — without it the
 * create is denied with `false for 'create' @ L130`.
 *
 * The project ID must match the one the app uses in emulator mode — see
 * USE_EMULATOR in src/utils/firebase.js and the npm "test" script.
 */

const PROJECT_ID = "demo-dragon-swim";
const FIRESTORE_REST = "http://127.0.0.1:8080/v1";
const AUTH_EMULATOR = "http://127.0.0.1:9099";

const documentsUrl = (collection) =>
  `${FIRESTORE_REST}/projects/${PROJECT_ID}/databases/(default)/documents/${collection}`;

/**
 * Fail fast with an actionable message when the emulators are not running.
 * Without this, a misconfigured run would silently exercise the real project.
 */
export async function assertEmulatorReady() {
  const targets = [
    ["Firestore", `${FIRESTORE_REST}/projects/${PROJECT_ID}/databases/(default)/documents/families`],
    ["Auth", `${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/config`],
  ];

  for (const [name, url] of targets) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      throw new Error(
        `The ${name} emulator is not reachable at ${url} (${err.message}).\n` +
        `Run the suite with \`npm test\` — it starts the emulators and points the ` +
        `dev server at them. A bare \`npx playwright test\` would hit the real project.`
      );
    }
  }
}

/**
 * Authorize one family email so signup is allowed.
 * Mirrors the document shape the admin panel writes (src/pages/admin.js):
 * signup later updates status + registeredUid, and the security rules require
 * `parentName` and `createdBy` to stay unchanged for that update to be allowed.
 */
export async function seedFamily(email, parentName = "Playwright Test Parent") {
  const res = await fetch(documentsUrl("families"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Emulator-only admin credential: bypasses security rules. Has no effect
      // outside the emulator, and the emulator rejects every other token.
      Authorization: "Bearer owner",
    },
    body: JSON.stringify({
      fields: {
        email: { stringValue: email },
        parentName: { stringValue: parentName },
        status: { stringValue: "pending" },
        registeredUid: { nullValue: null },
        createdBy: { stringValue: "playwright-seed" },
        createdAt: { timestampValue: new Date().toISOString() },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`seedFamily(${email}) failed: HTTP ${res.status} ${await res.text()}`);
  }
}

// ── Generic document helpers ────────────────────────────────────────────────
//
// The app's writes must go through the UI (that is what the tests are for), but
// FIXTURES (meets, registrations, a pre-existing volunteer record) are cheapest to
// plant directly through the emulator's REST API with the owner credential.

/** Encode one JS value as a Firestore REST `Value`. */
function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "object") {
    const fields = {};
    for (const [key, val] of Object.entries(value)) fields[key] = toFirestoreValue(val);
    return { mapValue: { fields } };
  }
  throw new Error(`encodeFields: cannot encode a ${typeof value} for Firestore REST`);
}

/** Encode a plain object as Firestore REST `fields`. */
export function encodeFields(data) {
  const fields = {};
  for (const [key, value] of Object.entries(data)) fields[key] = toFirestoreValue(value);
  return fields;
}

/** Decode one Firestore REST `Value` back into a JS value. */
function fromFirestoreValue(value) {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return new Date(value.timestampValue);
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in value) return decodeFields(value.mapValue.fields);
  return undefined;
}

/** Decode Firestore REST `fields` into a plain object. */
export function decodeFields(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields || {})) out[key] = fromFirestoreValue(value);
  return out;
}

/**
 * Create or overwrite a document by id (PATCH = create-or-replace).
 * @returns {Promise<string>} the document id
 */
export async function seedDocument(collection, id, data) {
  const res = await fetch(`${documentsUrl(collection)}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer owner", // emulator-only admin credential
    },
    body: JSON.stringify({ fields: encodeFields(data) }),
  });

  if (!res.ok) {
    throw new Error(`seedDocument(${collection}/${id}) failed: HTTP ${res.status} ${await res.text()}`);
  }
  return id;
}

/** Read a document, or null when it does not exist. */
export async function readDocument(collection, id) {
  const res = await fetch(`${documentsUrl(collection)}/${id}`, {
    headers: { Authorization: "Bearer owner" },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`readDocument(${collection}/${id}) failed: HTTP ${res.status} ${await res.text()}`);
  }
  return decodeFields((await res.json()).fields);
}

/** Delete a document; a missing document is not an error. */
export async function deleteDocument(collection, id) {
  const res = await fetch(`${documentsUrl(collection)}/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer owner" },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`deleteDocument(${collection}/${id}) failed: HTTP ${res.status}`);
  }
}

// ── Accounts ────────────────────────────────────────────────────────────────

/**
 * Create an email/password account in the Auth emulator.
 * @returns {Promise<string>} the new uid
 */
export async function seedAuthUser(email, password) {
  const res = await fetch(`${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`seedAuthUser(${email}) failed: HTTP ${res.status} ${JSON.stringify(body)}`);
  }
  return body.localId;
}

/**
 * Create a signed-in-able STAFF account: the Auth user plus the `users/{uid}`
 * document that carries the role. dashboard.js reads that role (and the
 * firestore rules authorize writes from it), so both halves are required.
 *
 * Note: this does NOT go through the coaches whitelist. Sign-in only consults
 * `users/{uid}.role` (src/pages/signin.js), so a whitelist entry is unnecessary
 * for these fixtures.
 *
 * @param {'coach'|'admin'} role
 * @returns {Promise<string>} the new uid
 */
export async function seedStaffUser(email, password, role = "coach") {
  const uid = await seedAuthUser(email, password);
  await seedDocument("users", uid, { email, role, createdAt: new Date() });
  return uid;
}
