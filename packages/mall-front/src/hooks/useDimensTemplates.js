import { getUserConfigInfo } from '@/utils/utils';
import { useEffect, useState } from 'react';
import { fetchDimensionTemplates } from 'services/newCartService';
// import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import { getResponse } from 'utils/utils';

export default function useDimensTemplates(props) {
  const { unitId, isNewCart = false } = getUserConfigInfo();
  const { needLoadFlag = false } = props || {};
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true); // loading判断
  useEffect(() => {
    if (isNewCart) {
      setLoading(true);
      fetchDimensionTemplates({ unitId: props?.unitId || unitId }).then((res) => {
        if (getResponse(res)) {
          setTemplates(res);
        }
        setLoading(false);
        // getDvaApp()._store.dispatch({
        //   type: 'global/update',
        //   payload: {
        //     cartTemplates: res,
        //   },
        // });
      });
    }
  }, [isNewCart]);
  return needLoadFlag ? [templates, loading] : templates;
}
