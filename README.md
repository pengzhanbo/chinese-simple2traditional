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

## Usage

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

## CLI

The package includes a command-line interface for converting files between simplified and traditional Chinese.

### Installation

To use the CLI globally, install the package with:

```sh
npm install -g chinese-simple2traditional
# or
pnpm add -g chinese-simple2traditional
```

### Usage

```sh
cc [options] <files...>
```

### Options

- `-s, --to-simplify` - Convert to simplified Chinese (default)
- `-t, --to-traditional` - Convert to traditional Chinese
- `-o, --output-folder <folder>` - Output folder for converted files
- `-p, --inplace` - Modify files in-place, ignore -o
- `-v, --verbose` - Show a diff of the changes
- `-e, --exclude <patterns...>` - Glob patterns for files to exclude
- `-d, --dry-run` - Log changes without committing them
- `-l, --list` - List converted characters per file
- `-a, --accumulate-list` - Accumulate and list all converted characters at the end
- `-S, --simplify-to-traditional <dictionary>` - Custom simplify to traditional dictionary (format: "簡简 繁繁")
- `-T, --traditional-to-simplify <dictionary>` - Custom traditional to simplify dictionary (format: "简簡 繁繁")
- `-z, --chinese-log` - Use Chinese log messages (使用中文日志消息)
- `-E, --english-log` - Use English log messages (使用英文日志消息)

### Examples

```sh
# Convert files to simplified Chinese
cc files/*.txt -s

# Convert with custom dictionary
cc files/*.txt -T "龍龙 馬马" -v

# Show changes without applying them
cc files/*.txt --dry-run -al

# Use output folder and show verbose diff
cc files/*.txt -o converted/ -v

# Use Chinese log messages
cc files/*.txt -s -z
```

## API

### toSimplified(text[, enhance])

- `text`: `string`， 待转换的文本
- `enhance`: `boolean`， 是否启用短语库，只有在 注入短语库 后有效

将文本简体转换为繁体。

### toTraditional(text[, enhance])

- `text`: `string`， 待转换的文本
- `enhance`: `boolean`， 是否启用短语库，只有在 注入短语库 后有效

将文本繁体转换为简体。

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

## LICENSE

[MIT](./LICENSE)
