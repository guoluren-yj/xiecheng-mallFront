import { fetchSelf, getWebUrlConfig, fetchPermission } from 'services/api';
import { FOOTER_PADDING_BOTTOM } from 'utils/constants';
import theme from '../config/theme';

function getGlobalModalConfig() {
  return {
    namespace: 'global',
    state: {
      mallType: window.location.pathname?.startsWith('/sigl') ? 'sigl' : 'default',
      channel: window.location.pathname?.startsWith('/sigl') ? 'PERSONAL' : 'ENTERPRISE',
      routerData: {},
      unitList: [], // 采买组织列表
      settings: {}, // 配置中心
      purchaseTypeConfig: false, // 是否配置个人采买
      needLanguage: undefined, // 是否需要多语言
      userInfo: {}, // 账号信息
      userConfig: {}, // 选买配置
      userConfigVersion: {}, // 带版本号的选买配置
      showMiniCart: false, // 加载小购物车
      language: 'zh_CN', // 多语言，默认中文
      languageName: '简体中文', // 多语言，默认中文
      webConfig: {}, // 二级域名的配置信息
      visitConfig: {}, // 浏览配置
      isMixTenant: undefined, // 当前是否为混合部署的租户
      addressPermission: '', // 当前地址编辑权限
      ecServiceList: [], // 商城当前对接电商
      theme, // 颜色
      purchaseUnit: {}, // 采买组织数据
      sprmOldLinkFlag: 0, // 默认跳转新协同的链接
      constants: {
        footerPaddingBottom: FOOTER_PADDING_BOTTOM,
      },
      defaultAddress: {},
      custWebConfig: {},
    },
    effects: {
      *initSelf(_, { call }) {
        const userInfo = yield call(fetchSelf);
        return userInfo;
      },
      *initWebConfig({ payload }, { call }) {
        const webConfig = yield call(getWebUrlConfig, payload);
        return webConfig;
      },
      *getPermission({ payload }, { call, put }) {
        const permissions = yield call(fetchPermission, payload);
        if (permissions) {
          yield put({
            type: 'update',
            payload: {
              ...permissions,
            },
          });
        }
        return permissions;
      },
    },
    reducers: {
      update(state, { payload }) {
        return {
          ...state,
          ...payload,
        };
      },
    },
  };
}

export { getGlobalModalConfig };

export default getGlobalModalConfig();
