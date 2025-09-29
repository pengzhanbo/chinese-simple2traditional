#!/usr/bin/env node

import { Command } from 'commander'
import { glob } from 'glob'
import { diffChars } from 'diff'
import ansis from 'ansis'
import * as fs from 'fs'
import * as path from 'path'
import { toSimplified, toTraditional, converter, st, ts, simplifiedPhrasesMap, traditionalPhrasesMap } from '../dist/index'
import { version } from '../package.json'

interface Options {
  toSimplify: boolean
  toTraditional: boolean
  outputFolder?: string
  inplace: boolean
  verbose: boolean
  exclude: string[]
  dryRun: boolean
  list: boolean
  accumulateList: boolean
  simplifyToTraditional?: string  // custom dictionary for simplify to traditional
  traditionalToSimplify?: string  // custom dictionary for traditional to simplify
  chineseLog?: boolean  // Chinese log messages
  englishLog?: boolean  // English log messages
  input?: string  // inline text to convert
}

interface ConversionResult {
  original: string
  converted: string
  changes: Array<{ from: string; to: string; position: number }>
  corruptedChars?: Array<{ char: string; position: number }> // Add corrupted characters tracking
  unmappedChars?: Array<{ char: string; position: number }> // Add unmapped characters tracking
}

// Create a more accurate way to track character conversions
function getConversionChanges(original: string, converted: string, corruptedChars?: Array<{ char: string; position: number }>, unmappedChars?: Array<{ char: string; position: number }>): Array<{ from: string; to: string; position: number }> {
  const changes: Array<{ from: string; to: string; position: number }> = []

  // Since we're doing Chinese character conversion, we need to identify which characters changed
  // This is a simple comparison, but might not be 100% accurate for all conversions
  const minLength = Math.min(original.length, converted.length)

  for (let i = 0; i < minLength; i++) {
    if (original[i] !== converted[i]) {
      // Check if this character was corrupted and preserved
      const isCorrupted = corruptedChars?.some(corrupted => corrupted.position === i && corrupted.char === original[i])
      // Check if this character was unmapped
      const isUnmapped = unmappedChars?.some(unmapped => unmapped.position === i && unmapped.char === original[i])

      if (!isCorrupted && !isUnmapped) {
        changes.push({
          from: original[i],
          to: converted[i],
          position: i
        })
      }
    }
  }

  // Handle different lengths (though text conversion shouldn't change length significantly)
  if (original.length > converted.length) {
    for (let i = minLength; i < original.length; i++) {
      // Check if this character was corrupted and preserved
      const isCorrupted = corruptedChars?.some(corrupted => corrupted.position === i && corrupted.char === original[i])
      // Check if this character was unmapped
      const isUnmapped = unmappedChars?.some(unmapped => unmapped.position === i && unmapped.char === original[i])

      if (!isCorrupted && !isUnmapped) {
        changes.push({
          from: original[i],
          to: '',
          position: i
        })
      }
    }
  } else if (converted.length > original.length) {
    for (let i = minLength; i < converted.length; i++) {
      changes.push({
        from: '',
        to: converted[i],
        position: i
      })
    }
  }

  return changes
}

const program = new Command()

