# Meet Entries（家长自助报名 / 教练审核）工作流说明

> 目的:说明「家长按项目报名 → 教练确认 → 导出给 meet director」这条链路的数据模型、
> 规则引擎、界面约束和已知取舍。
> 最后更新:2026-10-28(首个上线 meet:Riley Eaton Holiday Invitational,PVI-27-41,
> 12/10–12/13,报名截止 12/1 20:00 ET)。
> 相关代码:`src/utils/meetEligibility.js`(纯逻辑)、`src/components/meetEntries.js`(弹窗)、
> `src/pages/dashboard.js`(`renderSwimMeets` 的 Entries 按钮 / `collectEntrySwimmers`)、
> `execution/meet-entry/parse_pvs_meet_pdf.py`(赛程单 → 项目表)、
> `execution/data-admin/add_meet.mjs --from-json`(写入)、`firestore.rules`(`meets/{id}/entries`)。
> 测试:`tests/unit/verify-meet-eligibility.mjs`、`tests/meet-entries.spec.js`。

## 0. 2026-10-28 定下的口径(先读这一节)

| 问题 | 决定 |
|---|---|
| 谁能报 | 家长(自己孩子)+ 教练(任何人)。两条路走同一份数据 |
| 报名前提 | **必须有 USA Swimming ID**。没有 ID 的孩子不能报,列表里单独提示 |
| 教练要不要确认 | 要。家长提交后是 `submitted`,教练确认才 `confirmed` |
| 达标检查 | **只提醒,不拦截**。库里的成绩可能滞后于泳池 |
| 查不到成绩 | 允许报,但必须手填 seed time(meet 不收 NT),并标 `source: manual` 待教练核实 |
| Open 项目 | 显示但折叠、默认不选 |
| 接力 | v1 不做家长报接力,教练线下定 |
| 费用 | **不做**。报名费照旧等 Hy-Tek 费用单回来对账(`feeData`) |
| 截止后 | 家长只读,教练仍可改 |
| 提醒 / 队内报名人数 | v1 不做 |

## 0.1 上线开关(2026-10-28 追加)

家长端**代码已完成但默认关闭**,只给教练/管理员用:

```js
// src/pages/dashboard.js → renderSwimMeets()
const canEnter = userRole === 'coach';
const showEntries = hasEvents && (canEnter || meet.entriesOpenToFamilies === true);
```

- 默认(没有 `entriesOpenToFamilies` 字段)→ **家长看不到按钮**,教练看得到。
- 要开给某一场:给那场 meet 文档加 `entriesOpenToFamilies: true`(教练端表单没有这个字段,
  用 `add_meet.mjs --update <docId>` 或控制台改),**不需要重新部署**。
- 开之前先确认那场 roster 的 USA Swimming ID 补齐了 —— 没有 ID 的孩子根本报不了
  (规则见 §0)。2026-10-28 时全队 61 人里还有 29 人没 ID。
- 反向回滚同样是一条数据操作:删掉该字段即可。
- `tests/meet-entries.spec.js` 里有 guard 用例:没有该字段的 meet,家长看不到按钮。


## 1. 数据模型

### 1.1 比赛文档 `meets/{meetId}` 追加的字段

`add_meet.mjs --from-json` 一次写入(教练端 Edit 表单只 `updateDoc` 那 6 个字段,
`updateDoc` 是合并语义,**不会**冲掉这些):

```js
{
  entryDeadline: "2026-12-01T20:00:00-05:00",
  entryFeePerEvent: 11,
  limits: { maxEvents: 6, maxPerDay: 3 },
  qualifyingPeriodStart: "2024-10-01",
  ageDeterminedOn: "2026-12-10",
  courses: ["SCY", "LCM"],
  sessions: [{ id:"fri-am", date:"2026-12-11", day:"Fri", kind:"prelim",
               warmup:"6:30–8:00 AM", start:"8:05 AM", audience:"13-14 / Open" }],
  events: [   // ⚠️ 平铺行:项目 × 年龄组 × 性别
    { eventNo:19, gender:"F", ageGroup:"13-14", distance:100, stroke:"BR",
      ageMin:13, ageMax:14, openToAll:false,
      relay:false, sessionId:"fri-am", standards:{ SCY:76.69, LCM:82.99 } }
  ]
}
```

