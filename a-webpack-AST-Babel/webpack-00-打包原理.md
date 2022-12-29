## 官方文档
https://webpack.docschina.org/concepts/

## 1. 前端工程化
- 组件化
- 模块化
```
模块化就是将一个大文件拆分成相互依赖的小文件，再进行统一的拼装和加载。只有这样，才有多人协作的可能。
```

在 ES6 之前，JavaScript 一直没有模块系统，这对开发大型复杂的前端工程造成了巨大的障碍。对此社区制定了一些模块加载方案，如 CommonJS、AMD 和 CMD 等

现在 ES6 已经在语言层面上规定了模块系统，完全可以取代现有的 CommonJS 和 AMD 规范，而且使用起来相当简洁，并且有静态加载的特性。

规范确定了，然后就是模块的打包和加载问题：
1. 用 Webpack+Babel 将所有模块打包成一个文件同步加载，也可以打成多个 chunk 异步加载；

### 1-1.资源的模块化

Webpack 的强大之处不仅仅在于它统一了 JS 的各种模块系统，取代了 Browserify、RequireJS、SeaJS 的工作。更重要的是它的万能模块加载理念，即所有的资源都可以且也应该模块化。
资源模块化后，有三个好处：

- 1.依赖关系单一化。所有 CSS 和图片等资源的依赖关系统一走 JS 路线，无需额外处理 CSS 预处理器的依赖关系，也不需处理代码迁移时的图片合并、字体图片等路径问题；
- 2.资源处理集成化。现在可以用 loader 对各种资源做各种事情，比如复杂的 vue-loader 等等。
- 3.项目结构清晰化。使用 Webpack 后，你的项目结构总可以表示成这样的函数：
```javaScript
dest = webpack(src, config)
```

## 2. webpack的定义和作用
1.定义：
webpack是一个打包模块化 javaScript的工具，它会从main.js出发，
识别出源码中的模块化导入语句，递归地找出出入口文件的所有依赖，通过Loader转换文件，将入口和其所有依赖打包到一个单独的文件中。
```
一切文件如 js,css,scss,图片对于webpack都是一个个模块，这样的好处是能清晰描述各个模块之间的依赖关系，以便webpck 对模块进行组合和
打包。经过webpack 的处理，最终会输出浏览器使用的静态资源。
```

2.作用：

- 1.模块打包

- 2.编译兼容
通过webpack的Loader机制，不仅仅可以帮助我们对代码做polyfill，还可以编译转换诸如.less, .vue, .jsx这类在浏览器无法识别的格式文件

- 3.能力扩展。通过webpack的Plugin机制，我们在实现模块化打包和编译兼容的基础上，可以进一步实现诸如按需加载，代码压缩等一系列功能，帮助我们进一步提高自动化程度，工程效率以及打包输出的质量。

<br />

## 3. 模块打包运行原理:webpack的整个打包流程：
* 1、读取webpack的配置参数；合并从 shell 传入和 webpack.config.js 文件的配置信息，输出最终的配置信息
```js
const path = require('path');

module.exports = {
  // JS 执行入口文件
  entry: './main.js',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  }
};
```

* 2、启动webpack，创建Compiler对象并开始解析项目；
```
注册配置中的插件，好让插件监听 webpack 构建生命周期中的事件节点，做出对应的反应
```

* 3、从入口文件（entry）开始解析，并且找到其导入的依赖模块，递归遍历分析，形成依赖关系树；

解析配置文件中 entry 入口文件，并找出每个文件依赖的文件，递归下去

```js
module.exports = {
	//所有模块的入口，webpack 从入口开始递归解析出所有依赖的模块
	entry:'./app.js',
	output:{
		//将入口所依赖的所有模块打包成一个文件bundle.js输出
		filename:'bundle.js'
	}
}
```

* 4、对不同文件类型的依赖模块文件使用对应的Loader进行编译，最终转为Javascript文件；
```
在递归每个文件的过程中，根据文件类型和配置文件中 loader 找出相对应的 loader 对文件进行转换

递归结束之后得到每个文件最终的结果，根据 entry 配置生成代码 chunk, 输出所有 chunk 到文件系统
```

* 5、整个过程中webpack会通过发布订阅模式，向外抛出一些hooks，而webpack的插件即可通过监听这些关键的事件节点，执行插件任务进而达到干预输出结果的目的。

其中文件的解析与构建是一个比较复杂的过程，在webpack源码中主要依赖于compiler和compilation两个核心对象实现。

compiler对象是一个全局单例，他负责把控整个webpack打包的构建流程。

compilation对象是每一次构建的上下文对象，它包含了当次构建所需要的所有信息，每次热更新和重新构建，compiler都会重新生成一个新的compilation对象，负责此次更新的构建过程。

<br />


## 1.常用配置之 Loader 配置处理模块的规则
module:配置处理模块的规则,配置文件时使用哪些Loader去加载和转换

