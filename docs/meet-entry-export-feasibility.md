# 用网站替代 Team Manager：报名导出可行性备忘

> 目的：记录 2026-10-29 的可行性评估结论与证据，供后续动手时直接接续，不必重新摸底。
> 状态：**评估完成，未开工**。等待「接力的实际报法」与开工决定。
> 相关：`docs/meet-entries.md`（报名功能现状）、`.tmp/handoff/handoff-2026-10-28-meet-entries.md`（上一阶段交接）
> 调研全文：`.tmp/hytek-research/hytek-entry-formats-report.md`

---

## 0. 一句话结论

**可行，且成本比预想低。** 真正的门槛不在技术（`.cl2` 是公开规范的 SDIF v3，照表填即可），
而在**主办方是否接受我们生成的文件**——这一步只能靠一次真实导入来证明。

---

## 1. 格式事实（推翻旧判断）

`docs/meet-entries.md` §6 曾写「`.hy3` 入队文件：暂不做，格式无公开规范」。这个前提**部分不成立**：

| 文件 | 方向 | 实质 | 公开规范? |
|---|---|---|---|
| `.hyv` / `.ev3` | Meet Manager → Team Manager（主办方发给教练） | 分号分隔变长文本 | 无官方规范，但**纯文本可直读** |
| **`.cl2`** | Team Manager → Meet Manager | **SDIF v3**，定长 160 字符 + CRLF | ✅ **有**（USA Swimming, 1998-04-28） |
| `.hy3` | Team Manager → Meet Manager | Hy-Tek 自有格式，定长 130 字符 | ❌ 无，且有 2 位校验码 |

三条硬事实：

1. **`.cl2` = SDIF v3**。Hy-Tek 官方把 "CL2" 与 "SD3" 当同义词；Meet Manager 明确支持导入
   「其他厂商软件生成的 meet entry SD3」。
2. **SDIF v3 没有校验码**。规范修订记录第 3 条原文：
   > "Remove all **checksum** fields. The resulting space will be for future use."
3. **记录长度**：规范写「每条记录 162 字节，前 160 字节数据 + CRLF」。
   实测样本 177 × 162 = **28,674 字节，分毫不差**。

> 注：Hy-Tek 自己的 `.cl2` 在 bytes 146–148（规范里的 "future use" 区）塞了 `N##`（如 `N18`）。
> 规范要求这块**必须留空**，我们生成时留空即可，比 Hy-Tek 自己写的还合规。
> 而 `.hy3` 的行尾 2 位才是真校验码（社区逆向文档有算法，非官方）。

### 1.1 已逐字段验证（D0 记录，按规范切片，全部对位）

```
D01PV      Chen, Haoran E      8B1279F2394C USA0309201115MM 500 1 2F 15OV  5:10.86Y
  12/28姓名      40/12 USS#  53/3国旗 56/8生日 64/2龄 66/1性别 68/4距离 72/1泳姿
                                        73/4项目号 77/4年龄组 89/8报名成绩 97/1 course
```

其余字段表（写 writer 时照抄规范）：`98/8` prelim time、`107/8` swim-off、`116/8` finals、
`125/2` prelim heat、`127/2` prelim lane、`133/3` prelim place、`143/2` event time class、
`145/1` flight status、`146/15` future use。记录顺序：`A0 → B1 → (C1 → C2 → D0/D3) → Z0`，
接力是 `E0`（队）+ `F0`（4 棒次 + 替补）。

---

## 2. 手上的样本（都在 `.tmp`）

| 路径 | 是什么 | course | 项目行 | 年龄区间 | 接力 |
|---|---|---|---|---|---|
| `.tmp/meet-entry/samples/events/27-41/` | 主办方 `.ev3`+`.hyv`，RMSC 12/10（PVI-27-41） | `YLS` | 152 | 0-10 / 11-12 / 13-14 / 15-109 / 0-12 / 0-109 | **32 行** |
| `.tmp/meet-entry/samples/events/27-29/` | PV November Open 11/13（PVS-27-29） | `YO` | 89 | 9-10 / 11-12 / 13-14 / 15-109 | 0 |
| `.tmp/meet-entry/samples/events/27-21/` | FXFX Loughmiller 11/6（PVI-27-21） | `YO` | 118 | **0-8** / 9-10 / 11-12 / **13-109** | 0 |
| `.tmp/hytek-research/27-20-events.zip` | Marlins Invitational 11/6 | `Y` | — | — | — |
| `.tmp/hytek-research/27-31-events.ev3` | Swim & Rock 11/20 | `YO` | — | — | — |
| `.tmp/meet-entry/samples/exports/pv-nov-2026/` | **我们的导出件**：PV November Open 11/13（`.CL2`+`.HY3`） | `Y` |
| `.tmp/meet-entry/samples/exports/lc-champs-2026/` | **我们的导出件**：FXFX Summer Solstice LC Champs 6/26 | `L` |
| `.tmp/meet-entry/samples/reports/nov open name entry.pdf` 等 3 份 | TM 打印的 "Individual Meet Entries Report" | — |

四种 course（`Y`/`YO`/`YLS`/`L`）都覆盖了，导入器可以拿四种配置测试。

### 2.1 样本规模

