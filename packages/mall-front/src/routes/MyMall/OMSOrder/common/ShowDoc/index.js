import { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { fetchDocPermissionApi } from 'services/orderCenterService';

const getDocPermission = (() => {
  let permission = {};
  let isLoading = false;
  const loadingList = [];
  const defaultPermission = {
    // 默认
    displayDoc: '0',
    displayDocFlow: '1',
  };
  return async () => {
    if (!isEmpty(permission) && !isLoading) {
      return permission;
    } else if (isLoading) {
      return new Promise((reslove) => {
        loadingList.push(reslove);
      });
    } else {
      isLoading = true;
      const res = await fetchDocPermissionApi();
      isLoading = false;
      if (res) {
        permission = res;
      } else {
        permission = defaultPermission;
      }
      if (loadingList.length) {
        loadingList.forEach((reslove) => reslove(permission));
        loadingList.length = 0;
      }
      return permission;
    }
  };
})();

export default function ShowDoc(props) {
  const { type = 'displayDoc', children } = props || {};
  const [docPermissionObj, setDocPermissionObj] = useState({});

  useEffect(() => {
    getPermission();
  }, [type]);

  const getPermission = async () => {
    const permissionRes = await getDocPermission();
    setDocPermissionObj(permissionRes);
  };

  return docPermissionObj[type] === '1' ? children : null;
}
