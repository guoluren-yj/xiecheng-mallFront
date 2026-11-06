import React, { useMemo, useEffect } from 'react';
import { DataSet, Form, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getOrganizationId } from 'utils/utils';

export default function DefaultForm({
  customizeForm,
  code,
  form,
  order,
  // setCtxParams,
  setOrderData,
  orderIndex,
}) {
  const { ouId, companyId } = order?.shoppingCartDTOList[0];
  const initDs = useMemo(() => {
    const fields = [
      {
        name: 'attributeVarchar15Lov',
        type: 'object',
        lovCode: 'SPRM.COST_CENTER',
        label: intl.get('mallf.common.view.cost.shopping.project').d('费用项目'),
        lovPara: {
          ouId,
          companyId,
          tenantId: getOrganizationId(),
        },
        valueField: 'costCode',
        textField: 'costName',
      },
      {
        name: 'attributeVarchar15',
        bind: 'attributeVarchar15Lov.costCode',
      },
      {
        name: 'attributeVarchar15Meaning',
        bind: 'attributeVarchar15Lov.costName',
      },
      {
        name: 'purchaseAgentIdLov',
        type: 'object',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        lovCode: 'SPUC.PURCHASE_AGENT',
        lovPara: { purchaseOrgIds: order.shoppingCartDTOList[0].purOrganizationId },
        label: intl.get('mallf.common.model.purchaseAgent').d('采购员'),
        transformResponse: (_, { purchaseOrgId, purchaseOrgName }) => {
          return purchaseOrgId ? { purchaseOrgId, purchaseOrgName } : null;
        },
      },
      {
        bind: 'purchaseAgentIdLov.purchaseAgentId',
        name: 'purchaseAgentId',
        type: 'string',
      },
    ];
    return new DataSet({ autoCreate: true, fields });
  }, []);
  useEffect(() => {
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].DS = initDs;
      return newOrderData;
    });
  }, []);

  return (
    <>
      {customizeForm(
        { code, form },
        <Form dataSet={initDs} labelLayout="float" columns={3}>
          <Lov name="attributeVarchar15Lov" />
          <Lov name="purchaseAgentIdLov" />
        </Form>
      )}
    </>
  );
}
