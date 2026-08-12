// oxlint-disable unicorn/number-literal-case

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
  const code = char.codePointAt(0) ?? char.charCodeAt(0)
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
    (code >= 0x2a700 && code <= 0x2b73f) || // CJK Extension C
    (code >= 0x2b740 && code <= 0x2b81f) || // CJK Extension D
    (code >= 0x2b820 && code <= 0x2ceaf) || // CJK Extension E
    (code >= 0x2ceb0 && code <= 0x2ebef) || // CJK Extension F
    (code >= 0x3000 && code <= 0x303f) || // CJK Symbols and Punctuation
    (code >= 0xff00 && code <= 0xffef) // Halfwidth and Fullwidth Forms
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
  if (char === '\uFFFD') {
    return true
  }
  const code = char.charCodeAt(0)
  // Check if the character is a replacement character or appears as one when displayed
  return code === 55409 || code === 55405
}

const PAIRS_PROPERLY_STAR = 0xd800
const PAIRS_PROPERLY_END = 0xdbff
const NEXT_PAIRS_PROPERLY_STAR = 0xdc00
const NEXT_PAIRS_PROPERLY_END = 0xdfff

/**
 * 该函数用于获取字符的长度，考虑了 Unicode 中的代理对（surrogate pairs）。
 * @param source - 源文本，需要获取字符长度的原始文本
 * @param index - 字符在源文本中的索引
 * @returns 字符的长度，考虑了代理对
 *
 * @example
 * ```ts
 * getCharLength('中', 0) // 2
 * getCharLength('中', 1) // 1
 * ```
 */
export function getCharLength(source: string, index: number): number {
  const code = source[index]?.charCodeAt(0)
  let charLength = 1

  if (typeof code === 'undefined') {
    return charLength
  }

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
