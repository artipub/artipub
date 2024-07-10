# What is artipub?

ArtiPub (article release assistant) is a tool library aimed at simplifying content creators to publish the article process.It provides a simple API that allows you to easily publish the article to any platforms, such as blogs, social media, etc., without manual operation of each platform.

<div class="tip custom-block" style="padding-top: 8px">
Just want to try it out? Skip to the [Quickstart](./getting-started).
</div>

## ❓ Why do you need artipub?
1. Local pictures cited in Markdown need to manually compress the picture, then upload to the bed, and finally replace the picture link
2. After Markdown finished writing, I want to publish it to other platforms to avoid manual Copy
3. After Markdown finished writing the article, I need to modify some of the contents of Markdown and let it regenerate the content of Markdown
4. ...

> Note: ArtiPub will help you solve these problems automatically, and will expand more in the future

## ✨ Features

- 🌐 **Multi-platform release**: Support that the Markdown article is published to multiple mainstream content platforms, including but not limited to Notion, Medium, Dev.to, etc.
- ✨ **Simple and easy to use**: Provide a simple API, and only need a few lines of code to implement the article release.
- 🔌 **Support middleware and plugin**: Through plug -in and middle parts, let users make more fine -grained control processing and release processes.
- 📖 **Complete open source**: Encourage community contributions and continue to increase new platform support and functions.

## 📌 TODO
- [x] DevToPublisherPlugin
- [ ] Document Site

## 🔧 Built-in

### Treatment middleware
| Name        | Support | Description                          |
| ----------- | ------- | ------------------------------------ |
| piccompress | √       | Automatic compression of the picture |
| Picupload   | √       | Picture Upload                       |

### Publish plug -in
| Name                  | Support | Description         |
| --------------------- | ------- | ------------------- |
| NOTIONPUBLISHERPLUGIN | √       | Published to NOTION |
| DEVTOPUBLISHERPLUGIN  | √       | Published to DEV.TO |
