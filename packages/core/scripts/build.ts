import { rollup } from "rollup";
import { loadConfigFile } from "rollup/loadConfigFile";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  const { options } = await loadConfigFile(path.resolve(__dirname, "../rollup.config.ts"), {});

  for (const option of options) {
    const build = await rollup(option);
    await Promise.all(option.output.map((outputOption) => build.write(outputOption)));
  }
}

build();
