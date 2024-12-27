# basic-scaffold

The basic scaffold of the front-end project.

## The directory description

├─.husky 检测勾子  
│ └─\_  
├─.vscode VSCode 开发工具公共配置  
├─mock 本地测试数据  
├─public Public 目录  
├─src 主开发目录  
│ ├─api 后端接口请求封装  
│ ├─assets 公共静态资源  
│ │ ├─icons 图标如 svg/png  
│ │ ├─images 图片目录  
│ │ └─styles 全局公共样式  
│ ├─components 项目公共组件  
│ │ └─assets 公共组件用到的静态资源  
│ │ ├─icons 公共组件图标  
│ │ └─styles 公共组件样式  
│ │ └─element-reset element-plus 样式覆盖/本地化  
│ ├─enums 公共枚举定义  
│ ├─hooks 公共逻辑定义  
│ ├─layout 页面公共框架  
│ │ └─components 页面公共框架使用的组件  
│ ├─locales 国际化  
│ │ └─lang 国际化语言定义  
│ │ ├─en 国际化-英文定义  
│ │ └─zh-CN 国际化-中文定义  
| ├─packages 基础公共组件目录(后续会独立到公共组件 Repo)  
| | ├─assets 基础公共组件使用的静态文件  
│ | ├─assets 基础公共组件使用的静态文件  
│ | ├─components 基础公共组件定义  
│ | │ ├─image-viewer 影像看图组件  
│ │ | └─viewport 看图组件公共父组件  
│ | ├─hooks  
│ | ├─locale  
│ | ├─theme  
│ | └─utils  
│ ├─plugins 三方插件目录  
│ │ └─element-plus element-plus 组件库插件引入  
│ ├─router 路由定义  
│ │ └─modules 路由模块  
│ ├─store 数据存储中心  
│ │ └─modules 数据存储模块  
│ ├─types 公共类型定义  
│ ├─utils 公共方法定义  
│ │ ├─http Axios 接口请求拦截封装  
│ │ └─progress 进度条方法  
│ └─views 页面目录  
│ ├─analysis 分析页面目录  
│ │ ├─anterior 前节分析页面  
│ │ └─posterior 后节分析页面  
│ ├─patient 患者页面  
│ └─user 用户登录页面  
└─tests 单元测试目录  
└─unit

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Run your unit tests

```
yarn test:unit
```

### Lints and fixes files

```
yarn lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
