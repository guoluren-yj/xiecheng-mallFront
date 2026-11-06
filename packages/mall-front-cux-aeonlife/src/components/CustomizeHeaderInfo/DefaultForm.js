/* eslint-disable no-param-reassign */
import React, { useMemo, useEffect } from 'react';
import { DataSet, Form, Select } from 'choerodon-ui/pro';

import { getUserConfig } from 'utils/utils';

export default function DefaultForm({
  customizeForm,
  code,
  form,
  order,
  setCtxParams,
  setOrderData,
  orderIndex,
  initInvoiceData,
}) {
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
    initDs.current.set({
      companyLov: order.companyLov,
      invOrganizationLov: order.invOrganizationLov,
      purchaseOrgLov: order.purchaseOrgLov,
      ouLov: order.ouLov,
    });
  }, [order]);

  const currentInvoice = useMemo(() => {
    return order.ecPlatform && order.ecPlatform !== 'CATA'
      ? initInvoiceData[`${order.ecPlatform}1invoiceData`] || {}
      : {};
  }, [initInvoiceData]);

  useEffect(() => {
    if (order.ecPlatform && order.ecPlatform !== 'CATA') {
      const { methodAndTypeList = [] } = currentInvoice || {};
      const isInList = methodAndTypeList?.some(
        (i) => i.invoiceType === order.invoiceTypeCode && i.invoiceMethod === order.invoiceTypeCode
      );
      if (order.DS) {
        order.DS.current.set(
          'attributeVarchar1',
          order.invoiceMethodCode === '1' ? 'COMPANY' : 'PERSON'
        );
      }
      if (!isInList) {
        // 开票方式与发票类型不符合配置
        setOrderData((data) => {
          const newOrderData = [...data];
          newOrderData[orderIndex].invoiceTypeCode = '';
          newOrderData[orderIndex].invoiceTypeName = '';
          return newOrderData;
        });
      }
    }
  }, [order.invoiceMethodCode]);

  return (
    <>
      {customizeForm(
        { code, form },
        <Form dataSet={initDs} labelLayout="float" columns={3}>
          <Select
            clearButton={false}
            name="attributeVarchar1"
            onChange={(e) => {
              if (order.ecPlatform && order.ecPlatform !== 'CATA') {
                const { invoiceMethod = [] } = currentInvoice || {};
                const { valueCode, valueName } =
                  invoiceMethod.find((m) => m.valueCode === (e === 'COMPANY' ? '1' : '2')) || {};
                setOrderData((data) => {
                  const newOrderData = [...data];
                  newOrderData[orderIndex].invoiceMethodCode = valueCode;
                  newOrderData[orderIndex].invoiceStatusName = valueName;
                  return newOrderData;
                });
              }
            }}
          />
        </Form>
      )}
    </>
  );
}
