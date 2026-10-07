/** Sayısal bir ayarın izin verilen aralığı ve varsayılanı (ör. bitiş puanı, oyuncu sayısı). */
export interface Range {
  min: number;
  max: number;
  default: number;
}

/** Dışarıdan gelen değeri (istek gövdesi, URL) aralığa göre okur; geçersizse varsayılanı döner. */
export function readInRange(value: unknown, range: Range): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= range.min && n <= range.max ? n : range.default;
}
