import React, { useMemo } from 'react';
import { isEmpty } from 'lodash';
import { Form, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getUserConfigInfo, getPrimaryColor } from 'utils/utils';
import CustomizeModal from 'mall-front/lib/routes/NewBeforeOrder/CustomizeModal';

export default function ProductListOperate(props) {
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
    initCust,
  } = props;
  const { hideFieldList = [] } = getUserConfigInfo();

  const preLoadCustForm = useMemo(() => {
    if (product.DS && initCust) {
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
  }, [product.DS, dataSet, lineCode, initCust]);

  const headerCustomizedList = useMemo(
    () => preProduct?.orderLineValue?.headerCustomizedList || [],
    [preProduct]
  );
  const lineCustomizedList = useMemo(() => preProduct?.orderLineValue?.lineCustomizedList || [], [
    preProduct,
  ]);
  const showFlag =
    hasLineCustFlag !== undefined &&
    (hasLineCustFlag || !isEmpty(headerCustomizedList) || !isEmpty(lineCustomizedList)); // 排除hasLineCustFlag===undefined
  return (
    <div className="columns-item" style={{ width: 90 }}>
      {products[0]?.productSource === 'CATA' &&
        minPurchaseFlag !== 0 &&
        !hideFieldList.includes('EXPEDITED') && (
          <p
            className="primary-color text-overflow"
            style={{ cursor: 'pointer' }}
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
          orderIndex={orderIndex}
          orderData={orderData}
          cSupply={cSupply}
          dataSet={dataSet}
          headerCustomizedList={headerCustomizedList}
          lineCustomizedList={lineCustomizedList}
          hasLineCustFlag={hasLineCustFlag}
        >
          <p className="primary-color text-overflow" style={{ cursor: 'pointer' }}>
            {intl.get('mallf.common.view.fill.info').d('补充信息')}
            <Icon
              style={{ color: getPrimaryColor(), fontSize: 14, marginLeft: 2, marginTop: -2 }}
              type="mode_edit"
            />
          </p>
        </CustomizeModal>
      )}
    </div>
  );
}
