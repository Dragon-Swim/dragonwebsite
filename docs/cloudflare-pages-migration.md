# 托管迁移方案:GitHub Pages → Cloudflare Pages

> 目的:记录"把 dragonswim.org 从 GitHub Pages 迁到 Cloudflare Pages"这一方向的**背景、收益、做法、
> 验证清单与实施时机**,供将来择机执行。**本文档只是方案,尚未实施**——当前站点仍托管在 GitHub Pages
> (`Dragon-Swim/dragonwebsite` 的 `gh-pages` 分支)。
> 首次评估:2026-09-23(起因:当日全站 526 事故)
> 状态:**待实施 / 未排期**
> 本文档自包含,不依赖任何 `.tmp/` 中间文件;不含任何密钥或个人邮箱。

---

## 📌 当前状态快照(快速一瞥)

> 更新于 **2026-10-02**。**只看这一段也够用。**

| 项目 | 状态 |
|---|---|
| 站点 | ✅ **正常运行**(HTTP 200) |
| 托管在哪 | GitHub Pages(`Dragon-Swim/dragonwebsite` 的 `gh-pages` 分支) |
| Cloudflare 设置 | DNS = **橙云代理**;SSL/TLS 模式 = **`Full`** |
| 源站证书(GitHub 那张) | ⚠️ **已过期**(2026-09-23),卡在 `bad_authz`,靠 `Full` 模式掩盖 |
| 边缘证书(Cloudflare 那张) | ✅ 有效至 2026-11-16,**Cloudflare 自动续期,无需处理** |
| **方案①(灰云重试)** | ❌ **已于 2026-10-02 实测失败** —— 我们按社区处方**正确执行**并**等足 12 小时 49 分钟**,仍未签发 → 确认是 **GitHub 服务端卡死**,自服务无法解决(证据见 §11) |
| **长期决定(用户 2026-10-02)** | **维持现状:橙云 + `Full`。暂时不考虑迁移。** |
| 待办 | **无紧急项。** 迁移方案(方案②)保留在本文档,作为将来可选路线 |

**⛔ 两个不能碰的开关**(因为源站证书已过期且不会自愈):

1. 别把 SSL/TLS 模式从 `Full` 改回 **`Full (strict)`** → 会立刻 **526**,网站打不开
2. 别关掉 `dragonswim.org` / `www` 的**橙云代理**(改成 DNS only)→ 会出现**证书警告页**
   （**2026-10-02 已实测验证过这一条**:切灰云后访问者立刻看到证书警告,且证书签不出来时无法长期维持）

**一句话记住**:现在是"**橙云 + Full**"——能用,只是稍微不那么安全。**不要动那两个开关**,其他都不用管。

**出问题时怎么判断**(都在 Cloudflare 后台改回来即可):
- 看到 **526** → 有人把 SSL 模式改回严格了
- 看到**证书过期警告** → 有人关了橙云代理

---

## 0. 通俗版(先看这一节,不需要任何技术背景)

### 0.1 你的网站现在是"两个公司接力"在服务

访问 `dragonswim.org` 时,数据要经过两家公司:

```
访客 → [Cloudflare] → [GitHub] → 网站文件
```

- **GitHub** 是"库房":网站的 HTML / JS / 图片实际存放在那里(GitHub Pages)。
- **Cloudflare** 是"大门 + 加速器":访客先到 Cloudflare,再由它去 GitHub 取内容。

两家公司之间也要建一条**加密通道**,而加密通道需要一张证明身份的**电子证件(证书)**。

### 0.2 一共两张证件,坏掉的是里面那张

| 证件 | 谁签发 | 谁看到 | 状态 |
|---|---|---|---|
| **外面那张** | Cloudflare | 访客的浏览器 | ✅ 有效(11/16 到期,**自动续期**) |
| **里面那张** | GitHub | Cloudflare | ❌ **已过期,GitHub 没给续** |

访客看到的始终是**外面那张有效的**,所以浏览器地址栏那个小锁头一直是好的。

问题出在 Cloudflare 去 GitHub 取内容时:它要检查 GitHub 的证件,**发现过期了**。
而 Cloudflare 之前被设成"证件不合格就拒绝"(`Full (strict)`)→ 于是报 **526**,整个网站打不开。

### 0.3 我们临时做了什么,代价是什么

把 Cloudflare 的规则从"证件不合格就拒绝"改成"**照样走加密通道,但不去查证件**"(`Full`)。

- ✅ 网站立刻恢复,访客完全无感
- ⚠️ 代价:Cloudflare 不再**核对**对面到底是不是真的 GitHub。通道**依然是加密的**,
  只是少了"验明正身"这一步。这就是"安全性稍微差点"的具体含义

### 0.4 迁移是什么?一句话

**把网站文件从 GitHub 的库房,搬进 Cloudflare 自己的楼里。**

搬完之后:

```
访客 → [Cloudflare] → 网站文件(就在 Cloudflare 里)
```

只剩一跳、只剩一张证件(而且由 Cloudflare 自己签发、自己续期)。
**"里面那张证件"这个环节整个消失**,所以 526 这类故障在结构上不可能再出现。

### 0.5 现在 vs 迁移后

