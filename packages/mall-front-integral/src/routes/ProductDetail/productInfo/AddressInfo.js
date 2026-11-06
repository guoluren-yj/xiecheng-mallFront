import React from 'react';

import { getPrimaryColor, getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';
import AddressLov from '@/components/AddressLov/index';

export default function AddressInfo(props) {
  const { currentAddress, ChangeAddressModalProps } = props;
  const { chooseAddress } = ChangeAddressModalProps;

  return (
    <div className="product-config-link">
      <div className="product-attr">
        <div
          className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`}
          title={intl.get(`mallf.common.view.receive.info`).d('收货信息')}
          style={{ verticalAlign: 'top' }}
        >
          {intl.get(`mallf.common.view.receive.info`).d('收货信息')}
        </div>
        <div className="p-content">
          <span
            title={
              currentAddress.addressName ||
              intl.get('mallf.common.model.add.receive.info').d('请添加收货信息')
            }
            style={{ marginRight: '20px', width: '200px' }}
            className="mainAddress"
          >
            {currentAddress.addressName ||
              intl.get('mallf.common.model.add.receive.info').d('请添加收货信息')}
          </span>
        </div>
        <div className="set" style={{ display: 'flex' }}>
          <AddressLov
            mode="button"
            className="address-lov"
            clearButton={false}
            lovCode="SMAL.MEMBER.ADDRESS"
            onChange={chooseAddress}
          >
            <span
              style={{
                marginTop: '-18px',
                color: getPrimaryColor(),
                cursor: 'pointer',
                display: 'inline-block',
                fontWeight: 400,
              }}
            >
              {intl.get('mallf.productDetail.model.update').d('修改')}
            </span>
          </AddressLov>
        </div>
      </div>
    </div>
  );
}
