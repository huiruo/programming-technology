参考：https://cloud.tencent.com/developer/article/1405259?from=15425

## webpack 构建速度优化
但是随着项目涉及到的页面越来越多，功能和业务代码也会越来越多，相应的 webpack 的构建时间也会越来越久。

1. webpack 在启动时会从配置的 Entry 出发，解析出文件中的导入语句，再递归解析。
2. 对于导入语句 Webpack 会做出以下操作：  
   1.根据导入语句寻找对应的要导入的文件；

   2.在根据要导入的文件后缀，使用配置中的 Loader 去处理文件（如使用 ES6 需要使用 babel-loader 处理）

针对这两点可以优化查找途径

3. DllPlugin 把一些第三方库，不会改改动的通过 dll 处理，让每一次 rebuild 的时候跳过这些模块的编译。
4. Happypack 多线程打包，通过多线程并行处理，加快编译速度。
5. Webpack 5 , 多级“缓存”提高运行效率。

## 方式 1 优化 Loader 配置

方式1缩小构建目标
排除 Webpack 不需要解析的模块，即使用 loader 的时候，在尽量少的模块中去使用。
我们可以借助 include 和 exclude 这两个参数，规定 loader 只在那些模块应用和在哪些模块不应用。

```javaScript
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, '../src'),
        use: ['babel-loader']
      },
      // ...
    ]
  },
```

方式2.减少查找过程
Loader 处理文件的转换操作是很耗时的，所以需要让尽可能少的文件被 Loader 处理

1.例如在配置 Loader 时通过 include 去缩小命中范围
例如指定文件目录:babel-loader
```javaScript
{
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            include: [
                path.resolve(__dirname, "app/src"),
                path.resolve(__dirname, "app/test")
            ],
            exclude: /node_modules/
        }]
    }
}
```

一些库如 jq,chartJS 大而没采用模块化标准让 webpack 解析耗时又没意义:
* parser:细粒度地配置哪些模块被哪些模块解析
* noParse:忽略对部分没采用模块化的文件的递归解析和处理。提高构建性能。
```javaScript
module:{
		noParse:/jquery/, //不去解析jquery中的依赖库
    {
      test: /\.js$/,
      use: [ 'babel-loader?cacheDirectory'],//开启转换结果缓存
      include: path.resolve(__dirname, 'src'),//只对src目录中文件采用babel-loader
      exclude: path.resolve(__dirname,' ./node_modules'),//排除node_modules目录下的文件
    },
}
```

## 方式 2 优化 resolve 配置
Resolve：Webpack 在启动后会从配置的入口模块出发找出所有依赖的模块,这个属性告诉 webpack 解析模块时应该搜索的目录，绝对路径和相对路径都能使用。使用绝对路径之后，将只在给定目录中搜索，从而减少模块的搜索层级

webpack 内置 js 模块化语法解析功能，也可以自定义规则：
1.alias:通过别名来将导入路径映射成一个新的导入路径
2.mainFields
3.extensions:当没有文件后缀，webpack 配置在尝试过程中用到地后缀列表：

用于配置 webpack 去哪些目录下寻找第三方模块，默认是['node_modules']，但是，它会先去当前目录的./node_modules 查找，没有的话再去../node_modules 最后到根目录；

所以当安装的第三方模块都放在项目根目录时，就没有必要安默认的一层一层的查找，直接指明存放的绝对位置

```javaScript
// config/webpack.common.js

/*
优化 resolve.extensions 配置
1.后缀尝试列表要尽可能的小，不要把项目中不可能存在的情况写到后缀尝试列表中。
2.频率出现最高的文件后缀要优先放在最前面，以做到尽快的退出寻找过程。
3.在源码中写导入语句时，要尽可能的带上后缀，从而可以避免寻找过程。
*/
// ...

const commonConfig = {
  // ...
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
  // ...
}
// ...
```

## 方式 3 优化 resolve.extensions 配置:合理使用 resolve.extensions

在导入没带文件后缀的路径时，webpack 会自动带上后缀去尝试询问文件是否存在，而 resolve.extensions 用于配置尝试后缀列表；
默认为 extensions:['js','json'];

当遇到 require('./data')时 webpack 会先尝试寻找 data.js，没有再去找 data.json；如果列表越长，或者正确的后缀越往后，尝试的次数就会越多；

所以在配置时为提升构建优化需遵守：

- 频率出现高的文件后缀优先放在前面；
- 列表尽可能的小；
- 书写导入语句时，尽量写上后缀名

因为项目中用的 jsx 较多，所以配置 extensions: [".jsx",".js"],

## 方式 4 使用 DllPlugin 优化

- 在使用 webpack 进行打包时候，对于依赖的第三方库，如 react，react-dom 等这些不会修改的依赖，可以让它和业务代码分开打包；

- 只要不升级依赖库版本，之后 webpack 就只需要打包项目业务代码，遇到需要导入的模块在某个动态链接库中时，就直接去其中获取；而不用再去编译第三方库，这样第三方库就只需要打包一次。

接入需要完成的事：

```
将依赖的第三方模块抽离，打包到一个个单独的动态链接库中
当需要导入的模块存在动态链接库中时，让其直接从链接库中获取
项目依赖的所有动态链接库都需要被加载
```

- 接入工具(webpack 已内置)

```
 DllPlugin插件：用于打包出一个个单独的动态链接库文件；
 DllReferencePlugin:用于在主要的配置文件中引入DllPlugin插件打包好的动态链接库文件
```

