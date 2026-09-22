// Unit checks for src/utils/fetchHealth.js — the fetch failure classification
// behind the dashboard's "stop the run early" behaviour. Pure logic: no network,
// no Firestore, no DOM.
//
// Part of `npm run test:unit` (tests/unit/run-all.mjs). Deliberately NOT named
// *.spec.js / *.test.js so Playwright's testMatch cannot collect it.
import {
  isUnreadableResponse, isFirstCallEndpoint, isBlockedFirstCall,
  nextBlockedRunState, BLOCKED_RUN_ABORT_AFTER,
} from '../../src/utils/fetchHealth.js';

let pass = 0;
let fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail !== undefined ? ` -> ${JSON.stringify(detail)}` : ''}`); }
};

// Shapes as they actually leave tryFetchOnce() in dashboard.js
const netErr = (endpoint) => Object.assign(new Error('Failed to fetch'), { endpoint, retryable: true, name: 'TypeError' });
const timeoutErr = (endpoint) => Object.assign(new Error('Timeout (15s)'), { endpoint, retryable: true });
const httpErr = (endpoint, status) => Object.assign(new Error(`HTTP ${status}: `), {
  endpoint, httpStatus: status, retryable: [406, 429, 500, 502, 503, 504].includes(status), authError: status === 401 || status === 403,
});

const BEST = 'https://times-api.usaswimming.org/swims/TimesSearch/GetBestTimesForMember/70A3D156C11548';
const MEETS = 'https://times-api.usaswimming.org/swims/TimesSearch/GetSwimmerMeets/70A3D156C11548';
const TIMES = 'https://times-api.usaswimming.org/swims/TimesSearch/GetSwimmerMeetTimes/70A3D156C11548/283165';
const BASE = 'https://times-api.usaswimming.org/swims/TimesSearch';

console.log('1. isUnreadableResponse — no status code obtainable');
check('network error (no httpStatus)', isUnreadableResponse(netErr(BEST)));
check('15s timeout (no httpStatus)', isUnreadableResponse(timeoutErr(BEST)));
check('HTTP 500 IS readable -> false', !isUnreadableResponse(httpErr(BEST, 500)));
check('HTTP 406 IS readable -> false', !isUnreadableResponse(httpErr(BEST, 406)));
check('HTTP 429 IS readable -> false', !isUnreadableResponse(httpErr(BEST, 429)));
check('auth error excluded', !isUnreadableResponse(httpErr(BEST, 401)));
check('null error', !isUnreadableResponse(null));
check('undefined error', !isUnreadableResponse(undefined));

console.log('2. isFirstCallEndpoint');
check('best-times endpoint', isFirstCallEndpoint(BEST));
check('meets endpoint is NOT the first call', !isFirstCallEndpoint(MEETS));
check('meet-times endpoint is NOT the first call', !isFirstCallEndpoint(TIMES));
check('null endpoint', !isFirstCallEndpoint(null));

console.log('3. isBlockedFirstCall — the signature of a doomed run');
check('best-times + no readable response', isBlockedFirstCall(netErr(BEST)));
check('best-times + timeout', isBlockedFirstCall(timeoutErr(BEST)));
check('best-times + HTTP 500 (endpoint alive) -> NOT blocked', !isBlockedFirstCall(httpErr(BEST, 500)));
// important: a READABLE 406 is a different situation entirely - the retry logic
// already handles it, and it must not be counted as an unreachable API.
check('best-times + readable HTTP 406 -> NOT blocked', !isBlockedFirstCall(httpErr(BEST, 406)));
check('best-times + auth error -> NOT blocked (has its own path)', !isBlockedFirstCall(httpErr(BEST, 401)));
check('meets failure -> NOT blocked (athlete already started)', !isBlockedFirstCall(netErr(MEETS)));
check('mid-run meet failure -> NOT blocked', !isBlockedFirstCall(netErr(TIMES)));

console.log('4. nextBlockedRunState — counter and threshold');
check('threshold is 3', BLOCKED_RUN_ABORT_AFTER === 3, BLOCKED_RUN_ABORT_AFTER);
let s = { count: 0, abort: false };
s = nextBlockedRunState(s.count, netErr(BEST)); check('1st blocked -> count 1, no abort', s.count === 1 && !s.abort, s);
s = nextBlockedRunState(s.count, netErr(BEST)); check('2nd blocked -> count 2, no abort', s.count === 2 && !s.abort, s);
s = nextBlockedRunState(s.count, netErr(BEST)); check('3rd blocked -> ABORT', s.count === 3 && s.abort === true, s);
check('a success resets the counter', nextBlockedRunState(3, null).count === 0);
check('a non-blocking failure resets the counter', nextBlockedRunState(2, httpErr(BEST, 500)).count === 0);
check('a mid-run failure resets the counter', nextBlockedRunState(2, netErr(TIMES)).count === 0);

console.log('5. production reproduction — the 2026-09-21 run');
// The exact object the dashboard persisted for Daniel Guo at 14:59:14Z.
const productionRecord = {
  httpStatus: null,
  message: 'Failed to fetch',
  retryable: true,
  authError: false,
  endpoint: 'https://times-api.usaswimming.org/swims/TimesSearch/GetBestTimesForMember/70A3D156C11548',
  at: '2026-09-21T14:59:14.925Z',
};
const asThrown = { ...productionRecord, name: 'TypeError' };
check('the recorded failure classifies as a blocked first call', isBlockedFirstCall(asThrown), productionRecord);
check('it is recorded as an unreadable response', isUnreadableResponse(asThrown));

// Replay the real run: 5 athletes, each failing the same way at ~86s.
// With the old code all 5 were attempted; now it must stop at the 3rd.
const ATHLETES = ['Megan Hu', 'Daniel Guo', 'William Ye', 'Marco Ye', 'Isabella Ye'];
let count = 0;
let attempted = 0;
let abortedAfter = null;
for (const name of ATHLETES) {
  attempted++;
  const r = nextBlockedRunState(count, asThrown);
  count = r.count;
  if (r.abort) { abortedAfter = name; break; }
}
check('run stops at the 3rd athlete', abortedAfter === 'Isabella Ye' ? false : attempted === 3, { attempted, abortedAfter });
check('abort happens on athlete 3 of 5', attempted === 3 && abortedAfter === ATHLETES[2], { attempted, abortedAfter });
// 3 attempts x 86s vs the old 5 attempts x 86s
const savedSec = (ATHLETES.length - attempted) * 86;
check('two wasted athlete attempts avoided (~172s)', savedSec === 172, savedSec);

console.log('6. a healthy run is never aborted');
let healthyCount = 0;
let healthyAbort = false;
for (let i = 0; i < 6; i++) {
  const r = nextBlockedRunState(healthyCount, null);   // all succeed
  healthyCount = r.count;
  healthyAbort = healthyAbort || r.abort;
}
check('6 successful athletes -> no abort', healthyCount === 0 && !healthyAbort);

console.log('7. an isolated blip does not abort the run');
// athlete 1 blocked, athlete 2 recovers, athlete 3 blocked -> never 3 in a row
let c = 0; let aborted = false;
for (const err of [netErr(BEST), null, netErr(BEST), null, netErr(BEST)]) {
  const r = nextBlockedRunState(c, err); c = r.count; aborted = aborted || r.abort;
}
check('interleaved failures/successes never abort', !aborted, c);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
