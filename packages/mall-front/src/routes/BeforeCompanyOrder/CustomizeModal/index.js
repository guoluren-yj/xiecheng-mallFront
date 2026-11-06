import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import cuxComonent from 'cuxTools/cuxComponent';
import style from './index.less';
import savaData from '@/routes/BeforeCompanyOrder/CustomizeModal/saveData';
import CuxFn from '@/cuxTools/cuxFn';
import DefaultForm from './DefaultForm';

const { Sidebar } = Modal;

function CustomizeModal(props) {
  const {
    orderIndex,
    orderData,
    setOrderData,
    product,
    productIndex,
    products,
    unitConfig,
    code,
    setCtxParams,
    dataSet,
    cSupply,
  } = props;
  const { productName } = product || {};
  const { companyId } = getUserConfigInfo();
  useMemo(() => {
    setCtxParams({
      itemCategoryId: product.itemCategoryId,
      invoiceOrgId: product.invoiceOrgId,
      itemCode: product.itemCode,
      companyId,
    });
    product.DS = dataSet.create({ ...product });
  }, []);

  useEffect(() => {
    CuxFn({ name: 'BeforeCompanyOrder-fn-setCustomizeModalInitVal', value: { product } })();
  }, []);

  const [visible, setVisible] = useState(false);

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
        title={intl.get('mallf.applyRes.view.fill.info').d('补充信息')}
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
            {intl.get('mallf.applyRes.btn.save').d('保存')}
          </Button>,
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
          <DefaultForm
            visible={visible}
            product={product}
            products={products}
            code={code}
            dataSet={dataSet}
            cSupply={cSupply}
            order={orderData[orderIndex]}
          />
        </div>
      </Sidebar>
    </>
  );
}
export default cuxComonent({ path: 'BeforeCompanyOrder/CustomizeModal' })(CustomizeModal);
