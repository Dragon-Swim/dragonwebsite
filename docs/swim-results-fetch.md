# 游泳成绩抓取(USA Swimming Data Hub)工作流说明

> 目的:说明教练端三个按钮的真实行为、新 meet 数据如何入库、错误如何持久化,以及日常操作流程。
> 最后更新:2026-10-28(新增 §12.8/§12.9:界面改成「Data Hub Session」面板;
> Worker 已写好并有 33 项本机测试,待部署。此前 2026-10-27 新增第 12 节:Data Hub 改版,旧 `times-api` host 整站 403,
> 前端改走 `data.usaswimming.org/api/*` + SSO cookie 且拒绝 dragonswim.org 来源 ——
> 浏览器直连路线结束,必须服务端代理。此前 2026-09-21 新增第 10 节:两个 USAS 端点返回无 CORS 头的 406,会导致每个队员在
> 第一个请求就失败;第 5 节新增 `responseUnreadable` 字段与「连续 3 个队员首个请求失败即中止
> 整轮」的 fail-fast 行为;此前 2026-09-19 新增 Fetch New Athletes Only / 错误持久化 /
> 首阶段重试与鉴权处理)。

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
- 字段:`endpoint`、`httpStatus`、`message`、`retryable`、`authError`、**`responseUnreadable`**、`at`。
- **`responseUnreadable`**(2026-09-21 新增)为 `true` 表示**拿不到任何状态码**,即 `httpStatus: null`
  且不是鉴权错误。浏览器下这只说明「读不到响应」,无法区分是网络断了还是响应缺 CORS 头被浏览器
  拦下 —— 详见第 10 节。它**不**声称知道真实状态码。
- 下次 bestTimes 成功或首次全量完成时会清空该字段。

**重试策略**:
- `GetBestTimesForMember`、`GetSwimmerMeets`、`GetSwimmerMeetTimes` 统一支持 406/429/5xx/网络/超时的退避重试。
- 401/403 视为鉴权错误:停止整轮并提示更新 API Credentials,不会给每个队员各报一次错。
- 逐 meet 仍保留连续失败熔断和连续 empty 软降级暂停。

**整轮提前中止(fail fast,2026-09-21 新增)**:
- 若**连续 3 个队员**(`abortAfterConsecutiveBlocked`,判据在 `src/utils/fetchHealth.js`)
  都倒在**各自的第一个请求** `GetBestTimesForMember` 上且 `responseUnreadable`,则判定整轮
  注定失败,**立即中止**并提示「API 不可达或请求被拒绝」。
- 为什么需要:此前每个队员都会白烧一整轮退避重试(5s+20s+60s ≈ 85 秒)。5 个队员就是
  7 分钟全废;现在跑到第 3 个就停,省下后面每个 ~85 秒。
- 中止是**安全**的:每个抓完的 meet 都已单独落库,下次运行从断点继续,不丢数据。
- 已成功的队员会**重置**计数器;不是"第一个请求"的失败(例如某个 meet 抓失败)也**不会**计数,
  所以偶发抖动不会误杀整轮。

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
| 失败分类与整轮中止判据 | `src/utils/fetchHealth.js`(`isUnreadableResponse` / `isBlockedFirstCall` / `nextBlockedRunState`) |
| 单队员抓取 | `fetchSwimmerData` |
| 新队员筛选与标记 | `getSwimmersForMode` / `markInitialFetchComplete` |
| 全队/新队员入口 | `fetchAllSwimmerResults` |
| 状态写入 | `saveMeetResult` |

## 9. 相关文件

- 数据落地:`firestore.rules`(swimResults 读放开)、Firestore `swimResults/{memberId}`。
- 展示:教练端 Athlete Data Status 表、View Athlete Results、家庭端 Results tab。
- Mock 模式(`?mock=1`,仅 dev):不发真实请求、不写 Firestore,压缩等待时间。

## 10. 已知的 USAS API 异常 — 两个端点返回「不带 CORS 头的 406」

