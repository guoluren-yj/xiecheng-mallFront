const path = require('path');
const { generateTheme } = require('antd-theme-generator');

const options = {
  stylesDir: path.join(__dirname, './src/utils'), // 无less的文件夹，此方案仅用来处理hzero-ui
  antDir: path.join(__dirname, './node_modules/antd'),
  varFile: path.join(__dirname, './src/variables.less'),
  mainLessFile: path.join(__dirname, './src/index.less'),
  themeVariables: [
    // 需要动态切换的主题变量
    '@primary-color', // 主题色
  ],
  indexFileName: 'index.html',
  outputFilePath: path.join(__dirname, './public/color.less'),
};

generateTheme(options)
  .then(() => {
    console.log('Theme generated successfully');
  })
  .catch(error => {
    console.log('Error', error);
  });
