import React from 'react';
import { Form, DatePicker } from 'choerodon-ui/pro';

export default function DefaultForm(props) {
  const { visible, product, code, dataSet, cSupply } = props;
  return (
    <>
      {visible && product.DS !== undefined
        ? cSupply(
            { code, dataSet },
            <Form record={product.DS} labelLayout="float" columns={1}>
              <DatePicker disabled name="neededDate" />
            </Form>
          )
        : null}
    </>
  );
}
