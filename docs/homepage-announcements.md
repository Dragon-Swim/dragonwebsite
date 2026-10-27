# 主页消息（News & Announcements）

主页（`src/pages/home.js`）有两处显示近期消息：

| 位置 | 说明 |
|---|---|
| **顶部横幅** | 导航栏正下方、Hero 之上。只显示**一条**置顶消息（`pinned: true`）。红色 = `urgent`，金色 = 其他。家长可以点 ✕ 关掉，关闭状态存在浏览器里。 |
| **`#news` 区块** | Hero 之后。列出所有**当前有效**的消息，最新的在前。Hero 上的 `📰 News` 卡片就是这个区块的入口，有消息时卡片右上角会亮一个小红点。 |

**内容不在代码里**（2026-10-27 起）。消息存在 Firestore 的 `announcements` 集合，
**只有 admin 能发**：dashboard → 侧边栏 **Announcements**（`dashboard.html`，admin 才有这个入口）。
发布后**不需要 build、不需要部署**，家长下次打开主页就能看到。

## 怎么发一条消息

1. 用 admin 账号登录 → dashboard → 左侧 **Announcements**
2. 填表单（见下面的字段表），右边 **Preview** 会实时显示横幅和卡片长什么样
3. 点 **Publish** —— 列表里出现一条 `LIVE`，主页即生效

| 字段 | 必填 | 说明 |
|---|---|---|
| **Title** | ✅ | 标题，≤ 120 字符。 |
| **Body** | ✅ | 正文，**一行 = 一段**。横幅只显示**第一段**，完整内容在 `#news` 卡片里。≤ 4000 字符。 |
| **Level** | ✅ | `Info (gold)` / `Urgent (red)`。红色更醒目，用于停课这类通知。 |
| **Show from** | ✅ | 开始显示的日期（默认今天）。填未来日期 = **预约发布**，到那天自动出现。 |
| **Until** | | 失效日期（含当天）。过了自动从主页消失；**空 = 一直显示**。 |
| **Pin to the top banner** | | 勾上 = 上顶部横幅。**全局只允许一条**：勾选并保存时，其他消息的置顶会被自动取消。 |

发布后的几个行为：

- **改错字**：在列表里点 **Edit** → 改 → Save。**文档 id 不变**，所以已经关掉横幅的家长
  不会再看一遍（见下面 `id` 的说明）。
- **想让大家重新看一次**：不要改旧的那条，新建一条（新 id = 新的横幅）。
- **撤下**：Delete，或把 `Until` 改成昨天。
- **预约下周的通知**：`Show from` 填下周的日期，其余照填，今天就能先存好。
- 每条消息都记了 `createdBy` / `updatedAt` / `updatedByEmail`，列表里显示 "edited by …"，
  多人共用一个 admin 账号时也能看出是谁改的。

## 字段（Firestore `announcements/{docId}`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | string | 必填，≤ 120。 |
| `body` | string | 必填，≤ 4000。一行 = 一段。 |
| `level` | string | `'info'` \| `'urgent'`。 |
| `pinned` | boolean | true = 上顶部横幅（多条时取 `date` 最新的一条，但前端保存时已保证只有一条）。 |
| `date` | string | `'YYYY-MM-DD'`，开始显示日期。 |
| `until` | string \| null | `'YYYY-MM-DD'`，失效日期（含当天）；`null` = 永久。 |
| `createdAt` / `createdBy` / `createdByEmail` | | 首次写入。 |
| `updatedAt` / `updatedBy` / `updatedByEmail` | | 每次保存覆盖。 |

**文档 id 就是前端的 `id`** —— 家长"关掉横幅"的记忆是按它记的（`localStorage`
`dragon.home.banner.dismissed.v1`）。所以改正文不会让横幅重弹；要重弹就新建文档。

## 为什么这样实现（改之前先读）

