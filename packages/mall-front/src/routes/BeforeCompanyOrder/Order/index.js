import React, { useEffect } from 'react';
import { Modal } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';

import Loading from 'components/loading';
import intl from 'utils/intl';
import HeaderInfo from '../CustomizeHeaderInfo';
import EcInfo from '../EcInfo';
import CataInfo from '../CataInfo';
import ProductList from '../ProductList';
// eslint-disable-next-line import/no-cycle
import PurchaseHeaderDetail from '../PurchaseHeaderDetail';
import InternalPurchasInfo from '../InternalPurchasInfo';

const Header = 'MALL.BEFORE.ORDER.HEADER.SUPPLY';
const ECLine = 'MALL.BEFORE.ORDER.EC.LINE.SUPPLY';
const CATALine = 'MALL.BEFORE.ORDER.LINE.SUPPLY';

const OMSHeader = 'MALL.BEFORE.ORDER.OMS.HEADER.SUPPLY';
const OMSECLine = 'MALL.BEFORE.ORDER.OMS.EC.LINE.SUPPLY';
const OMSCATALine = 'MALL.BEFORE.ORDER.OMS.CATA.LINE.SUPPLIER';

export const HEADER_DETAIL_DOC = 'MALL.BEFORE.ORDER.OMS.HEADER.DOC.INFO'; // 顶部的纯展示-单据信息
export const HEADER_DETAIL_ACEIPT = 'MALL.BEFORE.ORDER.OMS.HEADER.ACEIPT.INFO'; // 顶部的纯展示-收货信息
export const HEADER_DETAIL_PRICE = 'MALL.BEFORE.ORDER.OMS.HEADER.PRICE.INFO'; // 顶部的纯展示-商品合计

export default c7nCustomize({
  unitCode: [
    Header,
    ECLine,
    CATALine,
    OMSHeader,
    OMSECLine,
    OMSCATALine,
    HEADER_DETAIL_DOC,
    HEADER_DETAIL_ACEIPT,
    HEADER_DETAIL_PRICE,
  ],
  manualQuery: true,
})(Order);

function Order(props) {
  function useOtherHeaderPurchase({ message, onOk }) {
    Modal.confirm({
      title: intl.get('mallf.companyOrder.view.sureNum').d('确认数量'),
      width: 460,
      content: <div className="content-modal-confirm">{message}</div>,
      onOk,
    });
  }

  const {
    defaultSetting,
    order,
    // minPurchaseFlag,
    handleOrderNum,
    orderIndex,
    // minPurchaseAmount,
    shoppingCartDTOList,
    headerCode,
    eCLineCode,
    cataLineCode,
    orderData,
    budgetList,
    editBudget,
    budgetSelectList,
    setSubmitLoading,
    setOrderData,
    changePayAndPurchaseData,
    count,
    invoiceCheckData,
    initInvoiceData,
    openModal,
    orderTime,
    orderExpedited,
    applyExpedited,
    hasSiglProduct,
    custConfig: unitConfig, // c7n 个性化config,
    setCtxParams,
    customizeForm,
    cSupply,
    queryUnitConfig,
    separateInitCustUnit,
    customizeDisplay,
  } = props;

  useEffect(() => {
    queryUnitConfig();
  }, []);

  useEffect(() => {
    // 兼容个性化弱网查询报错
    if (!props.custLoading && !isEmpty(unitConfig)) {
      setSubmitLoading(false);
    }
  }, [props.custLoading, unitConfig]);

  const ecInfoProps = {
    defaultSetting,
    order,
    count,
    orderIndex,
    invoiceCheckData,
    invoiceData: initInvoiceData,
    openModal,
    orderTime,
    changePayAndPurchaseData,
    form: props.form,
    hasSiglProduct,
  };
  const cataInfoProps = {
    useOtherHeaderPurchase,
    orderData,
    order,
    orderIndex,
    orderTime,
    orderExpedited,
    setOrderData,
  };
  const headerProps = {
    initInvoiceData,
    useOtherHeaderPurchase,
    unitConfig,
    code: headerCode,
    order,
    cForm: props.cForm,
    orderData,
    setOrderData,
    orderIndex,
    productSource: order.shoppingCartDTOList[0].productSource,
    setCtxParams,
    customizeForm,
  };
  const { minPurchaseResult, minPurchaseFlag } = order;
  if (props.custLoading || isEmpty(unitConfig)) {
    // 偶现白屏，等个性化数据加载完成再初始化
    setSubmitLoading(true);
    return <Loading />;
  }
  return (
    <div
      id={orderIndex}
      className={`order-wrapper${minPurchaseFlag === 0 ? ' order-wrapper-invalid' : ''}`}
    >
      <div className="order-header">
        {intl.get('mallf.companyOrder.model.companyOrder.purReqOrder').d('采购申请单') +
          handleOrderNum(orderIndex + 1)}
        {minPurchaseFlag === 0 && (
          <span style={{ color: 'red', fontSize: '12px', marginLeft: '20px' }}>
            {minPurchaseResult}
          </span>
        )}
      </div>
      <PurchaseHeaderDetail
        order={order}
        orderData={orderData}
        shoppingCartDTOList={shoppingCartDTOList}
        orderIndex={orderIndex}
        setOrderData={setOrderData}
        unitConfig={unitConfig}
        code={headerCode}
        customizeDisplay={customizeDisplay}
      />
      <CataInfo {...cataInfoProps} />
      <div
        className={
          unitConfig[headerCode]?.fields?.some((f) => f.visible === 1) ? '' : 'display-none'
        }
      >
        <HeaderInfo {...headerProps} />
      </div>
      <ProductList
        separateInitCustUnit={separateInitCustUnit}
        setCtxParams={setCtxParams}
        order={order}
        eCLineCode={eCLineCode}
        cataLineCode={cataLineCode}
        unitConfig={unitConfig}
        cSupply={cSupply}
        products={shoppingCartDTOList}
        orderData={orderData}
        budgetList={budgetList}
        budgetSelectList={budgetSelectList}
        editBudget={editBudget}
        orderIndex={orderIndex}
        setSubmitLoading={setSubmitLoading}
        setOrderData={setOrderData}
        minPurchaseFlag={minPurchaseFlag}
        applyExpedited={applyExpedited}
      />
      <>
        {order.shoppingCartDTOList[0].productSource !== 'CATA' &&
          !order.shoppingCartDTOList[0].qtHeaderNo && (
            <>
              <EcInfo {...ecInfoProps} />
            </>
          )}
        {!order.shoppingCartDTOList[0].qtHeaderNo && <InternalPurchasInfo {...ecInfoProps} />}
      </>
    </div>
  );
}
