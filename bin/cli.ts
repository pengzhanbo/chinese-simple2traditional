#!/usr/bin/env node

import { Command } from 'commander'
import { glob } from 'glob'
import { diffChars } from 'diff'
import ansis from 'ansis'
import * as fs from 'fs'
import * as path from 'path'
import { toSimplified, toTraditional } from '../dist/index'
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
}

interface ConversionResult {
  original: string
  converted: string
  changes: Array<{ from: string; to: string; position: number }>
}

// Create a more accurate way to track character conversions
function getConversionChanges(original: string, converted: string): Array<{ from: string; to: string; position: number }> {
  const changes: Array<{ from: string; to: string; position: number }> = []

  // Since we're doing Chinese character conversion, we need to identify which characters changed
  // This is a simple comparison, but might not be 100% accurate for all conversions
  const minLength = Math.min(original.length, converted.length)

  for (let i = 0; i < minLength; i++) {
    if (original[i] !== converted[i]) {
      changes.push({
        from: original[i],
        to: converted[i],
        position: i
      })
    }
  }

  // Handle different lengths (though text conversion shouldn't change length significantly)
  if (original.length > converted.length) {
    for (let i = minLength; i < original.length; i++) {
      changes.push({
        from: original[i],
        to: '',
        position: i
      })
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
  .argument('<files...>', ansis.cyan.dim('Files to convert using glob patterns') + '\n' + ansis.cyan('使用通配符模式转换文件'))
  .option('-s, --to-simplify', ansis.cyan.dim('Convert to simplified Chinese (default)') + '\n' + ansis.cyan('转换为简体中文（默认）'), false)
  .option('-t, --to-traditional', ansis.cyan.dim('Convert to traditional Chinese') + '\n' + ansis.cyan('转换为繁体中文'), false)
  .option('-o, --output-folder <folder>', ansis.cyan.dim('Output folder for converted files') + '\n' + ansis.cyan('转换文件的输出文件夹'), undefined)
  .option('-p, --inplace', ansis.cyan.dim('Modify files in-place, ignore -o') + '\n' + ansis.cyan('就地修改文件，忽略 -o'), false)
  .option('-v, --verbose', ansis.cyan.dim('Show a diff of the changes') + '\n' + ansis.cyan('显示更改的差异'), false)
  .option('-e, --exclude <patterns...>', ansis.cyan.dim('Glob patterns for files to exclude') + '\n' + ansis.cyan('要排除的文件的通配符模式'), [])
  .option('-d, --dry-run', ansis.cyan.dim('Log changes without committing them') + '\n' + ansis.cyan('记录更改但不提交'), false)
  .option('-l, --list', ansis.cyan.dim('List converted characters per file') + '\n' + ansis.cyan('列出每个文件的转换字符'), false)
  .option('-a, --accumulate-list', ansis.cyan.dim('Accumulate and list all converted characters at the end') + '\n' + ansis.cyan('累积并在最后列出所有转换的字符'), false)
  .option('-S, --simplify-to-traditional <dictionary>', ansis.cyan.dim('Custom simplify to traditional dictionary (format: "簡简 繁繁")') + '\n' + ansis.cyan('自定义简体到繁体字典（格式："簡简 繁繁")'), undefined)
  .option('-T, --traditional-to-simplify <dictionary>', ansis.cyan.dim('Custom traditional to simplify dictionary (format: "简簡 繁繁")') + '\n' + ansis.cyan('自定义繁体到简体字典（格式："简簡 繁繁")'), undefined)
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
  '  ' + ansis.green('# 使用自定义字典转换') + '\n' +
  '  ' + ansis.yellow('$ cc files/*.txt -T \"龍龙 馬马\" -v') + '\n' +
  '  ' + ansis.dim('# Convert with custom dictionary') + '\n\n' +
  '  ' + ansis.green('# 显示更改但不应用') + '\n' +
  '  ' + ansis.yellow('$ cc files/*.txt --dry-run -al') + '\n' +
  '  ' + ansis.dim('# Show changes without applying them') + '\n\n' +
  '  ' + ansis.green('# 使用输出文件夹并显示详细差异') + '\n' +
  '  ' + ansis.yellow('$ cc files/*.txt -o converted/ -v') + '\n' +
  '  ' + ansis.dim('# Use output folder and show verbose diff') + '\n\n' +
  '  ' + ansis.green('# 使用中文日志消息') + '\n' +
  '  ' + ansis.yellow('$ cc files/*.txt -s') + '\n' +
  '  ' + ansis.dim('# Use Chinese log messages (default)') + '\n\n' +
  ansis.cyan('有关更多信息，请访问项目仓库。') + ansis.dim('\nFor more information, visit the project repository.')
)

program.addHelpText('after', () => `
  ${ansis.bold(ansis.cyan('示例 (Examples):'))}
    ${ansis.green('# 转换文件为简体中文')}
    ${ansis.yellow('$ cc files/*.txt -s')}
    ${ansis.dim('# Convert files to simplified Chinese')}
    
    ${ansis.green('# 使用自定义字典转换')}
    ${ansis.yellow('$ cc files/*.txt -T "龍龙 馬马" -v')}
    ${ansis.dim('# Convert with custom dictionary')}
    
    ${ansis.green('# 显示更改但不应用')}
    ${ansis.yellow('$ cc files/*.txt --dry-run -al')}
    ${ansis.dim('# Show changes without applying them')}
    
    ${ansis.green('# 使用输出文件夹并显示详细差异')}
    ${ansis.yellow('$ cc files/*.txt -o converted/ -v')}
    ${ansis.dim('# Use output folder and show verbose diff')}
    
    ${ansis.green('# 使用中文日志消息')}
    ${ansis.yellow('$ cc files/*.txt -s')}
    ${ansis.dim('# Use Chinese log messages (default)')}
`)

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

  // Validation
  if (options.toSimplify && options.toTraditional) {
    console.error(getTranslatedMessage('error-both-options', options))
    process.exit(1)
  }

  // If neither option is specified, default to simplify
  const toSimplified = !options.toTraditional

  // Find files using glob patterns
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

  for (const filePath of uniqueFiles) {
    try {
      const originalContent = await fs.promises.readFile(filePath, 'utf-8')
      let result: ConversionResult

      if (toSimplified) {
        if (customTsMap) {
          result = convertToSimplifiedWithCustomDict(originalContent, customTsMap)
        } else {
          result = convertToSimplified(originalContent)
        }
      } else {
        if (customStMap) {
          result = convertToTraditionalWithCustomDict(originalContent, customStMap)
        } else {
          result = convertToTraditional(originalContent)
        }
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
            console.log(getTranslatedMessage('convert-inplace', options, filePath, filePath))
          } else if (options.outputFolder) {
            // Write to output folder, preserving directory structure
            // Create directory structure if it doesn't exist
            const outputDir = path.dirname(outputFilePath!)
            await fs.promises.mkdir(outputDir, { recursive: true })

            await fs.promises.writeFile(outputFilePath!, result.converted, 'utf-8')
            console.log(getTranslatedMessage('convert', options, filePath, outputFilePath!))
          } else {
            // Write back to the same file
            await fs.promises.writeFile(filePath, result.converted, 'utf-8')
            console.log(getTranslatedMessage('convert-same', options, filePath, filePath))
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
                  // Added in the converted version (new characters) - now using #FA7C7A
                  output += ansis.hex('#FA7C7A')(part.value)
                } else if (part.removed) {
                  // Removed/replaced from the original (old characters) - now using #D5FF9E
                  output += ansis.hex('#D5FF9E')(part.value)
                } else {
                  // Unchanged characters
                  output += part.value
                }
              })

              console.log(getTranslatedMessage('line-n', options, i + 1), output) // Remove the extra newline after each changed line
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
      }
      // Old -l behavior still works as before
      else if (options.list) {
        if (result.changes.length > 0) {
          console.log(getTranslatedMessage('converted-chars-in', options, filePath))
          result.changes.forEach(change => {
            console.log(`  "${change.from}" -> "${change.to}" ${getTranslatedMessage('position-at', options, change.position)}`)
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
        console.log(`  ${ansis.hex('#D5FF9E')(`"${example.from}"`)} -> ${ansis.hex('#FA7C7A')(`"${example.to}"`)} (${getTranslatedMessage('occurred-times', options, changes.length, countText)})`)
      }
    } else {
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

// Custom conversion functions that use the custom dictionary
function convertToSimplifiedWithCustomDict(text: string, customDict: Map<string, string>): ConversionResult {
  // Apply custom dictionary only - no fallback to standard conversion
  let result = ''
  const changes: Array<{ from: string; to: string; position: number }> = []

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (customDict.has(char)) {
      // Use custom dictionary mapping
      const replacement = customDict.get(char)!
      result += replacement
      changes.push({ from: char, to: replacement, position: i })
    } else {
      // For characters not in custom dictionary, keep original
      result += char
    }
  }

  return { original: text, converted: result, changes }
}

function convertToTraditionalWithCustomDict(text: string, customDict: Map<string, string>): ConversionResult {
  // Apply custom dictionary only - no fallback to standard conversion
  let result = ''
  const changes: Array<{ from: string; to: string; position: number }> = []

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (customDict.has(char)) {
      // Use custom dictionary mapping
      const replacement = customDict.get(char)!
      result += replacement
      changes.push({ from: char, to: replacement, position: i })
    } else {
      // For characters not in custom dictionary, keep original
      result += char
    }
  }

  return { original: text, converted: result, changes }
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

function convertToSimplified(text: string): ConversionResult {
  const original = text
  const converted = toSimplified(text)
  const changes = getConversionChanges(original, converted)

  return { original, converted, changes }
}

function convertToTraditional(text: string): ConversionResult {
  const original = text
  const converted = toTraditional(text)
  const changes = getConversionChanges(original, converted)

  return { original, converted, changes }
}

program.parse()