import path from "node:path";

export function normalizePath(filePath: string | undefined) {
  if (!filePath) {
    return filePath;
  }
  return path.posix.normalize(filePath).replace(/\\/g, "/");
}

export function resolvePath(filePath: string) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

export function fileNameWithOutExtension(filePath: string) {
  const filename = path.basename(filePath);
  const extension = path.extname(filePath);
  return filename.slice(0, filename.indexOf(extension));
}

export function isFunction(val: any) {
  return typeof val === "function" || Object.prototype.toString.call(val) === "[object AsyncFunction]";
}
