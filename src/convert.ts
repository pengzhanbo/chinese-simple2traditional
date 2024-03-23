import { simplifiedPhrasesMap, st, traditionalPhrasesMap, ts } from './cache'
import { converter } from './converter'
import { transformWords } from './words'

transformWords()

/**
 * 简体转换为繁体
 * @param text - 简体文本
 * @param enhance - 使用启用 短语库增强，提高准确性
 * @returns 繁体文本
 */
export function toTraditional(text: string, enhance = false): string {
  return converter(text, st, enhance ? simplifiedPhrasesMap : undefined)
}

/**
 * 繁体转换为简体
 * @param text - 繁体文本
 * @param enhance - 使用启用 短语库增强，提高准确性
 * @returns 简体文本
 */
export function toSimplified(text: string, enhance = false): string {
  return converter(text, ts, enhance ? traditionalPhrasesMap : undefined)
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
