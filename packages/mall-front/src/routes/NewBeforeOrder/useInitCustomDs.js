import { useEffect, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';

import CuxFn from '@/cuxTools/cuxFn';

export default function useInitCustomDs({ order, setOrderData, orderIndex, preOrder }) {
  const { DS, ...other } = order;
  const initDs = useMemo(
    () =>
      new DataSet({
        autoCreate: false,
        forceValidate: true,
        fields: [{ name: 'remark' }, { name: 'prTypeCode' }, { name: 'prTypeId' }],
        events: {
          update: ({ name, value }) => {
            CuxFn({
              name: 'NewBeforeOrder-fn-CustomizeHeaderInfo-changeHeaderRemark',
              value: {
                name,
                value,
                orderIndex,
                setOrderData,
              },
            })();
          },
        },
      }),
    []
  );
  useEffect(() => {
    if (!order.DS) {
      initDs.loadData([
        {
          companyLov: order.companyLov,
          invOrganizationLov: order.invOrganizationLov,
          purchaseOrgLov: order.purchaseOrgLov,
          ouLov: order.ouLov,
          attachmentUuid: order.attachmentUuid,
          ...other,
        },
      ]);
      setOrderData((data) => {
        const newOrderData = [...data];
        newOrderData[orderIndex].DS = initDs;
        return newOrderData;
      });
    }
  }, [order.DS]);

  CuxFn({
    name: 'NewBeforeOrder--fn-CustomizeHeaderInfo-init',
    value: {
      preOrder,
      order,
    },
  })();
}
