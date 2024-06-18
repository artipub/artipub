import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import alias from "@rollup/plugin-alias";
import { defineConfig } from "rollup";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("dirname=", __dirname);
console.log("src=", path.resolve(__dirname, "./src"));


export default defineConfig([
	{
		input: "src/index.ts",
		output: [
			{
				file: "dist/index.mjs",
				format: "esm",
				sourcemap: true,
			},
			{
				file: "dist/index.cjs",
				format: "cjs",
				sourcemap: true,
			},
		],
		plugins: [
			alias({
				entries: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
			}),
			commonjs(),
			resolve(),
			typescript({
				tsconfig: "./tsconfig.json",
				sourceMap: true,
			}),
		],
	},
	{
		input: "src/types/index.ts",
		output: [
			{
				file: "dist/index.d.mts",
				format: "esm",
				sourcemap: true,
			},
			{
				file: "dist/index.d.cts",
				format: "cjs",
				sourcemap: true,
			},
		],
		plugins: [
			dts()
		]
	}
]);
