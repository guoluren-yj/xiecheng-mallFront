const babelConfigFactory = require('hzero-boot/lib/babelConfigFactory');

let babelConfig = babelConfigFactory();
if (process.env.MULTIPLE_SKIN_ENABLE === 'true') {
  const { generateC7nUiConfig, generateHzeroUIConfig } = require('@hzero-front-ui/cfg/lib/utils/uedConfig')
  // const uedConfig = require('hzero-front/lib/utils/uedUtils');
  babelConfig.plugins = ([
    ...generateHzeroUIConfig(),
    ...generateC7nUiConfig(),
    ...babelConfig.plugins.filter(([_1, _2, pName] = []) => !['ant', 'c7n', 'c7n-pro'].includes(pName)),
  ]);
}
babelConfig.plugins = [
  'module:mall-front-babel-directive',
  ...babelConfig.plugins,
  [
    'module-resolver',
    {
      alias: {
        '@': './src',
        cuxTools: './src/cuxTools',
        components: './src/components',
        hooks: './src/hooks',
        utils: './src/utils',
        routes: './src/routes',
        services: './src/services',
        Hcomponents: 'hzero-front/lib/components',
        Hutils: 'hzero-front/lib/utils',
        Hservices: 'hzero-front/lib/services',
      },
    },
  ],
]
module.exports = babelConfig;

