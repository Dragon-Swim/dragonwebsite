/**
 * Minimal .env.local loader for Node maintenance scripts.
 *
 * Why not dotenv: no extra dependency, and the project already parses .env.local
 * inline in several scripts. This centralises it so credentials live in exactly
 * one gitignored place.
 *
 * Values are safe to keep here because Vite only inlines VITE_-prefixed vars into
 * the browser bundle — these names have no prefix, so they never reach the client.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Parses .env.local into a plain object. Returns {} when the file is missing. */
export function loadEnvLocal() {
  const env = {};
  let raw;
  try {
    raw = readFileSync(resolve(PROJECT_ROOT, '.env.local'), 'utf8');
  } catch {
    return env;
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

/** Reads a required value from the environment, then .env.local. Exits if absent. */
export function requireEnv(name) {
  const value = process.env[name] || loadEnvLocal()[name];
  if (!value) {
    console.error(`❌ Missing ${name}.`);
    console.error(`   Add it to .env.local (gitignored) — never hardcode credentials in scripts.`);
    process.exit(1);
  }
  return value;
}

/** Reads an optional value from the environment, then .env.local. */
export function optionalEnv(name, fallback = '') {
  return process.env[name] || loadEnvLocal()[name] || fallback;
}
