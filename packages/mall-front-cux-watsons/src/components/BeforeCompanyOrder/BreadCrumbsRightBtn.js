import React, { useMemo } from 'react';
import { Icon } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import { uniq } from 'lodash';

import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { showContractInfoModal } from '../ContractInfoModal';

function BreadCrumbsRightBtn({ orderData }) {
  const CMSList = useMemo(() => {
    return orderData.reduce((pre, curr) => {
      const list = uniq(curr.shoppingCartDTOList.map((n) => n.cmsNumber || '-1')) || [];
      pre.push(...list);
      return uniq(pre);
    }, []);
  }, [orderData]);
  const multiPcNumOrTitle = CMSList.join(',');
  return (
    <>
      <span
        r-if={orderData.length > 1}
        style={{
          lineHeight: '23px',
          color: getUserConfigInfo().theme['warning-color'],
        }}
      >
        <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
        {intl
          .get('mallf.companyOrder.view.orderQuantityPrompt', {
            value: orderData?.length,
          })
          .d(`根据您的拆单规则，本次采购申请拆分为${orderData?.length}个采购申请单`)}
      </span>
      <Button
        color="primary"
        onClick={() => showContractInfoModal({ multiPcNumOrTitle })}
        style={{ marginLeft: 10 }}
      >
        {intl.get('mcux.companyOrder.button.contractInfo').d('关联合同')}
      </Button>
    </>
  );
}

export default formatterCollections({ code: ['scux.contractInfoModal', 'mcux.companyOrder'] })(
  BreadCrumbsRightBtn
);