**`ageMin`/`ageMax`/`openToAll`（2026-10-29 起由 `.ev3` 导入）**：判断"这个年龄能不能报"
**只看这三个字段**，`ageGroup` 仅用于显示。因为每场比赛的年龄分区都不一样：

| 比赛 | 分区 |
|---|---|
| 27-41 RMSC | `10&U`(0-10) / `11-12` / `12&U`(0-12) / `13-14` / `Open`(15-109, **openToAll**) |
| 27-29 PV Nov Open | `9-10` / `11-12` / `13-14` / `Open`(15-109, openToAll) + 混合项目(`gender:"X"`) |
| 27-21 Loughmiller | `8&U`(0-8) / `9-10` / `11-12` / `13&O`(13-109, **不是** openToAll) |

`openToAll` 对应赛程单原文 "open events which are open to all ages" —— PVS 的 Open 组在 `.ev3` 里
编码成 `15-109`（颁奖按 15+ 算），但报名对任何年龄开放，所以**不能只靠数字推**；
Loughmiller 的 `13-109` 则是真的"13 岁及以上"。老文档没有这三个字段时，
`isEventEnterable()` 自动回退到旧的标签白名单，线上已有数据不受影响。

**年龄怎么算**：按**比赛第一天**该选手的年龄（27-41 赛程单原文
"Swimmers will compete at the age attained on the first day of the meet"）。落库字段是
`ageDeterminedOn`；`.ev3` 的 `field[4]` 直接给这个日期（四场比赛实测都等于起始日，
但**读字段、不要假设等于首日**）。

两个容易踩的点:

1. **`events` 的每一行不是"一个项目"**。1650/1000 自由泳的 13-14 与 Open 共用同一个
   `eventNo`(赛程单上是合并单元格),所以 PVS 27-41 是 148 个项目号 → **152 行**。
   任何按 `eventNo` 汇总的地方都要先 groupBy,否则会把两个年龄组的达标线搅在一起。
2. **`standards` 可能有一条是 `null`**。10&U / 11-12 的 100 IM 只有 SCY 线,没有 LCM 线;
   接力全部没有 LCM 线。检查时只比较"有线的那个 course"。

### 1.2 报名记录 `meets/{meetId}/entries/{familyId}__{USA_ID}`

一个孩子一份文档(不是一家一份):夫妻同时改不会互相覆盖,教练审批也按人走。

```js
{
  meetId, familyId, usaSwimmingId, swimmerName,
  ageAtMeet: 12, ageGroup: "11-12", gender: "F",     // 快照,防止家长改名后对不上
  status: "draft" | "submitted" | "confirmed" | "declined",
  events: [{
    eventNo: 34, ageGroup: "11-12", distance: 100, stroke: "FR",
    sessionId: "fri-pm", day: "2026-12-11",
    course: "SCY", seedTime: "57.92", seedSeconds: 57.92,
    source: "db" | "manual", proofDate: "2026-10-24",
    standard: 63.09, qualifies: true
  }],
  note: "", coachNote: "", submittedAt, confirmedAt, updatedAt, updatedBy
}
```

**docId 用 USA Swimming ID 而不是数组下标**:`registrations.swimmers[]` 是数组,下标会随
增删孩子而移动;USA ID 不会。代价是——如果家长把 ID 改错后更正,旧文档会成为孤儿
(按名字能看出来),教练重新报一次即可。

## 2. 规则引擎(`src/utils/meetEligibility.js`)

纯函数,无 DOM / 无 Firestore,`tests/unit/verify-meet-eligibility.mjs` 用真实达标线覆盖。

