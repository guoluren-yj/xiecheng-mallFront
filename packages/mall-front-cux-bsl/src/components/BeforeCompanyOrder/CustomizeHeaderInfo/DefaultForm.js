import React, { useMemo, useEffect } from 'react';
import { DataSet, Form, Select, Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getUserConfigInfo, getUserConfig } from 'utils/utils';

export default function DefaultForm({
  customizeForm,
  code,
  form,
  order,
  setCtxParams,
  setOrderData,
  orderIndex,
}) {
  const { ouCode, ouName = '' } = order?.shoppingCartDTOList[0] || {}; // 20007 20034 20035 20001 20007-JRY
  const isShowTypeSelect = ['20007', '20034', '20035', '20001', '20007-JRY'].includes(ouCode);
  const initDs = useMemo(() => {
    const fields = [
      {
        name: 'attributeBigint30Lov',
        type: 'object',
      },
      {
        name: 'attributeBigint30',
        bind: 'attributeBigint30Lov.unitId',
      },
      {
        name: 'attributeBigint30Meaning',
        bind: 'attributeBigint30Lov.unitName',
      },
    ];
    if (isShowTypeSelect) {
      fields.push({
        required: true,
        name: 'attributeVarchar2',
        lookupCode: 'SCUX.BSL.SPUC_ORG_CATEGORY',
        label: intl.get('mallf.common.model.organizationId.type').d('组织类别'),
      });
    }
    return new DataSet({ autoCreate: true, fields });
  }, []);
  useEffect(() => {
    setCtxParams({ ...getUserConfig() });
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].DS = initDs;
      return newOrderData;
    });
  }, []);

  useEffect(() => {
    const {
      userInfo: { realName, id },
      // defaultAddress = {},
    } = getUserConfigInfo();
    // initDs.current.set('contactTelNum', defaultAddress?.mobile || '');
    initDs.current.set('requestedBy', id);
    initDs.current.set('requestedByMeaning', realName);
    if (order.attributeBigint30) {
      initDs.current.set('attributeBigint30', order.attributeBigint30);
      initDs.current.set('attributeBigint30Meaning', order.attributeBigint30Meaning);
    }
    if (order.attributeVarchar12) {
      initDs.current.set('attributeVarchar12', order.attributeVarchar12);
      initDs.current.set('attributeVarchar12Meaning', order.attributeVarchar12Meaning);
    }
  }, [order.attributeBigint30]);

  return (
    <>
      {customizeForm(
        { code, form },
        <Form dataSet={initDs} labelLayout="float" columns={3}>
          {isShowTypeSelect && <Select name="attributeVarchar2" />}
          <Output
            label={intl.get('mallf.common.model.view.titlePre').d('标题预览')}
            name="titlePre"
            renderer={({ record }) => {
              const { attributeLongtext12 = '', prNum = '' } =
                record?.get(['attributeLongtext12', 'prNum']) || {};
              return (
                <>
                  {attributeLongtext12}
                  {attributeLongtext12 ? '-' : ''}
                  {ouName}
                  {prNum || 'REQ20XXXXXX00005'}
                </>
              );
            }}
          />
        </Form>
      )}
    </>
  );
}
