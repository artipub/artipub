#!/usr/bin/env node
import * as cli from "../dist/index.js";

cli.run().catch((error_) => {
  console.error(error_);
  process.exit(1);
});