| # | 规则 | 实现 | 拦截级别 |
|---|---|---|---|
| 1 | 年龄按 **比赛第一天** 算 | `ageOnDate(dob, meet.ageDeterminedOn)` | 自动 |
| 2 | 只能报本组 + 12&U(10&U/11-12)+ Open(Open 折进可选区块) | `isEventEnterable`(数值) / `enterableGroupsForAgeGroup`(老文档兜底) | 自动 |
| 3 | 达标线按**同一 course** 比较,`秒数 ≤ 线` | `evaluateEvent` | 软提醒 |
| 4 | 没有成绩 → 必须手填 seed time | `validateSelection` → `missing-seed-time` | **硬拦截** |
| 5 | 成绩须在达标期内(默认 2024-10-01 之后) | `buildBestTimesIndex` 的 `qualifyingPeriodStart` | 自动过滤 + 说明 |
| 6 | 最多 6 项 / 每天最多 3 项 | `validateSelection` | **硬拦截**(客观无效) |
| 7 | 12&U 每天一个预赛场次 | 结构上自动满足(11-12/10&U 永远是下午场) | — |
| 8 | bonus 名额(1-2 达标→2 个,3-5→1 个,6→0) | `bonusAllowance`,只在"比线慢"的提醒里带出 | 提示 |
| 9 | 接力只能教练报 | `relay-coach-only` | **硬拦截**(家长端) |
| 10 | Open 项目任何年龄都能报 | 折进 `<details>` 区块、默认收起、永不预选 | 提示(`open-event`) |

