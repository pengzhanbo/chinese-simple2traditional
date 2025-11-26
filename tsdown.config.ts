import { defineConfig } from 'tsdown'

export default defineConfig({
  format: 'esm',
  entry: ['src/index.ts', 'src/enhance.ts'],
  sourcemap: false,
  dts: true,
  clean: true,
  minify: true,
})
