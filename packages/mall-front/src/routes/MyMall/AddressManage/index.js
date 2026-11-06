import React, { useState } from 'react';
import { Radio } from 'choerodon-ui';

import intl from 'utils/intl';
import { invoiceAddress } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import AddrssList from '../AddressList';
import AcquirerAddress from '../AcquirerAddress';
import styles from './index.less';

function AddressManage() {
  const [activeKey, setActiveKey] = useState(1);

  return (
    <div className={styles.content}>
      <Radio.Group
        onChange={(e) => setActiveKey(e.target.value)}
        value={activeKey}
        // style={{ float: 'left', width: '100%' }}
        style={{ width: '100%' }}
        size="large"
      >
        <Radio.Button
          title={intl.get(`mallf.addressManage.view.receiveAddress`).d('收货地址')}
          value={1}
        >
          {intl.get(`mallf.addressManage.view.receiveAddress`).d('收货地址')}
        </Radio.Button>
        <PermissionWrapper permissionList={[invoiceAddress]}>
          <Radio.Button
            title={intl.get('mallf.addressManage.view.myMall.acAdress').d('收单地址')}
            value={2}
          >
            {intl.get('mallf.addressManage.view.myMall.acAdress').d('收单地址')}
          </Radio.Button>
        </PermissionWrapper>
      </Radio.Group>

      {activeKey === 1 && (
        <div className="address-list">
          <AddrssList />
        </div>
      )}

      {activeKey === 2 && (
        <div className="address-list">
          <AcquirerAddress />
        </div>
      )}
    </div>
  );
}

export default formatterCollections({ code: ['mallf.addressManage'] })(AddressManage);
