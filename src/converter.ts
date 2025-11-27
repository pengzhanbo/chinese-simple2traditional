import type { PhrasesMap, Words } from './cache'
import { getCharLength, isChineseCharacter, isCorruptedCharacter } from './helper'

/**
 * 转换文本，支持字符和短语级别的转换
 *
 * 这是核心转换函数，能够处理从简体到繁体或从繁体到简体的文本转换。
 * 支持字符级别的转换和短语级别的转换，能够正确处理 Unicode 代理对。
 *
 * @param source - 源文本，需要进行转换的原始文本
 * @param words - 字符映射表，用于字符级别的转换
 * @param phrases - 短语映射表（可选），用于短语级别的转换
 * @returns 转换后的文本
 *
 * @example
 * ```ts
 * import { st } from './cache'
 * import { converter } from './converter'
 *
 * const converted = converter('简体中文', st)
 * console.log(converted) // '簡體中文'
 * ```
 */
export function converter(source: string, words: Words, phrases?: PhrasesMap): string {
  let converted = ''
  // Process each character properly handling surrogate pairs
  let sourceIndex = 0
  while (sourceIndex < source.length) {
    const charLength = getCharLength(source, sourceIndex)
    const actualChar = source.slice(sourceIndex, sourceIndex + charLength)
    let processedChar = actualChar

    if (isChineseCharacter(actualChar)) {
      let hasMatch = false
      if (phrases?.has(actualChar)) {
        const [sources, targets] = phrases.get(actualChar)!
        const slice = source.slice(sourceIndex)

        for (const [j, s] of sources.entries()) {
          if (slice.startsWith(s)) {
            // Check if the result is not valid (corrupted)
            if (!isCorruptedCharacter(processedChar))
              processedChar = targets[j]!

            hasMatch = true
            // Skip the matched characters in source index
            sourceIndex += s.length
            break
          }
        }
      }

      if (!hasMatch) {
        const convertedWord = words.get(actualChar)
        // Check if the result is not valid (not corrupted)
        if (convertedWord && !isCorruptedCharacter(convertedWord))
          processedChar = convertedWord

        sourceIndex += charLength
      }
    }
    else {
      sourceIndex += charLength
    }

    converted += processedChar
  }
  return converted
}
