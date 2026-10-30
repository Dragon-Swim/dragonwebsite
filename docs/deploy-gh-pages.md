# 部署：gh-pages（当前生产链路）

> 站点 `dragonswim.org` 由 **GitHub Pages** 提供，前面挂 **Cloudflare 橙云代理 + SSL `Full`**。
> Cloudflare Pages 迁移**尚未实施**（见 `docs/cloudflare-pages-migration.md`），所以现在只有这一条路。
> 最近一次实测：**2026-10-30 傍晚**（部署「接力进报告 + 四棒之和 + bonus 名额校验 + USAS 去重」，
> Pages 构建 45 秒完成；当天早些时候有一次 Actions/Pages 的 degraded performance 事件，
> 构建排队约 **11 分钟**才完成 —— 不是推送问题，卡住时先用
> `gh api repos/Dragon-Swim/dragonwebsite/pages/builds/latest --jq .status` 看
> `building` 还是 `errored`，再看 githubstatus.com）。

## 部署记录（回滚时用得上）

| 时间 | 内容 | 规则 | gh-pages | main |
|---|---|---|---|---|
| 10-30 傍晚 | 接力进报告 + 四棒之和 + bonus 名额 + USAS 去重 | 无变更 | `8c269b2` | `b14208a` |
| 10-30 下午 | Results 页 DQ 徽章 | 无变更 | `fa18539` | `044e70f` |
| 10-29 下午 | 教练端接力选人 | ✅ 新增 `relayEntries` | `8ebf014` | `4c4d8b2` |
| 10-29 中午 | 确认稿 + 全队报告 | 无变更 | `9e95b5c` | `18f8142` |


## 三段流程

```powershell
# ① 只有 firestore.rules 变了才需要（顺序：先规则、后站点）
firebase deploy --only firestore:rules --project dragonwebsite-db

# ② 构建（务必先确认 .env.local 存在，否则 VITE_* 会被内联成 undefined → 白屏）
Test-Path .env.local
npm run build

# ③ dist → gh-pages 仓库 → 提交并推送
#    gh-pages 是同一个仓库的另一个分支，单独 clone 在 ..\dragonwebsite-gh-pages
```

### ③ 的可靠做法（**不要用 robocopy /MIR**）

```powershell
$g = 'J:\MyDocuments\GitHub\Dragon-Swim\dragonwebsite-gh-pages'
$d = 'J:\MyDocuments\GitHub\Dragon-Swim\dragonwebsite\dist'

# 清掉旧构建（保留 .git 与 .gitignore），再拷新构建
Get-ChildItem $g -Force | Where-Object { $_.Name -notin @('.git', '.gitignore') } |
  ForEach-Object { Remove-Item $_.FullName -Recurse -Force }
Copy-Item (Join-Path $d '*') -Destination $g -Recurse -Force

git -C $g add -A
git -C $g commit -m "deploy: <一句话>"
git -C $g push origin gh-pages
```

## ⚠️ 踩过的坑：`robocopy /MIR` 会删掉 `.git`

2026-10-29 实测：`robocopy dist $g /MIR /XD '.git'` **仍然把 `$g\.git` 删掉了**
（`/XD` 只对源目录扫描生效，`/MIR` 的"清理多余项"照样清目标里的 `.git`）。
后果：本地 clone 失去 git 元数据。远端分支不受影响，恢复方式是重新 clone：

```powershell
cd J:\MyDocuments\GitHub\Dragon-Swim
git clone --branch gh-pages https://github.com/Dragon-Swim/dragonwebsite.git dragonwebsite-gh-pages
```

所以 **gh-pages 目录永远只用手动清空 + 拷贝**，不要对仓库目录跑镜像/同步工具。

## 别忘的两件事

1. **`dist/` 在 `main` 里是被跟踪的**（44+ 文件）。每次部署还要在 main 提交一次
   `chore(dist): rebuild for <改动>` 并推送，两边保持一致。
2. **gh-pages 有自己的 `.gitignore`**（不是 main 那份）。`git add -A` 之前确认
   `.env.local` / `.env` / `credentials.json` / `token.json` / `serviceAccountKey.json`
   都在里面 —— 内容已在仓库里，但它和 main 是分开维护的。

## 部署后验证

GitHub Pages 构建约 30–60 秒。验证这三样，别只看首页 200：

```powershell
# 新增的页面能打开（这里是 2026-10-29 的例子）
(Invoke-WebRequest https://dragonswim.org/meet-print.html -UseBasicParsing).StatusCode   # 200
# 新页面的资源存在（hash 取自 dist/meet-print.html）
(Invoke-WebRequest https://dragonswim.org/assets/meet-print-CntYB1Qj.js -UseBasicParsing).StatusCode
# 首页引用的 bundle 已经是新的那一个
(Invoke-WebRequest https://dragonswim.org/dashboard.html -UseBasicParsing).Content -match 'dashboard-[A-Za-z0-9_-]+\.js'
```

想确认某个功能真的进去了，直接抓线上的 bundle grep 关键字（例如
`dashboard-DijkgkAC.js` 里搜 `meet-print.html`，应该出现 2 次：卡片入口 + 报名弹窗入口）。

### ⚠️ 验证新哈希资源时必须加 cache-buster

2026-10-29 实测踩到：部署后直接请求新哈希的资源 `…/assets/dashboard-gljH0kOE.js` 返回 **404**，
看着像"推送没生效"，其实 GitHub Pages 早就有了 —— 是 **Cloudflare 对那个路径做了负缓存**
（404 被记住），换个 URL 就 200。

所以判断"新资源到底有没有上线"，**永远加一个随机查询串**：

```powershell
$cb = [guid]::NewGuid().ToString('N')
(Invoke-WebRequest "https://dragonswim.org/assets/dashboard-gljH0kOE.js?cb=$cb" -UseBasicParsing).Content.Length
```

三条判据，按顺序用，别单看一条：

| 现象 | 含义 |
|---|---|
| `dashboard.html` 引用了新哈希 | **最可靠的信号** —— HTML 是 `DYNAMIC`，不缓存 |
| 新哈希资源带 `?cb=` 得 200 | 文件在 Pages 上，边缘只是记了个旧的 404 |
| 裸 URL 404、带 `?cb=` 200 | 就是负缓存，**不是部署失败**；等 TTL 或忽略 |

`dashboard.html` 的 `cf-cache-status` 应为 `DYNAMIC`、`x-cache: MISS`；如果哪天变成 `HIT`，
说明 HTML 本身被缓存了，那时才需要**真的**去 Cloudflare 清缓存。


## 回滚

```powershell
git -C $g log --oneline -5          # 找上一个 deploy: 提交
git -C $g revert --no-edit <sha>    # 或 checkout 那个提交的内容再提交
git -C $g push origin gh-pages
```

`main` 的 `dist/` 同步回滚同样的两个提交，避免两边漂移。
