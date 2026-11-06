import React, { useMemo } from 'react';
import { Icon } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import Image from 'components/Image';
import Link from 'components/Link';
import { convertImg } from 'utils/utils';
import { getIsNewCartFlag } from 'utils/configUtils';
import style from './index.less';

export default function CompareOrderDetail(props) {
  const { setCompareVisible, productCompare } = props;
  const { fullAddress, unitName, productCompareAssignList = [], autoFlag } = productCompare || {};
  const isNewCartFlag = useMemo(() => getIsNewCartFlag(), []);

  return (
    <div className={style['compare-view-datail']}>
      <div className="compare-title">
        <div style={{ flex: 1 }}>
          {+autoFlag === 1
            ? intl.get('mallf.common.view.autoComPareTitle').d('比价单(自动生成)')
            : intl.get('mallf.common.view.comPareTitle').d('比价单')}
        </div>
      </div>
      <div className="compare-content">
        <div className="compare-content-top" r-if={isNewCartFlag}>
          <div className="compare-unit text-overflow" title={unitName}>
            <Icon type="domain" style={{ fontSize: 14, marginRight: 5, marginTop: -3 }} />
            {unitName}
          </div>
          <div className="compare-address text-overflow" title={fullAddress}>
            <Icon type="room" style={{ fontSize: 14, marginRight: 5, marginTop: -3 }} />
            {fullAddress}
          </div>
        </div>
        <div className="compare-product-wrapper">
          {productCompareAssignList
            .filter((n) => !n.masterProduct)
            .map((product) => {
              return (
                <div className="compare-product">
                  <div className="goods-content">
                    <div className="goods-img">
                      <Link
                        to={`/product-detail?productId=${product.productId}&sourceFrom=${product.sourceFrom}`}
                      >
                        <Image
                          value={convertImg(product.imagePath, 1, product.sourceFrom)}
                          width={40}
                          height={40}
                        />
                        {+product?.lowerAssignFlag === 1 && (
                          <div className="lower-price">
                            {intl.get('mallf.common.view.lowerPrice').d('最低价')}
                          </div>
                        )}
                      </Link>
                    </div>
                    <div className="goods-product-name text-overflow">
                      <Link
                        title={product.productName}
                        className="goods-name"
                        to={`/product-detail?productId=${product.productId}&sourceFrom=${product.sourceFrom}`}
                      >
                        {product.productName}
                      </Link>
                      <div className="goods-price">
                        {product.currencySymbol}
                        {product.price}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="compare-footer">
        <Button
          style={{ height: 32 }}
          tooltip="none"
          color="primary"
          onClick={() => setCompareVisible(false)}
        >
          {intl.get(`mallf.common.button.close`).d('关闭')}
        </Button>
      </div>
    </div>
  );
}
