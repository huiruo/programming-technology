## SourceMap作用
为了提高前端项目的性能和不同浏览器上的兼容性，我们线上环境的代码一般都要经过如下等处理：
- 压缩混淆，减小体积
- 多个文件合并，减少 HTTP 请求数
- 将 es6+代码转换成浏览器能够识别的 es5 代码

经过如上的步骤之后，我们代码的性能和兼容性提高了，然后由于转换后的代码和源代码的不同，会导致我们的开发调试变得很困难，SourceMap 的诞生就是为了解决如上问题的。

简而言之，SourceMap 就是一个储存着代码位置信息的文件，转换后的代码的每一个位置，所对应的转换前的位置。有了它，点击浏览器的控制台报错信息时，可以直接显示出错源代码位置而不是转换后的代码。
```js
devtool: false; // 一般用于production环境，没有sourcemap映射。
```

## SourceMap设置devtool:false
开发环境(development)和生产环境(production)的构建目标差异很大。在开发环境中，我们需要具有强大的、具有实时重新加载(live reloading)或热模块替换(hot module replacement)能力的 source map 和 localhost server。而在生产环境中，我们的目标则转向于关注更小的 bundle，更轻量的 source map，以及更优化的资源，以改善加载时间。由于要遵循逻辑分离，我们通常建议为每个环境编写彼此独立的 webpack 配置。


mode模式，生产环境需配置为developmet，开发则设置为production;

devtool的souremap；

devServer，开发环境需要配置跨域代理转发，而生产环境不需要；

代码分割，开发环境下不需要这个；

HRM，生产环境不需要这个，只要开发环境需要，而且这个容易与代码分割产生冲突，如果你生产环境及设置了代码分割又设置了HRM就会失效

- source-map：会单独生成相应的main.js.map文件。如：
- cheap-source-map：没有列的映射，忽略loader的sourcemap。
- cheap-module-source-map：没有列映射的.map文件，且loader的sourcemap只包含对应行的。

### 如何选择 devtool? production官方推荐的 devtool 有4种：
线上环境没有绝对的最优选择一说，根据自己业务需要去选择即可，很多项目也是选择除上述4种之外的 cheap-module-source-map 选项。
* none
* source-map
* hidden-source-map
* nosources-source-map

### 如何选择 devtool? development环境
开发环境选择就比较容易了，只需要考虑打包速度快、调试方便，官方推荐以下4种：

- eval
- eval-source-map
- eval-cheap-source-map
- eval-cheap-module-source-map
大多数情况下我们选择 eval-cheap-module-source-map 即可。

### SourceMap实战：
```javaScript
module.exports = function (webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  ...

  return {
    target: ['browserslist'],
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    // Stop compilation early in production
    bail: isEnvProduction,

    // devtool: false,
    /*
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',
    */
  }

  ...

}
```

## 2.去掉开发环境下的配置,不需要热加载这类只用于开发环境的东西。
```
https://www.webpackjs.com/guides/production/
```




### 方式 1.js 压缩
```
实际上 webpack4.0 默认是使用 terser-webpack-plugin 这个压缩插件，在此之前是使用 uglifyjs-webpack-plugin，

两者的区别是后者对 ES6 的压缩不是很好，同时我们可以开启 parallel 参数，使用多进程压缩，加快压缩。
```

```js
// config/webpack.common.js
const TerserPlugin = require("terser-webpack-plugin");
// ...
const commonConfig = {
  // ...
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: 4, // 开启几个进程来处理压缩，默认是 os.cpus().length - 1
      }),
    ],
  },
  // ...
};
```

### 方式 2：压缩 CSS

我们可以借助 optimize-css-assets-webpack-plugin 插件来压缩 css，其默认使用的压缩引擎是 cssnano。 具体使用如下：

```js
// config/webpack.prod.js
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
// ...
const prodConfig = {
  // ...
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: /\.optimize\.css$/g,
        cssProcessor: require("cssnano"),
        cssProcessorPluginOptions: {
          preset: ["default", { discardComments: { removeAll: true } }],
        },
        canPrint: true,
      }),
    ],
  },
};
```

### 方式 3：图片压缩

借助 image-webpack-loader 帮助我们来实现。它是基于 imagemin 这个 Node 库来实现图片压缩的。
只要在 file-loader 之后加入 image-webpack-loader 即可:

```js
// config/webpack.common.js
// ...
module: {
  rules: [
    {
      test: /\.(png|jpg|gif)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[name]_[hash].[ext]",
            outputPath: "images/",
          },
        },
        {
          loader: "image-webpack-loader",
          options: {
            // 压缩 jpeg 的配置
            mozjpeg: {
              progressive: true,
              quality: 65,
            },
            // 使用 imagemin**-optipng 压缩 png，enable: false 为关闭
            optipng: {
              enabled: false,
            },
            // 使用 imagemin-pngquant 压缩 png
            pngquant: {
              quality: "65-90",
              speed: 4,
            },
            // 压缩 gif 的配置
            gifsicle: {
              interlaced: false,
            },
            // 开启 webp，会把 jpg 和 png 图片压缩为 webp 格式
            webp: {
              quality: 75,
            },
          },
        },
      ],
    },
  ];
}
// ...
```
