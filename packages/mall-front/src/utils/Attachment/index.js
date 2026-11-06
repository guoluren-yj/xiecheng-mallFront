/* eslint-disable global-require */
/* eslint-disable func-names */
import React from 'react';
import { isEmpty, isString } from 'lodash';
import moment from 'moment';
import qs from 'query-string';
import axios from 'axios';
import { message } from 'choerodon-ui';
import { $l } from 'choerodon-ui/pro/lib/locale-context/index.js';
import intl from 'utils/intl';
import {
  getAccessToken,
  getAttachmentUrl,
  getCurrentOrganizationId,
  getResponse,
  isTenantRoleLevel,
} from 'utils/utils';
import request, { getHeader } from 'utils/request';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import { queryFileList, queryUUID, removeFile } from 'services/api';
import { downloadFileByAxios } from 'components/Import/api';
import AttachmentHistory from './AttachmentHistory';

const newUrlPreviewList = [
  'dot',
  'dotx',
  'dotm',
  'odt',
  'fodt',
  'ott',
  'rtf',
  'txt',
  'html',
  'htm',
  'mht',
  'djvu',
  'fb2',
  'epub',
  'xps',
  'xls',
  'xlsx',
  'xlsm',
  'xlt',
  'xltx',
  'xltm',
  'ods',
  'fods',
  'ots',
  'csv',
  'pps',
  'ppsx',
  'ppsm',
  'ppt',
  'pptx',
  'pptm',
  'pot',
  'potx',
  'potm',
  'odp',
  'fodp',
  'otp',
];

const imgs = ['png', 'gif', 'jpg', 'webp', 'jpeg', 'bmp', 'tif', 'pic', 'svg'];
const supportPreviewList = [
  'doc',
  'docx',
  'docm',
  'dot',
  'dotx',
  'dotm',
  'odt',
  'fodt',
  'ott',
  'rtf',
  'txt',
  'html',
  'htm',
  'mht',
  'pdf',
  'djvu',
  'fb2',
  'epub',
  'xps',
  'xls',
  'xlsx',
  'xlsm',
  'xlt',
  'xltx',
  'xltm',
  'ods',
  'fods',
  'ots',
  'csv',
  'pps',
  'ppsx',
  'ppsm',
  'ppt',
  'pptx',
  'pptm',
  'pot',
  'potx',
  'potm',
  'odp',
  'fodp',
  'otp',
];

function download(url) {
  const query = url.split('?');
  const paramStr = query[1];
  const queryParams = paramStr
    ? Object.entries(qs.parse(paramStr)).reduce(
        (list, [name, value]) => (name === 'access_token' ? list : list.concat({ name, value })),
        []
      )
    : [];
  return downloadFileByAxios({ requestUrl: query[0], queryParams, method: 'GET' });
}

const downloadAxios = axios.create({
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json;',
  },
  withCredentials: true,
});
downloadAxios.interceptors.request.use(
  function (config) {
    return {
      ...config,
      headers: {
        ...config.headers,
        ...getHeader(),
      },
    };
  },
  function (err) {
    return Promise.reject(err);
  }
);
downloadAxios.interceptors.response.use(
  function (res) {
    const { status, data } = res;
    if (status === 204 || status === 200) {
      return res;
    }

    if (data && data.failed) {
      throw res;
    } else {
      return res;
    }
  },
  function (err) {
    throw err;
  }
);

function downloadAll(url) {
  return downloadAxios.get(url).then((resp) => {
    const { data, headers } = resp;
    const contentType = headers['content-type'];
    let href;
    let isBlob;
    let fileName = '';
    if (
      contentType.toLowerCase().startsWith('text/plain') ||
      (isString(data) && data.startsWith('http'))
    ) {
      href = data;
    } else {
      const disposition = headers['content-disposition'];
      fileName = disposition
        ? disposition.match(/[fF][iI][Ll][Ee][Nn][Aa][Mm][Ee]=(.*)/)[1]
        : undefined;

      if (fileName && (fileName[0] === "'" || fileName[0] === '"')) {
        fileName = fileName.substring(1, fileName.length - 1);
      }

      if (!fileName) {
        throw Error('cannot get fileName!');
      } // 将二进制流转为blob
      const blob = new Blob([data], {
        type: 'application/octet-stream',
      });

      const { navigator } = window;
      if (navigator && typeof navigator.msSaveBlob !== 'undefined') {
        navigator.msSaveBlob(blob, decodeURI(fileName));
        return;
      } else {
        // 创建新的URL并指向File对象或者Blob对象的地址
        href = window.URL.createObjectURL(blob); // 创建a标签，用于跳转至下载链接
        isBlob = true;
      }
    }
    if (href) {
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = href;
      tempLink.setAttribute('download', decodeURI(fileName)); // 兼容：某些浏览器不支持HTML5的download属性

      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
      } // 挂载a标签

      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink); // 释放blob URL地址
      if (isBlob) {
        window.URL.revokeObjectURL(href);
      }
    }
  });
}

