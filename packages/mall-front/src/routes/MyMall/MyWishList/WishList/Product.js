import React from 'react';
import Link from 'components/Link';
import Image from 'components/Image';
import { convertImg } from 'utils/utils';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui';

export default function Product(props) {
  const { product } = props;
  const { sourceFrom: platformCode } = product;
  const handleImgUrl = (code, url) => {
    return code === 'CATA' ? url : convertImg(url, 1, code);
  };

  const handleProductUrl = () => {
    // 跳转甄选商品详情
    return `/zone-product-detail?productId=${product.skuId}&sourceFrom=${platformCode}`;
  };

  return (
    <div className="product">
      <Link disabled={!!product.qtLineNo} className="product-link" to={handleProductUrl()}>
        <Image
          value={handleImgUrl(platformCode, product.primaryMediaPath)}
          width={40}
          height={40}
        />
        <span className="product-name">{product.skuName}</span>
      </Link>
      <div className="product-price">
        <span className="product-price-label">
          {intl.get('mallf.common.view.view.wishList.proposedPrice').d('参考价')}：
        </span>
        <Tooltip placement="topLeft" title={product.proposedPrice}>
          <span>{product.proposedPrice}</span>
        </Tooltip>
      </div>
    </div>
  );
}
