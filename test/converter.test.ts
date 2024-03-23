import { it } from 'vitest'
import { toSimplified, toTraditional } from '../src/index'

it('simpleToTradition', ({ expect }) => {
  const s = '主人何为言少钱，径须酤取对君酌。'
  const res = '主人何爲言少錢，徑須酤取對君酌。'
  expect(toTraditional(s)).toBe(res)
})

it('traditionToSimple', ({ expect }) => {
  const res = '主人何为言少钱，径须酤取对君酌。'
  const s = '主人何爲言少錢，徑須酤取對君酌。'
  expect(toSimplified(s)).toBe(res)
})
