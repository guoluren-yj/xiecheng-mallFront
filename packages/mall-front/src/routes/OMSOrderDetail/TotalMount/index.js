import React from 'react';
import { Tooltip, Icon as C7nIcon } from 'choerodon-ui';
import cuxComonent from 'cuxTools/cuxComponent';

import intl from 'utils/intl';
import styles from './index.less';

function TotalMount({ order, totalNumMeaning, orderData }) {
  return (
    <div className={styles['mount-content']}>
      <div className="mount-price">
        <div className="order-price-toatl">
          {order?.currencySymbol || ''}
          {order?.orderPriceFinalVO?.extraCostNotIncloudOrderAmountMeaning ||
            order?.orderPriceFinalVO?.extraCostNotIncloudOrderAmount}
        </div>
        <div className="order-freight-total">
          {order?.currencySymbol || ''}
          {order?.orderPriceFinalVO?.extraCostAmountMeaning ||
            order?.orderPriceFinalVO?.extraCostAmount}
        </div>
        <div className="order-final-price">
          {order?.currencySymbol || ''}
          {orderData.orderPriceFinalVO?.finalAmountMeaning ||
            orderData.orderPriceFinalVO?.finalAmount}
        </div>
      </div>
      <div className="mount-label">
        <div className="order-price-toatl">
          {intl.get('mallf.common.view.productsPriceTotal').d('商品总金额(含税)')}:
        </div>
        <div className="order-freight-total">
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
        <div className="order-final-price">
          <span className="total-count-label" style={{ fontSize: 14, color: '#191919' }}>
            {intl.get('mallf.common.view.products.finalPrice').d('实付款(含税)')}
          </span>
          <span style={{ color: '#191919' }}>
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

export default cuxComonent({ path: 'OMSOrderDetail/TotalMount' })(TotalMount)