import { registerCommands } from "./command";
export * from "./config";

export function run() {
  return new Promise((resolve, reject) => {
    try {
      registerCommands(resolve);
    } catch (error) {
      reject(error);
    }
  });
}

export default run;
