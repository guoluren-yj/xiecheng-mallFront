import React from 'react';
import intl from 'utils/intl';
import { Icon } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';

function getAllPriceInfo({ item, isSaleType, currentStatus, error }) {
  return (
    <li
      className="product-price"
      style={!['WAITING_RECEIVE'].includes(currentStatus) ? { width: 145 } : {}}
    >
      <div className="product-info-price-num">
        <span className="price-num-label">
          <Tooltip
            placement="bottom"
            title={
              currentStatus === '' ? (
                <>
                  <p style={{ marginBottom: 5 }}>
                    商品总金额(不含税)：
                    <span className="price-color">
                      {item?.currencySymbol}
                      {item?.orderPriceFinalVO?.extraCostNotIncloudOrderNakedPriceMeaning ||
                        item?.orderPriceFinalVO?.extraCostNotIncloudOrderNakedPrice}
                    </span>
                  </p>
                  <p style={{ marginBottom: 5 }}>
                    {intl.get('mallf.common.view.productsPriceTotal').d('商品总金额(含税)')}：
                    <span className="price-color">
                      {item?.currencySymbol}
                      {item?.orderPriceFinalVO?.extraCostNotIncloudOrderAmountMeaning ||
                        item?.orderPriceFinalVO?.extraCostNotIncloudOrderAmount}
                    </span>
                  </p>
                  <p style={{ marginBottom: 5 }}>
                    实付款(不含税)：
                    <span className="price-color">
                      {item?.currencySymbol}
                      {item?.orderPriceFinalVO?.nakedPriceMeaning ||
                        item?.orderPriceFinalVO?.nakedPrice}
                    </span>
                  </p>
                  <p style={{ marginBottom: 5 }}>
                    {intl.get('mallf.common.view.products.finalPrice').d('实付款(含税)')}：
                    <span className="price-color">
                      {item?.currencySymbol}
                      {item?.orderPriceFinalVO?.finalAmountMeaning ||
                        item?.orderPriceFinalVO?.finalAmount}
                    </span>
                  </p>
                  <p>
                    {intl.get('mallf.myOrder.model.paymentMethod').d('支付方式')}：
                    {(isSaleType ? item.proxyPaymentTypeMeaning : item.paymentTypeMeaning) || '-'}
                  </p>
                </>
              ) : null
            }
          >
            <Icon
              className="price-color"
              type="assignment-o"
              style={{ fontSize: 14, marginTop: -1, marginRight: 4 }}
            />
          </Tooltip>
        </span>
        <span
          className={`price ${error ? 'error' : ''}`}
          title={
            item?.orderPriceFinalVO?.extraCostNotIncloudOrderAmountMeaning ||
            item?.orderPriceFinalVO?.extraCostNotIncloudOrderAmount
          }
        >
          {item?.currencySymbol}
          {item?.orderPriceFinalVO?.extraCostNotIncloudOrderAmountMeaning ||
            item?.orderPriceFinalVO?.extraCostNotIncloudOrderAmount}
        </span>
        <p r-if={!!item.orderPriceFinalVO?.extraCostAmount}>
          <span>
            <Tooltip
              placement="bottom"
              title={
                item.orderPriceFinalVO?.orderExtraPriceVO ? (
                  <>
                    <p>
                      运费(不含税)：
                      <span className="price-color">
                        {item?.currencySymbol}
                        {item?.orderPriceFinalVO?.freightNakedPrice}
                      </span>
                    </p>
                    <p style={{ marginTop: 5 }}>
                      {intl.get(`mallf.common.model.freight`).d('运费(含税)')}：
                      <span className="price-color">
                        {item?.currencySymbol}
                        {item?.orderPriceFinalVO?.orderExtraPriceVO?.freightAmountMeaning ||
                          item?.orderPriceFinalVO?.orderExtraPriceVO?.freightAmount}
                      </span>
                    </p>
                    <p
                      style={{ marginTop: 5 }}
                      r-if={item?.orderPriceFinalVO?.installCostNakedPrice}
                    >
                      安装费(不含税)：
                      <span className="price-color">
                        {item?.currencySymbol}
                        {item?.orderPriceFinalVO?.installCostNakedPrice}
                      </span>
                    </p>
                    <p
                      style={{ marginTop: 5 }}
                      r-if={item?.orderPriceFinalVO?.orderExtraPriceVO.installCostAmount}
                    >
                      {intl.get(`mallf.common.model.anzhuang`).d('安装费(含税)')}：
                      <span className="price-color">
                        {item?.currencySymbol}
                        {item?.orderPriceFinalVO?.orderExtraPriceVO?.installCostAmountMeaning ||
                          item?.orderPriceFinalVO?.orderExtraPriceVO?.installCostAmount}
                      </span>
                    </p>
                  </>
                ) : null
              }
            >
              <Icon
                className="extra-price-color"
                type="assignment-o"
                style={{ fontSize: 14, marginTop: -1, marginRight: 4 }}
              />
            </Tooltip>
          </span>
          <span className="ex-money" title={item?.orderPriceFinalVO?.extraNakedPrice}>
            {intl.get(`mallf.common.model.exMoney1`).d('附加费')}:{item?.currencySymbol}
            {item?.orderPriceFinalVO?.extraNakedPrice}
          </span>
        </p>
      </div>
    </li>
  );
}

export { getAllPriceInfo };
