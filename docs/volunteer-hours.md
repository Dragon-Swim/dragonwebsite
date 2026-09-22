# Volunteer Hours（教练端志愿小时统计）工作流说明

> 目的：说明教练端「Volunteer Hours」tab 的数据模型、录入口径、汇总算法、权限，
> 以及日常操作流程与已知边界。
> 最后更新：2026-09-21（P1 落地：家庭 × meet 一个数字、admin 录入、单 tab 汇总）。
> 相关代码：`src/utils/volunteerHours.js`（纯逻辑）、`src/pages/dashboard.js`（渲染与写入）、
> `firestore.rules`、`tests/volunteer-hours.spec.js`、`.tmp/verify-volunteer-hours.mjs`。

## 1. 口径（先读这一节）

| 问题 | 决定 |
|---|---|
| 统计单位 | **家庭**（= `registrations/{docId}` 一个文档，父母双方算一家） |
| 记录粒度 | **一个家庭 × 一个 meet 一个数字**。不给爸爸/妈妈分别记小时 |
| 录入人 | **仅 admin**。普通教练只读（`firestore.rules` 里 `allow create, update, delete: if isAdmin()`） |
| 汇总维度 | 赛季（`"2025-2026"`，9 月切季，与 meets / deposits 同一套 `getSeasonOptions()`） |
| 达标线 | 未做（P2 备选），本 tab 只显示总小时 |
| 家长端 | 未开放（P2）。文档里已存 `familyId` + `parentEmails` 快照，届时只改 rules 的 read 行 |

## 2. 数据模型

集合 `volunteerHours`，文档 id = `` `${meetId}_${familyId}` ``：

```js
{
  meetId, meetName, season,          // 快照
  familyId,                          // registrations 文档 id（家庭主键）
  familyLabel,                       // 快照，如 "Keke Chen & Fan Luo"
  parentEmails: [...],               // 快照，P2 家长端按邮箱自查用
  hours: 4.5,                        // 家庭在该 meet 的总小时
  note: "timing",                    // 可选
  updatedAt, updatedBy, updatedByEmail
}
```

设计理由（改动前请先读）：

1. **确定性 doc id**：保存 = `setDoc(..., {merge:true})`，天然幂等。重复保存、
   两个人同时编辑同一个家庭同一场，都不会产生第二条记录。
2. **一次查询读整季**：`where('season','==',s)` 是单字段查询，**不需要复合索引**。
   目前数据量（约 40 家庭 × 每季 10 场 ≈ 400 条）完全够用。
3. **快照字段**（`meetName`/`season`/`familyLabel`/`parentEmails`）：
   - meet 改名、家庭改名、注册被删，历史汇总仍然读得出来；
   - **meet 还存在时以 meet 的实时 `season` 为准**（管理员把 meet 挪到别的赛季，
     小时跟着走），meet 被删则退回快照里的 `season`。
4. **不按人分开记**：父母在志愿表上是可以互换的，家庭小时数就是报名单位；
   汇总表里父母双方姓名仍然都会显示（从 registration 的 `parent` / `spouse` 读）。
5. **不做「fee report 姓名匹配」**：本可把 meet 的 Hy-Tek 报名表匹配到家庭并排在前面，
   但线上有 10+ 个同姓家庭，本仓库已经吃过模糊匹配误报的亏
   （见 `.tmp/handoff-2026-09-20-needs-attention.md`），因此改为**搜索框**
   （匹配父母姓名、孩子姓名、邮箱）。

## 3. 界面（教练端侧栏 → 🙋 Volunteer Hours）

