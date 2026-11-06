const babelConfigFactory = require('hzero-boot/lib/babelConfigFactory');

let babelConfig = babelConfigFactory();
if (process.env.MULTIPLE_SKIN_ENABLE === 'true') {
  const {
    generateC7nUiConfig,
    generateHzeroUIConfig,
  } = require('@hzero-front-ui/cfg/lib/utils/uedConfig');
  // const uedConfig = require('hzero-front/lib/utils/uedUtils');
  babelConfig.plugins = [
    ...generateHzeroUIConfig(),
    ...generateC7nUiConfig(),
    ...babelConfig.plugins.filter(
      ([_1, _2, pName] = []) => !['ant', 'c7n', 'c7n-pro'].includes(pName)
    ),
  ];
}
babelConfig.plugins = [
  'module:mall-front-babel-directive',
  ...babelConfig.plugins,
  [
    'module-resolver',
    {
      alias: {
        '@': 'mall-front/lib',
        cuxTools: 'mall-front/lib/cuxTools',
        components: 'mall-front/lib/components',
        hooks: 'mall-front/lib/hooks',
        utils: 'mall-front/lib/utils',
        routes: 'mall-front/lib/routes',
        services: 'mall-front/lib/services',
      },
    },
  ],
];
module.exports = babelConfig;
