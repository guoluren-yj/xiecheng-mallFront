import { getUserConfigInfo } from '@/utils/utils';
import { useEffect, useState } from 'react';
import { isUseOms } from 'services/cartService';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';

export default function useOmsFlag() {
  const [isOMS, setOmsFlag] = useState(undefined);
  useEffect(() => {
    if (getUserConfigInfo().isOMS === undefined) {
      isUseOms().then((res) => {
        setOmsFlag(res);
        getDvaApp()._store.dispatch({
          type: 'global/update',
          payload: {
            isOMS: res,
          },
        });
      });
    } else {
      setOmsFlag(getUserConfigInfo().isOMS);
    }
  }, []);
  return isOMS;
}
