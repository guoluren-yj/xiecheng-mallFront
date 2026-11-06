/* eslint-disable eqeqeq */
/* eslint-disable no-restricted-properties */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/**
 * utils - 通用方法
 * @date: 2019-08-29
 * @author: <pengyang05@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import Cookies from 'universal-cookie';
import qs from 'qs';
import Big from 'big.js';
import raf from 'raf';
import moment from 'moment';
import { getDvaApp, getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import { getRequestId } from 'hzero-front/lib/utils/utils';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { isArray, isEmpty, isNumber, isNil, sortBy, uniq } from 'lodash';
import { JSEncrypt } from 'jsencrypt';
import BigNumber from 'bignumber.js';
import swalAlert from 'components/swal';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import { message } from 'choerodon-ui';
import { DEFAULT_MAX } from 'utils/constants';
import { ERROR_ROUTER_SEARCH } from 'utils/regExp';
import * as HmallConfig from './api-config';
import { changeAPIHOST } from './changeAPIHost';
import notification from './notification';
import userConfigInfo from './userConfigInfo';
import numRender, { getNumberLocalized } from './numberRender';
import { GLOBAL_PAGE_SIZE, PAGE_SIZE_OPTIONS } from './constants';
import CuxFn from '@/cuxTools/cuxFn';

export const ACCESS_TOKEN = 'access_token';
export const USER_NAME = 'username';

const cookies = new Cookies();
/**
 * 设置cookie
 * @param {string} cookie
 */
export function setCookie(name, value, options = { path: '/' }) {
  cookies.set(name, value, options);
}

/**
 * 设置cookie
 * @param {string} cookie
 */
export function removeCookie(name) {
  cookies.remove(name, {
    path: '/',
  });
}

/**
 * 获取cookie
 * @param {string} cookie
 */
export function getCookie(name, options = { path: '/' }) {
  return cookies.get(name, options);
}

/**
 * 获取tooken
 * @param {string} module
 */
export function getAccessToken() {
  return cookies.get(ACCESS_TOKEN, {
    path: '/',
  });
}

/**
 * 设置token
 * @param {string} token
 */
export function setAccessToken(token) {
  cookies.set(ACCESS_TOKEN, token, {
    path: '/',
  });
}

/**
 * 删除token
 * @param {string} token
 */
export function removeAccessToken() {
  cookies.remove(ACCESS_TOKEN, {
    path: '/',
  });
}

/**
 * 删除所有cookie值
 */
export function removeAllCookie() {
  for (const key in cookies.getAll()) {
    if (key) {
      cookies.remove(key);
    }
  }
}

export function getAllCookies() {
  return cookies.getAll();
}

export function getHeader(headers) {
  const newHeaders = headers || {};
  const accessToken = getCookie(ACCESS_TOKEN);
  if (accessToken) {
    newHeaders.Authorization = `Bearer ${accessToken}`;
  }
  return newHeaders;
}

/**
 * 设置本地存储
 */
export function setStorage(name, data) {
  const datatype = typeof data;
  if (datatype === 'object') {
    localStorage.setItem(name, JSON.stringify(data));
  } else if (['number', 'boolean', 'string'].indexOf(datatype) >= 0) {
    localStorage.setItem(name, data);
  } else {
    swalAlert(intl.get(`mallf.common.view.groupNum`).d('该类型不适用于本地存储'));
  }
}

/**
 * 获取本地存储的值
 */
export function getStorage(name) {
  const data = window.localStorage.getItem(name);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } else {
    return '';
  }
}

/**
 * 删除本地存储
 */
export function removeStorage(name) {
  window.localStorage.removeItem(name);
}

/**
 * 获取 require('moduleName') 或者 import('moduleName') 的真正的导出对象
 * @param {object} module
 */
export function resolveRequire(module) {
  return module && module.__esModule ? module.default : module;
}

/**
 * 捕获错误请求代码
 */
export function catchHttpError(cb = {}) {
  const { userId } = getUserConfigInfo();
  const { reject: callback = (e) => e, errorCallBack = (e) => e, swal } = cb;
  return (res) => {
    callback(res);
    if (res) {
      if (res.name === 'TypeError') {
        console.error(intl.get('hzero.common.notification.network.typeError').d('网络请求异常'));
      } else if (res.status === 401) {
        removeStorage(`infoModal_${userId}`);
        toLogin();
      } else if (
        res.status === 403 ||
        res.status === 404 ||
        res.status === 500 ||
        res.status === 503 ||
        res.status === 509
      ) {
        if (swal) {
          let msg = intl
            .get(`hzero.common.requestNotification.${res.status}`)
            .d(res.status === 403 ? '抱歉，你无权访问该页面' : '抱歉，服务器开小差了！');
          switch (res.status) {
            case 509:
              msg = intl
                .get('mallf.common.view.request.status509')
                .d('受访问人数限制，当前系统繁忙，请稍后重试');
              break;
            default:
              break;
          }
          swalAlert(msg).then(({ value }) => {
            if (value) {
              errorCallBack();
            }
          });
        }
      } else {
        swalAlert(res.toString() || intl.get('mallf.common.view.application.error').d('程序出错'));
      }
    }
  };
}

/**
 * 退出登录需要清除的数据
 */
