import React from 'react';
import { Form } from 'choerodon-ui/pro';

import customizes from 'cuxTools/customizes';
import cuxComponent from 'cuxTools/cuxComponent';

function DefaultForm({ customizeForm, code, form, order }) {
  const changeList = customizes[code] || {};
  return (
    <>
      {order.DS &&
        customizeForm(
          { code, form, changeList, changeParams: { order } },
          <Form dataSet={order.DS} labelLayout="float" columns={3} />
        )}
    </>
  );
}

export default cuxComponent({ path: 'NewBeforeOrder/CustomizeHeaderInfo/DefaultForm' })(
  DefaultForm
);
