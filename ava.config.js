export default {
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
  files: ['test/**/*.test.ts'],
  verbose: true,
  // typescript: {
  //   extensions: ['ts', 'tsx'],
  //   rewritePaths: {
  //     'src/': 'dist/',
  //   },
  //   compile: false,
  // },
}