| | 现在(两个公司接力) | 迁移后(Cloudflare 一家) |
|---|---|---|
| 网站文件在哪 | GitHub | Cloudflare |
| 电子证件 | **两张**(外面有效、里面过期) | **一张**(Cloudflare 自管自续) |
| 会不会再出 526 | 只要不动那两个开关就不会,但结构上"随时可能" | **结构上不可能** |
| 安全等级 | 稍降(不核对对面身份) | **恢复原样**(不再需要这个妥协) |
| 11 月要做什么 | 不用做 | 不用做 |
| 更新网站的方式 | 手工 build + 推 GitHub(无任何自动化检查) | 可改成推源码 → Cloudflare 自动构建上线 |
| 费用 | 免费 | **免费**(免费额度远超本站需要) |
| 网站地址 | `dragonswim.org` | **完全不变** |

### 0.6 会员会感觉到任何变化吗?

**不会。** 网址不变、页面不变、登录 / 报名 / 成绩查询都不变。迁移可以做到**零中断**:
先在 Cloudflare 上搭一套一模一样的副本、用临时地址把登录 / 报名 / 成绩全测一遍,
确认无误后再把 `dragonswim.org` 这个"门牌号"挂过去。

### 0.7 风险与退路

- **唯一需要小心的**:有 6 项"设置钥匙"(环境变量)必须从我们这边抄到 Cloudflare 那边。
  漏了会出现**白屏**(网站能打开但一片空白)。这一点**可以在切换之前用临时地址测出来**,
  不用拿正式网址冒险。
- **退路**:老的那套(GitHub)**原样保留**。真要出问题,把门牌号挂回去,**一分钟**恢复原状。

### 0.8 四种终局,按"性价比"排序(2026-10-01 更新)

| 方案 | 效果 | 代价 | 评价 |
|---|---|---|---|
| ~~**① 长期保持灰云(DNS only)**~~ | ❌ **2026-10-02 实测失败**:按处方正确执行 + 等足 **12h49m**,仍未签发(详见 §11) | —— | ❌ **已出局**(在 GitHub 重置 ACME 授权之前不可行) |
| **② 迁移到 Cloudflare Pages** | 从根上移除这一整类故障,且**保留** Cloudflare 代理 | 需要一次迁移(可零中断、可回滚) | ⭐ **最稳** |
| **③ 让 GitHub 重置但不改 DNS** | 治好**这一次**;但代理仍在,续期很可能每约 90 天再犯 | 可能反复处理 | ⚠️ 不建议单独使用 |
| **④ 什么都不做(现状)** | 网站正常 | 安全等级稍降;两个开关不能碰 | 够用,但属"带病运行" |

