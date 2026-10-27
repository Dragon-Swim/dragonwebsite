/**
 * Homepage Announcements — Dragon Swim Team
 *
 * 主页"置顶消息"的唯一内容来源。**改消息只改这个文件**,不用动 home.js / CSS。
 *
 * ── 一条消息的字段 ────────────────────────────────────────────
 *   id     必填。唯一标识,别随便改 —— 家长关掉横幅的状态是按 id 记的,
 *          改了 id 已关闭的横幅会重新弹出来(改了正文想让大家再看一次,就换个 id)。
 *   date   必填。发布日期 'YYYY-MM-DD'。到了这天才会显示,列表里也按它倒序排。
 *   until  选填。失效日期 'YYYY-MM-DD'(含当天)。过了这天自动从主页消失,
 *          不需要回来手动删除。不填 = 一直显示。
 *   level  选填。'urgent' = 红色强调 + 横幅置顶;'info'(默认)= 普通公告。
 *   pinned 选填。true = 在页面顶部横幅里置顶显示(多条时取日期最新的一条)。
 *   title  必填。标题。
 *   body   必填。正文,一行 = 一段。横幅只显示第一行(第一段),完整内容在 News 区块。
 *   link   选填。{ label, href } 底部按钮,例如 { label: 'View meet info', href: '...' }。
 *
 * ── 删掉一条消息 ──────────────────────────────────────────────
 *   要么把整条从数组里删掉,要么把 until 改成过去的日期(不重新部署也会自动消失)。
 */

export const ANNOUNCEMENTS = [
    {
        id: 'claude-moore-weekend-2026-10-31',
        date: '2026-10-27',
        until: '2026-11-01',
        level: 'urgent',
        pinned: true,
        title: 'Weekend Update: No Claude Moore Training, Oct 31 – Nov 1',
        body: `There is no training at Claude Moore this Saturday and Sunday (10/31 & 11/1) — the facility is closed for the weekend.

Tysons and Dulles South keep their regular weekend practices. Swimmers who would like to swim there instead are welcome; please let your coach know in advance so we can plan lane space.`,
    },

    // ── 示例:普通公告(不置顶横幅,只出现在 News 列表里)──────────────
    // {
    //     id: 'example-winter-registration-2026-11',
    //     date: '2026-11-01',
    //     until: '2026-11-30',
    //     level: 'info',
    //     pinned: false,
    //     title: 'Winter Season Registration Is Open',
    //     body: `Winter season runs Nov 10 – Feb 17.
    // Sign in to the dashboard to register your swimmers.`,
    // },
];

/** 把 Date 转成本地时区的 'YYYY-MM-DD'(不能用 toISOString,那个是 UTC,晚上会差一天)。 */
function toIsoDate(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** 这条消息在 now 这一天是否应该显示。 */
export function isAnnouncementActive(a, now = new Date()) {
    const today = toIsoDate(now);
    if (a.date && today < a.date) return false;   // 还没到发布日
    if (a.until && today > a.until) return false; // 已过期
    return true;
}

/** 所有当前有效的消息,按发布日期倒序(最新的在前)。 */
export function getActiveAnnouncements(now = new Date()) {
    return ANNOUNCEMENTS
        .filter((a) => isAnnouncementActive(a, now))
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

/** 顶部横幅要显示的那一条:有效的 pinned 消息里日期最新的;没有则返回 null。 */
export function getBannerAnnouncement(now = new Date()) {
    return getActiveAnnouncements(now).find((a) => a.pinned === true) || null;
}

/** '2026-10-22' → 'Oct 22, 2026' */
export function formatAnnouncementDate(iso) {
    if (!iso) return '';
    const d = new Date(`${iso}T12:00:00`); // 中午,避开时区把日期推前/推后一天
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
