/**
 * Fetch-failure classification for the USA Swimming results pipeline.
 *
 * Pure (no DOM, no Firebase, no i18n) so it can be unit-tested and reused by
 * both the dashboard and any Node tooling.
 *
 * ── Why this module exists ──────────────────────────────────────────────────
 *
 * From a browser there are two completely different situations that look
 * IDENTICAL to JavaScript:
 *
 *   1. the host is unreachable / the connection dropped, and
 *   2. the response arrived but carried no `Access-Control-Allow-Origin`
 *      header, so the browser refuses to hand it to JS.
 *
 * In both cases `fetch()` rejects with a bare `TypeError: Failed to fetch`,
 * there is no `.status`, and no HTTP code can be recovered. Case 2 is not
 * hypothetical: on 2026-09-21 two USAS endpoints answered `406` with no CORS
 * headers for every caller, which the dashboard recorded as
 * `{httpStatus: null, message: "Failed to fetch", authError: false}` — looking
 * exactly like a network outage even though the API was the one refusing.
 *
 * So this module never claims to know "the API returned 406". It only records
 * what is actually knowable: *no response could be read*.
 */

/**
 * A failure where no HTTP status was obtainable.
 *
 * True for a dropped connection, a DNS/TLS failure, a 15s timeout, and for a
 * response the browser blocked for missing CORS headers — all indistinguishable
 * from inside the page. False when a status code WAS read (the endpoint is
 * alive and answering, whatever it answered) and false for auth errors, which
 * are already classified separately.
 */
export function isUnreadableResponse(err) {
  if (!err) return false;
  if (err.authError) return false;
  return !Number.isInteger(err.httpStatus);
}

/**
 * The best-times call is the FIRST request made for every swimmer, so a failure
 * here means the athlete never even started.
 */
export function isFirstCallEndpoint(endpoint) {
  return typeof endpoint === 'string' && endpoint.includes('/GetBestTimesForMember/');
}

/**
 * A swimmer that failed on its very first request without any readable
 * response. One of these can be a transient blip; several in a row across
 * different athletes means the rest of the run cannot succeed.
 */
export function isBlockedFirstCall(err) {
  return isUnreadableResponse(err) && isFirstCallEndpoint(err?.endpoint);
}

/**
 * How many swimmers in a row must fail this way before the run is abandoned.
 *
 * Chosen to match `FETCH_POLICY.cooldownAfterConsecutive` (3), the existing
 * "this is not a coincidence" threshold for consecutive failures. Aborting is
 * safe: every completed meet was already written, so a stopped run resumes
 * where it left off.
 */
export const BLOCKED_RUN_ABORT_AFTER = 3;

/**
 * Fold one swimmer outcome into the consecutive-blocked counter.
 *
 * @param {number} current previous count
 * @param {object|null} err the thrown error, or null when the swimmer succeeded
 * @returns {{ count: number, abort: boolean }}
 */
export function nextBlockedRunState(current, err) {
  const count = isBlockedFirstCall(err) ? current + 1 : 0;
  return { count, abort: count >= BLOCKED_RUN_ABORT_AFTER };
}
