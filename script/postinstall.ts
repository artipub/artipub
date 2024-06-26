import { execSync } from 'child_process';
import { existsSync } from 'fs';
import pkg from "../package.json";

const peerDependencies = pkg.peerDependencies || {};

function getPackageManager(): string {
	if (process.env.npm_config_user_agent?.includes('yarn')) {
		return 'yarn add';
	} else if (process.env.npm_config_user_agent?.includes('pnpm')) {
		return 'pnpm add';
	} else if (existsSync('yarn.lock')) {
		return 'yarn add';
	} else if (existsSync('pnpm-lock.yaml')) {
		return 'pnpm add';
	} else {
		return 'npm install';
	}
}

function installPeerDependencies() {
	const packageManager = getPackageManager();

	Object.keys(peerDependencies).forEach(dep => {
		const version = peerDependencies[dep];
		const command = `${packageManager} ${dep}@'${version}'`;
		console.log(`Executing: ${command}`);
		try {
			execSync(command, { stdio: 'inherit' });
		} catch (error) {
			console.error(`Failed to install ${dep}: ${error}`);
		}
	});
}

installPeerDependencies();