> ⚠ **本节描述的是 2026-09-21 的状态,已被第 12 节取代**:同一个 host 现在整站 403,
> 且 Data Hub 前端已改走 `data.usaswimming.org/api/times/swims`。读第 12 节先。

**2026-09-21 观测到**(此前约 14:55 UTC 仍正常,14:56 起失效)。

现象:点 Fetch New Athletes Only / Fetch All 后,**每个队员都在第一个请求就失败**,日志只有
`❌ Failed: Failed to fetch`,每个队员**恰好耗时约 86 秒**(= `retryDelaysMs` 的 5s+20s+60s
退避跑满),然后跳到下一个队员继续同样失败。存入的 `lastFetchError` 形如:

```json
{"httpStatus":null,"message":"Failed to fetch","retryable":true,"authError":false,
 "endpoint":".../GetBestTimesForMember/<id>"}
```

实测三个端点(真实凭证 / 伪造凭证 / 不带凭证):

| 端点 | 真实凭证 | 伪造凭证 | `Access-Control-Allow-Origin` |
|---|---|---|---|
| `GetBestTimesForMember/{id}`(每个队员第 1 个调用) | 406 | 406 | **缺失** |
| `GetSwimmerMeets/{id}`(第 2 个调用) | 406 | 406 | **缺失** |
| `GetSwimmerMeetTimes/{id}/{meetId}` | **200(真实数据)** | 401 | `*` |

结论:

1. **凭证是有效的。** `GetSwimmerMeetTimes` 用现有凭证返回 200 和真实数据、用伪造凭证返回
   401,说明该端点确实校验鉴权且**接受了我们的凭证**。**不要因为这个问题去重新复制
   device-id / sub-id / session-id。**
2. **406 发生在鉴权之前。** 伪造凭证收到的是 406 而不是 401,说明是边缘层(网关/WAF)直接拒绝
   了这两个路径,根本没走到鉴权。所以既不是会话过期,也不是账号被限流。
3. **浏览器读不到真实状态码,这是最坑的一点。** 这两个 406 响应**不带任何 CORS 头**(而 404、
   成功响应、站点根都带 `*`),浏览器因此拒绝把响应交给 JS,`fetch()` 抛
   `TypeError: Failed to fetch`,**`httpStatus` 记为 `null`**。于是应用把「API 边缘拒绝」误判成
   「网络错误」,按可重试错误退避重试 3 次,`authError` 也失真为 `false`。
4. 本文档此前记录、代码 `USAS_BASE` 上方注释引用的 2026-08-01 假设 ——
   「`Access-Control-Allow-Origin: *` 且允许 appname/device-id/usas-session-id/usas-sub-id
   自定义头,无需代理」—— **对这两个端点已不成立**。同处注释也已预见「若生产出现 CORS 问题,
   需要一个 Cloud Function 之类的代理」。

排查方式:

- **抓取前先跑** `node local-tools/check-usas-endpoints.mjs`(约 6 个请求)。它按上表分类并给出结论:
  凭证是否有效、抓取端点是否可用。看到 `fetch endpoints: HEALTHY` 再点抓取按钮。
  (该工具是**本机专用**、不进仓库,见 `local-tools/README.md`;若不在本机,按上面的表手工对照即可。)
- **不要在这个状态下反复重跑**:每个队员会白烧约 85 秒重试,持续请求还可能延长限流。
- **区分「本地网络问题」和「API 拒绝」**:同一台机器上 `GET https://times-api.usaswimming.org/`
  返回 200(站点根是 Swagger UI 页面),而 `GET .../GetBestTimesForMember/{id}` 返回 406。
  所以「根路径能打开」**不能**证明抓取端点可用。
- **判断是否按 IP 限流**:换一个出口 IP(例如手机关 Wi-Fi 用蜂窝数据)试一次。若那边能通,
  说明是 IP 维度的限制,换网络即可绕过;若同样 406,则是端点整体问题,只能等。

## 11. 维护备注

- 改增量逻辑时保持 `needsFetch` 单一职责,并同步更新本文。
- 若 USAS API 行为变化(空结果语义、限流状态码等),先更新本文再改代码。