1. 三种方式：
条件匹配:通过test,include,exclude,来选中loader要应用规则的文件
2. 应用规则：对选中的文件通过use 配置项来应用 Loader,
```
use: use是每一个rule的属性，指定要用什么loader
test:该属性标识应该转换哪个或哪些文件。
include: 包含某文件
exclude: 排除某文件

noParse:忽略对部分没采用模块化的文件的递归解析和处理。提高构建性能。
一些库如jq,chartJS大而没采用模块化标准让webpack 解析耗时又没意义

parser:细粒度地配置哪些模块被哪些模块解析
```

### 常用loader
1.样式相关，如下所示：
- style-loader：把 CSS 代码注入到 JavaScript 中，通过 DOM 操作去加载 CSS；
- css-loader：加载 CSS，支持模块化、压缩、文件导入等特性；
- postcss-loader：CSS 后处理器 postcss 的 loader；
- less-loader：把 less 代码转换成 CSS 代码；
- sass-loader：把 SCSS/SASS 代码转换成 CSS 代码；

2.JavaScript 相关，如下所示：
- babel-loader：把 ES6 转换成 ES5；
- script-loader：可以将指定的模块 JavaScript 文件转成纯字符串通过 eval 方式执行；
- exports-loader：可以导出指定的对象，例如 window.Zepto；
- ts-loader：把 TypeScript 转换成 JavaScript；
- imports-loader：将任意三方的对象添加到 window 对象中。


3.静态资源相关，如下所示：
raw-loader：把文本文件的内容加载到代码中去；
file-loader：把文件输出到一个文件夹中，在代码中通过相对 URL 去引用输出的文件；
url-loader：和 file-loader 类似，但是能在文件很小的情况下以 base64的方式把文件内容注入到代码中去；
html-loader：HTML 语法的 loader，可以处理 HTML 中的图片、CSS等；
svg-url-loader：把压缩后的 SVG 内容注入到代码中；
markdown-loader：把 Markdown 文件转换成 HTML；
ejs-loader：把 EJS 模版编译成函数返回；
pug-loader：把 Pug 模版转换成 JavaScript 函数返回；
image-webpack-loader：加载并且压缩图片文件；
csv-loader：加载 csv 文件内容；
xml-loader：加载 xml 文件内容。


工程相关，如下所示：
eslint-loader：通过 ESLint 检查 JavaScript 代码；
tslint-loader：通过 TSLint 检查 TypeScript 代码；
mocha-loader：加载 Mocha 测试用例代码。

### css-loader 和 style-loader 的区别和使用
```
webpack是用JS写的，运行在node环境，所以默认webpack打包的时候只会处理JS之间的依赖关系
因为像 .css 这样的文件不是一个 JavaScript 模块，你需要配置 webpack 使用 css-loader 或者 style-loader 去合理地处理它们;

css-loader: 加载.css文件

style-loader:使用<style>将css-loader内部样式注入到我们的HTML页面

style-loader 是通过一个JS脚本创建一个style标签，里面包含一些样式。style-loader是不能单独使用的，应为它并不负责解析 css 之前的依赖关系，每个loader的功能都是单一的，各自拆分独立。
```

```javaScript
const path = require('path');

module.exports = {
  // JS 执行入口文件
  entry: './main.js',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    strictExportPresence: true,
    rules: [
        {
          // 用正则去匹配要用该 loader 转换的 css 文件
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          include: paths.appSrc,
          loader: require.resolve('babel-loader'),
          options: {
            customize: require.resolve(
              'babel-preset-react-app/webpack-overrides'
            ),
            presets: [
              [
                require.resolve('babel-preset-react-app'),
                {
                  runtime: hasJsxRuntime ? 'automatic' : 'classic',
                },
              ],
            ],

            plugins: [
              isEnvDevelopment &&
              shouldUseReactRefresh &&
              require.resolve('react-refresh/babel'),
            ].filter(Boolean),
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true,
            // See #6846 for context on why cacheCompression is disabled
            cacheCompression: false,
            compact: isEnvProduction,
          },
        },
    ]
  }
};
```

## 2.常用配置2：resolve 寻找模块的规则

alias:通过别名来将导入路径映射成一个新的导入路径

extensions:当没有文件后缀，webpack配置在尝试过程中用到地后缀列表：
```js
extensions:['.js','.json']
```
```javaScript
  resolve: {
    extensions: ['.js', '.jsx'],
    mainFiles: ['index', 'list'],
    alias: {
      'com': resolve('src/components'),
      'mod': resolve('src/modules'),
      'util': resolve('src/util'),
      '@': resolve('src')
    },
    modules: [
      path.resolve(__dirname, 'node_modules'), // 指定当前目录下的 node_modules 优先查找
      'node_modules', // 将默认写法放在后面
    ]
  },
```

## Plugins 扩展插件是用来扩展webpack 功能的
* webpack-merge
```
随着我们业务逻辑的增多，图片、字体、css、ES6以及CSS预处理器和后处理器逐渐的加入到我们的项目中来，进而导致配置文件的增多，使得配置文件书写起来比较繁琐，更严重者（书写特定文件的位置会出现错误）。更由于项目中不同的生产环境和开发环境的配置，使得配置文件变得更加糟糕。
分离配置文件
我们在根目录下创建config文件夹，并创建四个配置文件：

webpack.comm.js 公共环境的配置文件
webpack.development.js 开发环境下的配置文件
webpack.production.js 生产环境下的配置文件
webpack.parts.js 各个配置零件的配置文件
```

