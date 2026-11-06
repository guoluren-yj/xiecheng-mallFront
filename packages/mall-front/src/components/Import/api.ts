/**
 * 文件相关
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2019/12/25
 * @copyright HAND ® 2019
 */

 import axios from 'axios';
 import qs from 'querystring';

 import HmallConfig from 'utils/api-config';
 import request from 'utils/hzeroRequest';
 import { getIeVersion } from 'hzero-front/lib/utils/browser';
 import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
 import notification from 'hzero-front/lib/utils/notification';

 import {
   filterNullValueObject,
   getAccessToken,
   getCurrentOrganizationId,
   getResponse,
   getRequestId,
   isTenantRoleLevel,
 } from 'hzero-front/lib/utils/utils';

 const { HZERO_FILE } = getEnvConfig();
 const API_HOST = HmallConfig.apiGateway;

 const withTokenAxios = axios.create();
 const jsonMimeType = 'application/json; charset=utf-8';
 const notificationType = (type, msg) => {
   switch (type) {
     case 'info':
       notification.info({
         message: msg,
       });
       break;
     case 'warn':
       notification.warning({
         message: msg,
       });
       break;
     case 'error':
     default:
       notification.error({
         message: msg,
       });
       break;
   }
 };

 withTokenAxios.defaults = {
   ...withTokenAxios.defaults,
   headers: {
     ...(withTokenAxios.defaults || {}).headers,
     'Content-Type': jsonMimeType,
     Accept: 'application/json;',
     // 'X-Requested-With': 'XMLHttpRequest',
   },
   withCredentials: true,
 };

 // Add a request interceptor
 withTokenAxios.interceptors.request.use(
   (config) => {
     let { url = '' } = config;
     if (url.indexOf('://') === -1 && !url.startsWith('/_api')) {
       url = `${API_HOST}${url}`;
     }
     // Do something before request is sent
     return {
       ...config,
       url,
       headers: {
         ...config.headers,
         Authorization: `bearer ${getAccessToken()}`,
         'H-Request-Id': `${getRequestId()}`,
       },
     };
   },
   (err) => {
     return Promise.reject(err);
   }
 );

 withTokenAxios.interceptors.response.use(
   (res) => {
     const { status, data } = res;
     if (status === 204 || status === 200) {
       return res;
     }
     if (data && data.failed) {
       // notification.error({
       //   message: data.message,
       // });
       throw res;
     } else {
       return res;
     }
   },
   (err) => {
     throw err;
   }
 );

 /**
  * 获取fileList
  * {HZERO_FILE}/v1/files/{attachmentUUID}/file
  * todo {HZERO_FILE}/v1/{organizationId}/files/{attachmentUUID}/file
  * @export
  * @param {object} params 传递参数
  * @param {string} params.attachmentUUID - 文件uuid
  */
 export async function queryFileList(params) {
   const tenantId = getCurrentOrganizationId();
   return request(
     `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/${
       params.attachmentUUID
     }/file`,
     {
       method: 'GET',
       query: params,
     }
   );
 }

 /**
  * 获取fileList(租户级)
  * {HZERO_FILE}/v1/{organizationId}/files/{attachmentUUID}/file
  * @export
  * @param {object} params 传递参数
  * @param {string} params.attachmentUUID - 文件uuid
  */
 export async function queryFileListOrg(params) {
   const organizationId = getCurrentOrganizationId();
   return request(`${HZERO_FILE}/v1/${organizationId}/files/${params.attachmentUUID}/file`, {
     method: 'GET',
     query: params,
   });
 }

 /**
  * 删除文件
  * {HZERO_FILE}/v1/files/delete-by-uuidurl/not-null
  * @export
  * @param {object} params 传递参数
  * @param {string} params.bucketName - 桶
  * @param {string} params.attachmentUUID - 文件uuid
  * @param {string} params.storageCode - 存储配置编码
  * @param {string[]} params.urls - 删除文件
  */
 export async function removeFileList(params) {
   const { urls, ...otherParams } = params;
   const reqUrl = `${HZERO_FILE}/v1/files/delete-by-uuidurl/not-null`;
   return request(reqUrl, {
     method: 'POST',
     body: params.urls,
     query: filterNullValueObject(otherParams),
   });
 }

 /**
  * 删除上传的文件
  * {HZERO_FILE}/v1/files/delete-by-url
  * {HZERO_FILE}/v1/{organizationId}/files/delete-by-url
  * @param {object} params
  * @param {string} params.bucketName
  * @param {string} params.storageCode - 存储配置编码
  */
 export async function removeUploadFile(params) {
   const { urls, ...otherParams } = params;
   const tenantId = getCurrentOrganizationId();
   const reqUrl = isTenantRoleLevel()
     ? `${HZERO_FILE}/v1/${tenantId}/files/delete-by-url`
     : `${HZERO_FILE}/v1/files/delete-by-url`;
   return request(reqUrl, {
     method: 'POST',
     body: urls,
     query: filterNullValueObject(otherParams),
   });
 }

 /**
  * 删除attachmentUUID对应的某一个文件
  * {HZERO_FILE}/v1/files/delete-by-uuidurl
  * todo {HZERO_FILE}/v1/{organizationId}/files/delete-by-uuidurl
  * @export
  * @param {object} params 传递参数
  * @param {string} params.bucketName - 桶
  * @param {string} params.attachmentUUID - 文件uuid
  * @param {string[]} params.urls - 要删除的文件
  */
 export async function removeFile(params) {
   const { urls, ...otherParams } = params;
   const tenantId = getCurrentOrganizationId();
   const reqUrl = isTenantRoleLevel()
     ? `${HZERO_FILE}/v1/${tenantId}/files/delete-by-uuidurl`
     : `${HZERO_FILE}/v1/files/delete-by-uuidurl`;
   return request(reqUrl, {
     method: 'POST',
     body: urls,
     query: filterNullValueObject(otherParams),
   });
 }

 /**
  * 删除attachmentUUID对应的某一个文件(租户级)
  * {HZERO_FILE}/v1/{organizationId}/files/delete-by-uuidurl
  * @export
  * @param {object} params 传递参数
  * @param {string[]} params.urls - 删除的文件
  * @param {string} params.bucketName - 桶
  * @param {string} params.attachmentUUID - 文件uuid
  */
 export async function removeFileOrg(params) {
   const organizationId = getCurrentOrganizationId();
   const { bucketName, attachmentUUID, urls, ...otherParams } = params;
   return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-uuidurl`, {
     method: 'POST',
     query: {
       bucketName,
       attachmentUUID,
       ...filterNullValueObject(otherParams),
     },
     body: urls,
   });
 }

 /**
  * 获取fileList
  * {HZERO_FILE}/v1/files/uuid
  * {HZERO_FILE}/v1/{organizationId}/files/uuid
  * @export
  * @param {object} params 传递参数
  */
 export async function queryUUID(params) {
   const tenantId = getCurrentOrganizationId();
   return request(`${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/uuid`, {
     method: 'POST',
     query: params,
   });
 }

 /**
  * 获取导出Excel的列数据
  * @export
  * @param {object} params 传递参数
  */
 export async function queryColumn(params) {
   const { requestUrl, method } = params;
   return request(`${requestUrl}`, {
     method,
     query: { exportType: 'COLUMN' },
   });
 }

 export interface DownloadFileParams {
   requestUrl: string;
   queryParams?:
     | Array<{
         name: string;
         value: any;
       }>
     | [];
   extraData?:
     | Array<{
         name: string;
         value: any;
       }>
     | [];
   method: 'GET' | 'POST' | 'get' | 'post';
   queryData?: object;
 }

 export interface QueryParams {
   name: string;
   value: any;
 }

 /**
  * 下载
  * @export
  * @param {object} params 传递参数
  * @param {string} params.requestUrl 下载文件请求的url
  * @param {array} params.queryParams 下载文件请求的查询参数，参数格式为：[{ name: '', value: '' }]]
  */
  export async function downloadFile(params: DownloadFileParams, flag?: boolean) {
   const { requestUrl: url, queryParams, method = 'GET' } = params || {};
   let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : url;
   const iframeName = `${url}${Math.random()}`;

   // 构建iframe
   const iframe = document.createElement('iframe');
   iframe.setAttribute('name', iframeName);
   iframe.setAttribute('id', iframeName);
   iframe.style.width = '0px';
   iframe.style.height = '0px';
   iframe.style.display = 'none';

   // 构建form
   const downloadForm = document.createElement('form');
   if (getIeVersion() === -1) {
     // 如果当前浏览器不为ie
     // form 指向 iframe
     downloadForm.setAttribute('target', iframeName);
   }

   // 设置token
   const tokenInput = document.createElement('input');
   tokenInput.setAttribute('type', 'hidden');
   tokenInput.setAttribute('name', 'access_token');
   tokenInput.setAttribute('value', `${getAccessToken()}`);

   // 设置requestId
   const idInput = document.createElement('input');
   idInput.setAttribute('type', 'hidden');
   idInput.setAttribute('name', 'H-Request-Id');
   idInput.setAttribute('value', `${getRequestId()}`);

   // 处理post请求时token效验
   if (method === 'POST') {
     newUrl = `${newUrl}?access_token=${getAccessToken()}&H-Request-Id=${getRequestId()}`;
   }

   // 表单添加请求配置
   downloadForm.setAttribute('method', method);
   downloadForm.setAttribute('action', newUrl);
   if (!flag) {
     downloadForm.appendChild(tokenInput);
     downloadForm.appendChild(idInput);
   }

   // 表单添加查询参数
   if (queryParams && Array.isArray(queryParams)) {
     queryParams.forEach((item) => {
       const input = document.createElement('input');
       input.setAttribute('type', 'hidden');
       input.setAttribute('name', item.name);
       input.setAttribute('value', item.value);
       downloadForm.appendChild(input);
     });
   }

   document.body.appendChild(iframe);
   document.body.appendChild(downloadForm);
   downloadForm.submit();

   // setTimeout(() => {
   //   document.body.removeChild(downloadForm);
   //   document.body.removeChild(iframe);
   // }, 2500);
   return true;
 }

 /**
  * 下载
  * @export
  * @param {object} params 传递参数
  * @param {string} params.requestUrl 下载文件请求的url
  * @param {array} params.queryParams 下载文件请求的查询参数，参数格式为：[{ name: '', value: '' }]]
  */
  export function downloadFileByAxios(params: DownloadFileParams, filename?: string) {
   const { requestUrl: url, queryParams, method = 'GET', queryData } = params || {};
   let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : `${url}`;

   const reg1 = new RegExp(`^${HZERO_FILE}/v1(/[0-9]*)?/files/redirect-url`);
   const reg2 = new RegExp(`^${HZERO_FILE}/v1(/[0-9]*)?/files/download`);

   let fileUrl = '';
   if (reg1.test(newUrl) || reg2.test(newUrl)) {
     if (queryParams && Array.isArray(queryParams)) {
       queryParams.forEach((item) => {
         if (item.name === 'url') {
           fileUrl = item.value ? decodeURIComponent(item.value) : '';
         }
       });
     }

     if (fileUrl) {
       const signedParams = {};
       if (queryParams && Array.isArray(queryParams)) {
         queryParams.forEach((item) => {
           signedParams[item.name] = item.value;
         });
       }
       return querySignedUrl(signedParams)
         .then(async (res) => {
           if (getResponse(res)) {
             const signedUrl = res.substring(0, res.indexOf('?'));
             const signedQueryParams = qs.parse(res.substring(res.indexOf('?') + 1));
             const arr = [] as QueryParams[];
             Object.keys(signedQueryParams).forEach((item) => {
               if (signedQueryParams[item] && item !== url) {
                 arr.push({ name: item, value: signedQueryParams[item] });
               }
             });
             await downloadFile(
               {
                 requestUrl: signedUrl,
                 queryParams: arr,
                 method: 'GET',
               },
               true
             );
           }
           return true;
         })
         .catch((err) => {
           console.error(err);
         });
       // const index = fileUrl.lastIndexOf('/');
       // if (index > -1) {
       //  const uuidFileName = fileUrl.substring(index + 1);
       //   if(!uuidFileName.includes('@')||uuidFileName.length<33){
       //     FILE_NAME = uuidFileName;
       //   }
       //   if(uuidFileName.charAt(32) === '@'){
       //     FILE_NAME = uuidFileName.substring(33);
       //   } else {
       //     FILE_NAME = uuidFileName;
       //   }
       // } else {
       //   FILE_NAME = fileUrl;
       // }

       // const index = fileUrl.indexOf('@');
       // if (index > -1) {
       //   FILE_NAME = fileUrl.substring(index + 1);
       // } else {
       //   const s = fileUrl.split('/');
       //   if (s.length > 1) {
       //     FILE_NAME = s[s.length - 1];
       //   } else {
       //     return downloadFile(params);
       //   }
       // }
     }
   }

   const newParams = {};
   // 表单添加查询参数
   if (queryParams && Array.isArray(queryParams)) {
     if (queryParams.length > 0) {
       if (newUrl.indexOf('?') === -1) {
         newUrl += `?`;
       } else {
         newUrl += `&`;
       }
     }
     queryParams.forEach((item, index) => {
       newParams[item.name] = item.value;
       if (index === 0) {
         newUrl += `${item.name}=${encodeURIComponent(item.value)}`;
       } else {
         newUrl += `&${item.name}=${encodeURIComponent(item.value)}`;
       }
     });
   }

   return withTokenAxios(
     method !== 'GET' && method !== 'get'
       ? {
           url: newUrl,
           method,
           data: queryData,
           baseURL: `${API_HOST}`,
           responseType: 'arraybuffer',
         }
       : {
           url: newUrl,
           method,
           baseURL: `${API_HOST}`,
           responseType: 'arraybuffer',
         }
   ).then((resp) => {
     try {
       const { data, headers } = resp;
       let fileName = '';

       // 提取文件名
       const temp = headers['content-disposition']?.match(
         /[fF][iI][Ll][Ee][Nn][Aa][Mm][Ee]=(.*)/
       )[1];
       fileName = temp;
       if (fileName && (fileName[0] === "'" || fileName[0] === '"')) {
         fileName = fileName.substring(1, fileName.length - 1);
       }

       if (!fileName && filename) {
         fileName = filename;
       }

       if (!fileName) {
         throw Error('cannot get fileName!');
       }

       // 将二进制流转为blob
       const blob = new Blob([data], { type: 'application/octet-stream' });
       if (typeof (window.navigator as any)?.msSaveBlob !== 'undefined') {
         // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
         // eslint-disable-next-line no-unused-expressions
         (window.navigator as any)?.msSaveBlob(blob, decodeURI(fileName));
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
     } catch (e) {
       const enc = new TextDecoder('utf-8');
       let err = {};
       try {
         err = JSON.parse(enc.decode(new Uint8Array(resp.data)));
         notificationType((err as any)?.type, (err as any)?.message);
       } catch (error) {
         console.error(e);
       }
       throw err;
     }
   });
 }

 /**
  * initiateAsyncExport 发起异步导出请求
  * @param {string} params - 参数
  */
 export async function initiateAsyncExport(params) {
   const { requestUrl: url, queryParams, method, queryData } = params;
   let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : url;
   if (queryParams && Object.keys(queryParams).length >= 1) {
     queryParams.forEach((item) => {
       newUrl += `${newUrl.indexOf('?') >= 0 ? '&' : '?'}${item.name}=${encodeURIComponent(
         item.value
       )}`;
     });
   }
   const res =
     method !== 'GET' && method !== 'get'
       ? request(newUrl, {
           method,
           body: queryData,
         })
       : request(newUrl, {
           method,
         });

   // FIXME: @WJC utils need fix
   // @ts-ignore
   return getResponse(res);
 }

 export async function querySignedUrl(params) {
   const tenantId = getCurrentOrganizationId();
   const { url, bucketName, storageCode } = params;
   const reqUrl = `${HZERO_FILE}/v1/${tenantId}/files/signedUrl`;
   const res = await request(reqUrl, {
     method: 'GET',
     query: {
       url,
       bucketName,
       storageCode,
     },
     responseType: 'text',
   });
   return getResponse(res);
 }
