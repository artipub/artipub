import path from "node:path";

export function isFunction(val: any) {
  return typeof val === "function";
}

export function isString(val: any) {
  return typeof val === "string";
}

export function getProjectRootPath() {
  return process.cwd();
}

export function normalizedPath(filePath: string) {
  return path.posix.normalize(filePath).replace(/\\/g, "/");
}

export function getUniqueId() {
  return Math.random().toString(36).slice(2, 10);
}

export const relativePathImgRegex = /^[^?hpst].+\.(png|jpg|jpeg|svg|gif)$/im;
