/**
 * Free the Firebase emulator ports before a test run.
 *
 * On Windows the Firestore emulator's Java child can survive the SIGINT that
 * `firebase emulators:exec` sends on exit, which makes the *next* run fail with
 * "Could not start Firestore Emulator, port taken". This runs as npm's `pretest`
 * hook so `npm test` is repeatable.
 *
 * The Vite dev server port (5173) is deliberately left alone: if something is
 * already listening there, Playwright should fail loudly rather than silently
 * reuse a server that was started without the emulator flag.
 */

import { execSync } from "node:child_process";

const EMULATOR_PORTS = [8080, 9099, 4400, 9150];
const isWindows = process.platform === "win32";

function pidsListeningOn(port) {
  try {
    if (isWindows) {
      const out = execSync(
        `netstat -ano -p tcp | findstr LISTENING | findstr :${port}`,
        { encoding: "utf8" }
      );
      return [
        ...new Set(
          out
            .split("\n")
            .map((line) => line.trim().split(/\s+/).pop())
            .filter((pid) => /^\d+$/.test(pid))
        ),
      ];
    }
    return execSync(`lsof -ti:${port}`, { encoding: "utf8" })
      .split("\n")
      .map((pid) => pid.trim())
      .filter(Boolean);
  } catch {
    // findstr / lsof exit non-zero when nothing matches.
    return [];
  }
}

let freed = 0;
for (const port of EMULATOR_PORTS) {
  for (const pid of pidsListeningOn(port)) {
    if (Number(pid) === process.pid) continue;
    try {
      execSync(isWindows ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`, {
        stdio: "ignore",
      });
      console.log(`[pretest] freed port ${port} (killed pid ${pid})`);
      freed += 1;
    } catch {
      // Already gone, or not ours to kill — the emulator will report it.
    }
  }
}

if (freed === 0) console.log("[pretest] emulator ports already free");
