import typescript from "@rollup/plugin-typescript"
export default{
    input: "./src/index.ts",
    output: [
        // 1. cjs -> commonjs
        // 2. esm -> 标准化
        {
            format: "cjs",
            file: "lib/guide-min-vue.cjs.js",
        },
        {
            format: "es",
            file:"lib/guide-min-vue.esm.js",
        }
    ],

    plugins:[typescript()]

}