/**
 * USA Swimming 时间标准(2024-2028 周期,官方 PDF 录入)。
 *
 * 数据来自 .tmp/2028-motivational-standards-age-group.pdf(USAS 官方表),
 * 由 execution/parse_usas_standards.py 解析生成到 ./timeStandards.data.js。
 * 结构: ageGroup → course → '距离 泳姿' → { girls, boys: { B..AAAA: 秒阈值 } }。
 *
 * 官方表结构要点(录入时已双引擎交叉确认):
 *   - 15-16 / 17-18 无 50 BK/BR/FL(仅 50 FR);10&U LCM 无 100 IM;11-12 LCM 无 800 FR-R
 *   - 低龄组 B 档及 10&U 接力存在女生快于男生的官方特例(如 11-12 50 FL B 档三 course 均女快 0.20s)
 *   - 同一 meet 内年龄组按"比赛日年龄"归属;标准不随赛季变化(周期内固定)
 *
 * 返回契约:
 *   getTimeStandardLevels({ age, course, eventKey, gender }) → Array<{
 *     level: 'B' | 'BB' | 'A' | 'AA' | 'AAA' | 'AAAA',
 *     thresholdSeconds: number,   // ≤ 该秒数即达到此级别
 *     color: string,              // 与 dashboard.css .ts-dot 六色一致(深浅主题同色系)
 *   }> | null
 *   null / [] → renderTrendChart 不画标准线层。缺 age/gender/事件不存在时返回 null。
 */
import { TIME_STANDARDS } from './timeStandards.data.js';

// 与 dashboard.css .ts-dot 填充色一致(趋势图标准线/色带用同色系)。
const LEVEL_COLORS = {
  B: '#6B7280',
  BB: '#2563EB',
  A: '#059669',
  AA: '#D97706',
  AAA: '#DC2626',
  AAAA: '#B45309',
};

// 年龄 → 官方年龄组(按比赛日年龄;≥17 归 17-18,≤10 归 10 & under)。
export function ageGroupForAge(age) {
  if (age == null || !Number.isFinite(age)) return null;
  if (age <= 10) return '10 & under';
  if (age <= 12) return '11-12';
  if (age <= 14) return '13-14';
  if (age <= 16) return '15-16';
  return '17-18';
}

// 规范性别输入: 'male'/'female'/'M'/'F' → 'male'/'female';其他 → null。
function normalizeGender(gender) {
  if (!gender) return null;
  const g = String(gender).trim().toLowerCase();
  if (g.startsWith('f')) return 'female';
  if (g.startsWith('m')) return 'male';
  return null;
}

// eventKey 接受 '50 FR' 或 '50 FR SCY'(后者忽略 course,由入参 course 决定)。
function parseEventKey(eventKey) {
  const m = /^(\d+)\s+([A-Za-z]{2,4})/.exec(String(eventKey || '').trim());
  if (!m) return null;
  const stroke = m[2].toUpperCase();
  if (!['FR', 'BK', 'BR', 'FL', 'IM'].includes(stroke)) return null;
  return { distance: +m[1], stroke };
}

export function getTimeStandardLevels({ age, course, eventKey, gender } = {}) {
  const ageGroup = ageGroupForAge(age);
  const g = normalizeGender(gender);
  const ev = parseEventKey(eventKey);
  const courseKey = String(course || '').toUpperCase();
  if (!ageGroup || !g || !ev || !TIME_STANDARDS[ageGroup]) return null;

  const byCourse = TIME_STANDARDS[ageGroup][courseKey];
  if (!byCourse) return null;
  // 数据键是 girls/boys(g 是 male/female),映射一次
  const genderKey = g === 'female' ? 'girls' : 'boys';
  const thresholds = byCourse[`${ev.distance} ${ev.stroke}`]?.[genderKey];
  if (!thresholds) return null;

  // 按阈值升序(快 → 慢,AAAA 在前),与图表层"精英档画在顶部"的约定一致。
  return Object.keys(thresholds)
    .map((level) => ({ level, thresholdSeconds: thresholds[level], color: LEVEL_COLORS[level] }))
    .sort((a, b) => a.thresholdSeconds - b.thresholdSeconds);
}
