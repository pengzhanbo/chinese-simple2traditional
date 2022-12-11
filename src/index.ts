import { chineseLib } from './chineseLib.js'
import { converter } from './converter.js'
const cache: Record<string, Record<string, string>> = {}

export function simpleToTradition(text: string): string {
  if (!cache.s2t) {
    cache.s2t = {}

    chineseLib.split(' ').forEach((lib: string) => {
      cache.s2t[lib[0]] = lib[1]
    })
  }

  return converter(text, cache.s2t)
}

export function traditionToSimple(text: string): string {
  if (!cache.t2s) {
    cache.t2s = {}

    chineseLib.split(' ').forEach((lib: string) => {
      lib.split('').forEach((_: string, index: number) => {
        if (index === 0) return

        cache.t2s[lib[index]] = lib[0]
      })
    })
  }

  return converter(text, cache.t2s)
}
