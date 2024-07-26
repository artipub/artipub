import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import alias from "@rollup/plugin-alias";
import { defineConfig } from "rollup";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "../core/package.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const external = Object.keys(pkg?.peerDependencies || {});

export default defineConfig([
  {
    input: "src/cli/index.ts",
    output: [
      {
        file: "dist/cli/index.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/cli/index.cjs",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "./cli/src") }],
      }),
      resolve({ browser: false, extensions: [".ts", ".js"] }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.cli.json",
        sourceMap: true,
      }),
    ],
    external,
  },
  {
    input: "src/cli/index.ts",
    output: [
      {
        file: "dist/cli/index.d.ts",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "./cli/src") }],
      }),
      resolve({ browser: false, extensions: [".ts", ".js"] }),
      dts(),
    ],
    external,
  },
]);
