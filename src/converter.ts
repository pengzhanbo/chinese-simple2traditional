import type { PhrasesMap, Words } from './cache'

export function converter(source: string, words: Words, phrases?: PhrasesMap): string {
  const len = source.length
  let target = ''
  let i = 0
  let has = false
  while (i < len) {
    const char = source[i]
    if (phrases && phrases.has(char)) {
      const [sources, targets] = phrases.get(char)!
      const slice = source.slice(i)
      for (const [j, s] of sources.entries()) {
        if (slice.startsWith(s)) {
          target += targets[j]
          i += s.length
          has = true
          break
        }
      }
    }

    if (!has) {
      target += words.get(char) || char
      i += 1
    }
    else { has = false }
  }
  return target
}