```
[赛季 ▾]                                    [📥 Summary CSV] [📥 Detail CSV]
说明文字（非 admin 额外显示「Only admins can add or change volunteer hours.」）
统计卡：Families with hours / Total hours / Meets covered / Families without hours
── Season Summary 表
   ▸ Family (parents) | Kids | Kid names | Meets | Total hours
     点行展开 → 逐 meet 明细（meet 名 + 日期 + 小时 + 备注 + 合计）
   0 小时的家庭默认隐藏，勾「Show families with 0 hours」显示（用来找还没做志愿者的家）
── Record Hours for a Meet
   [Meet ▾（本季，默认最近一场已结束的）] [搜索家庭/孩子/邮箱] [只显示已录入]
   Family (parents) | Kid names | Hours [输入框] | Note [输入框] | Updated
   Meet total: X
```

- 输入框失焦即保存（Enter 也会提交）。状态列显示保存中 / 已保存 / 失败，
  随后由 Firestore 快照重建为实际更新人。
- 值清空 → **删除该记录**（不会存成 0），所以「有没有记录」始终等于「有没有小时」。
- 非 admin 看到的是纯数字/备注文本，没有输入框。
- 搜索与「只显示已录入」是纯前端过滤，不触发重渲染。

## 4. 汇总算法（`buildVolunteerSummary`）

1. 用 meet 的实时赛季（meet 不存在时用记录快照）把记录分到所查赛季；
2. 按 `familyId` 求和，四舍五入到 2 位小数；
3. 输出行 = **所有 registration**（含 0 小时、含没有活跃孩子的家庭）
   ∪ 只存在于小时记录里的家庭（注册已被删，仍可改）；
4. 按姓氏排序（`normalizeSortKey`，与 roster 的姓氏排序一致）。

边界（都有 smoke 测试覆盖，见 `.tmp/verify-volunteer-hours.mjs`）：

- 孩子取 `swimmers.filter(s => !s.deleted)`——软删的孩子不计数；
- 家庭没有活跃孩子 → Kids = 0，行**保留**（不能因为没孩子就从汇总里消失）；
- `hours: null` + 只有备注 → 算 0 小时，明细里仍出现该 meet；
- 记录缺 `familyId`（脏数据）→ 汇总与 meet 合计都忽略，不会一边计数一边消失；
- 其它赛季的记录 → 不进当前赛季汇总。

## 5. 权限（`firestore.rules`）

```
match /volunteerHours/{docId} {
  allow read:   if userRole() == 'coach' || userRole() == 'admin';
  allow create, update, delete: if isAdmin();
}
```

- 想让普通教练也能补录：在写规则里加 `|| userRole() == 'coach'`，
  并把 `renderVolunteerHours()` 里的 `isAdmin` 改成 `true`（两处必须一起改）。
- P2 家长端只读自家：read 改为
  `resource.data.familyId == request.auth.uid || request.auth.token.email in resource.data.parentEmails`
  （文档已存这两个字段，无需迁移）。

## 6. 删除 meet

`meets` 被删时，`bindEvents()` 里的 delete-meet 处理器会连带删除该 meet 的
`volunteerHours` 文档（用 `where('meetId','==',…)` 查出来逐个删）。
失败只记 warning，不影响 meet 删除本身；汇总侧还有一层「meet 不存在就用快照」兜底。

## 7. 验证方式

| 目标 | 命令 |
|---|---|
| 纯逻辑（65 项断言，无需 emulator/网络） | `node .tmp/verify-volunteer-hours.mjs` |
| 端到端（admin 录入 → 落库 → 汇总 → CSV → 清空删除；教练只读） | `npm test`（含 `tests/volunteer-hours.spec.js`） |
| 构建 | `npm run build`（需 `.env.local` 存在） |
| 线上只读核对（可选） | `execution/audit_volunteer_hours.mjs`（serviceAccountKey + firebase-admin） |

## 8. 待办 / P2 备选

- 家长端「我们的志愿小时」只读页（rules 见第 5 节）。
- 达标线：每赛季每家庭 X 小时 + 缺口列。
- Excel 批量导入历史小时（照 deposits 的导入弹窗模式）。
- 岗位分类统计（计时 / 裁判 / 摊位）——目前只在 `note` 里自由记录。
