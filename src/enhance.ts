import { simplifiedPhrasesMap, traditionalPhrasesMap } from './cache.js'
import simplifiedPhrases from './data/simplified-phrases.js'
import traditionalPhrases from './data/traditional-phrases.js'
import { transformPhrases } from './phrases.js'

/**
 * 注入 短语库，增强 繁简体 转换 的准确性
 */
export function setupEnhance(): void {
  transformPhrases(simplifiedPhrases, simplifiedPhrasesMap)
  transformPhrases(traditionalPhrases, traditionalPhrasesMap)
}
