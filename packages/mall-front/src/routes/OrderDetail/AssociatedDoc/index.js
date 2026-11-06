import React, { useEffect, useState } from 'react';
import { Modal, Button, Spin } from 'choerodon-ui';

import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';
import { fetchAssociated } from 'services/orderCenterService';
import style from './index.less';

const { Sidebar } = Modal;
export default function AssociatedDoc(props) {
  const { visible, toggleModal, product = {}, poHeaderId } = props;
  const { poLineId, productName } = product;

  const [associatedData, setAssociatedData] = useState({});
  const [loading, setLoading] = useState(false);

  function fetchData() {
    setLoading(true);
    fetchAssociated({ poLineId, poHeaderId: poHeaderId || product.poHeaderId })
      .then((res) => {
        if (res) {
          setAssociatedData(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Sidebar
        title={intl.get('mallf.myOrder.view.associated.doc').d('关联单据')}
        className={style.content}
        visible={visible}
        onCancel={toggleModal}
        width={380}
        footer={[
          <Button
            style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
            key="back"
            onClick={toggleModal}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
        //   confirmLoading={spinning}
        closable
      >
        <Spin spinning={loading}>
          <p className="content-header">{productName}</p>
          <p className="content-title">{intl.get('mallf.myOrder.model.docInfo').d('单据信息')}</p>
          <p className="line-item">
            <span className="line-item-label">
              {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}:
            </span>
            <span className="line-item-info">{associatedData.poNum}</span>
          </p>
          <p className="line-item">
            <span className="line-item-label">
              {intl.get('mallf.myOrder.model.purchaseApplicationNum').d('采购申请号')}:
            </span>
            <span className="line-item-info">{associatedData.prNum}</span>
          </p>
          {associatedData.srmPoNum && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.myMall.view.catalog.purchaseOrderNum').d('采购订单号')}:
              </span>
              <span className="line-item-info">{associatedData.srmPoNum}</span>
            </p>
          )}
          {associatedData.ecPoNum && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.myOrder.view.order.ecOrderNum').d('电商订单号')}:
              </span>
              <span className="line-item-info">{associatedData.ecPoNum}</span>
            </p>
          )}
          {associatedData.logisticsNumber && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get(`mallf.myOrder.view.common.shipmentNum`).d('物流单号')}:
              </span>
              <span className="line-item-info">{associatedData.logisticsNumber}</span>
            </p>
          )}
          {associatedData.poSubNum && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.myOrder.view.invoice.noSong').d('送货单号')}:
              </span>
              <span className="line-item-info">{associatedData.poSubNum}</span>
            </p>
          )}
          <p className="content-title" style={{ marginTop: '30px' }}>
            {intl.get('mallf.myOrder.model.keyNodeRecord').d('关键节点记录')}
          </p>
          <p className="line-item">
            <span className="line-item-label">
              {intl.get('mallf.myOrder.view.order.mallOrderDate').d('商城下单时间')}:
            </span>
            <span className="line-item-info">{associatedData.creationDate}</span>
          </p>
          {associatedData.supplierConfirmedDate && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.myOrder.view.order.supplierConfirmDate').d('供方确认时间')}:
              </span>
              <span className="line-item-info">{associatedData.supplierConfirmedDate}</span>
            </p>
          )}
          {associatedData.shipDate && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.myOrder.view.order.deliveryDate').d('发货时间')}:
              </span>
              <span className="line-item-info">{associatedData.shipDate}</span>
            </p>
          )}
          {associatedData.expectedArriveDate && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.myOrder.view.order.expectAOGDate').d('预计到货时间')}:
              </span>
              <span className="line-item-info">{associatedData.expectedArriveDate}</span>
            </p>
          )}
        </Spin>
      </Sidebar>
    </>
  );
}
