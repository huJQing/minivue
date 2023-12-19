import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import progress from 'rollup-plugin-progress';
import html from "@rollup/plugin-html"
import vue from "rollup-plugin-vue";

export default {
    cache: true,
    input: "src/index.js",
    output: {
        dir: "dist",
        sourcemap: true,
        format: 'iife',
        name: 'Vue'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        resolve(),
        commonjs(),
        html(),
        postcss(),
        terser(),
        progress()
    ]
};
