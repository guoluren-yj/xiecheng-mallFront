import React, { useMemo, useEffect } from 'react';
import { Form, Output, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default function InvoiceModal(props) {
  const { purOrderExtra = {} } = props?.order || {};
  const formDs = useMemo(() => {
    return new DataSet({
      //   data: purOrderExtra,
      fields: [
        {
          name: 'invoiceStateName',
          label: intl.get('mallf.orderDetail.model.invoiceMethod').d('开票方式'),
        },
        {
          name: 'invoiceTypeName',
          label: intl.get('mallf.orderDetail.model.invoiceType').d('发票类型'),
        },
        {
          name: 'invoiceContentName',
          label: intl.get('mallf.orderDetail.model.invoiceDetail').d('开票明细'),
        },
        {
          name: 'invoiceTitleTypeName',
          label: intl.get('mallf.orderDetail.model.invoiceModus').d('发票形式'),
        },
        {
          name: 'invoiceTitle',
          label: intl.get('mallf.orderDetail.model.invoiceRaise').d('发票抬头'),
        },
        {
          name: 'taxRegisterNum',
          label: intl.get('mallf.orderDetail.model.taxPayer.idNum').d('纳税人识别号'),
        },
        {
          name: 'depositBank',
          label: intl.get('mallf.orderDetail.model.account.bank').d('开户行'),
        },
        {
          name: 'bankAccount',
          label: intl.get('mallf.orderDetail.model.account.number').d('开户账号'),
        },
      ],
    });
  }, []);

  useEffect(() => {
    formDs.create(purOrderExtra);
  }, []);

  return (
    <Form
      dataSet={formDs}
      columns={1}
      className="c7n-pro-vertical-form-display"
      labelLayout="horizontal"
    >
      <Output name="invoiceStateName" />
      <Output name="invoiceTypeName" />
      <Output name="invoiceContentName" />
      <Output name="invoiceTitleTypeName" />
      <Output name="invoiceTitle" />
      <Output name="taxRegisterNum" />
      <Output name="depositBank" />
      <Output name="bankAccount" />
    </Form>
  );
}
