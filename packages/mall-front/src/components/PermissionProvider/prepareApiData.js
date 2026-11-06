import { isEmpty } from 'lodash';

import Swal from 'components/swal';
import { changeFavicon, getOrganizationId, getCookie, removeCookie } from 'utils/utils';
import { clearCacheAddress } from 'utils/getCacheAddress';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import { openInitPurchaseModal } from 'utils/modals';
import { prepareApi } from '@/services/api';
import favion from '@/assets/favicon/favicon.ico';
import initIntl from '@/hooks/useIntl';
import CuxFn from '@/cuxTools/cuxFn';

let userConfigErrorCache = {}; // 错误信息的缓存

const toErrorPage = (params) => {
  const history = getDvaApp()._history;
  history.push({
    pathname: '/pub/forbidden',
    state: params,
  });
};

function getPermission(data) {
  const { memberPermission, enterprisePermission, defaultChannel } = data;
  getDvaApp()._store.dispatch({
    type: 'global/update',
    payload: {
      memberPermission,
      enterprisePermission,
    },
  });
  // 企业购和会员购权限都有
  if (memberPermission && enterprisePermission) {
    // 第一次默认进入会员购
    if (
      getCookie('isFirstVisit') &&
      defaultChannel === 'PERSONAL' &&
      !window.location.pathname?.startsWith('/sigl')
    ) {
      window.location.href = '/sigl';
    }
  } else if (memberPermission) {
    // 只有会员购权限
    if (!window.location.pathname?.startsWith('/sigl')) {
      window.location.href = '/sigl';
    }
  } else if (enterprisePermission) {
    // 只有企业购权限
    if (window.location.pathname?.startsWith('/sigl')) {
      window.location.href = '/';
    }
  }
}

function getMenuId(data) {
  const { menuId } = data;
  const currentPath = window.location.pathname;
  window.menuCache = window.menuCache || {};
  if (!window.menuCache[currentPath]) {
    window.menuCache[currentPath] = menuId;
  }
}

function getWebConfig(data) {
  const { newPageConfigDTO = {} } = data;
  // 更换ico
  changeFavicon(newPageConfigDTO?.iconUrl || favion);
  getDvaApp()._store.dispatch({
    type: 'global/update',
    payload: {
      webConfig: {
        ...(newPageConfigDTO || {}),
        colorCode: newPageConfigDTO?.topicColor || 'A',
        isSecondWebSite: !isEmpty(newPageConfigDTO),
        defaultLogoPath: newPageConfigDTO?.logoUrl,
        srmUrl: newPageConfigDTO?.localSrmUrl || newPageConfigDTO?.srmUrl,
        logoPath: newPageConfigDTO?.logoUrl,
      },
    },
  });
}

function getUserConfig(data) {
  const { userConfigDTO } = data;
  const { dispatch } = getDvaApp()._store;
  const history = getDvaApp()._history;
  // 已登录，有配置，非首次进入商城
  const userConfig = {
    companyId: userConfigDTO?.companyId,
    companyName: userConfigDTO?.companyName,
    ouId: userConfigDTO?.ouId,
    ouName: userConfigDTO?.ouName,
    ouCode: userConfigDTO?.ouCode,
    invoiceOrgId: userConfigDTO?.invOrganizationId,
    invoiceOrgName: userConfigDTO?.invOrganizationName,
    purchaseOrgId: userConfigDTO?.purchaseOrgId,
    purchaseOrgName: userConfigDTO?.purchaseOrgName,
    purchaseOrgCode: userConfigDTO?.purchaseOrgCode,
    purchaseType: userConfigDTO?.purchaseType,
    levelPath: userConfigDTO?.levelPath,
    unitId: userConfigDTO?.unitId,
    unitName: userConfigDTO?.unitName,
    _token: userConfigDTO?._token,
    unitCode: userConfigDTO?.unitCode,
  };
  dispatch({
    type: 'global/update',
    payload: {
      userConfig,
      purchaseUnit: userConfigDTO || {},
      userConfigVersion: userConfigDTO || {},
    },
  });
  /**
   * 无采买组织信息时提示
   */
  const alertEmptyInfoTips = CuxFn({
    name: 'useUserConfig-fn-alertEmptyInfoTips',
    value: {
      data: userConfigDTO || {},
      error: {
        successFlag: data.successFlag,
        errorMsg: data.errorMsg,
      },
    }, // 立讯二开此提示
  })(() => {
    if (+userConfigDTO?.bizErrorFlag === 1) {
      userConfigErrorCache = userConfigDTO || {};
    } else if (location.pathname === '/pub/forbidden') {
      history.push('/');
    }
    if (+userConfigDTO?.bizErrorFlag !== 1 && data?.successFlag !== 1) {
      Swal(data?.errorMsg);
    }
  });
  alertEmptyInfoTips();
}

