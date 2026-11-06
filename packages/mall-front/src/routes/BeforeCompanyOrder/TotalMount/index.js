import React from 'react';
import { Tooltip, Icon as C7nIcon } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { numberRender } from 'utils/utils';
import styles from './index.less';

export default function TotalMount({ orderData }) {
  const { financialPrecision } = orderData?.[0]?.shoppingCartDTOList[0] || {};
  const symbol = orderData[0]?.shoppingCartDTOList[0]?.currencySymbol;
  let allNum = 0;
  let allPrice = 0.0;
  let allFreight = 0.0;
  let allinstall = 0.0;
  let allother = 0.0;
  orderData.forEach((data) => {
    allNum = math.plus(allNum, data.count);
    allPrice = math.plus(allPrice, data.price);
    allFreight = math.plus(allFreight, data.freight || 0);
    allinstall = math.plus(allinstall, data.installPrice || 0);
    allother = math.plus(math.plus(data.freight, data.installPrice), allother);
  });
  return (
    <div className={styles['mount-content']}>
      <div className="mount-price">
        <div className="order-price-toatl">
          {symbol}
          {numberRender(math.minus(allPrice, allother), financialPrecision, true)}
        </div>
        <div className="order-freight-total">
          {symbol}
          {numberRender(math.plus(allFreight, allinstall), financialPrecision, true)}
        </div>
        <div className="order-final-price">
          <span className="currencySymbol">{symbol}</span>
          {numberRender(allPrice, financialPrecision, true)}
        </div>
      </div>
      <div className="mount-label">
        <div className="order-price-toatl">
          {intl.get('mallf.companyOrder.view.produdtsPriceTotal').d('商品总金额(含税)')}:
        </div>
        <div className="order-freight-total">
          <span className="total-count-label">
            {
              <Tooltip
                title={
                  <>
                    <p style={{ marginBottom: 5 }}>
                      {intl.get(`mallf.companyOrder.model.companyOrder.freight`).d('运费(含税)')}:
                      {symbol}
                      {numberRender(allFreight, financialPrecision, true)}
                    </p>
                    <p r-if={!!allinstall}>
                      {intl.get(`mallf.common.model.anzhuang`).d('安装费(含税)')}:{symbol}
                      {numberRender(allinstall, financialPrecision, true)}
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
          <span className="total-count-label" style={{ fontSize: 14, color: '@color-text-1' }}>
            {intl.get('mallf.companyOrder.view.products.finalPrice').d('实付款(含税)')}
          </span>
          <span style={{ color: '#191919' }}>
            {intl
              .get('mallf.common.view.products.totalNum', {
                name: allNum,
              })
              .d(`(共${allNum}件商品)`)}
          </span>
          :
        </div>
      </div>
    </div>
  );
}
