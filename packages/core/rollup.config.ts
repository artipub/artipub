import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import alias from "@rollup/plugin-alias";
import { defineConfig } from "rollup";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "./package.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const external = Object.keys(pkg?.peerDependencies || {});

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
      resolve({ browser: false, extensions: [".ts", ".js"], exportConditions: ["node"] }),
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
    ],
    plugins: [
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
      }),
      resolve({ browser: false, extensions: [".ts", ".js"] }),
      dts(),
    ],
    external,
  },
]);