export function logoutRemoveData() {
  const { userId } = getUserConfigInfo();
  const removeStorageList = [
    `infoModal_${userId}`,
    `${userId}_price_compare`, // 商品对比
    `${userId}_attr_compare`, // 商品比价
  ];
  removeStorageList.forEach((key) => {
    removeStorage(key);
  });
  removeAccessToken();
  removeAllCookie();
  sessionStorage.removeItem('selfData');
}

export function toLogin() {
  logoutRemoveData();
  const {
    webConfig: { isSecondWebSite, srmUrl },
  } = getUserConfigInfo();
  const AUTH_URL = `${isSecondWebSite ? srmUrl : HmallConfig.oauthPath}/oauth?client_id=${
    HmallConfig.clientId
  }&${getRedirectName()}=${encodeURIComponent(window.location.href)}${HmallConfig.basePath}`;
  window.location.href = `${AUTH_URL}`; // 401 需要在登录后返回401的页面
}

export function getRedirectName() {
  const {
    userInfo: { tenantNum },
  } = getUserConfigInfo();
  return tenantNum === 'SRM-CSCMRO' ? 'srm_redirect_uri' : 'redirect_uri';
}

/**
 * 抽取url上的AccessToken
 * @param {String} hash   hash值
 */
export function extractAccessTokenFromHash(hash) {
  if (hash) {
    const ai = hash.indexOf(ACCESS_TOKEN);
    if (ai !== -1) {
      const accessTokenReg = /#?access_token=[0-9a-zA-Z-]*/g; // todo 确定 确定的 access_token 头, 现在看起来时 /#access_token
      hash.match(accessTokenReg);
      const centerReg = hash.match(accessTokenReg)[0];
      const accessToken = centerReg.split('=')[1];
      return accessToken;
    }
  }
  return null;
}

/**
 * 获取选买配置信息
 */
export function getUserConfigInfo() {
  return userConfigInfo();
}

/**
 * 获取organizationId
 */
export function getOrganizationId() {
  return getCurrentUser().organizationId;
}

export function getCurrentUserId() {
  return getCurrentUser().id;
}

export function getMenuId() {
  return window.dvaApp._store.getState().global.menuId;
}

export function getCurrentUser() {
  return window.dvaApp._store.getState().global.userInfo;
}

/**
 * 获取当前用户角色租户id
 */
export function getCurrentOrganizationId() {
  return getCurrentUser().tenantId;
}

/**
 * 获取采买配置
 */
export function getUserConfig() {
  return window.dvaApp._store.getState().global.userConfig;
}

/**
 * 获取采买配置
 */
export function getIsJumpNewLink() {
  return window.dvaApp._store.getState().global.custWebConfig?.pageJumpConfig !== 'NO_JUMP';
}

/**
 * 判断角色层级是否是租户层级
 */
export function isTenantRoleLevel() {
  return getOrganizationId() !== 0;
}
/**
 * 获取系统当前语言
 * @export
 * @returns
 */
export function getCurrentLanguage() {
  return getCurrentUser().language;
}

// 获取所有颜色变量
export function getThemeColor() {
  return window.dvaApp._store.getState().global.theme;
}

/**
 * 获取主题色
 */
export function getPrimaryColor() {
  return window.dvaApp._store.getState().global.theme[`primary-color`];
}

/**
 * 获取价格颜色
 */
export function getPriceColor() {
  return window.dvaApp._store.getState().global.theme[`price-color`];
}

/**
 * 过滤空字段
 * @param {*} obj
 */
export function filterNullValueObject(obj) {
  const result = {};
  if (obj && Object.keys(obj).length >= 1) {
    Object.keys(obj).forEach((key) => {
      if (key && obj[key] !== undefined && obj[key] !== '' && obj[key] !== null) {
        // 如果查询的条件不为空
        if (obj[key].length === 0) {
          return;
        }
        result[key] = obj[key];
      }
    });
  }
  return result; // 返回查询条件
}
/**
 * generateUrlWithGetParam 将参数拼接到url
 * @param {*} url
 * @param {*} 查询参数
 */
export function generateUrlWithGetParam(url, params) {
  let newUrl = url;
  if (params && Object.keys(params).length >= 1) {
    const newParams = params;
    if (Object.keys(newParams).length >= 1) {
      newUrl += `${url.indexOf('?') >= 0 ? '&' : '?'}${qs.stringify(newParams)}`;
    }
  }
  return newUrl;
}
/**
 * 过滤空字段且拼接到url上
 * @param {*} url
 * @param {*} 查询参数
 */
export function filterNullGetUrl(url, params) {
  return generateUrlWithGetParam(url, filterNullValueObject(params));
}
/**
 * 复制单号
 * @param {*} value
 * @param {*} 复制参数
 */
export function handleCopy(value) {
  const textArea = document.createElement('textarea');
  textArea.value = value;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('Copy');
  message.success(
    intl.get('mallf.common.view.copy.success').d('复制成功'),
    undefined,
    undefined,
    'top'
  );
  document.body.removeChild(textArea);
}
/**
 * 保留小数
 * @param {*} value 数值
 * @param {*} precision 财务精度
 * @param {*} type 是否为需要展示财务精度的价格 财务精度需要补0，单价精度不补0，
 * // 保留2-10位小数
 */
export const numberRender = numRender;

