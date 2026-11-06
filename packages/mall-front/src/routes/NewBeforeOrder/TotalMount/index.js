import React from 'react';
import { math } from 'choerodon-ui/dataset';
import { Icon as C7nIcon } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';
import cuxComonent from 'cuxTools/cuxComponent';

import intl from 'utils/intl';
import { numberRender } from 'utils/utils';
import styles from './index.less';

function TotalMount({ orderData }) {
  const { financialPrecision } = orderData?.[0]?.shoppingCartDTOList[0] || {};
  const symbol = orderData?.[0]?.shoppingCartDTOList[0]?.currencySymbol;
  let allNum = 0;
  let allPrice = 0.0; // 商品总金额
  let allTotalPrice = 0.0; // 实付款
  let allFreight = 0.0; // 运费
  let allinstall = 0.0; // 安装费
  orderData.forEach((data) => {
    allNum = math.plus(allNum, data.quantity);
    allPrice = math.plus(allPrice, data.taxIncludedAmount || 0);
    allTotalPrice = math.plus(allTotalPrice, data.totalTaxIncludedAmount || 0);
    allFreight = math.plus(allFreight, data.freight || 0);
    allinstall = math.plus(allinstall, data.installPrice || 0);
  });
  return (
    <div className={styles['mount-content']}>
      <div className="mount-price">
        <div className="order-price-toatl">
          {symbol || ''}
          {numberRender(allPrice, financialPrecision, true)}
        </div>
        <div className="order-freight-total">
          {symbol || ''}
          {numberRender(math.plus(allFreight, allinstall), financialPrecision, true)}
        </div>
        <div className="order-final-price">
          {symbol || ''}
          {numberRender(allTotalPrice, financialPrecision, true)}
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
                    <p r-if={allinstall}>
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
          <span className="total-count-label" style={{ fontSize: 14, color: '#191919' }}>
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

export default cuxComonent({ path: 'NewBeforeOrder/TotalMount' })(TotalMount)