## 12. 2026-10-27:Data Hub 改版 —— 旧 API 已关,「更新 API key」这条路不存在了

**触发问题**:教练按第 8 节之外的老办法(Data Hub → `F12` → Network → 过滤 `times-api`)
去「更新 API key」,**一条请求都过滤不出来**,三个输入框无从填写。

### 12.1 实测结论(2026-10-27,本机)

| 检查 | 结果 |
|---|---|
| `GET https://times-api.usaswimming.org/` | **403**,body 为空;`Via: varnish`(Fastly)→ Azure 源站(`Request-Context: appId=cid-v1:…`) |
| 同 host 任意路径 `/foo/bar` | **403** —— 是整站/整 host 被拒,不是某条路由 |
| 三个抓取端点(真凭证 / 伪造凭证 / 无凭证) | 全部 **403**(2026-09-21 时还是 406) |
| `node local-tools/check-usas-endpoints.mjs` | `credentials: inconclusive`、`fetch endpoints: BLOCKED` |
| 新版前端 bundle `/assets/index-Dbex2T8i.js`(839 KB) | 出现 `times-api` **0 次** |

**旧 host 已经没有「能不能调通」的问题,而是整体关门。** 它连站点根都 403,
所以第 10 节那条「根路径 200 不能证明抓取端点可用」的判据也失效了。

### 12.2 新版前端长什么样

Data Hub 的前端换成了 TanStack Start / React 的 SPA(`data.usaswimming.org`),
API 变成**同源**路径:

```js
const NM = { times:  "/api/times/swims",
             person: "/api/person/swims",
             meet:   "/api/meet/swims",
             common: "/api/common/swims" };

// 每个请求只带这两个头 + 浏览器自动附带的会话 cookie
headers = { "Device-Id": <localStorage.deviceId>, "X-CSRF": "1" };
fetch(url, { credentials: "include" });
```

要点:

- **端点名没变**,和本项目调的一模一样:
  `/TimesSearch/GetBestTimesForMember/{id}`、`/TimesSearch/GetSwimmerMeets/{id}`、
  `/TimesSearch/GetSwimmerMeetTimes/{id}/{meetId}` —— 只是 host 从 `times-api` 换成了
  `data.usaswimming.org/api/times/swims`。
- **鉴权从自定义头换成 cookie**。`AppName` / `Usas-Sub-Id` / `usas-session-id`
  三个头新前端**根本不发**(全局仅剩一处 `Usas-Sub-Id: "Anonymous"`,用于 dashboard 调用)。
- 登录走 BFF:`/bff/login/silent?returnUrl=…`;`/bff/securityinfo` 匿名访问返回 **401**。
  会话是 HttpOnly cookie,页面 JS 读不到,也没有「复制 key」这回事。
- `Device-Id` 变成前端**本地生成**后写进 `localStorage["deviceId"]`,
  不再是账号凭据(生成逻辑:`platform - vendor - fingerprint - Date.now()` 再 base64 重排)。

**所以:教练端那三个输入框的老配方已经没有来源。** 不是找错地方,是值不存在了。

### 12.3 就算拿到 cookie,浏览器也调不通

新 API 有来源白名单,跨域预检直接被拒:

```
OPTIONS https://data.usaswimming.org/api/times/swims/SearchFilter/GetCompetitionGenders
Origin: https://dragonswim.org
→ 400  "The origin 'https://dragonswim.org' is not allowed."
```

`data.usaswimming.org` 的静态资源照常给任何 origin,但 `/api/*` 只认它自己(及白名单内)的
来源。**结论:浏览器从 dragonswim.org 直连新 API 是不可能的**,与填什么凭据无关。

### 12.4 因此,能走的只有三条路

