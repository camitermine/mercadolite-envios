export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesSearchTerm(search: string, fields: string[]): boolean {
  const term = normalizeText(search)

  if (!term) return true

  return fields.some((field) => normalizeText(field).includes(term))
}
