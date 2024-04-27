import { afterEach, beforeEach, it } from 'vitest'
import { customS2TPhrases, customT2SPhrases, toSimplified, toTraditional } from '../src/index'
import { simplifiedPhrasesMap, traditionalPhrasesMap } from '../src/cache'

beforeEach(() => {
  customS2TPhrases([
    ['双台子区', '雙臺子區'],
  ])
  customT2SPhrases([
    ['雖覆能復', '虽覆能复'],
  ])
})

afterEach(() => {
  simplifiedPhrasesMap.clear()
  traditionalPhrasesMap.clear()
})

it('custom simplified to traditional phrases', ({ expect }) => {
  expect(toTraditional('双台子区')).toBe('雙台子區')
  expect(toTraditional('双台子区', true)).toBe('雙臺子區')
})

it('custom traditional to simplified phrases', ({ expect }) => {
  expect(toSimplified('雖覆能復')).toBe('虽复能复')
  expect(toSimplified('雖覆能復', true)).toBe('虽覆能复')
})
