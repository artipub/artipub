#!/usr/bin/env node
const { run } = require("../dist/cli/index.js");

run().catch((error_) => {
  console.error(error_);
  process.exit(1);
});
