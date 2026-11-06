import React from 'react';

import intl from 'utils/intl';
import Link from 'components/Link';
import Image from 'components/Image';
import styles from './index.less';

export default function ProductParam(props) {
  const { list } = props;
  return (
    <div className={styles.container}>
      <div className="content">
        <div className="header text-overflow">
          {intl.get('mallf.productDetail.view.shop.goods').d('店铺好物')}
          <span className="product-ad">{intl.get('mallf.common.view.ad').d('广告')}</span>
        </div>
        <div className="info">
          {list?.map((product) => {
            return (
              <div className="product-wrapper">
                <Link
                  title={product.skuName}
                  to={`/zone-product-detail?productId=${product.skuId}`}
                >
                  <Image
                    boxStyle={{ marginBottom: 5 }}
                    width={160}
                    height={160}
                    value={product?.primaryPath}
                    alt=""
                  />
                </Link>
                <div className="product-price">{product?.proposedPrice}</div>
                <div className="product-name text-overflow">
                  <Link
                    title={product.skuName}
                    to={`/zone-product-detail?productId=${product.skuId}`}
                  >
                    {product?.skuName}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
