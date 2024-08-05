import fs from "node:fs/promises";
import type { Options as ExecaOptions, ResultPromise } from "execa";
import { execa } from "execa";
import colors from "picocolors";
import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import prompts from "prompts";
import semver from "semver";
import { execSync } from "node:child_process";

import type { ReleaseType } from "semver";

interface VersionChoice {
  title: string;
  value: string;
}

async function getLatestTag(pkgName: string): Promise<string> {
  const pkgJson = JSON.parse(await fs.readFile(`packages/${pkgName}/package.json`, "utf8"));
  return pkgJson.version ? `${pkgName}@${pkgJson.version}` : "";
}

function run<EO extends ExecaOptions>(
  bin: string,
  args: string[],
  opts?: EO
): ResultPromise<EO & (keyof EO extends "stdio" ? any : { stdio: "inherit" })> {
  return execa(bin, args, { stdio: "inherit", ...opts }) as any;
}

function getPackageInfo(pkgName: string, getPkgDir = (pkg) => `packages/${pkg}`) {
  const pkgDir = path.resolve(getPkgDir(pkgName));
  const pkgPath = path.resolve(pkgDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (pkg.private) {
    throw new Error(`Package ${pkgName} is private`);
  }
  return { pkg, pkgDir, pkgPath };
}

async function logRecentCommits(pkgName: string): Promise<void> {
  const tag = await getLatestTag(pkgName);
  if (!tag) return;
  const sha = await run("git", ["rev-list", "-n", "1", tag], {
    stdio: "pipe",
  }).then((res) => (res.stdout as any)?.trim());
  console.log(
    colors.bold(
      `\n${colors.blue(`i`)} Commits of ${colors.green(pkgName)} since ${colors.green(tag)} ${colors.gray(`(${sha.slice(0, 5)})`)}`
    )
  );
  await run("git", ["--no-pager", "log", `${sha}..HEAD`, "--oneline", "--", `packages/${pkgName}`], { stdio: "inherit" });
  console.log();
}

function getVersionChoices(currentVersion: string) {
  const currentBeta = currentVersion.includes("beta");
  const currentAlpha = currentVersion.includes("alpha");
  const isStable = !currentBeta && !currentAlpha;

  function inc(i: ReleaseType, tag = currentAlpha ? "alpha" : "beta") {
    return semver.inc(currentVersion, i, tag)!;
  }

  let versionChoices: VersionChoice[] = [
    {
      title: "next",
      value: inc(isStable ? "patch" : "prerelease"),
    },
  ];

  if (isStable) {
    versionChoices.push(
      {
        title: "beta-minor",
        value: inc("preminor"),
      },
      {
        title: "beta-major",
        value: inc("premajor"),
      },
      {
        title: "alpha-minor",
        value: inc("preminor", "alpha"),
      },
      {
        title: "alpha-major",
        value: inc("premajor", "alpha"),
      },
      {
        title: "minor",
        value: inc("minor"),
      },
      {
        title: "major",
        value: inc("major"),
      }
    );
  } else if (currentAlpha) {
    versionChoices.push({
      title: "beta",
      value: inc("patch") + "-beta.0",
    });
  } else {
    versionChoices.push({
      title: "stable",
      value: inc("patch"),
    });
  }
  versionChoices.push({ value: "custom", title: "custom" });

  versionChoices = versionChoices.map((i) => {
    i.title = `${i.title} (${i.value})`;
    return i;
  });

  return versionChoices;
}

function updateVersion(pkgPath: string, version: string): void {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

async function promptVersionChoice(pkg: { version: string }) {
  let targetVersion: string | undefined;
  const { release }: { release: string } = await prompts({
    type: "select",
    name: "release",
    message: "Select release type",
    choices: getVersionChoices(pkg.version),
  });

  if (release === "custom") {
    const res: { version: string } = await prompts({
      type: "text",
      name: "version",
      message: "Input custom version",
      initial: pkg.version,
    });
    targetVersion = res.version;
  } else {
    targetVersion = release;
  }
  return targetVersion;
}

async function generateChangelog(pkgName: string, targetVersion: string) {
  console.log(colors.cyan("\nGenerating changelog..."));
  const changelogArgs = ["conventional-changelog", "-p", "angular", "-i", "CHANGELOG.md", "-s", "--commit-path", "."];
  if (pkgName !== "vite") changelogArgs.push("--lerna-package", pkgName);
  await run("npx", changelogArgs, { cwd: `packages/${pkgName}` });
  // conventional-changelog generates links with short commit hashes, extend them to full hashes
  extendCommitHash(`packages/${pkgName}/CHANGELOG.md`);
}

function extendCommitHash(path: string): void {
  let content = readFileSync(path, "utf8");
  const base = "https://github.com/artipub/artipub/commit/";
  const matchHashReg = new RegExp(`${base}(\\w{7})\\)`, "g");
  console.log(colors.cyan(`\nextending commit hash in ${path}...`));
  let match;
  while ((match = matchHashReg.exec(content))) {
    const shortHash = match[1];
    try {
      const longHash = execSync(`git rev-parse ${shortHash}`).toString().trim();
      content = content.replace(`${base}${shortHash}`, `${base}${longHash}`);
    } catch {
      console.log(colors.red(`Failed to extend commit hash for ${shortHash}`));
    }
  }
  writeFileSync(path, content);
  console.log(colors.green(`${path} update success!`));
}

export function step(msg: string): void {
  return console.log(colors.cyan(msg));
}

export const runIfNotDry = run;

async function commitChanges(repo: string, tag: string) {
  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    step("\nCommitting changes...");
    await runIfNotDry("git", ["add", "-A"]);
    await runIfNotDry("git", ["commit", "-m", `chore: release ${tag}`]);
    await runIfNotDry("git", ["tag", tag]);
  } else {
    console.log("No changes to commit.");
    return;
  }

  step("\nPushing to GitHub...");
  await runIfNotDry("git", ["push", "origin", `refs/tags/${tag}`]);
  await runIfNotDry("git", ["push"]);

  console.log(
    colors.green(
      `
Pushed, publishing should starts shortly on CI.
https://github.com/artipub/${repo}/actions/workflows/publish.yml`
    )
  );
}

const main = async () => {
  const repo = "artipub";
  const packages = ["core", "cli"];

  const selectedPkgAnswer = await prompts({
    type: "select",
    name: "pkg",
    message: "Choose a package to release",
    choices: packages.map((pkg) => ({ title: pkg, value: pkg })),
  });
  const selectedPkg = selectedPkgAnswer.pkg;
  const { pkg, pkgPath } = getPackageInfo(selectedPkg);

  await logRecentCommits(selectedPkg);

  const targetVersion = await promptVersionChoice(pkg);
  updateVersion(pkgPath, targetVersion);

  await generateChangelog(selectedPkg, targetVersion);

  //6. commit changes
  const tag = `${selectedPkg}@${targetVersion}`;
  await commitChanges(repo, tag);

  console.log();
};

main();