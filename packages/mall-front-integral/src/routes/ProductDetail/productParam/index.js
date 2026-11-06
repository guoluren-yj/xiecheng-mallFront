import React from 'react';
import { Tooltip } from 'hzero-ui';

import EmptyComponent from 'components/EmptyComponent';
import cuxComponent from 'cuxTools/cuxComponent';
import CuxWrapper from 'cuxTools/CuxWrapper';
import { getOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import useRequest from 'hooks/useRequest';
import HmallConfig from 'utils/api-config';
import { SupplierComponent, CopyButton } from 'utils/renderer';
import styles from './index.less';

// 浏览量
const ReviewQuality = cuxComponent({ path: 'sigl/ProductDetail/productParam/ReviewQuality' })(
  EmptyComponent
);

export default function ProductParam(props) {
  const {
    productData: {
      skuCode,
      showSupplierCompanyName,
      productSkuAttrList: productSkuAttrDTOS = [],
      itemCode,
      itemName,
      deliveryCycle,
      afterSale,
      sourceFrom,
      thirdSkuId,
      thirdSkuCode,
      itemUomName,
      instruction,
      afsSpecial,
      itemCategoryCode,
      itemCategoryName,
      afterSaleMobile,
      internationalTelCode,
      deliveryType,
      guarantee,
      changeDesc, // 换货说明
      returnDesc, // 退货说明
      qualityDesc, // 质保信息
      validDay,
    },
    itemInfo,
  } = props;
  const { returnDuration, changeDuration, afterSaleSpecial, changeSpecial, returnSpecial } =
    afterSale || {};

  /* 退货信息 */
  const filterReturnInfo = () => {
    // 电商
    if (sourceFrom !== 'CATA') {
      return returnDesc || '-';
    } else {
      // 目录化
      switch (returnSpecial) {
        case 0:
          return returnDuration
            ? intl
                .get('mallf.productDetail.return.purchase0', { value: returnDuration })
                .d(`确认收货后${returnDuration}日内出现商品质量问题可申请退货`)
            : '-';
        case 1:
          return intl.get('mallf.productDetail.return.purchase1').d('特殊商品，已经签收不予退货');
        default:
          return intl.get('mallf.productDetail.return.purchase2').d('该商品支持不限次退货');
      }
    }
  };

  /* 换货信息 */
  const filterExchangeInfo = () => {
    if (sourceFrom !== 'CATA') {
      return changeDesc || '-';
    } else {
      switch (changeSpecial) {
        case 0:
          return changeDuration
            ? intl
                .get('mallf.productDetail.exchange.purchase0', { value: changeDuration })
                .d(`确认收货后${changeDuration}日内出现商品质量问题可申请换货`)
            : '-';
        case 1:
          return intl.get('mallf.productDetail.exchange.purchase1').d('特殊商品，已经签收不予换货');
        default:
          return intl.get('mallf.productDetail.exchange.purchase2').d('该商品支持不限次换货');
      }
    }
  };

  /* 特殊售后信息 */
  const filterAfterSalesInfo = () => {
    switch (afterSaleSpecial) {
      case 1:
        return instruction;
      default:
        return intl.get('mallf.productDetail.after.sales.info').d('不是特殊售后');
    }
  };

  const { description } = productSkuAttrDTOS?.find((p) => p.attrCode === '000000000001') || {};
  // 查询供货周期值集
  const { resData: deliveryCycleMapping } = useRequest({
    url: `${HmallConfig.apiGateway}/hpfm/v1/${getOrganizationId()}/lovs/value`,
    query: { lovCode: 'SMAL.DELIVERY_CYCLE_TYPE' },
  });
  const deliveryCycleMappingData = deliveryCycleMapping?.filter((i) => i.value !== 'OTHER');

  return (
    <div className={styles.container}>
      <ReviewQuality productData={props.productData} />
      <div className="content">
        <div className="header text-overflow">
          {intl.get('mallf.productDetail.view.product.info').d('商品参考信息')}
        </div>
        <div className="info">
          <div className="product-info">
            {sourceFrom === 'CATA' ? (
              <p>
                <span className="item-label">
                  {intl.get('mallf.common.view.productCode').d('商品编码')}
                </span>
                ： <span className="item-content">{skuCode}</span>
                <CopyButton
                  style={{ top: -3, lineHeight: '20px' }}
                  num={skuCode}
                  label={intl.get('mallf.productDetail.view.productCode').d('商品编码')}
                />
              </p>
            ) : (
              <p>
                <span className="item-label">
                  {intl.get('mallf.productDetail.view.productCode').d('商品编码')}
                </span>
                ：
                <span className="item-content">
                  <Tooltip
                    placement="top"
                    title={`${intl.get(`mallf.productDetail.view.ECproductCode`).d('电商编码')}:${
                      thirdSkuId || thirdSkuCode
                    }`}
                  >
                    {skuCode}
                  </Tooltip>
                </span>
                <CopyButton
                  style={{ top: -3, lineHeight: '20px' }}
                  num={skuCode}
                  label={intl.get('mallf.productDetail.view.productCode').d('商品编码')}
                />
              </p>
            )}
            <p>
              <span className="item-label">
                {intl.get('mallf.common.model.thirdProductSkuId').d('第三方商品编码')}
              </span>
              ：
              <span className="item-content copy-btn-container">
                {thirdSkuId || thirdSkuCode || '-'}
                <CopyButton
                  style={{ top: -3 }}
                  num={thirdSkuId || thirdSkuCode}
                  label={intl
                    .get('mallf.productDetail.model.thirdProductSkuId')
                    .d('第三方商品编码')}
                />
              </span>
            </p>
            <p>
              <span className="item-label">{intl.get('mallf.common.view.brand').d('品牌')}</span>：
              <span className="item-content">{description || '-'}</span>
            </p>
            <SupplierComponent>
              <p>
                <span className="item-label">
                  {intl.get('mallf.common.view.supplier').d('供应商')}
                </span>
                ： <span className="item-content">{showSupplierCompanyName || '-'}</span>
              </p>
            </SupplierComponent>
            {afterSaleMobile && (
              <p>
                <span className="item-label">
                  {intl.get(`mallf.common.view.contactInformation`).d('联系方式')}
                </span>
                ：
                <span className="item-content">
                  {`${internationalTelCode ? `${internationalTelCode} | ` : ''}${afterSaleMobile}`}
                </span>
              </p>
            )}
          </div>
          <div className="product-info bottom">
            {(itemInfo.itemCode || itemCode) && (
              <p>
                <span className="item-label">
                  {intl.get('mallf.productDetail.view.item.code').d('物料编码')}
                </span>
                ：
                <span className="item-content copy-btn-container">
                  <span className="content-text">{itemInfo.itemCode || itemCode || '-'}</span>
                  <CopyButton
                    style={{ top: -3 }}
                    num={itemInfo.itemCode || itemCode}
                    label={intl.get('mallf.productDetail.view.item.code').d('物料编码')}
                  />
                </span>
              </p>
            )}
            {(itemInfo.itemName || itemName) && (
              <p>
                <span className="item-label">
                  {intl.get('mallf.productDetail.view.item.name').d('物料名称')}
                </span>
                ：
                <span className="item-content" title={itemInfo.itemName || itemName || '-'}>
                  {itemInfo.itemName || itemName || '-'}
                </span>
              </p>
            )}
            {itemUomName && (
              <p>
                <span className="item-label">
                  {intl.get('mallf.productDetail.view.item.uom').d('物料单位')}
                </span>
                ：<span className="item-content">{itemUomName || '-'}</span>
              </p>
            )}
            {itemCategoryCode && (
              <p>
                <span className="item-label">
                  {intl.get('mallf.productDetail.view.itemCategoryCode').d('品类编码')}
                </span>
                ：
                <span className="item-content copy-btn-container">
                  {itemCategoryCode || '-'}
                  <CopyButton
                    style={{ top: -3 }}
                    num={itemCategoryCode}
                    label={intl.get('mallf.productDetail.view.itemCategoryCode').d('品类编码')}
                  />
                </span>
              </p>
            )}
            {itemCategoryName && (
              <p>
                <span className="item-label">
                  {intl.get('mallf.productDetail.view.itemCategoryName').d('品类名称')}
                </span>
                ：<span className="item-content">{itemCategoryName || '-'}</span>
              </p>
            )}
            <p>
              <span className="item-label">
                {intl.get('mallf.productDetail.model.deliveryDay').d('供货周期(天)')}
              </span>
              ：
              <span className="item-content">
                {deliveryCycleMappingData?.find((i) => i.value === deliveryCycle)?.meaning ||
                  deliveryCycle ||
                  '-'}
              </span>
            </p>
            <CuxWrapper path="NewProductDetail/ProductParam/ValidDay" value={{ validDay }}>
              <p r-if={validDay && validDay <= 30}>
                <span className="item-label">
                  {intl.get(`mallf.productDetail.view.validDay`).d('价格有效期(天)')}
                </span>
                ：<span className="item-content">{validDay}</span>
              </p>
            </CuxWrapper>
            <p>
              <span className="item-label">
                {intl.get('mallf.productDetail.model.return.info').d('退货信息')}
              </span>
              ：
              <span className="item-content" title={filterReturnInfo()}>
                {filterReturnInfo()}
              </span>
            </p>
            <p>
              <span className="item-label">
                {intl.get('mallf.productDetail.model.exchange.info').d('换货信息')}
              </span>
              ：
              <span className="item-content" title={filterExchangeInfo()}>
                {filterExchangeInfo()}
              </span>
            </p>
            <p>
              <span className="item-label">
                {intl.get('mallf.productDetail.model.warranty.info').d('质保信息')}：
              </span>
              <span r-if={sourceFrom === 'CATA'} className="item-content" title={guarantee}>
                {guarantee || '-'}
              </span>
              <span r-if={sourceFrom !== 'CATA'} className="item-content" title={qualityDesc}>
                {qualityDesc || '-'}
              </span>
            </p>
            <p>
              <span className="item-label">
                {intl.get('mallf.productDetail.model.special.afterSales.info').d('特殊售后说明')}
              </span>
              ：
              <span className="item-content" title={filterAfterSalesInfo()}>
                {filterAfterSalesInfo()}
              </span>
            </p>
            {!!afsSpecial && instruction && (
              <p>
                <span className="item-label">
                  {intl.get('mallf.common.view.afterSalesInformation').d('售后信息')}
                </span>
                ：
                <Tooltip placement="top" title={instruction}>
                  <a>{intl.get('hzero.common.button.look').d('查看')}</a>
                </Tooltip>
              </p>
            )}
            {deliveryType === 1 && (
              <p>
                <span className="item-label">
                  {intl.get('mallf.common.view.sendMethod').d('配送方式')}
                </span>
                ：
                <span className="item-content">
                  {intl.get('mallf.common.view.JD.send').d('京东配送')}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
