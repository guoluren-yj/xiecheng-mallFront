const WebpackThemeColorReplacer = require('webpack-theme-color-replacer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const child = require('child_process');

const path = require("path");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const A = require('./src/config/theme')['primary-color'];
const B = require('./src/config/theme')['primary-hover-color'];
const C = require('./src/config/theme')['primary-bg-color'];

const cssColorFileName = 'theme-colors.css';

const changeSelector = (selector, util) => {
  // 可以替换有问题的样式 不过替换的都在uiStyle，不用这个
  switch (selector) {
    default:
      return selector;
  }
};

module.exports = {
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  webpackConfig: (config, webpackConfigType) => {
    // webpack 配置修改
    // console.log(webpackConfigType); // string webpack配置类型: 'dll' | 'base' | 'ms' ;
    if (webpackConfigType !== 'dll') {
      const CLIENT_ENV_LIST = JSON.parse(process.env.CLIENT_ENV_LIST) || [];
      const row = CLIENT_ENV_LIST.reduce((env, key) => {
        env[key] = process.env[key];
        return env;
      }, {
        NODE_ENV: process.env.NODE_ENV || 'development',
      });
      const envStr = `window.$$env = Object.freeze(${JSON.stringify(row)})`;
      config.plugins = [
        new WebpackThemeColorReplacer({
          changeSelector,
          fileName: cssColorFileName,
          matchColors: [A, B, C],
          injectCss: true,
          isJsUgly: process.env !== 'development',
        }),
        // new BundleAnalyzerPlugin(),
        ...config.plugins,
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname,"./public/index.html"),
          env: envStr,
        }),
      ];
    }
    return config;
  },
  // ...config.plugins,
  // alias: {}, // webpack alias 配置, alias 的值可以是 string 表示指向配置文件
  // theme: {}, // less 变量配置, theme 的值可以是 string 表示指向配置文件
  // hzeroBoot: 'hzero-boot/lib/pathInfo', // hzero入口文件信息配置
  dllConfig: {
    // dllConfig 配置
    common: {
      priority: 100,
      packages: [
        'react',
        'react-dom',
        'dva',
        'dva/router',
        'dva/saga',
        'dva/fetch',
        'core-js',
        'lodash',
        'lodash-decorators',
        'react-intl-universal',
      ],
    },
    // vendorsGraph: {
    //   packages: ['echarts', 'bizcharts', '@antv/data-set'],
    // },
    // vendors: {
    //   packages: [
    //     'lodash',
    //     'lodash-decorators',
    //     'react-intl-universal',
    //     'axios',
    //     'uuid',
    //     'numeral',
    //     'react-cropper',
    //     'cropperjs',
    //   ],
    // },
  },

  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      // commons: {
      //   name: 'commons',
      //   chunks: 'initial',
      //   priority: 3,
      //   minChunks: 2,
      // },
      // libs: {
      //   // 基本框架
      //   chunks: 'all',
      //   test: new RegExp(
      //     '(react-dom-router|codemirror|jsplumb|react-viewer|react-dnd|react-dnd-html5-backend)'
      //   ),
      //   priority: 100,
      //   name: 'libs',
      // },
      // 'hzero-front-components': {
      //   // 基本框架
      //   chunks: 'all',
      //   test: new RegExp('hzero-front/lib/components'),
      //   priority: 100,
      //   name: 'hzero-front-components',
      // },
      // 'srm-front-boot': {
      //   // 基本框架
      //   chunks: 'all',
      //   test: new RegExp('srm-front-boot/lib'),
      //   reuseExistingChunk: true,
      //   priority: 90,
      //   name: 'srm-front-boot',
      // },
      'async-comons': {
        // 其余异步加载包
        chunks: 'async',
        minChunks: 5,
        name: 'async-comons',
        priority: 99,
      },
      styles: {
        name: 'styles',
        test: /\.css|less$/,
        chunks: 'all',
        enforce: true,
        priority: 20,
      },
    },
  },
};
