import qs from 'qs';
import { filterNullValueObject, setCookie, getAllCookies } from 'utils/utils';

export const layoutInit = () => {
  const dedouSearch = qs.parse(window.location.search.substr(1));
  const dedouCookies = getAllCookies();
  if (dedouSearch.employeeNum && dedouSearch.nonceStr && dedouSearch.fromSource) {
    setCookie('SRM-DEDOU', filterNullValueObject(dedouSearch));
  } else if (dedouCookies.employeeNum && dedouCookies.nonceStr && dedouCookies.fromSource) {
    setCookie('SRM-DEDOU', filterNullValueObject(dedouCookies));
  }
};
