import { FC, ReactNode, RefObject} from 'react';
import { useImperativeHandle } from 'react';
import React, { useMemo, useState, useCallback } from 'react';
import { isString, isArray } from 'lodash';

import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import intl from 'hzero-front/lib/utils/intl';
import request from 'hzero-front/lib/utils/request';
import notification from 'hzero-front/lib/utils/notification';
import { HZERO_RPT } from 'hzero-front/lib/utils/config';
import { getResponse, getCurrentOrganizationId, isTenantRoleLevel, getCurrentLanguage } from 'hzero-front/lib/utils/utils';
import {  basePath as BASE_PATH } from 'utils/api-config';

function checkPrintWindow() {
    const { userAgent } = window.navigator;
    // 目前仅飞书内置浏览出现此问题，此处为排除飞书浏览器
    return !/Lark\/(\S+)/i.test(userAgent) && !/DingTalk/i.test(userAgent);
}

async function getPdfPreviewUrl({ fileUrl, bucketName, fileToken }) {
// 默认5分钟有效期
// const _sac = await getSRMAccessCode({ expires: 300 });
return `/hfle/v1/${getCurrentOrganizationId()}/file-preview-with-token?url=${fileUrl}&bucketName=${bucketName}&_fileToken=${fileToken}`;
// return `/hfle/v1/${getCurrentOrganizationId()}/file-preview-with-token?url=${fileUrl}&bucketName=${bucketName}&_fileToken=${fileToken}&_sac=${_sac}`;
}
  
interface IPrintProButtonProps {
  method?: 'GET' | 'POST'; // API 请求方式
  requestUrl: string; // API 请求地址
  params?: any; // url 传参
  data?: any; // body 传参
  requestProps?: { [key: string]: string }; // API 额外属性配置
  buttonProps?: { [key: string]: string }; // 按钮额外属性配置
  buttonText?: string | ReactNode; // 按钮显示文本
  outType?: 'PDF' | 'EXCEL'; // 输出文件类型
  successCallBack?: () => void; // 打印成功回调
  errorCallBack?: () => void; // 打印失败回调
  printRef?: RefObject<{handlePrint: Function;}>;
  loading?: boolean;
}

const PrintProButton: FC<IPrintProButtonProps> = ({
  method = 'GET',
  requestUrl,
  params,
  data,
  buttonText,
  requestProps = {},
  buttonProps = {},
  outType = 'PDF',
  successCallBack,
  errorCallBack,
  printRef,
  loading: propsLoading,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const flag: boolean = useMemo(() => checkPrintWindow(), []);

  const downloadFile = useCallback((url) => {
    if (flag) {
      // form表单提交方式
      const iframeName = `${url}${Math.random()}`;
      // 构建iframe
      const iframe = document.createElement('iframe');
      iframe.setAttribute('name', iframeName);
      iframe.setAttribute('id', iframeName);
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      const link = document.createElement('a');
      link.href = url;
      link.target = iframeName;
      link.click();
    } else {
      // 飞书会拦截不同源url,此处跳转到中转页面下载
      window.open(`${BASE_PATH || '/'}public/download-file?language=${getCurrentLanguage()}&target=${encodeURIComponent(url)}`);
    }
  }, []);

  const handlePreview = useCallback((token) => {
    setLoading(true);
    request(
      isTenantRoleLevel() ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print/file` : `${HZERO_RPT}/v1/print/file`, {
      method: 'POST',
      body: isArray(token) ? token : [token],
      headers: flag || outType === 'EXCEL' ? {} : { 's-print-using-preview': '1' },
      responseType: flag || outType === 'EXCEL' ? 'text' : 'json',
      query: {
        outType,
      },
    }).then(resp => {
      if (isString(resp)) {
        if (resp.indexOf('failed') !== -1) {
          try {
            const result = JSON.parse(resp);
            getResponse(result, errorCallBack);
          } catch (e) {
            notification.error({});
          }
        } else if (outType === 'EXCEL') {
          if (successCallBack) {
            successCallBack();
          }
          downloadFile(resp);
        } else if (flag) {
          if (successCallBack) {
            successCallBack();
          }
          const xhr = new XMLHttpRequest();
          xhr.open('get', resp, true);
          xhr.responseType = 'blob';
          xhr.onload = () => {
            if (xhr.status === 200) {
              const type = xhr.getResponseHeader('Content-Type') || 'application/pdf';
              const blob = new Blob([xhr.response], { type });
              if (typeof (window.navigator as any).msSaveBlob !== 'undefined') {
                // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
                (window.navigator as any).msSaveBlob(blob, decodeURI('preview.pdf'));
              } else {
                const URL = window.URL || window.webkitURL;
                const blobURL = URL.createObjectURL(blob);
                window.open(blobURL);
              }
            }
          };
          xhr.send();
        }
      } else if (!flag && resp && getResponse(resp)) {
        if (successCallBack) {
          successCallBack();
        }
        const { bucketName, fileToken, fileUrl } = resp;
        getPdfPreviewUrl({ fileUrl, bucketName, fileToken }).then(url => {
          window.open(url);
        });
      }
    }).finally(() => {
      setLoading(false);
    });
  }, [flag, outType, successCallBack, errorCallBack]);

  const handlePrint = useCallback(() => {
    setLoading(true);
    let queryParams = params;
    if (typeof params === 'function') {
      queryParams = params();
    }
    let bodyData = data;
    if (typeof data === 'function') {
      bodyData = data();
    }
    request(requestUrl, {
      method,
      query: queryParams,
      body: bodyData,
      ...requestProps,
    }).then(res => {
      if (getResponse(res)) {
        handlePreview(res);
      } else {
        setLoading(false);
      }
    });
  }, [requestUrl, method, params, data, requestProps, handlePreview]);

  useImperativeHandle(printRef, () => ({ handlePrint }), [handlePrint]);
  return (
    <ButtonPermission
      type="c7n-pro"
      icon="print"
      {...buttonProps}
      loading={loading || propsLoading}
      onClick={handlePrint}
    >
      {buttonText || intl.get('hzero.common.button.print').d('打印')}
    </ButtonPermission>
  );
};

export default PrintProButton;