program
  .name(ansis.cyan('cc'))
  .description(ansis.dim.bold('A CLI to convert files between simplified and traditional Chinese.') + '\n' + ansis.bold('一个在简体中文和繁体中文之间转换文件的命令行工具\n'))
  .version(version)
  .argument('[files...]', ansis.cyan.dim('Files to convert using glob patterns') + '\n' + ansis.cyan('使用通配符模式转换文件'))
  .option('-s, --to-simplify', ansis.cyan.dim('Convert to simplified Chinese (default)') + '\n' + ansis.cyan('转换为简体中文（默认）'), false)
  .option('-t, --to-traditional', ansis.cyan.dim('Convert to traditional Chinese') + '\n' + ansis.cyan('转换为繁体中文'), false)
  .option('-o, --output-folder <folder>', ansis.cyan.dim('Output folder for converted files') + '\n' + ansis.cyan('转换文件的输出文件夹'), undefined)
  .option('-p, --inplace', ansis.cyan.dim('Modify files in-place, ignore -o') + '\n' + ansis.cyan('就地修改文件，忽略 -o'), false)
  .option('-v, --verbose', ansis.cyan.dim('Show a diff of the changes') + '\n' + ansis.cyan('显示更改的差异'), false)
  .option('-e, --exclude <patterns...>', ansis.cyan.dim('Glob patterns for files to exclude') + '\n' + ansis.cyan('要排除的文件的通配符模式'), [])
  .option('-d, --dry-run', ansis.cyan.dim('Log changes without committing them') + '\n' + ansis.cyan('记录更改但不提交'), false)
  .option('-l, --list', ansis.cyan.dim('List converted characters per file') + '\n' + ansis.cyan('列出每个文件的转换字符'), false)
  .option('-a, --accumulate-list', ansis.cyan.dim('Accumulate and list all converted characters at the end') + '\n' + ansis.cyan('累积并在最后列出所有转换的字符'), false)
  .option('-S, --simplify-to-traditional <dictionary>', ansis.cyan.dim('Custom simplify to traditional dictionary (format: "簡简 繁繁", use quotes)') + '\n' + ansis.cyan('自定义简体到繁体字典（格式："簡简 繁繁"，使用引号）'), undefined)
  .option('-T, --traditional-to-simplify <dictionary>', ansis.cyan.dim('Custom traditional to simplify dictionary (format: "简簡 繁繁", use quotes)') + '\n' + ansis.cyan('自定义繁体到简体字典（格式："简簡 繁繁"，使用引号）'), undefined)
  .option('-i, --input <text>', ansis.cyan.dim('Inline text to convert') + '\n' + ansis.cyan('要转换的内联文本'), undefined)
  .option('-z, --chinese-log', ansis.cyan.dim('Use Chinese log messages\n') + ansis.cyan('(使用中文日志消息)'), undefined)  // No default, let shouldUseChineseByDefault handle it
  .option('-E, --english-log', ansis.cyan.dim('Use English log messages\n') + ansis.cyan('(使用英文日志消息)'), false)
  .action(async (files: string[], options: Options) => {
    await run(files, options)
  })

// Add colorful header to help
program.addHelpText('beforeAll', () =>
  ansis.bold(ansis.magenta('\n  🇨🇳 Chinese Simplified/Traditional Converter CLI\n')) +
  '\n  ' + ansis.cyan.dim('A CLI to convert files between simplified and traditional Chinese') + '\n' + ansis.cyan('一个在简体中文和繁体中文之间转换文件的命令行工具')
)

program.addHelpText('afterAll', () =>
  '\n' + ansis.bold(ansis.underline(ansis.cyan('示例 (EXAMPLES):'))) + '\n' +
  '  ' + ansis.green('# 转换文件为简体中文') + '\n' +
  '  ' + ansis.yellow('$ cc files/*.txt -s') + '\n' +
  '  ' + ansis.dim('# Convert files to simplified Chinese') + '\n\n' +
  '  ' + ansis.green('# 使用自定义字典转换（注意字典值必须用引号括起来）') + '\n' +
  '  ' + ansis.yellow('$ cc files/*.txt -T "龍龙 馬马" -v') + '\n' +
  '  ' + ansis.dim('# Convert with custom dictionary (note: dictionary value must be quoted)') + '\n\n' +
  '  ' + ansis.green('# 显示更改但不应用') + '\n' +
  '  ' + ansis.yellow('$ cc files/*.txt --dry-run -a') + '\n' +
  '  ' + ansis.dim('# Show changes without applying them') + '\n\n' +
  '  ' + ansis.green('# 使用输出文件夹并显示详细差异') + '\n' +
  '  ' + ansis.yellow('$ cc files/*.txt -o converted/ -v') + '\n' +
  '  ' + ansis.dim('# Use output folder and show verbose diff') + '\n\n' +
  '  ' + ansis.green('# 转换内联文本') + '\n' +
  '  ' + ansis.yellow('$ cc -i "简体中文测试" -t') + '\n' +
  '  ' + ansis.dim('# Convert inline text to traditional Chinese') + '\n\n' +
  '  ' + ansis.green('# 使用中文日志消息') + '\n' +
  '  ' + ansis.yellow('$ cc files/*.txt -s') + '\n' +
  '  ' + ansis.dim('# Use Chinese log messages (default)') + '\n\n' +
  ansis.red.bold('重要提示：使用 -S 或 -T 选项时，请确保字典值用引号括起来') + '\n' +
  ansis.red('Important: When using -S or -T options, ensure dictionary values are quoted') + '\n' +
  ansis.cyan('有关更多信息，请访问项目仓库。') + ansis.dim('\nFor more information, visit the project repository.')
)

