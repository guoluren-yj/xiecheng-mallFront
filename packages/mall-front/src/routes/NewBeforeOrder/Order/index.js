import React, { useEffect, useMemo } from 'react';
import { Modal, Alert } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';

import Loading from 'components/loading';
import intl from 'utils/intl';
import { SupplierComponent } from 'utils/renderer';
import {
  Header,
  ECLine,
  CATALine,
  OMSHeader,
  OMSECLine,
  OMSCATALine,
  RECEIVE_HEADER_CODE,
  RECEIVE_LINE_CODE,
  HEADER_DETAIL_DOC,
  HEADER_DETAIL_ACEIPT,
  HEADER_DETAIL_PRICE,
} from 'utils/customizeCode';
import CuxWrapper from 'cuxTools/CuxWrapper';
import HeaderInfo from '../CustomizeHeaderInfo';
import EcInfo from '../EcInfo';
import PurchaseHeaderDetail from '../PurchaseHeaderDetail';
import CataInfo from '../CataInfo';
import ProductList from '../ProductList';
import InternalPurchasInfo from '../InternalPurchasInfo';
import CheckSigl from '../CheckSigl';
import useInitCustomDs from '../useInitCustomDs';
import OrderSkeleton from '../Order/OrderSkeleton';

function Order(props) {
  function useOtherHeaderPurchase({ message, onOk }) {
    Modal.confirm({
      title: intl.get('mallf.myMall.view.sureNum').d('确认数量'),
      width: 460,
      content: <div className="content-modal-confirm">{message}</div>,
      onOk,
    });
  }

  const {
    order,
    handleOrderNum,
    orderIndex,
    orderData,
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
    siglCount,
    custConfig: unitConfig, // c7n 个性化config,
    setCtxParams,
    customizeForm,
    customizeDisplay,
    cSupply,
    queryUnitConfig,
    separateInitCustUnit,
    preOrder,
    isOMS,
    deliveryMethodList,
    anchorIndex,
    getHocInstance,
  } = props;
  // 是否领用
  const isReceive = useMemo(() => order.agreementBusinessType === 'RECEIVE', [order]);

  const { headerCode, eCLineCode, cataLineCode } = useMemo(() => {
    return {
      headerCode: isOMS ? (isReceive ? RECEIVE_HEADER_CODE : OMSHeader) : Header,
      eCLineCode: isOMS ? (isReceive ? RECEIVE_LINE_CODE : OMSECLine) : ECLine,
      cataLineCode: isOMS ? (isReceive ? RECEIVE_LINE_CODE : OMSCATALine) : CATALine,
    };
  }, [isOMS]);
  const lineCode =
    orderData[orderIndex].shoppingCartDTOList[0].productSource === 'CATA'
      ? isReceive
        ? RECEIVE_LINE_CODE
        : cataLineCode
      : eCLineCode;
  // 初始化DS
  useInitCustomDs({
    order,
    setOrderData,
    orderIndex,
    preOrder,
  });
  // 骨架屏
  const Skeleton = useMemo(() => {
    const skeProps = {
      index: orderIndex,
      dataSet: order.DS,
      code: headerCode,
      lineCode,
      products: order.shoppingCartDTOList,
      getHocInstance,
    };
    return <OrderSkeleton {...skeProps} />;
  }, [orderIndex, headerCode, unitConfig, order.DS, order.shoppingCartDTOList]);

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
    preOrder,
  };
  const { minPurchaseResult, minPurchaseFlag } = order;
  if (props.custLoading || isEmpty(unitConfig)) {
    // 偶现白屏，等个性化数据加载完成再初始化
    setSubmitLoading(true);
    return <Loading />;
  }
  // 订单数大于30开启优化
  return orderData.length < 30 ||
    (orderIndex < 10 && anchorIndex < 5) ||
    (anchorIndex >= 5 && Math.abs(orderIndex - anchorIndex) < 5) ? (
      <div
        id={orderIndex}
        className={`order-wrapper${minPurchaseFlag === 0 ? ' order-wrapper-invalid' : ''}`}
      >
        <div className="order-header">
          <span>{handleOrderNum(orderIndex + 1)}</span>
          <span style={{ margin: '0 8px' }}>|</span>
          <SupplierComponent>
            <span>{order.showSupplierName}</span>
          </SupplierComponent>
          {minPurchaseFlag === 0 && (
          <span style={{ color: 'red', fontSize: '12px', marginLeft: '20px' }}>
            {minPurchaseResult}
          </span>
        )}
        </div>
        {order.message && (
        <Alert
          className="order-header-error-mesage"
          showIcon
          type="error"
          message={order.message}
        />
      )}
        <PurchaseHeaderDetail
          order={order}
          orderData={orderData}
          shoppingCartDTOList={order.shoppingCartDTOList}
          orderIndex={orderIndex}
          setOrderData={setOrderData}
          unitConfig={unitConfig}
          code={headerCode}
          isReceive={isReceive}
          customizeDisplay={customizeDisplay}
          deliveryMethodList={deliveryMethodList}
          preOrder={preOrder}
        />
        <CataInfo {...cataInfoProps} />
        <HeaderInfo {...headerProps} />
        <ProductList
          separateInitCustUnit={separateInitCustUnit}
          setCtxParams={setCtxParams}
          order={order}
          eCLineCode={eCLineCode}
          cataLineCode={cataLineCode}
          unitConfig={unitConfig}
          cSupply={cSupply}
          products={order.shoppingCartDTOList}
          orderData={orderData}
          orderIndex={orderIndex}
          setSubmitLoading={setSubmitLoading}
          setOrderData={setOrderData}
          minPurchaseFlag={minPurchaseFlag}
          applyExpedited={applyExpedited}
          preOrder={preOrder}
          isReceive={isReceive}
          lineCode={lineCode}
        />
        {!isReceive && (
        <>
          {order.shoppingCartDTOList[0].productSource !== 'CATA' &&
            !order.shoppingCartDTOList[0].qtHeaderNo && (
              <>
                <EcInfo {...ecInfoProps} />
              </>
            )}
          <CuxWrapper path="NewBeforeOrder/Order/appendBottomInfo" value={ecInfoProps} />
          {!order.shoppingCartDTOList[0].qtHeaderNo && <InternalPurchasInfo {...ecInfoProps} />}
          {hasSiglProduct && (
            <CheckSigl
              orderData={orderData}
              orderIndex={orderIndex}
              setOrderData={setOrderData}
              siglCount={siglCount}
              order={order}
            />
          )}
        </>
      )}
      </div>
  ) : (
    Skeleton
  );
}

export default c7nCustomize({
  unitCode: [
    Header,
    ECLine,
    CATALine,
    OMSHeader,
    OMSECLine,
    OMSCATALine,
    RECEIVE_HEADER_CODE,
    RECEIVE_LINE_CODE,
    HEADER_DETAIL_DOC,
    HEADER_DETAIL_ACEIPT,
    HEADER_DETAIL_PRICE,
  ],
  manualQuery: true,
})(Order);
