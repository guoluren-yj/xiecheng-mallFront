# mall-front

## Author

> @SRM 前端团队  

## Version

> 1.1.0

## 说明

甄云科技商城主站
 - mall-front 为主模块
 - mall-front-cux-xxx 为二开模块

## 介绍

### 关于React

React是用于构建用户界面的JavaScript库,本项目采用全新的react v16.8.x,其中包含一些全新的特性.且本项目会持续同步react版本.

更多请参考[React Github](https://github.com/facebook/react)或[React官网](https://reactjs.org/)

### 关于React Hooks

Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

更多请参考[React Hooks](https://react.docschina.org/docs/hooks-intro.html)

### 关于webpack

用于构建/打包前端工程,本项目采用全新webpack v4.28.x,其中包含全新的特性/性能优化/社区最佳实践

请参考[webpack](https://webpack.js.org)

### 关于Create React App

本项目是基于Create React App脚手架创建,并执行了`yarn eject`命令

请参考[Create React App](https://github.com/facebook/create-react-app).

## 使用

下面是关于本项目的使用说明

### 环境变量

* node.js: v10.x or v8.x(>= v8.10)

  > 关于node.js请参考: [https://nodejs.org/en/](https://nodejs.org/en/)

* 内存: 
  * 开发者模式运行内存: >8GB
  * 生产环境编译运行内存: >8GB

* yarn: 推荐使用yarn管理本项目

  > 执行如下命令全局安装yarn
  > ```
  > $ npm install --global yarn 
  > ```
  > 
  > 关于`yarn`请参考 [https://yarnpkg.com](https://yarnpkg.com)

* lerna: 推荐使用lerna管理本项目

  > 执行如下命令全局安装lerna
  > ```
  > $ npm install --global lerna 
  > ```


* 开发工具: 推荐使用Visual Studio Code编辑器

  > Visual Studio Code推荐插件:
  > * Chinese (Simplified) Language Pack for Visual Studio Code
  > * Debugger for Chrome
  > * EditorConfig for VS Code
  > * ESLint
  > * GitLens — Git supercharged
  > * YAML

## 启动

### 下载/Clone

您可以使用如下命令下载本项目

```shell
# git clone https://code.choerodon.com.cn/hzero-srm/srm-front-mall.git
# cd mall-front
```
### 初始化本项目

**由于本项目使用 yarn 管理项目,所以初始化项目请务必执行如下初始化命令**

由于项目依赖发布于私有 npm 仓库，所以需要将 yarn 的源配置为私有源。

```bash
yarn config set registry https://nexus.going-link.com/repository/zhenyun-npm-group/
```

### 跳过puppeteer安装过程中下载Chromium(可加快安装依赖时间)

```bash
$ export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 #macos/linux
# set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 #windows
```
### lerna 安装依赖

根路径下直接执行 `lerna bootstrap` 命令
```bash 
$ lerna bootstrap
```
lerna超过7版本 bootstrap命令被移除

### transpile

`lerna run transpile`: `请务必执行如下命令`

```bash
$ lerna run transpile
```

### 编译模块

需要编译各模块,执行如下命令

```bash
$ yarn run transpile
```

### 启动项目

确保`transpile`操作已经执行成功后,执行如下命令,即可启动当前工程或者子模块

```bash
$ yarn start
```

启动成功后,请访问如下地址即可

```url
http://localhost:8000
```

### 本地项目代码交付

本地项目代码交付时，可执行yarn clearCux命令一键清除二开代码


## 项目环境变量说明

| 变量名               | 含义                                                         | 构建后需要替换 |
| -------------------- | ------------------------------------------------------------ | -------------- |
| BUILD_MALL_API_HOST       | 请求接口的地址                                               | 是             |
| BUILD_SRM_HOST       | SRM 平台前端地址                                             | 是             |
| BUILD_MALL_CLIENT_ID      | 商城登录 OAUTH CLIENT_ID                                     | 是             |
| ENV      | 环境名称                                     | 是             |
| MALL_APM_APP_ID      | 端侧监控id                                     | 是             |

## 项目提交规范

本项目使用 `@commitlint/{cli, config-conventional}`, `commitizen`, `cz-conventional-changelog` 等一系列工具来规范 commit 提交信息，并配合 `standard-version` 来做版本发布管理。

建议全局安装 `commitizen` 工具，提供了 `git cz` 命令来做代码提交提示:

```shell
yarn global add commitizen
# npm install -g commitizen
```

若没有全局安装，项目内同样提供 npm 脚本的方式来使用

```shell
yarn commit # 可以调起 commit 信息
```

意味着，以后在项目中进行 commit 时，无需使用 `git commit` 命令（若能完全记得规范并保证通过 commit 检查也可使用），而使用 `git cz` 命令或 `yarn commit` 来替代。

命令执行后会出现交互式对话框，分别是提交类型，作用域，提交信息以及是否有 break change。

下面是各提交类型的说明：

```
build：主要目的是修改项目构建系统(例如 glup，webpack，rollup 的配置等)的提交
ci：主要目的是修改项目继续集成流程(例如 Travis，Jenkins，GitLab CI，Circle等)的提交
docs：文档更新
feat：新增功能
fix：bug 修复
perf：性能优化
refactor：重构代码(既没有新增功能，也没有修复 bug)
style：不影响程序逻辑的代码修改(修改空白字符，补全缺失的分号等)
test：新增测试用例或是更新现有测试
revert：回滚某个更早之前的提交
chore：不属于以上类型的其他类型
```

按照该规范提交后，可配合 `conventional-changelog` 自动生成 `CHANGELOG.md` 变更文档。