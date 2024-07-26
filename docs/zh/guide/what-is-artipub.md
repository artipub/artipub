# Artipub 是什么?

ArtiPub（文章发布助手）是一个旨在简化内容创作者跨平台发布文章过程的工具库。它提供了一套简单的API，可以让你轻松地将文章发布到任意平台，如博客、社交媒体等，无需手动操作每个平台。

<div class="tip custom-block" style="padding-top: 8px">

只是想尝试一下？跳至[快速入门](./getting-started)

</div>

## ❓ 为什么需要ArtiPub?

1. markdown中引用的本地图片，需要手动压缩图片，然后上传至图床，最后在把图片链接替换掉
2. markdown写完文章后，想发布至其他平台避免手动copy
3. markdown写完文章后，我需要修改markdown中的一些内容，让其重新生成markdown内容
4. ...

> 说明：ArtiPub全部帮你自动解决这些问题，未来将拓展更多内容

## ✨ 特点

- 🌐 **多平台发布**：支持将markdown文章发布至任意内容平台(平台提供API)，比如：Notion、Medium、Dev.to等。
- ✨ **简单易用**：提供了简洁的API，只需几行代码即可实现文章的发布。
- 🔌 **支持中间件和插件**：通过插件和中间件，让用户更细粒度的控制处理和发布流程。
- 📖 **完全开源**：鼓励社区贡献，持续增加新的平台支持和功能。

## 📌 TODO

- [x] DevToPublisherPlugin
- [x] Document Site

## 🔧 内置

### 处理中间件

| 名称        | 支持 | 描述         |
| ----------- | ---- | ------------ |
| picCompress | √    | 图片自动压缩 |
| picUpload   | √    | 图片上传     |

### 发布插件

| 名称                  | 支持 | 描述         |
| --------------------- | ---- | ------------ |
| NotionPublisherPlugin | √    | 发布至notion |
| DevToPublisherPlugin  | √    | 发布至dev.to |
