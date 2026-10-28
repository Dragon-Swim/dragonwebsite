/**
 * Firebase ID token 校验 —— 不依赖 Admin SDK,只用 WebCrypto。
 *
 * 为什么不用 Admin SDK:Workers 里跑 service account + google-auth 太重,
 * 而校验 ID token 只需要 Google 的**公钥**(JWKS)和一次 RSA 验签。
 *
 * 校验项(缺一不可):
 *   - header.alg === 'RS256',kid 能在 JWKS 里找到
 *   - 签名有效
 *   - iss === https://securetoken.google.com/<projectId>
 *   - aud === <projectId>
 *   - exp 未过期、iat 不在未来(留 60 秒时钟偏差)
 *   - sub 非空
 *
 * 返回 { ok: true, claims } 或 { ok: false, reason }。
 */

const JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

// 模块级缓存:Workers 的 isolate 会复用,同一 isolate 内不必每次拉 JWKS。
let jwksCache = { at: 0, keys: null };
const JWKS_TTL_MS = 60 * 60 * 1000;

function b64urlToBytes(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlToJson(s) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));
}

async function getJwks(force = false) {
  const fresh = jwksCache.keys && Date.now() - jwksCache.at < JWKS_TTL_MS;
  if (fresh && !force) return jwksCache.keys;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const body = await res.json();
  const keys = (body.keys || []).filter((k) => k.kty === 'RSA');
  jwksCache = { at: Date.now(), keys };
  return keys;
}

/**
 * @param {string} token      浏览器里 currentUser.getIdToken() 拿到的 JWT
 * @param {string} projectId  Firebase 项目 id
 * @param {{ jwks?: Array }} [opts] 仅测试用:直接注入公钥,跳过网络
 */
export async function verifyIdToken(token, projectId, opts = {}) {
  if (!token || typeof token !== 'string') return { ok: false, reason: 'missing token' };
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'not a JWT' };

  let header;
  let payload;
  try {
    header = b64urlToJson(parts[0]);
    payload = b64urlToJson(parts[1]);
  } catch {
    return { ok: false, reason: 'malformed token' };
  }

  if (header.alg !== 'RS256') return { ok: false, reason: `unsupported alg ${header.alg}` };

  let keys = opts.jwks || (await getJwks());
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk && !opts.jwks) {
    // 密钥轮换:强制刷新一次再找
    keys = await getJwks(true);
    jwk = keys.find((k) => k.kid === header.kid);
  }
  if (!jwk) return { ok: false, reason: 'unknown kid' };

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    b64urlToBytes(parts[2]),
    signed,
  );
  if (!valid) return { ok: false, reason: 'bad signature' };

  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    return { ok: false, reason: 'wrong issuer' };
  }
  if (payload.aud !== projectId) return { ok: false, reason: 'wrong audience' };
  if (typeof payload.exp !== 'number' || payload.exp <= now) {
    return { ok: false, reason: 'token expired' };
  }
  if (typeof payload.iat !== 'number' || payload.iat > now + 60) {
    return { ok: false, reason: 'token issued in the future' };
  }
  if (!payload.sub || typeof payload.sub !== 'string') {
    return { ok: false, reason: 'missing subject' };
  }

  return { ok: true, claims: payload };
}
