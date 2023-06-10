# Chinese simplified and traditional conversion

## 中文繁简体转换

零依赖，内置词库，支持中文简体、繁体 互相转换。 文件体积大小 <= 36KB。

### Install

``` sh
# npm
npm install chinese-simple2traditional
# yarn
yarn add chinese-simple2traditional
# pnpm
pnpm add chinese-simple2traditional
```

### Usage

``` js
import { simpleToTradition, traditionToSimple } from 'chinese-simple2traditional'

simpleToTradition('主人何为言少钱，径须酤取对君酌。') // 主人何為言少錢，徑須酤取對君酌

traditionToSimple('主人何為言少錢，徑須酤取對君酌') // 主人何为言少钱，径须酤取对君酌。

```

## LICENSE

[MIT](./LICENSE)
