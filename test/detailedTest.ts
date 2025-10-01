import { toSimplified } from '../src/convert'

// Test to verify the behavior
const testText = '龍馬测试乾坤ABC'
console.log('Input text:', testText)

// Parse the custom dictionary as the CLI would
const dictString = '龍龙 馬马'
const customDict = new Map<string, string>()
const pairs = dictString.trim().split(/\s+/)
for (const pair of pairs) {
    if (pair.length === 2) {
        customDict.set(pair[0], pair[1])
    }
}
console.log('Custom dictionary:', customDict)

// Test with customOnly=true (what CLI should do)
const result = toSimplified(testText, { customDict, customOnly: true })
console.log('Output with customOnly=true:', result)

// Check each character
console.log('\nCharacter by character analysis:')
for (let i = 0; i < testText.length; i++) {
    console.log(`Position ${i}: "${testText[i]}" -> "${result[i]}" ${testText[i] !== result[i] ? '(CHANGED)' : '(UNCHANGED)'}`)
}