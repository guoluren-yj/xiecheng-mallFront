import React, { useMemo, useEffect } from 'react';
import { DataSet, Form } from 'choerodon-ui/pro';

import { getUserConfig, getOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { isEmpty } from 'lodash';

export default function DefaultForm({
  customizeForm,
  code,
  form,
  order,
  setCtxParams,
  setOrderData,
  orderIndex,
}) {
  const initDs = useMemo(() => {
    const fields = [
      {
        name: 'purchaseAgentIdLov',
        type: 'object',
        lovPara: {
          tenantId: getOrganizationId(),
          purchaseOrgIds: order?.shoppingCartDTOList[0]?.purOrganizationId,
        },
      },
    ];
    return new DataSet({ autoCreate: true, fields });
  }, []);

  useEffect(() => {
    request(
      `/sprm/v1/${getOrganizationId()}/purchase-requests/agent?purchaseOrgId=${
        order?.shoppingCartDTOList[0]?.purOrganizationId
      }`
    ).then((res) => {
      if (!isEmpty(res)) {
        initDs.current.set('purchaseAgentIdLov', res);
      }
    });
  }, []);

  useEffect(() => {
    setCtxParams({ ...getUserConfig() });
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].DS = initDs;
      return newOrderData;
    });
  }, []);

  return (
    <>{customizeForm({ code, form }, <Form dataSet={initDs} labelLayout="float" columns={3} />)}</>
  );
}
