/**
 * USA Swimming 时间标准阈值(未来功能,已与用户约定搁置)。
 *
 * 待办:从 USAS 官方标准表(每数年一版的 PDF,如 2024-2028 周期)录入
 * 各年龄组 × 项目 × course 的各级阈值。数据就绪前 getTimeStandardLevels()
 * 返回 null,趋势图自动跳过标准线/色带层 — 图表渲染代码无需改动。
 *
 * 返回契约(实现后):
 *   getTimeStandardLevels({ age, course, eventKey }) → Array<{
 *     level: 'B' | 'BB' | 'A' | 'AA' | 'AAA' | 'AAAA',
 *     thresholdSeconds: number,   // ≤ 该秒数即达到此级别
 *     color: string,              // 与 dashboard.css .ts-* 六色一致
 *   }> | null
 *   null / [] → renderTrendChart 不画标准线层。
 */
export function getTimeStandardLevels() {
  return null; // stub — 标准表数据未录入
}
