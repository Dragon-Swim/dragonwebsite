# Meet Fees & Deposits（教练端费用与押金）工作流说明

> 目的：说明「Meet Fee Summary」与「Meet Fee Deposits」两个 tab 的数据来源、
> 两个表格导入器的口径、以及 2026-10-02 误传事故的清理方式。
> 最后更新：2026-10-02（押金集合清空 + 导入器修正：允许负余额、支持单列表、
> 无金额列直接拒收、预览显示列映射）。
> 相关代码：`src/utils/feeImport.js`（纯逻辑）、`src/pages/dashboard.js`（渲染与写入）、
> `execution/clear_deposits_collection.mjs`（清理工具）、
> `execution/preview_fee_import.mjs`（用真实 xlsx 干跑导入）、
> `tests/unit/verify-fee-import.mjs`（纯逻辑测试）。

## 1. 口径（先读这一节）

| 问题 | 决定 |
|---|---|
| 费用（meet fee）的真实来源 | **只有 `meets.feeData`**。每个 meet 一条，`feeData.swimmers[]` 存 { name, total } |
| 押金/结转余额的存放 | 集合 `deposits`，一个泳手 × 一个赛季一条 |
| 汇总公式 | Fee Summary 行 `balance = 该赛季 deposit 合计 − 该赛季 meet fee 合计`；`deposit` 合计 = `balance` 字段 + `deposit1/2/3Amount` |
| 余额（carry-over）符号 | **负数 = 还欠队里钱**。`balance = deposit − fees`，导入时**原样保留符号**，不要取绝对值 |
| 押金轮次 | 最多 3 笔（`deposit1/2/3`，各带 amount + date）。单列表导入自动填入下一个空槽 |
| 用户账号 | 教练端只读、admin 可写（`firestore.rules`） |
| 赛季 | `"2025-2026"` / `"2026-2027"`，与 meets、volunteerHours 同一套 `getSeasonOptions()` |

## 2. 数据模型

```js
// meets/{meetId} —— 费用唯一真实来源（由 Meet Management 上传 fee 表写入）
feeData: { swimmers: [ { name: "eric chen", total: 624.5 }, … ] }

// deposits/{autoId} —— 结转余额与押金
{
  swimmerName: "ada gai",       // 与 feeData.swimmers[].name 按「小写 + 合并空格」匹配
  season: "2025-2026",
  balance: -182,                // 结转余额（可为负）
  deposit1Amount: 400, deposit1Date: "2026-09-15",
  deposit2Amount: null, deposit2Date: null,
  deposit3Amount: null, deposit3Date: null,
  updatedAt, updatedBy          // 导入/编辑都会盖戳，排查数据来源就看这两个字段
}
```

`deposits` 文档没有 `createdAt`（历史原因），排查“这批数据是谁、什么时候写的”
看 `updatedAt` + `updatedBy`。

## 3. 两个导入器（Deposits tab）

| 按钮 | 期望的表头 | 写什么 |
|---|---|---|
| 📤 Upload Carry-over Balance | 有 `name`/`swimmer` 列 + `balance`/`carry`/`credit` 列（前面可以有标题行） | 每条写 `balance`，**含负数** |
| 📤 Upload Deposits | ① 编号列：`Deposit 1 Amount` / `D2 Date` 等；② 单列表：`Deposit`/`Depoist`/`Dep`（+ 可选日期列） | 编号列 → 对应 `depositN*`；单列表 → 下一个空槽 |

两个导入器共同的行为（2026-10-02 修正后）：

1. **预览先行**：弹窗顶部固定打印「Columns detected: `balance` ← D ("balance")」，
   说明每个字段取自哪一列；表格里逐行显示 new / update、写入前后值、目标槽位。
2. **拒收而不是写空记录**：表头里找不到可写列（例如只有 `Name` + `Amount`，
   或只有 `Name`）时直接 `alert` 拒收，一个文档都不建。
   —— 旧版会在这两种情况下建出「只有名字、没有任何金额」的记录。
3. **裸 `Amount` 列按设计忽略**：在 balance 表里 `amount` 是**欠费**，把它当付款导入会静默出错。
   要么写 `Deposit`/`Depoist`，要么用编号列。
4. **单列表防重复**：若该泳手已有槽位金额与新导入金额**完全相等**，该行进入
   “Skipped rows”，避免同一张表传两遍把押金算两倍；三个槽都满了则报错，不写。
5. **金额解析**：容忍 `$1,234.50`、`+3`、会计负数 `(182)`；空白/文字进 error 列表。

## 4. 2026-10-02 事故与清理

**经过**：教练传了 `meet balance.xlsx`（2025-26 结转余额）与 `meet deposit.xlsx`
（13 人押金，表头拼错成 `depoist`）。

- balance 上传把符号抹掉了：原表 `ada gai = -182`（欠费），系统里成了 `+182`；
  原因是旧解析器把 `bal < 0` 判为非法，上传前只能手动取正。
- deposit 上传匹配不到金额列，却按名字建了 **13 条空壳记录**（`balance: 0`，无任何金额）。

**清理**：`node execution/clear_deposits_collection.mjs --delete` 清空整个 `deposits`
集合（72 条 = 2026-06-26 建站期 28 条占位 `600` + 当天 31 条余额 + 13 条空壳）。
工具默认 dry-run，删除前自动备份到 `.tmp/deposits-backup-<时间戳>.json`（`.tmp` 已 gitignore）。
真实费用数据在 `meets.feeData`，未受影响：PVS LC Open 1、2026 FXFX Summer Solstice LC Champs
（均 2025-2026）、PVS October Open (Audrey Moore)（2026-2027）。

## 5. 日常流程

