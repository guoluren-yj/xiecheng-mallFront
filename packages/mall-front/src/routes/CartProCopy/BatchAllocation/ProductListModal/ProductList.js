import React, { useMemo } from 'react';
import { CheckBox } from 'choerodon-ui/pro';

import { HandleImgUrl } from 'utils/utils';
import Image from 'components/Image';
import intl from 'utils/intl';

import emptyImg from '@/assets/images/product/illu_search_nodata_default.svg';
import { renderProductSource } from '@/routes/CartProCopy/renderer';
import { getMamanualRequestImg } from '@/routes/CartProCopy/EmptyImages';

function ProductList({ dataSet, productData }) {
  const ProductListRender = useMemo(() => {
    return productData.map((product) => {
      const {
        manualFlag,
        productSource,
        imagePath,
        productName,
        itemCode,
        supplierCompanyName,
        punchoutFlag,
        receiveFlag,
      } = product || {};
      return (
        <div className="product-content">
          <CheckBox
            style={{ marginTop: '-15px' }}
            onChange={(check) => dataSet.selectProduct({ check, product })}
          />
          <div className="product-wrapper">
            <div className="image-wrapper">
              {manualFlag ? (
                <>{getMamanualRequestImg({ width: '41px', height: '41px' })}</>
              ) : (
                <Image
                  className="sku-image"
                  value={HandleImgUrl(productSource, imagePath)}
                  width={41}
                  height={41}
                />
              )}
            </div>
            <div className="product-name-cotent">
              <div className="text-overflow product-name">
                <span r-title>{productName}</span>
              </div>
              {renderProductSource({
                itemCode,
                supplierCompanyName,
                productSource,
                punchoutFlag,
                receiveFlag,
                manualFlag: !receiveFlag && manualFlag, // 手工商品转领用不展示手工标签
              })}
            </div>
          </div>
        </div>
      );
    });
  }, [productData]);

  return (
    <div>
      {ProductListRender}
      <div className="empty-image" r-if={dataSet.length === 0}>
        <img alt="" src={emptyImg} style={{ width: 200, marginBottom: 30 }} />
        <p>
          {intl
            .get('mallf.common.view.productList.empty', {
              value: dataSet.searchValue,
            })
            .d(`还没有找到与 "${dataSet.searchValue}" 相关的商品`)}
        </p>
      </div>
    </div>
  );
}

export default ProductList;
