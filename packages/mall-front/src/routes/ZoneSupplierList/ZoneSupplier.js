import React, { useMemo } from 'react';

import { getAttachmentUrl } from 'utils/utils';
import intl from 'utils/intl';
import Image from 'components/Image';

export default function ZoneSupplier(props) {
  const { supplierData, skuList, history } = props;
  const { companyInfosVO, supplierId } = supplierData;
  const { companyName, logoUrl } = companyInfosVO || {};

  const goSupplier = () => {
    history.push({
      pathname: `/zone-product-list`,
      search: `?supplierId=${supplierId}`,
    });
  };
  const productList = useMemo(() => skuList.splice(0, 3), [skuList]);
  return (
    <div className="zone-supplier-content">
      <div className="zone-supplier-card">
        <Image
          boxStyle={{ margin: '0 auto 10px', borderRadius: '50%', overflow: 'hidden' }}
          value={getAttachmentUrl(logoUrl, 'private-bucket')}
          width={70}
          height={70}
        />
        <div className="zone-supplier-name text-overflow" title={companyName}>
          {companyName}
        </div>
        <div className="zone-go-supplier" onClick={() => goSupplier()}>
          {intl.get('mallf.zoneList.button.goSupplier').d('进店看看')}
        </div>
      </div>
      <div className="zone-supplier-product">
        {productList.map((sku) => {
          const { primaryPath, skuName, proposedPrice } = sku;
          return (
            <div className="product-item">
              <Image
                boxStyle={{ margin: '15px auto 10px', overflow: 'hidden' }}
                width={108}
                height={108}
                value={primaryPath}
              />
              <div className="product-name text-overflow" title={skuName}>
                {skuName}
              </div>
              <div className="product-name text-overflow price-color">{proposedPrice}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
