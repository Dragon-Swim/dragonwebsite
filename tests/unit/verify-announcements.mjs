#!/usr/bin/env node

/**
 * Unit checks — homepage announcements (2026-10-27).
 *
 *   npm run test:unit
 *
 * 覆盖三件事:
 *   1. 纯逻辑:什么时候显示、哪条进横幅、状态徽章(status)的边界;
 *   2. Firestore REST 的解码层:主页不引 SDK,只能靠这段映射,字段名/类型
 *      一旦漂移就会静默不显示 —— 所以用真实的 REST 响应形状做夹具;
 *   3. 排序与 "只显示有效消息" 的组合行为。
 */

import {
    toIsoDate,
    isAnnouncementActive,
    getActiveAnnouncements,
    getBannerAnnouncement,
    announcementStatus,
    formatAnnouncementDate,
} from '../../src/data/announcements.data.js';
import {
    decodeValue,
    toAnnouncement,
    parseAnnouncementsResponse,
} from '../../src/data/announcements.remote.js';

let passed = 0;
let failed = 0;

function ok(name, condition, detail = '') {
    if (condition) {
        passed++;
        console.log(`  ok   ${name}`);
    } else {
        failed++;
        console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
    }
}

/** 固定 "今天",免得测试在月末/跨年时漂移。 */
const NOW = new Date('2026-10-27T12:00:00');
const day = (iso) => new Date(`${iso}T12:00:00`);

console.log('verify-announcements.mjs — homepage notices');

// ── 1. 显示窗口 ────────────────────────────────────────────────
console.log('\n1. isAnnouncementActive — the show window');

ok('today is the publish date → visible',
    isAnnouncementActive({ date: '2026-10-27' }, NOW));

ok('future publish date → hidden',
    isAnnouncementActive({ date: '2026-10-28' }, NOW) === false);

ok('until today (inclusive) → still visible',
    isAnnouncementActive({ date: '2026-10-20', until: '2026-10-27' }, NOW));

ok('until yesterday → hidden',
    isAnnouncementActive({ date: '2026-10-20', until: '2026-10-26' }, NOW) === false);

ok('no until → never expires',
    isAnnouncementActive({ date: '2026-01-01' }, NOW));

ok('null / undefined input is not active',
    isAnnouncementActive(null, NOW) === false && isAnnouncementActive(undefined, NOW) === false);

ok('local date formatting does not drift at midnight',
    toIsoDate(new Date(2026, 9, 27, 23, 59)) === '2026-10-27'
    && toIsoDate(new Date(2026, 9, 28, 0, 1)) === '2026-10-28');

// ── 2. 排序与横幅 ──────────────────────────────────────────────
console.log('\n2. active list + banner choice');

const fixtures = [
    { id: 'old', date: '2026-10-01', pinned: true, title: 'Old pinned' },
    { id: 'new', date: '2026-10-26', pinned: true, title: 'New pinned' },
    { id: 'plain', date: '2026-10-20', pinned: false, title: 'Plain' },
    { id: 'expired', date: '2026-09-01', until: '2026-09-02', pinned: true, title: 'Expired' },
    { id: 'future', date: '2026-11-10', pinned: true, title: 'Future' },
];

const active = getActiveAnnouncements(fixtures, NOW);
ok('expired and future notices are filtered out',
    active.map((a) => a.id).join(',') === 'new,plain,old', active.map((a) => a.id).join(','));
ok('newest first', active[0].id === 'new');

ok('banner = newest pinned active notice',
    getBannerAnnouncement(fixtures, NOW).id === 'new');

ok('no pinned → no banner',
    getBannerAnnouncement(fixtures.filter((a) => !a.pinned), NOW) === null);

ok('only a future pinned notice → no banner yet',
    getBannerAnnouncement([{ id: 'x', date: '2026-12-01', pinned: true }], NOW) === null);

