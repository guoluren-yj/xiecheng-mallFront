import React, { useEffect, useState } from 'react';
import { Modal, Spin } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import CuxFn from 'cuxTools/cuxFn';

import { CopyButton } from 'utils/renderer';
import intl from 'utils/intl';
import { fetchomsAssociated } from 'services/orderCenterService';
import style from 'mall-front/lib/routes/OMSOrderDetail/AssociatedDoc/index.less';
import OtherInfo from 'mall-front/lib/routes/OMSOrderDetail/AssociatedDoc/OtherInfo';

const { Sidebar } = Modal;
function AssociatedDoc(props) {
  const { visible, toggleModal, product = {} } = props;
  const {
    consignmentCode,
    orderEntryId,
    orderEntryLinkId,
    skuName,
    cecOrderCode,
    consignmentLineNum,
    isReceive,
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
        CuxFn({ name: 'OMS-myOrder-fn-addMotivationNumber', value: { res, setAssociatedData } })(); // 百年人寿二开
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
        title={intl.get('mallf.myMall.view.associated.doc').d('关联单据')}
        className={style.content}
        visible={visible}
        onCancel={toggleModal}
        width={380}
        footer={[
          <Button color="primary" key="back" onClick={toggleModal}>
            {intl.get('mallf.myMall.button.close').d('关闭')}
          </Button>,
        ]}
        closable
      >
        <Spin spinning={loading}>
          <p className="content-header">{skuName}</p>
          <p className="content-title">{intl.get('mallf.myMall.model.docInfo').d('单据信息')}</p>
          {isReceive ? (
            <p className="line-item copy-btn-container">
              <span
                className="line-item-label"
                title={intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}
              >
                {' '}
                {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}:
              </span>
              <span className="line-item-info text-overflow">
                <span title={associatedData.orderCode}>{associatedData.orderCode}</span>
                <CopyButton
                  tooltipProps={{ placement: 'right' }}
                  style={{ position: 'absolute', top: -4, right: 10 }}
                  num={associatedData.orderCode}
                  label={intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号')}
                />
              </span>
            </p>
          ) : (
            <>
              <p className="line-item copy-btn-container">
                <span
                  className="line-item-label"
                  title={intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}
                >
                  {' '}
                  {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}:
                </span>
                <span className="line-item-info text-overflow">
                  <span title={associatedData.orderCode}>{associatedData.orderCode}</span>
                  <CopyButton
                    tooltipProps={{ placement: 'right' }}
                    style={{ position: 'absolute', top: -4, right: 10 }}
                    num={associatedData.orderCode}
                    label={intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号')}
                  />
                </span>
              </p>
              <p className="line-item copy-btn-container">
                <span
                  className="line-item-label"
                  title={intl.get('mallf.myOrder.view.order.zhenhuiCode').d('汇联易申请编码')}
                >
                  {intl.get('mallf.myOrder.view.order.zhenhuiCode').d('汇联易申请编码')}:
                </span>
                <span className="line-item-info text-overflow">
                  <span title={associatedData.attributeVarchar1}>
                    {associatedData.attributeVarchar1 || '-'}
                  </span>
                  <CopyButton
                    r-if={associatedData.attributeVarchar1}
                    tooltipProps={{ placement: 'right' }}
                    style={{ position: 'absolute', top: -4, right: 10 }}
                    num={associatedData.attributeVarchar1}
                    label={intl.get('mallf.myOrder.view.order.zhenhuiCode').d('汇联易申请编码')}
                  />
                </span>
              </p>
              <p className="line-item copy-btn-container">
                <span
                  className="line-item-label"
                  title={intl.get('mallf.myMall.view.order.ecOrderNum').d('电商订单号')}
                >
                  {intl.get('mallf.myMall.view.order.ecOrderNum').d('电商订单号')}:
                </span>
                <span className="line-item-info text-overflow">
                  <span title={associatedData.ecConsignmentCode || cecOrderCode}>
                    {associatedData.ecConsignmentCode || cecOrderCode || '-'}
                  </span>
                  <CopyButton
                    r-if={associatedData.ecConsignmentCode || cecOrderCode}
                    tooltipProps={{ placement: 'right' }}
                    style={{ position: 'absolute', top: -4, right: 10 }}
                    num={associatedData.ecConsignmentCode || cecOrderCode}
                    label={intl.get('mallf.myMall.view.order.ecOrderNum').d('电商订单号')}
                  />
                </span>
              </p>
            </>
          )}
          <p className="content-title" style={{ marginTop: '30px' }}>
            {intl.get('mallf.myMall.model.keyNodeRecord').d('关键节点记录')}
          </p>
          {isReceive ? (
            <>
              <p className="line-item">
                <span
                  className="line-item-label"
                  title={intl.get('mallf.myMall.view.order.mallOrderDate').d('商城下单时间')}
                >
                  {intl.get('mallf.myMall.view.order.mallOrderDate').d('商城下单时间')}:
                </span>
                <span className="line-item-info">{associatedData.cecCreatedTime}</span>
              </p>
              <p r-if={associatedData.approveTime} className="line-item">
                <span
                  className="line-item-label"
                  title={intl.get('mallf.myMall.view.order.approvePassTime').d('审批通过时间')}
                >
                  {intl.get('mallf.myMall.view.order.approvePassTime').d('审批通过时间')}:
                </span>
                <span className="line-item-info">{associatedData.approveTime}</span>
              </p>
            </>
          ) : (
            <>
              <p className="line-item">
                <span
                  className="line-item-label"
                  title={intl.get('mallf.myMall.view.order.mallOrderDate').d('商城下单时间')}
                >
                  {intl.get('mallf.myMall.view.order.mallOrderDate').d('商城下单时间')}:
                </span>
                <span className="line-item-info">{associatedData.cecCreatedTime}</span>
              </p>
              {associatedData.approveTime && (
                <p className="line-item">
                  <span
                    className="line-item-label"
                    title={intl.get('mallf.myMall.view.order.approvePassTime').d('审批通过时间')}
                  >
                    {intl.get('mallf.myMall.view.order.approvePassTime').d('审批通过时间')}:
                  </span>
                  <span className="line-item-info">{associatedData.approveTime}</span>
                </p>
              )}
              {associatedData.confirmedTime && (
                <p className="line-item">
                  <span
                    className="line-item-label"
                    title={intl
                      .get('mallf.myMall.view.order.supplierConfirmDate')
                      .d('供方确认时间')}
                  >
                    {intl.get('mallf.myMall.view.order.supplierConfirmDate').d('供方确认时间')}:
                  </span>
                  <span className="line-item-info">{associatedData.confirmedTime}</span>
                </p>
              )}
              {associatedData.shippedTime && (
                <p className="line-item">
                  <span
                    className="line-item-label"
                    title={intl.get('mallf.myMall.view.order.deliveryDate').d('发货时间')}
                  >
                    {intl.get('mallf.myMall.view.order.deliveryDate').d('发货时间')}:
                  </span>
                  <span className="line-item-info">{associatedData.shippedTime}</span>
                </p>
              )}
              {associatedData.expectedArriveDate && (
                <p className="line-item">
                  <span
                    className="line-item-label"
                    title={intl.get('mallf.myMall.view.order.expectAOGDate').d('预计到货时间')}
                  >
                    {intl.get('mallf.myMall.view.order.expectAOGDate').d('预计到货时间')}:
                  </span>
                  <span className="line-item-info">{associatedData.expectedArriveDate}</span>
                </p>
              )}
              <OtherInfo associatedData={associatedData} />
            </>
          )}
        </Spin>
      </Sidebar>
    </>
  );
}

export default AssociatedDoc;
