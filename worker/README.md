# dragonswim-usas-proxy(Cloudflare Worker)

把 USA Swimming **Data Hub** 的成绩接口转发给本站,同时守住那份只能活 8 小时的登录 cookie。

## 为什么需要它

2026-10-27 起旧接口 `times-api.usaswimming.org` 整站 403。新版 Data Hub 用
`data.usaswimming.org/api/times/swims/*` + 登录 cookie(`bff_auth_session`)
鉴权,而且 `/api/*` 有来源白名单 —— 浏览器从 `dragonswim.org` 直连会被
`400 The origin ... is not allowed.` 拒掉。

所以只能服务端转发。完整背景:`docs/swim-results-fetch.md` §12。

## 端点

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/usas/session` | 会话状态(`hasCookie` / `savedAt` / `invalidAt`),不返回 cookie 内容 |
| `POST` | `/api/usas/session` | 保存 cookie,body `{"cookie":"..."}`;只保留 `bff_auth_session` 那一枚 |
| `DELETE` | `/api/usas/session` | 清除 |
| `GET` | `/api/usas/session/verify` | 实时验证(打一次上游 `/bff/securityinfo`) |
| `GET` | `/api/usas/TimesSearch/*` | 转发到上游 `/api/times/swims/TimesSearch/*` |

除 `GET /session` 外都需要 `Authorization: Bearer <Firebase ID token>`;
所有端点(含 `GET /session`)都要通过 token 校验 —— 这里不是开放代理。

## 部署(5 步,约 5 分钟)

```powershell
cd J:\MyDocuments\GitHub\Dragon-Swim\dragonwebsite\worker

# 1. 认证 —— 二选一
#    ① API token(推荐,不需要浏览器):
$env:CLOUDFLARE_API_TOKEN = '<token>'
$env:CLOUDFLARE_ACCOUNT_ID = '<account id>'     # `npx wrangler whoami` 会打印
#    ② OAuth(浏览器):
# npx wrangler login

# 2. 建 KV,把输出的 id 填进 wrangler.toml 的 id = "..."
npx wrangler kv namespace create USAS_KV

# 3. 部署(workers_dev=false,不会再问 workers.dev 子域名)
npx wrangler deploy

# 4. 绑定路由(推荐同源):在 Cloudflare 后台 Workers & Pages → 该 Worker
#    → Settings → Triggers → Add route
#      dragonswim.org/api/usas/*      (zone: dragonswim.org)
#    或把 wrangler.toml 里 routes 那三行取消注释再 deploy
#    (后者要求 token 带 Zone:Workers Routes:Edit)
#
# 5. 稳定后把 wrangler.toml 的 ADMIN_EMAILS 填成教练登录邮箱,再 deploy 一次
```

> 部署时如果被问「Would you like to register a workers.dev subdomain?」,说明
> `workers_dev = false` 没生效(或你把它改回了 true)。直接 Ctrl+C,加回这一行再部署即可。

### 如果 `wrangler deploy` 报 `This Worker does not exist on your account [code: 10007]`

典型输出:先 `Uploaded dragonswim-usas-proxy`,随后对
`/accounts/<id>/workers/workers/<name>` 的调用失败。**上传是成功的**,失败的是上传之后
那个元数据调用(新版 workers 端点在刚建好时可能还看不到;也可能 token 对该端点无权限)。

按顺序试:

1. 等 60 秒再 `npx wrangler deploy` 一次(索引通常很快就一致了)
2. 打开 Dashboard → Workers & Pages,看列表里有没有 `dragonswim-usas-proxy`
   - **有** → 忽略这个错误,直接绑路由(下一步),然后按下面的方法验证
   - **没有** → 用单文件退路:
     ```powershell
     cd worker
     node build-single.mjs          # 生成 dist/worker.js(约 12 KB)
     ```
     Dashboard → Workers & Pages → **Create** → Worker → 把 `dist/worker.js`
     整个粘进编辑器 → Deploy → 再绑路由
3. 仍然不行:检查 token 是否属于**持有 `dragonswim.org` 的那个账号**
   (有多账号时很容易部署到另一个账号上,表现就是「路由绑不上」)

> ⚠ 站点在 **GitHub Pages + 橙云 + SSL `Full`** 后面。绑这条路由**不需要**动
> SSL 模式,也**不要**关橙云 —— 那两件事会造成 526 / 证书警告页。

## 本机测试

```powershell
node worker/test/run.mjs        # 33 项,含 1 次真实上游请求(假 cookie 拿 401)
```

只测路由、鉴权、cookie 存取、ID token 验签;不碰 Firestore。

## 上线后怎么验证

在**已登录的** dragonswim.org 页面控制台里(会自动带上 Firebase 会话):

```js
const u = window.__firebase_user;  // 如果没有,见下面说明
```

更省事的办法是直接用网站自己的界面:教练端 → 「🔑 Data Hub 会话」→ 粘贴 cookie → 保存。
保存成功会立即跑一次 `verify`,显示「有效」。

若要看原始响应:

```js
// 在 dragonswim.org 控制台,换成你自己的登录方式拿到 token
const token = await window.__dsGetToken?.();
const r = await fetch('/api/usas/session', { headers: { Authorization: `Bearer ${token}` } });
await r.json();
```

## 教练的日常流程

1. 浏览器登录 <https://data.usaswimming.org/>
2. `F12` → Network → 过滤 `api/times` → 点开一个运动员
3. 任选一条请求 → Headers → Request Headers → `cookie:` → 右键 Copy value
4. 本站教练端 →「🔑 Data Hub 会话」→ 粘贴 → 保存(面板会立刻验证并显示"有效")
5. 点抓取。**8 小时内**都可用;过期后重做第 1–4 步

## 出错时看这里

| 现象 | 含义 | 处理 |
|---|---|---|
| `503 no_session` | 还没保存 cookie | 按上面流程粘贴 |
| `401` 且面板显示已失效 | 8 小时到点 | 重新登录 Data Hub,重贴 |
| `401 missing_token` | 前端没带上 Firebase token,或登录过期 | 重新登录本站 |
| `403 not_allowed` | 邮箱不在 `ADMIN_EMAILS` | 把邮箱加进去再 deploy |
| `502 upstream_unreachable` | 上游超时/断网 | 稍后重试 |

## 成本

Workers 免费额度:100,000 请求/天、10ms CPU/请求、50 子请求。
全队 32 名有 USA ID 的队员跑一轮约 400 个请求,占 0.4%。**不需要付费计划。**

## 安全

- 上游域名写死,路径白名单只有 `/TimesSearch/`,拒绝 `..` / `%2f` 之类的绕行。
- cookie 只存在 KV,不会回传给浏览器(状态接口只给长度和时间戳)。
- 每个请求都验 Firebase ID token 的 RS256 签名(JWKS 缓存 1 小时)。