export function priceNumberRender(value, precison = 0) {
  return numberRender(value, precison, false); // 预留是否补0 统一控制
}

/** 目录化商品价格精确到5位数，电商商品价格精确到2位数，小数点位数在2-5位数之间
 * @param {} price - 价格
 * @param {} productSource - 商品来源
 */
export function toFixedPrecision(price = '', productSource = 'CATA') {
  if (price === null || price === '' || isNaN(price)) {
    return '';
  } else {
    // 有些价格返回的是字符型，如目录化申请的价格 '100.00'会影响后续的判断，所以统一转为数值型去掉'.00'再转为字符
    const value = Number(price).toString();
    const index = value.indexOf('.');
    const precision = index === -1 ? 0 : Math.abs(value.length - index);
    if (precision > 2 && productSource === 'CATA') {
      return math.round(price * 100000) / 100000;
    } else {
      return numberRender(price, 2);
    }
  }
}

/**
 * 获取当前(标准格式)时间
 * @param {*} flag 是否需要时分秒
 */
export function timestampToTime(flag = false) {
  const date = new Date();
  /**
   * 数字前面补0
   * @param {*} number
   * @param {*} digits 位数
   */
  function fillZero(number, digits) {
    let newNum = String(number);
    if (newNum.length < digits) {
      for (let i = 0; i < digits - newNum.length; i++) {
        newNum = `0${newNum}`;
      }
    }
    return newNum;
  }
  const Y = `${date.getFullYear()}-`;
  const M = `${fillZero(date.getMonth() + 1, 2)}-`;
  const D = `${fillZero(date.getDate(), 2)} `;
  const h = `${fillZero(date.getHours(), 2)}:`;
  const m = `${fillZero(date.getMinutes(), 2)}:`;
  const s = `${fillZero(date.getSeconds(), 2)}`;
  return flag ? Y + M + D : Y + M + D + h + m + s;
}

export function convertImg(path = '', level = 0, sourcefrom = 'JD') {
  if (path?.startsWith('http')) {
    return path;
  }
  if (sourcefrom === 'JD') {
    return `${HmallConfig.prefixImgUrl}/n${level}/${path}`;
  }
  //  else if (sourcefrom === 'ZKH') {
  //   return `${HmallConfig.zkhImgUrl}${path.substr(4)}`;
  // }
  else {
    return path;
  }
}

export function formatPrice(price) {
  if (
    // 空检查
    price === null ||
    price === undefined ||
    price === '' ||
    // 非法数值的检查
    +price === Infinity ||
    +price === -Infinity ||
    isNaN(+price)
  ) {
    return '';
  }
  const values = String(price).split('.');
  if (values && values[1]) {
    if (values[1].length === 2) {
      return values.join('.');
    } else if (values[1].length === 3) {
      return values.join('.');
    } else if (values[1].length === 1) {
      return `${values.join('.')}0`;
    } else {
      return values;
    }
  } else if (values && values[1] === undefined) {
    return price.toFixed(2);
  } else {
    return '';
  }
}

/*
 *通过文件服务器的接口获取可访问的文件URL
 *
 * @export
 * @param {String} url 上传接口返回的 Url
 * @param {String} bucketName 桶名
 * @param {Number} tenantId 租户Id
 * @param {String} bucketDirectory 文件目录
 */
export function getAttachmentUrl(url, bucketName = 'public-bucket', bucketDirectory) {
  const accessToken = getCookie(ACCESS_TOKEN);
  const organizationId = getOrganizationId();
  const HZERO_FILE = `${HmallConfig.apiGateway}/hfle`;
  const params = qs.stringify(
    filterNullValueObject({
      bucketName,
      access_token: accessToken,
      directory: bucketDirectory,
    })
  );
  const newUrl = `${HZERO_FILE}/v1/${organizationId}/files/download?${params}&url=${url}`;
  return newUrl;
}

/**
 * 获取行内编辑表格中的 form
 * @param {array} dataSource - 表格数据源
 */
export function getEditTableForm(dataSource) {
  const formList = [];
  const fetchForm = (source, list) => {
    if (Array.isArray(source)) {
      source.forEach((item) => {
        if (item.$form) {
          list.push(item.$form);
        }
        if (item.children && Array.isArray(item.children)) {
          fetchForm(item.children, list);
        }
      });
    }
  };
  fetchForm(dataSource, formList);
  return formList;
}

/**
 * 获取行内编辑表格中的 form
 * @param {array} dataSource - 表格数据源
 * @param {array} filterList - 过滤新增操作中的属性字段，例如：['children', 'unitId']，默认过滤 $form
 * @param {object} scrollOptions - 配置form效验报错后的滚动行为，默认是基于页面滚动，如果需要基于表格内滚动，需要：{ container: document.querySelector('.ant-table-body') }
 */
