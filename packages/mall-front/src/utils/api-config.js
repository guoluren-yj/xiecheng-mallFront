const { changeAPIHOST } = require('./changeAPIHost');
const packageJson = require('../../../../package.json');

const config = {};
config.appId = 213719;
config.testField = 'testField';
config.contextPath = '';
config.srmPath = process.env.SRM_HOST || '';
config.basePath = '';
// process.env.BASE_PATH && process.env.BASE_PATH !== 'undefined' ? process.env.BASE_PATH : '';
config.oauthPath = process.env.SRM_HOST?.endsWith('/app')
  ? process.env.SRM_HOST?.replace('/app', '')
  : process.env.API_HOST;
config.socketHost = process.env.MALL_WEBSOCKET_HOST;
config.portalPath = `${process.env.API_HOST}/oauth/public/default/register.html` || '';
config.apiGateway = changeAPIHOST(process.env.API_HOST) || '';
config.clientId = process.env.CLIENT_ID || '';
// config.loginTemplate = process.env.LOGIN_TEMPLATE || '';
config.mockGateway = 'api/mock';
config.serviceName = 'smal';
config.proServiceName = 'smpc';
config.ecServiceName = 'scei';
config.omsServiceName = 'smodr';
config.prefixImgUrl = 'https://img13.360buyimg.com';
config.zkhImgUrl = 'https://pathfinder-private.oss-cn-shanghai.aliyuncs.com/'; // 震坤行图片头
config.searchService = 'sads';
config.agreementService = 'sagm';
config.productService = 'smpc';
config.siglService = 'sigl';
config.newCartService = 'smct';
config.HZERO_PLATFORM = '/hpfm';
config.SMALL_MARKET = '/smkt';
config.wishService = 'smkt';
config.jdecService = 'smec';

window.mallVersion = packageJson.version;
window.buildTime = '9.23-17.02';
window.MALL_AUTO_API_HOST = process.env.MALL_AUTO_API_HOST;

module.exports = config;
