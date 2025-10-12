import { describe, it, expect } from 'vitest'
import { toSimplified, toTraditional } from '../dist/index.js'
import { exec } from 'child_process'
import * as fs from 'fs/promises'
import * as path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Test the underlying conversion functions which are used by the CLI
describe('Chinese conversion functions', () => {
  it('should convert simplified to traditional', () => {
    const simplified = '简体'
    const traditional = toTraditional(simplified)
    expect(traditional).toBe('簡體')
  })

  it('should convert traditional to simplified', () => {
    const traditional = '繁體'
    const simplified = toSimplified(traditional)
    expect(simplified).toBe('繁体')
  })

  it('should handle mixed content', () => {
    const mixed = '国际 世界'
    const traditional = toTraditional(mixed)
    // The result should have traditional versions of Chinese characters
    expect(traditional).toContain('國際') // International should become traditional
    expect(traditional).toContain('世界') // World should remain the same or convert appropriately
  })

  it('should have no changes when text is already in target format', () => {
    const traditional = '簡體' // Already traditional
    const result = toTraditional(traditional)
    expect(result).toBe(traditional) // Should remain unchanged
  })
})

// Test CLI functionality with glob patterns
describe('CLI functionality', () => {
  it('should process files with glob patterns', async () => {
    // Create temporary test files with unique names to avoid conflicts
    const testDir = path.join(process.cwd(), 'test')
    const testFile1 = path.join(testDir, 'unique-cli-test1.txt')
    const testFile2 = path.join(testDir, 'unique-cli-test2.txt')

    await fs.writeFile(testFile1, '简体中文 test')
    await fs.writeFile(testFile2, '繁體中文 test')

    try {
      // Run the CLI with glob pattern to convert test files to traditional
      const result = await execAsync(`node dist/cli/index.js "${testDir}/unique-cli-*.txt" --to-traditional --dry-run --list`, {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: 'test' }
      })

      // Verify that the command ran successfully
      expect(result.stdout).toContain('正在处理 2 个文件')
      // Should show both files in stats (even if one has no changes)
      expect(result.stdout).toContain('处理的文件:')
      expect(result.stdout).toContain('跳过的文件:')
      // At least one file should have changes
      expect(result.stdout).toContain('转换字符')

    } finally {
      // Clean up test files
      await fs.unlink(testFile1).catch(() => { })
      await fs.unlink(testFile2).catch(() => { })
    }
  }, 10000) // Increase timeout to 10 seconds

  it('should respect exclusion patterns', async () => {
    // Create temporary test files with unique names
    const testDir = path.join(process.cwd(), 'test')
    const testFile1 = path.join(testDir, 'cli-include-test.txt')
    const testFile2 = path.join(testDir, 'cli-exclude-test.txt')

    await fs.writeFile(testFile1, '简体中文 test')
    await fs.writeFile(testFile2, '繁體中文 test')

    try {
      // Run the CLI with glob pattern and exclusion
      const result = await execAsync(`node dist/cli/index.js "${testDir}/cli-*-test.txt" --to-simplify -x "**/*exclude*" --dry-run --list`, {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: 'test' }
      })

      // Verify that only the cli-include-test.txt was processed (not cli-exclude-test.txt)
      expect(result.stdout).toContain('正在处理 1 个文件')
      // The included file might not show in output if no changes, but should be reflected in stats
      expect(result.stdout).toContain('处理的文件:')
      expect(result.stdout).toContain('跳过的文件:')

    } finally {
      // Clean up test files
      await fs.unlink(testFile1).catch(() => { })
      await fs.unlink(testFile2).catch(() => { })
    }
  }, 10000) // Increase timeout to 10 seconds
})