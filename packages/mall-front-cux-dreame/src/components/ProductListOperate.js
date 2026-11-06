import React, { useMemo } from 'react';
import { isEmpty } from 'lodash';
import { Form } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import CustomizeModal from 'mall-front/lib/routes/NewBeforeOrder/CustomizeModal';

function ProductListOperate(props) {
  const {
    product,
    preProduct,
    orderIndex,
    products,
    minPurchaseFlag,
    applyExpedited,
    unitConfig,
    lineCode,
    index,
    setOrderData,
    orderData,
    cSupply,
    setCtxParams,
    dataSet,
    hasLineCustFlag,
    hasEditCustomField,
    isReceive,
  } = props;
  const { hideFieldList = [] } = getUserConfigInfo();

  const preLoadCustForm = useMemo(() => {
    if (product.DS) {
      return (
        <div style={{ display: 'none' }}>
          {product.DS &&
            cSupply(
              { code: lineCode, dataSet },
              <Form record={product.DS} labelLayout="float" columns={1} />
            )}
        </div>
      );
    }
    return null;
  }, [product.DS, dataSet, lineCode]);

  const headerCustomizedList = useMemo(
    () =>
      (preProduct?.orderLineValue?.headerCustomizedList || []).filter(
        (n) => n.mappingHeadFlag !== 1
      ) || [],
    [preProduct]
  );
  const lineCustomizedList = useMemo(() => preProduct?.orderLineValue?.lineCustomizedList || [], [
    preProduct,
  ]);
  const showFlag =
    hasLineCustFlag !== undefined &&
    (hasLineCustFlag ||
      !isEmpty(headerCustomizedList?.filter((f) => (f.fxDisplayFlag || f.displayFlag) === 1)) ||
      !isEmpty(lineCustomizedList?.filter((f) => (f.fxDisplayFlag || f.displayFlag) === 1))); // 排除hasLineCustFlag===undefined
  return (
    <div className="columns-item" style={{ width: 90 }}>
      {products[0]?.productSource === 'CATA' &&
        minPurchaseFlag !== 0 &&
        !isReceive &&
        !hideFieldList.includes('EXPEDITED') && (
          <p
            className="primary-color text-overflow"
            style={{ cursor: 'pointer', marginBottom: '5px' }}
            onClick={() => {
              applyExpedited(!(product.urgentFlag === 1), product.productId, orderIndex, index);
            }}
          >
            {product.urgentFlag === 1
              ? intl.get(`mallf.myMall.model.cancal.urgent`).d('取消加急')
              : intl.get(`mallf.myMall.model.companyOrder.urgent`).d('申请加急')}
          </p>
        )}
      {preLoadCustForm}
      {showFlag && (
        <CustomizeModal
          unitConfig={unitConfig}
          setCtxParams={setCtxParams}
          code={lineCode}
          productIndex={index}
          setOrderData={setOrderData}
          product={product}
          products={products}
          orderIndex={orderIndex}
          orderData={orderData}
          cSupply={cSupply}
          dataSet={dataSet}
          headerCustomizedList={headerCustomizedList}
          lineCustomizedList={lineCustomizedList}
          hasLineCustFlag={hasLineCustFlag}
        >
          <p className="primary-color text-overflow" style={{ cursor: 'pointer' }}>
            {hasEditCustomField
              ? intl.get('mallf.common.view.fill.editInfo').d('编辑补充信息')
              : intl.get('mallf.common.view.fill.viewInfo').d('查看补充信息')}
          </p>
        </CustomizeModal>
      )}
    </div>
  );
}

export default ProductListOperate;
