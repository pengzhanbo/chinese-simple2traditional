import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import eslint from '@rollup/plugin-eslint';
import { terser } from 'rollup-plugin-terser';

const entry = 'src/index.ts';

const dist = (name) => `dist/chinese-simple2traditional${name}.js`;

const banner = '';

const plugins = [
    nodeResolve({
        extensions: ['.js', '.ts'],
    }),
    commonjs(),
    eslint(),
    babel({
        exclude: 'node_modules',
        extensions: ['.js', '.ts'],
        babelHelpers: 'bundled',
    }),
];

export default [
    {
        input: entry,
        output: [
            {
                file: dist(''),
                format: 'umd',
                name: 'chineseSimple2Traditional',
                // exports: 'default',
                banner,
            },
            {
                file: dist('.common'),
                format: 'cjs',
                // exports: 'default',
                banner,
            },
            {
                file: dist('.esm'),
                format: 'es',
                banner,
            },
        ],
        plugins,
    },
    {
        input: entry,
        output: [
            {
                file: dist('.min'),
                format: 'umd',
                name: 'chineseSimple2Traditional',
                // exports: 'default',
                banner,
            },
            {
                file: dist('.common.min'),
                format: 'cjs',
                // exports: 'default',
                banner,
            },
            {
                file: dist('.esm.min'),
                format: 'es',
                banner,
            },
        ],
        plugins: [
            ...plugins,
            terser({
                compress: {
                    arrows: false,
                    collapse_vars: false,
                    comparisons: false,
                    hoist_funs: false,
                    hoist_props: false,
                    hoist_vars: false,
                    inline: false,
                    loops: false,
                    negate_iife: false,
                    properties: false,
                    reduce_funcs: false,
                    reduce_vars: false,
                    switches: false,
                    toplevel: false,
                    typeofs: false,
                    booleans: true,
                    if_return: true,
                    sequences: true,
                    unused: true,
                    conditionals: true,
                    dead_code: true,
                    evaluate: true,
                },
                mangle: {
                    safari10: true,
                },
                output: {
                    comments: false,
                },
            }),
        ],
    },
];
