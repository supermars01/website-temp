/**
 * webpack 基础配置
 */
const webpack = require('webpack');

const fs = require('fs')
const glob = require('glob')
const path = require("path");
// 引入模板插件
const HTMLWebpackPlugin = require("html-webpack-plugin");
// 引入 DllReferencePlugin
// const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');

// 引入 autodll-webpack-plugin
// const AutoDllPlugin = require('autodll-webpack-plugin');
//开启自动webpack包缓存，默认存储在 /node_modules/下
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
//  环境变量
const env = process.env.NODE_ENV
// 提取js中的css
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
//生成icon雪碧图
const WebpackSpritesmithPlugin = require('webpack-spritesmith')
//去除冗余css样式
const PurifyCssWebpack = require('purifycss-webpack')
//开启多线池
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({
  size: os.cpus().length
});
// 引入config.js
const config = require("./config");
// 通过 html-webpack-plugin 生成的 HTML 集合
let HTMLPlugins = [];
// 入口文件集合
let Entries = {}

// 生成多页面的集合
config.HTMLDirs.forEach((page) => {
  const htmlPlugin = new HTMLWebpackPlugin({
    filename: `${page}.html`,
    template: 'html-withimg-loader!' + path.resolve(__dirname, `../src/views/${page}/${page}.html`),
    chunks: [page, 'commons'],
    minify: {
      "removeAttributeQuotes": true, // 去除属性引用
      "removeComments": true, // 移除HTML中的注释
      'collapseWhitespace': true, // 折叠空白区域 也就是压缩代码
      "removeEmptyAttributes": true,
    }
  });
  HTMLPlugins.push(htmlPlugin);
  Entries[page] = path.resolve(__dirname, `../src/views/${page}/${page}.js`);
})

