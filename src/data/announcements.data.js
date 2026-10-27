/**
 * Homepage Announcements — Dragon Swim Team
 *
 * 这个文件只放**纯逻辑**:一条消息"现在该不该显示"、哪条进顶部横幅、
 * 日期怎么格式化。内容本身不在这里 —— 它存在 Firestore 的 `announcements`
 * 集合里,由有 admin 权限的人在 dashboard → Announcements 里发布
 * (2026-10-27 起;之前是硬编码在这个文件里、改一条要重新部署)。
 *
 * ── 一条消息的字段(与 Firestore 文档一致)───────────────
 *   id     文档 id。家长关掉横幅的状态按它记 → 改正文不会让横幅重弹,
 *          想让大家重新看一眼就 "Publish as new"(新文档 = 新 id)。
 *   date   必填。开始显示日期 'YYYY-MM-DD'。到这天之前不显示。
 *   until  选填。失效日期 'YYYY-MM-DD'(含当天)。过了自动消失;空 = 一直显示。
 *   level  'urgent'(红色强调)/ 'info'(默认)。
 *   pinned true = 上顶部横幅(多条时取日期最新的那条)。
 *   title  标题。
 *   body   正文,一行 = 一段。横幅只显示第一段,完整内容在 #news 区块。
 *
 * 为什么日期用字符串而不是 Timestamp:比较用的是**本地时区的 YYYY-MM-DD**,
 * 用 Timestamp 会在晚上把日期推到第二天(见 toIsoDate 的注释)。
 */

/** 把 Date 转成本地时区的 'YYYY-MM-DD'(不能用 toISOString,那个是 UTC,晚上会差一天)。 */
export function toIsoDate(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** 这条消息在 now 这一天是否应该显示。 */
export function isAnnouncementActive(a, now = new Date()) {
    if (!a) return false;
    const today = toIsoDate(now);
    if (a.date && today < a.date) return false;   // 还没到发布日
    if (a.until && today > a.until) return false; // 已过期
    return true;
}

/** 所有当前有效的消息,按发布日期倒序(最新的在前)。 */
export function getActiveAnnouncements(list, now = new Date()) {
    return (Array.isArray(list) ? list : [])
        .filter((a) => isAnnouncementActive(a, now))
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

/** 顶部横幅要显示的那一条:有效的 pinned 消息里日期最新的;没有则返回 null。 */
export function getBannerAnnouncement(list, now = new Date()) {
    return getActiveAnnouncements(list, now).find((a) => a.pinned === true) || null;
}

/** '2026-10-22' → 'Oct 22, 2026' */
export function formatAnnouncementDate(iso) {
    if (!iso) return '';
    const d = new Date(`${iso}T12:00:00`); // 中午,避开时区把日期推前/推后一天
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** 一条消息现在的状态(编辑器列表用)。 */
export function announcementStatus(a, now = new Date()) {
    const today = toIsoDate(now);
    if (a.until && today > a.until) return 'expired';
    if (a.date && today < a.date) return 'scheduled';
    return 'live';
}
