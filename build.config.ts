import { defineBuildConfig } from 'unbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineBuildConfig({
	entries: ["./src/index"],
	clean: true,
	declaration: true,
	rollup: {
		emitCJS: true
	},
	failOnWarn: false,
	alias: {
		"@": path.resolve(__dirname, "src")
	},
	hooks: {
		"build:done": () => {
			const src = path.resolve(__dirname, 'package.json');
			const dest = path.resolve(__dirname, 'dist', 'package.json');
			fs.copyFileSync(src, dest);
			console.log('package.json has been copied to dist directory.');
		}
	}
});
