/** 数値を桁数をそろえて文字列にする。値が無ければ「—」 */
export function fmt(value: number | null | undefined, digits = 1): string {
  return value == null ? "—" : value.toFixed(digits);
}