export function getEditTableData(dataSource = [], filterList = [], scrollOptions = {}) {
  const paramsList = [];
  const errList = [];
  const fetchForm = (source, list) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length > 0; i++) {
        if (source[i].$form && source[i]._status) {
          source[i].$form.validateFieldsAndScroll(
            { scroll: { allowHorizontalScroll: true }, ...scrollOptions },
            (err, values) => {
              if (!err) {
                const { $form, ...otherProps } = source[i];
                if (Array.isArray(filterList) && filterList.length > 0) {
                  for (const name of filterList) {
                    // 如果record中存在需要过滤的值，且是新增操作，执行过滤，默认过滤$form
                    // eslint-disable-next-line
                    if (source[i][name] && source[i]._status === 'create') {
                      delete otherProps[name];
                    }
                  }
                }
                list.push({ ...otherProps, ...values });
              } else {
                // 捕获表单效验错误
                errList.push(err);
              }
              return err;
            }
          );
        }
        if (source[i].children && Array.isArray(source[i].children)) {
          fetchForm(source[i].children, list);
        }
      }
    }
  };
  fetchForm(dataSource, paramsList);
  return errList.length > 0 ? [] : paramsList;
}

function removeFaviconTag() {
  const links = Array.prototype.slice.call(document.getElementsByTagName('link'), 0);
  const head = document.getElementsByTagName('head')[0];

  for (let i = 0, l = links.length; i < l; i++) {
    if (
      links[i].getAttribute('rel') === 'icon' ||
      links[i].getAttribute('rel') === 'shortcut icon'
    ) {
      head.removeChild(links[i]);
    }
  }
}

export function changeFavicon(src) {
  removeFaviconTag();
  const link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = src;
  document.getElementsByTagName('head')[0].appendChild(link);
}

export function openImport(params) {
  const { code, ...other } = params;
  const url = `/mall/data-import/${code}`;
  const newRoute = filterNullGetUrl(url, other);
  openPage(newRoute);
}

/**
 * 数组去重
 * @param {*} array 数据
 * @param {*} key 去重纬度
 */
export function uniqBykey(array = [], key = '') {
  const obj = {};
  const newList = array.reduce((cur, next) => {
    if (!obj[`${next?.[key]}`]) {
      obj[`${next?.[key]}`] = true;
      cur.push(next);
    }
    return cur;
  }, []);
  return newList;
}

/**
 * 动画垂直滚动到页面指定位置
 * @param { Number } targetY 目标位置
 * @param { Number } currentY
 * @param { Number } frames 帧数
 */
export function scrollAnimation(targetY, currentY, frames = 10) {
  // 获取当前位置方法
  // const currentY = document.documentElement.scrollTop || document.body.scrollTop

  // scrollTo方法
  // const scrollToFunc = document.body.scrollTo || window.scrollTo;

  const scrollToFunc = (top) => {
    if (document.body.scrollTo) {
      document.body.scrollTo(0, top);
    } else if (window.scrollTo) {
      window.scrollTo(0, top);
    }
  };

  // 计算需要移动的距离
  const needScrollTop = targetY - currentY;
  let _currentY = currentY;
  setTimeout(() => {
    // 一次调用滑动帧数，每次调用会不一样
    const dist = math.ceil(needScrollTop / frames);
    _currentY += dist;
    scrollToFunc(currentY);
    // 如果移动幅度小于十个像素，直接移动，否则递归调用，实现动画效果
    if (needScrollTop > frames || needScrollTop < -frames) {
      scrollAnimation(targetY, _currentY, frames);
    } else {
      scrollToFunc(targetY);
    }
  }, 1);
}

function easeInOutCubic(t, b, c, d) {
  const cc = c - b;
  const tt = t / (d / 2);
  if (tt < 1) {
    return (cc / 2) * tt * tt * tt + b;
  }
  const _tt = tt - 2;
  return (cc / 2) * (_tt * _tt * _tt + 2) + b;
}

// 平滑垂直滚动
export function smoothScrollTo(targetTop, options = {}) {
  const { duration = 450, container = document.body } = options;
  const currentTop = container.scrollTop;
  const startTime = Date.now();
  const frameFunc = () => {
    const timestamp = Date.now();
    const time = timestamp - startTime;
    const nextScroll = easeInOutCubic(
      time > duration ? duration : time,
      currentTop,
      targetTop,
      duration
    );
    container.scrollTop = nextScroll;
    if (time < duration) {
      raf(frameFunc);
    }
  };
  raf(frameFunc);
}

/**
 * 通用处理async/awiat 返回值 const [err, data] = await awaitWrap(fetchData())
 */
export function awaitWrap(promise) {
  return promise.then((data) => [null, data]).catch((err) => [err, null]);
}

/**
 * dataType为text时判断isJson
 */
export function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return typeof result === 'object' && typeof result !== 'string';
}

// 拼接token
export function fillUrlToken() {
  const {
    userInfo: { tenantNum },
  } = getUserConfigInfo();
  return getAccessToken() && tenantNum !== 'SRM-CSCMRO' ? `#access_token=${getAccessToken()}` : '';
}

// 业务规则手工申请跳转
export function prRequestJump() {
  const { addressCode } = getUserConfigInfo();
  const jumpUrl =
    addressCode === 'PURCHASE_MANUALLY'
      ? `${window.location.origin}/add-purchase`
      : getSprmDetailUrl({ prSourcePlatform: 'SRM' });
  openPage(jumpUrl, true);
}

// 16进制转rgb
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function changeColor(color) {
  if (window.less.modifyVars) {
    window.less.modifyVars({
      '@primary-color': color,
    });
  }
}

// 弹出原来的选买配置
export function showConfigModal() {
  const topbarShowPreference = document.getElementById('topbar-showPreference');
  if (topbarShowPreference) {
    topbarShowPreference.click();
  }
}

