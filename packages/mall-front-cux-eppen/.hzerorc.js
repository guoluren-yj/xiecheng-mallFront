const WebpackThemeColorReplacer = require('webpack-theme-color-replacer');

const A = require('mall-front/lib/config/theme')['primary-color'];
const B = require('mall-front/lib/config/theme')['primary-hover-color'];
const C = require('mall-front/lib/config/theme')['primary-bg-color'];

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
      config.plugins = [
        new WebpackThemeColorReplacer({
          changeSelector,
          fileName: cssColorFileName,
          matchColors: [A, B, C],
          injectCss: true,
          isJsUgly: process.env !== 'development',
        }),
        ...config.plugins,
      ];
    }
    return config;
  },
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
  },
  
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
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