module.exports = {
  // 入口文件
  entry: Entries,
  // 启用 sourceMap
  devtool: "cheap-module-source-map",
  // 输出文件
  output: {
    filename: env === 'prod' // webpack热更新和chunkhash有冲突,在开发环境下使用hash模式
      ?
      "js/[name].[chunkhash:8].js" : "js/[name].[hash:8].js",
    path: path.resolve(__dirname, "../dist"),
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js'], // 配置简写，配置过后，书写该文件路径的时候可以省略文件后缀
    alias: {
      // 'src': path.resolve(__dirname, 'src'),
      '~@': path.resolve(__dirname, '../src'),
      'views': path.resolve(__dirname, '../src/views'),
      'assets': path.resolve(__dirname, '../src/assets'),
      'common': path.resolve(__dirname, '../src/common'),
      'tpl': path.resolve(__dirname, '../src/tpl')
    }
  },
  // 加载器
  module: {
    rules: [{
        test: /\.html$/,
        include: /src/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: true,
            attrs: ['img:src', 'img:data-src', 'link:href', 'audio:src', 'video:src', 'source:src'],
            interpolate: true
          }
        }]
      },
      {
        // 对 css 后缀名进行处理
        test: /\.css$/,
        // 不处理 node_modules 文件中的 css 文件
        exclude: /node_modules/,
        /* link打包之后引入对应的css形式(dev模式下为内嵌style形式) */
        // use: [
        //   env === 'prod' ? MiniCssExtractPlugin.loader : 'style-loader',
        //   'css-loader'
        // ]
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1 //处理css文件中的@import,为1:用postcss-loader，为2:用postcss-loaders和sass-loader。
            }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1 //处理css文件中的@import,为1:用postcss-loader，为2:用postcss-loaders和sass-loader。
            }
          },
          'postcss-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'happypack/loader?id=happyBabel'
        }],
      },
      //暴露$和jQuery到全局
      // {
      //   test: require.resolve('jquery'), //require.resolve 用来获取模块的绝对路径
      //   use: [{
      //     loader: 'expose-loader',
      //     options: '$'
      //   }]
      // },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        include: /src/,
        use: [{
          loader: "url-loader",
          options: {
            limit: 100,
            // 打包生成图片的名字
            name: "image/[name].[hash].[ext]",
          }
        }, {
          loader: 'image-webpack-loader',
          query: {
            progressive: true,
            optimizationLevel: 7,
            interlaced: false,
            pngquant: {
              quality: [0.65, 0.90],
              speed: 4
            }
          }
        }],
      },
      // {
      //   test: /\.(woff|woff2|eot|ttf|otf)$/,
      //   include: /src/,
      //   use: ["url-loader"]
      // }
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 5 * 1024,
            publicPath: '../fonts',
            outputPath: 'fonts'
          }
        }]
      },
    ],
  },
  // 插件
  plugins: [
    // new webpack.BannerPlugin('Created by YourName.')
    // 自动生成 HTML 插件
    ...HTMLPlugins,
    // // 消除冗余的css代码
    // new PurifyCssWebpack({
    //   paths: glob.sync(path.join(__dirname, '../src/page/*.html'))
    // }),
    // 从js中提取css配置
    new MiniCssExtractPlugin({
      filename: env == 'prod' ? 'css/[name].[contenthash:8].css' : '[name].css',
      chunkFilename: env == 'prod' ? 'css/[name].[contenthash:8].css' : '[name].css',
      allChunks: true
    }),
    //全局注册jquery
    // new webpack.ProvidePlugin({
    //   $: 'jquery',
    //   jQuery: 'jquery',
    //   jquery: 'jquery',
    //   'window.jQuery': 'jquery'
    // }),
    // 雪碧图插件
    new WebpackSpritesmithPlugin({
      // 目标小图标
      src: {
        // 小图标路径
        cwd: path.resolve(__dirname, '../src/assets/icon'),
        // 匹配小图标文件后缀名
        glob: '*.png'
      },
      target: {
        // 生成雪碧图(大图)文件存放路径
        image: path.resolve(__dirname, '../src/sprites/sprites.png'),
        // 对应的样式文件存放路径
        css: path.resolve(__dirname, '../src/sprites/sprites.css')
      },
      // 样式文件中,调用雪碧图的写法????
      apiOptions: {
        cssImageRef: './sprites.png'
      },
      // 雪碧图生成算法
      spritesmithOptions: {
        algorithm: 'top-down', // 从上到下生成方向.
        padding: 2 // 每个小图标之间的间隙
      },
      //自动适配视网膜二倍屏
      retina: '@2x'
    }),
    new HardSourceWebpackPlugin({
      // cacheDirectory是在高速缓存写入。默认情况下，将缓存存储在node_modules下的目录中，因此如 
      // 果清除了node_modules，则缓存也是如此
      cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/hard-source/[confighash]'),
      // Either an absolute path or relative to webpack's options.context.
      // Sets webpack's recordsPath if not already set.
      configHash: function (webpackConfig) {
        return require('node-object-hash')({
          sort: false
        }).hash(webpackConfig);
      },
      recordsPath: path.resolve(__dirname, '../node_modules/.cache/hard-source/[confighash]/records.json'),
      // configHash在启动webpack实例时转换webpack配置，并用于cacheDirectory为不同的webpack配 
      // 置构建不同的缓存
      configHash: function (webpackConfig) {
        // node-object-hash on npm can be used to build this.
        return require('node-object-hash')({
          sort: false
        }).hash(webpackConfig);
      },
      // 当加载器，插件，其他构建时脚本或其他动态依赖项发生更改时，hard-source需要替换缓存以确保输 
      // 出正确。environmentHash被用来确定这一点。如果散列与先前的构建不同，则将使用新的缓存
      environmentHash: {
        root: process.cwd(),
        directories: [],
        files: ['package-lock.json', 'yarn.lock'],
      },
      info: {
        mode: 'none',
        // 'debug', 'log', 'info', 'warn', or 'error'.
        level: 'debug',
      },
      cachePrune: {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        sizeThreshold: 50 * 1024 * 1024
      }
    }),
    new HardSourceWebpackPlugin.ParallelModulePlugin({
      // How to launch the extra processes. Default:
      fork: (fork, compiler, webpackBin) => fork(
        webpackBin(),
        ['--config', __filename], {
          silent: true,
        }
      ),
      // Number of workers to spawn. Default:
      numWorkers: () => require('os').cpus().length,
      // Number of modules built before launching parallel building. Default:
      minModules: 10,
    }),
    //开启多线池
    new HappyPack({
      //用id来标识 happypack处理那里类文件
      id: 'happyBabel',
      //如何处理  用法和loader 的配置一样
      loaders: [{
        loader: 'babel-loader',
        cache: true,
        options: {
          presets: ['env']
        }
      }],
      //共享进程池
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: true,
      //verboseWhenProfiling: Boolean 开启webpack --profile ,仍然希望HappyPack产生输出。
      //debug: Boolean 启用debug 用于故障排查。默认 false。
    })
  ]
}