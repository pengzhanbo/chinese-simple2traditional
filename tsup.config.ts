import { defineConfig } from 'tsup'

export default defineConfig({
  format: 'esm',
  entry: {
    'index': 'src/index.ts',
    'enhance': 'src/enhance.ts',
    'bin/cli': 'bin/cli.ts'
  },
  sourcemap: false,
  dts: true,
  splitting: true,
  clean: true,
  minify: 'terser',
  outDir: 'dist',
  shims: true,
  skipNodeModulesBundle: true
})