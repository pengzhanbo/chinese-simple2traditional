/**
 * 将原始数据转换为 `data` 目录下的文件
 */

import path from 'node:path'
import fs from 'node:fs/promises'

interface TransformData {
  [key: string]: string[]
}

const from = path.resolve('data')
const output = path.resolve('src/data')

const files = {
  /**
   * 17k+ 的 繁 <-> 简 映射
   * https://github.com/fighting41love/funNLP
   */
  full: 'full_t2s.txt',

  /**
   * 常用字 的 繁 <-> 简 映射
   * 存在两份表是为了互为对照
   */
  s2t_c: 's2t_characters.txt',
  t2s_c: 't2s_characters.txt',

  /**
   * 特殊短语 的 繁 <-> 简 映射
   */
  s2t_p: 's2t_phrases.txt',
  t2s_p: 't2s_phrases.txt',

  /**
   * 1.x 版本中使用的映射表
   */
  old_words: 's2t-1.x.txt',

  /**
   * 最终产出文件
   */
  // 字符映射表
  full_words: 'words.ts',
  // 繁 -> 简 特殊短语 映射表
  t_phrases: 'traditional-phrases.ts',
  // 简 -> 繁 特殊短语 映射表
  s_phrases: 'simplified-phrases.ts',
}

async function read(filename: string) {
  const file = path.resolve(from, filename)
  const content = await fs.readFile(file, 'utf-8')
  return content
}

async function write(filename: string, content: any, after = '') {
  const file = path.resolve(output, filename)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(
    file,
    `export default ${JSON.stringify(content)}${after}`,
    'utf8',
  )
}

function transform(content: string, reverse = false): TransformData {
  const lines = content.replace(/[\s\n]+$/, '').split(/\n+/)
  const data: TransformData = {}
  for (const line of lines) {
    if (!line)
      continue

    const [key, ...values] = line.trim().split(/[\s\t]+/)
    if (!key || key === '□')
      continue

    if (reverse) {
      for (const value of values) {
        if (value === '□')
          continue

        data[value] ??= []
        data[value].push(key)
      }
    }
    else {
      if (values.length) {
        data[key] ??= []
        data[key].push(...values)
      }
    }
  }
  return data
}

function transformPhrases(content: string): TransformData {
  const lines = content.replace(/[\s\n]+$/, '').split(/\n+/)
  const data: TransformData = {}
  for (const line of lines) {
    if (!line)
      continue

    const [key, ...values] = line.trim().split(/\s+/)
    if (!key || key === '□')
      continue

    if (values.length) {
      data[key] ??= []
      data[key].push(...values)
    }
  }
  return data
}

function transformOld(oldWords: string): TransformData {
  const data: TransformData = {}
  const words = oldWords.replace(/[\s\n]+$/g, '').split(' ')
  for (const word of words) {
    const [key, ...values] = word.split('')
    data[key] = values
  }

  return data
}

function merge(from: TransformData, to: TransformData) {
  // 合并 1.x 版本的数据，避免遗漏错漏
  for (const [key, value] of Object.entries(from)) {
    if (key in to)
      to[key] = uniq([...to[key], ...value])
    else
      to[key] = value
  }

  // 清洗数据
  // 1. 简繁同字，删除
  // 2. 简繁同字，但存在异体字，将异体字移到后面
  // 3. 简繁同字，但存在异体字，且异体字恰好是简体字，将异体字删除
  for (const [key, values] of Object.entries(to)) {
    const index = values.findIndex(v => v === key)
    if (index !== -1) {
      if (values.length === 1) {
        to[key] = []
      }
      else {
        to[key].splice(index, 1)
        index !== values.length - 1 && to[key].unshift(key)
      }
    }
  }
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr))
}

function resolvePhrases(data: TransformData): [string, string] {
  let phrases: [string, string][] = []

  for (const [key, values] of Object.entries(data))
    phrases.push([key, values[0]])

  phrases = phrases.sort((a, b) => {
    if (a[0].length === b[0].length)
      return 0

    return a[0].length < b[0].length ? 1 : -1
  })

  const sources: string[] = []
  const targets: string[] = []

  for (const [source, target] of phrases) {
    sources.push(source)
    targets.push(source === target ? '_' : target)
  }

  return [sources.join(' '), targets.join(' ')]
}

async function generate() {
  const s2t = transform(await read(files.s2t_c))
  const t2s = transform(await read(files.t2s_c), true)
  const full = transform(await read(files.full), true)
  const sp = transformPhrases(await read(files.s2t_p))
  const tp = transformPhrases(await read(files.t2s_p))
  const oldData = transformOld(await read(files.old_words))

  const full_content: string[] = ['‘『', '’』', '“「', '”」', '″〞', '〓═']

  // 对照 繁 -> 简 表，合并到 简 -> 繁 表
  merge(t2s, s2t)

  // 对照 full 表，合并到 简 -> 繁 表
  for (const [key, values] of Object.entries(full)) {
    if (!(key in s2t))
      s2t[key] = values
  }

  // 合并旧数据
  merge(oldData, s2t)

  // 序列化内容
  for (const [key, values] of Object.entries(s2t))
    values.length && full_content.push(`${key}${values.join('')}`)

  await write(files.full_words, `${full_content.join(' ')}`)
  await write(files.t_phrases, resolvePhrases(tp), ' as readonly [string, string]')
  await write(files.s_phrases, resolvePhrases(sp), ' as readonly [string, string]')
}

try {
  await generate()
}
catch (e) {
  console.error(e)
}
