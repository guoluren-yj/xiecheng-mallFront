import React from 'react';
import { math } from 'choerodon-ui/dataset';
import { Icon as C7nIcon } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { numberRender } from 'utils/utils';
import styles from 'mall-front/lib/routes/NewBeforeOrder/TotalMount/index.less';

function TotalMount({ orderData }) {
  const { financialPrecision } = orderData?.[0]?.shoppingCartDTOList[0] || {};
  const symbol = orderData?.[0]?.shoppingCartDTOList[0]?.currencySymbol;
  let allNum = 0;
  let allPrice = 0.0; // 商品总金额
  let allExPrice = 0.0; // 商品总金额不含税
  let allTotalPrice = 0.0; // 实付款
  let allFreight = 0.0; // 运费
  let allinstall = 0.0; // 安装费
  let allExFreight = 0.0; // 运费不含税
  let allExinstall = 0.0; // 安装费不含税
  let allTax = 0.0; // 总税额
  let allExTotalPrice = 0.0; // 实付款不含税
  orderData.forEach((data) => {
    allNum = math.plus(allNum, data.quantity);
    allPrice = math.plus(allPrice, data.taxIncludedAmount || 0);
    allExPrice = math.plus(allExPrice, data.taxExcludedAmount || 0);
    allTotalPrice = math.plus(allTotalPrice, data.totalTaxIncludedAmount || 0);
    allFreight = math.plus(allFreight, data.freight || 0);
    allinstall = math.plus(allinstall, data.installPrice || 0);
    allExFreight = math.plus(allExFreight, data.taxExcludedFreight || 0);
    allExinstall = math.plus(allExinstall, data.taxExcludedInstallPrice || 0);
    // 总税额= 商品税额 {舍金额精度版} + 附加费税额（舍精度版） 商品税额 = 商品含税 - 商品未税; 附加费税额 = 安装税额 + 运费税额; 安装税额 = 安装含税 - 安装未税; 运费税额 = 运费含税 - 运费未税;
    const surchargeTax = math.plus(
      math.minus(data.freight || 0, data.taxExcludedFreight || 0),
      math.minus(data.installPrice || 0, data.taxExcludedInstallPrice || 0)
    );
    allTax = math.plus(
      allTax,
      math.plus(math.minus(data.taxIncludedAmount || 0, data.taxExcludedAmount || 0), surchargeTax)
    );
    // 实付款不含税 = 商品不含税 + 附加费不含税（运费不含税 + 安装费不含税）
    allExTotalPrice = math.plus(
      allExTotalPrice,
      math.plus(
        data.taxExcludedAmount || 0,
        math.plus(data.taxExcludedFreight || 0, data.taxExcludedInstallPrice || 0)
      )
    );
  });
  return (
    <div className={styles['mount-content']}>
      <div className="mount-price">
        <div className="order-price-toatl">
          {symbol || ''}
          {numberRender(allExPrice, financialPrecision, true)}
        </div>
        <div className="order-price-toatl">
          {symbol || ''}
          {numberRender(allPrice, financialPrecision, true)}
        </div>
        <div className="order-price-toatl">
          {symbol || ''}
          {numberRender(math.plus(allExFreight, allExinstall), financialPrecision, true)}
        </div>
        <div className="order-price-toatl">
          {symbol || ''}
          {numberRender(math.plus(allFreight, allinstall), financialPrecision, true)}
        </div>
        <div className="order-freight-total">
          {symbol || ''}
          {numberRender(allTax, financialPrecision, true)}
        </div>
        <div className="order-final-price" style={{ marginBottom: 7 }}>
          {symbol || ''}
          {numberRender(allExTotalPrice, financialPrecision, true)}
        </div>
        <div className="order-final-price">
          {symbol || ''}
          {numberRender(allTotalPrice, financialPrecision, true)}
        </div>
      </div>
      <div className="mount-label">
        <div className="order-price-toatl">商品总金额(不含税):</div>
        <div className="order-price-toatl">
          {intl.get('mallf.companyOrder.view.produdtsPriceTotal').d('商品总金额(含税)')}:
        </div>
        <div className="order-price-toatl">
          <span className="total-count-label">
            {
              <Tooltip
                title={
                  <>
                    <p style={{ marginBottom: 5 }}>
                      运费(不含税):
                      {symbol}
                      {numberRender(allExFreight, financialPrecision, true)}
                    </p>
                    <p r-if={allExinstall}>
                      安装费(不含税):{symbol}
                      {numberRender(allExinstall, financialPrecision, true)}
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
        <div className="order-freight-total">总税额：</div>
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
                name: allNum,
              })
              .d(`(共${allNum}件商品)`)}
          </span>
          :
        </div>
        <div className="order-final-price">
          <span
            className="total-count-label"
            style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}
          >
            {intl.get('mallf.companyOrder.view.products.finalPrice').d('实付款(含税)')}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}>
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

export default TotalMount;