| | 记录数 | 明细 |
|---|---|---|
| Nov Open `.CL2` | 177 | `A0`1 `B1`1 `C1`1 **`D0`145** `D3`28 `Z0`1 |
| Nov Open `.HY3` | 179 | `A1/B1/B2/C1/C2/C3` 各 1，**`D1`28 `E1`145** |
| LC Champs `.CL2` | 233 | `D0`193 `D3`36 |

---

## 3. 已完成的交叉校验

### 3.1 官方 `.ev3` vs 库内 27-41 项目表 → **118/120 行逐字一致**

用 `.ev3` 的 152 个项目行比对 `meets/vkDgi3WA3w8AgEbkq5Li.events`（我们由 PDF 解析出的 152 行）：

```
exact=118  differing=2  notFound=0  relaysSkipped=32
```

2 处差异（都是 12&U 500 自的 LCM 线，差 4 秒）：

| 项目 | 我们（PDF 解析） | 官方 `.ev3` |
|---|---|---|
| #33 12&U 女 500 FR | LCM 5:25.99 | LCM **5:29.99** |
| #44 12&U 男 500 FR | LCM 5:23.99 | LCM **5:27.99** |

两行都在「合并单元格」区域（`docs/meet-entries.md` §1.1 警告过的坑）。
**结论：赛程数据应改用 `.ev3` 导入，替掉 PDF 解析**——更权威，也少一类解析风险。

### 3.2 PDF 报告 vs `.CL2` → 只能部分交叉

`nov open name entry.pdf` 打印于 **10/25**，`.CL2` 导出于 **10/26 17:13**；
PDF 解析出 26 人 / 134 条，`.CL2` 是 145 条 → 中间改过 11 条。**不能当逐条金标准**，
只能验证「人 + 项目 + 成绩」的语义映射。

### 3.3 我们导出的 145 条报名 vs 官方 27-29 项目表 → **145/145 全对**

用 `27-29-events`（PV November Open 官方 `.ev3`，89 个项目行）校验我们自己的 `.CL2`：

```
matched = 145   unmatched = 0
```

包括年龄码的翻译都对得上：

| `.CL2`（SDIF `EVENT AGE`） | `.ev3`（min-max） |
|---|---|
| `15OV` | 15-109 |
| `1314` | 13-14 |

**含义**：导出的报名与官方项目表在项目号、距离、泳姿、年龄组上完全一致——
writer 的输入侧数据是可靠的，剩下要验证的只有「写出来的字节能不能被 MM 吃」。

### 3.4 新发现：**年龄组结构是每个比赛自己定的**

三个 Y 池比赛的年龄分区互不相同：

| 比赛 | 年龄区间集合 |
|---|---|
| 27-41 RMSC | 0-10 / 11-12 / 13-14 / 15-109，外加合并组 0-12（12&U）与 0-109（Open） |
| 27-29 PV Nov Open | **9-10** / 11-12 / 13-14 / 15-109（没有 Open、没有 0-8） |
| 27-21 Loughmiller | **0-8** / 9-10 / 11-12 / **13-109**（13 岁及以上合并，没有 13-14/Open 之分） |

而 `src/utils/meetEligibility.js` 目前把标签**写死**成 PVS-27-41 的那套
（`ageGroupForMeetAge` → `'10&U' / '11-12' / '13-14' / 'Open'`，
`enterableGroupsForAgeGroup` 只认这几个 + `'12&U'`）。
换成 27-21 的 `0-8` / `13-109` 就会全部匹配不上——**报不了名，或报错项目**。

另有一个已存在的坑：27-41 里 `15-109` 既对上 `13-14` 又对上 `Open`（1650/1000 自由泳共用项目号的合并行），
说明**按标签匹配本身就不可靠**。

---

## 4. 数据库现状（2026-10-29 实测）

```
meets: 7 场，只有 Riley Eaton (vkDgi3WA3w8AgEbkq5Li) 有 events=152 / sessions=10
       其余（含 Loughmiller 11/6、PV November Open 11/13）只有名字和日期，events=0
entries: 全部 0        ← 报名功能已上线，但生产环境还没人报过
registrations: 46 家 / 64 名泳手 / 32 人有 USA Swimming ID
swimResults: 32 份，全部有 bestTimes   ← 正好对应那 32 个有 ID 的人
usas Worker: https://dragonswim.org/api/usas/session → 401（路由已上线且鉴权生效）
```

**含义**：① 不能"用库里数据复现 11/13"（库里没有那场的报名）；② 实际可报人群是那 32 人，
另外 32 人没有 USA ID；③ 成绩自动抓取的链路是活的，但用之前要教练贴一次 Data Hub cookie（8 小时寿命）。

---

## 5. 设计要点（评估过程中定下来的）

1. **seed time 必须在导出时重算，不能用提交时的快照**。
   现在 `entries.events[].seedTime` 是家长提交那一刻的值。11/6、11/13 两场之后成绩会刷新，
   照快照导出 = 带旧成绩（排道次吃亏，达标/bonus 判定也会错）。
   → 导出流程：先跑 Data Hub 增量 → 逐条重解析最新 PB → 显示"有 N 人成绩刷新"→ 再生成文件。
   家长确认稿同样用重算后的成绩，避免确认与实际提交不一致。
