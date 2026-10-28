/**
 * Worker 的本机测试 —— 不联网也能覆盖路由、鉴权、cookie 存取。
 *
 * 跑法(仓库根目录):
 *   node worker/test/run.mjs
 *
 * 只有「转发到真实上游」那一例会发网络请求(用假 cookie,拿 401 即可),
 * 其余全在本机完成。
 */
import { makeWorker, pickCookie } from '../src/index.js';
import { verifyIdToken } from '../src/firebase-auth.js';

let passed = 0;
let failed = 0;

function check(name, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  ok   ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function makeKv() {
  const m = new Map();
  return {
    _map: m,
    async get(k, type) {
      if (!m.has(k)) return null;
      const v = m.get(k);
      return type === 'json' ? JSON.parse(v) : v;
    },
    async put(k, v) {
      m.set(k, String(v));
    },
    async delete(k) {
      m.delete(k);
    },
  };
}

const ctx = { waitUntil: (p) => Promise.resolve(p).catch(() => {}) };
const env = (kv, extra = {}) => ({
  USAS_KV: kv,
  FIREBASE_PROJECT_ID: 'dragonwebsite-db',
  ADMIN_EMAILS: '',
  ...extra,
});

const GOOD_COOKIE =
  '_ga=GA1.1.1; bff_auth_session=ABCDEF123456; _fbp=fb.1.2';

// ── 假 token:给 handler 用,跳过真实验签 ──
const okVerifier = async () => ({ ok: true, claims: { email: 'coach@dragonswim.org', sub: 'u1' } });
const denyVerifier = async () => ({ ok: false, reason: 'bad signature' });

const worker = makeWorker({ verifyToken: okVerifier });
const denyWorker = makeWorker({ verifyToken: denyVerifier });

const AUTH = { authorization: 'Bearer faketoken' };

async function call(w, path, init = {}) {
  const res = await w.fetch(new Request(`https://dragonswim.org${path}`, init), env(kvGlobal), ctx);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body, text, headers: res.headers };
}

let kvGlobal = makeKv();

console.log('\n1. 鉴权');
{
  const r = await call(worker, '/api/usas/session');
  check('没有 Authorization → 401', r.status === 401, `${r.status}`);

  const r2 = await call(denyWorker, '/api/usas/session', { headers: AUTH });
  check('验签失败 → 401', r2.status === 401, JSON.stringify(r2.body));
  check('失败原因透传', r2.body?.reason === 'bad signature', JSON.stringify(r2.body));
}

console.log('\n2. 邮箱白名单');
{
  const kv = makeKv();
  kvGlobal = kv;
  const restricted = makeWorker({ verifyToken: okVerifier });
  const res = await restricted.fetch(
    new Request('https://dragonswim.org/api/usas/session', { headers: AUTH }),
    env(kv, { ADMIN_EMAILS: 'someone@else.com' }),
    ctx,
  );
  check('不在白名单 → 403', res.status === 403, `${res.status}`);

  const res2 = await restricted.fetch(
    new Request('https://dragonswim.org/api/usas/session', { headers: AUTH }),
    env(kv, { ADMIN_EMAILS: 'coach@dragonswim.org' }),
    ctx,
  );
  check('在白名单 → 200', res2.status === 200, `${res2.status}`);
}

console.log('\n3. 会话存取');
{
  const kv = makeKv();
  kvGlobal = kv;

  const empty = await call(worker, '/api/usas/session', { headers: AUTH });
  check('初始 hasCookie=false', empty.body?.hasCookie === false, JSON.stringify(empty.body));

  const garbage = await call(worker, '/api/usas/session', {
    method: 'POST',
    headers: { ...AUTH, 'content-type': 'application/json' },
    body: JSON.stringify({ cookie: '_ga=1; _fbp=2' }),
  });
  check('没有 bff_auth_session → 400', garbage.status === 400, JSON.stringify(garbage.body));
  check('错误码正确', garbage.body?.error === 'no_auth_cookie', JSON.stringify(garbage.body));

  const saved = await call(worker, '/api/usas/session', {
    method: 'POST',
    headers: { ...AUTH, 'content-type': 'application/json' },
    body: JSON.stringify({ cookie: GOOD_COOKIE }),
  });
  check('保存成功 → 200', saved.status === 200, JSON.stringify(saved.body));
  check('只存了鉴权那一枚', kv._map.get('session:cookie') === 'bff_auth_session=ABCDEF123456', kv._map.get('session:cookie'));
  check('标记 authCookieOnly', saved.body?.authCookieOnly === true, JSON.stringify(saved.body));

  const after = await call(worker, '/api/usas/session', { headers: AUTH });
  check('读回 hasCookie=true', after.body?.hasCookie === true, JSON.stringify(after.body));
  check('长度正确', after.body?.length === 'bff_auth_session=ABCDEF123456'.length, String(after.body?.length));

  const cleared = await call(worker, '/api/usas/session', { method: 'DELETE', headers: AUTH });
  check('DELETE 清空', cleared.body?.cleared === true && !kv._map.has('session:cookie'), JSON.stringify(cleared.body));
}

