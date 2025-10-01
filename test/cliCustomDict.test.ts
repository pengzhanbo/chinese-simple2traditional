import { describe, it, expect } from 'vitest'
import { exec } from 'child_process'
import * as fs from 'fs/promises'
import * as path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

describe('CLI custom dictionary functionality', () => {
    it('should handle -T (simplify to traditional) custom dictionary', async () => {
        // Create a temporary test file
        const testDir = path.join(process.cwd(), 'test')
        const testFile = path.join(testDir, 'custom-t2s-test.txt')

        // Write test content with characters that would normally not be converted
        // but should be converted with custom dictionary
        await fs.writeFile(testFile, '龙马测试')

        try {
            // Run CLI with -T option to convert simplify to traditional with custom dictionary
            // This should convert 龙->龍 and 马->馬
            // Note: -T implies -t (simplify to traditional)
            const result = await execAsync(
                `node dist/cli/index.js "${testFile}" -T "龙龍 马馬" --dry-run --list`,
                {
                    cwd: process.cwd(),
                    env: { ...process.env, NODE_ENV: 'test' }
                }
            )

            // Should show that files are being processed (in Chinese by default)
            expect(result.stdout).toContain('正在处理 1 个文件')

        } catch (error) {
            // Log the error for debugging
            console.error('Test error:', error)
            throw error
        } finally {
            // Clean up test file
            await fs.unlink(testFile).catch(() => { })
        }
    }, 15000)

    it('should handle -S (traditional to simplify) custom dictionary', async () => {
        // Create a temporary test file
        const testDir = path.join(process.cwd(), 'test')
        const testFile = path.join(testDir, 'custom-s2t-test.txt')

        // Write test content with characters that would normally not be converted
        // but should be converted with custom dictionary
        await fs.writeFile(testFile, '龍马测试')

        try {
            // Run CLI with -S option to convert traditional to simplify with custom dictionary
            // This should convert 龍->龙 and 马->马
            // Note: -S implies -s (traditional to simplify)
            const result = await execAsync(
                `node dist/cli/index.js "${testFile}" -S "龍龙 馬马" --dry-run --list`,
                {
                    cwd: process.cwd(),
                    env: { ...process.env, NODE_ENV: 'test' }
                }
            )

            // Should show that files are being processed (in Chinese by default)
            expect(result.stdout).toContain('正在处理 1 个文件')

        } catch (error) {
            // Log the error for debugging
            console.error('Test error:', error)
            throw error
        } finally {
            // Clean up test file
            await fs.unlink(testFile).catch(() => { })
        }
    }, 15000)

    it('should handle inline text with -T custom dictionary', async () => {
        try {
            // Test inline text conversion with -T option
            const result = await execAsync(
                `node dist/cli/index.js -i "龙马测试" -T "龙龍 马馬"`,
                {
                    cwd: process.cwd(),
                    env: { ...process.env, NODE_ENV: 'test' }
                }
            )

            // Should output the converted text
            expect(result.stdout).toContain('龍馬')

        } catch (error) {
            // Log the error for debugging
            console.error('Test error:', error)
            throw error
        }
    }, 15000)

    it('should handle inline text with -S custom dictionary', async () => {
        try {
            // Test inline text conversion with -S option
            const result = await execAsync(
                `node dist/cli/index.js -i "龍马测试" -S "龍龙 馬马"`,
                {
                    cwd: process.cwd(),
                    env: { ...process.env, NODE_ENV: 'test' }
                }
            )

            // Should output the converted text
            expect(result.stdout).toContain('龙马')

        } catch (error) {
            // Log the error for debugging
            console.error('Test error:', error)
            throw error
        }
    }, 15000)

    // New test to verify that only supplied dictionary characters are converted
    it('should only convert characters in custom dictionary', async () => {
        try {
            // Test with text that contains characters both in and not in the dictionary
            // Dictionary only has 龍->龙 and 馬->马, but text also contains "测试" which should remain unchanged
            const result = await execAsync(
                `node dist/cli/index.js -i "龍马测试" -S "龍龙 馬马"`,
                {
                    cwd: process.cwd(),
                    env: { ...process.env, NODE_ENV: 'test' }
                }
            )

            // Should convert 龍->龙 and 馬->马 but leave 测试 unchanged
            // The expected result should be "龙马测试" (only the dictionary characters converted)
            expect(result.stdout).toBe('龙马测试\n')

        } catch (error) {
            // Log the error for debugging
            console.error('Test error:', error)
            throw error
        }
    }, 15000)
})