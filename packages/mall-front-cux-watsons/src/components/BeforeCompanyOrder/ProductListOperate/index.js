import React, { useState } from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import BudgetInfo from 'components/BudgetInfo';
import CustomizeModal from 'mall-front/lib/routes/BeforeCompanyOrder/CustomizeModal';
import CostAllocationModal from './CostAllocationModal';

export default function ProductListOperate(props) {
  const {
    order,
    budgetList,
    product,
    budgetSelectList,
    editBudget,
    orderIndex,
    products,
    minPurchaseFlag,
    applyExpedited,
    hasLineCustFlag,
    lineCode,
    index,
    setOrderData,
    orderData,
    cSupply,
    setCtxParams,
    dataSet,
  } = props;
  const { hideFieldList = [] } = getUserConfigInfo();
  const [costVisible, setCostVisible] = useState(false);
  return (
    <div className="columns-item">
      {!isEmpty(budgetList) && (
        <>
          <span>
            <BudgetInfo
              disabled
              budgetData={product}
              budgetList={budgetList}
              budgetSelectList={budgetSelectList}
              editBudget={(n) => editBudget(n, orderIndex)}
            />
          </span>
        </>
      )}
      {products[0]?.productSource === 'CATA' &&
        minPurchaseFlag !== 0 &&
        !hideFieldList.includes('EXPEDITED') && (
          <p
            className="primary-color"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              applyExpedited(!(product.urgentFlag === 1), product.productId, orderIndex);
            }}
          >
            {product.urgentFlag === 1
              ? intl.get(`mallf.myMall.model.cancal.urgent`).d('取消加急')
              : intl.get(`mallf.myMall.model.companyOrder.urgent`).d('申请加急')}
          </p>
        )}

      {hasLineCustFlag && (
        <CustomizeModal
          setCtxParams={setCtxParams}
          code={lineCode}
          productIndex={index}
          setOrderData={setOrderData}
          product={product}
          orderIndex={orderIndex}
          orderData={orderData}
          cSupply={cSupply}
          dataSet={dataSet}
        >
          <p className="primary-color" style={{ cursor: 'pointer' }}>
            {intl.get('mallf.common.view.fill.info').d('补充信息')}
          </p>
        </CustomizeModal>
      )}

      <p
        className="primary-color"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setCostVisible(true);
        }}
      >
        {intl.get('mallf.common.view.costAllocation').d('费用分配')}
      </p>
      {costVisible && (
        <CostAllocationModal
          visible={costVisible}
          toggleModal={() => setCostVisible(!costVisible)}
          product={order.watsonsShoppingCartDTOList[index]}
        />
      )}
    </div>
  );
}