// 为元素添加新classname
export function addClassName(element, classname) {
  const ele = element;
  let newclassname = '';
  // 判断以前是否为有class
  if (!ele.className) {
    ele.className = classname;
  } else {
    newclassname = ele.className;
    newclassname += ' ';
    newclassname += classname;
    ele.className = newclassname;
  }
}

/**
 * 根据传入的数据列表对象，生成页面分页参数对象
 * @param {object} data - 数据列表对象
 * @returns {object} pagination- 分页对象
 */
export function createPagination(data, list) {
  if (data) {
    return {
      page: (isNumber(data.number) ? data.number : data.start) + 1,
      showSizeChanger: true,
      pageSizeOptions: isArray(list) && !isEmpty(list) ? list : ['10', '20', '30'],
      // showQuickJumper: true,
      hideOnSinglePage: true,
      current: (isNumber(data.number) ? data.number : data.start) + 1,
      pageSize: data.size, // 每页大小
      total: isNumber(data.totalElements) ? data.totalElements : data.total,
      // showTotal: totalRender,
    };
  }
}

/**
 * 渲染分页数据中的信息
 * @param {number} total - 数据总数
 * @param {number[]} range - [当前数据的第一条数据序号, 当前数据最后一条数据序号]
 */
export function totalRender(total, range) {
  return intl
    .get('hzero.common.pagination.total', {
      range1: range[0],
      range2: range[1],
      total,
    })
    .d(`显示 ${range[0]} - ${range[1]} 共 ${total} 条`);
}

export function getNANId(string) {
  if (isNaN(Number(string))) return string;
  else if (string !== String(Number(string))) {
    return string;
  } else {
    return Number(string);
  }
}

export function commonReducerExport(type, defaultState) {
  return (state = defaultState, action) => {
    switch (action.type) {
      case `${type}/update`:
        return {
          ...state,
          ...action.payload,
        };
      default:
        return state;
    }
  };
}

export function gotoPayUrl(params = {}) {
  if (params?.cashierHtml) {
    if (params?.cashierHtml?.startsWith('http')) {
      window.location = params?.cashierHtml;
    } else {
      document.open('text/html', 'replace');
      document.write(params?.cashierHtml);
      document.close();
    }
  } else if (params?.cashierUri) {
    const {
      unitId,
      webConfig: { isSecondWebSite, srmUrl, webUrl },
    } = getUserConfigInfo();
    window.location = `${
      isSecondWebSite ? `${srmUrl}/app` : HmallConfig.srmPath
    }${generateUrlWithGetParam(params?.cashierUri, {
      cashierConfigSource: 'SMALL_VIEW',
      webUrl: isSecondWebSite ? webUrl : window.location.origin,
      unitId,
      channelTrxType: 'qrcode',
    })}${fillUrlToken()}`;
  }
}

/* 判断是否开启了库存强校验且库存小于购买数量且库存<=0 */
export function getStockConfig(stock) {
  const { skuCheckFlag = false } = getUserConfigInfo();
  const num = stock.stockQuantity - stock.quantity; // 库存-购买数量
  return skuCheckFlag && stock.productSource === 'CATA' && num < 0;
}

// 获取商品单次最大/最小购买量
export function getProductLimit(params = {}) {
  const {
    sourceFrom, // 电商/目录化
    stockLimit, // 目录化库存限制
    ladderPriceLimit, // 目录化阶梯价格数量限制
    minPurchaseQuantity, // 最小购买量
    maxPurchaseQuantity, // 电商最大购买量
    purchaseQuantityLimit, // 目录化最大购买量
    price, // 价格
  } = params;
  let minVal = minPurchaseQuantity ?? 1;
  let maxVal;
  if (sourceFrom === 'CATA') {
    const ladders = ladderPriceLimit || [];
    maxVal = !isNil(purchaseQuantityLimit)
      ? purchaseQuantityLimit > DEFAULT_MAX
        ? DEFAULT_MAX
        : purchaseQuantityLimit
      : DEFAULT_MAX;
    if (ladders.length) {
      const ladderMin = ladders[0]?.ladderFrom || 1;
      let ladderMax = ladders[ladders.length - 1]?.ladderTo;
      ladderMax = ladderMax ? ladderMax - 1 : DEFAULT_MAX;
      minVal = minVal > ladderMin ? minVal : ladderMin;
      maxVal = maxVal < ladderMax ? maxVal : ladderMax;
    }
    if (stockLimit && stockLimit >= 0) {
      maxVal = maxVal > stockLimit ? stockLimit : maxVal;
    }
  } else {
    maxVal = maxPurchaseQuantity || DEFAULT_MAX;
  }
  maxVal = maxVal || DEFAULT_MAX;
  if (math.gt(price, 0)) {
    const mathQuality = math.div(DEFAULT_MAX, price);
    const mathMaxVal = Math.min.apply(null, [mathQuality, maxVal]);
    maxVal = sourceFrom === 'CATA' ? mathMaxVal : math.floor(mathMaxVal);
  }
  return [minVal ?? 1, maxVal];
}

