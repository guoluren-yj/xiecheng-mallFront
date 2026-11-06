import React from 'react';
import { Form, Lov } from 'choerodon-ui/pro';

export default function UnitForm({ dataSet }) {
  return (
    <Form dataSet={dataSet} labelLayout="float" columns={1}>
      <Lov name="unitLov" />
      <Lov name="companyLov" />
    </Form>
  );
}
