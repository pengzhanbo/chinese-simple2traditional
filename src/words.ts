import { st, ts } from './cache'
import words from './data/words'

/**
 * 转换字库数据并填充字符映射表
 * 将字库数据转换为简体到繁体(st)和繁体到简体(ts)的映射表
 */
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