import React from 'react';
import { Spin, Icon } from 'hzero-ui';
import { math } from 'choerodon-ui/dataset';

import { getPrimaryColor, getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';
import cuxComponent from 'cuxTools/cuxComponent';
import BuyNow from './BuyNow';
import Counter from './Counter';

function AddCart({
  quantity,
  MaxProductNumber,
  MinProductNumber,
  changeVal,
  minus,
  add,
  checkVal,
  addCartLoading,
  addCartDisabled,
  saleLoading,
  validateToCart,
  isReceive,
  buyNowProps,
  currentWarehouse,
  openReceive,
  // sourceFrom,
  stockNumber,
  currentAddress,
  renderCurrentStockInfo,
  openAddress,
  saleFlag,
  cause,
  stockState,
}) {
  return (
    <div className="product-attr">
      <div className="p-label add-quantity p-label-count" style={{ verticalAlign: 'top' }}>
        <Counter
          id="add_icon"
          maxBtnClass={math.gte(quantity, MaxProductNumber) ? 'disable-button' : ''}
          minBtnClass={math.lte(quantity, MinProductNumber) ? 'disable-button' : ''}
          changeVal={(event) => changeVal(event)}
          minus={minus}
          add={add}
          minCountMsg={
            MinProductNumber > 1
              ? intl
                  .get('mallf.productDetail.model.minPurchaseNumber', {
                    value: MinProductNumber,
                  })
                  .d(`最小购买量为${MinProductNumber}`)
              : null
          }
          maxCountMsg={intl
            .get('mallf.productDetail.model.maxPurchaseNumbers', { value: MaxProductNumber })
            .d(`最大购买量为${MaxProductNumber}`)}
          value={quantity}
          onBlur={(e) => {
            checkVal(e);
          }}
        />
      </div>
      <div className={`stock ${getCurrentLanguage() === 'zh_CN' ? 'stock-width' : ''}`}>
        <div className="addSpin">
          <Spin
            key={addCartLoading}
            className="product-add-spin"
            spinning={addCartLoading || saleLoading}
            size="small"
          >
            {addCartDisabled ? (
              <button type="button" id="product-add" className="off">
                {intl.get(`mallf.productDetail.model.addCart`).d('加入购物车')}
              </button>
            ) : (
              <div id="product-detail-add">
                <button
                  type="button"
                  id="product-add"
                  className="product-add"
                  onClick={() => {
                    validateToCart();
                  }}
                >
                  {intl.get(`mallf.productDetail.model.addCart`).d('加入购物车')}
                </button>
              </div>
            )}
          </Spin>
          <BuyNow {...buyNowProps} />
        </div>
        <div className="stock-info">
          {(isReceive ? currentWarehouse.warehouseId : currentAddress.addressId) ? (
            <span key={currentAddress.addressId} className="product-stock">
              {stockNumber === undefined ? (
                intl.get(`mallf.productDetail.view.stockQueryIng`).d('库存查询中')
              ) : (
                <React.Fragment>
                  {saleFlag !== 1 ? (
                    <span>*{cause}</span>
                  ) : (
                    <span>*{renderCurrentStockInfo()}</span>
                  )}
                </React.Fragment>
              )}
              {stockState === 1 && stockNumber > 0 && stockNumber < quantity && (
                <span>{intl.get(`mallf.productDetail.view.overStock`).d('（超出可用库存）')}</span>
              )}
            </span>
          ) : (
            <div style={{ display: 'flex' }}>
              <span className="address-warn">
                <Icon
                  type="exclamation-circle"
                  size={12}
                  style={{ marginRight: '6px', color: '#FCA000' }}
                />
                {isReceive
                  ? intl
                      .get('mallf.common.view.productReceiveWarn')
                      .d('暂无领用库房，请先维护领用库房')
                  : intl
                      .get('mallf.common.view.productAddressWarn')
                      .d('暂无收货地址，请先维护收货地址')}
              </span>
              <div
                style={{
                  color: getPrimaryColor(),
                  paddingLeft: 10,
                  cursor: 'pointer',
                  fontWeight: 400,
                  lineHeight: '18px',
                  flexShrink: 0,
                }}
                onClick={() => (isReceive ? openReceive() : openAddress())}
              >
                {intl.get('mallf.productDetail.view.goEdit').d('去维护~')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export const AddCartCom = AddCart;
export default cuxComponent({ path: 'ProductDetail/productInfo/AddCart' })(AddCart);
