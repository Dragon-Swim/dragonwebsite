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
