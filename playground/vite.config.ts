import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      'chinese-simple2traditional/enhance': path.resolve(__dirname, '../src/enhance.ts'),
      'chinese-simple2traditional': path.resolve(__dirname, '../src/index.ts'),
      '@raise/han-convert/enhance': path.resolve(__dirname, '../src/enhance.ts'),
      '@raise/han-convert': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  build: {
    outDir: path.join(__dirname, 'dist'),
    minify: 'terser',
  },
})
