import React, { useMemo } from 'react';
import { Tooltip, Icon } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { numberRender, priceNumberRender } from 'utils/utils';
import styles from './index.less';

export default function TotalMount({ orderData, pointsTypes, allNum }) {
  const { financialPrecision, currencySymbol } = orderData?.[0]?.shoppingCartDTOList[0] || {};

  const isShowPointDetail = Object.values(pointsTypes).length > 1;

  // 全部都是现金支付订单
  const isAllCashPay = useMemo(() => {
    return orderData?.every((o) => o?.paymentType === 'CASH_PAYMENT');
  }, [orderData]);

  const totalIntegralRender = useMemo(() => {
    return (
      <>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>
          {intl.get('mallf.common.view.pointsTypesDetail').d('积分抵扣明细')}
        </div>
        {(Object.keys(pointsTypes) || []).map((point, i) => {
          return (
            <div
              style={{
                width: 150,
                display: 'flex',
                marginBottom: (Object.keys(pointsTypes) || [])?.length === i + 1 ? 0 : 5,
              }}
            >
              <span>{point}：</span>
              <span style={{ flex: 1, textAlign: 'right' }}>
                <Icon type="donut_small" style={{ fontSize: 12, marginTop: -3, paddingRight: 3 }} />
                {priceNumberRender(pointsTypes[point])}
              </span>
            </div>
          );
        })}
      </>
    );
  }, [pointsTypes]);

  // 总积分金额计算
  function getOrderTotalMount() {
    let totalSigl = 0; // 总积分
    let totalMoney = 0; // 总金额
    let totalSiglFeight = 0; // 总运费积分
    let totalFeight = 0; // 总运费金额
    let totalInstall = 0; // 总安装费金额
    let totalSiglInstall = 0; // 总安装费积分
    let totalother = 0; // 总附加费
    let totalSiglother = 0; // 总附加费积分
    orderData.forEach((order) => {
      if (order?.freightDeductedFlag === 1 || order?.paymentType === 'POINTS_PAYMENT') {
        totalother += 0;
        totalSiglother += order.otherPricePointTotal;
      } else {
        totalother += order.otherPriceTotal;
        totalSiglother += 0;
      }
      switch (order?.paymentType) {
        case 'HYBRID_PAYMENT':
          totalSigl = math.plus(totalSigl, order.totalProductHybridPoint || 0);
          totalMoney = math.plus(totalMoney, order.totalProductHybridPrice || 0);
          if (order?.freightDeductedFlag === 1) {
            // 积分抵扣运费
            totalSiglFeight = math.plus(totalSiglFeight, order.pointFreightPrice || 0);
            // 积分抵扣安装费
            totalSiglInstall = math.plus(totalSiglInstall, order.pointInstallPrice || 0);
          } else {
            totalFeight = math.plus(totalFeight, order.freight || 0);
            totalInstall = math.plus(totalInstall, order.installPrice || 0);
          }
          break;
        case 'POINTS_PAYMENT':
          totalSigl = math.plus(totalSigl, order.totalProductPointPrice || 0);
          totalSiglFeight = math.plus(totalSiglFeight, order.pointFreightPrice || 0);
          totalSiglInstall = math.plus(totalSiglInstall, order.pointInstallPrice || 0);
          break;
        case 'CASH_PAYMENT':
          totalMoney = math.plus(totalMoney, order.totalProductPrice || 0);
          totalFeight = math.plus(
            totalFeight,
            order?.freightDeductedFlag === 1 ? 0 : order.freight || 0
          );
          totalInstall = math.plus(
            totalInstall,
            order?.freightDeductedFlag === 1 ? 0 : order.installPrice || 0
          );
          break;
        default:
          break;
      }
    });
    return {
      totalSigl,
      totalMoney,
      totalSiglFeight,
      totalFeight,
      totalInstall,
      totalSiglInstall,
      totalother,
      totalSiglother,
    };
  }
  return (
    <div className={styles['mount-content']}>
      <div className="mount-price">
        <div className="order-price-toatl">
          <span r-if={getOrderTotalMount().totalSigl > 0}>
            <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
            {numberRender(getOrderTotalMount().totalSigl)}
            <span
              r-if={getOrderTotalMount().totalMoney > 0}
              style={{ fontSize: 16, margin: '0 5px', fontWeight: 600, lineHeight: '18px' }}
            >
              +
            </span>
          </span>
          <span r-if={getOrderTotalMount().totalMoney > 0}>
            {currencySymbol || ''}
            {numberRender(getOrderTotalMount().totalMoney, financialPrecision, true)}
          </span>
        </div>
        <div className="order-freight-total">
          <span r-if={getOrderTotalMount().totalSiglother > 0}>
            <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
            {numberRender(getOrderTotalMount().totalSiglother)}
            <span
              r-if={getOrderTotalMount().totalother > 0}
              style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
            >
              +
            </span>
          </span>
          <span r-if={+getOrderTotalMount().totalother > 0}>
            {currencySymbol || ''}
            {numberRender(+getOrderTotalMount().totalother, financialPrecision, true)}
          </span>
          {!(+getOrderTotalMount().totalother > 0) && !(getOrderTotalMount().totalSiglother > 0) && (
            <span>
              <Icon
                r-if={orderData.every((p) => p.freightDeductedFlag === 1)}
                style={{ fontSize: 12, marginTop: -3 }}
                type="donut_small"
              />
              0
            </span>
          )}
        </div>
        <div r-if={!isAllCashPay} className="order-price-toatl">
          <span className="total-count-content">
            <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
            {priceNumberRender(
              math.plus(getOrderTotalMount().totalSiglother, getOrderTotalMount().totalSigl)
            )}
          </span>
        </div>
        <div className="order-final-price">
          <span className="currencySymbol">{currencySymbol || ''}</span>
          {numberRender(
            math.plus(getOrderTotalMount().totalMoney, getOrderTotalMount().totalother),
            financialPrecision,
            true
          )}
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
                    {intl.get(`mallf.companyOrder.model.companyOrder.freight`).d('运费(含税)')}:
                    <span r-if={getOrderTotalMount().totalSiglFeight > 0}>
                      <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                      {numberRender(getOrderTotalMount().totalSiglFeight)}
                      <span
                        r-if={getOrderTotalMount().totalFeight > 0}
                        style={{
                          fontSize: 16,
                          margin: '0 5px',
                          fontWeight: 600,
                          lineHeight: '18px',
                        }}
                      >
                        +
                      </span>
                    </span>
                    <span r-if={getOrderTotalMount().totalFeight > 0}>
                      {currencySymbol || ''}
                      {numberRender(getOrderTotalMount().totalFeight, financialPrecision, true)}
                    </span>
                    {!(getOrderTotalMount().totalFeight > 0) &&
                      !(getOrderTotalMount().totalSiglFeight > 0) && (
                        <span>
                          <Icon
                            r-if={orderData.every((p) => p.freightDeductedFlag === 1)}
                            style={{ fontSize: 12, marginTop: -3 }}
                            type="donut_small"
                          />
                          0
                        </span>
                      )}
                  </p>
                  <p
                    r-if={
                      getOrderTotalMount().totalSiglInstall > 0 ||
                      getOrderTotalMount().totalInstall > 0
                    }
                  >
                    {intl.get(`mallf.common.model.anzhuang`).d('安装费(含税)')}:
                    <span r-if={getOrderTotalMount().totalSiglInstall > 0}>
                      <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                      {numberRender(getOrderTotalMount().totalSiglInstall)}
                      <span
                        r-if={getOrderTotalMount().totalInstall > 0}
                        style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
                      >
                        +
                      </span>
                    </span>
                    <span r-if={getOrderTotalMount().totalInstall > 0}>
                      {currencySymbol || ''}
                      {numberRender(getOrderTotalMount().totalInstall, financialPrecision, true)}
                    </span>
                    {!(getOrderTotalMount().totalInstall > 0) &&
                      !(getOrderTotalMount().totalSiglInstall > 0) && (
                        <span>
                          <Icon
                            r-if={orderData.every((p) => p.freightDeductedFlag === 1)}
                            style={{ fontSize: 12, marginTop: -3 }}
                            type="donut_small"
                          />
                          0
                        </span>
                      )}
                  </p>
                </>
              }
            >
              <Icon
                type="help"
                style={{
                  fontSize: 14,
                  marginRight: 6,
                  marginTop: -2,
                  color: 'rgba(0,0,0,0.50)',
                }}
              />
            </Tooltip>
            {intl.get(`mallf.companyOrder.model.companyOrder.exMoney`).d('附加费(含税)')}：
          </span>
        </div>
        <div r-if={!isAllCashPay} className="order-price-toatl">
          <span className="total-count-label">
            <Tooltip title={isShowPointDetail && totalIntegralRender}>
              {isShowPointDetail && (
                <Icon type="help" style={{ fontSize: 14, marginTop: -3, marginRight: 5 }} />
              )}
            </Tooltip>
            {intl.get('mallf.common.view.sigl.pointDeduction').d('积分抵扣')}：
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
