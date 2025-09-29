# 命令行工具文档

## 安装

要全局使用命令行工具，请使用以下命令安装：

```sh
npm install -g chinese-simple2traditional
# 或者
pnpm add -g chinese-simple2traditional
```

## 基本用法

```sh
cc [options] <files...>
```

## 选项

### 转换选项
- `-s, --to-simplify` - 转换为简体中文（默认）
- `-t, --to-traditional` - 转换为繁体中文

### 输出选项
- `-o, --output-folder <folder>` - 转换文件的输出文件夹
- `-p, --inplace` - 就地修改文件，忽略 -o

### 显示选项
- `-v, --verbose` - 显示更改的差异
- `-l, --list` - 列出每个文件的转换字符
- `-a, --accumulate-list` - 累积并在最后列出所有转换的字符

### 过滤选项
- `-e, --exclude <patterns...>` - 要排除的文件的通配符模式
- `-d, --dry-run` - 记录更改但不提交

### 自定义字典选项
- `-S, --simplify-to-traditional <dictionary>` - 自定义简体到繁体字典（格式："簡简 繁繁"）
- `-T, --traditional-to-simplify <dictionary>` - 自定义繁体到简体字典（格式："简簡 繁繁"）

### 内联文本选项
- `-i, --input <text>` - 要转换的内联文本

### 语言选项
- `-z, --chinese-log` - 使用中文日志消息
- `-E, --english-log` - 使用英文日志消息

## 重要提示

当使用 `-S` 或 `-T` 选项时，请确保字典值用引号括起来，以避免命令行参数解析问题：

```sh
# 正确用法 - 使用引号括起字典值
cc files/*.txt -T "龍龙 馬马" -v

# 错误用法 - 不使用引号可能导致参数解析错误
cc files/*.txt -T 龍龙 馬马 -v  # 可能导致问题
```

## 示例

### 基本文件转换
```sh
# 转换文件为简体中文（默认）
cc files/*.txt -s

# 转换文件为繁体中文
cc files/*.txt -t
```

### 使用自定义字典
```sh
# 使用自定义字典转换（注意字典值必须用引号括起来）
cc files/*.txt -T "龍龙 馬马" -v
```

### 显示模式
```sh
# 显示更改但不应用（dry run）
cc files/*.txt --dry-run -a

# 使用输出文件夹并显示详细差异
cc files/*.txt -o converted/ -v

# 列出每个文件的转换字符
cc files/*.txt -l
```

### 内联文本转换
```sh
# 转换内联文本
cc -i "简体中文测试" -t
```

### 语言选项
```sh
# 使用中文日志消息（默认）
cc files/*.txt -s -z

# 使用英文日志消息
cc files/*.txt -s -E
```

### 高级用法
```sh
# 就地修改文件
cc files/*.txt -t -p

# 排除特定文件
cc files/*.txt -s -e "**/*.min.txt" -v

# 使用复杂的通配符模式
cc "src/**/*.{js,ts,jsx,tsx}" -t -o dist/ -v
```

## 输出格式

### 默认输出
命令行工具会显示处理摘要，包括：
- 处理的文件数量
- 跳过的文件数量
- 唯一转换数量
- 总转换数量
- 处理时间

### 详细输出 (-v)
使用 `-v` 选项时，会显示文件的差异，包括：
- 添加的字符（绿色）
- 删除的字符（红色）
- 未更改的字符（默认颜色）

### 列表输出 (-l)
使用 `-l` 选项时，会列出每个文件中转换的字符：
```
converted characters in file.txt:
  "简" -> "簡" at position 0
  "体" -> "體" at position 1
```

### 累积列表输出 (-a)
使用 `-a` 选项时，会在最后累积显示所有转换的字符：
```
Accumulated converted characters across all files:
  "简" -> "簡" (occurred 5 times)
  "体" -> "體" (occurred 5 times)
```

## 错误处理

### 文件处理错误
如果文件无法读取或写入，工具会显示错误信息并继续处理其他文件。

### 转换错误
如果在转换过程中遇到损坏字符，工具会尝试保留原始字符并记录错误。

### 参数错误
如果提供了无效的命令行参数，工具会显示帮助信息。