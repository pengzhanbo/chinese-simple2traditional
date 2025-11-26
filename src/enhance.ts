import { simplifiedPhrasesMap, traditionalPhrasesMap } from './cache'
import simplifiedPhrases from './data/simplified-phrases'
import traditionalPhrases from './data/traditional-phrases'
import { transformPhrases } from './phrases'

/**
 * 注入 短语库，增强 繁简体 转换 的准确性
 */
export function setupEnhance(): void {
  transformPhrases(simplifiedPhrases, simplifiedPhrasesMap)
  transformPhrases(traditionalPhrases, traditionalPhrasesMap)
}
