export function toPdfSafeText(text: string): string {
  return text.normalize('NFKC').replace(/[\u00A0\u202F]/g, ' ')
}
