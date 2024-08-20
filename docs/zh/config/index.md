# 配置 artipub

当以命令行运行artipub时，artipub会自动解析根目录下artipub.config.js的配置文件 (支持：js,mjs)


## 配置智能提示

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
