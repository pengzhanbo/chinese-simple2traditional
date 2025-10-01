import { toSimplified, toTraditional } from '../src/convert'

// Test to verify the new behavior where customDict implies customOnly

console.log('=== Testing new behavior where customDict implies customOnly ===\n')

// Test 1: toSimplified with customDict (should automatically use customOnly: true)
const testText1 = '龍馬测试乾坤ABC'
const customDict1 = new Map([['龍', '龙'], ['馬', '马']])
console.log('Input text:', testText1)
console.log('Custom dictionary:', customDict1)

const result1 = toSimplified(testText1, { customDict: customDict1 })
console.log('toSimplified with customDict (new behavior):', result1)

// Test 2: toSimplified with customDict and explicit customOnly: false
const result2 = toSimplified(testText1, { customDict: customDict1, customOnly: false })
console.log('toSimplified with customDict and customOnly: false:', result2)

// Test 3: toTraditional with customDict (should automatically use customOnly: true)
const testText3 = '龙马测试乾坤ABC'
const customDict3 = new Map([['龙', '龍'], ['马', '馬']])
console.log('\nInput text:', testText3)
console.log('Custom dictionary:', customDict3)

const result3 = toTraditional(testText3, { customDict: customDict3 })
console.log('toTraditional with customDict (new behavior):', result3)

// Test 4: toTraditional with customDict and explicit customOnly: false
const result4 = toTraditional(testText3, { customDict: customDict3, customOnly: false })
console.log('toTraditional with customDict and customOnly: false:', result4)

// Test 5: Standard conversion without customDict (for comparison)
const result5 = toSimplified('龙马测试乾坤ABC')
console.log('\nStandard toSimplified without customDict:', result5)

console.log('\n=== Verification ===')
console.log('Test 1 result should NOT convert 乾 to 干:', result1.includes('乾') && !result1.includes('干'))
console.log('Test 2 result SHOULD convert 乾 to 干:', result2.includes('干') && !result2.includes('乾'))
console.log('Test 3 result should convert 龙->龍 and 马->馬, and keep 乾 unchanged:',
    result3.includes('龍') && result3.includes('馬') && !result3.includes('龙') && !result3.includes('马') && result3.includes('乾'))
console.log('Test 4 result should convert 龙->龍 and 马->馬, and also convert other chars:',
    result4.includes('龍') && result4.includes('馬') && !result4.includes('龙') && !result4.includes('马'))
console.log('Test 5 result SHOULD convert 乾 to 干:', result5.includes('干') && !result5.includes('乾'))