> **🆕 2026-10-01 更新:讨论 #208641 收到实质回应(9/25),独立确认"代理是病根"**
>
> @Harshul1484 原文要点:
> > "The cause is the **Cloudflare proxy**. Public DNS for both `dragonswim.org` and
> > `www.dragonswim.org` returns **Cloudflare's addresses** (`104.21.33.246`, `172.67.151.252` and the
> > matching AAAA records), **not GitHub's**. To renew the certificate, GitHub has to validate the
> > domain against its own servers, and with the proxy on, that check reaches Cloudflare instead.
> > That's why the Pages API is stuck at `bad_authz` ..."
> >
> > "Keep in mind that **each renewal (roughly every 90 days) runs into the same problem while the
> > proxy is on.** So either leave these records on DNS only, or plan to switch the proxy off before
> > every expiry."
>
> 它给的处方:灰云 + apex 用 `A` 记录指向 `185.199.108.153`~`.111.153` + `www` 用
> `CNAME → dragon-swim.github.io` → 然后在 Pages 里 remove 再 add 自定义域名 → 等新证书出现、
> "Enforce HTTPS" 变可用。
>
> ⚠️ **权威级别**:该回复来自**社区成员,不是 GitHub 官方**;但结论与 GitHub 官方文档的警告
> ("指向非 GitHub IP 的记录可能阻止证书生成")**一致**。
>
> ⚠️⚠️ **最关键:我们 9/22 其实试过这条路,但那不算"试过了"**——
> 我们**只等了 20 分钟就撤回**,而且在 **4 分钟内连做了两次** remove→re-add
> (社区 @Dani-8 指出:在 ACME 挑战完成前反复重加域名会触发 **Let's Encrypt 退避**)。
> 那是一次**方式错误的尝试**,不足以判定"这条路走不通"。

### 0.9 那两个"不能碰的开关"是什么

源站(里面那张)证件**已经过期且不会自愈**。所以下面任何一件事发生,网站会**立刻**出问题:

| 动作 | 后果 |
|---|---|
| Cloudflare 的 SSL/TLS 模式从 `Full` 改回 **`Full (strict)`** | 立刻复现 **526**,网站打不开 |
| 把 `dragonswim.org` / `www` 的**橙云代理关掉**(改成 DNS only) | 浏览器直接拿到过期证件 → **证书警告页**,比 526 更吓人 |

> ⚠️ **别把"误碰"和"有计划的修复"搞混**:上表说"别关橙云",意思是**别在无意中关掉、也别忘了它现在是开着的**。
> 而修证书**恰恰需要临时切到灰云**(就是 §0.8 的方案①)——那是一次**有计划、有时限、可回滚**的操作,
> 期间那段证书警告窗口是**预期内的代价**,不是故障。区别只在于:**是意外,还是照着清单做。**

换句话说:**11 月不需要做任何事,真正要守住的只是"别动这两个开关"**。

---

### 0.10 澄清:Cloudflare Pages **不是**代码托管

这点容易误会,先讲清楚:

- **GitHub** 是"代码托管 + 网站托管":你的源代码存在 GitHub,网站也从 GitHub 发出来。
- **Cloudflare Pages** 只是"**网站托管**":它**不存你的源代码**。它是连到 GitHub 读取你的代码、
  在云端构建一次、把**构建出来的成品**(HTML / JS / 图片)放到 Cloudflare 的全球网络上。
  源代码**依然留在 GitHub**,日常改动依然是 `git push` 到 GitHub。

打个比方:GitHub 既是"仓库"又是"厨房",Cloudflare Pages 只是**接手做菜和上菜**——
菜谱(源码)还在 GitHub。所以迁移**不是**"把代码搬到 Cloudflare",
而是"把**网站的分发**从 GitHub 交给 Cloudflare"。

> 附:Cloudflare 确实有一个还在 beta 的 **Artifacts**(支持 Git 的版本化存储)产品,
> 但那是面向 AI Agent 的产物存储,不是给人用的代码托管服务,与本方案无关。

### 0.11 两个免费账号的额度对比

| | **GitHub Pages(免费)** | **Cloudflare Pages(免费)** |
|---|---|---|
| 网站从哪发出来 | GitHub | Cloudflare 全球网络 |
| 是否托管源代码 | ✅ 是 | ❌ 否(源码仍在 GitHub) |
| 月流量 | 软性限制 **100 GB/月** | **不限** |
| 站点体积 / 文件数 | 站点 ≤ **1 GB** | **20,000** 个文件;单文件 ≤ **25 MB** |
| 构建次数 | 10 次/小时(走自建 Actions 则不限) | **500 次/月**,同时只跑 1 个 |
| 单次构建超时 | 10 分钟 | 20 分钟 |
| HTTPS 证书 | GitHub 签发(**我们坏掉的就是这里**) | Cloudflare 自签自续 |
| 私有仓库 | ❌ 免费版不支持 Pages(仓库必须 public) | ✅ 支持(仓库可设为私有) |
| 预览环境 | 无 | 每次推送 / PR 自动生成临时预览网址(数量不限) |
| 自定义域名数量 | 每账号 1 个用户 / 组织站点 | 每项目 100 个 |
| 一键回滚 | 无,靠 git 手工处理 | 面板里可回滚到任一历史版本 |
| 商业用途 | ⚠️ 条款写明"不用作主要促成商业交易的免费托管" | 无此限制 |

**对本站来说,两张免费额度都远远够用。** 真正的差别不在额度,而在"**证书由谁管**"。
只有两条值得留意:GitHub 的 100 GB/月是"软性限制"(报名高峰期理论上可能被限速);
以及 GitHub 免费版要求仓库 **public**,而 Cloudflare Pages 允许仓库转私有。

> ⚠️ 顺便留意:GitHub Pages 条款明确写着不适合"主要用于促成商业交易"的网站。
> 如果你们网站上**直接在线收款**,这算迁移的又一条理由;如果费用是线下收的,就不用在意。

### 0.12 "GitHub 重置后,3 个月后还会不会再来一次?"

**理解得对:可能要做,也可能不用做。** 说透一点:

**已经确定的事实**:证书 6/25 签发、90 天有效期,到 9/22 该自动续期时**没续上**。
所以确实有"某个环节坏了"。

**不确定的是坏在哪**,两种可能都有证据:

| 可能 | 含义 | 支持它的证据 |
|---|---|---|
| **(a) Cloudflare 代理挡在前面** | GitHub 每次续期都会失败 → **每隔约 90 天复发一次** | GitHub 官方文档明确警告"指向非 GitHub IP 的记录可能阻止证书生成";社区有人实测指出代理会让验证请求到不了 GitHub |
| **(b) GitHub 自己的一次性故障**(授权卡死) | 重置后可能长期正常 | 我们**自己实测**发现挑战路径其实是通的(能看到 GitHub 的响应);社区里还有大量"DNS 完全正确、灰云、仍 36 小时拿不到证书"的案例 |

**结论**:重置能治好**这一次**;会不会再犯,要观察一个完整续期周期才知道。

**怎么观察(写在文档里,不用谁记在脑子里)**:证书到期日是公开可读的。
重置成功后记下那天的到期日,然后**在它到期前约 30 天**再查一次——

- 到期日**往后推了** → 自动续期已恢复正常,**不用再管**
- 到期日**没动** → 病根还在,到期那天又会 526,那时候就该认真考虑迁移了

**另外:有一个能让"GitHub 路线"也变耐久的前提** —— 把 DNS 长期保持**灰云(DNS only)**。
如果一直挂着橙云代理,很可能就是上面 (a) 那种情况 → 每 90 天来一次。
代价是失去 Cloudflare 的缓存与防护;而且源站证书一旦再出问题,访客会直接看到**证书警告页**
(不再是 Cloudflare 那个好看的 526 页面)。

### 0.13 "一换一"该选哪边?——对**本站**的具体分析

**结论:灰云更合适。** 而且不是勉强——这个"一换一"其实是**一边几乎为零、一边是真实折扣**。

| Cloudflare 边缘提供的东西 | 对本站的实际价值 |
|---|---|
| **DDoS 缓解** | ≈ 0。GitHub Pages 自身的边缘已有 DDoS 缓解;我们流量小,不是攻击目标 |
| **隐藏源站 IP** | ≈ 0。**在 GitHub Pages 上"源站 IP"没有意义** —— 就是 `185.199.108`~`.111.153` 这 4 个**共享**地址,几百万个站点共用,没有可藏的东西 |
| **WAF** | ≈ 0。本站是**纯静态**站点,边缘没有被攻击的服务端代码。真正的后端是 **Firebase(Firestore / Auth)** 和 **`times-api.usaswimming.org`** —— 这两条**根本不经过 Cloudflare** |
| **缓存 / CDN** | 边际收益。GitHub Pages 自带 Fastly CDN。而且 Cloudflare 的缓存**已经造成过一次线上事故**(2026-09-04:404 被缓存约 4 小时) |

→ 失去的那一边**基本是零**;换来的是**一个真实存在的安全折扣**(见下)。所以灰云更优。

**那个折扣不是纯理论,值得知道为什么**:`Full` 模式下 Cloudflare 不核对源站身份,
而这条链路上传输的是**发给登录会员的 JavaScript**。若这段代码被篡改,可能被用来窃取登录凭据。
要利用它,攻击者必须能坐在 **Cloudflare 与 GitHub 之间的网络路径**上 ——
这两家都是大型厂商、走私有互联,难度极高。**所以风险低,但不是零。**

**唯一"两全"的选项是方案②(迁移到 Cloudflare Pages)**:既保留 Cloudflare 代理,
又因为证书由 Cloudflare 自管而不再有源站证书这类问题。只是要多干活。
→ 因此合理路径:**先做①(便宜、快、可回滚);将来若想要回代理的好处,再慢慢做②。**

> ⚠️ **必须纠正一处误读**:"访问者会直接看到证书警告"**不是好处,是坏处**(体验受损)。
> 我说的"额外好处"指的是:**出问题时你会立刻知道,而不是被悄悄掩盖着**——
> 前者是代价,后者才是收获。这两件事不能混为一谈。

---

## 1. 为什么会有这个方向(起因)

2026-09-23,站点全站报 **Cloudflare Error 526 (Invalid SSL certificate)**。根因:

- GitHub Pages 为自定义域名 `dragonswim.org` + `www.dragonswim.org` 签发的 Let's Encrypt 证书
  **到期未续期**(NotBefore `2026-06-25`,NotAfter `2026-09-23T02:19:17Z`,首次续期即失败)。
- GitHub 侧 ACME authorization 卡在 **`bad_authz`**(`GET /repos/Dragon-Swim/dragonwebsite/pages`
  → `https_certificate.state = "bad_authz"`,"The ACME authorization is in a bad state. We need to
  start over.")。社区取证表明这是 GitHub 的已知问题,删除/重建 Pages 都清不掉,只能由 GitHub 重置。
- Cloudflare 处于 **Full (strict)**,拒绝回源过期证书 → 526。

**当时的处置**:把 Cloudflare SSL/TLS 模式临时改为 **Full**(不校验源站证书)→ 站点立即恢复;
DNS 保持**橙云代理**,访问者看到的是 Cloudflare 自己的有效边缘证书。源站证书**至今仍是过期的**,
只是被 Full 模式掩盖。

**结论**:只要"源站证书由 GitHub 签发"这个依赖还在,这类故障就会反复。而 Cloudflare Pages 由
Cloudflare 自己托管并管理证书,**没有"源站证书"这一层**。

## 2. 迁移后为什么这类故障会结构性消失

1. **526 不可能再发生。** Pages 项目的自定义域名由 Cloudflare 边缘直接服务,证书由 Cloudflare 签发与
   续期,**中间没有可过期、可不受信的源站证书**;ACME 也不再经过 GitHub 那条会卡死的管道。
2. **顺带消掉"Cloudflare 404 缓存"坑。** Pages 部署是原子的,每次部署自动换资源并清理缓存,
   不会再出现"新 index 引用了尚未传播的 asset 哈希 → 连环 404"那种故障(2026-09-04 曾踩过)。
3. **部署链更简单可靠。** 目前是**手工** build + 推 `gh-pages`(仓库里没有 `.github/workflows`),
   而 CLAUDE.md 已警告"build 前必须确认 `.env.local` 存在,否则白屏"——也就是说这个坑**现在完全靠
   人的记忆在兜**。改用 Pages 的 Git 集成后,环境变量存在云端项目设置里,这类人为失误一并消失。

## 3. 现状实测(迁移相关事实,2026-09-23)

| 项目 | 实测结果 | 对迁移的影响 |
|---|---|---|
| `vite.config.js` → `base` | `'/'`(根相对) | ✅ 对 apex 自定义域名天然正确,**配置无需改动** |
| 站点形态 | 多页,8 个 HTML 入口(index / dashboard / registration / signin / privacy / terms / safesport / admin) | ✅ 静态产物在 `dist/`,Pages 直接托管 |
| 生产服务端依赖 | **无**。`src/pages/dashboard.js` 中 `import.meta.env.DEV ? '/usas-api/...' : 'https://times-api.usaswimming.org/...'`,即 **dev 才走 Vite proxy,生产直连** | ✅ Pages 上**不需要任何 Function / 代理** |
| 内链形态 | 全部使用显式 `.html` | ✅ **不需要 `_redirects` 重写规则** |
| `public/CNAME` | 内容 `dragonswim.org`,被 Vite 拷进 `dist/` | ℹ️ gh-pages 时代声明自定义域名用;Pages 上无用(留着无害) |
| 静态资源 | `public/logo-dark.png`、`logo-light.jpg`、`policies/` 两个 PDF | ✅ 全部 root-relative |
| CI / 部署工作流 | **无 `.github/` 目录** → 当前为手工部署 | ℹ️ 迁移后可改为自动构建,反而更省事 |
| `firebase.json` | 只有 Firestore rules + emulators,**没有 Firebase Hosting** | ✅ 迁移不涉及 Firebase 托管 |
| 硬编码 `github.io` / `gh-pages` 引用 | 源码/HTML/CSS 中**零处** | ✅ 无死链风险 |
| 构建期必需环境变量 | **仅 6 个**:`VITE_FIREBASE_API_KEY`、`VITE_FIREBASE_AUTH_DOMAIN`、`VITE_FIREBASE_PROJECT_ID`、`VITE_FIREBASE_STORAGE_BUCKET`、`VITE_FIREBASE_MESSAGING_SENDER_ID`、`VITE_FIREBASE_APP_ID`(`.env.local` 里另 3 个 `ADMIN_*` / `TEST_*` 只供 seed/测试脚本,与站点构建无关) | ⚠️ **头号风险点**,见 §5 |

## 4. 两种接法

### 方案 A:Git 集成(推荐)
Cloudflare Pages 直接连 GitHub 仓库,从 **`main`** 分支构建源码:

| 设置项 | 值 |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variables | §3 表里那 **6 个 `VITE_*`**(Production 环境必填) |
| `NODE_VERSION` | 建议显式指定(如 `22`),避免默认 Node 版本与 Vite 6 不匹配 |

- ✅ 此后 `push main` 即自动上线;不再需要手工推 `gh-pages`
- ℹ️ 流程变化:现在是"推**构建产物**到 `gh-pages`",迁移后是"推**源码**到 `main`"。
  **`gh-pages` 分支保留不动**,用于回滚
- ⚠️ 需在 Cloudflare 侧授权 Cloudflare GitHub App 访问该仓库(仓库 public,无障碍)

### 方案 B:Wrangler 直传(改动最小)
保留"本地构建 + 部署"的习惯,只把目标从 gh-pages 换成 Pages:

```powershell
npm run build
npx wrangler pages deploy dist --project-name dragonswim
```

- 需要 Cloudflare API token(Pages:Edit 权限)
- ✅ 手工流程不变,心智负担最小
- ⚠️ 仍是手工部署,且依赖本地 `.env.local` 存在

## 5. 切换前必须验证的清单(按风险排序)

| # | 检查项 | 为什么 | 怎么做 |
|---|---|---|---|
| 1 | **6 个 `VITE_*` 已填入 Pages 项目环境变量** | 缺失 → 构建把 `undefined` inline 进去 → **白屏**(CLAUDE.md 已记录此坑) | Pages 项目 → Settings → Environment variables(Production) |
| 2 | **`times-api.usaswimming.org` 的 CORS 仍放行** | 成绩抓取依赖浏览器跨域直连 | 迁移后**来源域名不变**(仍是 `https://dragonswim.org`),理论上不受影响。⚠️ 但若用 `*.pages.dev` 预览域名测试,CORS **可能被拒**——这是**预期内的假警报**,不代表 apex 会有问题 |
| 3 | **Firebase Auth 授权域** | 登录依赖 | `dragonswim.org` 应在 Firebase Console → Authentication → Settings → Authorized domains(域名不变则无需改)。**要用 `*.pages.dev` 预览域名测登录,必须先把它加进去**,否则预览站点登录失败 |
| 4 | EmailJS 允许来源 | 若其控制台配了来源白名单 | 域名不变 → 无需改 |
| 5 | 页面完整性 | 多页站点 | 逐个打开 8 个入口页,并确认 `policies/` 两个 PDF 可下载 |
| 6 | Firestore rules | 数据层 | 无需改动,迁移不触及 |

**建议的验证顺序(关键:全程不动 DNS,零用户影响)**
1. 建 Pages 项目 + 配好 6 个 env + 首次构建成功
2. 用 Cloudflare 分配的 `*.pages.dev` 域名冒烟测试(**先把该域名加进 Firebase Auth 授权域**)
   - 已知预期差异:`*.pages.dev` 上成绩抓取可能因 CORS 被拒
3. 全部确认无误后,再把 `dragonswim.org` 作为 Custom domain 挂到 Pages 项目
4. DNS 传播后复测一遍(此时来源就是 `dragonswim.org`,与今天的线上环境一致)

## 6. 域名切换与回滚

**切换**:Pages 项目 → Custom domains → 添加 `dragonswim.org` 与 `www.dragonswim.org`。
zone 已在同一 Cloudflare 账号下,Cloudflare 会自动创建/改写所需记录。

**回滚(约 1 分钟)**:把 DNS 记录改回 `dragon-swim.github.io`,或在 Pages 项目里移除自定义域名。
`gh-pages` 分支与 `public/CNAME` 全部保留不动。

## 7. 成本与限制

- Cloudflare Pages **免费额度**:每月 500 次构建、无限请求与带宽、每项目 20,000 文件
- 本站在这些限制之下**极有余量**(若干 HTML/JS/CSS + 2 个 PDF)
- 无新增费用;DNS 本来就在 Cloudflare

## 8. 实施时机建议

- ⚠️ **避开报名/赛季高峰。** 迁移虽可做到零中断(按 §5 顺序),但切换当天仍需要人盯一会儿,
  且万一要回滚也要有人在。**不要在报名截止日、meet entry 截止日附近做。**
- ✅ 合适的窗口:赛季间歇、报名淡季、或某个低峰日的上午(便于当天复测与回滚)。
- 工作量估计:建项目+配 env 15–30 分钟;`pages.dev` 冒烟 ~30 分钟;切 apex + 复测 ~10 分钟。

## 9. 明确不要做的事(防帮倒忙)

1. ❌ **先切域名再配 env** —— 会白屏,且比 526 更难排查
2. ❌ 删 `gh-pages` 分支或 `public/CNAME` —— 回滚要用
3. ❌ 在迁移完成前动 Cloudflare **SSL/TLS 模式** —— 当前 `Full` 是站点可用性的依赖(源站证书仍过期)
4. ❌ 重复 remove→re-add GitHub Pages 的自定义域名 —— 社区取证表明会触发 Let's Encrypt 退避

## 10. 证书与到期日历(回答"什么时候需要做什么")

| 事项 | 到期 / 续期 | 需要人工做什么 |
|---|---|---|
| **Cloudflare 边缘证书**(浏览器看到的那张) | `2026-11-16T04:40:11Z`(Universal SSL,Google Trust Services,`CN=dragonswim.org`,SAN = `dragonswim.org` + `*.dragonswim.org`) | ✅ **不需要。** Cloudflare 全自动续期(校验走 DNS,而 NS 就是 Cloudflare:`ivan` / `braelyn.ns.cloudflare.com`,不经过 GitHub)。建议 10 月中下旬顺手核一次 NotAfter 是否已推后 |
| **GitHub Pages 源站证书**(CF → GitHub 那一跳) | 已于 `2026-09-23T02:19:17Z` **过期**,卡在 `bad_authz` | ⚠️ **不会自动恢复。** 但只要 SSL/TLS 保持 `Full` 且域名保持**橙云代理**,就不影响访问。要恢复它只能等 GitHub 重置 ACME(社区讨论 #208641) |
| **域名注册** | `2030-12-21`(RDAP 实测,剩 1,550 天) | 2030 年前不用管 |
| Cloudflare / Firebase / GitHub 免费计划 | 无到期概念 | 无 |

**⚠️ 唯一需要守住的纪律(比任何日期都重要)**

源站证书**已经过期**并且**不会自愈**。因此下面任何一件事发生,站点会**立刻**出问题:

| 动作 | 后果 |
|---|---|
| 把 SSL/TLS 模式从 `Full` 改回 **`Full (strict)`** | 立刻复现 **526**(CF 又开始校验那张过期证书) |
| 把 `dragonswim.org` / `www` 的**橙云代理关掉**(改 DNS only) | 浏览器直接拿到 GitHub 那张过期证书 → **证书警告页**,比 526 更吓人 |

也就是说:**11 月不需要你做任何事**,真正要守住的是"别动那两个开关"。

**2026 年 10 月中下旬的自检(30 秒)**
```powershell
# 边缘证书 NotAfter 应已推后到 2027 年
curl.exe -sS -o NUL -w "%{http_code}`n" --max-time 20 https://dragonswim.org/
# 或在 PowerShell 里读证书:
try {
  $tcp = New-Object System.Net.Sockets.TcpClient('104.21.33.246', 443)
  $ssl = New-Object System.Net.Security.SslStream($tcp.GetStream(), $false, ({$true}))
  $ssl.AuthenticateAsClient('dragonswim.org')
  $c = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($ssl.RemoteCertificate)
  "edge cert NotAfter = $($c.NotAfter.ToUniversalTime().ToString('u'))"   # 期望 > 2026-11-16
  $ssl.Dispose(); $tcp.Close()
} catch { "ERROR: $($_.Exception.Message)" }
```

---

## 11. 灰云重试操作清单(方案①,逐条照做)

> **目标**:让 GitHub 重新签发源站证书,之后长期保持灰云 → 可用性与安全等级**双恢复**,且免费。
> **为什么值得再试一次**:9/22 那次**方式错了**(只等 20 分钟、且 4 分钟内连做两次 remove→re-add),
> 不足以判定此路不通。本清单就是为了**一次做对**。
> **预计**:操作 15 分钟 + **等待 30–60 分钟(可到几小时)**。

### ⛔ 开始前必须接受的代价

- 从切灰云那一刻起,到你看到新证书为止,访问者会看到**"证书无效"警告页**。
  这是**预期内的**,不是故障 —— 因为 Cloudflare 退出链路后,浏览器直接拿到那张过期的 GitHub 证书。
- 所以:**挑低峰时段做,避开报名/赛季高峰**,并预留 1–2 小时(可能跨越到第二天)。
- 回滚很简单(见"失败怎么办"),随时可退。

### 开始前:记下回滚状态(30 秒,建议截图)

| 记录 | 现在的样子 |
|---|---|
| `dragonswim.org` | `CNAME → dragon-swim.github.io`,代理状态 **Proxied(橙云)** |
| `www` | `CNAME → dragonswim.org`,代理状态 **Proxied(橙云)** |
| SSL/TLS 模式 | **`Full`** —— **全程不要改这个** |

**回滚 = 把上面两条的代理状态改回"橙云"。** 仅此而已。

### Step 0 · 开工前核对现状(我来跑)

站点 200、`https_certificate.state` 仍是 `bad_authz`、源站证书仍是过期的 → 符合开始条件。

### Step 1 · 在 Cloudflare 改 DNS(你来点,约 3 分钟)

改成一个**和以前不同**的形态(以前的 `www → dragonswim.org` 不符合 GitHub 文档,这次修正):

| 记录 | 改成 | 代理状态 |
|---|---|---|
| `dragonswim.org` | `CNAME` → `dragon-swim.github.io` | **改 DNS only(灰云)** |
| `www` | `CNAME` → **`dragon-swim.github.io`**(原来是 `→ dragonswim.org`) | **改 DNS only(灰云)** |

- apex 用 CNAME 没问题:Cloudflare 会对 apex 做展平,效果等同 `A` 记录指向 `185.199.108.153`~`.111.153`。
- **两条的云朵都必须变成灰色。** 橙色 = 代理还开着 = 签不出来。

> 📌 **主机名拼写以实测为准(2026-10-01 更正)**:正确值是 **`dragon-swim.github.io`**
> —— org 名 `Dragon-Swim` 小写,**没有 `e`**。
> 已实测判定:`dragon-swim.github.io/dragonwebsite/` → **200**(标题 "Dragon Swim Team — Train Like a Dragon");
> `dragon-sweim.github.io/dragonwebsite/` → **404**("Site not found · GitHub Pages")。
> ⚠️ **坑**:`*.github.io` 是**通配**的,拼错的名字**一样能解析**到 GitHub 那 4 个 IP ——
> 所以**不能靠 DNS 解析判断拼写对错**,必须取内容才知道。
> ✅ **已核实(2026-10-01,由用户读取 Cloudflare 界面确认)**:`dragonswim.org` 那条记录的 Content
> **本来就是正确的 `dragon-swim.github.io`**。
> 也就是说 —— **Cloudflare 配置里从来没有错拼**;`dragon-sweim` 只是 AI 在文档与消息里的笔误,现已全部改正。
> 因此对 **apex 那条:只改代理状态(橙 → 灰),Content 不用动。**
> **回滚只取决于代理状态(橙 / 灰),与 Content 拼写无关。**

### Step 2 · 验证 DNS 真的指向 GitHub(我来跑,约 5–10 分钟传播)

必须同时满足:

- `dragonswim.org` → `185.199.108.153` / `109` / `110` / `111`
- `www.dragonswim.org` → 同样这 4 个
- **不应**再出现 `104.21.x` / `172.67.x` 这类 Cloudflare 地址

**这一步不过,就不要往下走**(否则必然又是白等)。

### Step 3 · 重置自定义域名(我来做,用 API)

- 先清空 custom domain → 保存
- **等 10–15 分钟**(社区建议:让 GitHub 释放旧的证书映射)
- 再填回 `dragonswim.org` → 保存
- ⚠️ **只做这一次。** 我做完就**交还给你**,之后**谁都不要再点这个设置**。
  反复重加会触发 **Let's Encrypt 退避** —— 那正是 9/22 失败的原因之一。

### Step 4 · 等待(★ 上次就是这里输的)

- **至少 30–60 分钟**,可能要几小时(GitHub 文档说"最多 1 小时",社区案例有 36 小时的)。
- 期间**什么都不要做**:不改 Pages 设置、不改 DNS、不改 SSL 模式。
- Pages 页面上的提示可能是 *"DNS check successful. Requesting certificate..."* 或 *"Certificate processing..."*。
- 我能帮盯就盯;若会话断了,你隔一阵问我一句"查一下证书"即可 —— **等待不需要人守着**。

### Step 5 · 怎么判断成功(任一即可)

- Pages API 的 `https_certificate.state` **不再是** `bad_authz`(变成 `approved` / `issued`);或
- 源站证书的到期日**不再是** `2026-09-23`,而是大约 90 天之后

→ 我帮你确认,然后你在 Pages 设置里勾上 **Enforce HTTPS**。

### Step 6 · 收尾(决定长期形态)

- **推荐:保持灰云不动。** 此时访问者直接拿到 GitHub 的有效证书,没有警告,
  也**不再有"不校验源站"的安全折扣** —— 等于把两个问题一起解决了。
- ⚠️ 之后再开橙云的话,下次续期(约 90 天后)会**再撞上同一个问题**。
  想既保留 Cloudflare 代理又永绝后患 → 那就是**迁移到 Cloudflare Pages**(方案②,可当纯优化慢慢做)。

### 失败怎么办(等足 1 小时仍无新证书)

1. 把两条记录的代理状态改回**橙云**(SSL 模式保持 `Full` 不动)
2. 站点会在 **30 秒内**回到现在的正常状态
3. 结论:病根不只是代理(属"平台侧卡死")→ 改走**迁移路线**(方案②)

### ✅ 成功 / ❌ 失败 之后,各自的长期状态

| | **成功**(灰云 + 新证书) | **失败**(改回橙云 + `Full`) |
|---|---|---|
| 站点可用性 | ✅ 长期稳定 | ✅ 长期稳定 |
| 安全等级 | ✅ **源站校验的折扣消失**(但同时失去 CF 边缘防护 —— 见下方第 2 点,属"一换一") | ⚠️ 稍差(CF 不核对源站身份) |
| 证书由谁管 | GitHub 自己,**自动续**(校验链路已通畅) | Cloudflare 边缘自动续;GitHub 那张永远过期、被 `Full` 掩盖 |
| **必须守住的前提** | **别再开橙云代理** —— 一开,约 90 天后的续期又会撞上同一个问题 | **别碰那两个开关**(SSL 保持 `Full`、代理保持橙云) |
| 11 月要做什么 | 什么都不用 | 什么都不用 |
| 还要不要迁移 | 可选,纯优化(而且能把 Cloudflare 代理的好处拿回来) | 推荐,属治本路线 |

**诚实的三点补充(别把"成功"理解成"永远不会有任何问题")**

1. **成功 ≠ GitHub 永远不会出故障。** 它只意味着**我们已识别的那个病因被去掉了**。
   社区里确实有"DNS 完全正确、灰云、仍 36 小时拿不到证书"的案例(属 GitHub 侧偶发)。
   若真发生:因为此时是灰云,访问者会**直接看到证书警告**,你会**立刻知道** ——
   而不是像现在这样被 `Full` 模式悄悄掩盖着。
2. **成功的代价是失去 Cloudflare 代理的好处**(缓存、DDoS 防护、隐藏源站 IP)。
   对你们这种静态小站影响很小(GitHub Pages 自带 CDN),但这确实是"换来的",不是纯赚。
3. **失败那条路是"带病运行"**:站点好,但它**对配置误操作很脆弱** ——
   任何一次把 SSL 模式改回 `Full (strict)`、或关掉橙云,都会立刻出事。

### ❌ 2026-10-02 实测结果:方案①失败(这次是"正确地失败")

| 我们做对的事 | 证据 |
|---|---|
| 灰云 + DNS 只指向 GitHub | 18:46 实测 apex / www 均**只**解析到 `185.199.108`~`.111.153`,无 Cloudflare 地址(本地解析器 + Cloudflare DoH 双验证)|
| `www` 修正为 `CNAME → dragon-swim.github.io` | 已在 Cloudflare UI 核对确认 |
| 移除自定义域名后**静置 12 分钟**,再**只重新添加一次** | `18:47` 移除 → `18:59:38` **第一次尝试即加回成功** |
| ACME 挑战路径由 GitHub 应答 | → GitHub 的 404(带 `X-GitHub-Request-Id`),无重定向 |
| **等足 12 小时 49 分钟**,期间未碰任何设置 | 过夜 112 次(5 分钟间隔)+ 之前 3 小时(1 分钟间隔);`cert=bad_authz` / `originNotAfter=2026-09-23` / `https=000` **全程无一次变化** |

**结论**:在完全符合社区处方与 GitHub 文档的条件下等待 12h49m 仍未签发 →
属于 @STATUS-Z 在 `#204388` 描述的**"平台侧卡死的授权"(terminal authorization)**:

> "If the Pages API still returns an expired `bad_authz` object after a full domain remove + wait
> (~30–60 min), this is usually a **platform-side stuck authorization** — open a ticket ...
> Support can clear terminal ACME auth that self-service cannot."

→ **这消除了 §0.12 的不确定性**:不是代理、不是操作方式,而是 **GitHub 服务端本身卡死**,自服务无法解决。
→ **方案①在 GitHub 重置之前出局。**

**⚠️ 一个必须记住的连带结论**:灰云**只有在"有有效证书"时**才是好方案。
证书签不出来时,灰云会让访问者**直接看到证书警告** —— 所以**灰云不能作为当前的长期方案**。

**当场处置**:两条记录**改回橙云**(SSL 模式保持 `Full` 不动)→ 站点在 TTL(300s)后恢复。
验证:边缘证书 `NotAfter=2026-11-16` 未过期;apex **200** / www **301**;普通请求连测 4 次全 **200**。
（过程中 apex 一度报证书错误,是**本地 DNS 缓存滞后**(TTL 300),刷新后即正常 —— 与 9/23 那次同一现象。）

**后续**:已向讨论 #208641 追加英文跟进(说明本次完整尝试与结果,再次请求重置 ACME 授权),
正文见 `.tmp/cf526/github-support-ticket-dragonswim-org.md` §八。
**长期决定(用户 2026-10-02)**:**维持橙云 + `Full`,暂时不考虑迁移。**

### 七条铁律

| # | 铁律 |
|---|---|
| 1 | ✅ 灰云这一步**必须**做,否则签不出来 |
| 2 | ⚠️ 至少等 **30–60 分钟**,不许 20 分钟就判死刑 |
| 3 | ❌ **只做一次** remove→re-add,之后不许再碰 |
| 4 | ❌ 等待期间不改 SSL/TLS 模式(保持 `Full`) |
| 5 | ❌ 不改 DNS 做"多试几次" |
| 6 | ✅ 失败就改回橙云,站点秒恢复,不损失什么 |
| 7 | 📝 无论成败,把结果告诉 AI,更新本文档 |

---

## 附:本次评估的可复现命令

```powershell
# 构建与站点形态
Get-Content package.json          # scripts: build = vite build
Get-Content vite.config.js        # base: '/',8 个 HTML 入口
Get-ChildItem public              # CNAME / logo / policies
Get-ChildItem dist                # 构建产物结构

# 生产是否依赖服务端代理
Select-String -Path (Get-ChildItem -Recurse src -Include *.js).FullName -Pattern "usas-api|times-api"

# 是否有 CI / 部署工作流
Test-Path .github                 # False -> 无 Actions,当前为手工部署

# 是否有硬编码的 github.io 引用(迁移死链风险)
Select-String -Path (Get-ChildItem -Recurse -Include *.js,*.html -Path src,public).FullName -Pattern "github\.io|gh-pages"

# 域名注册到期
curl.exe -sS "https://rdap.publicinterestregistry.org/rdap/domain/dragonswim.org"
```