// Translation functions
type TranslationKeys =
  'error-both-options' | 'no-files-found' | 'processing-files' |
  'convert' | 'convert-dryrun' | 'convert-same' |
  'convert-same-dryrun' | 'convert-inplace' | 'diff-for' |
  'converted-chars-in' | 'accumulated-converted' | 'no-changes-all-files' |
  'files-processed' | 'files-skipped' | 'total-time' | 'line-n' |
  'occurred-times' | 'position-at' | 'processing-summary' | 'skip-file' | 'skip-file-dryrun' |
  'unique-conversions' | 'total-conversions'

type Translations = {
  [K in TranslationKeys]: string
}

function getTranslatedMessage(key: TranslationKeys, options: Options, ...args: any[]): string {
  // If englishLog is explicitly set to true, use English
  // If chineseLog is explicitly set to true, use Chinese
  // Otherwise, use the default (Chinese)
  const isChinese = (options.chineseLog === true) ||
    (options.chineseLog !== false && !options.englishLog && shouldUseChineseByDefault()) ||
    (options.chineseLog === undefined && !options.englishLog && shouldUseChineseByDefault())

  const translations = {
    en: {
      'error-both-options': 'Error: Cannot specify both --to-simplify and --to-traditional',
      'no-files-found': 'No files found matching the provided patterns',
      'processing-files': 'Processing %d file(s)...',
      'convert': 'Convert: %s -> %s',
      'convert-dryrun': 'Convert: %s -> %s (DRY RUN)',
      'convert-same': 'Convert: %s -> %s',
      'convert-same-dryrun': 'Convert: %s (DRY RUN)',
      'convert-inplace': 'Convert: %s -> %s (in-place)',
      'diff-for': 'Diff for %s:',
      'converted-chars-in': 'Converted characters in %s:',
      'accumulated-converted': 'Accumulated converted characters across all files:',
      'no-changes-all-files': 'No character conversions were made across all files.',
      'files-processed': 'Files processed: %d',
      'files-skipped': 'Files skipped: %d',
      'total-time': 'Total time: %dms',
      'line-n': 'Line %d:',
      'occurred-times': 'occurred %d time%s',
      'position-at': 'at position %d',
      'processing-summary': 'Processing Summary',
      'skip-file': 'Skip: %s (no changes)',
      'skip-file-dryrun': 'Skip: %s (no changes, DRY RUN)',
      'unique-conversions': 'Unique conversions',
      'total-conversions': 'Total conversions'
    } satisfies Translations,
    zh: {
      'error-both-options': '错误：不能同时指定 --to-simplify 和 --to-traditional',
      'no-files-found': '找不到匹配所提供模式的文件',
      'processing-files': '正在处理 %d 个文件...',
      'convert': '转换文件: %s -> %s',
      'convert-dryrun': '转换文件: %s -> %s (试运行)',
      'convert-same': '转换文件: %s -> %s',
      'convert-same-dryrun': '转换文件: %s (试运行)',
      'convert-inplace': '转换文件: %s -> %s (就地)',
      'diff-for': '%s 的差异:',
      'converted-chars-in': '%s 中的转换字符:',
      'accumulated-converted': '所有文件中的累积转换字符:',
      'no-changes-all-files': '所有文件中均未进行字符转换。',
      'files-processed': '处理的文件: %d',
      'files-skipped': '跳过的文件: %d',
      'total-time': '总时间: %d毫秒',
      'line-n': '第 %d 行:',
      'occurred-times': '出现 %d 次',
      'position-at': '位置 %d',
      'processing-summary': '处理摘要',
      'skip-file': '跳过: %s (无更改)',
      'skip-file-dryrun': '跳过: %s (无更改, 试运行)',
      'unique-conversions': '唯一转换',
      'total-conversions': '总转换'
    } satisfies Translations
  }

  const lang = isChinese ? 'zh' : 'en'
  let message = translations[lang][key] || translations.en[key as TranslationKeys] || key

  // Simple printf-style replacement
  args.forEach(arg => {
    message = message.replace('%d', String(arg))
    message = message.replace('%s', String(arg))
  })

  return message
}

