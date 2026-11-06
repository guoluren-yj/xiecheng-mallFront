import React, { useState, useMemo } from 'react';
import { Modal, Button } from 'choerodon-ui';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import style from 'mall-front/lib/routes/BeforeCompanyOrder/CustomizeModal/index.less';
import savaData from './saveData';
import DefaultForm from './DefaultForm';

const { Sidebar } = Modal;

function CustomizeModal(props) {
  const {
    orderIndex,
    orderData,
    setOrderData,
    product,
    productIndex,
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
            className="footer-btn-save"
            type="primary"
            key="save"
            onClick={() => {
              handleOk();
            }}
          >
            {intl.get('mallf.applyRes.btn.save').d('保存')}
          </Button>,
          <Button
            r-if={orderData[orderIndex]?.shoppingCartDTOList?.length > 1}
            style={{ width: 85 }}
            className="footer-btn-cancel"
            key="batchSave"
            onClick={() => {
              handleOk(true);
            }}
          >
            批量保存
          </Button>,
          <Button
            className="footer-btn-cancel"
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
export default CustomizeModal;
