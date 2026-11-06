import React from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default function ReqFooter({ handleSubmit, handleBackCart, loading }) {
  return (
    <div className="footer">
      <Button
        title={intl.get(`mallf.companyOrder.model.companyOrder.returnCart`).d('返回购物车')}
        onClick={() => handleBackCart()}
      >
        {intl.get(`mallf.companyOrder.model.companyOrder.returnCart`).d('返回购物车')}
      </Button>
      <Button
        waitType="throttle"
        wait={500}
        color="primary"
        onClick={() => handleSubmit()}
        loading={loading}
        disabled={loading}
        title={intl.get(`mallf.common.button.submit`).d('提交')}
      >
        {intl.get(`mallf.common.button.submit`).d('提交')}
      </Button>
    </div>
  );
}
