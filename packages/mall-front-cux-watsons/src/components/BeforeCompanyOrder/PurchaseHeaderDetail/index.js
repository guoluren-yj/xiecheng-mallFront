import React from 'react';
import { Icon, Tooltip } from 'choerodon-ui';

import { numberRender } from 'utils/utils';
import intl from 'utils/intl';
import styles from './index.less';

export default function PurchaseHeaderDetail({ order }) {
  return (
    <div className={styles['order-detail-info']}>
      <div className="detail-info-grid">
        <div className="grid-title">
          {intl.get('mallf.myMall.model.companyOrder.receiveInfo').d('收货信息')}
        </div>
        <div className="grid-row">
          <span
            className="grid-tag"
            title={intl.get(`mallf.myMall.model.companyOrder.receiveAddress`).d('收货地址')}
          >
            {intl.get(`mallf.myMall.model.companyOrder.receiveAddress`).d('收货地址')}:
          </span>
          <span className="grid-content">{order.receiverAddress}</span>
        </div>
        <div className="grid-row">
          <span
            className="grid-tag"
            title={intl.get('mallf.common.view.costShopName').d('写字楼/店铺/仓库')}
          >
            {intl.get('mallf.common.view.costShopName').d('写字楼/店铺/仓库')}:
          </span>
          <span className="grid-content">
            {order.watsonsShoppingCartDTOList[0]?.allocationInfoList[0]?.costShopName}
          </span>
        </div>
      </div>
      <div className="detail-info-grid">
        <div className="grid-title">
          {intl.get('mallf.myMall.model.companyOrder.productTotal').d('商品合计')}
        </div>
        <div className="grid-row">
          <span className="grid-tag">
            {intl.get(`mallf.myMall.model.companyOrder.productPiece`).d('商品件数')}:
          </span>
          <span className="grid-content">{order.count}</span>
        </div>
        <div className="grid-row">
          <span className="grid-tag">
            {intl.get(`mallf.common.model.exMoney`).d('附加费(含税)')}:
          </span>
          <span className="grid-content">
            {order.shoppingCartDTOList[0]?.currencySymbol}
            {numberRender(
              order.freight + order.installPrice,
              order.shoppingCartDTOList[0]?.financialPrecision,
              true
            )}
            {
              <Tooltip
                title={
                  <>
                    <p style={{ marginBottom: 5 }}>
                      {intl.get(`mallf.companyOrder.model.companyOrder.freight`).d('运费(含税)')}:
                      {order.shoppingCartDTOList[0]?.currencySymbol}
                      {numberRender(
                        order.freight,
                        order.shoppingCartDTOList[0]?.financialPrecision,
                        true
                      )}
                    </p>
                    <p r-if={order.installPrice && !String(order.installPrice)?.includes('*')}>
                      {intl.get(`mallf.common.model..anzhuang`).d('安装费(含税)')}:
                      {order.shoppingCartDTOList[0]?.currencySymbol}
                      {numberRender(
                        order.installPrice,
                        order.shoppingCartDTOList[0]?.financialPrecision,
                        true
                      )}
                    </p>
                  </>
                }
              >
                <Icon
                  type="help"
                  style={{ fontSize: 14, marginLeft: 6, marginTop: -4, color: 'rgba(0,0,0,0.50)' }}
                />
              </Tooltip>
            }
          </span>
        </div>
        <div className="grid-row">
          <span className="grid-tag">
            {intl.get(`mallf.companyOrder.model.companyOrder.prductTotal`).d('商品金额(含税)')}:
          </span>
          <span className="grid-content">
            {order.shoppingCartDTOList[0]?.currencySymbol}
            {numberRender(
              order.totalProductPrice,
              order.shoppingCartDTOList[0]?.financialPrecision,
              true
            )}
          </span>
        </div>
        <div className="grid-row">
          <span className="grid-tag">
            {intl.get(`mallf.companyOrder.model.companyOrder.applyTotal`).d('申请总额(含税)')}:
          </span>
          <span className="grid-content">
            {order.shoppingCartDTOList[0]?.currencySymbol}
            {numberRender(order.price, order.shoppingCartDTOList[0]?.financialPrecision, true)}
          </span>
        </div>
      </div>
      <div className="detail-info-grid">
        <div className="grid-title">
          {intl.get('mallf.common.view.other.information').d('其他信息')}
        </div>
        <div className="grid-row">
          <span className="grid-tag">
            {intl.get(`mallf.common.view.purchase.catalog`).d('采购品类')}:
          </span>
          <span className="grid-content">
            {order?.watsonsShoppingCartDTOList[0]?.itemCategoryName}
          </span>
        </div>
        <div className="grid-row">
          <span className="grid-tag">{intl.get(`mallf.common.view.delivery`).d('送货方式')}:</span>
          <span className="grid-content">
            {order.watsonsShoppingCartDTOList[0]?.allocationInfoList[0]?.deliveryTypeMeaning}
          </span>
        </div>
      </div>
    </div>
  );
}
