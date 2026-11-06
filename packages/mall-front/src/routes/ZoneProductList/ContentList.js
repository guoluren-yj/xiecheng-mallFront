import React, { memo } from 'react';
import { message } from 'choerodon-ui';

import ProductCard from 'components/ProductCard';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import Pagination from 'components/Pagination';
import { fetchAddWishService } from 'services/zoneProductService';

function ContentList(props) {
  const { productList = [], setState, productNum, fetchParams, getProductList } = props;
  const {
    userId,
    tenantId,
    webConfig: { colorCode },
  } = getUserConfigInfo();
  function addWish(product) {
    if (product.wishSkuCheck) return;
    setState({
      spinning: true,
    });
    fetchAddWishService([
      {
        tenantId,
        wisher: userId,
        skuId: product.skuId,
        supplierId: product.supplierId,
      },
    ])
      .then(() => {
        message.success(
          intl.get('mallf.common.view.wish.addSuccess').d('成功加入心愿单'),
          undefined,
          undefined,
          'top'
        );
      })
      .finally(() => {
        setState({
          spinning: false,
        });
      });
  }

  return (
    <div className="product-list">
      {productList?.map((product) => {
        return (
          <div className="product-list-item">
            <ProductCard
              showSupplier
              productCardConfig={[
                {
                  elementType: 'SUPPLIER',
                  row: 2,
                  column: 1,
                  enabledFlag: 1,
                  rowLength: 1.5,
                },
                {
                  enabledFlag: 1,
                  row: 2,
                  column: 2,
                  rowLength: 0.5,
                  elementType: 'AD',
                },
              ]}
              tagColor={colorCode || 'A'}
              tagName={intl.get('mallf.zoneList.view.zhenxuan').d('甄选')}
              tagStyle={0}
              tagFlag={1}
              product={{
                ...product,
                sellPrice: product.proposedPrice,
                imagePath: product.thumbnailPath,
                productId: product.skuId,
                supplierCompanyName: product.supplierName,
              }}
              hiddenCata
              hiddenTagBorder
              detailPath="/zone-product-detail"
            />
            <div className="product-footer" onClick={() => addWish(product)}>
              {intl.get('mallf.common.view.want').d('我想要')}
            </div>
          </div>
        );
      })}
      <div style={{ width: '100%', textAlign: 'right' }}>
        <Pagination
          scrollTop={300}
          number={fetchParams?.page}
          size={20}
          totalElements={productNum}
          onForward={(p) => {
            getProductList({
              ...fetchParams,
              ...p,
            });
          }}
        />
      </div>
    </div>
  );
}

export default memo(ContentList);
