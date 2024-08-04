import { projectName } from "./constant";

export default function useLogger(name: string = "") {
  return {
    info: (...args: any) => {
      console.log(`[${projectName} ${name}]`, ...args);
    },
    error: (...args: any) => {
      console.error(`[${projectName} ${name}]`, ...args);
    },
    warn: (...args: any) => {
      console.warn(`[${projectName} ${name}]`, ...args);
    },
  };
}
