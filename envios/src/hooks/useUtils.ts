import { formatDays } from '../utils/format'
import { matchesSearchTerm, normalizeText } from '../utils/text'

const UTILS = {
  normalizeText,
  matchesSearchTerm,
  formatDays,
} as const

export function useUtils() {
  return UTILS
}
