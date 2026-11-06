import React, { useMemo } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Icon } from 'hzero-ui';
import { Tooltip } from 'choerodon-ui';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import Budget from 'mall-front/lib/routes/BeforeCompanyOrder/Budget';
import CustomizeModal from '../CustomizeModal';

export default function ProductListOperate(props) {
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
    initCust,
    hasEditCustomField,
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

  const overflowStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
  };
  const errorTip = intl
    .get('mallf.applyRes.fill.info.warning')
    .d('补充信息不通过，点击补充信息查看详情');

  const userValidateTip =
    '职能管控部门和职能管控部门联系人所在部门不一致，如确认无误，请点击“保存”继续提交';
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
        >
          <p className="primary-color text-overflow" style={{ cursor: 'pointer' }}>
            {hasEditCustomField
              ? intl.get('mallf.common.view.fill.editInfo').d('编辑补充信息')
              : intl.get('mallf.common.view.fill.viewInfo').d('查看补充信息')}
          </p>
        </CustomizeModal>
      )}
      {product.error && ( // 中金二开错误提示到此处
        <Tooltip title={errorTip} placement="bottom">
          <div className="product-line-warn" style={overflowStyle}>
            <span>
              <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
              {errorTip}
            </span>
          </div>
        </Tooltip>
      )}
      <Tooltip title={userValidateTip} placement="bottom">
        <div
          r-if={
            product?.DS?.get('attributeVarchar10') &&
            product?.DS?.get('attributeVarchar6Lov')?.unitCode &&
            product?.DS?.get('attributeVarchar6Lov')?.unitCode !==
              product?.DS?.get('attributeVarchar10')
          }
          className="product-line-warn"
          style={overflowStyle}
        >
          <span>
            <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
            {userValidateTip}
          </span>
        </div>
      </Tooltip>
    </div>
  );
}
