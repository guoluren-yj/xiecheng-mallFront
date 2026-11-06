import React, { useMemo, useEffect } from 'react';
import { DataSet, Form } from 'choerodon-ui/pro';

import cuxComonent from 'cuxTools/cuxComponent';
import { getUserConfig } from 'utils/utils';

function DefaultForm({ customizeForm, code, form, order, setCtxParams, setOrderData, orderIndex }) {
  const initDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [{ name: 'remark' }, { name: 'prTypeCode' }, { name: 'prTypeId' }],
      }),
    []
  );
  useEffect(() => {
    setCtxParams({ ...getUserConfig() });
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].DS = initDs;
      return newOrderData;
    });
    if (initDs.current) {
      const { DS, ...other } = order;
      initDs.current.set({
        companyLov: order.companyLov,
        invOrganizationLov: order.invOrganizationLov,
        purchaseOrgLov: order.purchaseOrgLov,
        ouLov: order.ouLov,
        productSource: order.shoppingCartDTOList[0]?.productSource,
        ...other,
      });
    }
  }, [order]);
  return (
    <>{customizeForm({ code, form }, <Form dataSet={initDs} labelLayout="float" columns={3} />)}</>
  );
}

export default cuxComonent({ path: 'BeforeCompanyOrder/CustomizeHeaderInfo/DefaultForm' })(
  DefaultForm
);