2. **达标 / bonus 也要在导出时重判**，不能沿用报名时的结论。
3. **`Z0` 结束记录要填统计**（规范 `44/3` B 记录数、`50/4` C 记录数、`58/6` D 记录数、
   `64/6` 不同泳手数等），导出的自校验可以拿它当断言。
4. **只有 `confirmed` 的进导出**；缺 seed time 的、没有 ID 的整条列出来（`docs/meet-entries.md` §3.3）。
5. **生成的文件仍要打包成 zip** 发给主办方（TM 导出的就是一个含 `.cl2`+`.hy3` 的 zip）。
6. **年龄组改成"按数值区间匹配"，不再按标签匹配**（见 §3.4）。
   现成的 `(min,max)` 就在 `.ev3` 每个项目行里；判据用 `min <= age <= max`，
   标签只做显示。这样换任何一场比赛都不用改代码，也顺手解决 27-41 合并行的老问题。

---

## 6. 未决事项

1. ~~**接力今天到底怎么报的？**~~ ✅ **已解决（2026-10-29）**：
   拿到上赛季同一场比赛（26-45，2025-12-11）我们发出去的报名件，里面有 **7 个接力队**，
   两种格式的接力记录都解码了（见 §11）。原来那批样本（27-29 / 27-31 / Solstice）都没有接力，
   因为那几场本身没有接力项目。
2. 有没有别的场次（尤其带接力的）导出件可得？—— 教练暂时没有，但现在这份足够解码。
3. 开工时间 —— 教练说"先别急"（阶段 A/B/C 已做完，D/E 待排）。

---

## 7. 分期与时间线（对着 RMSC 12/1 20:00 ET 截止倒推）

| 阶段 | 内容 | 状态 |
|---|---|---|
| **A 赛程入库** | `.ev3` 导入器（替掉 PDF 解析）+ 年龄组数值匹配 | ✅ 2026-10-29 完成（`d468df0` / `d3e2a4f`，三场已写入生产） |
| **B 导出准备** | 组行 + **成绩重算** + 校验 + 工作表 CSV | ✅ 2026-10-29 完成（见 §10.5） |
| **C 确认稿** | 给家长的打印页（独立 Vite entry + 浏览器打印） | ✅ 2026-10-29 完成（见 §10.6） |
| **D 入队文件** | **SDIF v3 writer**（产出 `.cl2`），拿 11/13 那份做回归比对 | ✅ 2026-10-29 完成（见 §10.9；4602 字段仅 2 处非数据差异） |
| **E 接力** | `E0`/`F0` + 教练端点选 | ✅ 2026-10-29 完成（§10.11 格式/模型/导出，§10.12 界面）；成绩校验挂起（§10.13） |

| 时间 | 门 | 内容 |
|---|---|---|
| 11/10 前 | Gate A | 阶段一完成 |
| 11/10 前 | Gate A2 | 阶段二完成，回归比对通过 |
| 11/17 前 | Gate B | 用刷新后的成绩生成 RMSC 草稿 → 发主办方试导入 |
| 11/25 前 | Gate C | 家长确认回收、教练最终确认、正式导出 |
| 12/1 20:00 | Gate D | 提交截止 |

**试导入邮件必须写明**「新流程生成的首份文件，请确认能否正常导入，最终版以 12/1 前提交为准」——
否则容易被当正式报名，改起来还可能踩 RMSC「手动报名加收 $50」那条。

---

## 8. 相关代码位置

| 内容 | 位置 |
|---|---|
| 报名数据处理（纯函数，445 行） | `src/utils/meetEligibility.js`（`buildBestTimesIndex` / `evaluateEvent` / `validateSelection`） |
| 报名弹窗 | `src/components/meetEntries.js` |
| 赛程 PDF 解析（拟被 `.ev3` 导入器取代） | `execution/meet-entry/parse_pvs_meet_pdf.py` |
| 写 meet 到 Firestore | `execution/data-admin/add_meet.mjs --from-json` |
| TM 报名报告 PDF 解析（已有，自带人数自校验） | `execution/meet-entry/extract_hytek_entries.py` |
| CSV 工具 | `src/utils/csv.js` |
| 推荐新增 | `src/utils/meetEntryExport.js`（组行/校验/CSV/SDIF 文本）、`src/pages/meet-print.html` + `.js`（独立 Vite entry） |

### 8.1 验证脚本（2026-10-29 整理后的位置）

一次性的探针（`db-audit.cjs` / `crosscheck*.cjs` / `sdif-verify.cjs` / `analyze.cjs` 等 40 多个文件）
已经删掉 —— 它们的作用被单测（`tests/unit/verify-sdif.mjs` 等）和本文档的结论取代。
留下的是**证据生成器**，在 `.tmp/meet-entry/tools/`：

```
.tmp/meet-entry/tools/sdif-roundtrip.mjs           # 个人项目:4,602 字段回归(2 处已知差异)
.tmp/meet-entry/tools/sdif-relay-roundtrip.mjs     # 接力:3,484 字段回归(零意外差异)
.tmp/meet-entry/tools/verify-live-eligibility.mjs  # 线上真实数据冒烟(只读)
.tmp/meet-entry/tools/build-report-preview.mjs     # 重出全队报告版式截图
```

