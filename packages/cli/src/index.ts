import type { RunResult } from "./types";
import configHandler from "./config";
import * as constant from "./constant";
import command from "./command";
import interact from "./interact";

export * from "./types";

export default {
  ...configHandler,
  ...constant,
  interact,
  command,
  run(args: any = process.argv): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      try {
        this.command.registerCommands(resolve, reject, args);
      } catch (error) {
        reject(error);
      }
    });
  },
};
