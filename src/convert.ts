import { simplifiedPhrasesMap, st, traditionalPhrasesMap, ts } from './cache'
import { converter as internalConverter } from './converter'
import { transformWords } from './words'
import type { Words, PhrasesMap } from './cache'

transformWords()

// Export the converter function for CLI usage
export { internalConverter as converter }

// Export types for CLI usage
export type { Words, PhrasesMap }

// Define return type for conversion functions
export interface ConversionResult {
  converted: string
  corruptedChars: Array<{ char: string; position: number }>
  unmappedChars: Array<{ char: string; position: number }>
}

/**
 * 简体转换为繁体
 * @param text - 简体文本
 * @param options - 转换选项，可以是布尔值（用于向后兼容）或对象
 *   - enhance: 是否使用增强模式
 *   - customDict: 自定义字典映射
 *   - customOnly: 是否仅使用自定义字典，不应用标准转换（默认false）
 * @returns 繁体文本
 */
export function toTraditional(text: string, options?: boolean | { enhance?: boolean; customDict?: Map<string, string>; customOnly?: boolean }): string {
  // Handle backward compatibility - if options is a boolean, treat it as enhance flag
  const enhance = typeof options === 'boolean' ? options : options?.enhance ?? false
  const customDict = typeof options === 'object' && options !== null && 'customDict' in options ? options.customDict : undefined
  // When customDict is provided, default customOnly to true unless explicitly set to false
  const customOnly = typeof options === 'object' && options !== null && 'customOnly' in options
    ? options.customOnly
    : (customDict ? true : false)

  // If customOnly is true and customDict is provided, only apply custom dictionary
  if (customOnly && customDict) {
    return applyCustomDictionary(text, customDict)
  }

  // Apply custom dictionary first if provided
  let processedText = text
  if (customDict) {
    processedText = applyCustomDictionary(text, customDict)
  }

  // Use the enhanced converter that properly handles Unicode characters
  // When customDict is provided, we should not apply phrases again to avoid duplication
  const phrasesToUse = customDict ? undefined : (enhance ? simplifiedPhrasesMap : undefined)
  const result = internalConverter(processedText, st, phrasesToUse)
  return result.converted
}

/**
 * 繁体转换为简体
 * @param text - 繁体文本
 * @param options - 转换选项，可以是布尔值（用于向后兼容）或对象
 *   - enhance: 是否使用增强模式
 *   - customDict: 自定义字典映射
 *   - customOnly: 是否仅使用自定义字典，不应用标准转换（默认false）
 * @returns 简体文本
 */
export function toSimplified(text: string, options?: boolean | { enhance?: boolean; customDict?: Map<string, string>; customOnly?: boolean }): string {
  // Handle backward compatibility - if options is a boolean, treat it as enhance flag
  const enhance = typeof options === 'boolean' ? options : options?.enhance ?? false
  const customDict = typeof options === 'object' && options !== null && 'customDict' in options ? options.customDict : undefined
  // When customDict is provided, default customOnly to true unless explicitly set to false
  const customOnly = typeof options === 'object' && options !== null && 'customOnly' in options
    ? options.customOnly
    : (customDict ? true : false)

  // If customOnly is true and customDict is provided, only apply custom dictionary
  if (customOnly && customDict) {
    return applyCustomDictionary(text, customDict)
  }

  // Apply custom dictionary first if provided
  let processedText = text
  if (customDict) {
    processedText = applyCustomDictionary(text, customDict)
  }

  // Use the enhanced converter that properly handles Unicode characters
  // When customDict is provided, we should not apply phrases again to avoid duplication
  const phrasesToUse = customDict ? undefined : (enhance ? traditionalPhrasesMap : undefined)
  const result = internalConverter(processedText, ts, phrasesToUse)
  return result.converted
}

/**
 * 应用自定义字典到文本
 * @param text - 要处理的文本
 * @param customDict - 自定义字典映射
 * @returns 应用字典后的文本
 */
function applyCustomDictionary(text: string, customDict: Map<string, string>): string {
  let result = ''

  // Process each character properly handling surrogate pairs
  for (const char of stringIterator(text)) {
    if (customDict.has(char)) {
      result += customDict.get(char)
    } else {
      result += char
    }
  }

  return result
}

/**
 * 检查字符是否为中文字符
 * @param char - 要检查的字符
 * @returns 如果是中文字符则返回true，否则返回false
 */
function isChineseCharacter(char: string): boolean {
  // Check if the character is in the Chinese Unicode ranges
  const code = char.codePointAt(0) || char.charCodeAt(0)
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||  // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) ||  // CJK Extension A
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
    (code >= 0x2a700 && code <= 0x2b73f) || // CJK Extension C
    (code >= 0x2b740 && code <= 0x2b81f) || // CJK Extension D
    (code >= 0x2b820 && code <= 0x2ceaf) || // CJK Extension E
    (code >= 0x2ceb0 && code <= 0x2ebef) || // CJK Extension F
    (code >= 0x3000 && code <= 0x303f) ||   // CJK Symbols and Punctuation
    (code >= 0xff00 && code <= 0xffef)      // Halfwidth and Fullwidth Forms
  )
}

/**
 * 迭代字符串中的字符，正确处理代理对
 * @param str - 要迭代的字符串
 * @returns 字符生成器
 */
function* stringIterator(str: string): Generator<string> {
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    // Check if this is a high surrogate
    if (i < str.length - 1 && char.charCodeAt(0) >= 0xD800 && char.charCodeAt(0) <= 0xDBFF) {
      const nextChar = str[i + 1]
      // Check if next is a low surrogate
      if (nextChar.charCodeAt(0) >= 0xDC00 && nextChar.charCodeAt(0) <= 0xDFFF) {
        // This is a surrogate pair, yield the whole character
        yield char + nextChar
        i++ // Skip the next character as it's part of the surrogate pair
        continue
      }
    }
    // Regular character
    yield char
  }
}

/**
 * @deprecated use {@link toTraditional}
 */
export function simpleToTradition(text: string): string {
  return toTraditional(text)
}

/**
 * @deprecated use {@link toSimplified}
 */
export function traditionToSimple(text: string): string {
  return toSimplified(text)
}