| 方向 | 做法 | 代价 / 风险 |
|---|---|---|
| **A. 服务端代理**(最接近现状) | Cloudflare Worker 持有一个手动更新的 Data Hub 会话 cookie,转发 `/api/times/swims/*` 并自己加 CORS 头;前端只需把 `USAS_BASE` 指向 Worker | 需要每次 cookie 过期后人工更新(过期时长未测);属于对着自家账号数据做代理,注意 USAS 条款。**2026-10-27 已验证服务端可行,见 §12.6** |
| **B. 导出/人工入库** | 教练从 Data Hub 导出成绩(或按 meet 页复制),由 `execution/` 里的确定性脚本解析入库,不再依赖任何凭据 | 每场 meet 一步人工;但零凭据、零 CORS、绝不会因为上游改版而整条断掉 |
| **C. 官方 API** | 向 USA Swimming 申请正式的 Data Hub / SWIMS 接口权限 | 周期长;拿到之前 B 是兜底 |

**⚠ 不要再去外部找「API key」** —— 外面流传的 device-id / session-id 抓取教程
全部对应已下线的旧 host,照做只会浪费一轮。

### 12.5 本次验证用过的最小检查

```powershell
# 旧 host 是否还活着(期望:现在全是 403)
curl.exe -sS -o NUL -w "%{http_code}\n" https://times-api.usaswimming.org/

# 新 API 是否需要登录(期望:401 匿名)
curl.exe -sS -o NUL -w "%{http_code}\n" `
  https://data.usaswimming.org/api/times/swims/TimesSearch/GetBestTimesForMember/D2754213666C4F

# 新 API 是否放行本站来源(期望:400 origin not allowed)
curl.exe -sS -i -X OPTIONS -H "Origin: https://dragonswim.org" `
  -H "Access-Control-Request-Method: GET" `
  https://data.usaswimming.org/api/times/swims/SearchFilter/GetCompetitionGenders
