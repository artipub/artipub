import mri from "mri";
import { execa } from "execa";
import path from "node:path";
import { readFileSync } from "node:fs";
import colors from "picocolors";

import type { Options as ExecaOptions, ResultPromise } from "execa";

export const args = mri(process.argv.slice(2));

export function run<EO extends ExecaOptions>(
  bin: string,
  args: string[],
  opts?: EO
): ResultPromise<EO & (keyof EO extends "stdio" ? any : { stdio: "inherit" })> {
  return execa(bin, args, { stdio: "inherit", ...opts }) as any;
}

export const runIfNotDry = run;

export function getPackageInfo(pkgName: string, getPkgDir = (pkg) => `packages/${pkg}`) {
  const pkgDir = path.resolve(getPkgDir(pkgName));
  const pkgPath = path.resolve(pkgDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (pkg.private) {
    throw new Error(`Package ${pkgName} is private`);
  }
  return { pkg, pkgDir, pkgPath };
}

export function step(msg: string): void {
  return console.log(colors.cyan(msg));
}
