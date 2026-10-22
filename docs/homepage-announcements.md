# 主页消息（News & Announcements）

主页（`src/pages/home.js`）有两处显示近期消息：

| 位置 | 说明 |
|---|---|
| **顶部横幅** | 导航栏正下方、Hero 之上。只显示**一条**置顶消息（`pinned: true`）。红色 = `urgent`，金色 = 其他。家长可以点 ✕ 关掉，关闭状态存在浏览器里。 |
| **`#news` 区块** | Hero 之后。列出所有**当前有效**的消息，最新的在前。Hero 上的 `📰 News` 卡片就是这个区块的入口，有消息时卡片右上角会亮一个小红点。 |

内容全部在 **`src/data/announcements.data.js`**，改消息只改这一个文件，不用动 `home.js` / CSS。

## 字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | 唯一标识。**别改已发布消息的 id** —— 家长关掉横幅的状态按 id 记录，换 id 会让横幅重新弹出来（如果改了正文、确实想让大家再看一次，那就换 id）。 |
| `date` | ✅ | 发布日期 `YYYY-MM-DD`。到了这天才会出现。 |
| `until` | | 失效日期 `YYYY-MM-DD`（含当天）。过了这天**自动消失**，不用回来删。不填 = 一直显示。 |
| `level` | | `'urgent'`（红色强调）/ `'info'`（默认）。 |
| `pinned` | | `true` = 上顶部横幅。同时有好几条 `pinned` 时取 `date` 最新的那条。 |
| `title` | ✅ | 标题。 |
| `body` | ✅ | 正文，**一行 = 一段**。横幅只显示第一段，完整内容在 `#news` 区块。 |
| `link` | | 可选按钮：`{ label: 'View meet info', href: 'https://...' }`。外链会自动加 `target="_blank"`。 |

## 常见操作

**发一条紧急通知（上横幅）**

```js
{
    id: 'dulles-south-weekend-2026-10-24',
    date: '2026-10-22',
    until: '2026-10-25',
    level: 'urgent',
    pinned: true,
    title: 'Weekend Update: No Dulles South Training, Oct 24–25',
    body: `第一段会被放进横幅,写最关键的事实。

第二段在 News 区块展开。`,
}
```

**发一条普通公告（不上横幅）** —— 同上，但 `pinned: false` 或干脆不写 `pinned`。

**下线一条消息** —— 两种都行：
- 从 `ANNOUNCEMENTS` 数组里删掉；
- 或把 `until` 改成过去的日期（不用等下次部署就自动隐藏）。

**提前发布** —— `date` 写未来日期，到那天自动出现。

## 注意事项

- 日期比较用的是**本地时区**的 `YYYY-MM-DD`（不是 UTC），所以美国深夜不会提前一天消失。
- 关闭状态存在 `localStorage` 的 `dragon.home.banner.dismissed.v1`，只保留最近 20 个 id。想整体重置（让所有被关掉的横幅重新出现），把这个 key 末尾的版本号改一下即可。
- 消息是静态数据，**新增/修改后需要重新 build + deploy** 才会在线上生效（和 `seasonSchedule.data.js`、`timeStandards.data.js` 一样）。如果以后想让教练不用部署就能发消息，可以把 `announcements.data.js` 换成 Firestore 集合（读的地方只有 `src/components/news.js`，换起来不用动布局）。
- 相关文件：
  - `src/data/announcements.data.js` —— 内容 + 过期逻辑
  - `src/components/news.js` —— 横幅 / 列表渲染、关闭记忆
  - `src/pages/home.css` —— `.news-banner` / `.news-card` / `.hfc-dot` 样式
  - `src/utils/i18n.js` —— `news_*` 文案
