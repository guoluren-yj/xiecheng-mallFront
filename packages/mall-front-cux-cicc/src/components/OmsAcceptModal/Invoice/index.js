import React from 'react';

import { Form, TextField, Lov } from 'choerodon-ui/pro';

export default function Invoice({ dataSet, productName }) {
  return (
    <>
      <p style={{ fontSize: 14, marginBottom: 20, marginLeft: 10 }}>{productName}</p>
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <Lov name="invoiceUser" />
        <TextField name="invoiceAddress" />
      </Form>
    </>
  );
}
