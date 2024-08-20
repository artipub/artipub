# Configuring artipub

When running ArtiPub in a command line, Artipub will automatically analyze the configuration file of artipub.config.js (support: js, mjs) in the root directory


## Config Intellisense

```javascript
import defineConfig from "@artipub/cli";

export default defineConfig({
  "githubOption": {
    "owner": "yxw007",
    "repo": "BlogPicBed",
    "dir": "img",
    "branch": "master",
    "token": "xx",
    "cdn_prefix": "",
    "commit_author": "potter",
    "commit_email": "aa4790139@gmail.com"
  },
  "platforms": {
    "notion": {
      "api_key": "xxx",
      "page_id": "xxx",
    },
    "dev.to":{
      "api_key": "xxx"
    }
  }
})
```
