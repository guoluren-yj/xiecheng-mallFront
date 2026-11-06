import { useEffect } from 'react';
import qs from 'qs';
import { isEmpty } from 'lodash';

import { querySettings, fetchCommonConfig, fetchAddressConfig } from 'services/api';
import { getUserConfigInfo } from 'utils/utils';
import useOMScheck from '@/hooks/useOMScheck';
import intl from '@/utils/intl';
import { fetchHotWord } from 'services/headerService';

const toErrorPage = (history, params) => {
  history.push({
    pathname: '/pub/forbidden',
    state: params,
  });
};

export default function UseUserConfig(params) {
  const {
    history,
    location,
    dispatch,
    userInfo, // self 数据
    webConfig,
    mallType,
  } = params;

  useEffect(() => {
    const { userConfigErrorCache } = getUserConfigInfo();
    if (!isEmpty(userConfigErrorCache)) {
      // 错误信息的缓存
      toErrorPage(history, userConfigErrorCache);
    }
  }, [location.pathname]);

  useEffect(() => {
    getLoginInfo(userInfo);
    delayInfo(userInfo);
    if (mallType !== 'sigl') {
      useOMScheck({ history, location });
    }
    if (location.pathname === `/pub`) {
      const previewInfo = qs.parse(window.location.search.substr(1));
      dispatch({
        type: 'global/update',
        payload: { previewInfo },
      });
    }
  }, []);

  /**
   * 不重要的全局配置
   */
  function delayInfo() {
    setTimeout(() => {
      // 配置中心
      querySettings().then((settings) => {
        dispatch({
          type: 'global/update',
          payload: {
            settings,
          },
        });
      });
      // 热词搜索
      fetchHotWord().then((res) => {
        dispatch({
          type: 'global/update',
          payload: {
            hotWord: res || [],
          },
        });
      });
    }, 600);
  }

  function getCommonConfig({ userConfig }) {
    // 通用业务规则定义接口(根据companyId区分)
    fetchCommonConfig({ companyId: userConfig.companyId, unitId: userConfig.unitId }).then(
      (resp) => {
        if (resp) {
          dispatch({
            type: 'global/update',
            payload: {
              ...resp,
              pointName: resp?.pointName || intl.get('mallf.common.view.sigl.name').d('积分'),
            },
          });
          sessionStorage.setItem('comOrPersonRule', Number(resp?.enableCreateReceiverAddress)); // 是否启用个人收货地址
          sessionStorage.setItem(
            'comOrPersonInvoiceRule',
            Number(resp?.enableCreateInvoiceAddress)
          ); // 是否启用个人收单地址
        }
      }
    );
  }

  /**
   * 登录状态下需要查询的接口
   */
  function getLoginInfo(res) {
    if (mallType === 'sigl') {
      const { defaultLogoPath } = webConfig;
      dispatch({
        type: 'global/update',
        payload: {
          webConfig: { ...webConfig, logoPath: defaultLogoPath },
        },
      });
      // 通用业务规则定义接口(根据companyId区分)
      fetchCommonConfig().then((resp) => {
        if (resp) {
          dispatch({
            type: 'global/update',
            payload: {
              ...resp,
              pointName: resp?.pointName || intl.get('mallf.common.view.sigl.name').d('积分'),
            },
          });
          sessionStorage.setItem('comOrPersonRule', Number(resp?.enableCreateReceiverAddress)); // 是否启用个人收货地址
          sessionStorage.setItem(
            'comOrPersonInvoiceRule',
            Number(resp?.enableCreateInvoiceAddress)
          ); // 是否启用个人收单地址
        }
      });
    } else {
      const { userConfig, purchaseUnit } = getUserConfigInfo();
      getCommonConfig({ userConfig, purchaseUnit });
      if (userConfig.companyId) {
        // 地址配置
        fetchAddressConfig(res.organizationId, userConfig.companyId).then((result) => {
          dispatch({
            type: 'global/update',
            payload: { addressPermission: result },
          });
        });
      }
    }
  }
}
