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
          label: intl.get('mallf.orderDetail.model.invoiceTypeName').d('发票类型'),
        },
        {
          name: 'invoiceContentName',
          label: intl.get('mallf.myMall.model.invoiceContentName').d('开票明细'),
        },
        {
          name: 'invoiceTitleTypeName',
          label: intl.get('mallf.orderDetail.model.invoiceModus').d('发票形式'),
        },
        {
          name: 'invoiceTitle',
          label: intl.get('mallf.orderDetail.model.invoiceTitle').d('发票抬头'),
        },
        {
          name: 'taxRegisterNum',
          label: intl.get('mallf.orderDetail.model.taxRegisterNum').d('纳税人识别号'),
        },
        {
          name: 'depositBank',
          label: intl.get('mallf.orderDetail.model.openingBank').d('开户行'),
        },
        {
          name: 'bankAccount',
          label: intl.get('mallf.orderDetail.model.bankAccount').d('开户账号'),
        },
        {
          name: 'invoiceEmail',
          label: intl.get('hzero.common.button.email').d('邮箱'),
        },
        {
          name: 'invoiceRemark',
          label: intl.get('hzero.common.button.remark').d('备注'),
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
      <Output name="invoiceEmail" />
      <Output name="invoiceRemark" />
    </Form>
  );
}