const loadingObj = {
  intlLoading: true,
  apiLoading: true,
};

function getDetailFlag(data) {
  getDvaApp()._store.dispatch({
    type: 'global/update',
    payload: {
      newProductDetailFlag: data?.productDetailGrayscale || 0,
    },
  });
}

function getDimensionConfig(data) {
  const { dimensionConfig = {} } = data || {};
  const currentFieldList = data?.dimensionConfig?.unitDimensionList
    ?.filter((p) => +p.showFlag === 1)
    ?.sort((a, b) => a.orderSeq - b.orderSeq)
    ?.map((p) => {
      return {
        dimensionType: p.dimensionType,
        name: p.dimensionCode,
        label: p.dimensionType === 'FIXED' ? p.dimensionCodeMeaning : p.customDimensionName,
        lovCode: p.inputLovCode,
        type: 'object',
        required: true,
        editFlag: p.editFlag,
        disabled: !p.editFlag,
        lovPara: { tenantId: getOrganizationId() },
        lovViewInfo: p.lovView,
      };
    });
  getDvaApp()._store.dispatch({
    type: 'global/update',
    payload: {
      unitDimensionData: {
        ...dimensionConfig,
        currentList: currentFieldList,
      },
    },
  });
}

export function getUnitChoose(data) {
  const { userConfigDTO, isNewCart, memberPermission, enterprisePermission } = data || {};
  // 仅有会员购权限 不需要管采买组织报错
  if (+userConfigDTO?.bizErrorFlag === 1 && !(memberPermission && !enterprisePermission)) {
    if (+isNewCart === 1) {
      getDvaApp()._history.push({ pathname: '/' });
      openInitPurchaseModal({ purchaseUnit: userConfigDTO });
    } else {
      getDvaApp()._history.push({
        pathname: '/pub/forbidden',
        state: userConfigDTO,
      });
    }
  }
}

export default function prepareApiData({ setLoading, userInfo }) {
  function checkLoading(type) {
    loadingObj[type] = false;
    if (!loadingObj.apiLoading && !loadingObj.intlLoading) {
      setLoading(false);
    }
  }

  // 初始化多语言
  initIntl(
    userInfo.language,
    [
      'mallf.header',
      'hzero.common',
      'mallf.common',
      'mallf.myMall',
      'himp.commentImport',
      'hmsg.userMessage',
      'mcux.common',
    ],
    () => {
      checkLoading('intlLoading');
      getDvaApp()._store.dispatch({
        type: 'global/update',
        payload: {
          language: userInfo.language,
          languageName: userInfo.languageName,
        },
      });
    },
    true
  );

  prepareApi()
    .then((res) => {
      if (!isEmpty(res)) {
        // acceptableFlag=0 & successFlag = 0 进缺省页
        if (res.acceptableErrorFlag === 0 && res.successFlag === 0) {
          throw new Error(res.errorMsg);
        }
        getPermission(res); // 处理会员购权限
        getMenuId(res); // menuId
        getWebConfig(res); // 二级域名配置
        getUserConfig(res); // 采买组织信息
        getDetailFlag(res); // 新老商品详情
        getDimensionConfig(res); // 组织维度查询
        getUnitChoose(res); // 选择才买组织
        getDvaApp()._store.dispatch({
          type: 'global/update',
          payload: {
            ...res,
            custWebConfig: res?.personalConfig || {}, // 首页个性化配置
            productSearchTypeConfig: res?.productSearchTypeConfig || {}, // 搜索条件
            pickSupplierFlag: res?.pickSupplierFlag, // 是否开启了甄选专区等平台商品推荐功能
            unreadMessageCount: res?.unreadMessageCount, // 查询未读消息
            isMixTenant: res?.mixDeploymentFlag, // 查询是否为混合部署租户
            customerServiceType: res?.customerServiceType, // 智能客服类型
            readPrivacyFlag: res?.readPrivacyFlag, // 阅读隐私协议标识
            doubleUomFlag: res.doubleUomFlag, // 是否开启双单位
            sprmOldLinkFlag: res?.sprmOldLinkFlag, // 跳转srm新/老需求创建
          },
        });
        removeCookie('isFirstVisit');
        clearCacheAddress(res); // 清除缓存地址
        CuxFn({ name: 'prepare-fn-afterQueryPermission' })(() => {})(); // 五菱二开查询权限配置
      }
      checkLoading('apiLoading');
    })
    .catch((e) => {
      checkLoading('apiLoading');
      userConfigErrorCache = {
        status: e.status,
        message: e.message,
      };
      getDvaApp()._store.dispatch({
        type: 'global/update',
        payload: {
          userConfigErrorCache,
          webConfig: {
            colorCode: 'A',
            isSecondWebSite: true,
            userConfig: {
              message: e.message,
            },
          },
        },
      });
      toErrorPage({
        status: e.status,
        message: e.message,
      });
    });
}
