import React from 'react';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import AddrssList from '../AddressList';
import styles from './index.less';

function AddressManage() {
  return (
    <div className={styles.content}>
      <p style={{ fontSize: 16, fontWeight: 600, color: '#191919', marginBottom: 20 }}>
        {intl.get(`mallf.common.view.receiveAddress`).d('收货地址')}
      </p>
      <div className="address-list">
        <AddrssList />
      </div>
    </div>
  );
}
export default formatterCollections({ code: ['mallf.addressManage'] })(AddressManage);