样本目录的导航见 `.tmp/meet-entry/README.md`（含"⛔ 别删"清单与常用命令）。

---

## 9. 出处

| 内容 | 链接 |
|---|---|
| SDIF v3 规范全文（1998-04-28） | https://www.usms.org/admin/sdifv3f.txt |
| Hy-Tek：MM 导出赛事文件给 TM（`.ev3`/`.hyv`） | https://hytek.active.com/user_guides_html/swmm8/exporteventfortm.htm |
| Hy-Tek：TM 导出报名（一个 zip 内含 `.cl2`+`.hy3`） | https://hytek.active.com/User_Guides_HTML/SwTM8/HTML/exportmeetentries.htm |
| Hy-Tek：MM 支持的导入格式（含其他厂商的 SD3） | https://hytek.active.com/user_guides_html/swmm6/exportimport.htm |
| PVS 赛事文件下载根 | https://www.files.pvswim.org/ |

---

## 10. 已落地（2026-10-29）

阶段一 + 阶段二的口径改造完成。**没有动 `dashboard.js` / `meetEntries.js` 的界面逻辑**，
线上行为由单测锁死。

### 10.1 新增工具：`.ev3` 赛程导入器

`execution/meet-entry/parse_hytek_events.py`

```powershell
python execution/meet-entry/parse_hytek_events.py .tmp/meet-entry/samples/events/27-41-events.zip `
    -o .tmp/meet-entry/imports/27-41.json `
    --sessions-from .tmp/meet-27-41/events.json `
    --deadline "2026-12-01T20:00:00-05:00"
