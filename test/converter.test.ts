import { describe, expect, it } from 'vitest'
import { toSimplified, toTraditional } from '../src/index'

describe('converter - simpleToTradition', () => {
  it('should work', () => {
    expect(toTraditional('主人何为言少钱，径须酤取对君酌。')).toBe('主人何爲言少錢，徑須酤取對君酌。')
  })

  it('should fix #2', () => {
    // #2
    expect(toTraditional('坚强')).toBe('堅強')
    expect(toTraditional('堅強')).toBe('堅強')
  })
})

describe('converter - traditionToSimple', () => {
  it('should work', () => {
    expect(toSimplified('主人何爲言少錢，徑須酤取對君酌。')).toBe('主人何为言少钱，径须酤取对君酌。')
  })

  it('should work with special words', () => {
    expect(toSimplified('搖滾')).toBe('摇滚')
    expect(toSimplified('開車')).toBe('开车')
    expect(toSimplified('三千')).toBe('三千')
    expect(toSimplified('鍾無艷')).toBe('钟无艳')
    expect(toSimplified('許願')).toBe('许愿')
    expect(toSimplified('那么')).toBe('那么')
    expect(toSimplified('射鵰')).toBe('射雕')
    expect(toSimplified('原点')).toBe('原点')
    expect(toSimplified('呼吸')).toBe('呼吸')
    expect(toSimplified('戰士')).toBe('战士')
    expect(toSimplified('祇園')).toBe('祇园')
  })
})
