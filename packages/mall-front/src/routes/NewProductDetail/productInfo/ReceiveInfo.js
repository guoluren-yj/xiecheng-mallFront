import React from 'react';

import { getPrimaryColor, getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';

export default function ReceiveInfo(props) {
  const { openReceive, currentWarehouse } = props;
  const { warehouseId, warehouseName, warehouseAddress } = currentWarehouse;
  return (
    <div className="product-config-link">
      <div className="product-attr">
        <div
          className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''} ${
            getCurrentLanguage() === 'en_US' ? 'p-label-left' : ''
          }`}
          title={intl.get(`mallf.productDetail.view.receive`).d('领用库房')}
          style={{ verticalAlign: 'top' }}
        >
          {intl.get(`mallf.productDetail.view.receive`).d('领用库房')}
        </div>
        <div className="p-content">
          <span
            title={
              warehouseAddress ||
              intl.get('mallf.productDetail.model.add.receive').d('请选择领用库房')
            }
            style={{
              marginRight: '10px',
              maxWidth: '200px',
              color: warehouseId ? '#191919' : '#999999',
            }}
            className="mainAddress"
          >
            {warehouseId
              ? `${warehouseName}${warehouseAddress ? `/${warehouseAddress}` : ''}`
              : intl.get('mallf.productDetail.model.add.receive').d('请选择领用库房')}
          </span>
        </div>
        <div style={{ lineHeight: '18px' }}>
          <span
            style={{
              color: getPrimaryColor(),
              cursor: 'pointer',
              display: 'inline-block',
              fontWeight: 400,
            }}
            onClick={openReceive}
          >
            {intl.get('mallf.productDetail.model.update').d('修改')}
          </span>
        </div>
      </div>
    </div>
  );
}
