import mri from "mri";
import semver from "semver";
import { getPackageInfo, run, runIfNotDry, step } from "./utils";

const args = mri(process.argv.slice(2));

async function publish({ defaultPackage, packageManager }) {
  const tag = args._[0];
  if (!tag) throw new Error("No tag specified");

  let pkgName = defaultPackage;
  let version;

  if (tag.includes("@")) [pkgName, version] = tag.split("@");
  else version = tag;

  if (version.startsWith("v")) version = version.slice(1);

  const { pkg, pkgDir } = getPackageInfo(pkgName);
  if (pkg.version !== version) throw new Error(`Package version from tag "${version}" mismatches with current version "${pkg.version}"`);

  const activeVersion = await getActiveVersion(pkg.name);

  step("Publishing package...");
  const releaseTag = version.includes("beta")
    ? "beta"
    : version.includes("alpha")
      ? "alpha"
      : activeVersion && semver.lt(pkg.version, activeVersion)
        ? "previous"
        : undefined;
  await publishPackage(pkgDir, releaseTag, packageManager);
}

async function publishPackage(pkgDir: string, tag?: string, packageManager: "npm" | "pnpm" = "npm"): Promise<void> {
  const publicArgs = ["publish", "--access", "public"];
  if (tag) {
    publicArgs.push(`--tag`, tag);
  }
  if (packageManager === "pnpm") {
    publicArgs.push(`--no-git-checks`);
  }
  await runIfNotDry(packageManager, publicArgs, {
    cwd: pkgDir,
  });
}

export async function getActiveVersion(npmName: string): Promise<string | undefined> {
  try {
    return (await run("npm", ["info", npmName, "version"], { stdio: "pipe" })).stdout;
  } catch (error_: any) {
    // Not published yet
    if (error_.stderr.startsWith("npm ERR! code E404")) return;
    throw error_;
  }
}

publish({ defaultPackage: "core", packageManager: "pnpm" });