1. **日期用字符串，不用 Timestamp。** 比较的是**本地时区的 `YYYY-MM-DD`**。用 Timestamp
   配合 `toISOString()` 会在晚上把日期推到第二天（美国东部 20:00 之后就是 UTC 次日）。
2. **主页不引 Firebase SDK。** 主页入口包只有 ~20 KB；引 `firebase/firestore` 会多 ~150 KB gzip。
   改为直接调 Firestore REST：
   ```
   GET https://firestore.googleapis.com/v1/projects/dragonwebsite-db/databases/(default)/documents/announcements?pageSize=50&key=<Web API key>
   ```
   公开读（规则 `allow read: if true`）+ CORS 已实测可用。编辑器在 dashboard 里用 SDK 写。
3. **规则里不写 `get()` / `exists()`。** 规则里的每次 `get()` 都是一次计费读，而首页每次访问都会读。
   现在的规则是纯布尔判断，一次访问 = 公告条数次读。
4. **缓存 = stale-while-revalidate。** 上次成功的结果存 `localStorage`
   （`dragon.home.announcements.v1`），回访者立刻看到横幅；同时静默重拉一次，有更新就重画。
   拉取失败（断网、广告拦截、配额）→ 安静退回缓存；没有缓存就什么也不显示，不报错。
5. **第一次访问横幅会晚 ~300 ms 出现**（没有缓存时才这样），用淡入处理，避免页面内容被顶下去。
   这是"不把静态内容烘进包里"的代价 —— 换来的是改消息不用部署。

## 排障

| 现象 | 检查 |
|---|---|
| 主页没有横幅 | 列表里那条是不是 `PINNED`？日期窗口对不对（`Show from` 是未来 / `Until` 已过）？ |
| 改了消息主页没变 | 强制刷新（Ctrl+F5）。主页每次加载都会重拉，但**当前这个页面**里不会自动更新。 |
| 编辑器报 `Missing or insufficient permissions` | 账号不是 admin。规则只允许 `users/{uid}.role == 'admin'` 写。 |
| 编辑器列表是空的 | 集合里确实没有文档。用 `node execution/data-admin/seed_announcements.mjs` 灌一条。 |
| 主页横幅内容对、但 News 区块空 | 正常：`#news` 只列**当前有效**的消息，过期的自然不显示。 |

## 相关文件

| 文件 | 作用 |
|---|---|
| `src/data/announcements.data.js` | 纯逻辑：显示窗口、排序、横幅选择、状态（live/scheduled/expired）。无内容。 |
| `src/data/announcements.remote.js` | Firestore REST 读取、字段解码、`localStorage` 缓存。 |
| `src/components/news.js` | 横幅 / 列表 / 卡片的渲染、关闭记忆、`paintNews()` 重画。 |
| `src/components/announcementAdmin.js` | dashboard 的编辑器（表单 + 预览 + 列表）。 |
| `src/pages/home.js` | 先画缓存，`fresh` 到了再 `paintNews()`。 |
| `src/pages/home.css` | `.news-banner` / `.news-card` / `.hfc-dot` 样式。 |
| `firestore.rules` | `announcements`：公开读、admin 写、字段长度校验。 |
| `execution/data-admin/seed_announcements.mjs` | 命令行写入（首次启用 / 灾难恢复）。 |
| `tests/unit/verify-announcements.mjs` | 显示窗口 + REST 解码的单元检查。 |
| `tests/announcements.spec.js` | 编辑器 E2E（发布 / 就地编辑 / 置顶唯一 / 删除 / 教练看不到入口）。 |

## 成本

Firestore Spark（免费）计划：每天 5 万次文档读。主页每次访问读 N 条（N = 集合里文档数，
通常 2–4），**全队量级每天约几百到一千次读，占免费额度几个百分点**。写只有 admin 发消息时发生。
本项目 `billingEnabled = false`，**没有绑支付方式，不可能产生费用**；超限的表现是当天读请求被拒，
主页退回缓存，第二天自动恢复。