1. Meet Management 里先有该 meet 的 fee 表（否则 Fee Summary 只有押金、没有费用）。
2. Deposits tab 选对**赛季**（顶部 season selector）——导入写的就是这个赛季。
3. 按上表选对按钮上传 → 在预览里核对列映射、new/update 数量、符号、目标槽位 → Import。
4. 线上核验：`node tests/unit/verify-fee-import.mjs`（纯逻辑）或
   `node execution/preview_fee_import.mjs --balance "x.xlsx" --season 2025-2026`
   （拿真实 xlsx + 线上 deposits 现状干跑，逐行打印会写什么，不碰 Firestore）。

## 6. 已知边界

- 姓名匹配是「小写 + 合并空格」的精确匹配。`eric chen` 与 `eric chen / kayden chen`
  （兄弟姐妹合并成一行）**不会**匹配到同一个 fee 记录，Fee Summary 会把合并行当成
  「有押金、无费用」的泳手单独列出来。要合并请拆成每人一行。
- 单列表导入不写日期，除非表里带日期列；三个槽位语义固定为「第 1/2/3 笔押金」。
- 没有撤销功能：导入写错了就用 Inline 编辑改，或从 `.tmp` 的备份文件回灌。

## 7. 姓名比对规则（2026-10-03 收紧）

`src/utils/feeImport.js` 的 `normalizeName` 是**唯一**的姓名比对口径，`buildFeeSummaryData`
也直接用它（以前 dashboard 里另写了一份）：

1. 大小写不敏感、连续空格折叠；
2. **忽略标点**（连字符、撇号、句点、逗号）与重音符号。

第 2 条是被真实数据逼出来的：注册表写 `Luo-han Chen`，Hy-Tek 导出的 fee 表写 `Luohan Chen`，
旧口径只做小写+空格折叠 → 同一个孩子被拆成两行（一行有费用、一行有押金）。
改动后 `Fee Summary` 行数从 52 降到 51，`Luo-han Chen` 合并为一行（fee $35 + 押金/结转 $675.50）。
注意 `src/utils/registrationCompleteness.js` 里的 `normalizeName` 是另一套（用于注册表单校验），
**不要**合并。

## 8. 2026-10 结转余额 + 押金批量导入记录

教练手写表格 → 系统名字的对照（`execution/match_fee_names.mjs` 产出、人工确认）：

| 表里写的 | 写进系统的名字 | 依据 |
|---|---|---|
| `eric chen` | Haoran Chen | 注册表里的 **middleName = Eric** |
| `kayden chen` | Luo-han Chen | middleName = Kayden |
| `gabriel campo` | Gabriel Martin del Campo | fee 表 + 白名单家庭 |
| `ridihi seelan` | Ridhi Seelam | 注册表 |
| `fragoer zhou` | Fargoer Zhou | 注册表 |
| `charleen tao` | Charlene Tao | 注册表 |
| `suleiman` / `ibrahim` | Suleiman / Ibrahim Mourad | 上赛季 fee 表 |
| `trisha` | Trisha Musni | 上赛季 fee 表 |
| `liam` | Liam Norcross | 同表另有 `liam toner`，按排除法 |
| `muhammad` | Muhammad Mourad | 教练确认是 Mourad 家；**拼写待该家庭注册后核对** |
| `kevin liu` | Kaiwen Liu | 教练确认（白名单 `jonexie@hotmail.com`，未注册） |
| `lasya` | Lasya Agili | 教练确认（白名单 `Adi Agili parent`） |
| `ethan qiao` / `anjka` | Ethan Qiao / Anjka | 系统里完全没有；先建档，**家长注册后链接** |

- 导入结果：`deposits` 集合 2026-2027 赛季 **41 条**（38 行结转余额 + 13 行押金，其中 10 人两张表都有 → 合并成 1 条）。
  余额合计 −$2176.00（与表格 D 列一致）、押金合计 $4600.00。核对命令：
  `node execution/verify_fee_summary.mjs 2026-2027`。
- `Ethan Qiao` / `Anjka` 两条带 `needsLinking: true` + `sourceName`（原始写法），
  家庭注册后用 `where('needsLinking','==',true)` 捞出来改名/合并。
- 仍**未注册**的家庭（有 fee 数据但 `registrations` 里没有，Fee Summary 会显示「只有押金/结转」）：
  Mourad（Ibrahim/Suleiman/Muhammad）、Musni（Adriana/Trisha）、Celina Feng、
  Gabriel Martin del Campo、Adi/Lasya Agili、Kaiwen Liu、Ethan Qiao、Anjka。
  白名单里另有 19 个家庭从未完成注册（见匹配报告）。

### 工具链（都在 `execution/`，全部只读或 dry-run 优先）

| 工具 | 用途 |
|---|---|
| `match_fee_names.mjs` | 把教练手写表格的每个名字对到系统里的人（含 middleName/白名单/fee 历史），输出 md/csv/xlsx + `.plan.json` |
| `import_fee_sheet.mjs` | 按 `.plan.json` + `--overrides`（人工确认名）写入 deposits；默认 dry-run，`--commit` 才写 |
| `verify_fee_summary.mjs` | 只读复算某赛季 Fee Summary（含同名重复、待链接检查） |
| `clear_deposits_collection.mjs` | 清空 deposits（默认 dry-run + 自动 JSON 备份） |

**踩过的坑**：批量导入工具一开始按"读一次集合 → 建两次 batch"写，导致两张表都出现的人被建了
两条记录（余额一条、押金一条，共 10 人）。已修成写入前按姓名合并（`import_fee_sheet.mjs`），
历史重复用一次性脚本合并（保留带余额的那条，把押金字段并进去）。仪表盘自带的两个导入器不受
影响——它的 `deposits` 快照在两次上传之间会由 onSnapshot 刷新。
