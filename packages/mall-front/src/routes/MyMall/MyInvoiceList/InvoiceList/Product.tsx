import React from 'react';
import { Row } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import Link from 'components/Link';
import Image from 'components/Image';

import InstallCost from './InstallCost';

interface IProductProps {
  currencySymbol: string;
  product: {
    qtHeaderNo: string;
    productId: Number | string;
    skuId: Number | string;
    platformCode: string;
    cecFromCode: string;
    imagePath: string;
    primaryUrl: string;
    productName: string;
    skuName: string;
    actualPriceMeaning: string;
    actualPrice: Number;
    orderPriceFinalVO: any;
    unitPriceMeaning: string;
    unitPrice: Number;
    quantity: Number;
    [x: string]: any;
  };
}

const Product: React.FC<IProductProps> = ({
  currencySymbol,
  product,
}) => {
  return (
    <Row className="product-line">
      <div className="product-img">
        {product.extraCostType === 'FREIGHT' && <InstallCost />}
        <Link
          r-if={product.productId || product.skuId}
          disabled={['GIFT', 'ATTACHMENT'].includes(product.skuType) || !!product.qtHeaderNo}
          to={`/product-detail?productId=${product.productId || product.skuId}&sourceFrom=${
            product.platformCode || product.cecFromCode
          }`}
        >
          <Image value={product.imagePath || product.primaryUrl} width={40} height={40} />
        </Link>
      </div>
      <div className='product-name'>
        <p r-if={!product.productId && !product.skuId} className="productname text-overflow">
          {product.productName || product.skuName}
        </p>
        <Link
          r-if={product.productId || product.skuId}
          title={product.productName || product.skuName}
          disabled={['GIFT', 'ATTACHMENT'].includes(product.skuType) || !!product.qtHeaderNo}
          to={`/product-detail?productId=${product.productId || product.skuId}&sourceFrom=${
          product.platformCode || product.cecFromCode
        }`}
        >
          <p className="productname">{product.productName || product.skuName}</p>
        </Link>

        <Tooltip
          r-if={product.skuType === 'GIFT'}
          title={intl.get('mallf.common.view.common.giveaway').d('赠品')}
        >
          <div className="gift-label">
            {intl.get('mallf.common.view.common.giveaway').d('赠品')}
          </div>
        </Tooltip>
        <Tooltip
          r-if={product.skuType === 'ATTACHMENT'}
          title={intl.get(`mallf.common.view.common.annex`).d('附件')}
        >
          <div className="gift-label">
            {intl.get(`mallf.common.view.common.annex`).d('附件')}
          </div>
        </Tooltip>
      </div>
      <div className="product-info-price text-overflow" r-title>
        {currencySymbol}
        {product.actualPriceMeaning ||
          product.actualPrice ||
          product?.orderPriceFinalVO?.entryAmountMeaning ||
          product.unitPriceMeaning ||
          product.unitPrice}
      </div>
      <div className="product-info-quantity text-overflow" r-title>×{product.quantity}</div>
    </Row>
  );
};

export default Product;