```

回归结果（对照 PDF 解析出来的线上数据）：

```
152 行 → 150 行完全一致,2 行差异正好是 §3.1 里那 2 行 LCM 错位
场次 10 条逐字段一致(含决赛场次;.ev3 里没有决赛的场次号,已标 _noEntries)
元数据:日期/地点/赛季/费用/限额/达标期/定龄日 全对
```

三场实测都能解析：27-41（152 行，有达标线）、27-29（89 行，整场无达标线 + 32 行混合项目）、
27-21（118 行，整场无达标线 + `0-8`/`13-109` 分区）。

**过程中踩到并写进代码的四个坑**（都在脚本注释里）：

1. `.ev3` 的 `field[21]` 是**整场赛程里的场次序号**，不是"第几个预赛场次"——27-41 只有
   1,2,3,5,6,8,9（缺的 4/7/10 是决赛）。按出现顺序重编号会让整个场次表错位。
2. 性别码有三套：`W/M`、`G/B`，还有 `F` 和 `X`（混合项目）。漏掉 `X` 会静默丢掉 27-29 的
   32 行混合项目。
3. `openToAll` **不能只按数字推**：PVS 的 Open 组编码成 `15-109`（对任何年龄开放），
   而 Loughmiller 的 `13-109` 真是"13 岁及以上"。判据是"下限 0 或 15 + 上限 ≥100"。
4. 达标期起点 `01/01/1970` 是 Hy-Tek 的"没有达标期"哨兵值 → 归一成 `null`。

### 10.2 改动：年龄组改数值匹配

`src/utils/meetEligibility.js` 新增 `groupLabelForAge()` / `isEventEnterable()`：

- 有 `ageMin`/`ageMax` → **数值区间判断**（`openToAll` 的行任何年龄都能报）
- 没有（线上现有文档）→ 回退到旧的标签白名单 `enterableGroupsForAgeGroup()`
- `gender:"X"` 的混合项目对男女都可见
- `buildMeetOptions()` 的本组标签改为从**本场比赛自己的分区**取

`execution/data-admin/add_meet.mjs` 的 gender 校验放开到 `F/M/X`。

单测从 84 条扩到 **106 条**（`tests/unit/verify-meet-eligibility.mjs` 新增 §12/§13），
其中一条是**等价性断言**：同一个人、同一批项目，走数值区间和走旧标签必须得到
**完全相同的可选项目集合** —— 这条保证这次改造没有改变线上行为。

### 10.3 年龄口径已从原始文件核实

27-41 赛程单正文原文：

> "Swimmers will compete at the age attained on the first day of the meet."

`.ev3` 的 `field[4]` 就是这个定龄日（27-41 / 27-29 / 27-21 / 27-31 四场实测都等于起始日）。
代码读该字段而非假定首日；`ageDeterminedOn` 与首日不同时会打印提示。

### 10.4 已写入生产（2026-10-29）

新增 `add_meet.mjs --events-only`（只写报名相关字段，不动 name/location/sourceUrl/status 等），
然后对三场各做一次 `--events-only --update`：

| docId | 比赛 | 写入结果 |
|---|---|---|
| `vkDgi3WA3w8AgEbkq5Li` | 27-41 Riley Eaton | events 152 行**全部带上 `ageMin/ageMax/openToAll`**；**修掉那 2 行 LCM 错位** |
| `CxNNkcs5kVYJlDpGeqyN` | 27-21 Loughmiller | events 118 行 / sessions 6 条（日期空） |
| `uFRYpTA9ujFT2DuslBYo` | 27-29 Nov Open | events 89 行 / sessions 7 条（日期空） |

修复前后（27-41，12&U 500 自）：

```
#3 女  LCM 5:25.99 → 5:29.99      #4 男  LCM 5:23.99 → 5:27.99
```

**没动的**：name / location / sourceUrl / status / startDate / endDate / season。
两场过期比赛的库内名字与场地比 `.ev3` 准确（27-21 有具体场馆楼栋、27-29 的 `.ev3` 是
"add your facility" 占位符），所以只用 `--events-only` 补项目表，不覆盖元数据。

**家长侧仍然是关闭的**：三场都没有 `entriesOpenToFamilies` 字段，
`renderSwimMeets()` 的开关逻辑（`canEnter || m.entriesOpenToFamilies === true`）对家长恒为 false。
27-21 / 27-29 的场次没有日期（`.ev3` 不含日历），它们的 `maxPerDay` 实际上无法校验 ——
所以**这两场只能当回归夹具，不要开给家长**；它们本身也已过期（10/26、10/30 截止）。

**端到端冒烟（只读，线上数据）**：拿 32 名有 USA ID 的泳手跑三场，

```
27-41   13 岁 → group=13-14, 本组 17 项 / Open 17 项 / 接力 10 项
27-21   13 岁 → group=13&O , 本组 15 项 / Open  0 项          ← 与 PVS 的区别生效
27-29   12 岁 → group=11-12, 本组 15 项 / Open 14 项（含混合项目）
```

### 10.5 阶段三第一部分已落地：导出组行 + 成绩重算 + 工作表 CSV

`src/utils/meetEntryExport.js`（纯函数，零 DOM / 零 Firestore）：

- `resolveSeedTime()` —— **导出时重算 seed time**（`swimResults` 内达标期最好成绩 → 手填值 → `missing`），
  并保留快照值做"家长看到 vs 现在提交"的对比，与家庭端同源（同一套 `buildBestTimesIndex`/`evaluateEvent`）
- `buildExportRows()` —— 只放行 `confirmed`；`draft`/`submitted`/`declined` 与"无 USA ID"分别列出原因
- `validateExport()` —— error：缺成绩 / 缺 ID / **导出时重算**的 `maxEvents`、`maxPerDay`；
  warning：未确认 / 成绩已刷新 / 只能算 bonus
- `toWorksheetCsv()` —— 16 列、全引号、CRLF、UTF-8 BOM，`Changed` 列直接给 `1:12.53 → 1:11.03`
- `groupRowsBySwimmer()` —— 确认稿要的分组形状（按姓排序、每人一份）

测试：`tests/unit/verify-meet-entry-export.mjs`（57 项）。单测总入口现在 8 个脚本全绿。

**线上彩排（只读）**：拿 27-41 的真实项目表 + 3 名真实泳手的真实成绩，造一份"已确认报名"跑通全链路：

```
9 行 / 3 人 / 全部达标 / 9 行检测到成绩刷新 / 1 份未确认被挡下并说明原因
例如 Miranda Xu #19 100 Breast  1:12.53 → 1:11.03（线 1:16.69，达标）
工作表 CSV 1646 字符，BOM + CRLF + 10 行
```

### 10.6 阶段 C 已落地：家长确认稿

`meet-print.html` + `src/pages/meet-print.js` + `src/styles/meet-print.css`，独立 Vite 入口。

- **不进 dashboard**：`#app` 每次快照重建，确认稿在里面会被别的家庭的保存冲掉
- **家长的家庭归属从登录身份推导**，忽略 URL 里的 `family=`（不把公平性交给 Firestore 规则做唯一防线）
- **打印即成品**：`@media print` 去掉工具栏、letter 排版、家庭之间强制分页 → "全队"模式一次导出一份多页 PDF
- **成绩刷新写在纸上**：`Times updated since you submitted: 38.50 → 36.60`，家长确认的是他真正会提交的东西
- 教练视角多一个 pre-flight 框（人数/项数/达标/未确认/缺成绩/截止），家长视角没有
- 入口：报名弹窗底部 `🖨 Confirmation sheet`（单家庭）/ 名单视图 `🖨 Confirmation sheets`（全队）

端到端测试 `tests/meet-print.spec.js`（3 个用例）：教练全队稿（含刷新提示、费用、切分、pre-flight）、
家长隔离（伪造 `family=` 也只看自己家）、无报名时的空态。

### 10.7 阶段 C 补充：全队报名报告（`group=sex`）

家长已经认 Team Manager 那份版式，所以按它做了一版**全队报告**（同一个页面，`?group=sex`）：

- **不分家庭**：`FEMALE` / `MALE` 两个区，区内按姓氏排序
- 每行 `#项目号 · 事件的性别+年龄组+项目 · 成绩+course 字母`（`36.60Y`），没成绩打 `NT`
- 页脚 `Female IE's / Male IE's / Total IE's / Total Athletes`
- 接力不进报告（属俱乐部不属泳手，且我们还没有接力名单），有接力行时打一行说明
- 混合项目标 `Mixed`（取事件本身的性别）

线上 27-41 真实数据试渲染：女 6 人 16 项、男 8 人 22 项，两张区各自按姓氏排好，
页脚 `Total IE's: 38 / Total Athletes: 14`。预览图 `.tmp/meet-entry/preview/report-preview.png`。