**Open 项目的口径**:规则上 10&U / 11-12 / 13-14 都能报 Open(赛程单原文 "own age group
events or in open events which are open to all ages"),所以 `enterableGroupsForAgeGroup`
把 `'Open'` 加进每个人的可报组;但界面上它们被折进
「Open events (optional — any age may enter)」,默认收起、默认不勾选,只有本组不是 Open
的人才需要它,选中时会提示一次。`bonusAllowance` 的计数包含这些 Open 行(达标就算)。

为什么"慢于达标线"只是提醒:2026-10-28 的决定是**库里的成绩可能晚几天**。所以比线慢的
项目仍可提交,系统只在提交前的 `-1` 提醒里说明"只能作为 bonus 项目进(还剩 N 个名额)"。
真正决定权在教练的 `confirmed`。

"没有成绩"不等于"游得慢":`evaluateEvent` 把它单独记为 `state: 'no-time'`,并带上
`staleSeconds`(如果有一份达标期之外的旧成绩),界面才不会假装这孩子没游过。

## 3. 界面

### 3.1 为什么必须是 body 级弹窗

`initDataListeners()` 里每个 `onSnapshot` 都 `refreshUI()` → `app.innerHTML = …`
**整页重建**。报名表如果渲染在那棵树里,任何一次别人写库都会把它吃掉——
这正是 `docs/meet-management.md` §4 记录的"meet 标题改不了"的同一个坑。
所以 `meetEntries.js` 把容器 `append` 到 `<body>`,dashboard 怎么重建都碰不到它。

### 3.2 家长侧

`Meets` tab 的卡片上多一个 `🎽 Entries`(仅当 `meet.events` 存在)。
一个孩子 → 直接进编辑器;多个孩子 → 先选孩子(没有 USA ID 的孩子是一张说明卡)。

每行显示:`#项目号 / 年龄组 项目名 / 你的成绩 + course`,右侧小字是达标线和成绩日期:

```
✅ 57.92 SCY   line 1:03.09 · 2026-10-24      ← 达标
⚠️ 33.10 SCY   line 32.19 · 0.91s slower      ← 有成绩但慢
⚪ No time on record                          ← 库里没有(可直接手填时间)
```

顶部有 `4 / 6 events chosen` 和按天计数 `Fri, Dec 11 2/3`,以及
`Times from our records as of 10/28/2026` 这行小字(诚实告知可能滞后)。

### 3.3 教练侧

同一个弹窗,进的是**名单视图**:搜索框 + 筛选(全部 / 待审核 / 已确认 / 未报)+
每人一行「年龄·组 / 项数 / 状态 / Review|Add」。
点进去就进编辑器,可改任何孩子的项目、可 `Save & confirm` / `Save` / `Mark not swimming` /
`Reopen for edits`。底部提示没有 USA ID 的人有几个。

## 4. 权限(`firestore.rules` → `match /meets/{meetId}/entries/{entryId}`)

| 动作 | 规则 |
|---|---|
| `get` | 教练/admin;本人;配偶(在 `registrations.editors` 里);**文档不存在时也放行** |
| `list` | **只有** 教练/admin |
| `create` / `update` | 教练/admin 随时;家长仅当自己家、且新旧状态都在 `{draft, submitted}` |
| `delete` | 仅 admin |

三条教训:

1. **`list` 不能依赖 `resource.data`**。集合监听时 Firestore 是拿"潜在结果集"评估规则的,
   那里 `resource.data.familyId` 是 undefined,整条查询直接报
   `Property familyId is undefined on object`。所以家长侧**不用监听**,而是按 docId 逐个
   `get`(2 个孩子就 2 次读)。
2. **`get` 一个不存在的文档时 `resource == null`**,此时再去 `get(registrations/$(null))`
   会报 `Null value error`。规则里先 `resource == null` 放行——文档本来就不存在,没有可泄漏的东西。
3. **`confirmed` 之后家长写不进去**。这是"教练审批"能成立的前提;不是靠 UI 把按钮禁用。

## 5. 日常操作

**赛前(现在到 12/1)**
1. 家长在 dashboard → Swim Meets → Entries 里勾项目 → Submit。
2. 教练在 Meet Management → 这场 meet 的 Entries → Review → Save & confirm。
3. 导出的名单暂时还是要人肉录进 Hy-Tek Team Manager(见 §6)。

**赛后**
费用单回来照旧走 `Fee` 弹窗上传(`docs/meet-fees.md`),与本功能无关。

**加一场新 meet**

首选走官方 `.ev3`（主办方的赛程包，机器可读、比 PDF 权威）：

```powershell
# ① 解析赛程包（.ev3 / .hyv / 含两者的 zip）。同一场已经有 PDF 解析结果时，
#    用 --sessions-from 把场次的日期/类型借过来（.ev3 本身不含场次日历）
python execution/meet-entry/parse_hytek_events.py .tmp/meet-entry/<N>-events.zip `
    -o .tmp/<meet>/events.json `
    --sessions-from .tmp/<meet>/pdf-events.json `
    --deadline "2026-12-01T20:00:00-05:00" `   # .ev3 只有日期，具体时刻要照赛程单补
    --source-url "https://www.files.pvswim.org/2627meet/<N>-events.zip"

node execution/data-admin/add_meet.mjs --from-json .tmp/<meet>/events.json --dry-run   # 先看
node execution/data-admin/add_meet.mjs --from-json .tmp/<meet>/events.json             # 新增
node execution/data-admin/add_meet.mjs --from-json .tmp/<meet>/events.json --update <docId>  # 覆盖既有
node execution/data-admin/add_meet.mjs --from-json .tmp/<meet>/events.json --update <docId> --events-only  # 只补项目表
```

**`--events-only`**（2026-10-29 新增）：只写「报名相关」字段（`events`/`sessions`/`limits`/
`entryDeadline`/`entryFeePerEvent`/`ageGroups`/`ageDeterminedOn`/`qualifyingPeriodStart`/
`courses`/`sanction`/`host`/`relayLimitPerClub`/`bonusRule`），**不动**
`name`/`location`/`sourceUrl`/`status`/`startDate`/`endDate`/`season`。
给已有比赛补项目表时用它：主办方 `.ev3` 里的名字和场地常是缩写甚至占位符
（27-29 的 "add your facility"），而人工录入的那份更准确。写完会打印每个字段的 旧值 → 新值。

脚本会打印警告，需要人工补的通常是四类：场次日期（没给 `--sessions-from`）、报名截止的**时刻**、
场地占位符（主办方文件没填完，如 27-29 的 "add your facility"）、以及 `course` 里没识别的码。

PDF 路线保留作交叉核对（`.ev3` 缺项目表或版式特殊时用）：
```powershell
python execution/meet-entry/parse_pvs_meet_pdf.py <赛程单.pdf> -o .tmp/<meet>/pdf-events.json
```
解析脚本自带 6 项自校验(性别配对 / 号码连续 / 秒数区间 / 与决赛表交叉核对),
不过就退出码 1、不产出文件。**不要手改 events.json**——重跑脚本。

## 6. 导出准备（2026-10-29）

`src/utils/meetEntryExport.js` —— 纯函数，只回答三个问题：哪些报名该出去、每条用什么成绩、这份结果合不合法。

### 6.1 成绩必须在导出时重算

`entries.events[].seedTime` 是**家长提交那一刻的快照**。从提交到截止之间选手几乎一定会再游一次，
快照就过期了 —— 而成绩不是装饰：它决定 heat/lane 顺序，也决定这一行还算不算达标（还是只能算 bonus）。
27-41 的截止日（12/1）在 11/6 Loughmiller 和 11/13 PV Nov Open **之后**，
所以"导出时用最新成绩"是常态，不是边缘情况。

`resolveSeedTime()` 的取值顺序：`swimResults` 里达标期内的最好成绩（`source: 'db'`）
→ 报名时手填的值（`source: 'manual'`）→ 都没有则 `missing`，该行不能进入队文件。
它复用家庭端同一套原语（`buildBestTimesIndex` + `evaluateEvent`，含比赛的 `qualifyingPeriodStart`），
所以确认稿上的数字与家长当时看到的数字同源，除非之后有更快的一游。

快照值仍保留在行上（`storedSeedSeconds`），确认稿可以并排显示"家长看到多少 / 现在提交多少"。

### 6.2 只有 `confirmed` 进导出

`draft` / `submitted` / `declined` 一律不出，但**必须报出来** ——「还有 7 家没确认」是教练发信前
必须看到的事实，静默导出 26/33 人就是把孩子漏在比赛之外。

### 6.3 校验（`validateExport`）

| 级别 | 条件 |
|---|---|
| **error** | 没有 seed time（meet 不收 NT） |
| **error** | 没有 USA Swimming ID（入队文件靠它认人） |
| **error** | 超过 `limits.maxEvents` / `limits.maxPerDay` —— **导出时重算**，不信报名时那次 |
| warning | 有未确认的报名 |
| warning | 有成绩被刷新（附前后对比） |
| warning | 有只能算 bonus 的行（比达标线慢） |

### 6.4 工作表 CSV（`toWorksheetCsv`）

16 列，每个单元格加引号，行尾 CRLF，文件带 UTF-8 BOM（否则 Excel 在中文 Windows 上会乱码）。
其中 `Changed` 列专门放 `1:12.53 → 1:11.03` 这种前后对比，`Time source` 区分"我们的记录 / 手填"。

### 6.5 还没做

给家长的确认稿（打印页）和 SDIF v3 `.cl2` writer 都还没做 —— 两者都建立在这一层的输出之上
（见 `docs/meet-entry-export-feasibility.md` §7）。

## 7. 未做 / 下一步

- **导出**:组行 / 成绩重算 / 工作表 CSV 已完成(见 §6)。还差**给家长的确认稿打印页**和
  **SDIF v3 `.cl2` writer**,路线见 `docs/meet-entry-export-feasibility.md` §7。
- **`.hy3` 入队文件**:暂不做。格式无公开规范,出错代价是整场报名被拒。
  ⚠️ 2026-10-29 更正:真正该做的是 **`.cl2`(= SDIF v3,有公开规范、无校验码)**,
  `.hy3` 才是无规范的那个。评估与证据见 `docs/meet-entry-export-feasibility.md`。
- **接力**:目前只在家长界面显示"由教练安排",教练端也没有排棒次的界面。
- **bonus 自动判定**:现在只提示"还能用 N 个 bonus",不校验实际用了几个。
- **提醒**:没有邮件/站内通知,教练需要自己看 `Submitted` 筛选。
- **`swimmerId` 迁移**:用 USA ID 当键的代价见 §1.2;要根治还是得给每个 swimmer 一个
  稳定 id(`registrations.swimmers[].swimmerId`),那要同时改注册表单和迁移脚本。

## 8. 测试约定

```powershell
npm run test:unit   # verify-meet-eligibility.mjs(106 项,真实 27-41 数据)
                    # + verify-meet-entry-export.mjs(57 项:成绩重算/挡下原因/CSV)
npm test            # 含 meet-entries.spec.js(家庭提交 / 手填成绩 / 无 ID / 截止 / 教练确认)
```

E2E 的两个坑(都已踩过):

- **fixture 的 USA ID 必须每个用例唯一**。整个 suite 共用一个 emulator、多个 worker 并行,
  固定 ID 会让一个用例把另一个用例的 `swimResults` 删掉,表现为"明明有成绩却显示没成绩"。
- 报名弹窗的点击绑定**不能放在 `bindEvents` 的 `if (userRole === 'coach')` 块里** ——
  家长也要用同一个按钮。
