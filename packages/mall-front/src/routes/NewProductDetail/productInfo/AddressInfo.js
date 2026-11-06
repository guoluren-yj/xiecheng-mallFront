import React from 'react';

import cuxComponent from 'cuxTools/cuxComponent';
import { getPrimaryColor, getUserConfigInfo, getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';

function AddressInfo(props) {
  const {
    currentAddress,
    openAddress,
    // openTable,
  } = props;
  const { enableCreateReceiverAddress } = getUserConfigInfo();

  return (
    <div className="product-config-link">
      <div className="product-attr">
        <div
          className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''} ${
            getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''
          }`}
          title={intl.get(`mallf.productDetail.view.receive.info`).d('收货信息')}
          style={{ verticalAlign: 'top' }}
        >
          {intl.get(`mallf.productDetail.view.receive.info`).d('收货信息')}
        </div>
        <div className="p-content">
          <span
            title={
              currentAddress.fullAddress ||
              (enableCreateReceiverAddress
                ? intl.get('mallf.productDetail.model.add.receive.info').d('请添加收货信息')
                : intl.get('mallf.productDetail.model.noAddress.warning').d('请维护公司地址'))
            }
            style={{
              marginRight: '10px',
              maxWidth: '200px',
              color: currentAddress.fullAddress ? '#191919' : '#999999',
            }}
            className="mainAddress"
          >
            {currentAddress.fullAddress ||
              (enableCreateReceiverAddress
                ? intl.get('mallf.productDetail.model.add.receive.info').d('请添加收货信息')
                : intl.get('mallf.productDetail.model.noAddress.warning').d('请维护公司地址'))}
          </span>
        </div>
        <div className="set" style={{ lineHeight: '18px' }}>
          <span
            style={{
              color: getPrimaryColor(),
              cursor: 'pointer',
              display: 'inline-block',
              fontWeight: 400,
            }}
            onClick={openAddress}
          >
            {intl.get('mallf.productDetail.model.update').d('修改')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default cuxComponent({ path: 'ProductDetail/productInfo/AddressInfo' })(AddressInfo);
