import React from 'react';
import { Tooltip } from 'hzero-ui';
import { Divider } from 'choerodon-ui';

import OverflowTip from 'components/OverflowTip';
import Icons from 'components/Icons';
import EmptyComponent from 'components/EmptyComponent';
import cuxComponent from 'cuxTools/cuxComponent';
import CuxWrapper from 'cuxTools/CuxWrapper';
import { getOrganizationId, getPrimaryColor } from 'utils/utils';
import intl from 'utils/intl';
import useRequest from '@/hooks/useRequest';
import HmallConfig from 'utils/api-config';
import { SupplierComponent, CopyButton } from 'utils/renderer';
import { isNil } from 'lodash';
import styles from './index.less';
import HistoryPrice from './HistoryPrice';

const code1 = 'MALL.PRODUCT.DETAIL.PARAMS.INFO';
const code2 = 'MALL.PRODUCT.DETAIL.RECEIVE.PARAMS.INFO';

// 浏览量
const ReviewQuality = cuxComponent({ path: 'ProductDetail/productParam/ReviewQuality' })(
  EmptyComponent
);

function ProductParam(props) {
  const {
    productData: {
      skuCode,
      showSupplierName,
      productSkuAttrDTOS = [],
      itemCode,
      itemName,
      deliveryCycle,
      returnDuration,
      changeDuration,
      sourceFrom,
      thirdSkuCode,
      itemUomName,
      instruction,
      afsSpecial,
      itemCategoryCode,
      itemCategoryName,
      afterSaleMobile,
      afterSaleTelephone,
      internationalTelCode,
      deliveryType,
      afterSaleSpecial,
      changeSpecial,
      returnSpecial,
      guarantee,
      receiveFlag,
      changeDesc, // 换货说明
      returnDesc, // 退货说明
      qualityDesc, // 质保信息
      taxRate,
      validDay, // 价格有效期
      centralizedTemplateId,
      centralizedPurchaseQuantity,
      cartCentralizedPurchaseQuantity,
    },
    productData,
    custDisplay,
    itemInfo,
  } = props;

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

  const ValidDay = (
    <CuxWrapper path="NewProductDetail/ProductParam/ValidDay" value={{ validDay }}>
      <p data-field="validDay" style={{ display: validDay && validDay <= 30 ? '' : 'none' }}>
        <span className="item-label">
          {intl.get(`mallf.productDetail.view.validDay`).d('价格有效期(天)')}：
        </span>
        <span className="item-content" r-title>
          {validDay}
        </span>
      </p>
    </CuxWrapper>
  );

  return (
    <div className={styles.container}>
      <ReviewQuality productData={props.productData} />
      <div className="content">
        <div className="header text-overflow">
          {intl.get('mallf.productDetail.view.product.info').d('商品参考信息')}
        </div>
        <div className="info">
          {!receiveFlag
            ? custDisplay(
                {
                  code: code1,
                  dataSource: { ...props.productData, afterSalesInfo: filterAfterSalesInfo() },
                  missFields: [
                    'afterSaleMobile',
                    'afterSaleTelephone',
                    'itemCode',
                    'itemName',
                    'itemUomName',
                    'itemCategoryCode',
                    'itemCategoryName',
                    'afterSalesInformation',
                    'jDSend',
                    'taxRate',
                    'validDay',
                    'centralizedPurchaseQuantity',
                    'cartCentralizedPurchaseQuantity',
                  ],
                },
                <div className="product-info">
                  {/* 协鑫需要展示历史价格信息 HistoryPrice */}
                  {props?.productData?.cuxShowHistoryPrice && (
                    <HistoryPrice data-field="historyPrice" productData={productData} />
                  )}
                  <p data-field="skuCode">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.productCode').d('商品编码')}：
                    </span>
                    <span className="item-content">
                      <Tooltip
                        placement="top"
                        title={
                          sourceFrom !== 'CATA'
                            ? `${intl
                                .get(`mallf.productDetail.view.ECproductCode`)
                                .d('电商编码')}:${thirdSkuCode}`
                            : null
                        }
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
                  <p data-field="thirdSkuCode">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.model.thirdProductSkuId').d('第三方商品编码')}
                      ：
                    </span>
                    <span className="item-content copy-btn-container">
                      <span className="content-text">
                        <OverflowTip placement="top">{thirdSkuCode || '-'}</OverflowTip>
                      </span>
                      <CopyButton
                        style={{ top: -3 }}
                        num={thirdSkuCode}
                        label={intl
                          .get('mallf.productDetail.model.thirdProductSkuId')
                          .d('第三方商品编码')}
                      />
                    </span>
                  </p>
                  <p data-field="brand">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.brand').d('品牌')}：
                    </span>
                    <span className="item-content" title={description}>
                      <OverflowTip placement="top">{description || '-'}</OverflowTip>
                    </span>
                  </p>
                  <SupplierComponent>
                    <p data-field="showSupplierName">
                      <span className="item-label">
                        {intl.get('mallf.productDetail.view.supplier').d('供应商')}：
                      </span>
                      <span className="item-content" title={showSupplierName}>
                        {showSupplierName || '-'}
                      </span>
                    </p>
                  </SupplierComponent>
                  <p data-field="taxRate">
                    <span className="item-label">
                      {intl.get(`mallf.productDetail.view.taxRate`).d('税率')}：
                    </span>
                    <span className="item-content" r-title>
                      {taxRate ? `${taxRate}%` : ''}
                    </span>
                  </p>
                  <p data-field="afterSaleTelephone" r-if={afterSaleTelephone}>
                    <span className="item-label">
                      {intl.get(`mallf.productDetail.view.afterSaleTelephone`).d('固定电话')}：
                    </span>
                    <span className="item-content">
                      <OverflowTip placement="top">{afterSaleTelephone}</OverflowTip>
                    </span>
                  </p>
                  <p data-field="afterSaleMobile" r-if={afterSaleMobile}>
                    <span className="item-label">
                      {intl.get(`mallf.productDetail.view.contactInformation`).d('联系方式')}：
                    </span>
                    <span className="item-content">
                      <OverflowTip placement="top">
                        {`${
                          internationalTelCode ? `${internationalTelCode} | ` : ''
                        }${afterSaleMobile}`}
                      </OverflowTip>
                    </span>
                  </p>
                  <p className="item-divide" data-field="divide" />
                  <p r-if={itemInfo.itemCode || itemCode} data-field="itemCode">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.item.code').d('物料编码')}：
                    </span>
                    <span className="item-content copy-btn-container">
                      <span className="content-text">
                        <OverflowTip placement="top">
                          {itemInfo.itemCode || itemCode || '-'}
                        </OverflowTip>
                      </span>
                      <CopyButton
                        style={{ top: -3 }}
                        num={itemInfo.itemCode || itemCode}
                        label={intl.get('mallf.productDetail.view.item.code').d('物料编码')}
                      />
                    </span>
                  </p>
                  <p r-if={itemInfo.itemName || itemName} data-field="itemName">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.item.name').d('物料名称')}：
                    </span>
                    <span className="item-content">
                      <OverflowTip placement="top">
                        {itemInfo.itemName || itemName || '-'}
                      </OverflowTip>
                    </span>
                  </p>
                  <p r-if={itemUomName} data-field="itemUomName">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.item.uom').d('物料单位')}：
                    </span>
                    <span className="item-content" title={itemUomName}>
                      <OverflowTip placement="top">{itemUomName || '-'}</OverflowTip>
                    </span>
                  </p>
                  <p r-if={itemCategoryCode} data-field="itemCategoryCode">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.itemCategoryCode').d('品类编码')}：
                    </span>
                    <span className="item-content copy-btn-container">
                      <span className="content-text">
                        <OverflowTip placement="top">{itemCategoryCode || '-'}</OverflowTip>
                      </span>
                      <CopyButton
                        style={{ top: -3 }}
                        num={itemCategoryCode}
                        label={intl.get('mallf.productDetail.view.itemCategoryCode').d('品类编码')}
                      />
                    </span>
                  </p>
                  <p r-if={itemCategoryName} data-field="itemCategoryName">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.itemCategoryName').d('品类名称')}：
                    </span>
                    <span className="item-content" title={itemCategoryName}>
                      <OverflowTip placement="top">{itemCategoryName || '-'}</OverflowTip>
                    </span>
                  </p>
                  <p data-field="deliveryCycle">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.model.deliveryDay').d('供货周期(天)')}：
                    </span>
                    <span
                      className="item-content"
                      title={
                        deliveryCycleMappingData?.find((i) => i.value === deliveryCycle)?.meaning ||
                        deliveryCycle
                      }
                    >
                      <OverflowTip placement="top">
                        {deliveryCycleMappingData?.find((i) => i.value === deliveryCycle)
                          ?.meaning ||
                          deliveryCycle ||
                          '-'}
                      </OverflowTip>
                    </span>
                  </p>
                  {ValidDay}
                  <p data-field="returnInfo">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.model.return.info').d('退货信息')}：
                    </span>
                    <span className="item-content" title={filterReturnInfo()}>
                      <OverflowTip placement="top">{filterReturnInfo()}</OverflowTip>
                    </span>
                  </p>
                  <p data-field="exchangeInfo">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.model.exchange.info').d('换货信息')}：
                    </span>
                    <span className="item-content" title={filterExchangeInfo()}>
                      <OverflowTip placement="top">{filterExchangeInfo()}</OverflowTip>
                    </span>
                  </p>
                  <p data-field="guarantee">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.model.warranty.info').d('质保信息')}：
                    </span>
                    <span className="item-content">
                      <OverflowTip placement="top">
                        {sourceFrom === 'CATA' ? guarantee : qualityDesc || '-'}
                      </OverflowTip>
                    </span>
                  </p>
                  <p data-field="afterSalesInfo">
                    <span className="item-label">
                      {intl
                        .get('mallf.productDetail.model.special.afterSales.info')
                        .d('特殊售后说明')}
                      ：
                    </span>
                    <span className="item-content" title={filterAfterSalesInfo()}>
                      <OverflowTip placement="top">{filterAfterSalesInfo()}</OverflowTip>
                    </span>
                  </p>
                  <p r-if={!!afsSpecial && instruction} data-field="afterSalesInformation">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.afterSalesInformation').d('售后信息')}：
                    </span>
                    <Tooltip placement="top" title={instruction}>
                      <a>{intl.get('mallf.productDetail.button.look').d('查看')}</a>
                    </Tooltip>
                  </p>
                  <p r-if={deliveryType === 1} data-field="jDSend">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.sendMethod').d('配送方式')}：
                    </span>
                    <span
                      className="item-content"
                      title={intl.get('mallf.productDetail.view.JD.send').d('京东配送')}
                    >
                      {intl.get('mallf.productDetail.view.JD.send').d('京东配送')}
                    </span>
                  </p>
                  <p
                    r-if={centralizedTemplateId && !isNil(centralizedPurchaseQuantity)}
                    data-field="centralizedPurchaseQuantity"
                  >
                    <span className="item-label">
                      {intl.get('mallf.common.view.predictQuantity').d('预计拼单数量')}：
                    </span>
                    <span className="item-content">
                      <OverflowTip placement="top">{centralizedPurchaseQuantity}</OverflowTip>
                    </span>
                  </p>
                  <p r-if={centralizedTemplateId} data-field="cartCentralizedPurchaseQuantity">
                    <span className="item-label">
                      {intl
                        .get('mallf.common.view.cartCentralizedPurchaseQuantity')
                        .d('已加入拼单数量')}
                      ：
                    </span>
                    <span className="item-content">
                      <OverflowTip placement="top">{cartCentralizedPurchaseQuantity}</OverflowTip>
                    </span>
                  </p>
                </div>
              )
            : custDisplay(
                {
                  code: code2,
                  dataSource: props.productData,
                  missFields: ['itemCode', 'itemName', 'itemUomName', 'taxRate', 'validDay'],
                },
                <div className="product-info">
                  <p data-field="skuCode">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.productCode').d('商品编码')}：
                    </span>
                    <span className="item-content">{skuCode}</span>
                    <CopyButton
                      style={{ top: -3, lineHeight: '20px' }}
                      num={skuCode}
                      label={intl.get('mallf.productDetail.view.productCode').d('商品编码')}
                    />
                  </p>
                  <p data-field="brand">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.brand').d('品牌')}：
                    </span>
                    <span className="item-content" title={description}>
                      <OverflowTip placement="top">{description || '-'}</OverflowTip>
                    </span>
                  </p>
                  <SupplierComponent>
                    <p data-field="showSupplierName">
                      <span className="item-label">
                        {intl.get('mallf.productDetail.view.supplier').d('供应商')}：
                      </span>
                      <span className="item-content" title={showSupplierName}>
                        {showSupplierName || '-'}
                      </span>
                    </p>
                  </SupplierComponent>
                  <p data-field="taxRate">
                    <span className="item-label">
                      {intl.get(`mallf.productDetail.view.taxRate`).d('税率')}：
                    </span>
                    <span className="item-content" r-title>
                      {taxRate ? `${taxRate}%` : ''}
                    </span>
                  </p>
                  {ValidDay}
                  <p className="item-divide" data-field="divide" />
                  <p r-if={itemInfo.itemCode || itemCode} data-field="itemCode">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.item.code').d('物料编码')}：
                    </span>
                    <span className="item-content copy-btn-container">
                      <span className="content-text">
                        <OverflowTip placement="top">
                          {itemInfo.itemCode || itemCode || '-'}
                        </OverflowTip>
                      </span>
                      <CopyButton
                        style={{ top: -3 }}
                        num={itemInfo.itemCode || itemCode}
                        label={intl.get('mallf.productDetail.view.item.code').d('物料编码')}
                      />
                    </span>
                  </p>
                  <p r-if={itemInfo.itemName || itemName} data-field="itemName">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.item.name').d('物料名称')}：
                    </span>
                    <span className="item-content">
                      <OverflowTip placement="top">
                        {itemInfo.itemName || itemName || '-'}
                      </OverflowTip>
                    </span>
                  </p>
                  <p r-if={itemUomName} data-field="itemUomName">
                    <span className="item-label">
                      {intl.get('mallf.productDetail.view.item.uom').d('物料单位')}：
                    </span>
                    <span className="item-content" title={itemUomName}>
                      {itemUomName || '-'}
                    </span>
                  </p>
                </div>
              )}
          <div r-if={productData.onlineConsultationUrl} style={{ margin: '0 20px 10px' }}>
            <Divider dashed style={{ margin: '10px 0' }} />
            <Icons
              type="support_agent_black_24dp"
              style={{ marginRight: '5px', fontWeight: '400', color: getPrimaryColor() }}
            />
            <a
              className="primary-color"
              target="_blank"
              rel="noopener noreferrer"
              href={productData.onlineConsultationUrl}
            >
              {intl.get('mallf.productDetail.view.contact.ec').d('联系电商')}
            </a>
          </div>
        </div>

        <CuxWrapper
          path="NewProductDetail/ProductParam/OtherInfo"
          value={{ data: props.productData }}
        />
      </div>
    </div>
  );
}

export default ProductParam;
