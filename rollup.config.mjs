import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import alias from "@rollup/plugin-alias";

const jsConfig = {
	input: "src/index.ts",
	output: [
		{
			file: "dist/index.esm.js",
			format: "esm",
			sourcemap: true,
		},
		{
			file: "dist/index.cjs.js",
			format: "cjs",
			sourcemap: true,
		},
	],
	plugins: [
		alias({
			entries: [{ find: "@", replacement: "./src" }],
		}),
		resolve(),
		commonjs(),
		typescript({
			tsconfig: "./tsconfig.json",
			sourceMap: true,
		}),
	],
};

const esDtsConfig = {
	input: "src/index.ts",
	output: [{ file: "dist/index.d.ts", format: "es" }],
	plugins: [dts()],
};

const cjsDtsConfig = {
	input: "src/index.ts",
	output: [{ file: "dist/index.cjs.d.ts", format: "cjs" }],
	plugins: [dts()],
};

export default [jsConfig, esDtsConfig, cjsDtsConfig];
