# 中文繁简体转换

- 内置字库，零依赖，支持任何运行环境。
- 支持 `3077+` 常用简体字 和 `4919+` 繁体字/异体字。
- 支持 `3577+` 简体短语转繁体的特殊情况。
- 支持 `117+` 繁体短语/异体短语 转简体的特殊情况。

内置字库 `< 16kb`，短语库 约 `374kb`。为了避免加载资源过多，你需要手动加载短语库。

`v2` 相比于 `v1` 版本，提供了更多的字库支持！更精确的繁简体转换！更少的转换耗时！

> [!IMPORTANT]
> `v2` 版本仅支持 ESM 导入，不再支持 CommonJS 和 IIFE。
>
> 如果你想使用 CommonJS 或 IIFE 导入，请使用 `v1` 版本。

## 预览

访问 [Live Demo](https://han-convert.netlify.app/) 查看演示。

## Install

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
deno add @raise/han-convert
```

## Usage

``` js
import { toSimplified, toTraditional } from 'chinese-simple2traditional'

toTraditional('主人何为言少钱，径须酤取对君酌。') // 主人何爲言少錢，徑須酤取對君酌

toSimplified('主人何爲言少錢，徑須酤取對君酌') // 主人何为言少钱，径须酤取对君酌。
```

默认情况下，繁简体转换仅是逐个对字符进行处理，因此获取的结果可能并不是精确的。
优势是加载的包体积 `<16kb`。

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
// or JSR
import { setupEnhance } from '@raise/han-convert/enhance'
```

## LICENSE

[MIT](./LICENSE)
