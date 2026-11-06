import React from 'react';
import { Tooltip, Icon as C7nIcon } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';

import { numberRender } from 'utils/utils';
import intl from 'utils/intl';
import styles from './index.less';

export default function TotalMount({ allInfo }) {
  const { freightAmount, orderAmount, productAmount, installAmount, extraCostAmount } = allInfo;
  const { currencySymbol, financialPrecision } = allInfo.orderEntryVOS?.[0] || {};
  const allNum = allInfo.orderEntryVOS
    ?.map((n) => n.quantity)
    .reduce((pre, curr) => math.plus(pre, curr), 0);
  return (
    <div className={styles['mount-content']}>
      <div className="mount-price">
        <div className="order-price-toatl">
          {currencySymbol}
          {numberRender(productAmount, financialPrecision, true)}
        </div>
        <div className="order-freight-total">
          {currencySymbol}
          {numberRender(extraCostAmount, financialPrecision, true)}
        </div>
        <div className="order-final-price">
          <span className="currencySymbol">{currencySymbol}</span>
          {numberRender(orderAmount, financialPrecision, true)}
        </div>
      </div>
      <div className="mount-label">
        <div className="order-price-toatl">
          {intl.get('mallf.common.view.productsPriceTotal').d('商品总金额(含税)')}:
        </div>
        <div className="order-freight-total">
          <span className="total-count-label">
            <Tooltip
              title={
                <>
                  <p style={{ marginBottom: 5 }}>
                    {intl.get(`mallf.common.model.freight`).d('运费(含税)')}:{currencySymbol}
                    {numberRender(freightAmount, financialPrecision, true)}
                  </p>
                  <p r-if={!!installAmount}>
                    {intl.get(`mallf.common.model.anzhuang`).d('安装费(含税)')}:{currencySymbol}
                    {numberRender(installAmount, financialPrecision, true)}
                  </p>
                </>
              }
            >
              <C7nIcon
                type="help"
                style={{ marginRight: 6, marginTop: -4, color: 'rgba(0,0,0,0.50)' }}
              />
            </Tooltip>
            {intl.get(`mallf.common.model.exMoney`).d('附加费(含税)')}:
          </span>
        </div>
        <div className="order-final-price">
          <span
            className="total-count-label"
            style={{ fontSize: 14, color: '#191919', fontWeight: 600 }}
          >
            {intl.get('mallf.common.view.products.finalPrice').d('实付款(含税)')}
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