// 获取sprm 采购申请列表地址
export function getSprmListUrl(reqLotNum) {
  const {
    webConfig: { isSecondWebSite, srmUrl },
    sprmOldLinkFlag,
  } = getUserConfigInfo();
  if (sprmOldLinkFlag) {
    return `${
      isSecondWebSite ? `${srmUrl}/app` : HmallConfig.srmPath
    }/sprm/purchase-requisition-creation/list?lotNum=${reqLotNum}${fillUrlToken()}`;
  } else {
    return `${
      isSecondWebSite ? `${srmUrl}/app` : HmallConfig.srmPath
    }/sprm/purchase-platform/list?lotNum=${reqLotNum}${fillUrlToken()}`;
  }
}

// 获取sprm 采购申请详情地址
export function getSprmDetailUrl(params = {}) {
  const {
    webConfig: { isSecondWebSite, srmUrl },
    sprmOldLinkFlag,
  } = getUserConfigInfo();
  if (sprmOldLinkFlag) {
    return `${filterNullGetUrl(
      `${
        isSecondWebSite ? `${srmUrl}/app` : HmallConfig.srmPath
      }/sprm/purchase-requisition-creation/detail`,
      { ...params }
    )}${fillUrlToken()}`;
  } else {
    return `${filterNullGetUrl(
      `${
        isSecondWebSite ? `${srmUrl}/app` : HmallConfig.srmPath
      }/sprm/purchase-platform/creation-detail`,
      { ...params, newFlag: true }
    )}${fillUrlToken()}`;
  }
}

// 获取精度小数
export function getPrecision(step) {
  return new BigNumber(1 / math.pow(10, step || 0)).toFormat();
}

// 保留小数位
export function getToFixed(num, step = 0) {
  return !isNaN(+num)
    ? String(num)?.split('.')?.[1]?.length > step
      ? Number(num).toFixed(step)
      : num
    : num;
}

// todo 调整消息返回
export function getResponse(response, errorCallback = (e) => e) {
  if (response && response.failed === true) {
    if (errorCallback) {
      errorCallback(response);
    } else {
      const msg = {
        message: response.message,
      };
      switch (response.type) {
        case 'info':
          notification.info(msg);
          break;
        case 'warn':
          notification.warning(msg);
          break;
        case 'error':
        default:
          notification.error(msg);
          break;
      }
    }
  } else {
    return response;
  }
}

/**
 * 获取首页路径
 */
export function getHomePath() {
  const { mallType } = getUserConfigInfo();
  return mallType === 'sigl' ? '/sigl/' : '/';
}

/**
 * 跳转首页路径
 */
export function goHomePath() {
  const { mallType } = getUserConfigInfo();
  return mallType === 'sigl' ? '/sigl' : '/';
}

/**
 * 获取处理精度的数字
 */
export function getBigNumber(num) {
  // 防止报错
  return isNaN(+num) ? new Big(0) : new Big(num);
}

/**
 * 加密密码
 * @param {String} password - 需要加密的密码
 */
export function encryptPwd(password, publicKey) {
  /* 如果没有 password 字段，则不进行加密 */
  if (!password) {
    return password;
  }
  if (publicKey) {
    /* 有公钥 使用 rsa 加密, 否则使用 md5 加密 */
    // 初始化加密器
    const encrypt = new JSEncrypt();
    // 设置公钥
    encrypt.setPublicKey(publicKey);
    // 加密
    const encryptPassword = encrypt.encrypt(password);
    return encryptPassword || password;
  }
  return password;
}

// 不同商品推荐列表，跳转参数
export function getProductLinkParams({
  param,
  orderType,
  groupType,
  groupTypeName,
  productGroupId,
  productGroupAssignList,
  isLink,
}) {
  const params = { ...param };
  if (orderType === 1) {
    params.priceOrder = 'desc';
  } else if (orderType === 2) {
    params.priceOrder = 'asc';
  } else if (orderType === 3) {
    params.salesSort = 'desc';
  } else if (orderType === 4) {
    params.creationDate = 1;
  }

  if (groupType === 0) {
    // 自由组合
    params.bannerId = productGroupId;
  } else if (groupType === 1) {
    // 供应商
    params.supplierCompanyIds = isLink
      ? JSON.stringify(productGroupAssignList?.map((p) => p.supplierCompanyId))
      : productGroupAssignList?.map((p) => p.supplierCompanyId);
  } else if (groupType === 2) {
    params.catalogIds = isLink
      ? JSON.stringify(productGroupAssignList?.map((p) => p.catalogId))
      : productGroupAssignList?.map((p) => p.catalogId);
    // 目录
  } else if (groupType === 3) {
    // 销量
    params.salesSort = 'desc';
    params.listType = 'sale';
    params.salesRank = productGroupAssignList?.[0]?.salesRank;
  } else if (groupType === 4) {
    // 活动
    params.activityId = isLink
      ? JSON.stringify(productGroupAssignList?.map((p) => p.activityId))
      : productGroupAssignList?.map((p) => p.activityId);
  } else if ([5, 6, 7].includes(groupType)) {
    params.activityId = isLink
      ? JSON.stringify(productGroupAssignList?.map((p) => p.agreementId))
      : productGroupAssignList?.map((p) => p.agreementId);
  } else if (groupType === 8) {
    params.groupTypeName = groupTypeName;
    // 以防name没传
    params.attribute = {
      [groupTypeName || '标签']: isLink
        ? JSON.stringify(productGroupAssignList?.map((p) => p.labelCode))
        : productGroupAssignList?.map((p) => p.labelCode),
    };
  }
  return params;
}

