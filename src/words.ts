import { st, ts } from './cache'
import words from './data/words'

export function transformWords() {
  const len = words.length
  let i = 1
  let w = words[0]

  while (i < len) {
    const char = words[i]
    i++
    if (!w) {
      w = char
      continue
    }
    if (char === ' ') {
      w = ''
      continue
    }

    !st.has(w) && st.set(w, char)
    ts.set(char, w)
  }
}
