import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['cjs', 'esm', 'iife'],
  entry: ['src/index.ts'],
  globalName: 'chineseSimple2Traditional',
  sourcemap: false,
  dts: true,
  splitting: false,
  clean: true,
})
