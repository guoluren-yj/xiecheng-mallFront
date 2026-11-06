import React from 'react';
import { Form, Lov } from 'choerodon-ui/pro';

export default function DefaultForm(props) {
  const { visible, product, code, dataSet, cSupply } = props;

  return (
    <>
      {visible && product.DS !== undefined
        ? cSupply(
            { code, dataSet },
            <Form record={product.DS} labelLayout="float" columns={1}>
              <Lov name="attributeVarchar1Lov" />
            </Form>
          )
        : null}
    </>
  );
}