const attachmentConfig = {
  defaultFileKey: 'file',
  defaultFileSize: 500 * 1024 * 1024,
  action: ({ bucketName, bucketDirectory, attachmentUUID }) => {
    const { HZERO_FILE } = getEnvConfig();
    const accessToken = getAccessToken();
    const headers = {
      'Access-Control-Allow-Origin': '*',
      processData: false, // 不会将 data 参数序列化字符串
      // method: 'POST',
      type: 'FORM',
      responseType: 'text',
    };
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    const data = {
      attachmentUUID,
    };
    if (bucketName) {
      data.bucketName = bucketName;
    }
    if (bucketDirectory) {
      data.directory = bucketDirectory;
    }

    return {
      url: isTenantRoleLevel()
        ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/attachment/multipart-with-info`
        : `${HZERO_FILE}/v1/files/attachment/multipart-with-info`,
      headers,
      data,
    };
  },
  fetchList({ attachmentUUID, bucketName, bucketDirectory, isPublic }) {
    const { HZERO_FILE } = getEnvConfig();
    return (isPublic
      ? request(`${HZERO_FILE}/v1/pub/files/${attachmentUUID}/file`)
      : queryFileList({
          tenantId: getCurrentOrganizationId(),
          bucketName,
          directory: bucketDirectory,
          attachmentUUID,
        })
    ).then((response) => {
      if (getResponse(response)) {
        return response.map((file) => ({
          ...file,
          uid: file.fileId,
          name: file.fileName,
          size: file.fileSize,
          type: file.fileType || '',
          url: file.fileUrl,
          creationDate: moment(file.creationDate).toDate(),
          status: 'done',
        }));
      }
      throw new Error(response && response.message);
    });
  },
  batchFetchCount(attachmentUUIDs, { isPublic } = {}) {
    const { HZERO_FILE } = getEnvConfig();
    return request(
      isPublic
        ? `${HZERO_FILE}/v1/pub/files/count/batch`
        : `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/count/batch`,
      {
        method: 'POST',
        body: JSON.stringify(attachmentUUIDs),
      }
    );
  },
  onRemove({ attachment, attachmentUUID, bucketName, bucketDirectory }) {
    return removeFile({
      tenantId: getCurrentOrganizationId(),
      bucketName,
      directory: bucketDirectory,
      attachmentUUID,
      urls: [attachment.url],
    }).then((res) => {
      if (getResponse(res)) {
        message.success(intl.get('hzero.common.notification.success'), undefined, undefined, 'top');
        return true;
      }
      return false;
    });
  },
  onOrderChange({ attachments, bucketName, bucketDirectory, attachmentUUID }) {
    const { HZERO_FILE } = getEnvConfig();
    if (isEmpty(attachments.map((attachment) => attachment.uid))) {
      return;
    }
    request(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/${attachmentUUID}/file/order`, {
      method: 'POST',
      body: JSON.stringify(attachments.map((attachment) => attachment.uid)),
      query: {
        bucketName,
        directory: bucketDirectory,
      },
    });
  },
  getAttachmentUUID() {
    return queryUUID({ tenantId: getCurrentOrganizationId() }).then((result) => result.content);
  },
  getDownloadUrl({ attachment, bucketName, bucketDirectory, storageCode, isPublic }) {
    const { HZERO_FILE } = getEnvConfig();
    if (isPublic) {
      return `${HZERO_FILE}/v1/pub/files/download?url=${encodeURIComponent(attachment.url)}`;
    }
    const url = getAttachmentUrl(
      attachment.url,
      bucketName,
      getCurrentOrganizationId(),
      bucketDirectory,
      storageCode
    );
    return downloadFileByAxios ? () => download(url) : url;
  },
  getDownloadAllUrl({ bucketName, bucketDirectory, storageCode, attachmentUUID, isPublic }) {
    const accessToken = getAccessToken();
    if (!isPublic || accessToken) {
      const { HZERO_FILE } = getEnvConfig();
      const params = qs.stringify({
        attachmentUUID,
        bucketName,
        storageCode,
        directory: bucketDirectory,
      });
      const url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download/compress?${params}`;
      return () => downloadAll(url);
    }
  },
  getPreviewUrl({ attachment, bucketName, bucketDirectory, storageCode, isPublic }) {
    const accessToken = getAccessToken();
    if (!isPublic || accessToken) {
      const { ext, type, url } = attachment;
      const tenantId = getCurrentOrganizationId();
      if (type.startsWith('image') || imgs.includes(ext)) {
        return getAttachmentUrl(url, bucketName, tenantId, bucketDirectory, storageCode);
      }
      if (supportPreviewList.includes(ext)) {
        const { HZERO_FILE } = getEnvConfig();
        // 暂不考虑未登录状态预览附件的场景，因为此前版本似从未支持过，其它附件组件同理
        const prevewUrl = newUrlPreviewList.includes(ext)
          ? isTenantRoleLevel()
            ? `${HZERO_FILE}/v1/${tenantId}/file/preview`
            : `${HZERO_FILE}/v1/file/preview`
          : `${HZERO_FILE}/v1/${tenantId}/file-preview`;
        const params = qs.stringify({
          url,
          bucketName,
          storageCode,
          directory: bucketDirectory,
          access_token: accessToken,
        });
        return `${prevewUrl}?${params}`;
      }
    }
  },
  onUploadSuccess(resp, attachment) {
    attachment.load({
      ...resp,
      uid: resp.fileId,
      name: resp.fileName,
      size: resp.fileSize,
      type: resp.fileType || '',
      url: resp.fileUrl,
      creationDate: moment(resp.creationDate).toDate(),
    });
    message.success($l('Upload', 'upload_success'), undefined, undefined, 'top');
  },
  onUploadError() {},
  renderIcon(attachment, listType) {
    if (listType === 'text') {
      const { ext, type } = attachment;
      if (type.startsWith('image') || imgs.includes(ext)) {
        return require('../../assets/attachment-icons/icon_img.svg');
      }
      if (type === 'application/pdf' || ext === 'pdf') {
        return require('../../assets/attachment-icons/icon_pdf.svg');
      }
      if (['xls', 'xlsx', 'xlsm', 'csv', 'xlt', 'et', 'ett'].includes(ext)) {
        return require('../../assets/attachment-icons/icon_excel.svg');
      }
      if (['doc', 'docx', 'dot', 'wps', 'wpt'].includes(ext)) {
        return require('../../assets/attachment-icons/icon_word.svg');
      }
      if (['ppt', 'pptx', 'pot', 'pps', 'dps', 'dpt'].includes(ext)) {
        return require('../../assets/attachment-icons/icon_ppt.svg');
      }
      if (['txt', 'conf'].includes(ext)) {
        return require('../../assets/attachment-icons/icon_txt.svg');
      }
      if (
        type.startsWith('video') ||
        type.startsWith('audio') ||
        [
          'mp3',
          'mid',
          'aif',
          'vqf',
          'wav',
          'mp4',
          'avi',
          'mpg',
          'dat',
          'rm',
          'asf',
          'mov',
          'qt',
          'navi',
        ].includes(ext)
      ) {
        return require('../../assets/attachment-icons/icon_mov.svg');
      }
      if (
        ['application/zip', 'application/x-zip-compressed', 'application/x-compressed'].includes(
          type
        ) ||
        ['rar', 'zip', 'tgz', '7z'].includes(ext)
      ) {
        return require('../../assets/attachment-icons/icon_zip.svg');
      }
      if (['java', 'JAVA', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'sql', 'yml'].includes(ext)) {
        return require('../../assets/attachment-icons/icon_code.svg');
      }
      return require('../../assets/attachment-icons/icon_unknow.svg');
    }
  },
  renderHistory({ attachment }) {
    return <AttachmentHistory attachment={attachment} />;
  },
};

export default attachmentConfig;
