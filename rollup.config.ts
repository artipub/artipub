import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import alias from "@rollup/plugin-alias";
import { defineConfig } from "rollup";

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
				entries: [{ find: "@", replacement: "./src" }],
			}),
			resolve(),
			commonjs(),
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
