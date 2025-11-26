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
export function isChineseCharacter(char: string): boolean {
  // Check if the character is in the Chinese Unicode ranges
  const code = char.codePointAt(0) || char.charCodeAt(0)
  return (
    (code >= 0x4E00 && code <= 0x9FFF) // CJK Unified Ideographs
    || (code >= 0x3400 && code <= 0x4DBF) // CJK Extension A
    || (code >= 0x20000 && code <= 0x2A6DF) // CJK Extension B
    || (code >= 0x2A700 && code <= 0x2B73F) // CJK Extension C
    || (code >= 0x2B740 && code <= 0x2B81F) // CJK Extension D
    || (code >= 0x2B820 && code <= 0x2CEAF) // CJK Extension E
    || (code >= 0x2CEB0 && code <= 0x2EBEF) // CJK Extension F
    || (code >= 0x3000 && code <= 0x303F) // CJK Symbols and Punctuation
    || (code >= 0xFF00 && code <= 0xFFEF) // Halfwidth and Fullwidth Forms
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
export function isCorruptedCharacter(char: string): boolean {
  if (char === '\uFFFD')
    return true
  const code = char.charCodeAt(0)
  // Check if the character is a replacement character or appears as one when displayed
  return code === 55409 || code === 55405
}

const PAIRS_PROPERLY_STAR = 0xD800
const PAIRS_PROPERLY_END = 0xDBFF
const NEXT_PAIRS_PROPERLY_STAR = 0xDC00
const NEXT_PAIRS_PROPERLY_END = 0xDFFF

/**
 * 获取字符的长度
 */
export function getCharLength(source: string, index: number): number {
  const code = source[index]?.charCodeAt(0)
  let charLength = 1

  if (typeof code === 'undefined')
    return charLength

  if (index < source.length - 1 && code >= PAIRS_PROPERLY_STAR && code <= PAIRS_PROPERLY_END) {
    const nextChar = source[index + 1]!
    const nextCode = nextChar.charCodeAt(0)
    if (nextCode >= NEXT_PAIRS_PROPERLY_STAR && nextCode <= NEXT_PAIRS_PROPERLY_END) {
      // This is a surrogate pair
      charLength = 2
    }
  }
  return charLength
}
