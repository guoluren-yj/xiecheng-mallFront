import React from 'react';
import { TextField } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default function SentAfterSale(props) {
  const { params } = props;

  const handleChange = (value) => {
    params.attributeVarchar1 = value;
  };

  return (
    <>
      <div>{intl.get(`mallf.orderDetail.view.isGoods.sent`).d('是否已发出商品')}?</div>
      {params.afterSaleType === 'RETURN' && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
          <span style={{ flexShrink: 0, marginRight: 8 }}>退货订单号</span>
          <TextField required onChange={(value) => handleChange(value)} />
        </div>
      )}
    </>
  );
}
