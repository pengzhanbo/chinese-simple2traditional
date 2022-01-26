
const swc = require("@swc/core");

/**
 * Wrap swc to rollup plugin to build typescript
 * @type {() => import('rollup').Plugin}
 */
const createPlugin = (options = {}) => {
    if (
        Object.prototype.hasOwnProperty.call(options, "sourceMap") &&
        !Object.prototype.hasOwnProperty.call(options, "sourceMaps")
    ) {
        options = Object.assign({}, options, {
            sourceMaps: options.sourceMap,
        });
        delete options.sourceMap;
    }

  return ({
    name: 'rollup-plugin-swc',
    async resolveId(id, importer) {
      if (id.endsWith('.ts')) {
        return id
      }
      const tsResult = await this.resolve(`${id}.ts`, importer, { skipSelf: true })
      console.log('ts result,  ', tsResult)
      if (tsResult) {
        return tsResult
      }
      const indexTsResult = await this.resolve(`${id}/index.ts`, importer, { skipSelf: true })
      console.log('index result,  ', indexTsResult)
      if (indexTsResult) {
        return indexTsResult
      }
    },
    async transform(code, id) {
      if (!id.endsWith('.ts') && !id.endsWith('.js')) {
        return
      }

      const filename = id;

      const programmaticOptions = Object.assign({}, options, {
        filename,

        // Set the default sourcemap behavior based on Webpack's mapping flag,
        // but allow users to override if they want.
        sourceMaps: options.sourceMaps,

        // Ensure that Webpack will get a full absolute path in the sourcemap
        // so that it can properly map the module back to its internal cached
        // modules.
        sourceFileName: filename,
    });

    const sync = programmaticOptions.sync;

    // Remove loader related options
    delete programmaticOptions.sync;
    delete programmaticOptions.parseMap;
    delete programmaticOptions.customize;
    delete programmaticOptions.cacheDirectory;
    delete programmaticOptions.cacheIdentifier;
    delete programmaticOptions.cacheCompression;
    delete programmaticOptions.metadataSubscribers;

    // auto detect development mode
    // if (this.mode && programmaticOptions.jsc && programmaticOptions.jsc.transform 
    //     && programmaticOptions.jsc.transform.react && 
    //     !Object.prototype.hasOwnProperty.call(programmaticOptions.jsc.transform.react, "development")) {
    //         programmaticOptions.jsc.transform.react.development = this.mode === 'development'
    // }

    if (programmaticOptions.sourceMaps === "inline") {
        // Babel has this weird behavior where if you set "inline", we
        // inline the sourcemap, and set 'result.map = null'. This results
        // in bad behavior from Babel since the maps get put into the code,
        // which Webpack does not expect, and because the map we return to
        // Webpack is null, which is also bad. To avoid that, we override the
        // behavior here so "inline" just behaves like 'true'.
        programmaticOptions.sourceMaps = true;
    }

      try {
            if (sync) {
                const result = swc.transformSync(code, programmaticOptions)
                return {
                    code: result.code,
                    map: result.map
                }
            } else {
                const result = await swc.transform(code, programmaticOptions);
                return {
                    code: result.code,
                    map: result.map
                }
            }
      } catch (e) {
            console.error(e)
            return {
                code: '',
                map: undefined
            }
      }
    }
  })
}

export default createPlugin
