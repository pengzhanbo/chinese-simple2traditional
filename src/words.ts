import { st, ts } from './cache.js'
import words from './data/words.js'

export function transformWords(): void {
  let simpleChar = ''
  for (const char of words) {
    if (!simpleChar) {
      simpleChar = char
      continue
    }
    if (char === ' ') {
      simpleChar = ''
      continue
    }
    !st.has(simpleChar) && st.set(simpleChar, char)
    ts.set(char, simpleChar)
  }
}