function shouldUseChineseByDefault(): boolean {
  // Default to Chinese
  return true
}

async function run(files: string[], options: Options) {
  const startTime = Date.now()

  // Validation for conflicting options
  if (options.toSimplify && options.toTraditional) {
    console.error(getTranslatedMessage('error-both-options', options))
    process.exit(1)
  }

  // If neither option is specified, default to simplify
  const toSimplified = !options.toTraditional && !options.toSimplify ? true : options.toSimplify

  // Handle inline text input
  if (options.input !== undefined) {
    let result: ConversionResult

    // Parse custom dictionaries if provided
    let customStMap: Map<string, string> | undefined
    let customTsMap: Map<string, string> | undefined

    if (options.simplifyToTraditional) {
      customStMap = parseDictionary(options.simplifyToTraditional)
    }

    if (options.traditionalToSimplify) {
      customTsMap = parseDictionary(options.traditionalToSimplify)
    }

    if (toSimplified) {
      result = enhancedToSimplified(options.input, customTsMap)
    } else {
      result = enhancedToTraditional(options.input, customStMap)
    }

    // Output the converted text
    console.log(result.converted)

    // Show diff if verbose
    if (options.verbose && result.changes.length > 0) {
      console.log(`${ansis.yellow(getTranslatedMessage('diff-for', options, 'inline text'))}`)
      const originalLines = result.original.split('\n')
      const convertedLines = result.converted.split('\n')

      // Compare line by line to only show lines that have changes
      for (let i = 0; i < Math.max(originalLines.length, convertedLines.length); i++) {
        const originalLine = i < originalLines.length ? originalLines[i] : ''
        const convertedLine = i < convertedLines.length ? convertedLines[i] : ''

        if (originalLine !== convertedLine) {
          // Show differences within the line using diffChars
          const lineDiff = diffChars(originalLine, convertedLine)
          let output = ''
          lineDiff.forEach((part) => {
            if (part.added) {
              // Added in the converted version (new characters) - now using #D5FF9E
              output += ansis.hex('#D5FF9E')(part.value)
            } else if (part.removed) {
              // Removed/replaced from the original (old characters) - now using #FA7C7A
              output += ansis.hex('#FA7C7A')(part.value)
            } else {
              // Unchanged characters
              output += part.value
            }
          })

          console.log(ansis.blue(getTranslatedMessage('line-n', options, i + 1)), output)
        }
      }
    }

    // List converted characters if requested
    if (options.list && result.changes.length > 0) {
      console.log(getTranslatedMessage('converted-chars-in', options, 'inline text'))
      result.changes.forEach(change => {
        console.log(`  "${change.from}" -> "${change.to}" ${getTranslatedMessage('position-at', options, change.position)}`)
      })
    }

    return
  }

  // Find files using glob patterns (existing file processing logic)
  const allFiles: string[] = []
  const filePatterns: Array<{ pattern: string, basePath: string }> = []

  // Store the base path for each pattern to properly preserve directory structure
  for (const filePattern of files) {
    // For glob patterns, try to determine the base path
    let basePath = filePattern
    // If it's a glob pattern, find the base directory part
    if (filePattern.includes('*') || filePattern.includes('{') || filePattern.includes('[')) {
      // Find the part before the first glob pattern
      const parts = filePattern.split(/[\/\\]/)
      const basePathParts: string[] = []
      for (const part of parts) {
        if (part.includes('*') || part.includes('{') || part.includes('[')) {
          break
        }
        basePathParts.push(part)
      }
      basePath = basePathParts.join(path.sep) || '.'
      // If basePath is just a drive letter or empty, use the current directory
      if (basePath.endsWith(':') || basePath === '.') {
        basePath = process.cwd()
      }
    } else {
      // For non-glob patterns, use the directory of the file
      basePath = path.dirname(filePattern)
    }

    filePatterns.push({ pattern: filePattern, basePath })
  }

  // Process each pattern with its base path
  for (const { pattern, basePath } of filePatterns) {
    const matchedFiles = await glob(pattern, { ignore: options.exclude })
    // Add base path information to each file
    for (const file of matchedFiles) {
      allFiles.push(file)
    }
  }

  // Remove duplicates
  const uniqueFiles = [...new Set(allFiles)]

  if (uniqueFiles.length === 0) {
    console.log(getTranslatedMessage('no-files-found', options))
    return
  }

  console.log(getTranslatedMessage('processing-files', options, uniqueFiles.length))

  // Statistics
  let processedFiles = 0
  let skippedFiles = 0

  // Word statistics
  const convertedWords = new Set<string>()
  let totalConverted = 0

  // Parse custom dictionaries if provided
  let customStMap: Map<string, string> | undefined
  let customTsMap: Map<string, string> | undefined

  if (options.simplifyToTraditional) {
    customStMap = parseDictionary(options.simplifyToTraditional)
  }

  if (options.traditionalToSimplify) {
    customTsMap = parseDictionary(options.traditionalToSimplify)
  }

  // Accumulate all changes if the accumulate-list option is enabled
  const allChanges: Array<{ file: string; from: string; to: string; position: number }> = []
  const corruptedCharsList: Array<{ char: string; file: string; position: number }> = []
  const unmappedCharsList: Array<{ char: string; file: string; position: number }> = []

  for (const filePath of uniqueFiles) {
    try {
      const originalContent = await fs.promises.readFile(filePath, 'utf-8')
      let result: ConversionResult

      if (toSimplified) {
        result = convertToSimplified(originalContent, customTsMap)
      } else {
        result = convertToTraditional(originalContent, customStMap)
      }

      let outputFilePath: string | undefined

      if (options.outputFolder) {
        // Preserve source tree structure in output folder
        // Calculate relative path from the base of the glob pattern
        let relativePath = path.relative(process.cwd(), filePath)

        // Try to find which pattern this file matched and use its base path
        for (const { pattern, basePath } of filePatterns) {
          // Check if this file matches the pattern
          try {
            const matchedFiles = await glob(pattern, { ignore: options.exclude })
            if (matchedFiles.includes(filePath)) {
              // Calculate relative path from the pattern's base path
              relativePath = path.relative(basePath, filePath)
              break
            }
          } catch (e) {
            // If glob fails, fall back to the default
          }
        }

        outputFilePath = path.join(options.outputFolder, relativePath)
      } else if (options.inplace) {
        outputFilePath = filePath // Same file when inplace
      }

      // Only show conversion message if there are actual changes
      if (result.changes.length > 0) {
        processedFiles++
        // Add unique converted characters to set
        for (const change of result.changes) {
          convertedWords.add(change.from + '->' + change.to)
          totalConverted++
        }

        // Show the conversion path only when there are changes
        if (options.dryRun) {
          if (outputFilePath) {
            console.log(ansis.yellow(getTranslatedMessage('convert-dryrun', options, filePath, outputFilePath)))
          } else {
            console.log(ansis.yellow(getTranslatedMessage('convert-same-dryrun', options, filePath)))
          }
        } else {
          if (options.inplace) {
            // Write directly back to the file
            await fs.promises.writeFile(filePath, result.converted, 'utf-8')
            console.log(ansis.yellow(getTranslatedMessage('convert-inplace', options, filePath, filePath)))
          } else if (options.outputFolder) {
            // Write to output folder, preserving directory structure
            // Create directory structure if it doesn't exist
            const outputDir = path.dirname(outputFilePath!)
            await fs.promises.mkdir(outputDir, { recursive: true })

            await fs.promises.writeFile(outputFilePath!, result.converted, 'utf-8')
            console.log(ansis.yellow(getTranslatedMessage('convert', options, filePath, outputFilePath!)))
          } else {
            // Write back to the same file
            await fs.promises.writeFile(filePath, result.converted, 'utf-8')
            console.log(ansis.yellow(getTranslatedMessage('convert-same', options, filePath, filePath)))
          }
        }
      } else {
        skippedFiles++

        // // If no changes and verbose is off, don't show conversion message
        // if (options.verbose) {
        //   // Still show file processing in verbose mode even if no changes
        //   if (options.dryRun) {
        //     if (outputFilePath) {
        //       console.log(ansis.yellow(getTranslatedMessage('convert-dryrun', options, filePath, outputFilePath)))
        //     } else {
        //       console.log(ansis.yellow(getTranslatedMessage('skip-file-dryrun', options, filePath)))
        //     }
        //   } else {
        //     console.log(getTranslatedMessage('skip-file', options, filePath))
        //   }
        // }
      }

      // Show diff if verbose
      if (options.verbose) {
        // Only display diff if there are actual changes
        if (result.changes.length > 0) {
          // Show the file path once at the beginning of the diff
          console.log(`${ansis.yellow(getTranslatedMessage('diff-for', options, filePath))}`)
          const originalLines = result.original.split('\n')
          const convertedLines = result.converted.split('\n')

          // Compare line by line to only show lines that have changes
          for (let i = 0; i < Math.max(originalLines.length, convertedLines.length); i++) {
            const originalLine = i < originalLines.length ? originalLines[i] : ''
            const convertedLine = i < convertedLines.length ? convertedLines[i] : ''

            if (originalLine !== convertedLine) {
              // Show differences within the line using diffChars
              const lineDiff = diffChars(originalLine, convertedLine)
              let output = ''
              lineDiff.forEach((part) => {
                if (part.added) {
                  // Added in the converted version (new characters) - now using #D5FF9E
                  output += ansis.hex('#D5FF9E')(part.value)
                } else if (part.removed) {
                  // Removed/replaced from the original (old characters) - now using #FA7C7A
                  output += ansis.hex('#FA7C7A')(part.value)
                } else {
                  // Unchanged characters
                  output += part.value
                }
              })

              console.log(ansis.blue(getTranslatedMessage('line-n', options, i + 1)), output) // Remove the extra newline after each changed line
            }
          }
        }
        // If no changes and verbose is on, we don't display anything
      }

      // Collect changes for accumulated list if requested
      if (options.accumulateList) {
        for (const change of result.changes) {
          allChanges.push({
            file: filePath,
            from: change.from,
            to: change.to,
            position: change.position
          })
        }

        // Collect corrupted characters if any
        if (result.corruptedChars && result.corruptedChars.length > 0) {
          for (const corrupted of result.corruptedChars) {
            corruptedCharsList.push({
              char: corrupted.char,
              file: filePath,
              position: corrupted.position
            })
          }
        }

        // Collect unmapped characters if any
        if (result.unmappedChars && result.unmappedChars.length > 0) {
          for (const unmapped of result.unmappedChars) {
            unmappedCharsList.push({
              char: unmapped.char,
              file: filePath,
              position: unmapped.position
            })
          }
        }
      }
      // Old -l behavior still works as before
      else if (options.list) {
        if (result.changes.length > 0) {
          console.log(getTranslatedMessage('converted-chars-in', options, filePath))
          result.changes.forEach(change => {
            // Color both original and converted characters in red as requested
            console.log(`  ${ansis.red(`"${change.from}"`)} -> ${ansis.red(`"${change.to}"`)} ${getTranslatedMessage('position-at', options, change.position)}`)
          })
        }

        // Display corrupted characters if any
        if (result.corruptedChars && result.corruptedChars.length > 0) {
          console.log(`${ansis.red('Corrupted characters in')} ${filePath}:`)
          result.corruptedChars.forEach(corrupted => {
            console.log(`  ${ansis.red(`"${corrupted.char}"`)} ${getTranslatedMessage('position-at', options, corrupted.position)}`)
          })
        }

        // Display unmapped characters if any
        if (result.unmappedChars && result.unmappedChars.length > 0) {
          console.log(`${ansis.red('Unmapped characters in')} ${filePath}:`)
          result.unmappedChars.forEach(unmapped => {
            console.log(`  ${ansis.red(`"${unmapped.char}"`)} ${getTranslatedMessage('position-at', options, unmapped.position)}`)
          })
        }

        // If no changes and list is on, we don't display anything
      }

    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
    }
  }

  // Display accumulated list at the end if requested
  if (options.accumulateList) {
    if (allChanges.length > 0) {
      console.log(`
${getTranslatedMessage('accumulated-converted', options)}`)
      const groupedChanges = groupChangesByCharacter(allChanges)
      for (const [key, changes] of groupedChanges.entries()) {
        const example = changes[0]
        const countText = changes.length > 1 ? 's' : ''
        // Color both original and converted characters in red as requested
        console.log(`  ${ansis.red(`"${example.from}"`)} -> ${ansis.red(`"${example.to}"`)} (${getTranslatedMessage('occurred-times', options, changes.length, countText)})`)
      }
    }

    // Display corrupted characters if any
    if (corruptedCharsList.length > 0) {
      console.log(`
${ansis.red('Corrupted characters found:')}`)
      const groupedCorrupted = new Map<string, Array<{ char: string; file: string; position: number }>>()

      // Group by character
      for (const corrupted of corruptedCharsList) {
        if (!groupedCorrupted.has(corrupted.char)) {
          groupedCorrupted.set(corrupted.char, [])
        }
        groupedCorrupted.get(corrupted.char)!.push(corrupted)
      }

      // Display grouped corrupted characters
      for (const [char, items] of groupedCorrupted.entries()) {
        const countText = items.length > 1 ? 's' : ''
        console.log(`  ${ansis.red(`"${char}"`)} (${getTranslatedMessage('occurred-times', options, items.length, countText)})`)
      }
    }

    // Display unmapped characters if any
    if (unmappedCharsList.length > 0) {
      console.log(`
${ansis.red('Unmapped characters found:')}`)
      const groupedUnmapped = new Map<string, Array<{ char: string; file: string; position: number }>>()

      // Group by character
      for (const unmapped of unmappedCharsList) {
        if (!groupedUnmapped.has(unmapped.char)) {
          groupedUnmapped.set(unmapped.char, [])
        }
        groupedUnmapped.get(unmapped.char)!.push(unmapped)
      }

      // Display grouped unmapped characters
      for (const [char, items] of groupedUnmapped.entries()) {
        const countText = items.length > 1 ? 's' : ''
        console.log(`  ${ansis.red(`"${char}"`)} (${getTranslatedMessage('occurred-times', options, items.length, countText)})`)
      }
    }

    if (allChanges.length === 0 && corruptedCharsList.length === 0 && unmappedCharsList.length === 0) {
      console.log(`
${getTranslatedMessage('no-changes-all-files', options)}`)
    }
  }

  // Display final statistics
  const endTime = Date.now()
  const totalTime = endTime - startTime

  console.log('\n' + ansis.bold(ansis.underline(getTranslatedMessage('processing-summary', options))))
  console.log(ansis.green('✅ ') + getTranslatedMessage('files-processed', options, processedFiles).replace(/(\d+)/g, ansis.cyan('$1')))
  console.log(ansis.yellow('⏭️  ') + getTranslatedMessage('files-skipped', options, skippedFiles).replace(/(\d+)/g, ansis.cyan('$1')))
  console.log(ansis.magenta('🔤 ') + ansis.cyan(getTranslatedMessage('unique-conversions', options)) + ': ' + ansis.cyan(String(convertedWords.size)))
  console.log(ansis.blue('🔄 ') + ansis.cyan(getTranslatedMessage('total-conversions', options)) + ': ' + ansis.cyan(String(totalConverted)))
  console.log(ansis.red('⏱️  ') + getTranslatedMessage('total-time', options, totalTime).replace(/(\d+)/g, ansis.cyan('$1')))
}