ok('status: live / scheduled / expired', [
    announcementStatus({ date: '2026-10-27' }, NOW),
    announcementStatus({ date: '2026-11-01' }, NOW),
    announcementStatus({ date: '2026-10-01', until: '2026-10-02' }, NOW),
].join(',') === 'live,scheduled,expired');

ok('date renders as "Oct 27, 2026"',
    formatAnnouncementDate('2026-10-27') === 'Oct 27, 2026', formatAnnouncementDate('2026-10-27'));

// ── 3. Firestore REST 解码 ─────────────────────────────────────
console.log('\n3. Firestore REST mapping (the homepage reads without the SDK)');

// 形状取自真实响应:projects/…/documents/announcements?pageSize=50
const REST_RESPONSE = {
    documents: [
        {
            name: 'projects/dragonwebsite-db/databases/(default)/documents/announcements/TmDT336qJboZVnGnTkbk',
            fields: {
                title: { stringValue: 'Weekend Update: No Claude Moore Training, Oct 31 – Nov 1' },
                body: { stringValue: 'First paragraph.\n\nSecond paragraph.' },
                level: { stringValue: 'urgent' },
                pinned: { booleanValue: true },
                date: { stringValue: '2026-10-27' },
                until: { stringValue: '2026-11-01' },
                updatedAt: { timestampValue: '2026-10-27T21:34:07.738Z' },
                updatedBy: { nullValue: null },
            },
        },
        {
            // 空文档(管理员新建后没填完)→ 必须被丢掉,而不是渲染成空白卡片
            name: 'projects/dragonwebsite-db/databases/(default)/documents/announcements/emptyOne',
            fields: {
                date: { stringValue: '2026-10-27' },
            },
        },
    ],
};

ok('decodeValue: strings', decodeValue({ stringValue: 'x' }) === 'x');
ok('decodeValue: booleans', decodeValue({ booleanValue: true }) === true);
ok('decodeValue: null', decodeValue({ nullValue: null }) === null);
ok('decodeValue: unknown shape → undefined', decodeValue({ mapValue: {} }) === undefined);

const parsed = parseAnnouncementsResponse(REST_RESPONSE);
ok('parses one real notice and drops the empty document', parsed.length === 1, `got ${parsed.length}`);
ok('document id comes from the resource name', parsed[0].id === 'TmDT336qJboZVnGnTkbk');
ok('level normalised to "urgent"', parsed[0].level === 'urgent');
ok('pinned decoded from booleanValue', parsed[0].pinned === true);
ok('body keeps paragraph breaks', parsed[0].body.includes('\n\n'));
ok('until decoded', parsed[0].until === '2026-11-01');
ok('updatedAt kept for the editor', parsed[0].updatedAt === '2026-10-27T21:34:07.738Z');

ok('missing until → null (never expires)',
    toAnnouncement({
        name: 'projects/p/databases/(default)/documents/announcements/a1',
        fields: { title: { stringValue: 'T' }, body: { stringValue: 'B' }, date: { stringValue: '2026-10-27' } },
    }).until === null);

ok('missing level → "info" (not urgent)',
    toAnnouncement({
        name: 'projects/p/databases/(default)/documents/announcements/a2',
        fields: { title: { stringValue: 'T' }, body: { stringValue: 'B' }, date: { stringValue: '2026-10-27' } },
    }).level === 'info');

ok('empty collection (no documents key) → []',
    parseAnnouncementsResponse({}).length === 0
    && parseAnnouncementsResponse(null).length === 0);

// 端到端拼一遍:真实响应 → 主页要渲染的那条
const homepageItems = parseAnnouncementsResponse(REST_RESPONSE);
const banner = getBannerAnnouncement(homepageItems, NOW);
ok('the parsed notice becomes the banner',
    banner && banner.title.startsWith('Weekend Update'), banner && banner.title);
ok('parsed notice is active today', isAnnouncementActive(homepageItems[0], NOW));
ok('parsed notice expires on 11/02', isAnnouncementActive(homepageItems[0], day('2026-11-02')) === false);

// ── 汇总 ──────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
