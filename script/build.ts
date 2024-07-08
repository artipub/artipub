import { rollup } from "rollup";
import { loadConfigFile } from "rollup/loadConfigFile";
import path, { format } from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
	const { options } = await loadConfigFile(path.resolve(__dirname, "../rollup.config.ts"), {});

	for (const option of options) {
		const build = await rollup(option);
		await Promise.all(option.output.map(build.write));
	}
}

build();

