# 命令行界面

## `安装`

::: code-group

```bash [npm]
npm install -g @artipub/cli
```

```bash [yarn]
yarn add -g @artipub/cli
```

```bash [pnpm]
pnpm add -g @artipub/cli
```

:::

## `artipub`

```bash

Usage: artipub [options] [command]

Options:
  -v,--version               output the current version
  -h, --help                 display help for command

Commands:
  add [options] <string>     add an existing article
  update [options] <string>  Update an existing article
  clear                      Clear the cache，Wait for implementation
  config [options]           Edit the configuration file
  help [command]             display help for command
```

## `add`

### Usage

首次发布文章，使用add命令

```bash
artipub add <markdown file path>
```

### Options

| Options        |                  |
| -------------- | ---------------- |
| `-c, --config` | config file path |

## `update`

更新文章，使用update命令

### Usage

```bash
artipub update <markdown file path>
```

### Options

| Options        |                  |
| -------------- | ---------------- |
| `-c, --config` | config file path |

## `config`

重新编辑配置文件，方便手动添加配置信息

### Usage

从当前目录寻址配置文件，如果找不到就会去用户目录找配置文件，找不到就会提示：No configuration file found.

```bash
artipub config --edit
```