**两种模式并行**（用户 2026-10-30 的要求）：教练照旧把这份 PDF 发给家长；
家长也可以登录网站自己看——dashboard 的 meet 卡片上多一个 `🖨 My entry sheet`，
**不依赖** `entriesOpenToFamilies`（报名表关着也能自查）。

### 10.8 阶段 A/B/C 之后仍遗留的

- 阶段三（导出组行 / CSV / 确认稿 / SDIF writer）——按 §7 的顺序在 Gate A2 之后
- 接力：仍卡在"今天怎么报的"这个信息上


---

## 11. 接力样本（2026-10-29 取得）

上赛季同一场比赛：**26-45 · 2025 Riley Eaton Holiday Invitational · 2025-12-11**。
我们发出去的报名件里有 **7 个接力队**，这是第一批带接力的真实样本。

### 11.1 文件都在（连"已经找不到"的赛事文件也在）

| 文件 | 地址 |
|---|---|
| 我们的报名件 | `.tmp/meet-entry/samples/exports/rmsc-2025/DRAG-PV-Entries-2025 Riley Eaton...-11Dec2025-001.ZIP` |
| 解包（`.CL2` 24,948 B / `.HY3` 17,820 B） | `.tmp/meet-entry/samples/exports/rmsc-2025/` |
| **赛事文件（还在！）** | `https://www.files.pvswim.org/2526meet/26-45-events.zip` → `.ev3` 12,509 B / `.hyv` 6,982 B |
| 赛程单 PDF | `https://www.files.pvswim.org/2526meet/26-45-ma.pdf`（634 KB） |
| 成绩 PDF | `https://www.files.pvswim.org/2526meet/26-45-results.pdf`（1.1 MB） |

> 这些 URL 是从 `https://www.pvswim.org/results-2526` 的表格里扒出来的
> （`26-45` + `-ma.pdf` / `-events.zip` / `-results.pdf` 的固定命名规律）。
> 以后要老比赛的赛事文件，先试这个规律，别只看赛程页。

### 11.2 `.CL2`（SDIF）：`E0` 队 + `F0` 棒次

```
E01PV      APVDRAG  M 2007 10 1314   12112025 1:47.25Y ...            N72
F01PV       10 PVDRAGAChen, Haoran E   8B1279F2394C USA0309201114M000  8B1279F2394C49Eric ... N60
```

按规范切片验证通过（`E0` 字段表在 SDIF v3 第 22 页，`F0` 在第 24 页）：

| `E0` 位置 | 含义 | 实例取值 |
|---|---|---|
| 12/1 | 接力队字母 | `A` |
| 13/6 | TEAM code | `PVDRAG` |
| 19/2 | 后续 F0 条数 | 空（TM 没填） |
| 21/1 | 事件性别 | `M` |
| 22/4 | 距离 | ` 200` |
| 26/1 | 泳姿码（6=自由泳接力 7=混合泳接力） | `7` |
| 27/4 | 项目号 | `10` |
| 31/4 | 年龄区间 | `1314` |
| 38/8 | 比赛日期 | `12112025` |
| 46/8 + 54/1 | 成绩 + course | `1:47.25` `Y` |

`F0`：16/6 队代码、22/1 队字母、23/28 姓名、51/12 USS#、63/3 国籍、
66/8 生日、74/2 年龄、76/1 性别、**77-79/1 三个 ORDER（预赛/加赛/决赛棒次）**、80/8 棒次成绩、88/1 course。

⚠️ **`.CL2` 里三个 ORDER 字段全是 `0`** —— TM 自己没写棒次。
我们要写的时候应该按规范填 `1..4`（这样 Meet Manager 才拿得到棒次），而不是学 TM 留空。

### 11.3 `.HY3`：`F1`（队/项目）+ `F3`（棒次）

```
F1DRAG A   0MMM   200E 13 14     10.00 10        0Y  107.25Y      ...  36
F3M  139Chen F1M  199Ye   F2M  177MouraF3M  155Pan  F4               51
```

- `F1` = 每个接力队一条：队代码、队字母、项目（`200E` = 200 混合泳接力）、年龄组、
  项目号（`10`）、成绩（`107.25Y`）
- `F3` = 每个接力队一条，**四棒顺序在这里**：每个运动员是 `性别 + 序号 + 姓名`，
  后面跟着 `F1`/`F2`/`F3`/`F4` 表示这是第几棒

**结论：棒次只有 `.hy3` 带（`.cl2` 的结构里有字段但 TM 没填）。**
这改变了 §1 里"`.cl2` 优先"的判断 —— 如果我们要完整表达接力棒次，两个格式都得写，
或者接受 `.cl2` 里棒次由主办方手工补。

### 10.9 阶段 D 已落地：SDIF v3 `.cl2` writer

`src/utils/sdif.js`（reader + writer，规范字段表做单一真相）+ `execution/meet-entry/export_cl2.mjs`（CLI）。

**回归证据（这是 D 的核心）**：把 2026-11-13 那份真实 Team Manager 导出件（177 条记录）
读成模型 → 用我们的 writer 重新写出 → 逐字段比对：

