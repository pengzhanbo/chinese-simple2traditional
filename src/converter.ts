import { chineseLib } from './chineseLib.js'

const converter = (text: string, table: Record<string, string>) =>
  text.replace(/./g, (char) => table[char] || char)

let s2t: Record<string, string> | null = null
let t2s: Record<string, string> | null = null

export function simpleToTradition(text: string) {
  if (!s2t) {
    s2t = {}

    chineseLib.split(' ').forEach((char) => {
      s2t![char[0]] = char[1]
    })
  }

  return converter(text, s2t)
}

export function traditionToSimple(text: string) {
  if (!t2s) {
    t2s = {}

    chineseLib.split(' ').forEach((char) => {
      char.split('').forEach((_, i) => {
        if (i === 0) return
        t2s![char[i]] = char[0]
      })
    })
  }

  return converter(text, t2s)
}
