import test from 'ava'
import { simpleToTradition, traditionToSimple } from '../src/index.js'

test('simpleToTradition', (t) => {
  const s = '主人何为言少钱，径须酤取对君酌。'
  const res = '主人何為言少錢，徑須酤取對君酌。'
  t.is(simpleToTradition(s), res, s)
})

test('traditionToSimple', (t) => {
  const res = '主人何为言少钱，径须酤取对君酌。'
  const s = '主人何為言少錢，徑須酤取對君酌。'
  t.is(traditionToSimple(s), res, s)
})