// 手机号脱敏
export function getPhoneEncrypt(phone) {
  return phone ? phone.replace(/^(\d{3})\d*(\d{4})$/, '$1****$2') : '';
}

// 获取库存描述
export function getStockNumMeaning(stockState, skuStock, params) {
  const { isReceive } = params || {};
  if (isReceive) return '-';
  switch (stockState) {
    case 1:
      if (skuStock > 0) {
        return getNumberLocalized(skuStock);
      } else {
        return intl.get('mallf.common.model.inStock').d('有货');
      }
    case 5:
      return intl.get('mallf.common.model.new.noStock').d('无货');
    case 2:
    case 3:
      return intl.get('mallf.common.model.inStock').d('有货');
    case 4:
    case 6:
      return intl.get('mallf.common.model.currentStock4').d('预售中');
    default:
      if (isNil(stockState)) {
        return '-';
      } else {
        return intl.get('mallf.common.model.inStock').d('有货');
      }
  }
}

// 获取缓存地址
export function getCacheAddress() {
  const { unitId, userId } = getUserConfigInfo();
  return getCookie(`${unitId}${userId}AddressInfo`)?.[getAccessToken()] || {};
}

// 获取默认地址
export function getDefaultAddress() {
  const { defaultAddress } = getUserConfigInfo();
  return isEmpty(defaultAddress) ? getCacheAddress() : defaultAddress;
}

/**
 * @param {string} path 路径
 * @param {boolean} newWindow 原url是否强制跳新窗口
 */
export function openPage(path, newWindow) {
  if (getIsJumpNewLink()) {
    window.open(path, '_blank');
  } else {
    if (newWindow || path?.startsWith('http')) {
      window.location.href = path;
      return;
    }
    const history = getDvaApp()._history;
    const currentPath = history.location.pathname;
    const toPath = path?.split('?')?.[0];
    history.push(path?.replace(window.location.origin, ''));
    if (currentPath === toPath) {
      history.push('/refresh');
    }
  }
}

/**
 * 解析查询参数
 * @param {Object} params
 * @returns {Object} 解析后的查询参数
 */
export function parseParameters(params = {}) {
  const { page = {}, sort = {}, ...others } = params;
  const { current = 1, pageSize = GLOBAL_PAGE_SIZE } = page;
  if (sort.order === 'ascend') {
    sort.order = 'asc';
  }
  if (sort.order === 'descend') {
    sort.order = 'desc';
  }
  const sortObj = {};
  if (!isEmpty(sort)) {
    sortObj.sort = `${sort.field},${sort.order}`;
  }
  let size = pageSize;
  const sourceSize = [...PAGE_SIZE_OPTIONS];
  if (!sourceSize.includes(`${pageSize}`)) {
    const sizes = sortBy(uniq([...sourceSize, `${pageSize}`]), (i) => +i);
    const index = sizes.findIndex((item) => +item === pageSize);
    size = +sizes[index];
  }
  return {
    size,
    page: current - 1,
    ...others,
    ...sortObj,
  };
}

/**
 * 同款比价 获取是否开启强弱校验
 * @param {res} 拿到的请求结果
 */
export function getIsStrongOrWeakFlag(res) {
  // 判断批量时
  const isStrongRule = (arr) => {
    return arr.some((current) => {
      return current.lowestPriceFlag === 2 || current.lowestPriceRule === 2;
    });
  };
  const isWeakRule = (arr) => {
    return arr.some((current) => {
      return current.lowestPriceFlag === 1 || current.lowestPriceRule === 1;
    });
  };

  // 弱校验
  const weakFlag = Array.isArray(res)
    ? isWeakRule(res)
    : [1].includes(res.lowestPriceFlag || res.lowestPriceRule);

  // 强校验
  const strongFlag = Array.isArray(res)
    ? isStrongRule(res)
    : [2].includes(res.lowestPriceFlag || res.lowestPriceRule);

  return { strongFlag, weakFlag };
}

// 图片usrl跳转
export const HandleImgUrl = (code, url) => {
  return code === 'CATA' ? url : convertImg(url, 1, code);
};

// 隐藏 首页，商详，列表，购物车 页面单位
export const uomRender = (uomName) => {
  return CuxFn({
    name: 'Utils-fn-hideUomRender',
  })(() => {
    return uomName ? `/${uomName}` : '';
  })();
};

// 判断个性化区域显示｜隐藏
export const getCustVisible = (unitFields = [], fields = []) => {
  let visibleFields = unitFields;
  if (fields.length > 0) {
    visibleFields = fields.map((field) => {
      const { name, hidden } = field;
      const unitField = unitFields.find((f) => f.fieldCode === name) || {};
      return { ...field, visible: !hidden && unitField.visible !== 0 ? 1 : 0 };
    });
  }
  return visibleFields.length < 1 || visibleFields.some((s) => s.visible !== 0);
};

// 获取时间对比
export const getDiffDate = ({ start = moment(), end = moment, type = 'days' }) => {
  return moment(end).diff(start, type);
};

