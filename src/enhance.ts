import simplifiedPhrases from './data/simplified-phrases'
import traditionalPhrases from './data/traditional-phrases'
import { type PhrasesMap, simplifiedPhrasesMap, traditionalPhrasesMap } from './cache'

/**
 * 注入 短语库，增强 繁简体 转换 的准确性
 */
export function setupEnhance() {
  transformPhrases(simplifiedPhrases, simplifiedPhrasesMap)
  transformPhrases(traditionalPhrases, traditionalPhrasesMap)
}

function transformPhrases(data: readonly [string, string], map: PhrasesMap) {
  const sources = data[0].split(' ')
  const targets = data[1].split(' ')

  for (const [index, source] of sources.entries()) {
    const key = source[0]
    const target = targets[index]

    let value = map.get(key)
    !value && map.set(key, (value = [[], []]))

    value[0].push(source)
    value[1].push(target === '_' ? source : target)
  }
}
