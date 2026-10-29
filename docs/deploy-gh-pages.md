# 部署：gh-pages（当前生产链路）

> 站点 `dragonswim.org` 由 **GitHub Pages** 提供，前面挂 **Cloudflare 橙云代理 + SSL `Full`**。
> Cloudflare Pages 迁移**尚未实施**（见 `docs/cloudflare-pages-migration.md`），所以现在只有这一条路。
> 最近一次实测：**2026-10-29**（部署「确认稿 + 全队报告」）。

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

## 回滚

```powershell
git -C $g log --oneline -5          # 找上一个 deploy: 提交
git -C $g revert --no-edit <sha>    # 或 checkout 那个提交的内容再提交
git -C $g push origin gh-pages
```

`main` 的 `dist/` 同步回滚同样的两个提交，避免两边漂移。
