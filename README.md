# 中文繁简体转换

![jsr](https://jsr.io/badges/@raise/han-convert)
![jsr score](https://jsr.io/badges/@raise/han-convert/score)

![NPM Version](https://img.shields.io/npm/v/chinese-simple2traditional)
![NPM Downloads](https://img.shields.io/npm/dy/chinese-simple2traditional)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/chinese-simple2traditional?label=gzip)
![NPM License](https://img.shields.io/npm/l/chinese-simple2traditional)
![GitHub issue custom search](https://img.shields.io/github/issues-search?query=repo%3Apengzhanbo%2Fchinese-simple2traditional%20is%3Aissue%20is%3Aopen%20&logo=github&label=issue%20open)

- 内置字库，零依赖，支持任何运行环境。
- 支持 `3077+` 常用简体字 和 `4919+` 繁体字/异体字。
- 支持 `3577+` 简体短语转繁体的特殊情况。
- 支持 `117+` 繁体短语/异体短语 转简体的特殊情况。

内置字库 `< 30kb`，短语库 约 `374kb`。为了避免加载资源过多，你需要手动加载短语库。

`v2` 相比于 `v1` 版本，提供了更多的字库支持！更精确的繁简体转换！更少的转换耗时！

> [!IMPORTANT]
> `v2` 版本仅支持 ESM 导入，不再支持 CommonJS 和 IIFE。
>
> 如果你想使用 CommonJS 或 IIFE 导入，请使用 `v1` 版本。

## 预览

访问 [在线演示](https://han-convert.netlify.app/) 查看。

``` sh
# npm
npm install chinese-simple2traditional
# yarn
yarn add chinese-simple2traditional
# pnpm
pnpm add chinese-simple2traditional
```

也可以使用 JSR ，但包名重命名为 `@raise/han-convert`：

```sh
# npm
npx jsr add @raise/han-convert
# yarn
yarn dlx jsr add @raise/han-convert
# pnpm
pnpm dlx jsr add @raise/han-convert
# bun
bunx jsr add @raise/han-convert
# deno
deno add jsr:@raise/han-convert
```

## 使用方法

``` js
import { toSimplified, toTraditional } from 'chinese-simple2traditional'

toTraditional('主人何为言少钱，径须酤取对君酌。') // 主人何爲言少錢，徑須酤取對君酌

toSimplified('主人何爲言少錢，徑須酤取對君酌') // 主人何为言少钱，径须酤取对君酌。
```

默认情况下，繁简体转换仅是逐个对字符进行处理，因此获取的结果可能并不是精确的。
优势是加载的包体积 `<30kb`。

你还可以额外引入 短语库，获取更为精确的转换结果，但需要额外加载 `374kb+` 的短语库。

```js
import { toSimplified, toTraditional } from 'chinese-simple2traditional'
import { setupEnhance } from 'chinese-simple2traditional/enhance'

setupEnhance() // 注入短语库

// 默认情况下，王后 被错误转为 王後
toSimplified('王妃后来成为了王后') // 王妃後來成爲了王後
// 传入第二个参数 `true` 以获取精确结果
toSimplified('王妃后来成为了王后', true) // 王妃後來成爲了王后
```

如果是使用 JSR 安装，请使用以下语句导入：

```js
import { toSimplified, toTraditional } from '@raise/han-convert'
import { setupEnhance } from '@raise/han-convert/enhance'
```

## 命令行工具

该包包含一个命令行界面，用于在简体中文和繁体中文之间转换文件。

### 安装

要全局使用命令行工具，请使用以下命令安装：

```sh
npm install -g chinese-simple2traditional
# 或者
pnpm add -g chinese-simple2traditional
```

### 使用方法

```sh
cc [options] <files...>
```

### 选项

- `-s, --to-simplify` - 转换为简体中文（默认）
- `-t, --to-traditional` - 转换为繁体中文
- `-o, --output-folder <folder>` - 转换文件的输出文件夹
- `-p, --inplace` - 就地修改文件，忽略 -o
- `-v, --verbose` - 显示更改的差异
- `-e, --exclude <patterns...>` - 要排除的文件的通配符模式
- `-d, --dry-run` - 记录更改但不提交
- `-l, --list` - 列出每个文件的转换字符
- `-a, --accumulate-list` - 累积并在最后列出所有转换的字符
- `-S, --simplify-to-traditional <dictionary>` - 自定义简体到繁体字典（格式："簡简 繁繁"）
- `-T, --traditional-to-simplify <dictionary>` - 自定义繁体到简体字典（格式："简簡 繁繁"）
- `-i, --input <text>` - 要转换的内联文本
- `-z, --chinese-log` - 使用中文日志消息
- `-E, --english-log` - 使用英文日志消息

### 重要提示

当使用 `-S` 或 `-T` 选项时，请确保字典值用引号括起来，以避免命令行参数解析问题：

```sh
# 正确用法 - 使用引号括起字典值
cc files/*.txt -T "龍龙 馬马" -v

# 错误用法 - 不使用引号可能导致参数解析错误
cc files/*.txt -T 龍龙 馬马 -v  # 可能导致问题
```

### 示例

```sh
# 转换文件为简体中文
cc files/*.txt -s

# 使用自定义字典转换（注意字典值必须用引号括起来）
cc files/*.txt -T "龍龙 馬马" -v

# 显示更改但不应用（dry run）
cc files/*.txt --dry-run -a

# 使用输出文件夹并显示详细差异
cc files/*.txt -o converted/ -v

# 转换内联文本
cc -i "简体中文测试" -t

# 使用中文日志消息
cc files/*.txt -s -z
```

## API

### toSimplified(text[, enhance])

- `text`: `string`， 待转换的文本
- `enhance`: `boolean`， 是否启用短语库，只有在 注入短语库 后有效

将文本繁体转换为简体。

### toTraditional(text[, enhance])

- `text`: `string`， 待转换的文本
- `enhance`: `boolean`， 是否启用短语库，只有在 注入短语库 后有效

将文本简体转换为繁体。

### setupEnhance()

注入短语库。

```js
import { setupEnhance } from 'chinese-simple2traditional/enhance'
```

如果是使用 JSR 安装，请使用以下语句导入：

```js
import { setupEnhance } from '@raise/han-convert/enhance'
```

### customS2TPhrases(phrases)

添加 自定义 简体转繁体 短语集合。

- `phrases`: `[string, string][]` ， 短语集合

  集合的每个元素为 `['简体短语', '繁体短语']` 的元组，表示 `简体短语` 转换为 `繁体短语`

```ts
import { customS2TPhrases, toTraditional } from 'chinese-simple2traditional'

customS2TPhrases([
  ['双台子区', '雙臺子區'],
  // ...
])

toTraditional('双台子区', true) // 雙臺子區
```

### customT2SPhrases(phrases)

添加 自定义 繁体转简体 短语集合。

- `phrases`: `[string, string][]` ， 短语集合

  集合的每个元素为 `['繁体短语', '简体短语']` 的元组, 表示 `繁体短语` 转换为 `简体短语`

```ts
import { customT2SPhrases, toSimplified } from 'chinese-simple2traditional'

customT2SPhrases([
  ['雖覆能復', '虽覆能复']
  // ...
])

toSimplified('雖覆能復', true) // 虽覆能复
```

## 开发者 API

### converter(source, words, phrases?)

核心转换函数，支持字符和短语级别的转换。

- `source`: `string` - 源文本
- `words`: `Words` - 字符映射表
- `phrases`: `PhrasesMap` (可选) - 短语映射表

返回转换结果对象：
```ts
{
  converted: string,                    // 转换后的文本
  corruptedChars: Array<{ char: string, position: number }>,  // 损坏字符信息
  unmappedChars: Array<{ char: string, position: number }>    // 未映射字符信息
}
```

### isChineseCharacter(char)

检查字符是否为中文字符。

- `char`: `string` - 要检查的字符
- 返回: `boolean` - 如果是中文字符则返回true

### isCorruptedCharacter(char)

检查字符是否损坏（替换字符或无效字符）。

- `char`: `string` - 要检查的字符
- 返回: `boolean` - 如果字符损坏则返回true

### stringIterator(str)

迭代字符串中的字符，正确处理代理对（如emoji）。

- `str`: `string` - 要迭代的字符串
- 返回: `Generator<string>` - 字符生成器

## 许可证

[MIT](./LICENSE)