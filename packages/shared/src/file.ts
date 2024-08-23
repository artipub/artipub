import pfs from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

export async function cleanDir(dir: string) {
  if (fs.existsSync(dir)) {
    const filePaths = await pfs.readdir(dir);
    for (const file of filePaths) {
      const curPath = path.join(dir, file);
      await (fs.lstatSync(curPath).isDirectory() ? pfs.rm(curPath, { recursive: true }) : pfs.unlink(curPath));
    }
    await pfs.rm(dir, { recursive: true });
  }
}

export async function copyDir(src: string, dest: string) {
  await pfs.mkdir(dest, { recursive: true });
  const filePaths = await pfs.readdir(src);
  for (const file of filePaths) {
    const curPath = path.join(src, file);
    const destPath = path.join(dest, file);
    await (fs.lstatSync(curPath).isDirectory() ? copyDir(curPath, destPath) : pfs.copyFile(curPath, destPath));
  }
}
