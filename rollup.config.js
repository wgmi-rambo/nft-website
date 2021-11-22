import pkg from "./package.json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
    input: "src/js/main.js",
    output: {
        file: "build/js/bundle.js",
        format: "iife",

        globals: {
            ethers: "ethers",
            jquery: "jQuery",
        },
    },
    plugins: [nodeResolve({ browser: true })],
    external: [...Object.keys(pkg.devDependencies), ...Object.keys(pkg.dependencies)],
};
