import { rollup } from "rollup";
import { loadConfigFile } from "rollup/loadConfigFile";
import path, { format } from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
	const { options } = await loadConfigFile(path.resolve(__dirname, "../rollup.config.ts"), {});

	for (const option of options) {
		const build = await rollup(option);
		await Promise.all(option.output.map(build.write));

		const src = path.resolve(__dirname, '../package.json');
		const dest = path.resolve(__dirname, '../dist', 'package.json');
		await fs.copyFile(src, dest);
	}
}

build();

