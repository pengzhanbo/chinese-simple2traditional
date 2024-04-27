import simplifiedPhrases from './data/simplified-phrases'
import traditionalPhrases from './data/traditional-phrases'
import { transformPhrases } from './phrases'
import { simplifiedPhrasesMap, traditionalPhrasesMap } from './cache'

/**
 * 注入 短语库，增强 繁简体 转换 的准确性
 */
export function setupEnhance() {
  transformPhrases(simplifiedPhrases, simplifiedPhrasesMap)
  transformPhrases(traditionalPhrases, traditionalPhrasesMap)
}
