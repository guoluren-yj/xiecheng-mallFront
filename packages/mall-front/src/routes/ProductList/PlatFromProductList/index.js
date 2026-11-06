import React from 'react';
import qs from 'qs';
import { Tooltip } from 'choerodon-ui';

import { openPage } from 'utils/utils';
import intl from 'utils/intl';
import Link from 'components/Link';
import Image from 'components/Image';
import styles from './index.less';

export default function ProductParam(props) {
  const { platProductList = [] } = props;
  const { keyword } = qs.parse(window.location.search.substr(1)) || {};
  // keyword: locationParams.keyword
  return (
    <div className={styles.container}>
      <div className="header text-overflow">
        {intl.get('mallf.productList.view.goods.redemand').d('商品推荐')}
        <span className="product-ad">{intl.get('mallf.common.view.ad').d('广告')}</span>
      </div>
      <div className="info">
        {platProductList?.slice(0, 4)?.map((product) => {
          return (
            <div className="product-wrapper">
              <Link title={product.skuName} to={`/zone-product-detail?productId=${product.skuId}`}>
                <Image
                  boxStyle={{ marginBottom: 10 }}
                  width={200}
                  height={200}
                  value={product?.primaryPath}
                  alt=""
                />
              </Link>
              <div className="product-price">{product?.proposedPrice}</div>
              <div className="product-name">
                <Tooltip
                  title={`${intl.get('mallf.common.view.supplier').d('供应商')}:${
                    product.supplierName
                  }`}
                  placement="top"
                >
                  <span className="product-suppiler text-overflow">{product.supplierName}</span>
                </Tooltip>
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
      <div
        r-if={platProductList?.length > 4}
        className="footer text-overflow"
        title={intl.get('mallf.productList.view.more.redemand').d('更多推荐')}
        onClick={() => {
          openPage(`/zone-product-list?keyword=${keyword}`);
        }}
      >
        {intl.get('mallf.productList.view.more.redemand').d('更多推荐')}
      </div>
    </div>
  );
}
