import { toSimplified } from '../src/convert'

// Test the customOnly functionality
const testText = '龍馬测试乾坤ABC'
const customDict = new Map([['龍', '龙'], ['馬', '马']])

console.log('Input text:', testText)
console.log('Custom dict:', customDict)

// Test with customOnly = true
const resultCustomOnly = toSimplified(testText, { customDict, customOnly: true })
console.log('With customOnly=true:', resultCustomOnly)

// Test with customOnly = false (default behavior)
const resultNormal = toSimplified(testText, { customDict, customOnly: false })
console.log('With customOnly=false:', resultNormal)

// Test without customOnly (default behavior)
const resultDefault = toSimplified(testText, { customDict })
console.log('Default behavior:', resultDefault)