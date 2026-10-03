# Meet Management（教练端比赛管理）工作流说明

> 目的：说明教练端「Meet Management」tab 的数据模型、增删改口径，以及**这个页面最容易被
> 踩坏的一条约束**——整个视图会被实时快照重建，所以屏幕上那个表单是"临时"的。
> 最后更新：2026-10-03（新增 `meetFormDraft`，复盘"meet 标题改不了"；源码 `a25555e`/`a65a118`，
> gh-pages 部署 `a2958f7`）。
> 相关代码：`src/pages/dashboard.js`（`renderSwimMeets` / `renderCurrentView` / `bindEvents` 的
> Meet Management 段、`getMeetDisplay`、`getMeetSeason`、`getSeasonOptions`）、
> `src/pages/dashboard.css`（`#add-meet-form` 的 `scroll-margin-top`）、
> `src/utils/i18n.js`（`dash_meets_*`）、`firestore.rules`、`execution/data-admin/add_meet.mjs`、
> `tests/meet-edit.spec.js`（E2E）。费用/押金见 `docs/meet-fees.md`，工时见 `docs/volunteer-hours.md`。

## 1. 口径（先读这一节）

| 问题 | 决定 |
|---|---|
| 谁能改 | **仅 admin**：`dbRole === 'admin'` 时才渲染 Add / Edit / Delete / Fee 按钮，`firestore.rules` 里 `meets` 的 `create, update, delete` 同样 `if isAdmin()`。普通教练只读 |
| 表单写哪 6 个字段 | `name`、`startDate`、`endDate`、`location`、`season`、`sourceUrl`（编辑=一次 `updateDoc` 全量写回；新建额外写 `status:'Open'` 与 `createdAt`） |
| 比赛归哪个赛季 | `meet.season` 优先，缺失则按 `startDate` 推（`getMeetSeason` → 9 月切季） |
| 卡片上的 Upcoming / In Progress / Completed | **按日期现算**（`getMeetDisplay`），不读也不信任 `status` 字段。表单里没有 `status` 输入框 |
| 日期类型 | `startDate` / `endDate` 都是 `YYYY-MM-DD` 字符串（`<input type="date">`），不做时区换算 |
| 数据来源 | ① 教练端这个表单；② `execution/data-admin/add_meet.mjs`（从 PVS 赛程 PDF 抽字段写入，`--update <docId>` 可改已有文档，同样只覆盖传入字段） |
| 删除的连带影响 | 删 meet 时同一个处理器会删掉该 meet 的 `volunteerHours` 文档（见 `docs/volunteer-hours.md` §6）；`feeData` 随文档一起消失 |

## 2. 数据模型

集合 `meets`，`docId` 为自动 id：

```js
{
  name: "PVS October Open",
  startDate: "2026-10-09", endDate: "2026-10-11",
  location: "Claude Moore Recreation Center",
  season: "2026-2027",              // 9 月切季,与 deposits / volunteerHours 同一套
  status: "Open",                   // 仅新建时写入;显示不用它
  sourceUrl: "https://…/27-07-ma.pdf", // 可空
  createdAt: <Date | serverTimestamp>, // ⚠️ orderBy 需要它,缺了文档不会出现在列表里
                                       //    表单写客户端 new Date(),add_meet.mjs 写 serverTimestamp
  feeData: { … }                    // 费用弹窗单独写,本 tab 不动(见 docs/meet-fees.md)
}
```

- `updatedAt` 只有 `add_meet.mjs --update` 会写；教练端表单不写（所以"最后改动时间"在两条路径上不一致，排查时别只看它）。
- **改名是安全的**：费用与工时都按 `meetId` 关联，不看名字。`volunteerHours` 里存了 `meetName` 快照，
  但读取时**meet 存在就用实时名字**（`docs/volunteer-hours.md` §2.3）。

## 3. 界面（教练端侧栏 → 🏁 Meet Management）

```
[赛季 ▾]                                            [+ Add Meet]
── 表单(默认隐藏;Add 或卡片 Edit 时展开,由 meetFormDraft 决定)
   Edit Swim Meet / New Swim Meet
   Meet Name | Start Date | End Date | Location | Meet link (optional) | Season
   [Update Meet / Save Meet] [Cancel]
   失败信息显示在表单里(不是 alert)
── Upcoming Meets (n)  → 卡片:名称 / 徽章 / 📅 起止 / 📍 地点 / 🔗 Meet Page
                          [Fee] [Edit] [Delete]
── Past Meets (n)       → 同上,倒序
```

- 表单**没有** `status`、`feeData` 字段；日期徽章由日期决定，与表单无关。
- 校验：`name`、`startDate`、`endDate` 三者缺一 → 表单内提示，不写库。
- 保存成功 → 关闭表单并重渲染（快照也会再渲染一次）。
- 每个字段都有可见 `<label>`（2026-10-03 之前只有 placeholder，填上字之后就分不清哪格是标题）。

## 4. ⚠️ 核心约束：这个视图会被实时快照整体重建

`initDataListeners()` 里 6 个 `onSnapshot`（meets / sessionSlots / enrollments / registrations /
deposits / volunteerHours）统统调 `refreshUI()` → `renderCurrentView()` → `app.innerHTML = …`，
**整页 DOM 重建**。也就是说：

