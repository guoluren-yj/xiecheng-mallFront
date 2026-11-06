import React from 'react';
import { Form } from 'choerodon-ui/pro';
import cuxComponent from 'cuxTools/cuxComponent';

function DefaultForm(props) {
  const { visible, product, code, dataSet, cSupply } = props;
  return (
    <>
      {visible && product.DS !== undefined
        ? cSupply({ code, dataSet }, <Form record={product.DS} labelLayout="float" columns={1} />)
        : null}
    </>
  );
}

export default cuxComponent({ path: 'NewBeforeOrder/CustomizeModal/DefaultForm' })(DefaultForm);
