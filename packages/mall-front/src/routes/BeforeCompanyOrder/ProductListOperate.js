import React, { useMemo } from 'react';
import { Form } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import cuxComponent from 'cuxTools/cuxComponent';
import CustomizeModal from './CustomizeModal';
import Budget from './Budget';

function ProductListOperate(props) {
  const {
    budgetList,
    product,
    budgetSelectList,
    editBudget,
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
    initCust,
  } = props;
  const { DS, ...pro } = product;
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
  }, [product.DS, dataSet, lineCode, initCust]);

  return (
    <div className="columns-item" style={{ width: 90 }}>
      <span>
        <Budget
          disabled
          budgetData={pro}
          budgetList={budgetList}
          budgetSelectList={budgetSelectList}
          editBudget={(n) => editBudget(n, orderIndex)}
        />
      </span>
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
              ? intl.get(`mallf.companyOrder.model.cancal.urgent`).d('取消加急')
              : intl.get(`mallf.companyOrder.model.companyOrder.urgent`).d('申请加急')}
          </p>
        )}
      {preLoadCustForm}
      {hasLineCustFlag && (
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
          products={products}
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

export default cuxComponent({ path: 'BeforeCompanyOrder/ProductListOperate' })(ProductListOperate);
