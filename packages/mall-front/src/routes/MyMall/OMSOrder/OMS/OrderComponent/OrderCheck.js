import React from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox } from 'choerodon-ui';

const OrderCheck = observer(({ orderId, selectOrderIds }) => {
  return (
    <Checkbox
      style={{ marginRight: 7 }}
      checked={selectOrderIds.isSelected(orderId)}
      onClick={() => selectOrderIds.select(orderId)}
    />
  );
});

export default OrderCheck;
