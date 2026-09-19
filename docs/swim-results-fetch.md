# 游泳成绩抓取(USA Swimming Data Hub)工作流说明

> 目的:说明教练端三个按钮的真实行为、新 meet 数据如何入库、错误如何持久化,以及日常操作流程。
> 最后更新:2026-09-19(新增 Fetch New Athletes Only / 错误持久化 / 首阶段重试与鉴权处理)。

## 1. 三个按钮

| 按钮 | 粒度 | 行为 |
|---|---|---|
| **🆕 Fetch New Athletes Only** | 新队员 × 全量 | 只选尚未完成首次全量抓取的队员(没有 `initialFullFetchAt` 标记)。旧队员完全不进本轮。 |
| **🔄 Fetch All Swimmer Results** | 全队 × 按 meet 增量 | 遍历所有有 USA ID 的队员,按 meet 粒度跳过已 `ok` 的 meet。 |
| **🔄 Refetch Selected Athlete** | 单队员 × 全量 | 对选中队员 `force: true`,忽略已有数据,重抓所有 meet。维修工具,代价大。 |

关键认知:
- **增量判断是按 meet,不是按队员**。
- `Fetch New Athletes Only` 按队员是否完成首次全量抓取来筛选,适合当前注册期和将来新增队员。
- `Fetch All` 仍会检查每个旧队员,适合稳定期或维护。

## 2. 新队员标记

- `swimResults/{memberId}.initialFullFetchAt` 存在 → 视为已完成首次全量抓取。
- 2026-09-19 之前已经有 meet 数据的旧文档,即使没有 marker 也视为完成,避免一次性重抓旧队员。
- 旧文档的 marker 会在第一次 New Only 或普通抓取读到该文档时自动补写。
- 新队员第一次成功抓取后,`Fetch New Athletes Only` 会写入该标记及 `initialMeetCount`。
- 如果这次有 meet 抓失败,不写标记,下次 New Only 会继续补。
- 如果只是返回 `empty`(例如旧 meet 真的没成绩),视为首次全量完成;后续普通增量仍会重试 `empty`。

## 3. 增量判断 needsFetch

| Firestore 已有状态 | 行为 |
|---|---|
| meetId 不存在 | 抓取 |
| `status: ok` | 跳过 |
| `status: failed` | 重试 |
| `status: empty` | 重试 |
| 旧数据无 status 字段 | 按 swims 长度判断:空则抓 |

## 4. 新 meet 的数据怎么进来

**稳定期:直接跑 Fetch All Swimmer Results。**

1. 新 meet 被 USAS 发布后,`GetSwimmerMeets` 列表里多出该 meetId。
2. Firestore 里查不到它 → `needsFetch` 为 true → 自动被抓。
3. 所有已 `ok` 的旧 meet 跳过。

若抓取时 USAS 还没发布成绩,`GetSwimmerMeetTimes` 返回空数组 → 存成 `status: empty`(不是 ok),下次增量自动重试。

## 5. 错误持久化与重试

**每个 meet 的错误**:
- 逐 meet 失败时,`meets.{meetId}.error` 会记录 `endpoint`、`httpStatus`、`message`、`retryable`、`authError`、`at`。

**每个队员最近一次错误**:
- `swimResults/{memberId}.lastFetchError` 记录最近一次 `GetBestTimesForMember` / `GetSwimmerMeets` / `GetSwimmerMeetTimes` 的错误。
- 下次 bestTimes 成功或首次全量完成时会清空该字段。

**重试策略**:
- `GetBestTimesForMember`、`GetSwimmerMeets`、`GetSwimmerMeetTimes` 统一支持 406/429/5xx/网络/超时的退避重试。
- 401/403 视为鉴权错误:停止整轮并提示更新 API Credentials,不会给每个队员各报一次错。
- 逐 meet 仍保留连续失败熔断和连续 empty 软降级暂停。

## 6. 日常操作流程

**注册期 / 新队员加入**:
1. 等家长填入 USA ID。
2. 点 **Fetch New Athletes Only**。
3. 新队员自动抓全量历史 meet;旧队员不调用。

**稳定期 / 每次比赛后**:
1. 等 USAS 发布该 meet 成绩。
2. 跑一次 **Fetch All Swimmer Results**(或后续按比赛名单只同步参赛者)。
3. 若有队员标记 empty/failed,再跑一次增量(自动只补这些)。

**Refetch Selected Athlete 只在以下情况用**:
- 某队员已 `ok` 的数据本身是错的/不完整。
- 想整体重灌该队员。
- ⚠ 代价大:force 全量重抓所有 meet。

## 7. API 调用与限速

- `Fetch All`:每个队员至少 1 次 `GetBestTimesForMember` + 1 次 `GetSwimmerMeets`;有新 meet 才加 `GetSwimmerMeetTimes`。
- `Fetch New Athletes Only`:只对新队员发上面这些请求;旧队员 0 请求。
- 逐 meet 限速:每场间隔 5s;每 10 场休息 1 分钟。
- 队员间冷却 3 分钟(仅实际发过 meet 请求时)。

## 8. 代码索引(dashboard.js)

| 内容 | 函数/区域 |
|---|---|
| 限速/退避/熔断参数 | `FETCH_POLICY` |
| 通用重试 | `fetchJsonWithRetry` |
| 单次请求与错误分类 | `tryFetchOnce` |
| best times / meets 列表 | `fetchBestTimes` / `fetchMeets` |
| 逐 meet 抓取 | `fetchMeetTimes` |
| 错误持久化 | `describeFetchError` / `recordFetchError` |
| 单队员抓取 | `fetchSwimmerData` |
| 新队员筛选与标记 | `getSwimmersForMode` / `markInitialFetchComplete` |
| 全队/新队员入口 | `fetchAllSwimmerResults` |
| 状态写入 | `saveMeetResult` |

## 9. 相关文件

- 数据落地:`firestore.rules`(swimResults 读放开)、Firestore `swimResults/{memberId}`。
- 展示:教练端 Athlete Data Status 表、View Athlete Results、家庭端 Results tab。
- Mock 模式(`?mock=1`,仅 dev):不发真实请求、不写 Firestore,压缩等待时间。

## 10. 维护备注

- 改增量逻辑时保持 `needsFetch` 单一职责,并同步更新本文。
- 若 USAS API 行为变化(空结果语义、限流状态码等),先更新本文再改代码。
