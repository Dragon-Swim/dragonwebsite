/**
 * dragonswim-usas-proxy —— 把 Data Hub 的成绩接口暴露给本站,同时守住会话 cookie。
 *
 * ── 背景 ───────────────────────────────────────────────────────────────────
 * 2026-10-27 起旧接口 `times-api.usaswimming.org` 整站 403;新版 Data Hub 改用
 * `data.usaswimming.org/api/times/swims/*` + **登录 cookie**(`bff_auth_session`,
 * 寿命固定 8 小时、不续期),并且 `/api/*` 拒绝本站来源跨域。
 * 所以浏览器不能直连,必须由这里转发。详见 docs/swim-results-fetch.md §12。
 *
 * ── 路由(全部挂在 /api/usas 下)─────────────────────────────────────────────
 *   GET    /api/usas/session          会话状态(不返回 cookie 内容)
 *   POST   /api/usas/session          保存 cookie,body: {"cookie":"..."}
 *   DELETE /api/usas/session          清除
 *   GET    /api/usas/session/verify   实时验证(打一次 /bff/securityinfo)
 *   GET    /api/usas/TimesSearch/*    转发到上游同名路径
 *
 * ── 鉴权 ───────────────────────────────────────────────────────────────────
 * 所有端点都要求 `Authorization: Bearer <Firebase ID token>`,验签见 firebase-auth.js。
 * 设了 `ADMIN_EMAILS`(逗号分隔)时只有这些邮箱可用;不设则任何已登录用户都能用
 * —— 第一次部署时留空便于测试,稳定后**务必**填上。
 *
 * ── 为什么不是开放代理 ─────────────────────────────────────────────────────
 * 路径白名单只放 `/TimesSearch/`,并且拒绝 `..`、`%2f` 这类绕行;上游域名写死。
 */
import { verifyIdToken } from './firebase-auth.js';

const UPSTREAM_ORIGIN = 'https://data.usaswimming.org';
const UPSTREAM_API = '/api/times/swims';
const BASE = '/api/usas';
const PROXY_PREFIX = `${BASE}/TimesSearch/`;

const K_COOKIE = 'session:cookie';
const K_META = 'session:meta';

// 真正起鉴权作用的那一枚;其余是 _ga / _fbp 之类的统计 cookie,不必带上。
const AUTH_COOKIE_NAME = 'bff_auth_session';

const UPSTREAM_TIMEOUT_MS = 15000;

// ── 小工具 ──────────────────────────────────────────────────────────────────

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extraHeaders },
  });
}

/** 复刻前端的 Device-Id 算法:base64 后把前 5 个字符再插一遍,共 69 字符。 */
function makeDeviceId() {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const fp = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  const raw = `Win32 - Google Inc. - ${fp} - ${Date.now()}`;
  const b64 = btoa(raw);
  return b64.slice(0, 15) + b64.slice(0, 5) + b64.slice(15);
}

