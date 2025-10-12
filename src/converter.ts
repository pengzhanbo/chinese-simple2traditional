import type { PhrasesMap, Words } from './cache'

/**
 * 检查字符是否为中文字符
 * 
 * 该函数通过检查字符的 Unicode 码点来判断是否为中文字符，
 * 包括常见的中文字符范围和扩展区域。
 * 
 * @param char - 要检查的字符
 * @returns 如果是中文字符则返回true，否则返回false
 * 
 * @example
 * ```ts
 * isChineseCharacter('中') // true
 * isChineseCharacter('a')  // false
 * isChineseCharacter('🎉') // false
 * ```
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
 * 检查字符是否损坏（替换字符或无效字符）
 * 
 * 该函数用于检测在字符转换过程中是否产生了损坏字符，
 * 通常表现为 Unicode 替换字符或其他无效字符。
 * 
 * @param char - 要检查的字符
 * @returns 如果字符损坏则返回true，否则返回false
 * 
 * @example
 * ```ts
 * isCorruptedCharacter('\uFFFD') // true
 * isCorruptedCharacter('中')      // false
 * ```
 */
function isCorruptedCharacter(char: string): boolean {
  // Check if the character is a replacement character or appears as one when displayed
  return char === '\uFFFD' || char.charCodeAt(0) === 55409 || char.charCodeAt(0) === 55405
}

/**
 * 迭代字符串中的字符，正确处理代理对
 * 
 * 该函数能够正确处理包含 emoji 和其他需要代理对表示的 Unicode 字符的字符串，
 * 确保在处理这些字符时不会将代理对拆分。
 * 
 * @param str - 要迭代的字符串
 * @returns 字符生成器，能够正确处理代理对
 * 
 * @example
 * ```ts
 * for (const char of stringIterator('Hello 👋 世界')) {
 *   console.log(char)
 * }
 * // Output: H, e, l, l, o,  , 👋,  , 世, 界
 * ```
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
 * 转换文本，支持字符和短语级别的转换
 * 
 * 这是核心转换函数，能够处理从简体到繁体或从繁体到简体的文本转换。
 * 支持字符级别的转换和短语级别的转换，能够正确处理 Unicode 代理对，
 * 并提供损坏字符和未映射字符的检测功能。
 * 
 * @param source - 源文本，需要进行转换的原始文本
 * @param words - 字符映射表，用于字符级别的转换
 * @param phrases - 短语映射表（可选），用于短语级别的转换
 * @returns 转换结果对象，包含转换后的文本、损坏字符和未映射字符信息
 * 
 * @example
 * ```ts
 * import { st } from './cache'
 * import { converter } from './converter'
 * 
 * const result = converter('简体中文', st)
 * console.log(result.converted) // '簡體中文'
 * ```
 */
export function converter(source: string, words: Words, phrases?: PhrasesMap): {
  converted: string
  corruptedChars: Array<{ char: string; position: number }>
  unmappedChars: Array<{ char: string; position: number }>
} {
  let target = ''
  const corruptedChars: Array<{ char: string; position: number }> = []
  const unmappedChars: Array<{ char: string; position: number }> = []

  // Process each character properly handling surrogate pairs
  let sourceIndex = 0
  while (sourceIndex < source.length) {
    const char = source[sourceIndex]
    let processedChar = char
    const currentPosition = target.length

    // Handle surrogate pairs properly
    let charLength = 1
    if (sourceIndex < source.length - 1 && char.charCodeAt(0) >= 0xD800 && char.charCodeAt(0) <= 0xDBFF) {
      const nextChar = source[sourceIndex + 1]
      if (nextChar.charCodeAt(0) >= 0xDC00 && nextChar.charCodeAt(0) <= 0xDFFF) {
        // This is a surrogate pair
        charLength = 2
      }
    }

    const actualChar = source.slice(sourceIndex, sourceIndex + charLength)

    // Check if this is a Chinese character that might need conversion
    if (isChineseCharacter(actualChar) && phrases && phrases.has(actualChar)) {
      const [sources, targets] = phrases.get(actualChar)!
      const slice = source.slice(sourceIndex)
      let hasMatch = false

      for (const [j, s] of sources.entries()) {
        if (slice.startsWith(s)) {
          processedChar = targets[j]
          // Check if the result is valid (not corrupted)
          if (isCorruptedCharacter(processedChar)) {
            processedChar = actualChar // Keep original if result is corrupted
            corruptedChars.push({ char: actualChar, position: currentPosition })
          }
          hasMatch = true
          // Skip the matched characters in source index
          sourceIndex += s.length
          break
        }
      }

      // If no phrase match, try character conversion
      if (!hasMatch) {
        const converted = words.get(actualChar)
        if (converted) {
          // Check if the result is valid (not corrupted)
          if (isCorruptedCharacter(converted)) {
            processedChar = actualChar // Keep original if result is corrupted
            corruptedChars.push({ char: actualChar, position: currentPosition })
          } else {
            processedChar = converted
          }
        } else {
          // No conversion found, character is unmapped
          unmappedChars.push({ char: actualChar, position: sourceIndex })
        }
        sourceIndex += charLength
      }
    } else if (isChineseCharacter(actualChar)) {
      // Direct character conversion for Chinese characters
      const converted = words.get(actualChar)
      if (converted) {
        // Check if the result is valid (not corrupted)
        if (isCorruptedCharacter(converted)) {
          processedChar = actualChar // Keep original if result is corrupted
          corruptedChars.push({ char: actualChar, position: currentPosition })
        } else {
          processedChar = converted
        }
      } else {
        // No conversion found, character is unmapped
        unmappedChars.push({ char: actualChar, position: sourceIndex })
      }
      sourceIndex += charLength
    } else {
      // Non-Chinese characters (including emojis) are preserved as-is
      processedChar = actualChar
      sourceIndex += charLength
    }

    target += processedChar
  }

  return { converted: target, corruptedChars, unmappedChars }
}