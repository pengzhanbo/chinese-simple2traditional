# API 文档

## 核心转换函数

### toSimplified(text[, options])

将繁体中文文本转换为简体中文文本。

**参数:**
- `text` (string): 要转换的繁体中文文本
- `options` (boolean | object, 可选): 转换选项
  - 当为 boolean 类型时，表示是否启用增强模式（短语库）
  - 当为 object 类型时，可包含以下属性：
    - `enhance` (boolean): 是否启用增强模式（短语库）
    - `customDict` (Map<string, string>): 自定义字符映射字典

**返回值:**
- `string`: 转换后的简体中文文本

**示例:**
```js
import { toSimplified } from 'chinese-simple2traditional'

// 基本转换
toSimplified('繁體中文') // '繁体中文'

// 使用增强模式（需要先调用 setupEnhance()）
toSimplified('王妃後來成爲了王后', true) // '王妃后来成为了王后'

// 使用自定义字典
const customDict = new Map([['龍', '龙']])
toSimplified('龍門', { customDict }) // '龙门'
```

### toTraditional(text[, options])

将简体中文文本转换为繁体中文文本。

**参数:**
- `text` (string): 要转换的简体中文文本
- `options` (boolean | object, 可选): 转换选项
  - 当为 boolean 类型时，表示是否启用增强模式（短语库）
  - 当为 object 类型时，可包含以下属性：
    - `enhance` (boolean): 是否启用增强模式（短语库）
    - `customDict` (Map<string, string>): 自定义字符映射字典

**返回值:**
- `string`: 转换后的繁体中文文本

**示例:**
```js
import { toTraditional } from 'chinese-simple2traditional'

// 基本转换
toTraditional('简体中文') // '簡體中文'

// 使用增强模式（需要先调用 setupEnhance()）
toTraditional('王妃后来成为了王后', true) // '王妃後來成爲了王后'

// 使用自定义字典
const customDict = new Map([['龙', '龍']])
toTraditional('龙门', { customDict }) // '龍門'
```

## 增强功能

### setupEnhance()

注入短语库以提高转换准确性。需要手动调用此函数来加载短语库。

**示例:**
```js
import { setupEnhance } from 'chinese-simple2traditional/enhance'

setupEnhance()
```

## 自定义短语

### customS2TPhrases(config)

添加自定义简体转繁体短语集合。

**参数:**
- `config` (Array<[string, string]>): 短语配置数组，每个元素为 [简体短语, 繁体短语] 的元组

**示例:**
```js
import { customS2TPhrases } from 'chinese-simple2traditional'

customS2TPhrases([
  ['双台子区', '雙臺子區'],
  ['软件开发', '軟體開發']
])
```

### customT2SPhrases(config)

添加自定义繁体转简体短语集合。

**参数:**
- `config` (Array<[string, string]>): 短语配置数组，每个元素为 [繁体短语, 简体短语] 的元组

**示例:**
```js
import { customT2SPhrases } from 'chinese-simple2traditional'

customT2SPhrases([
  ['雖覆能復', '虽覆能复'],
  ['軟體開發', '软件开发']
])
```

## 核心转换器

### converter(source, words, phrases?)

核心文本转换函数，支持字符级和短语级转换。

**参数:**
- `source` (string): 源文本
- `words` (Words): 字符映射表
- `phrases` (PhrasesMap, 可选): 短语映射表

**返回值:**
```ts
{
  converted: string,                    // 转换后的文本
  corruptedChars: Array<{ char: string, position: number }>,  // 损坏字符信息
  unmappedChars: Array<{ char: string, position: number }>    // 未映射字符信息
}
```

## 工具函数

### isChineseCharacter(char)

检查字符是否为中文字符。

**参数:**
- `char` (string): 要检查的字符

**返回值:**
- `boolean`: 如果是中文字符则返回 true

### isCorruptedCharacter(char)

检查字符是否损坏（替换字符或无效字符）。

**参数:**
- `char` (string): 要检查的字符

**返回值:**
- `boolean`: 如果字符损坏则返回 true

### stringIterator(str)

迭代字符串中的字符，正确处理代理对（如 emoji）。

**参数:**
- `str` (string): 要迭代的字符串

**返回值:**
- `Generator<string>`: 字符生成器

## 类型定义

### Words
```ts
type Words = Map<string, string>
```

### PhrasesMap
```ts
type PhrasesMap = Map<string, [string[], string[]]>
```

### PhrasesConfig
```ts
type PhrasesConfig = (readonly [string, string])[]
```