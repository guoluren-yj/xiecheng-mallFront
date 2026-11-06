import { useEffect } from 'react';
import qs from 'qs';
import { isEmpty, isEqual } from 'lodash';
import { getAccessToken, setCookie, getCookie } from 'utils/utils';
import { setSingleRecordService } from '@/services/layoutService';

export const runSingleRecordFunc = () => {
  const search = qs.parse(window.location.search.substring(1)) || {};
  const oldSingleRecordCookie = getCookie('singleRecordCookie') || {};
  if (
    window.location.pathname === '/' &&
    !isEmpty(search) &&
    !isEqual(oldSingleRecordCookie, search)
  ) {
    setCookie('singleRecordCookie', search);
    // 在首页
    setSingleRecordService({
      param: window.location.search.substring(1),
      token: getAccessToken(),
    });
  }
};

export default function useSingleRecord() {
  useEffect(() => {
    runSingleRecordFunc();
  }, [window.location.pathname, window.location.search]);
}
