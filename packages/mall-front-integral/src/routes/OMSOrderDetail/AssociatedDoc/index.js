import React, { useEffect, useState } from 'react';
import { Modal, Button, Spin } from 'choerodon-ui';

import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';
import { fetchomsAssociated } from 'services/orderCenterService';
import style from './index.less';

const { Sidebar } = Modal;
export default function AssociatedDoc(props) {
  // const { 'OMSOrderDetail/MovingBillNum': MovingBillNum } = components;
  const { visible, toggleModal, product = {}, cecFromCode } = props;
  const {
    consignmentCode,
    orderEntryId,
    orderEntryLinkId,
    skuName,
    cecOrderCode,
    consignmentLineNum,
  } = product;

  const [associatedData, setAssociatedData] = useState({});
  const [loading, setLoading] = useState(false);

  function fetchData() {
    setLoading(true);
    fetchomsAssociated({ orderEntryId, orderEntryLinkId, consignmentCode, consignmentLineNum })
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
        title={intl.get('mallf.common.view.associated.doc').d('关联单据')}
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
        closable
      >
        <Spin spinning={loading}>
          <p className="content-header">{skuName}</p>
          <p className="content-title">{intl.get('mallf.common.model.docInfo').d('单据信息')}</p>
          <p className="line-item">
            <span className="line-item-label">
              {' '}
              {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}:
            </span>
            <span className="line-item-info">{associatedData.orderCode}</span>
          </p>
          <p className="line-item">
            <span className="line-item-label">
              {intl.get('mallf.common.model.purchaseApplicationNum').d('采购申请号')}:
            </span>
            <span className="line-item-info">{associatedData.reqNum}</span>
          </p>
          {associatedData.srmOrderCode && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.myMall.view.catalog.purchaseOrderNum').d('采购订单号')}:
              </span>
              <span className="line-item-info">{associatedData.srmOrderCode}</span>
            </p>
          )}
          {(associatedData.ecConsignmentCode || cecOrderCode) && cecFromCode !== 'CATA' && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.common.view.order.ecOrderNum').d('电商订单号')}:
              </span>
              <span className="line-item-info">
                {associatedData.ecConsignmentCode || cecOrderCode}
              </span>
            </p>
          )}
          {associatedData.logisticOrderNum && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get(`mallf.common.view.common.shipmentNum`).d('物流单号')}:
              </span>
              <span className="line-item-info">{associatedData.logisticOrderNum}</span>
            </p>
          )}
          {associatedData.srmConsignmentCode && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.common.view.invoice.noSong').d('送货单号')}:
              </span>
              <span className="line-item-info">{associatedData.srmConsignmentCode}</span>
            </p>
          )}
          <p className="content-title" style={{ marginTop: '30px' }}>
            {intl.get('mallf.common.model.keyNodeRecord').d('关键节点记录')}
          </p>
          <p className="line-item">
            <span className="line-item-label">
              {intl.get('mallf.common.view.order.mallOrderDate').d('商城下单时间')}:
            </span>
            <span className="line-item-info">{associatedData.cecCreatedTime}</span>
          </p>
          {associatedData.approveTime && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.common.view.order.approvePassTime').d('审批通过时间')}:
              </span>
              <span className="line-item-info">{associatedData.approveTime}</span>
            </p>
          )}
          {associatedData.confirmedTime && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.common.view.order.supplierConfirmDate').d('供方确认时间')}:
              </span>
              <span className="line-item-info">{associatedData.confirmedTime}</span>
            </p>
          )}
          {associatedData.shippedTime && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.common.view.order.deliveryDate').d('发货时间')}:
              </span>
              <span className="line-item-info">{associatedData.shippedTime}</span>
            </p>
          )}
          {associatedData.expectedArriveDate && (
            <p className="line-item">
              <span className="line-item-label">
                {intl.get('mallf.common.view.order.expectAOGDate').d('预计到货时间')}:
              </span>
              <span className="line-item-info">{associatedData.expectedArriveDate}</span>
            </p>
          )}
        </Spin>
      </Sidebar>
    </>
  );
}
