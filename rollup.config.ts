import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import alias from "@rollup/plugin-alias";
import { defineConfig } from "rollup";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "./package.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const external = Object.keys(pkg.peerDependencies);

export default defineConfig([
	{
		input: "src/index.ts",
		output: [
			{
				file: "dist/index.js",
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
			resolve({ browser: false }),
			commonjs(),
			typescript({
				tsconfig: "./tsconfig.json",
				sourceMap: true,
			}),
		],
		external,
	},
	{
		input: "src/index.ts",
		output: [
			{
				file: "dist/index.d.ts",
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
		],
		external,
	}
]);
