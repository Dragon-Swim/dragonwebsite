#!/usr/bin/env node

// seed_announcements.mjs — 把主页公告写进 Firestore `announcements` 集合。
//
// 为什么需要它:dashboard 的「Announcements」标签是日常入口,但**首次启用**
// (2026-10-27 从硬编码 announcements.data.js 迁到 Firestore)时,需要在没有
// 任何前端登录的前提下把线上正在跑的那条通知灌进去,避免主页出现空档。
// 另外它也是"从坏的数据库状态恢复"的确定性工具。
//
// 用法:
//   node execution/data-admin/seed_announcements.mjs            # 集合为空时写入默认那条
//   node execution/data-admin/seed_announcements.mjs --dry-run   # 只打印,不写
//   node execution/data-admin/seed_announcements.mjs --force     # 集合非空也写
//   node execution/data-admin/seed_announcements.mjs --from-file .tmp/announcements-seed.json
//
// --from-file 的格式(数组,字段与前端一致,日期为 'YYYY-MM-DD'):
//   [{ "title": "...", "body": "第一段\n\n第二段", "level": "urgent",
//      "pinned": true, "date": "2026-10-27", "until": "2026-11-01" }]
//
// schema 与 components/announcementAdmin.js 的保存逻辑一致:
//   title, body, level, pinned, date, until, createdAt/createdBy/createdByEmail,
//   updatedAt/updatedBy/updatedByEmail
//
// 退出码:0 成功(或无需写入);1 参数/运行错误。

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const argv = process.argv.slice(2);
const flag = (name, def = null) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const has = (name) => argv.includes(`--${name}`);

const KEY_PATH = resolve(flag('key', 'serviceAccountKey.json'));
const DRY_RUN = has('dry-run');
const FORCE = has('force');
const FROM_FILE = flag('from-file');
const COLLECTION = 'announcements';
const SEED_ACTOR = { uid: null, email: 'seed_announcements.mjs' };

// 迁移当时线上正在跑的那条(2026-10-27 Claude Moore 周末停课)。
const DEFAULT_SEED = [
    {
        title: 'Weekend Update: No Claude Moore Training, Oct 31 – Nov 1',
        body: `There is no training at Claude Moore this Saturday and Sunday (10/31 & 11/1) — the facility is closed for the weekend.

Tysons and Dulles South keep their regular weekend practices. Swimmers who would like to swim there instead are welcome; please let your coach know in advance so we can plan lane space.`,
        level: 'urgent',
        pinned: true,
        date: '2026-10-27',
        until: '2026-11-01',
    },
];

if (!existsSync(KEY_PATH)) {
    console.error(`❌ 找不到 service account key: ${KEY_PATH}`);
    process.exit(1);
}

let payload = DEFAULT_SEED;
if (FROM_FILE) {
    const path = resolve(FROM_FILE);
    if (!existsSync(path)) {
        console.error(`❌ 找不到 --from-file: ${path}`);
        process.exit(1);
    }
    payload = JSON.parse(readFileSync(path, 'utf8'));
}

if (!Array.isArray(payload) || payload.length === 0) {
    console.error('❌ 没有可写入的公告(需要非空数组)');
    process.exit(1);
}

const errors = [];
payload.forEach((a, i) => {
    const where = `#${i + 1}`;
    if (!a.title || typeof a.title !== 'string' || a.title.length > 120) errors.push(`${where} title 缺失或超过 120 字符`);
    if (!a.body || typeof a.body !== 'string' || a.body.length > 4000) errors.push(`${where} body 缺失或超过 4000 字符`);
    if (!['info', 'urgent'].includes(a.level)) errors.push(`${where} level 必须是 info / urgent`);
    if (typeof a.pinned !== 'boolean') errors.push(`${where} pinned 必须是布尔值`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date || '')) errors.push(`${where} date 必须是 YYYY-MM-DD`);
    if (a.until != null && !/^\d{4}-\d{2}-\d{2}$/.test(a.until)) errors.push(`${where} until 必须是 YYYY-MM-DD 或 null`);
    if (a.until && a.until < a.date) errors.push(`${where} until 不能早于 date`);
});
if (errors.length) {
    console.error('❌ 数据校验失败:\n  - ' + errors.join('\n  - '));
    process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(KEY_PATH, 'utf8'))) });
const db = getFirestore();

const existing = await db.collection(COLLECTION).get();
console.log(`现有公告:${existing.size} 条`);

if (existing.size > 0 && !FORCE) {
    console.log('ℹ️  集合非空,跳过写入(需要覆盖请加 --force)。');
    process.exit(0);
}

// 只允许一条 pinned:写入多条时,只保留第一条 pinned
let pinnedSeen = false;
for (const a of payload) {
    const pinned = a.pinned && !pinnedSeen;
    if (a.pinned) pinnedSeen = true;

    const doc = {
        title: a.title.trim(),
        body: a.body,
        level: a.level,
        pinned,
        date: a.date,
        until: a.until || null,
        ...(DRY_RUN
            ? { createdAt: '(dry-run)', updatedAt: '(dry-run)' }
            : {
                createdAt: FieldValue.serverTimestamp(),
                createdBy: SEED_ACTOR.uid,
                createdByEmail: SEED_ACTOR.email,
                updatedAt: FieldValue.serverTimestamp(),
                updatedBy: SEED_ACTOR.uid,
                updatedByEmail: SEED_ACTOR.email,
            }),
    };

    if (DRY_RUN) {
        console.log('DRY RUN 将写入:', JSON.stringify(doc, null, 2));
        continue;
    }
    const ref = await db.collection(COLLECTION).add(doc);
    console.log(`✅ 写入 ${ref.path} — ${doc.title} (${doc.date} → ${doc.until || 'no end'})`);
}

if (DRY_RUN) console.log('\n(dry-run:未写入任何数据)');
