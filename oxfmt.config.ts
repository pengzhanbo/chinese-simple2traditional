import config from '@pengzhanbo/oxc-config/oxfmt'
import { defineConfig } from 'oxfmt'

export default defineConfig({
  ...config,
  ignorePatterns: [...config.ignorePatterns!, '**/data'],
})