> 配置 webpack_dll.config.js 构建动态链接库

```javaScript
const path = require('path');
const DllPlugin = require('webpack/lib/DllPlugin');

module.exports = {
    mode: 'production',
    entry: {
        // 将React相关模块放入一个动态链接库
        react: ['react','react-dom','react-router-dom','react-loadable'],
        librarys: ['wangeditor'],
        utils: ['axios','js-cookie']
    },
    output: {
        filename: '[name]-dll.js',
        path: path.resolve(__dirname, 'dll'),
        // 存放动态链接库的全局变量名，加上_dll_防止全局变量冲突
        library: '_dll_[name]'
    },
    // 动态链接库的全局变量名称，需要可output.library中保持一致，也是输出的manifest.json文件中name的字段值
    // 如react.manifest.json字段中存在"name":"_dll_react"
    plugins: [
        new DllPlugin({
            name: '_dll_[name]',
            path: path.join(__dirname, 'dll', '[name].manifest.json')
        })
    ]
}
```

> webpack.pro.config.js 中使用

```javaScript
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
plugins: [
    // 告诉webpack使用了哪些动态链接库
        new DllReferencePlugin({
            manifest: require('./dll/react.manifest.json')
        }),
        new DllReferencePlugin({
            manifest: require('./dll/librarys.manifest.json')
        }),
        new DllReferencePlugin({
            manifest: require('./dll/utils.manifest.json')
        }),
]
```

```
注意：在webpack_dll.config.js文件中，DllPlugin中的name参数必须和output.library中的一致；因为DllPlugin的name参数影响输出的manifest.json的name；而webpack.pro.config.js中的DllReferencePlugin会读取manifest.json的name，将值作为从全局变量中获取动态链接库内容时的全局变量名

执行构建
  webpack --progress --colors --config ./webpack.dll.config.js

  webpack --progress --colors --config ./webpack.prod.js

html中引入dll.js文件
```

## 方式 5.HappyPack 并行构建优化

核心原理：将 webpack 中最耗时的 loader 文件转换操作任务，分解到多个进程中并行处理，从而减少构建时间。

```
安装：npm i -D happypack
重新配置rules部分,将loader交给happypack来分配：

参数：
threads：代表开启几个子进程去处理这一类文件，默认是3个；
verbose:是否运行HappyPack输出日志，默认true；
threadPool：代表共享进程池，即多个HappyPack示例使用一个共享进程池中的子进程去处理任务，以防资源占有过多
```

```javaScript
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({size: 5}); //构建共享进程池，包含5个进程
...
plugins: [
    // happypack并行处理
    new HappyPack({
        // 用唯一ID来代表当前HappyPack是用来处理一类特定文件的，与rules中的use对应
        id: 'babel',
        loaders: ['babel-loader?cacheDirectory'],//默认设置loader处理
        threadPool: happyThreadPool,//使用共享池处理
    }),
    new HappyPack({
        // 用唯一ID来代表当前HappyPack是用来处理一类特定文件的，与rules中的use对应
        id: 'css',
        loaders: [
            'css-loader',
            'postcss-loader',
            'sass-loader'],
            threadPool: happyThreadPool
    })
],
module: {
    rules: [
    {
        test: /\.(js|jsx)$/,
        use: ['happypack/loader?id=babel'],
        exclude: path.resolve(__dirname,' ./node_modules'),
    },
    {
        test: /\.(scss|css)$/,
        //使用的mini-css-extract-plugin提取css此处，如果放在上面会出错
        use: [MiniCssExtractPlugin.loader,'happypack/loader?id=css'],
        include:[
            path.resolve(__dirname,'src'),
            path.join(__dirname, './node_modules/antd')
        ]
    },
}
```

## 方式 6 代码压缩用 ParallelUglifyPlugin 代替自带的 UglifyJsPlugin 插件

自带的 JS 压缩插件是单线程执行的，而 webpack-parallel-uglify-plugin 可以并行的执行
配置参数：

```
 uglifyJS: {}：用于压缩 ES5 代码时的配置，Object 类型
 test: /.js$/g:使用正则去匹配哪些文件需要被 ParallelUglifyPlugin 压缩，默认是 /.js$/
 include: []:使用正则去包含被压缩的文件，默认为 [].
 exclude: []: 使用正则去包含不被压缩的文件，默认为 []
 cacheDir: ''：缓存压缩后的结果，下次遇到一样的输入时直接从缓存中获取压缩后的结果并返回，默认不会缓存，开启缓存设置一个目录路径
 workerCount: ''：开启几个子进程去并发的执行压缩。默认是当前运行电脑的 CPU 核数减去1
 sourceMap: false：是否为压缩后的代码生成对应的Source Map, 默认不生成
```

```javaScript
...
minimizer: [
    // webpack:production模式默认有配有js压缩，但是如果这里设置了css压缩，js压缩也要重新设置,因为使用minimizer会自动取消webpack的默认配置
    new optimizeCssPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: true
    }),
    new ParallelUglifyPlugin({
        cacheDir: '.cache/',
        uglifyJS:{
            output: {
           // 是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，可以设置为false
                beautify: false,
        //是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
                comments: false
            },
            compress: {
            //是否在UglifyJS删除没有用到的代码时输出警告信息，默认为输出
                warnings: false,
            //是否删除代码中所有的console语句，默认为不删除，开启后，会删除所有的console语句
                drop_console: true,
            //是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 1, 默认为否
                collapse_vars: true,
            }
        }
}),
]
```
