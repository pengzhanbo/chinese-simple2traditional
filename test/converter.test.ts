import { it } from 'vitest'
import { toSimplified, toTraditional } from '../src/index'

it('simpleToTradition', ({ expect }) => {
  expect(toTraditional('主人何为言少钱，径须酤取对君酌。')).toBe('主人何爲言少錢，徑須酤取對君酌。')

  // #2
  expect(toTraditional('坚强')).toBe('堅強')
  expect(toTraditional('堅強')).toBe('堅強')
})

it('traditionToSimple', ({ expect }) => {
  expect(toSimplified('主人何爲言少錢，徑須酤取對君酌。')).toBe('主人何为言少钱，径须酤取对君酌。')
})