```

### 12.6 2026-10-27 验证:服务端带 cookie 调用是通的

用 `local-tools/probe-usas-cookie.mjs`(教练浏览器登录后复制的会话 cookie)实测:

| 请求 | 结果 |
|---|---|
| `GET /bff/securityinfo` | **200**,返回账号身份 |
| `GET /api/times/swims/TimesSearch/GetBestTimesForMember/{id}` | **200**,真实成绩数组 |
| `GET /api/times/swims/TimesSearch/GetSwimmerMeets/{id}` | **200**,`2026 PV October Open - Claude Moore` 等 |
| `GET /api/times/swims/TimesSearch/GetSwimmerMeetTimes/{id}/{meetId}` | **200**,`50 FR SCY 34.56` |
| 同上,不带 cookie(对照) | **401** |

结论:**方案 A 成立**,前提是三个头都带对:

```
Cookie:     <浏览器里复制的整段,10 段 1100+ 字符>
Device-Id:  <见下>
X-CSRF:     1
```

`Device-Id` **只校验格式,不绑账号**。生成算法(照抄前端 `jM()`):

```js
const raw = `Win32 - Google Inc. - ${fingerprint8hex} - ${Date.now()}`; // 四段 " - " 连接
const b64 = btoa(raw);                                                  // 64 字符
const deviceId = b64.slice(0, 15) + b64.slice(0, 5) + b64.slice(15);     // 把前 5 个字符再插一遍 → 69 字符
```

两个坑(都踩过):

1. **别截断**。69 字符截到 60 就 base64 解不开,服务端直接
   `400 "Invalid Device-Id format in request headers."` —— 看起来像被拒,其实只是本地拼错。
2. 变形那一步不是常见的 base64 直出,漏了 `slice(0,5)` 的重复段同样是 400。

服务端调用**不要**带 `Origin` / `Referer` —— 那是浏览器跨域检查才需要的,
带上反而触发 §12.3 的来源白名单。

**滑动续期(易踩)**:服务端可能用 `Set-Cookie` 续期。代理如果只保存启动时那一份,
浏览器那边还在续、代理这边却会先过期,于是出现「浏览器明明能用、代理却 401」的
假性过期,把寿命结论带偏。`local-tools/usas-proxy.mjs` 已改为吸收响应里的
`Set-Cookie` 并用于后续请求(日志会打 `↻ cookie 已续期`);Worker 版本必须照做。

**2026-10-28 实测:服务端根本不续期。** 完整跑一轮探针(4 个请求)之后,
`↻ 本次探针没有收到任何 Set-Cookie`。所以 cookie 的寿命是**登录那一刻定死的绝对时间**,
用请求"保活"没有意义。

**鉴权只有一枚 cookie**:10 段里 9 段是统计用的(`_ga` / `_fbp` / `__gads` / `_clck` …),
真正起作用的只有 `bff_auth_session`(326 字符、`HttpOnly` + `Secure` + `SameSite=Lax`)。
做代理时只需要带它,不必整段照搬 —— 但整段照搬也没坏处。

**DevTools 里可以直接读到到期时间**:Application → Cookies → `data.usaswimming.org`
→ `bff_auth_session` 的 `Expires / Max-Age`。它是一个确定的 UTC 时间戳(不是 `Session`)。

**2026-10-28 实测值:`2026-10-28T20:39:52.425Z`,登录时刻 `12:39:52Z` → 恰好 8 小时。**
这是**绝对寿命**(不随请求延长,见上一段),所以可以按"一张 8 小时的门票"来设计。

够不够用:本队 `registrations` 共 61 名队员、**32 名有 USA ID**。按当前节奏
(`swimmerGapMs` 3 分钟/人 + 每场 5 秒)跑一轮全队增量约 **2 小时**,一个 8 小时窗口
能跑完,因此**不需要定时任务**,也不需要每天惦记续期 —— 教练登录一次、粘贴、跑完即可。

尚未确证:登录页是否有 `Remember me` / `Stay signed in` 能把这 8 小时拉长(本次未见)。

寿命实测记录(同一账号,不同次登录):

| 时间 (UTC) | 结果 | 说明 |
|---|---|---|
| 2026-10-27 12:52 | 200 | 首次验证基线 |
| 2026-10-27 19:48 | 200 | ≥6h56m,期间完成一次真实 refetch |
| 2026-10-28 11:23 | **401** | 隔夜失效;浏览器本身也要求重新登录 → 会话真的到期 |

结论:寿命 **恰好 8 小时**(2026-10-28 实测登录 12:39:52Z → 过期 20:39:52Z),且**不随请求续期**。
所以 Worker 需要一个"粘贴 cookie"的入口,但**不必每天维护** —— 一次登录足够跑完一轮全队增量(约 2 小时)。

(2026-09 的旧结论是旧 header 体系的 `usas-session-id` ≥6 天,与这个 cookie 不是一回事。)

### 12.7 2026-10-27:新 BFF 把数组**双重编码**了

浏览器里从代理拿到 body 后,`res.json()` 的结果是 **string 而不是数组**,因为 body 长这样:

```
"[
  {
    \"swimTimeRecognitionId\": 232163720, ...
```

外层是一个 JSON 字符串,里面才是数组。**症状很有欺骗性**:

| 现象 | 真实含义 |
|---|---|
| `bestTimes 4084`、`meets 3466` | 是**字符数**,不是条数(一个运动员不可能有 3466 场 meet) |
| `meets[0]` 打印成 `[` | 数组第 0 个元素是第一个字符 |
| `meets[0].meetId === undefined` | 于是拼出 `.../GetSwimmerMeetTimes/{id}/undefined` → **400** |
| 抓取"成功"但每场都 `empty` | `Array.isArray(raw)` 为 false,被静默兜底成空数组 |

最后一条最危险:代码里的 `const swims = Array.isArray(raw) ? raw : []` 把「格式不对」
和「这场真没成绩」混为一谈,日志一切正常,数据却全是空。

**修法**(`src/pages/dashboard.js`):

- `tryFetchOnce` 里加 `unwrapJsonString()`:解析结果若是字符串且以 `[` / `{` 开头,
  再 `JSON.parse` 一次;不是字符串就原样返回(所以对正常响应无副作用)。
- `fetchMeetTimes` 取到非数组时打 `console.warn`,不再只是静默当空。

判断依据要看**类型**,不看长度 —— 长度会被误读成"几千条成绩"。

**修复后端到端实测(2026-10-27 19:14 UTC,dev + 本机代理)**:

```
swimResults/4F957CD1DCDD4B   Fargoer Zhou
  bestTimes 8 · meets 4 → {"ok":4} · swims 19
  ok 4 swims SCY "Nov 14 - Nov 16" 2025 PV November Open - Dulles South
  ok 5 swims SCY "Jan 17 - Jan 18" 2026 PV January Open - Audrey Moore
  ok 4 swims SCY "Oct 09 - Oct 11" 2026 PV October Open - Claude Moore
  ok 6 swims SCY "Oct 24 - Oct 25" 2026 PV MAKO Pink Ribbon Invitational
```

`status` 是 `ok` 而不是 `empty`、`meetDates` / `courseCode` 都有值,
说明解析、存储、字段名三处都对得上。核对工具:`local-tools/inspect-swim-results.mjs`。

同一段 cookie 在 12:52 → 19:14 UTC 之间持续可用(≥6.4 小时),cookie 寿命继续观察。

### 12.8 界面上的处理(2026-10-28 定稿)

旧的「三件套凭据 + 三步教程」整块删掉了 —— 那套值在新版 Data Hub 的任何请求里都不存在,
照着找只会浪费时间。现在 `renderCoachResults()` 里是:

| 位置 | 现在 |
|---|---|
| 🔑 **Data Hub Session** | 显示状态(`✅ Saved` / `⚠ Not configured` / `⛔ Expired` / dev 走本机代理);一个 textarea 用来粘贴 cookie;`💾 Save session` 与 `🔍 Test connection` 两个按钮;保存后自动跑一次验证,显示「连接正常(已登录:Keke)」 |
| 🔄 Fetch Swim Times | 只有 `sessionReady`(Worker 里存在 cookie)时才可点;否则显示 `⏸ Paused` 并说明原因 |
| View Athlete Results | 同样的开关:没有会话时「Refetch Selected Athlete」保持 disabled |
| 抓取请求 | `tryFetchOnce` 会给每个请求加 `Authorization: Bearer <Firebase ID token>`;dev 下这个头被本机代理忽略 |
| 抓取失败 | 遇到 401 会自动重读会话状态并刷新面板,不必手动刷新页面 |

三个入口都读同一份状态:`usasSession`(`/api/usas/session` 的返回)。
`saveSwimApiCredentials()` 已删除;`settings/swimApi` 里的旧值只是历史残留,不参与鉴权。

**dev 与生产的差别**:dev 没有 Worker,`USAS_BASE` 仍是 `/usas-api/swims/TimesSearch`
(Vite 代理 → 本机 `local-tools/usas-proxy.mjs`),会话面板显示提示、不出现粘贴框;
生产 `USAS_BASE = /api/usas/TimesSearch`,走同源 Worker。

### 12.9 Worker 落地(2026-10-28)

代码在仓库里:`worker/`(`src/index.js` + `src/firebase-auth.js` + `wrangler.toml` + `test/`)。

设计要点:

- **同源路由** `dragonswim.org/api/usas/*` —— 浏览器不跨域,连 CORS 都不用配
- **鉴权用 Firebase ID token**:每个请求验 RS256 签名(Google JWKS 缓存 1 小时),
  可选 `ADMIN_EMAILS` 白名单 —— 所以它**不是开放代理**
- **cookie 只存 KV**,状态接口只回长度和时间戳,不回传内容
- 只转发 `/TimesSearch/`,拒 `..` 与 `%2f` 绕行,上游域名写死
- 上游 401 → 记录 `invalidAt`,面板立刻变「已失效」

本机测试:`npm run test:worker`(33 项,含 1 次真实上游请求;不碰 Firestore)。

**未完成 / 需要现场做的**:`wrangler login` → 建 KV → `deploy` → 绑定路由,
都依赖 Cloudflare 账号,这一步只能在用户机器上做。步骤见 `worker/README.md`。
