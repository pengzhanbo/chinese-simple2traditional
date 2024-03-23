import { defineConfig } from 'tsup'

export default defineConfig({
  format: 'esm',
  entry: ['src/index.ts', 'src/enhance.ts'],
  sourcemap: false,
  dts: true,
  splitting: true,
  clean: true,
  minify: 'terser',
})
