const paths = require('hzero-webpack-scripts/config/paths');
const path = require('path');
const fs = require('fs');

// 除hzero-front外的alias走lib
const aliasConfig = {
  '@': fs.existsSync(path.resolve(paths.appPath, 'src'))
    ? path.resolve(paths.appPath, 'src')
    : path.resolve(paths.appPath, 'lib'),
  'hzero-front/lib/index': 'hzero-boot/lib/entry/root/emptyRouter',
  'hzero-boot-customize-init-config': `${path.resolve(paths.appRootPath, './src')}/overwrite`,
  components: './src/components',
  utils: './src/utils',
  services: './src/services',
};

module.exports = aliasConfig;