```
记录构成一致: {A0:1, B1:1, C1:1, D0:145, D3:28, Z0:1}  →  177 条
比较 4,602 个字段 → 只有 2 处不同(Z0 的备注文字与批次号,都是我方元数据)
每行 160 字节, CRLF, 无空尾行
```

**逐字节核对出来的 6 条规矩**（初版全都写错了，是回归把它们逼出来的）：

1. 日期是 `MMDDYYYY` —— 我第一版写成了 `MMYYYYDD`
2. `distance` 是空格右对齐（`" 500"`），不是补零（`"0500"`）
3. `AGE` 是**左**对齐（`"9 "`），不是右对齐
4. `eventNo` 是"数字右对齐占 3 位 + 年龄组字母"：`"  2F"` / `" 25B"` / `" 11 "`，
   而且这个字段装的是 **ev3 的事件码**，不是纯数字 —— 为此给 `events[]` 回填了 `eventCode`
5. 无成绩写 `NT` 令牌，格式 `"     NT "`，不是留空
6. `D3` 紧跟泳手第一条 `D0`；`.CL2` 里 `CITIZEN` 常为空、`ATTACH` 空、`swimDate` 空 ——
   我们不知道的字段就留空，不编造

**命令**：

```powershell
node execution/meet-entry/export_cl2.mjs --meet <docId> --dry-run   # 先看摘要
node execution/meet-entry/export_cl2.mjs --meet <docId>            # 写到 .tmp/meet-entry/export/
```

阻断项（缺成绩 / 缺 USA ID / 超限额）沿用 `validateExport()`，不会产出半成品文件。

单测：`tests/unit/verify-sdif.mjs`（67 条，含"字段不重叠/不越界"的结构自检）。
单测总入口现为 9 个脚本全绿。

**仍然只做个人项目**：接力需要 `E0`/`F0` 与棒次名单，而站点没有接力数据模型（§11 有格式）。

### 10.11 阶段 E 第一部分：接力数据模型 + SDIF `E0`/`F0`

**数据模型**：`src/utils/relayEntry.js`（纯函数）
`meets/{meetId}/relayEntries/{eventCode}__{letter}`，`legs[]` 数组顺序即棒次。
校验全部是硬错误：4 棒 / 不重复 / 每棒有 USA ID / 年龄（按比赛首日）落在项目区间 /
性别匹配（Mixed 任意）/ 不超过 `relayLimitPerClub`。

**SDIF 输出**：`buildEntrySdif({ relays })` 在 D0/D3 之后追加 `E0`（每队一条）+ `F0`（每棒一条），
`Z0` 的 `eCount`/`fCount` 自动统计。

**回归**：用 2025-12-11 那份真实导出件（154 条，含 7 个接力队）往返：

```
样本 {A0:1,B1:1,C1:1,D0:97,D3:18,E0:7,F0:28,Z0:1}
重生成 同构 154 条
比较 3,484 个字段 → 零意外差异
```

**刻意与 TM 不同的三处**（都写进代码注释了）：

1. `E0.f0Count` 填 4（TM 留空）—— 规范要求，Meet Manager 靠它知道每队有几棒
2. `F0` 棒次填 `1..4`（TM 三个顺序字段全填 `0`，而规范里 `0` = "这场不在队上"）——
   **TM 的 `.cl2` 里其实没有棒次**，我们按规范填，这是 `.cl2` 唯一能表达棒次的地方
3. `D3` 的民族/学校留空（我们没这数据）

**`export_cl2.mjs` 已接线**：读 `relayEntries`，合并登记表里的生日，逐队校验，
任一队不合格**整份文件不产出**（一棒错误整队作废，比个人项目代价高）。

**还剩**：教练端选人界面（E2）。数据、校验、导出、单测（`verify-relay-entry.mjs` 40 条）都在了。
单测总入口现为 10 个脚本全绿。

### 10.12 阶段 E2：教练端选人界面

`src/components/relayEntries.js`（body 级弹窗，理由同报名弹窗：`#app` 每次快照重建）。

- 入口：Entries 弹窗名单视图底部 `🏊 Relays`（教练专属）
- 只列接力项目，每项给 `relayLimitPerClub` 个队位（A/B/C…），已有队显示姓氏链 + Edit
- 编辑：4 个下拉（按性别/年龄区间过滤候选）+ 接力成绩；**下拉位次 = 棒次**
- 边选边校验（红字），4 棒不齐或有人重复 → 保存被拒，不写库
- 家庭看不到（规则层也不给家长写 `relayEntries`）

**规则变更**：`firestore.rules` 新增 `meets/{meetId}/relayEntries/{relayId}`：
`read` 全员、`create/update/delete` 教练与管理员。删权限给教练（不像个人报名只给 admin）——
接力队是教练的决定，教练必须能撤。

**E2E**：`tests/relay-entries.spec.js` 3 个用例 —— 建队且**棒次顺序写入正确**（故意不按姓氏排）、
3 棒/重复被拒且库里没有文档、家庭看不到入口。

**顺手修的一个坑**：接力样式本该加进 `src/pages/dashboard.css`，我误建了 `src/styles/dashboard.css`
（真文件是 `pages/`）。已挪正并删掉误建文件 —— 记一笔，别再被同名文件骗。

### 10.13 ⏸ 挂起：接力成绩校验（等教练确认）