console.log('\n4. 代理路由');
{
  const kv = makeKv();
  kvGlobal = kv;

  const noSession = await call(worker, '/api/usas/TimesSearch/GetBestTimesForMember/ABC', { headers: AUTH });
  check('没会话 → 503', noSession.status === 503, `${noSession.status}`);
  check('提示语可读', /更新会话/.test(noSession.body?.message || ''), noSession.body?.message);

  await kv.put('session:cookie', 'bff_auth_session=BOGUS');

  // URL 规范化会把 `..` 折叠掉,所以这类请求在进入 handler 前就已经落到 /api/usas 之外 → 404
  const traversal = await call(worker, '/api/usas/TimesSearch/../../bff/securityinfo', { headers: AUTH });
  check('裸 .. 穿越 → 404(URL 已归一化)', traversal.status === 404, `${traversal.status}`);

  // 编码过的穿越不会被 URL 归一化,必须由 badPath() 拦下
  const encodedTraversal = await call(worker, '/api/usas/TimesSearch/a%2f..%2fb', { headers: AUTH });
  check('编码穿越(%2f) → 400', encodedTraversal.status === 400, `${encodedTraversal.status}`);

  const wrongMethod = await call(worker, '/api/usas/TimesSearch/GetBestTimesForMember/ABC', {
    method: 'POST',
    headers: AUTH,
  });
  check('POST → 405', wrongMethod.status === 405, `${wrongMethod.status}`);

  const outside = await call(worker, '/api/usas/SearchFilter/GetLscs', { headers: AUTH });
  check('/TimesSearch 以外 → 404(路径不在白名单)', outside.status === 404, `${outside.status}`);

  const relay = await call(worker, '/api/usas/TimesSearch/GetBestTimesForMember/D2754213666C4F', { headers: AUTH });
  check('假 cookie 转发 → 上游 401 透传', relay.status === 401, `${relay.status} ${relay.text.slice(0, 80)}`);
  check('带上 x-usas-proxy 头', relay.headers.get('x-usas-proxy') === '1', String(relay.headers.get('x-usas-proxy')));
  const verify = await call(worker, '/api/usas/session/verify', { headers: AUTH });
  check('verify 对假 cookie 报 valid=false', verify.body?.valid === false && verify.status === 401, JSON.stringify(verify.body));
}

console.log('\n5. cookie 解析');
{
  check('去掉 Cookie: 前缀', pickCookie('Cookie: a=1; bff_auth_session=Z9').value === 'bff_auth_session=Z9');
  check('多行折叠', pickCookie('a=1;\nbff_auth_session=Z9').authOnly === true);
  check('没有鉴权 cookie 时整段保留', pickCookie('_ga=1; _fbp=2').value === '_ga=1; _fbp=2');
  check('空输入', pickCookie('   ').value === '');
}

console.log('\n6. ID token 验签(自签密钥)');
{
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
  const jwk = { ...(await crypto.subtle.exportKey('jwk', publicKey)), kid: 'test-key', alg: 'RS256', use: 'sig' };

  const b64u = (obj) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  async function mint(payload) {
    const head = b64u({ alg: 'RS256', kid: 'test-key', typ: 'JWT' });
    const body = b64u(payload);
    const sig = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      new TextEncoder().encode(`${head}.${body}`),
    );
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${head}.${body}.${sigB64}`;
  }

  const now = Math.floor(Date.now() / 1000);
  const base = {
    iss: 'https://securetoken.google.com/dragonwebsite-db',
    aud: 'dragonwebsite-db',
    sub: 'uid-1',
    email: 'coach@dragonswim.org',
    iat: now,
    exp: now + 3600,
  };

  const good = await mint(base);
  const okRes = await verifyIdToken(good, 'dragonwebsite-db', { jwks: [jwk] });
  check('合法 token 通过', okRes.ok === true, JSON.stringify(okRes));

  const expired = await verifyIdToken(await mint({ ...base, iat: now - 7200, exp: now - 3600 }), 'dragonwebsite-db', { jwks: [jwk] });
  check('过期 → token expired', !expired.ok && expired.reason === 'token expired', JSON.stringify(expired));

  const wrongAud = await verifyIdToken(await mint({ ...base, aud: 'other-project' }), 'dragonwebsite-db', { jwks: [jwk] });
  check('aud 不符 → wrong audience', !wrongAud.ok && wrongAud.reason === 'wrong audience', JSON.stringify(wrongAud));

  const wrongIss = await verifyIdToken(await mint({ ...base, iss: 'https://evil.example' }), 'dragonwebsite-db', { jwks: [jwk] });
  check('iss 不符 → wrong issuer', !wrongIss.ok && wrongIss.reason === 'wrong issuer', JSON.stringify(wrongIss));

  // 改一位 payload,签名就对不上了
  const [h, , s] = good.split('.');
  const tampered = `${h}.${b64u({ ...base, sub: 'attacker' })}.${s}`;
  const badSig = await verifyIdToken(tampered, 'dragonwebsite-db', { jwks: [jwk] });
  check('篡改 payload → bad signature', !badSig.ok && badSig.reason === 'bad signature', JSON.stringify(badSig));

  const noneAlg = `eyJhbGciOiJub25lIn0.${b64u(base)}.`;
  const none = await verifyIdToken(noneAlg, 'dragonwebsite-db', { jwks: [jwk] });
  check('alg=none 被拒', !none.ok, JSON.stringify(none));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
