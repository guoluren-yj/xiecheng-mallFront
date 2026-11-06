import React, { useRef } from 'react';
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import { CheckBox, Icon } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';

import { addNewCart } from 'utils/addNewCart';
import { ReceiveLov } from 'components/C7nProLov/commons';
import useDimensTemplates from '@/hooks/useDimensTemplates';
import AddressLov from 'components/AddressLov';
import Pagination from 'components/Pagination';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import useProductCardConfig from 'hooks/useProductCardConfig';
import ProductCard from 'components/ProductCard';
import { openBatchMove } from './modals';
import useParabola from '@/hooks/useParabola';

export default function FavoriteList({ dataSet }) {
  const addressRef = useRef();
  const ReceiveLovRef = useRef();
  const ballRefMap = {};
  const dimensTemplates = useDimensTemplates();
  const { companyId, userId, isNewCart } = getUserConfigInfo();
  const productCardConfig = useProductCardConfig();
  return (
    <>
      <p
        className="favorite-list-content-title"
        r-if={!dataSet.searchName && !dataSet.currentGroup && !isEmpty(dataSet.favoriteGroupList)}
      >
        <span>{intl.get('mallf.myFavorite.view.notFavorite.product').d('未分类收藏的商品')}</span>
      </p>
      <div className="favorite-list-content">
        {dataSet.records.map((record) => {
          const invalid = +record.get('saleEnable') === 1;
          const readOnly = record.get('operationAuth') === 'VIEW';
          if (!ballRefMap[record.get('productId')]) {
            ballRefMap[record.get('productId')] = useRef();
          }
          const ball = useParabola({
            startRef: ballRefMap[record.get('productId')],
            endRef: window.miniCartRef,
            flyOuterStyle: {
              transition: 'transform 1.5s',
            },
            flyInnerStyle: {
              transition: 'transform 1.5s',
            },
            runTime: 1500,
            imagePath: record.get('imagePath'),
          });

          return (
            <Observer>
              {() => {
                const centralizedTemplateName =
                  record.get('agreementBusinessType') !== 'RECEIVE'
                    ? dataSet.getSkuInfo(record.get('productId'), 'centralizedTemplateName')
                    : '';
                const templateTag = centralizedTemplateName
                  ? { tagName: centralizedTemplateName, tagFlag: 1, tagStyle: 2 }
                  : {};
                return (
                  <div
                    className={classnames([
                      'product-wrap',
                      { 'product-wrap-not-invalid': !invalid || readOnly },
                    ])}
                  >
                    <div className="product-wrap-checkbox">
                      <CheckBox
                        r-if={invalid}
                        checked={record.isSelected}
                        onChange={(isSelected) => {
                          if (isSelected) {
                            dataSet.select(record);
                          } else {
                            dataSet.unSelect(record);
                          }
                        }}
                      />
                    </div>
                    <div
                      r-if={invalid}
                      className="product-wrap-move icon-span"
                      onClick={() => openBatchMove({ dataSet, record })}
                    >
                      <Icon type="sync_alt" />
                      <span>{intl.get('mallf.myFavorite.button.moveTo').d('移动至')}</span>
                    </div>
                    <ProductCard
                      productCardConfig={productCardConfig}
                      product={record.toData()}
                      {...templateTag}
                      wraperClass="product-wrap-favorite"
                    />
                    <div r-if={!invalid || readOnly} className="product-wrap-product-invalid">
                      <div r-if={!invalid}>
                        {intl.get('mallf.myFavorite.view.favorite.productExpired').d('商品已失效')}
                      </div>
                      <div r-if={readOnly}>
                        {intl.get('mallf.common.view.favorite.readOnly').d('商品仅浏览')}
                      </div>
                    </div>
                    <div className="product-wrap-product-operate">
                      <div
                        className="product-wrap-product-operate-delete icon-span"
                        onClick={() => dataSet.deleteProcut(record.toData())}
                      >
                        <Icon type="delete_black-o" />
                        <span>
                          {intl.get('mallf.myFavorite.view.delete.product').d('删除商品')}
                        </span>
                      </div>
                      <div
                        ref={ballRefMap[record.get('productId')]}
                        r-if={
                          invalid &&
                          !readOnly &&
                          !dataSet.priceSpining &&
                          (!isNewCart || (isNewCart && !isEmpty(dimensTemplates)))
                        }
                        className="product-wrap-product-operate-edit icon-span"
                        disabled={!record.get('canAddToCartFlag')}
                        onClick={() =>
                          dataSet.addToCart({
                            addressRef,
                            dimensTemplates,
                            product: record.toData(),
                            ReceiveLovRef,
                            ball,
                          })
                        }
                      >
                        <Icon type="add_shopping_cart" />
                        <span>
                          {intl.get(`mallf.myFavorite.view.basket.addCart`).d('加入购物车')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            </Observer>
          );
        })}
      </div>
      <Observer r-if={!dataSet.currentGroup || dataSet.searchName}>
        {() => (
          <Pagination
            style={{ width: '100%', marginTop: 15 }}
            zeroStart
            showQuickJumper
            {...dataSet.favoriteProductList}
            onForward={(page) => dataSet.getGroupList(page)}
          />
        )}
      </Observer>
      <ReceiveLov
        onChange={(data) => {
          const { product, fly } = ReceiveLovRef.current;
          addNewCart({
            addressRef,
            product,
            dimensTemplates,
            currentAddress: dataSet.addCartData.currentAddress,
            supplierCompanyId: product.supplierCompanyId,
            tmpQuantity: 1,
            cartSource: 'FAVORITES',
            ReceiveLovRef,
            fly,
            setLoading: (val) => dataSet.changeStore('spinning', val),
            currentWarehouse: {
              warehouseId: data.inventoryId,
              warehouseName: data.inventoryName,
              warehouseAddress: data.address,
            },
          });
        }}
        onRef={ReceiveLovRef}
        mode="button"
        className="display-none"
      />
      <AddressLov
        mode="button"
        className="display-none"
        clearButton={false}
        onRef={(ref) => {
          addressRef.current = ref;
        }}
        lovPara={{ companyId, userId }}
        onChange={(address) =>
          dataSet.changeStore('addCartData', { ...dataSet.addCartData, currentAddress: address })
        }
      />
    </>
  );
}
