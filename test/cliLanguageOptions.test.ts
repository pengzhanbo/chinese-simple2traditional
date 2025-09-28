import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

const cliPath = path.resolve(__dirname, '../dist/cli/index.js')
const testFilePath = path.resolve(__dirname, '../test/language-test.txt')

describe('CLI Language Options', () => {
    // Create a test file before running tests
    beforeAll(() => {
        fs.writeFileSync(testFilePath, '测试文件内容', 'utf-8')
    })

    // Clean up test file after tests
    afterAll(() => {
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath)
        }
    })

    it('should support -z shorthand for Chinese log messages', () => {
        const output = execSync(`node ${cliPath} ${testFilePath} -z`, { encoding: 'utf-8' })
        // Check that Chinese characters are in the output
        expect(output).toContain('正在处理')
        expect(output).toContain('处理摘要')
    })

    it('should support -E shorthand for English log messages', () => {
        const output = execSync(`node ${cliPath} ${testFilePath} -E`, { encoding: 'utf-8' })
        // Check that English words are in the output
        expect(output).toContain('Processing')
        expect(output).toContain('Summary')
    })

    it('should show bilingual option descriptions in help', () => {
        const output = execSync(`node ${cliPath} --help`, { encoding: 'utf-8' })
        // Check that both English and Chinese descriptions are present
        expect(output).toContain('Use Chinese log messages (使用中文日志消息)')
        expect(output).toContain('Use English log messages (使用英文日志消息)')
    })
})