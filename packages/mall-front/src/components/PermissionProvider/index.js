import { connect } from 'dva';
import React from 'react';
import qs from 'qs';
import { isEmpty } from 'lodash';

import { oauthPath, clientId, basePath } from 'utils/api-config';
import swalAlert from 'components/swal';
import Loading from 'components/loading';
import intl from 'utils/intl';
import {
  extractAccessTokenFromHash,
  removeAccessToken,
  setAccessToken,
  setCookie,
  getCookie,
  logoutRemoveData,
  getAccessToken,
  changeFavicon,
  getRedirectName,
} from 'utils/utils';
import { getRouterData } from '@src/utils/router';
import favion from '@/assets/favicon/favicon.ico';
import prepareApiData from './prepareApiData';
import { runSingleRecordFunc } from '@/hooks/useSingleRecord';

const currentUrl = window.location.origin;
@connect(({ loading, global }) => ({
  mallType: global.mallType,
  selfLoading: loading.effects['global/initSelf'],
  webConfigLoading: loading.effects['global/initWebConfig'],
}))
export default class PermissionProvider extends React.Component {
  webConfig;

  state = {
    configLoading: true,
  };

  componentWillMount() {
    this.saveUrlToken();
    if (!getAccessToken()) this.beforeToLogin();
    this.fetchSelf();
  }

  saveUrlToken = () => {
    // 获取url中token
    const urlToken = extractAccessTokenFromHash(window.location.hash);
    if (urlToken) {
      // removeAllCookie();
      removeAccessToken();
      setAccessToken(urlToken);
      const params = qs.parse(window.location.hash.substr(1));
      for (const key in params) {
        if (key && params[key]) {
          setCookie(key, params[key]);
        }
      }
      setCookie('isFirstVisit', true);
      window.location.href = location.pathname + location.search;
    }
  };

  fetchSelf = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/initSelf',
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 401) {
          this.beforeToLogin();
        } else {
          swalAlert(
            intl
              .get(`hzero.common.requestNotification.${res.status}`)
              .d(res.status === 403 ? '抱歉，你无权访问该页面' : '抱歉，服务器开小差了！')
          );
        }
      })
      .then((userInfo) => {
        if (!isEmpty(userInfo) && userInfo.failed !== true) {
          const { tenantNum } = userInfo;
          dispatch({
            type: 'global/update',
            payload: {
              userInfo,
              needLanguage: userInfo?.additionInfo?.smallEnableMultiLanguage !== 0,
            },
          });
          dispatch({
            type: 'global/update',
            payload: {
              routerData: getRouterData({ tenantNum }),
            },
          });
          dispatch({
            type: 'user/updateState',
            payload: {
              currentUser: userInfo,
            },
          });
          // 配置接口合并
          prepareApiData({
            userInfo,
            setLoading: (e) => {
              this.setState({
                configLoading: e,
              });
            },
          });
          if (getCookie('isFirstVisit')) {
            runSingleRecordFunc();
          }
        } else if (userInfo?.message) {
          swalAlert(userInfo?.message).then((e) => {
            if (e.value) {
              this.beforeToLogin();
            }
          });
        }
      });
  };

  fetchConfig = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/initWebConfig',
      payload: currentUrl,
    }).then((res) => {
      // 更换ico
      changeFavicon(res.iconUrl || favion);
      const payload = {};
      if (!isEmpty(res)) {
        payload.webConfig = {
          ...res,
          srmUrl: res.localSrmUrl || res.srmUrl,
          logoPath: 'loading',
          defaultLogoPath: res.logoUrl,
          colorCode: res.topicColor || 'A',
          isSecondWebSite: true,
        };
        // 切换主题色
        // if (res.colorCode && res.colorCode !== 'A') this.changeTheme(res);
      } else {
        payload.webConfig = { colorCode: 'A' };
      }
      dispatch({
        type: 'global/update',
        payload,
      });
      this.webConfig = payload;
    });
  };

  beforeToLogin = () => {
    const { dispatch } = this.props;
    let url = '';
    if (this.webConfig?.srmUrl) {
      this.toLogin(this.webConfig.srmUrl);
    } else {
      dispatch({
        type: 'global/initWebConfig',
        payload: currentUrl,
      })
        .then((res) => {
          if (isEmpty(res)) url = oauthPath;
          else url = res.localSrmUrl || res.srmUrl;
          this.toLogin(url);
        })
        .catch(() => {
          this.toLogin();
        });
    }
  };

  toLogin = (url) => {
    logoutRemoveData();
    const AUTH_URL = `${
      url || oauthPath
    }/oauth?client_id=${clientId}&${getRedirectName()}=${encodeURIComponent(
      window.location.href
    )}${basePath}`;
    window.location.href = `${AUTH_URL}`; // 401 需要在登录后返回401的页面
  };

  render() {
    const { configLoading } = this.state;
    const { selfLoading = true } = this.props;
    return <>{selfLoading || configLoading ? <Loading color /> : this.props.children}</>;
  }
}
