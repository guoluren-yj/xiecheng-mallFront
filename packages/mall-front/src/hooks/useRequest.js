/**
 * request.js 通用请求
 * @date 2019/12/09
 * @author peng.yang05@hand-china.com
 * @copyright Copyright (c) 2019, Hand
 */
import { useState, useEffect } from 'react';
import {
  catchHttpError,
  getAccessToken,
  generateUrlWithGetParam,
  getOrganizationId,
} from 'utils/utils';
import { apiGateway } from 'utils/api-config';
import swalAlert from 'components/swal';

export default function useRequest(params = {}) {
  const {
    url = '',
    query = {},
    method = 'GET',
    body,
    headers = {},
    dataType = 'json',
    success = (e) => e, // 请求成功
    error = (e) => e, // 抛出异常
    failCallBack = (e) => e, // 网络出错的回调函数
  } = params;
  const newUrl = generateUrlWithGetParam(
    url?.startsWith('http') ? url : `${apiGateway}${url}`,
    query
  )?.replace('{organizationId}', getOrganizationId());

  const [loading, setLoading] = useState(true);
  const [resData, setResData] = useState(null);

  const config = {
    method,
    headers: getHeader(headers),
  };
  if (body) {
    config.body = JSON.stringify(body);
  }

  useEffect(() => {
    fetch(newUrl, config)
      .then((response) => {
        return new Promise((resolveStatus, rejectStatus) => {
          if (response.status === 204) {
            // 204 no content则直接返回{}
            resolveStatus({});
            return false;
          }
          if (response.ok) {
            resolveStatus(response[dataType]());
          } else {
            failCallBack();
            rejectStatus(response);
          }
        });
      })
      .then((response) => {
        if (response.failed !== true) {
          setResData(response);
          success(response);
        } else {
          error(response);
          swalAlert(response.message);
        }
        setLoading(false);
      })
      .catch(catchHttpError());
  }, []);

  return {
    loading,
    resData,
  };
}

/**
 * 默认headers
 */
function getHeader(headerInfo = {}) {
  const headers = {
    'Content-type': 'application/json;charset=UTF-8', // 默认格式
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    ...headerInfo,
  };
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}
