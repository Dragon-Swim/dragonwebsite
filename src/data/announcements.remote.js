/**
 * Homepage Announcements — Firestore 读取层(给公开主页用)
 *
 * 为什么不用 Firebase SDK:主页入口包现在只有 ~22 KB,只为了读几条公告引
 * firebase/firestore 会多出 ~150 KB gzip。Firestore 的 REST 接口对公开读的集合
 * (规则 `allow read: if true`)支持匿名调用且带 CORS,一个 fetch 就够:
 *
 *   GET https://firestore.googleapis.com/v1/projects/{pid}/databases/(default)
 *       /documents/announcements?pageSize=50&key={webApiKey}
 *
 * 缓存策略 = stale-while-revalidate:
 *   - 上次成功的结果写进 localStorage,回访者立刻看到横幅(不闪、不位移);
 *   - 每次进页面再静默拉一次,新的比缓存新就重渲染;
 *   - 网络失败 / 被广告拦截 / 配额用尽 → 安静地退回缓存,没有缓存就什么都不显示。
 *
 * 计费提醒:这里的 key 是公开的 Web API key;匿名读**每次访问按文档条数计读**。
 * 规则里没有 get()/exists(),所以不会额外计费(见 firestore.rules 的注释)。
 */

import { isAnnouncementActive, toIsoDate } from './announcements.data.js';

const CACHE_KEY = 'dragon.home.announcements.v1';
const MAX_DOCS = 50;
const TIMEOUT_MS = 6000;

// Vite 在构建时把 import.meta.env 替换成字面量对象;Node(单元测试)里它是
// undefined,所以两种环境都要能 import 这个文件而不炸。
const ENV = import.meta.env || {};
const HAS_WINDOW = typeof window !== 'undefined';

// 与 utils/firebase.js 相同的判定,但**故意不 import 那个文件** —— 它会把整个
// Firebase SDK 拖进主页的入口 chunk。模拟器模式下主页不读线上数据。
const USE_EMULATOR = HAS_WINDOW
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    && ENV.DEV === true
    && ENV.VITE_USE_FIREBASE_EMULATOR === 'true';

/** Firestore REST 的 typed value → 普通 JS 值。 */
export function decodeValue(value) {
    if (!value || typeof value !== 'object') return undefined;
    if ('stringValue' in value) return value.stringValue;
    if ('booleanValue' in value) return value.booleanValue === true;
    if ('integerValue' in value) return Number(value.integerValue);
    if ('doubleValue' in value) return Number(value.doubleValue);
    if ('timestampValue' in value) return value.timestampValue;
    if ('nullValue' in value) return null;
    if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
    return undefined;
}

/** 一条 REST 文档 → 公告对象。字段缺失就当成空的,绝不抛。 */
export function toAnnouncement(document) {
    const fields = (document && document.fields) || {};
    const name = String((document && document.name) || '');
    const id = name.split('/').pop();
    if (!id) return null;

    const level = decodeValue(fields.level);
    const until = decodeValue(fields.until);
    const announcement = {
        id,
        title: String(decodeValue(fields.title) || '').trim(),
        body: String(decodeValue(fields.body) || ''),
        level: level === 'urgent' ? 'urgent' : 'info',
        pinned: decodeValue(fields.pinned) === true,
        date: String(decodeValue(fields.date) || ''),
        until: until ? String(until) : null,
        updatedAt: decodeValue(fields.updatedAt) || null,
    };
    if (!announcement.title || !announcement.body.trim()) return null; // 空文档不渲染
    return announcement;
}

/** 整个 REST 响应 → 公告数组。 */
export function parseAnnouncementsResponse(json) {
    const documents = (json && json.documents) || [];
    return documents.map(toAnnouncement).filter(Boolean);
}

/** 上次成功的读结果(没读过 → [])。 */
export function cachedAnnouncements() {
    if (!HAS_WINDOW) return [];
    try {
        const raw = window.localStorage.getItem(CACHE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((a) => a && a.id && a.title) : [];
    } catch {
        return [];
    }
}

function rememberAnnouncements(items) {
    try {
        // 只缓存还有意义的(没过的),避免缓存里越积越多
        const today = toIsoDate();
        const keep = (Array.isArray(items) ? items : [])
            .filter((a) => isAnnouncementActive(a) || a.date > today)
            .slice(0, MAX_DOCS);
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(keep));
    } catch {
        /* 隐私模式 / 配额满:缓存失败不影响本次渲染 */
    }
}

/** REST 端点(公开读)。key 是 Web API key,本来就在每个页面的包里。 */
function endpoint() {
    const projectId = ENV.VITE_FIREBASE_PROJECT_ID;
    const apiKey = ENV.VITE_FIREBASE_API_KEY;
    if (!projectId || !apiKey) return null;
    return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)`
        + `/documents/announcements?pageSize=${MAX_DOCS}&key=${apiKey}`;
}

/**
 * 拉取公告。失败时抛错(调用方决定用缓存兜底)。
 * 集合不存在(还没发过任何消息)→ 返回 []。
 */
export async function fetchAnnouncements({ timeoutMs = TIMEOUT_MS } = {}) {
    if (USE_EMULATOR) throw new Error('emulator mode: announcements REST read skipped');

    const url = endpoint();
    if (!url) throw new Error('firebase config missing (VITE_FIREBASE_*)');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
        if (res.status === 404) return recallAndCache([]); // 集合还没建
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return recallAndCache(parseAnnouncementsResponse(json));
    } finally {
        clearTimeout(timer);
    }
}

function recallAndCache(items) {
    if (items.length) rememberAnnouncements(items);
    return items;
}

/**
 * 主页用:先给出缓存(可能为空),再返回一个 Promise<数组> 表示网络结果。
 * 网络失败时 Promise 里给缓存,并把错误放到 `error` 上,调用方可以选择不管。
 */
export function loadAnnouncements() {
    const cached = cachedAnnouncements();
    const fresh = fetchAnnouncements()
        .then((items) => ({ items, fromCache: false }))
        .catch((error) => ({ items: cached, fromCache: true, error }));
    return { cached, fresh };
}
