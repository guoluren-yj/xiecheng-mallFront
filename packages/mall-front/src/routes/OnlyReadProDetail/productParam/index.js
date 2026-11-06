import React, { useRef } from 'react';
import { Tooltip } from 'hzero-ui';

import { getOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import useRequest from '@/hooks/useRequest';
import HmallConfig from 'utils/api-config';
import { SupplierComponent } from 'utils/renderer';
import styles from './index.less';
import FinalPriceChart from '../productInfo/finalPriceChart';

export default function ProductParam(props) {
  const productPrice1 = useRef(null);
  const productPrice2 = useRef(null);
  const {
    productData: {
      skuCode,
      showSupplierName,
      productSkuAttrDTOS = [],
      itemCode,
      itemName,
      deliveryCycle,
      productId,
      returnDuration,
      changeDuration,
      sourceFrom,
      thirdSkuId,
      uomName,
      instruction,
      afsSpecial,
      itemCategoryCode,
      itemCategoryName,
      agreementType,
    },
    itemInfo,
  } = props;

  const { description } = productSkuAttrDTOS.find((p) => p.attrCode === '000000000001') || {};
  // 查询供货周期值集
  const { resData: deliveryCycleMapping } = useRequest({
    url: `${HmallConfig.apiGateway}/hpfm/v1/${getOrganizationId()}/lovs/value`,
    query: { lovCode: 'SMAL.DELIVERY_CYCLE_TYPE' },
  });
  const deliveryCycleMappingData = deliveryCycleMapping?.filter((i) => i.value !== 'OTHER');
  return (
    <div className={styles.container}>
      <div className="content">
        <div className="header text-overflow">
          {intl.get('mallf.productDetail.view.product.info').d('商品参考信息')}
        </div>
        <div className="info">
          <div className="price-btns">
            <div className="btn">
              <span className="text-overflow">
                {intl.get('mallf.productDetail.model.historyPrice').d('历史报价')}
              </span>
              <div ref={productPrice1} className="item item-history">
                <FinalPriceChart type={1} productId={productId} agreementType={agreementType} />
              </div>
            </div>
            <div className="btn">
              <span className="text-overflow">
                {intl.get('mallf.productDetail.model.historyFinalPrice').d('历史成交价')}
              </span>
              <div ref={productPrice2} className="item item-dealHistory">
                <FinalPriceChart type={2} productId={productId} agreementType={agreementType} />
              </div>
            </div>
          </div>
          <div className="product-info">
            {sourceFrom === 'CATA' ? (
              <p>
                {intl.get('mallf.productDetail.view.productCode').d('商品编码')}： {skuCode}
              </p>
            ) : (
              <Tooltip
                placement="top"
                title={`${intl
                  .get(`mallf.productDetail.view.ECproductCode`)
                  .d('电商编码')}:${thirdSkuId}`}
              >
                <p>
                  {intl.get('mallf.productDetail.view.productCode').d('商品编码')}： {skuCode}
                </p>
              </Tooltip>
            )}
            <p>
              {intl.get('mallf.productDetail.model.thirdProductSkuId').d('第三方商品编码')}：
              {thirdSkuId || '-'}
            </p>
            <p>
              {intl.get('mallf.productDetail.view.brand').d('品牌')}： {description || '-'}
            </p>
            <SupplierComponent>
              <p>
                {intl.get('mallf.productDetail.view.supplier').d('供应商')}：{' '}
                {showSupplierName || '-'}
              </p>
            </SupplierComponent>
          </div>
          <div className="product-info bottom">
            <p>
              {intl.get('mallf.productDetail.view.item.code').d('物料编码')}：
              {itemInfo.itemCode || itemCode || '-'}
            </p>
            <p>
              {intl.get('mallf.productDetail.view.item.name').d('物料名称')}：
              {itemInfo.itemName || itemName || '-'}
            </p>
            <p>
              {intl.get('mallf.productDetail.view.item.uom').d('物料单位')}：{uomName || '-'}
            </p>
            <p>
              {intl.get('mallf.productDetail.view.itemCategoryCode').d('品类编码')}：
              {itemCategoryCode || '-'}
            </p>
            <p>
              {intl.get('mallf.productDetail.view.itemCategoryName').d('品类名称')}：
              {itemCategoryName || '-'}
            </p>
            <p>
              {intl.get('mallf.productDetail.model.deliveryDay').d('供货周期(天)')}：
              {deliveryCycleMappingData?.find((i) => i.value === deliveryCycle)?.meaning ||
                deliveryCycle ||
                '-'}
            </p>
            {!!afsSpecial && instruction && (
              <p>
                {intl.get('mallf.productDetail.view.afterSalesInformation').d('售后信息')}：
                <Tooltip placement="top" title={instruction}>
                  <a>{intl.get('hzero.common.button.look').d('查看')}</a>
                </Tooltip>
              </p>
            )}
          </div>
          {/* {afsSpecial && instruction && (
            <div className="special-afs">
              <span className="afs-label">售后信息：</span>
              <span className="afs-content">{instruction}nihaonihaoajdkahskjdhsajfhsdkj</span>
            </div>
          )} */}
          <div className="sale-after">
            {returnDuration === 7 && (
              <span className="return return-7">
                {' '}
                {intl.get('mallf.productDetail.view.7return').d('7日退货')}
              </span>
            )}
            {changeDuration === 15 && (
              <span className="return change-15">
                {intl.get('mallf.productDetail.view.15change').d('15日换货')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