// 判断错误路径
export function getRouterError() {
  const { href, search } = window.location || {};
  const pathSearch = search.includes('?') ? decodeURI(search.split('?')[1]) : '';
  const errorFlag = (href.split('http') || []).length > 2 || ERROR_ROUTER_SEARCH.test(pathSearch);
  return errorFlag;
}

// 兼容大数字版取最小公倍数 只求正整数即+1
export function getLeastCommonMultiple(numA, numB) {
  if (math.gt(numA, 0) && math.gt(numB, 0)) {
    const end = math.multipliedBy(numA, numB);
    let start = math.gt(numA, numB) ? numA : numB;
    while (math.gt(end, start)) {
      if (math.isZero(math.mod(start, numA)) && math.isZero(math.mod(start, numB))) {
        return start;
      }
      start = math.plus(start, 1);
    }
    return end;
  }
  return numA;
}

// 求满足最小购买和包装量的最小数字
export function getMinAndPack(min, pack) {
  if (!pack || math.isZero(pack)) {
    return min || 0;
  }
  if (math.lt(min, 0) && math.lt(pack, 0)) {
    return 0;
  }
  if (math.gt(min, pack)) {
    let i = 1;
    while (math.gt(min, math.multipliedBy(pack, i))) {
      i++;
    }
    return math.multipliedBy(pack, i);
  }
  return pack;
}

// changeAPIHOST 已移至 ./changeAPIHost.js，避免循环依赖，此处重新导出保持兼容
export { changeAPIHOST };

/**
 * getEncodeFileUrl - 编码fileUrl
 * fileUrl格式为服务器目录@文件名, 此方法用于编码带包含特殊字符的文件名
 */
export const getEncodeFileUrl = (fileUrl) => {
  if (!fileUrl) {
    return '';
  }
  const index = fileUrl.indexOf('@');
  if (index === -1) {
    return fileUrl;
  }
  return fileUrl.substring(0, index + 1).concat(encodeURIComponent(fileUrl.substring(index + 1)));
};

// 根据精度和包装量配置判断是否需要进行包装量校验
export const calcValidatePack = (uomPrecision, minPackageQuantity) => {
  // 当包装量大于1且为整数时 需要校验包装量 1/小数下看精度 精度存在且不为0则不校验包装量 否则校验
  return !uomPrecision || (minPackageQuantity > 1 && Number.isInteger(minPackageQuantity));
};

// 处理 includeNoStockFlag 字段 0/1相反
export function getOnlyInStock(includeNoStockFlag) {
  return +includeNoStockFlag === 1 ? 0 : +includeNoStockFlag === 0 ? 1 : +includeNoStockFlag;
}

// 领用没有起订量根据精度设置起订量
export const getMinPurchaseQuantity = ({
  minPurchaseQuantity,
  isReceive = false,
  uomPrecision = 0,
}) => {
  return !isReceive ? minPurchaseQuantity : minPurchaseQuantity || getPrecision(uomPrecision);
};
/**
 * 通过文件服务器的接口获取可访问的文件URL(带fileToken)
 *
 * @export
 * @param {String} url 上传接口返回的 Url
 * @param {String} bucketName 桶名
 * @param {Number} tenantId 租户Id
 * @param {String} bucketDirectory 文件目录
 * @param {String} storageCode 存储配置编码
 */
// @ts-ignore
export function getAttachmentUrlWithToken(
  url,
  bucketName,
  tenantId,
  bucketDirectory,
  storageCode,
  _fileToken,
  enableImageWatermark,
  isAttachmentsInControl = true
) {
  const accessToken = getAccessToken();
  const requestId = getRequestId();
  const params = qs.stringify(
    filterNullValueObject({
      bucketName,
      storageCode,
      _fileToken: isAttachmentsInControl ? _fileToken : undefined,
      _downloadToken: isAttachmentsInControl ? undefined : _fileToken,
      access_token: accessToken,
      'H-Request-Id': requestId,
      directory: bucketDirectory,
      enableImageWatermark,
    })
  );
  const { HZERO_FILE } = getEnvConfig();
  const version = isAttachmentsInControl ? '/v1' : '/v2';
  const middleUrl = isAttachmentsInControl ? '/files/download-with-token' : '/files/download';
  const newUrl = !isTenantRoleLevel()
    ? `${HZERO_FILE}${version}${middleUrl}?${params}&url=${encodeURIComponent(url)}`
    : `${HZERO_FILE}${version}/${getCurrentOrganizationId()}${middleUrl}?${params}&url=${encodeURIComponent(
        url
      )}`;
  return newUrl;
}

export function downLoadFile(file) {
  if (!file) {
    return;
  }
  let queryParams = [];
  const { fileUrl, bucketName, bucketDirectory, storageCode, _fileToken } = file;
  const url = getAttachmentUrlWithToken(
    fileUrl,
    bucketName,
    getCurrentOrganizationId(),
    bucketDirectory,
    storageCode,
    _fileToken
  );
  const paramStr = url.split('?')[1];
  if (paramStr) {
    queryParams = paramStr
      .split('&')
      .map((param) => {
        const [name, value] = param.split('=');
        return { name, value };
      })
      .filter((item) => !['access_token'].includes(item.name));
  }
  downloadFileByAxios({ requestUrl: url, queryParams, method: 'GET' });
}
window.SRM_downLoadFile = downLoadFile;
