import { projectName } from "./constant";

export default function useLogger(name: string = "") {
  return {
    log(...args: any) {
      this.info(...args);
    },
    info(...args: any) {
      console.log(`[${projectName} ${name}]`, ...args);
    },
    error(...args: any) {
      console.error(`[${projectName} ${name}]`, ...args);
    },
    warn(...args: any) {
      console.warn(`[${projectName} ${name}]`, ...args);
    },
  };
}
