#!/usr/bin/env node
import { run } from "../dist/index.js";

run().catch((error_) => {
  console.error(error_);
  process.exit(1);
});
