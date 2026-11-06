import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import ProductAllocationInfo from 'components/FillInfo/ProductAllocationInfo';
import style from './index.less';
// import getCuxComponent from '@/cuxTools/getCuxComponent';
import savaData from '@/routes/BeforeCompanyOrder/CustomizeModal/saveData';
import DefaultForm from './DefaultForm';
import CuxFn from '@/cuxTools/cuxFn';

const { Sidebar } = Modal;

function CustomizeModal(props) {
  const {
    orderIndex,
    orderData,
    setOrderData,
    product,
    products,
    productIndex,
    unitConfig,
    code,
    setCtxParams,
    dataSet,
    cSupply,
    headerCustomizedList,
    lineCustomizedList,
    hasLineCustFlag,
  } = props;
  const { productName } = product || {};
  const { companyId } = getUserConfigInfo();
  const [visible, setVisible] = useState(false);

  useMemo(() => {
    setCtxParams({
      itemCategoryId: product?.itemCategoryId,
      invoiceOrgId: product.invoiceOrgId,
      itemCode: product?.itemCode,
      companyId,
    });
    // product.DS = dataSet.create(product);
  }, []);

  useEffect(() => {
    CuxFn({
      name: 'BeforeCompanyOrder-fn-setCustomizeModalInitVal',
      value: { product, order: orderData[orderIndex] },
    })();
  }, []);

  useEffect(() => {
    if (visible) {
      CuxFn({
        name: 'BeforeCompanyOrder-fn-openCustomizeModalInitVal',
        value: { product, order: orderData[orderIndex] },
      })();
    }
  }, [visible]);

  const handleOk = (type) => {
    const { fields = [] } = unitConfig[code] || {};
    savaData({
      type,
      orderData,
      record: product.DS,
      product,
      fields,
      orderIndex,
      productIndex,
      setVisible,
      setOrderData,
      code,
    });
  };
  return (
    <>
      <div onClick={() => setVisible(true)}>{props.children}</div>
      <Sidebar
        title={intl.get('mallf.common.view.fill.info').d('补充信息')}
        className={style.content}
        visible={visible}
        onCancel={() => setVisible(false)}
        width={380}
        footer={[
          <Button
            color="primary"
            key="save"
            onClick={() => {
              handleOk();
            }}
          >
            {intl.get('hzero.common.btn.save').d('保存')}
          </Button>,
          // orderData[orderIndex].shoppingCartDTOList.length > 1 ? (
          //   <Tooltip
          //     title={intl
          //       .get('mallf.common.view.useAll.warning')
          //       .d('「应用全部」不对模态框和下拉框以及附件等字段生效')}
          //     placement="top"
          //   >
          //     <Button
          //       className="footer-btn-other"
          //       key="other"
          //       onClick={() => {
          //         handleOk('other');
          //       }}
          //     >
          //       {intl.get('mallf.common.allProduct.sava.addBtn').d('保存并应用至全部')}
          //     </Button>
          //   </Tooltip>
          // ) : (
          //   <></>
          // ),
          <Button
            key="back"
            onClick={() => {
              setVisible(false);
            }}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
        ]}
        onOk={handleOk}
        closable
      >
        <div className="customize-modal-content" style={{ height: window.innerHeight - 230 }}>
          <p className="product-title">{productName}</p>
          {hasLineCustFlag && (
            <DefaultForm
              visible={visible}
              product={product}
              code={code}
              dataSet={dataSet}
              cSupply={cSupply}
              order={orderData[orderIndex]}
              products={products}
            />
          )}
          <div
            r-if={!isEmpty(headerCustomizedList) || !isEmpty(lineCustomizedList)}
            style={{
              padding: '0 15px',
              marginTop: 15,
            }}
          >
            <ProductAllocationInfo
              headerCustomizedList={headerCustomizedList}
              lineCustomizedList={lineCustomizedList}
            />
          </div>
        </div>
      </Sidebar>
    </>
  );
}
export default CustomizeModal;