/** 从浏览器复制的整段 cookie 里挑出真正要用的部分。 */
export function pickCookie(raw) {
  const normalized = String(raw || '')
    .replace(/^\s*cookie\s*:\s*/i, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/^["']|["']$/g, '')
    .trim();
  if (!normalized) return { value: '', authOnly: false };

  const pairs = normalized.split(';').map((s) => s.trim()).filter(Boolean);
  const auth = pairs.find((p) => p.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (auth) return { value: auth, authOnly: true };
  return { value: pairs.join('; '), authOnly: false };
}

async function upstreamFetch(path, cookie, extraHeaders = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(`${UPSTREAM_ORIGIN}${path}`, {
      headers: {
        Cookie: cookie,
        'Device-Id': makeDeviceId(),
        'X-CSRF': '1',
        Accept: 'application/json',
        'User-Agent': 'dragonswim-usas-proxy/1.0',
        ...extraHeaders,
      },
      signal: controller.signal,
      // 不要带 Origin / Referer:上游有来源白名单,带了会被 400 拒。
    });
  } finally {
    clearTimeout(timer);
  }
}

function corsHeaders(request, env) {
  const allowed = env.ALLOWED_ORIGIN;
  const origin = request.headers.get('origin');
  if (!allowed || origin !== allowed) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
    'access-control-allow-headers': 'authorization,content-type',
    'access-control-max-age': '600',
    vary: 'Origin',
  };
}

function badPath(p) {
  if (p.includes('..')) return true;
  if (/%2e|%2f|%5c/i.test(p)) return true;
  return false;
}

// ── 入口 ────────────────────────────────────────────────────────────────────

/**
 * 工厂:测试时可以注入假的 verifyToken。
 * 生产用文件末尾的 `export default makeWorker()`。
 */
export function makeWorker({ verifyToken = verifyIdToken } = {}) {
  async function authenticate(request, env) {
    const header = request.headers.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) return { ok: false, status: 401, body: { error: 'missing_token' } };

    let result;
    try {
      result = await verifyToken(token, env.FIREBASE_PROJECT_ID);
    } catch (e) {
      return { ok: false, status: 401, body: { error: 'token_check_failed', detail: e.message } };
    }
    if (!result?.ok) {
      return { ok: false, status: 401, body: { error: 'invalid_token', reason: result?.reason } };
    }

    const email = String(result.claims.email || '').toLowerCase();
    const allow = String(env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (allow.length && !allow.includes(email)) {
      return { ok: false, status: 403, body: { error: 'not_allowed', email } };
    }
    return { ok: true, claims: result.claims, email };
  }

  async function handleSession(request, env, ctx) {
    const method = request.method;

    if (method === 'GET') {
      const [cookie, meta] = await Promise.all([env.USAS_KV.get(K_COOKIE), env.USAS_KV.get(K_META, 'json')]);
      return json({
        hasCookie: !!cookie,
        length: cookie ? cookie.length : 0,
        savedAt: meta?.savedAt || null,
        savedBy: meta?.savedBy || null,
        authCookieOnly: !!meta?.authCookieOnly,
        invalidAt: meta?.invalidAt || null,
      });
    }

    if (method === 'DELETE') {
      await Promise.all([env.USAS_KV.delete(K_COOKIE), env.USAS_KV.delete(K_META)]);
      return json({ ok: true, cleared: true });
    }

    if (method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'bad_body', message: 'expected JSON {"cookie":"..."}' }, 400);
      }
      const { value, authOnly } = pickCookie(body?.cookie);
      if (!value) {
        return json({ error: 'empty_cookie', message: '粘贴的 cookie 是空的' }, 400);
      }
      if (!value.startsWith(`${AUTH_COOKIE_NAME}=`)) {
        // 没找到 bff_auth_session:要么没登录,要么复制错了行。
        return json(
          {
            error: 'no_auth_cookie',
            message: `没有找到 ${AUTH_COOKIE_NAME}。请确认已登录 Data Hub,并复制请求头里完整的 cookie 值。`,
          },
          400,
        );
      }
      const meta = {
        savedAt: new Date().toISOString(),
        savedBy: body?.email || null,
        length: value.length,
        authCookieOnly: authOnly,
        invalidAt: null,
      };
      await Promise.all([
        env.USAS_KV.put(K_COOKIE, value),
        env.USAS_KV.put(K_META, JSON.stringify(meta)),
      ]);
      ctx?.waitUntil?.(checkSession(env).catch(() => {}));
      return json({ ok: true, ...meta });
    }

    return json({ error: 'method_not_allowed' }, 405);
  }

  /** 用当前 cookie 打一次 /bff/securityinfo,判断会话是否还活着。 */
  async function checkSession(env) {
    const cookie = await env.USAS_KV.get(K_COOKIE);
    if (!cookie) return { ok: false, status: 409, body: { error: 'no_session' } };
    const res = await upstreamFetch('/bff/securityinfo', cookie);
    if (res.status === 401) {
      const meta = (await env.USAS_KV.get(K_META, 'json')) || {};
      await env.USAS_KV.put(K_META, JSON.stringify({ ...meta, invalidAt: new Date().toISOString() }));
      return { ok: false, status: 401, body: { valid: false, status: 401 } };
    }
    if (!res.ok) {
      return { ok: false, status: 502, body: { valid: false, status: res.status } };
    }
    let name = null;
    try {
      const data = await res.json();
      name = data?.firstName || null;
    } catch {
      /* 身份解析失败不影响"有效"这个结论 */
    }
    // 验证通过 → 顺手清掉之前记下的失效标记,免得 UI 一直显示红字。
    const meta = (await env.USAS_KV.get(K_META, 'json')) || {};
    if (meta.invalidAt) {
      await env.USAS_KV.put(K_META, JSON.stringify({ ...meta, invalidAt: null }));
    }
    return { ok: true, status: 200, body: { valid: true, status: 200, name } };
  }

  async function handleProxy(request, env, ctx) {
    const cookie = await env.USAS_KV.get(K_COOKIE);
    if (!cookie) {
      return json(
        { error: 'no_session', message: '还没有保存 Data Hub 会话,请先在「更新会话」里粘贴 cookie' },
        503,
      );
    }

    const url = new URL(request.url);
    const rest = url.pathname.slice(BASE.length); // /TimesSearch/...
    if (!rest.startsWith('/TimesSearch/') || badPath(rest)) {
      return json({ error: 'bad_path' }, 400);
    }

    let upstream;
    try {
      upstream = await upstreamFetch(`${UPSTREAM_API}${rest}${url.search}`, cookie);
    } catch (e) {
      return json({ error: 'upstream_unreachable', detail: e.message }, 502);
    }

    if (upstream.status === 401) {
      // 会话过期:记下来,前端/下次打开就能看到"已失效"。
      ctx?.waitUntil?.(
        (async () => {
          const meta = (await env.USAS_KV.get(K_META, 'json')) || {};
          await env.USAS_KV.put(K_META, JSON.stringify({ ...meta, invalidAt: new Date().toISOString() }));
        })().catch(() => {}),
      );
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-usas-proxy': '1',
      },
    });
  }

  return {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const cors = corsHeaders(request, env);

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: cors });
      }

      if (url.pathname !== BASE && !url.pathname.startsWith(`${BASE}/`)) {
        return json({ error: 'not_found' }, 404, cors);
      }

      const auth = await authenticate(request, env);
      if (!auth.ok) return json(auth.body, auth.status, cors);

      const route = url.pathname.slice(BASE.length);

      if (route === '/session') {
        const res = await handleSession(request, env, ctx);
        return addHeaders(res, cors);
      }

      if (route === '/session/verify') {
        if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, cors);
        const result = await checkSession(env);
        return json(result.body, result.status, cors);
      }

      if (route.startsWith('/TimesSearch/')) {
        if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, cors);
        const res = await handleProxy(request, env, ctx);
        return addHeaders(res, cors);
      }

      return json({ error: 'not_found', route }, 404, cors);
    },
  };

  // 让 401/403 的 body 也带上固定形状,便于前端统一处理
  function addHeaders(res, extra) {
    if (!Object.keys(extra).length) return res;
    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(extra)) headers.set(k, v);
    return new Response(res.body, { status: res.status, headers });
  }
}

export default makeWorker();