> 屏幕上那个表单是临时的。任何"正在输入"的内容必须同时存在于**模块变量**里，否则：
> 别人一写数据（另一个管理员、家长报名、工时自动保存、费用导入）就会把表单关掉、把你打了一半的
> 内容丢掉，而且**界面不会有任何提示**。

现在的做法（`meetFormDraft` + `editingMeetId`）：

| 环节 | 代码 | 作用 |
|---|---|---|
| 渲染 | `renderSwimMeets()` | 有 `meetFormDraft` 才 `display:block`，并用 draft 回填 `value`；按钮文案按 `editingMeetId` 显示 Save / Update |
| 重建前 | `captureMeetFormDraft()` | 把打开的表单从 DOM 读回 draft；表单是隐藏的就返回 `null`（**不覆盖**现有 draft） |
| 重建后 | `captureMeetFormFocus()` / `restoreMeetFormFocus()` | 光标与选区放回原来那一格（和志愿小时那处的 `captureVolunteerFocus` 同一手法） |
| 收尾 | `closeMeetForm()` | **先清 draft 再隐藏 DOM**：只隐藏的话，下一次 render 会拿 DOM 里那份把它"救回来" |
| 打开 | `openMeetForm()` | 先隐藏屏幕上已有表单再设 draft，否则重建前的捕获会读到旧表单的值 → 把 A 的字段存进 B |

给后来者的三条规矩：

1. 新增任何"就地编辑"的表单，照抄这个模式（或直接做成 append 到 `document.body` 的弹窗，像费用弹窗那样天然不受重建影响）。
2. **不要**只 `console.error` 就完事——保存失败必须显示在表单里（见第 6 节）。
3. **不要**用 `alert()` 做常规校验，弹窗会打断也更难测；表单内提示可测、可截图。

## 5. 布局坑：sticky 顶栏会吃掉标题行

`.dash-topbar` 是 `position:sticky`，高约 95px（手机约 79px）。表单打开时会
`scrollIntoView()`，把表单顶边贴到视口顶部——于是**第一行（Meet Name）被顶栏压住**，
日期/地点点得到、标题点不到。修法是 CSS 一行：

```css
/* src/pages/dashboard.css */
#add-meet-form { scroll-margin-top: 8rem; }
```

`tests/meet-edit.spec.js` 里第三个用例就是用一个 600px 高的窗口 + 6 场比赛，验证"从页面下方点
Edit 之后标题框仍然可点"（Playwright 点到被别人盖住的元素会直接失败）。

## 6. 2026-10-03 复盘：「这个 meet 的标题改不了」

| | |
|---|---|
| 症状 | 教练点 Edit 改一场 meet，地点/日期能改，标题改不动；Firestore 里 `name` 始终是旧值，其它字段是新的 |
| 第一轮排查 | 干净环境下**改得动**：E2E 用例、截图、`elementFromPoint` 全部正常 → 说明不是"没有这一格" |
| 复现 | 打开 Edit 表单、先打标题，再让**另一个写入者**改 `meets` → 表单被关掉、输入框清空、`editingMeetId` 还在 |
| 根因 | 第 4 节那条：整页重建把表单吞了。教练先打标题、随后只改细节再保存 → 旧标题被写回，看起来就是"标题改不了" |
| 修法 | `meetFormDraft` 草稿化 + 光标恢复；保存失败显示在表单里；字段加可见 label；`scroll-margin-top` |
| 验证 | `tests/meet-edit.spec.js`（改名往返 / 编辑中并发写入不丢 / 滚动后标题可点）+ 全量 `npm test` 22/22 |

## 7. 测试约定（重要，已踩过）

| 约定 | 原因 |
|---|---|
| fixture 的**名字**也要唯一，不能只保证 docId 唯一 | 每个页面的 `onSnapshot` 监听**整个集合**，两个测试用同名 + 同日期比赛时会互相看到：点 Edit 可能点到对方的卡片，志愿小时 tab 的"默认最近一场"也可能选中对方那场 |
| 不要用 `seq++` 生成 id | Playwright 把同一个 spec 文件的用例分到不同 worker 进程，每个进程的计数器都从 0 开始 → 同毫秒 + 同序号 = 同一个 docId，互相删对方 fixture。用 `Date.now() + Math.random().toString(36).slice(2,8)` |
| 断言"我这一场"时要显式选中 | 志愿小时 tab 用 `page.selectOption("#volunteer-meet-select", meetId)`，别依赖默认选中 |
| 共享 emulator 下点击可能被重建吞掉 | 写入断言请用 `expect.poll` 重试点击（见 `saveMeetAndExpect`），但**断言仍然是最终文档状态**，不要放宽标准 |

```powershell
npm run test:unit        # 纯逻辑,不要 emulator
npm test                 # 端到端(启动 auth + firestore emulator 与 dev server)
npm run build            # 需要 .env.local 存在,否则白屏
node execution/data-admin/add_meet.mjs --name "…" --start … --dry-run   # 只打印
```

`docs/` 不参与 `npm run build`，改文档**不需要**重新部署 gh-pages（改 `src/` 才需要）。

## 8. 待办 / 可选

- 把 Edit 表单改成弹窗（和费用弹窗一致），从结构上避免重建问题，还能顺手支持键盘 Esc 关闭。
- 表单支持手改 `status`（目前徽章只看日期，`status` 形同虚设——要么给字段加编辑，要么删掉它）。
- 把第 4 节这条"实时重建"约束也写进 `CLAUDE.md`（目前只在本文件）。
