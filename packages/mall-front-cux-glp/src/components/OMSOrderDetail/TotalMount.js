import React from 'react';
import { Icon as C7nIcon } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import styles from 'mall-front/src/routes/OMSOrderDetail/TotalMount/index.less';

function TotalMount({ order, totalNumMeaning, orderData }) {
  const surchargeTax = math.plus(
    math.minus(
      order?.orderPriceFinalVO?.orderExtraPriceVO?.freightAmount || 0,
      order?.orderPriceFinalVO?.freightNakedPrice || 0
    ),
    math.minus(
      order?.orderPriceFinalVO?.orderExtraPriceVO?.installCostAmount || 0,
      order?.orderPriceFinalVO?.installCostNakedPrice || 0
    )
  );
  const allTaxAmount = math.plus(
    math.minus(
      order?.orderPriceFinalVO?.extraCostNotIncloudOrderAmount || 0,
      order?.orderPriceFinalVO?.extraCostNotIncloudOrderNakedPrice || 0
    ),
    surchargeTax
  );
  return (
    <div className={styles['mount-content']}>
      <div className="mount-price">
        <div className="order-price-toatl">
          {order?.currencySymbol || ''}
          {order?.orderPriceFinalVO?.extraCostNotIncloudOrderNakedPrice}
        </div>
        <div className="order-price-toatl">
          {order?.currencySymbol || ''}
          {order?.orderPriceFinalVO?.extraCostNotIncloudOrderAmountMeaning ||
            order?.orderPriceFinalVO?.extraCostNotIncloudOrderAmount}
        </div>
        <div className="order-price-toatl">
          {order?.currencySymbol || ''}
          {order?.orderPriceFinalVO?.extraNakedPrice}
        </div>
        <div className="order-price-toatl">
          {order?.currencySymbol || ''}
          {order?.orderPriceFinalVO?.extraCostAmountMeaning ||
            order?.orderPriceFinalVO?.extraCostAmount}
        </div>
        <div className="order-freight-total">
          {order?.currencySymbol || ''}
          {allTaxAmount}
        </div>
        <div className="order-final-price" style={{ marginBottom: 7 }}>
          {order?.currencySymbol || ''}
          {orderData.orderPriceFinalVO?.nakedPriceMeaning ||
            orderData.orderPriceFinalVO?.nakedPrice}
        </div>
        <div className="order-final-price">
          {order?.currencySymbol || ''}
          {orderData.orderPriceFinalVO?.finalAmountMeaning ||
            orderData.orderPriceFinalVO?.finalAmount}
        </div>
      </div>
      <div className="mount-label">
        <div className="order-price-toatl">商品总金额(不含税):</div>
        <div className="order-price-toatl">
          {intl.get('mallf.common.view.productsPriceTotal').d('商品总金额(含税)')}:
        </div>
        <div className="order-price-toatl">
          <span className="total-count-label">
            {
              <Tooltip
                title={
                  <>
                    <p style={{ marginBottom: 5 }}>
                      运费(不含税):
                      {order?.currencySymbol || ''}
                      {order?.orderPriceFinalVO?.freightNakedPrice}
                    </p>
                    {/* eslint-disable-next-line eqeqeq */}
                    <p r-if={order?.orderPriceFinalVO?.installCostNakedPrice != 0}>
                      安装费(不含税):
                      {order?.currencySymbol || ''}
                      {order?.orderPriceFinalVO?.installCostNakedPrice}
                    </p>
                  </>
                }
              >
                <C7nIcon
                  type="help"
                  style={{
                    fontSize: 14,
                    marginRight: 6,
                    marginTop: -4,
                    color: 'rgba(0,0,0,0.50)',
                  }}
                />
              </Tooltip>
            }
            附加费(不含税):
          </span>
        </div>
        <div className="order-price-toatl">
          <span className="total-count-label">
            {
              <Tooltip
                title={
                  <>
                    <p style={{ marginBottom: 5 }}>
                      {intl.get(`mallf.common.model.freight`).d('运费(含税)')}:
                      {order?.currencySymbol || ''}
                      {order?.orderPriceFinalVO?.orderExtraPriceVO?.freightAmountMeaning ||
                        order?.orderPriceFinalVO?.orderExtraPriceVO?.freightAmount}
                    </p>
                    <p r-if={!!order?.orderPriceFinalVO?.orderExtraPriceVO?.installCostAmount}>
                      {intl.get(`mallf.common.model.anzhuang`).d('安装费(含税)')}:
                      {order?.currencySymbol || ''}
                      {order?.orderPriceFinalVO?.orderExtraPriceVO?.installCostAmountMeaning ||
                        order?.orderPriceFinalVO?.orderExtraPriceVO?.installCostAmount}
                    </p>
                  </>
                }
              >
                <C7nIcon
                  type="help"
                  style={{
                    fontSize: 14,
                    marginRight: 6,
                    marginTop: -4,
                    color: 'rgba(0,0,0,0.50)',
                  }}
                />
              </Tooltip>
            }
            {intl.get(`mallf.common.model.exMoney`).d('附加费(含税)')}:
          </span>
        </div>
        <div className="order-freight-total">总税额:</div>
        <div className="order-final-price" style={{ marginBottom: 7 }}>
          <span
            className="total-count-label"
            style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}
          >
            实付款(不含税)
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}>
            {intl
              .get('mallf.common.view.products.totalNum', {
                name: totalNumMeaning,
              })
              .d(`(共${totalNumMeaning}件商品)`)}
          </span>
          :
        </div>
        <div className="order-final-price">
          <span
            className="total-count-label"
            style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}
          >
            {intl.get('mallf.common.view.products.finalPrice').d('实付款(含税)')}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}>
            {intl
              .get('mallf.common.view.products.totalNum', {
                name: totalNumMeaning,
              })
              .d(`(共${totalNumMeaning}件商品)`)}
          </span>
          :
        </div>
      </div>
    </div>
  );
}

export default TotalMount;