**现状**：接力的 `seedSeconds` 是教练手填值，系统不求和、不比分。`validateSquad()` 只校验
4 棒 / 重复 / USA ID / 年龄 / 性别 / 队数上限。

**数据是齐的**：27-41 的 32 个接力项目都有 SCY 达标线（#6 男 13-14 800 自 `8:09.99`、
#5 女 `8:34.99`），LCM 全空。

**算法（已想清楚，等一句话就实现）**：每棒距离 = 距离÷4；MED 四棒 = 仰/蛙/蝶/自，FR 四棒 = 自；
四棒在该 course 的最佳成绩之和 = 预计成绩；与 `standards[course]` 比。
缺一棒成绩 → 提示"无法计算"，不算不合格。软提醒还是硬拦截**要教练定**（部分比赛允许接力报 NT）。

**为什么挂起**（2026-10-29 用户决定）：不确定教练是否需要，确认后再做。
细节写在 `docs/meet-entries.md` §6.7.1。

### 10.14 比对两份 `.cl2`（用户会带来的验证方式）

用户打算：**同一场、同一批人**，在 TM 里生成一份 `.cl2`，我们这边也生成一份，拿两份文件做逐字段对比。
这是唯一能在"发给主办方之前"自证格式正确性的办法。

对齐方式必须是 `(项目码, USA ID)` 而不是记录行号 —— TM 的泳手顺序和我们的不同。

预期差异（比对时自动归类，不算 bug）：`N##` 厂商字节、`E0.f0Count`（我们 4 / TM 空）、
`F0` 三处棒次（我们 1–4 / TM 0）、`D3` 民族学校、`Z0` 备注与批次号。
其余任何差异都是真问题。

工具位置：**不做进网页**（这是一次性验证，不是产品功能）。落在
`execution/meet-entry/compare_cl2.mjs`（命令行，带自测）。

**2026-10-30 已实现**：`--self-test` 五项自证（同文件 0 差异 / 改 seed time 抓到 /
删 D0 抓到 / 只改对齐归 padding / 少一条 F0 抓到）；正式比对用法：

```powershell
Expand-Archive 'DRAG-PV-Entries-....ZIP' -DestinationPath .tmp/meet-entry
node execution/meet-entry/compare_cl2.mjs --tm .tmp/meet-entry/<TM>.CL2 --ours <ours>.CL2 `
     --json .tmp/meet-entry/compare-report.json
```

差异分三类输出：**实质差异**（退出码 1）、**预期差异**（列出但不算错）、**只有对齐不同**（忽略）。
接力按 `(项目码, 队字母)` 对齐、棒次按 E0 后面 F0 的出现顺序。

⚠ 两个已知会"必现"的差异，比对前先说明：**接力 seed time**（TM 按四棒最快之和，我们手填，
见 `docs/meet-entries.md` §6.7.1）与 **bonus 标记**（`.cl2` 里根本没有这个字段，见 §6.3.1）。


### 10.15 「导出报名文件」改成了网页按钮（2026-10-29 晚）

用户的原话："教练不会起命令行，如果一个按钮能生成文件，就可以了，跟 tm 一样。"
所以把 `export_cl2.mjs` 的组装逻辑抽出来，做成了**纯函数 + 一个按钮**：

| 层 | 文件 | 干什么 |
|---|---|---|
| 逻辑（纯） | `src/utils/meetEntryPackage.js` | `buildEntryPackage()` —— 组行、校验、接力、生成 `.cl2` + `README.TXT` + zip；按钮和命令行都调它 |
| zip（纯） | `src/utils/zip.js` | 自己写的**只存储不压缩** ZIP（无新依赖，约 90 行）；用 PowerShell `Expand-Archive` 验证过能被真实解压器读 |
| 浏览器 | `src/components/exportEntryFile.js` | 从 Firestore 取数据 → 调上面的纯函数 → `Blob` 下载 |
| 按钮 | `entries` 弹窗名单视图 `📦 Entry file (.cl2)`（教练） | 一次点击得到 `DRAG-PV-Entries-<meet>-<ddMonyyyy>-001.ZIP` |
| 命令行 | `execution/meet-entry/export_cl2.mjs` | 同一套逻辑，另写一份裸 `.cl2`（方便和 TM 的文件逐字段比对） |

**zip 内容**：`<同名>.CL2` + `README.TXT`。README 里有比赛信息、sanction、
"Files in this archive"、**怎么导进 Meet Manager**（`File > Import > Entries`）、
泳手/项目/接力队数量、联系人。全 ASCII，任何编辑器都不会乱码。

**文件名**沿用 TM 的规律，让主办方收到的附件形状和往年一致：
`DRAG-PV-Entries-Riley Eaton Holiday Invitational-10Dec2026-001.ZIP`

**失败时不出文件**：缺 seed time / 缺 USA ID / 超限额 / 接力队不合格 → 按钮下方红字说明
`Nothing exported — N problem(s): <codes>`，不下载半成品。

测试：`tests/unit/verify-zip.mjs`(29) + `tests/unit/verify-meet-entry-package.mjs`(38) +
`tests/export-entry-file.spec.js`(3，含真实下载事件与文件名断言)。总入口 **12 个单测脚本 + 42 个 E2E**。