```js
const merge = require("webpack-merge");
const parts = require("./webpack.parts")    //引入配置零件文件
const config = {
    //书写公共配置
}
module.exports = merge([
    config,
    parts......
])
```

* webpack4.0 默认是使用 terser-webpack-plugin 这个压缩插件，在此之前是使用 uglifyjs-webpack-plugin

* optimize-css-assets-webpack-plugin 插件来压缩 css，其默认使用的压缩引擎是 cssnano。

* webpack默认会将css当做一个模块打包到一个chunk中，extract-text-webpack-plugin的作用就是将css提取成独立的css文件
```javaScript
// 首先安装和引入：
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// 注册：
new ExtractTextPlugin({
    filename: 'css/[name].css',
})

// 注册之后，还要在css的loader中使用：
{
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
        use: ['css-loader','postcss-loader','less-loader'],
        // 使用vue时要用这个配置
        fallback: 'vue-style-loader',  
    })
},
```


* 借助 image-webpack-loader 帮助我们来实现。它是基于 imagemin 这个 Node 库来实现图片压缩的。只要在 file-loader 之后加入 image-webpack-loader 即可

* webpack.optimize.UglifyJsPlugin

* html-webpack-plugin:webpack 打包后自动生成 html 页面
```javaScript
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 css 文件
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          // 转换 .css 文件需要使用的 Loader
          use: ['css-loader'],
        }),
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      // 从 .js 文件中提取出来的 .css 文件的名称
      filename: `[name]_[contenthash:8].css`,
    }),
  ]
};
```

Webpack 内置的插件，如下所示：
```
webpack.DefinePlugin：定义全局常量插件；
webpack.EnvironmentPlugin：定义环境变量插件；
webpack.BannerPlugin：在代码中添加版权注释等；
webpack.DllPlugin：使用 DLL 思想来加快编译速度的插件；
webpack.HashedModuleIdsPlugin：可以修改文件 Hash 算法的插件；
webpack.optimize.SplitChunksPlugin：代码拆分优化插件；
webpack.HotModuleReplacementPlugin：开启模块热替换功能，通过监听文件变化并自动加载被修改的文件来减少烦人的浏览器手动重新加载；
webpack.ProgressPlugin：构建进度插件；
webpack.ProvidePlugin：自动加载模块，例如出现 $ 则加载 jQuery 等常用库；
webpack.IgnorePlugin：用于忽略部分文件

非内置的插件，如下所示：
mini-css-extract-plugin：CSS 文件提取，并且在生产环境构建是可以用于优化 CSS 文件大小；
optimize-css-assets-webpack-plugin：压缩 CSS 文件；
clean-webpack-plugin：在编译之前清理指定目录指定内容；
html-webpack-plugin：html 插件，可以根据 JavaScript模板文件生成 HTML；
preload-webpack-plugin：html-webpack-plugin 的插件，给页面添加 <link rel="preload"> 资源；
i18n-webpack-plugin：帮助网页做国际化的插件；
webpack-manifest-plugin：生成 Webpack 打包文件清单的插件；
html-webpack-inline-source-plugin：在 HTML 中内联打包出来的资源；
webpack-bundle-analyzer：webpack bundle 分析插件；
copy-webpack-plugin：文件拷贝插件，可以指定文件夹的文件复制到 output文件夹，方便打包上线；
terser-webpack-plugin：JavaScript代码压缩插件，这个插件兼容 ES6 语法，推荐使用这个插件，而不是用 uglifyjs；
serviceworker-webpack-plugin：生成 PWA service worker 插件；
hard-source-webpack-plugin：通过缓存提升非首次编译速度；
friendly-errors-webpack-plugin：减少 Webpack 无用的构建 log；
stylelint-webpack-plugin：StyleLint 的插件。
```

## DevServer
只有通过 DevServer 启动webpack时，配置文件里面的DevServer才会生效

hot:模块热替换，将在不刷新整个页面通过做到实时预览

port:服务监听接口，默认8080

inline

histeryApiFallback:

compress:是否使用Gzip压缩

open:自动打开浏览器访问

```js
devServer:{
	https:true
}
```

## devtool：如何生成 Source Map

## 3. 其他
* Entry 配置模块的入口
```javaScript
entry: {
    app: ["babel-polyfill", "./src/index.js"]
},
```

* Output 配置如何输出:
1.output.filename.配置输出文件的名称，string 类型

2.path

3.publicPath 配置发布到线上资源 url 前缀，（在复杂的项目可能会有一些构建出的资源需要异步加载）
```javaScript
output: {
    filename: "bundle.js",
    path: __dirname + "/dist",
    publicPath: process.env.BUILD_ENV === 'production'
    ? config.build.assetsPublicPath
    : config.dev.assetsPublicPath
},
```