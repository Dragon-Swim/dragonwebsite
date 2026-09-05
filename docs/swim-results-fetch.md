# 游泳成绩抓取(USA Swimming Data Hub)工作流说明

> 目的:说明教练端 "Fetch All Swimmer Results" / "Refetch Selected Athlete" 两个按钮的真实行为、
> 新 meet 数据如何入库、以及日常操作流程。避免每次都要翻 handoff / 读代码。
> 最后更新:2026-08-06(对照 main `ff00625` 的 `src/pages/dashboard.js`)

## 1. 两个按钮的真面目

| 按钮 | 粒度 | 行为 |
|---|---|---|
| **🔄 Fetch All Swimmer Results** | 全队 × 按 meet 增量 | 遍历所有有 USA ID 的队员;对**每个队员**调 `fetchSwimmerData(force: false)`,按 meet 粒度跳过已抓成功的 |
| **🔄 Refetch Selected Athlete** | 单队员 × 全量 | 对选中队员调 `fetchSwimmerData(force: true)`,**忽略已有数据,重抓该队员所有 meet** |

关键认知:**增量判断是按 meet,不是按队员**。fetch-all 不会"跳过已经取过的队员"——它每个队员都会过一遍,只是对已 `ok` 的 meet 不发请求。

## 2. 增量判断(needsFetch, dashboard.js:920)

每次对某队员抓取时,对照 **USAS 实时返回的完整 meet 列表**(`GetSwimmerMeets`) 与 Firestore `swimResults/{memberId}` 里已存的 `meets.{meetId}`:

| Firestore 已有状态 | 行为 |
|---|---|
| meetId 不存在(从未抓过,**新 meet 天然在此**) | 抓取 |
| `status: 'ok'` | 跳过 |
| `status: 'failed'` | 重试 |
| `status: 'empty'` | 重试(USAS 可能还没发布成绩) |
| 旧数据无 status 字段 | 按 `swims` 长度判断:空则抓 |

## 3. 新 meet 的数据怎么进来

**直接跑 "Fetch All Swimmer Results" 即可,无需任何特殊操作。**

1. 新 meet 被 USAS 发布后,`GetSwimmerMeets` 列表里多出该 meetId
2. Firestore 里查不到它 → `needsFetch` 为 true → 自动被抓
3. 所有已 `ok` 的旧 meet 瞬间跳过

若抓取时 USAS 还没发布成绩,`GetSwimmerMeetTimes` 返回空数组 → 故意存成 `status: 'empty'`(**不是** ok),下次 fetch-all **自动重试**。

## 4. 状态语义

每个 meet 在 Firestore 中存为 `meets.{meetId}: { status, swims, ... }`:

- `ok` — 成功拿到成绩
- `empty` — 请求成功但返回空数组。可能是真没成绩,也可能是 API 软降级(200+空)。下次自动重试
- `failed` — 请求失败(限流/5xx/超时等)。下次自动重试

## 5. 日常操作流程

**正常流程(每次比赛后):**
1. 等 USAS 发布该 meet 成绩(一般赛后几天)
2. 跑一次 "Fetch All Swimmer Results"
3. 若有队员标记 empty/failed → **再跑一次 fetch-all**(自动只补这些;第二次也要等 USAS 发布之后跑才有意义)

**Refetch Selected Athlete 只在以下情况用(维修工具,不是常规补漏):**
- 某队员已 `ok` 的数据本身是错的/不完整(如 USAS 后来修正了成绩)
- 想整体重灌该队员
- ⚠ 代价大:force 全量重抓所有 meet,消耗 API 配额与时间

## 6. 每次 fetch-all 实际发生的事(时间与配额参考)

对每个队员,无论有没有新 meet,**都会**发请求:

1. `GetSwimmerBestTimes` — **每次都重新拉**,不跳过
2. `GetSwimmerMeets` — 每次都拉(用于增量判断)
3. 仅对新/失败/空的 meet 逐个发 `GetSwimmerMeetTimes`

限速节奏(生产值, dashboard.js:561):
- 每场 meet 间隔 5s;每 10 场中场休息 1 分钟
- 队员间冷却 3 分钟(仅当该队员实际发了请求)
- 可重试失败(406/429/5xx)退避 5s/20s/60s;连续 3 场失败 → 判定限流,暂停 5 分钟
- 连续 5 场空结果 → 判定软降级,暂停 10 分钟

→ 全队有新数据时一轮约 **25 分钟**;全队无新数据时几乎秒过(仍会刷新 bestTimes)。

## 7. 代码索引(dashboard.js)

| 内容 | 位置 |
|---|---|
| FETCH_POLICY(限速/熔断参数) | :561 |
| `saveMeetResult`(状态写入) | :891 |
| `fetchSwimmerData`(核心:增量判断 needsFetch 在 :920) | :916 |
| `fetchAllSwimmerResults`(全队按钮) | :1003 |
| `fetchMeets`(USAS 实时列表) | :692 |
| `fetchMeetTimes`(带退避重试) | :723 |
| Refetch Selected Athlete 按钮(force) | :4639 |

## 8. 相关文件

- 数据落地:`firestore.rules`(swimResults 读放开)、Firestore `swimResults/{memberId}`
- 展示:教练端 "Athlete Data Status" 表、View Athlete Results、家庭端 🏊 Results tab
- Mock 模式(`?mock=1`,仅 dev):不发真实请求、不写 Firestore,压缩等待时间,用于测试限速/重试/熔断/断点续传

## 9. 维护备注

- 改增量逻辑时保持 `needsFetch` 单一职责,并同步更新本文第 2/4 节
- 若 USAS API 行为变化(空结果语义等),先更新本文再改代码
