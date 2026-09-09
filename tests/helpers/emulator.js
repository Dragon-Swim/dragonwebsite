/**
 * Emulator helpers for the local Playwright suite.
 *
 * `npm test` wraps `playwright test` in `firebase emulators:exec`, so the Auth
 * and Firestore emulators are already up when these helpers run. Seeding goes
 * through the emulator's REST API (an admin interface that bypasses security
 * rules), because the `families` whitelist is admin-writable only.
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
    headers: { "Content-Type": "application/json" },
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
