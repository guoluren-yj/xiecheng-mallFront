/**
 * request.js 通用请求
 * @date 2019/08/06
 * @author peng.yang05@hand-china.com
 * @copyright Copyright (c) 2019, Hand
 */
import {
  catchHttpError,
  getAccessToken,
  filterNullValueObject,
  generateUrlWithGetParam,
  getOrganizationId,
} from 'utils/utils';
import qs from 'qs';
import swalAlert from 'components/swal';
import { getConfig } from 'hzero-boot';
import { Message } from 'choerodon-ui/pro';
import HmallConfig from './api-config';

export default function request(url, reqOptions = {}) {
  const { swal = true, message = false, interceptSuccess = false, ...options } = reqOptions;
  let newUrl = url?.startsWith('http') ? url : `${HmallConfig.apiGateway}${url}`;
  // 头查询参数
  if (options.query) {
    const filterNullQuery = filterNullValueObject(options.query);
    newUrl = generateUrlWithGetParam(newUrl, filterNullQuery);
  }
  let headers = {};
  if (options.body instanceof FormData) {
    headers = {
      Accept: 'application/json',
    };
  } else {
    headers = {
      'Content-type': 'application/json;charset=UTF-8', // 默认格式
    };
  }
  return new Promise((resolve, reject) => {
    const config = {
      method: 'GET',
      ...options,
      headers: getHeader({ ...headers, ...options.headers }),
    };
    fetch(newUrl?.replace('{organizationId}', getOrganizationId()), config)
      .then((response) => {
        return new Promise((resolveStatus, rejectStatus) => {
          if (response.status === 204) {
            // 204 no content则直接返回{}
            const { noContent = {} } = config;
            resolveStatus(noContent);
            return false;
          }
          const { dataType = 'json' } = config;
          const data = response[dataType]();
          if (response.ok) {
            data.then(resolveStatus, () => {});
          } else {
            const { failCallBack = (e) => e } = config;
            failCallBack();
            rejectStatus(response);
          }
          const responseIntercept = getConfig('responseIntercept');
          if (responseIntercept && typeof responseIntercept === 'function') {
            data.then((json) => {
              responseIntercept({
                url: newUrl,
                method: config.method,
                status: response.status,
                responseBody: json,
                responseHeaders: response.headers,
                requestBody: config.body,
                requestQuery: config.query,
                requestHeaders: config.headers,
              });
            });
          }
        });
      })
      .then((res) => {
        const standardError = res?.failed;
        const successError = interceptSuccess && res?.success === false;
        if (standardError || successError) {
          const errorMsg = standardError ? res?.message : res?.resultMsg;
          if (swal) {
            swalAlert(errorMsg);
          }
          if (message) {
            Message.error(errorMsg);
          }
          const expression = {
            ...res,
            url: newUrl,
          };
          reject(expression);
        } else {
          resolve(res);
        }
      })
      .catch(catchHttpError({ swal, reject, errorCallBack: options.errorCallBack || ((e) => e) }));
  });
}

/**
 * 默认headers
 */
export function getHeader(headerInfo = {}) {
  const defaultHeaders = {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    // 'x-virtual-env': 'dev.Z020763',
  };
  window.menuCache = window.menuCache || {};
  const Menu = window.menuCache[window.location.pathname];
  if (Menu) {
    defaultHeaders['H-Menu-Id'] = Menu?.id;
  }
  const headers = {
    ...defaultHeaders,
    ...headerInfo,
  };
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return filterNullValueObject(headers);
}

export function excelExport({ requestUrl, method = 'GET', queryParams = {}, bodyParams = {} }) {
  let fileName = '';
  const newUrl =
    !requestUrl.startsWith('/api') && !requestUrl.startsWith('http')
      ? `${HmallConfig.apiGateway}${requestUrl}?`
      : `${requestUrl}?`;
  const newRequestUrl = `${newUrl}${qs.stringify(queryParams, { arrayFormat: 'repeat' })}`;
  fetch(newRequestUrl, {
    method,
    responseType: 'blob',
    headers: getHeader(),
    body: JSON.stringify(bodyParams),
  })
    .then((res) => {
      try {
        const { headers } = res;
        // 提取文件名
        const temp = headers
          .get('content-disposition')
          .match(/[fF][iI][Ll][Ee][Nn][Aa][Mm][Ee]=(.*)/)[1];
        fileName = temp;
        if (fileName[0] === "'" || fileName[0] === '"') {
          fileName = fileName.substring(1, fileName.length - 1);
        }
        return res.blob();
      } catch (e) {
        const enc = new TextDecoder('utf-8');
        let err = {};
        err = JSON.parse(enc.decode(new Uint8Array(res)));
        throw err;
      }
    })
    .then((resp) => {
      // 将二进制流转为blob
      const blob = new Blob([resp], { type: 'application/octet-stream' });
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
        window.navigator.msSaveBlob(blob, decodeURI(fileName));
      } else {
        // 创建新的URL并指向File对象或者Blob对象的地址
        const blobURL = window.URL.createObjectURL(blob);
        // 创建a标签，用于跳转至下载链接
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.setAttribute('download', decodeURI(fileName));
        // 兼容：某些浏览器不支持HTML5的download属性
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }
        // 挂载a标签
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        // 释放blob URL地址
        window.URL.revokeObjectURL(blobURL);
      }
      return true;
    });
}