// Parse the dictionary string into a Map
function parseDictionary(dictString: string): Map<string, string> {
  const map = new Map<string, string>()
  // Split by spaces to get pairs like "长长", "龍龙", etc.
  const pairs = dictString.trim().split(/\s+/)

  for (const pair of pairs) {
    if (pair.length === 2) {
      // First character is the source, second is the target
      map.set(pair[0], pair[1])
    } else if (pair.length >= 2) {
      // For multi-character pairs, use first character as source and second as target
      map.set(pair[0], pair[1])
    }
  }

  return map
}

// Apply custom dictionary to the text
function applyCustomDictionary(text: string, customDict: Map<string, string>): string {
  let result = text

  for (const [from, to] of customDict.entries()) {
    result = result.split(from).join(to)
  }

  return result
}

// Helper function to detect corrupted characters in text
function detectCorruptedCharacters(original: string, converted: string): Array<{ char: string; position: number }> {
  const corruptedChars: Array<{ char: string; position: number }> = []

  // Process each character properly handling surrogate pairs
  let originalIndex = 0
  let convertedIndex = 0

  while (originalIndex < original.length) {
    // Get the next character from original text (handling surrogate pairs)
    let originalChar = original[originalIndex]
    if (originalIndex < original.length - 1 && original.charCodeAt(originalIndex) >= 0xD800 && original.charCodeAt(originalIndex) <= 0xDBFF) {
      const nextChar = original[originalIndex + 1]
      if (nextChar.charCodeAt(0) >= 0xDC00 && nextChar.charCodeAt(0) <= 0xDFFF) {
        originalChar = originalChar + nextChar
      }
    }

    // Get the next character from converted text (handling surrogate pairs)
    let convertedChar = converted[convertedIndex]
    if (convertedIndex < converted.length - 1 && converted.charCodeAt(convertedIndex) >= 0xD800 && converted.charCodeAt(convertedIndex) <= 0xDBFF) {
      const nextChar = converted[convertedIndex + 1]
      if (nextChar.charCodeAt(0) >= 0xDC00 && nextChar.charCodeAt(0) <= 0xDFFF) {
        convertedChar = convertedChar + nextChar
      }
    }

    // Check if the converted character appears to be corrupted
    if (convertedChar.charCodeAt(0) === 55409 || convertedChar.charCodeAt(0) === 55405 || convertedChar === '\uFFFD') {
      corruptedChars.push({ char: originalChar, position: originalIndex })
    }

    // Move to next character
    originalIndex += originalChar.length
    convertedIndex += convertedChar.length
  }

  return corruptedChars
}

