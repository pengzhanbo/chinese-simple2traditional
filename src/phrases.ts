import type { PhrasesMap } from './cache'
import { simplifiedPhrasesMap, traditionalPhrasesMap } from './cache'

export type PhrasesConfig = (readonly [string, string])[]

/**
 * 添加 自定义 简体转繁体 短语集合
 * @param config - 短语集合 [['简体短语', '繁体短语'], ...]
 *
 * @example
 * ```ts
 * customS2TPhrases([
 *  ['友谊万岁', '友誼萬歲'],
 *  ['王后'， '王后'],
 * ])
 * ```
 */
export function customS2TPhrases(config: PhrasesConfig): void {
  config.forEach(([source, target]) => addPhrases(simplifiedPhrasesMap, source, target))
}

/**
 * 添加 自定义 繁体转简体 短语集合
 * @param config - 短语集合 [['繁体短语', '简体短语'], ...]
 *
 * @example
 * ```ts
 * customT2SPhrases([
 *   ['酒逢知己千鍾少', '酒逢知己千锺少'],
 *   ['雖覆能復', '虽覆能复'],
 * ])
 * ```
 */
export function customT2SPhrases(config: PhrasesConfig): void {
  config.forEach(([source, target]) => addPhrases(traditionalPhrasesMap, source, target))
}

function addPhrases(map: PhrasesMap, source: string, target: string): void {
  const key = source[0]
  let tuple = map.get(key)
  !tuple && map.set(key, (tuple = [[], []]))

  tuple[0].push(source)
  tuple[1].push(target === '_' ? source : target)
}

export function transformPhrases(data: readonly [string, string], map: PhrasesMap): void {
  const sources = data[0].split(' ')
  const targets = data[1].split(' ')
  sources.forEach((source, index) => addPhrases(map, source, targets[index]))
}
