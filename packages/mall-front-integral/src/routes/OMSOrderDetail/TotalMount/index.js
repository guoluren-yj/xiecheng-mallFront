import React from 'react';
import { Tooltip, Icon } from 'choerodon-ui';

import { numberRender } from 'utils/utils';
import intl from 'utils/intl';
import styles from './index.less';

export default function TotalMount({ order, orderData, getOrderTotalMount, totalNumMeaning }) {
  return (
    <div className={styles['mount-content']}>
      <div className="mount-price">
        <div className="order-price-toatl">
          <span r-if={+getOrderTotalMount().totalSigl !== 0}>
            <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
            {numberRender(getOrderTotalMount().totalSigl)}
            <span
              r-if={+getOrderTotalMount().totalMoney !== 0}
              style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
            >
              +
            </span>
          </span>
          <span r-if={+getOrderTotalMount().totalMoney !== 0}>
            {order?.currencySymbol || ''}
            {getOrderTotalMount().totalMoney}
          </span>
        </div>
        <div className="order-freight-total">
          <span r-if={+getOrderTotalMount().totalSiglEx > 0}>
            <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
            {numberRender(getOrderTotalMount().totalSiglEx)}
            <span
              r-if={!!getOrderTotalMount().totalEx}
              style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
            >
              +
            </span>
          </span>
          <span r-if={!!getOrderTotalMount().totalEx}>
            {order.currencySymbol || ''}
            {getOrderTotalMount().totalEx}
          </span>
          <span r-if={!getOrderTotalMount().totalEx && !getOrderTotalMount().totalSiglEx}>0</span>
        </div>
        <div className="product-footer-num">
          <span className="footer-num-price">
            <Icon style={{ fontSize: 12, marginTop: -2 }} type="donut_small" />
            {numberRender(orderData.totalPointPrice)}
          </span>
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
          <span className="footer-num-label">
            <Tooltip
              title={
                <>
                  <p style={{ marginBottom: 5 }}>
                    {intl.get(`mallf.common.model.freight`).d('运费(含税)')}:
                    <span r-if={+getOrderTotalMount().totalSiglFeight > 0}>
                      <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                      {numberRender(getOrderTotalMount().totalSiglFeight)}
                      <span
                        r-if={+getOrderTotalMount().totalFeight > 0}
                        style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
                      >
                        +
                      </span>
                    </span>
                    <span r-if={!!getOrderTotalMount().totalFeight}>
                      {order.currencySymbol || ''}
                      {getOrderTotalMount().totalFeight}
                    </span>
                    {!getOrderTotalMount().totalFeight && !getOrderTotalMount().totalSiglFeight && (
                      <span>0</span>
                    )}
                  </p>
                  <p
                    r-if={
                      !!getOrderTotalMount().totalInstall || getOrderTotalMount().totalSiglInstall
                    }
                  >
                    {intl.get(`mallf.common.model.anzhuang`).d('安装费(含税)')}:
                    <span r-if={+getOrderTotalMount().totalSiglInstall > 0}>
                      <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                      {numberRender(getOrderTotalMount().totalSiglInstall)}
                      <span
                        r-if={!!getOrderTotalMount().totalInstall}
                        style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
                      >
                        +
                      </span>
                    </span>
                    <span r-if={!!getOrderTotalMount().totalInstall}>
                      {order.currencySymbol || ''}
                      {getOrderTotalMount().totalInstall}
                    </span>
                    <span
                      r-if={
                        !getOrderTotalMount().totalInstall && !getOrderTotalMount().totalSiglInstall
                      }
                    >
                      0
                    </span>
                  </p>
                </>
              }
            >
              <Icon
                type="help"
                style={{
                  fontSize: 14,
                  marginRight: 6,
                  marginTop: -4,
                  color: 'rgba(0,0,0,0.50)',
                }}
              />
            </Tooltip>
            {intl.get(`mallf.common.model.exMoney`).d('附加费(含税)')}:
          </span>
        </div>
        <div className="product-footer-num">
          <span className="footer-num-label">
            {intl.get('mallf.common.view.sigl.pointDeduction').d('积分抵扣')}:
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

// <div className="product-footer">
//                 <p className="product-footer-num">
//                   <span className="footer-num-label">
//                     {intl.get('mallf.common.view.productsPriceTotal').d('商品总金额(含税)')}:
//                   </span>
//                   <span className="footer-num-price">
//                     <span r-if={+this.getOrderTotalMount().totalSigl !== 0}>
//                       <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
//                       {numberRender(this.getOrderTotalMount().totalSigl)}
//                       <span
//                         r-if={+this.getOrderTotalMount().totalMoney !== 0}
//                         style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
//                       >
//                         +
//                       </span>
//                     </span>
//                     <span r-if={+this.getOrderTotalMount().totalMoney !== 0}>
//                       {order?.currencySymbol || ''}
//                       {this.getOrderTotalMount().totalMoney}
//                     </span>
//                   </span>
//                 </p>
//                 <p className="product-footer-num">
//                   <span className="footer-num-label">
//                     <Tooltip
//                       title={
//                         <>
//                           <p style={{ marginBottom: 5 }}>
//                             {intl.get(`mallf.common.model.freight`).d('运费(含税)')}:
//                             <span r-if={+this.getOrderTotalMount().totalSiglFeight > 0}>
//                               <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
//                               {numberRender(this.getOrderTotalMount().totalSiglFeight)}
//                               <span
//                                 r-if={+this.getOrderTotalMount().totalFeight > 0}
//                                 style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
//                               >
//                                 +
//                               </span>
//                             </span>
//                             <span r-if={!!this.getOrderTotalMount().totalFeight}>
//                               {order.currencySymbol || ''}
//                               {this.getOrderTotalMount().totalFeight}
//                             </span>
//                             {!this.getOrderTotalMount().totalFeight &&
//                               !this.getOrderTotalMount().totalSiglFeight && <span>0</span>}
//                           </p>
//                           <p
//                             r-if={
//                               !!this.getOrderTotalMount().totalInstall ||
//                               this.getOrderTotalMount().totalSiglInstall
//                             }
//                           >
//                             {intl.get(`mallf.common.model.anzhuang`).d('安装费(含税)')}:
//                             <span r-if={+this.getOrderTotalMount().totalSiglInstall > 0}>
//                               <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
//                               {numberRender(this.getOrderTotalMount().totalSiglInstall)}
//                               <span
//                                 r-if={!!this.getOrderTotalMount().totalInstall}
//                                 style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
//                               >
//                                 +
//                               </span>
//                             </span>
//                             <span r-if={!!this.getOrderTotalMount().totalInstall}>
//                               {order.currencySymbol || ''}
//                               {this.getOrderTotalMount().totalInstall}
//                             </span>
//                             <span
//                               r-if={
//                                 !this.getOrderTotalMount().totalInstall &&
//                                 !this.getOrderTotalMount().totalSiglInstall
//                               }
//                             >
//                               0
//                             </span>
//                           </p>
//                         </>
//                       }
//                     >
//                       <Icon
//                         type="help"
//                         style={{
//                           fontSize: 14,
//                           marginRight: 6,
//                           marginTop: -4,
//                           color: 'rgba(0,0,0,0.50)',
//                         }}
//                       />
//                     </Tooltip>
//                     {intl.get(`mallf.common.model.exMoney`).d('附加费(含税)')}:
//                   </span>
//                   <span className="footer-num-price">
//                     <span r-if={+this.getOrderTotalMount().totalSiglEx > 0}>
//                       <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
//                       {numberRender(this.getOrderTotalMount().totalSiglEx)}
//                       <span
//                         r-if={!!this.getOrderTotalMount().totalEx}
//                         style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}
//                       >
//                         +
//                       </span>
//                     </span>
//                     <span r-if={!!this.getOrderTotalMount().totalEx}>
//                       {order.currencySymbol || ''}
//                       {this.getOrderTotalMount().totalEx}
//                     </span>
//                     <span
//                       r-if={
//                         !this.getOrderTotalMount().totalEx && !this.getOrderTotalMount().totalSiglEx
//                       }
//                     >
//                       0
//                     </span>
//                   </span>
//                 </p>
//                 <p className="product-footer-num">
//                   <span className="footer-num-label">
//                     {intl.get('mallf.common.view.sigl.pointDeduction').d('积分抵扣')}:
//                   </span>
//                   <span className="footer-num-price">
//                     {/* {order?.currencySymbol || ''} */}
//                     <Icon style={{ fontSize: 12, marginTop: -2 }} type="donut_small" />
//                     {numberRender(orderData.totalPointPrice)}
//                   </span>
//                 </p>
//                 <p className="product-footer-all-num" style={{ marginTop: 10 }}>
//                   <span className="footer-num-label">
//                     <strong>
//                       {intl.get('mallf.common.view.products.finalPrice').d('实付款(含税)')}
//                     </strong>
//                     {intl
//                       .getHTML(`mallf.common.model.common.totalItems`, {
//                         value: totalNumMeaning,
//                       })
//                       .d(
//                         <span>
//                           共<b>{totalNumMeaning}</b>件商品
//                         </span>
//                       )}
//                     :
//                   </span>
//                   <span className="footer-num-price price-color">
//                     {order?.currencySymbol || ''}
//                     {orderData.orderPriceFinalVO?.finalAmountMeaning ||
//                       orderData.orderPriceFinalVO?.finalAmount}
//                   </span>
//                 </p>
//               </div>
