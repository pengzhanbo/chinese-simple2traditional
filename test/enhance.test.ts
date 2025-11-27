import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { simplifiedPhrasesMap, traditionalPhrasesMap } from '../src/cache'
import { setupEnhance } from '../src/enhance'
import { toSimplified, toTraditional } from '../src/index'

beforeEach(() => {
  setupEnhance()
})

afterEach(() => {
  simplifiedPhrasesMap.clear()
  traditionalPhrasesMap.clear()
})

describe('enhance', () => {
  it('enhance converter', () => {
    const s = '主人何为言少钱，径须酤取对君酌。'
    const res = '主人何爲言少錢，徑須酤取對君酌。'
    expect(toSimplified(res, true)).toBe(s)
    expect(toTraditional(s, true)).toBe(res)
  })

  it('phrases', () => {
    const s = '王妃后来成为了王后'
    const res = '王妃後來成爲了王后'
    expect(toSimplified(res, true)).toBe(s)
    expect(toTraditional(s, true)).toBe(res)
  })

  it('traditional phrases to simplified', ({ expect }) => {
    expect(toSimplified('一翦梅', true)).toBe('一剪梅')
    expect(toSimplified('甚麼', true)).toBe('什么')
    expect(toSimplified('什么', true)).toBe('什么')
    expect(toSimplified('黃霑', true)).toBe('黃霑')
  })
})
