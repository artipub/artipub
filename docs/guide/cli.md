# Command line interface

## `artipub`

```bash

Usage: artipub [options] [command]

Options:
  -v,--version               output the current version
  -h, --help                 display help for command

Commands:
  add [options] <string>     add an existing article
  update [options] <string>  Update an existing article
  clear                      Clear the cache
  config [options]           Edit the configuration file
  help [command]             display help for command
```

## `add`

### `Usage`

首次发布文章，使用add命令rticle for the first time, using the ADD command

```bash
artipub add <markdown file path>
```

### `Options`


| Options        |                  |
| -------------- | ---------------- |
| `-c, --config` | config file path |

## `update`

Update the article, use the update command

### `Usage`

```bash
artipub update <markdown file path>
```

### `Options`


| Options        |                  |
| -------------- | ---------------- |
| `-c, --config` | config file path |


## `config`

Edit the configuration file to facilitate manually adding configuration information

### `Usage`

From the current directory addressing configuration file, if you can't find it, you will go to the user directory to find the configuration file. no configuration file found.

```bash
artipub config --edit
```


