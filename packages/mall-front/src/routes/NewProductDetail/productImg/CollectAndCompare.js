import React from 'react';

import { ShowCompare } from 'utils/renderer';
import { getPrimaryColor, setStorage } from 'utils/utils';
import cuxComponent from 'cuxTools/cuxComponent';
import { Icon } from 'hzero-ui';
import Icons from 'components/Icons';
import { CollectPopOver } from 'utils/modals';
import intl from 'utils/intl';
import { isExcludeCompare } from 'utils/addNewCart';

function CollectAndCompare({
  isCollect,
  handleCollect,
  productData = {},
  setPriceCompareActiveKey,
  hasCompare,
  updatePriceCompareList,
  setIsCollect,
  labelLoading,
  labelList,
}) {
  const primaryColor = getPrimaryColor();
  const priceHidden = String(productData?.taxIncludedPrice)?.includes('*');
  return (
    <div className="product-img-control">
      <span>
        {!isCollect ? (
          <CollectPopOver product={productData} callBack={(res) => setIsCollect(res?.[0])}>
            <span style={{ fontSize: 14, color: '#333' }}>
              <Icon type="heart-o" style={{ color: '#333', paddingRight: 5 }} />
              {intl.get(`mallf.productDetail.model.collect`).d('收藏')}
            </span>
          </CollectPopOver>
        ) : (
          <span
            style={{ fontSize: 14, color: '#333' }}
            onClick={() => {
              handleCollect(productData);
            }}
          >
            <Icon type="heart" style={{ paddingRight: 5, color: primaryColor }} />
            {intl.get(`mallf.productDetail.model.collected`).d('已收藏')}
          </span>
        )}
      </span>
      {!priceHidden &&
        productData.receiveFlag !== 1 &&
        !isExcludeCompare(labelList, productData.supplierCompanyId) &&
        productData.sourceFrom !== 'JD-V-ECRD' && (
          <ShowCompare>
            <span
              style={{ paddingLeft: '12px' }}
              onClick={() => {
                if (labelLoading) return;
                setPriceCompareActiveKey('1');
                setStorage('priceCompareVisible', true);
                if (hasCompare) updatePriceCompareList('delete', productData);
                else updatePriceCompareList('add', productData);
              }}
            >
              {hasCompare ? (
                <span style={{ color: '#333', fontSize: 14 }}>
                  <Icons type="revocation" size={14} style={{ paddingRight: 5 }} />
                  {intl.get(`mallf.productDetail.model.cancelCompare`).d('取消对比')}
                </span>
              ) : (
                <span
                  style={{
                    color: '#333',
                    fontSize: 14,
                  }}
                >
                  <Icons type="swap" size={14} style={{ paddingRight: 5 }} />
                  {intl.get(`mallf.productDetail.model.priceCompare`).d('对比')}
                </span>
              )}
            </span>
          </ShowCompare>
        )}
    </div>
  );
}
export const CollectAndCompareCom = CollectAndCompare;

export default cuxComponent({ path: 'ProductDetail/productImg/CollectAndCompare' })(
  CollectAndCompare
);
