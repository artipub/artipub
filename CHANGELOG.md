## 1.0.4 (2024-08-05)

### Bug Fixes

- add plugin judge error ([7d21230](https://github.com/artipub/artipub/commit/7d212305642ec4257223ee33fccac71701ac72dc))
- **build:** make document workflows execute after release to avoid latest version display mistake ([b277786](https://github.com/artipub/artipub/commit/b277786208124332f5fe8a08d7fb5f7e9a93ef81))
- **docs:** load static resource path mistake ([25ae156](https://github.com/artipub/artipub/commit/25ae1565dad4290cbef43d05647e586182cceea5))

### Features

- add article publish to multi platform ([ab03d3f](https://github.com/artipub/artipub/commit/ab03d3f4dcc743252d916174b7cf76761555def3))
- add blogPublisherPlugin ([ee0a2c0](https://github.com/artipub/artipub/commit/ee0a2c0e9bcb405e5f997b46843751b3359548f6))
- add cli ([3cb3ee5](https://github.com/artipub/artipub/commit/3cb3ee5d744fd475181bfb06c2a60a0855d80eab))
- add support for adding and updating articles with configuration file ([8d475e6](https://github.com/artipub/artipub/commit/8d475e6568afaa11e5388bd8b7947dee1d175911))
- basically implement the command line article publishing function ([1732a26](https://github.com/artipub/artipub/commit/1732a262676087adc6decf5aaa719f93cb65a1ba))
- **build:** monorepo packet sending is supported ([dae7b12](https://github.com/artipub/artipub/commit/dae7b1292ee73dc32cc6198cd0da594ebc8748d7))
- cli 调通Schema配置文件校验 ([78baad0](https://github.com/artipub/artipub/commit/78baad074cdc97fd98db8860034f643de5a04835))
- save and read user interaction configuration information ([15bf94f](https://github.com/artipub/artipub/commit/15bf94febc8448e4e4d93fbcebf9f763ed58ae30))
- the configuration file is changed from json to js to facilitate the configuration of prompts ([dc77e3b](https://github.com/artipub/artipub/commit/dc77e3b628e1fd34465965892cf8ca7ca560d475))

## 1.0.5-0 (2024-07-06)

## 1.0.4 (2024-07-06)

### Features

- add DevToPublisherPlugin with option to publish articles to Dev.to ([6dd181e](https://github.com/artipub/artipub/commit/6dd181eff68c74a225c20447d25c16d01913a933))

## 1.0.4-16 (2024-07-05)

### Bug Fixes

- the relative image address node is not replaced correctly ([fce7b0b](https://github.com/artipub/artipub/commit/fce7b0b6387587417ce7115ff67de6f8474b04ff))
- update remarkStringify options for consistent bullet styling, markdown format error ([1701776](https://github.com/artipub/artipub/commit/170177686a00785d86a22d2f1ebffad163123e71))

## 1.0.4-14 (2024-07-05)

## 1.0.4-13 (2024-07-05)

## 1.0.4-12 (2024-07-03)

## 1.0.4-11 (2024-07-03)

### Bug Fixes

- rollup packaging packages with incomplete esm support, resulting in packaging errors ([8a0e77c](https://github.com/artipub/artipub/commit/8a0e77ca13fa3ef15b4e8367dd8cc695cab20814))

## 1.0.4-10 (2024-07-02)

### Bug Fixes

- avoid errors caused by non-existent files ([71b0bfb](https://github.com/artipub/artipub/commit/71b0bfbb3d12e245620a1ee1cd61fe843171a65d))

## 1.0.4-9 (2024-07-02)

## 1.0.4-8 (2024-07-02)

### Bug Fixes

- **chore:** env.skip == 'false' prompt error in release.yml ([eb5560b](https://github.com/artipub/artipub/commit/eb5560b8546b9d9376d37206cfcbc09f8bafdd8e))

## 1.0.4-7 (2024-07-02)

## 1.0.4-6 (2024-07-02)

## 1.0.4-4 (2024-07-01)

## 1.0.4-3 (2024-07-01)

### Bug Fixes

- **build:** process completed with exit code 128 ([521179f](https://github.com/artipub/artipub/commit/521179fd54ce9f0eaff4448c9720649924b7e124))

## 1.0.4-1 (2024-07-01)

### Bug Fixes

- **build:** git tag | tail -1, get tag mistake ([5588b06](https://github.com/artipub/artipub/commit/5588b062e334e0100140918260cece26fe827565))

## 1.0.4-0 (2024-07-01)

### Bug Fixes

- remarkStringify The default article description separator after serialization is incorrect ([54234d6](https://github.com/artipub/artipub/commit/54234d6549425fa68282d48f0897d5e394c7937f))

## 1.0.3 (2024-06-30)

### Bug Fixes

- **build:** build dependencies into the bundle to avoid losing dependency errors ([626b9f3](https://github.com/artipub/artipub/commit/626b9f3739483486313d9d8395dff3421529d076))
- plugin refers to the same tree data problem ([5eaacb5](https://github.com/artipub/artipub/commit/5eaacb5dbc4099ee375cfe46b0b83db3b083bef8))

### Performance Improvements

- let the plug-in process in parallel ([59b419f](https://github.com/artipub/artipub/commit/59b419f123541ebe2a734fe48eeb6097aa241c68))

## 1.0.2-alpha.6 (2024-06-26)

## 1.0.2-alpha.5 (2024-06-26)

### Bug Fixes

- **playground:** error prompt ([31a6772](https://github.com/artipub/artipub/commit/31a677260bb9c7e52247e36f00dcd32b0b74b275))
- ts error, update NotionPublisherPlugin to return a Promise for async operations ([9e39dcf](https://github.com/artipub/artipub/commit/9e39dcf1eae9f57c72b0107bb48d2bca6bbfc3e9))

## 1.0.2-alpha.3 (2024-06-25)

## 1.0.2-alpha.2 (2024-06-25)

### Bug Fixes

- **build:** build cjs bundle format error, simplify package.json exports config ([5533734](https://github.com/artipub/artipub/commit/55337348d3e0a01dbe6c9fae61c75e6634696969))

## 1.0.2-alpha.1 (2024-06-24)

## 1.0.2-alpha.0 (2024-06-24)

# 1.0.0-beta.0 (2024-06-20)

### Features

- Add @types/mdast dependency and update middleware signature ([374ea5e](https://github.com/artipub/artipub/commit/374ea5ec2b683c8173a01d089a7ccb33654c41a9))
- add internal image compress middleware ([ec161e1](https://github.com/artipub/artipub/commit/ec161e1530f8562b5d918c33f04d683cc6070383))
- add internal plugin ([a3f3f0a](https://github.com/artipub/artipub/commit/a3f3f0a7512bc4c0eaf1b661f1124f8a51eed78a))
- add plugin ([ccb73e4](https://github.com/artipub/artipub/commit/ccb73e416a5e77c8031487a4236b1e72e4f9ecd7))
- Fix module default import issue and update image upload middleware ([45b7757](https://github.com/artipub/artipub/commit/45b7757c19d37fe22546964494730a32aaf5d4a5))
- integrate unist-util-visit , simplify ast modification ([87c2333](https://github.com/artipub/artipub/commit/87c233380c0b0cbd83de09c4bf9d547a759d75fd))
- Update dependencies and fix import paths ([f5a5c85](https://github.com/artipub/artipub/commit/f5a5c852863b94991185c11b5ea6dd3d4b6f4870))
- Update dependencies and fix import paths ([e7cb291](https://github.com/artipub/artipub/commit/e7cb291e4af72f1bd6b1b9bc63c1ee39399fcb94))