// Helper function to group changes by the character conversion
function groupChangesByCharacter(changes: Array<{ file: string; from: string; to: string; position: number }>): Map<string, Array<{ file: string; from: string; to: string; position: number }>> {
  const grouped = new Map<string, Array<{ file: string; from: string; to: string; position: number }>>()

  for (const change of changes) {
    const key = `${change.from}->${change.to}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(change)
  }

  return grouped
}

function convertToSimplified(text: string, customDict?: Map<string, string>): ConversionResult {
  const original = text

  // Apply custom dictionary first if provided
  let processedText = text
  if (customDict) {
    processedText = applyCustomDictionary(text, customDict)
  }

  // Apply standard conversion using core API with custom dictionary support
  const result = converter(processedText, ts, traditionalPhrasesMap)
  const converted = result.converted
  const changes = getConversionChanges(original, converted, result.corruptedChars, result.unmappedChars)
  const corruptedChars = result.corruptedChars

  // Filter unmapped characters to only show those that would actually be converted
  // (characters that exist in the Traditional->Simplified mapping)
  const unmappedChars = result.unmappedChars?.filter(unmapped => {
    // Only show characters that are in the Traditional script and would be attempted for conversion
    return ts.has(unmapped.char)
  })

  return { original, converted, changes, corruptedChars, unmappedChars }
}

function convertToTraditional(text: string, customDict?: Map<string, string>): ConversionResult {
  const original = text

  // Apply custom dictionary first if provided
  let processedText = text
  if (customDict) {
    processedText = applyCustomDictionary(text, customDict)
  }

  // Apply standard conversion using core API with custom dictionary support
  const result = converter(processedText, st, simplifiedPhrasesMap)
  const converted = result.converted
  const changes = getConversionChanges(original, converted, result.corruptedChars, result.unmappedChars)
  const corruptedChars = result.corruptedChars

  // Filter unmapped characters to only show those that would actually be converted
  // (characters that exist in the Simplified->Traditional mapping)
  const unmappedChars = result.unmappedChars?.filter(unmapped => {
    // Only show characters that are in the Simplified script and would be attempted for conversion
    return st.has(unmapped.char)
  })

  return { original, converted, changes, corruptedChars, unmappedChars }
}

// Enhanced conversion functions for inline text that better preserve non-Chinese characters
function enhancedToSimplified(text: string, customDict?: Map<string, string>): ConversionResult {
  return convertToSimplified(text, customDict)
}

function enhancedToTraditional(text: string, customDict?: Map<string, string>): ConversionResult {
  return convertToTraditional(text, customDict)
}

program.parse()