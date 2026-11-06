import React, { useEffect, useState } from 'react';
import { Row, Col, Popover } from 'choerodon-ui';
import { Modal, Button } from 'choerodon-ui/pro';

import AttachmentItem from 'components/AttachmentItem';
import { getPrimaryColor } from 'utils/utils';
import intl from 'utils/intl';
import FillInfo from 'components/FillInfo';
import { fetchFileList } from 'mall-front/lib/hooks/useGetFileList';

export default function HeaderInfo(props) {
  const {
    colSpan,
    order,
    isSaleType,
    unitConfig,
    headerCode,
    cSupply,
    FillHeaderCode,
    dataSet,
  } = props;
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (order?.attachmentUuid && order?.outerAttachmentUuid) {
      Promise.all([
        fetchFileList({ attachmentUuid: order?.attachmentUuid, bucketName: 'private-bucket' }),
        fetchFileList({ attachmentUuid: order?.outerAttachmentUuid, bucketName: 'private-bucket' }),
      ]).then((res) => {
        // 之前老数据没有外部系统附件
        if (order?.outerAttachmentUuid) {
          const newRes = res.flat() || [];
          setQuantity(newRes.length);
        } else {
          setQuantity(res[0].length);
        }
      });
    }
  }, [order]);

  const openModal = () => {
    const modal = Modal.open({
      destroyOnClose: true,
      drawer: true,
      title: intl.get('mallf.common.view.attachment.info').d('附件信息'),
      okFirst: false,
      closable: true,
      movable: false,
      mask: true,
      className: 'mall-upload-modal',
      footer: [
        <Button
          style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
          key="back"
          onClick={() => modal.close()}
        >
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>,
      ],
      children: (
        <>
          {quantity !== 0 && (
            <>
              <div style={{ margin: '10px 0' }}>
                {intl.get('mallf.common.view.button.insideFile').d('内部附件')}
              </div>
              <AttachmentItem
                attachmentUuid={order?.attachmentUuid}
                bucketName="private-bucket"
                itemStyle={{ maxWidth: 336 }}
              />
              <div style={{ margin: '10px 0' }}>
                {intl.get('mallf.common.view.button.externalFile').d('外部附件')}
              </div>
              <AttachmentItem
                attachmentUuid={order?.outerAttachmentUuid}
                bucketName="private-bucket"
                itemStyle={{ maxWidth: 336 }}
              />
            </>
          )}
        </>
      ),
    });
  };

  return (
    <div className="service-list">
      <div className="service-list-header">
        {intl.get(`mallf.orderDetail.view.orderDetail.detail`).d('订单信息')}
      </div>
      <div className="service-list-content">
        <Row gutter={12}>
          <Col span={colSpan}>
            <Row className="list-title">
              {intl.get(`mallf.orderDetail.view.orderDetail.recInformation`).d('收货人信息')}
            </Row>
            <Row>
              <span className="label">
                {intl.get(`mallf.common.view.sysOriginator`).d('系统收货人')}：
              </span>
              <span className="label-content">{order.receiverAddress?.contactName}</span>
            </Row>
            <Row>
              <span
                className="label"
                title={intl.get(`mallf.common.view.receiverContactMobile`).d('系统收货人联系电话')}
              >
                {intl.get(`mallf.common.view.receiverContactMobile`).d('系统收货人联系电话')}：
              </span>
              <span className="label-content">{order?.receiverContactMobile}</span>
            </Row>
            <Row>
              <span className="label">
                {intl.get(`mallf.common.view.realOriginator`).d('实物收货人')}：
              </span>
              <span className="label-content">{order?.realReceiverContactName}</span>
            </Row>
            <Row>
              <span
                className="label"
                title={intl
                  .get(`mallf.orderDetail.view.orderDetail.realContactInformation`)
                  .d('实物收货人联系方式')}
              >
                {intl
                  .get(`mallf.orderDetail.view.orderDetail.realContactInformation`)
                  .d('实物收货人联系方式')}
                ：
              </span>
              <span className="label-content">{order.receiverAddress?.mobilePhone}</span>
            </Row>
            <Row>
              <span className="label">
                {intl.get(`mallf.orderDetail.view.orderDetail.recAddress`).d('收货地址')}：
              </span>
              <span className="label-content">
                {`${order.receiverAddress?.fullAddress || ''}${order.address || ''}`}
              </span>
            </Row>
            {order?.thirdPhone && (
              <Row>
                <span
                  className="label"
                  title={intl.get(`mallf.common.view.thirdPhone`).d('第三方(施工方）手机号')}
                >
                  {intl.get(`mallf.common.view.thirdPhone`).d('第三方(施工方）手机号')}：
                </span>
                <span className="label-content">{order?.thirdPhone}</span>
              </Row>
            )}
            {order?.thirdEmail && (
              <Row>
                <span
                  className="label"
                  title={intl.get(`mallf.common.view.thirdEmail`).d('第三方(施工方）邮箱')}
                >
                  {intl.get(`mallf.common.view.thirdEmail`).d('第三方(施工方）邮箱')}：
                </span>
                <span className="label-content">{order?.thirdEmail}</span>
              </Row>
            )}
          </Col>
          <Col span={colSpan}>
            <Row className="list-title">
              {intl.get(`mallf.orderDetail.view.orderDetail.payInformation`).d('付款信息')}
            </Row>
            <Row>
              <span className="label">
                {intl.get(`mallf.orderDetail.view.orderDetail.orderTime`).d('下单时间')}：
              </span>
              <span className="label-content">{order.cecCreatedTime}</span>
            </Row>
            <Row>
              <span className="label">
                {intl.get(`mallf.orderDetail.view.orderDetail.payTime`).d('支付时间')}：
              </span>
              <span className="label-content">{order.paymentTime || '-'}</span>
            </Row>
            <Row>
              <span className="label">
                {intl.get(`mallf.orderDetail.view.orderDetail.payMethod`).d('付款方式')}：
              </span>
              <span className="label-content">
                {isSaleType ? order.proxyPaymentTypeMeaning : order.paymentTypeMeaning}
              </span>
            </Row>
            <Row>
              <span className="label">
                {intl.get(`mallf.orderDetail.view.orderDetail.totalPrice`).d('商品金额(含税)')}：
              </span>
              <span className="label-content" r-title>
                {order?.currencySymbol || ''}
                {order?.orderPriceFinalVO?.extraCostNotIncloudOrderAmountMeaning ||
                  order?.orderPriceFinalVO?.extraCostNotIncloudOrderAmount}
              </span>
            </Row>
          </Col>
          {((order.orderTypeCode !== 'CATA' && order.orderTypeCode !== 'MANUAL') || isSaleType) && (
            <Col span={colSpan}>
              <Row className="list-title">
                {intl.get(`mallf.orderDetail.view.orderDetail.invoiceInfo`).d('发票信息')}
              </Row>
              <Row>
                <span className="label">
                  {intl.get(`mallf.orderDetail.view.orderDetail.invoiceType`).d('发票类型')}：
                </span>
                <span className="label-content">{order.purOrderExtra?.invoiceTypeName}</span>
              </Row>
              <Row>
                <span className="label">
                  {intl.get(`mallf.orderDetail.view.orderDetail.invoiceHeader`).d('发票抬头')}：
                </span>
                <span className="label-content">{order.purOrderExtra?.invoiceTitleTypeName}</span>
              </Row>
              <Row>
                <span className="label">
                  {intl.get(`mallf.orderDetail.view.orderDetail.invoiceContent`).d('发票内容')}：
                </span>
                <span className="label-content">{order.purOrderExtra?.invoiceContentName}</span>
              </Row>
            </Col>
          )}
          <Col span={colSpan}>
            <Row className="list-title">
              {intl.get('mallf.common.view.other.information').d('其他信息')}
            </Row>
            <Row>
              <span className="label">
                {intl.get(`mallf.common.view.purchase.catalog`).d('采购品类')}：
              </span>
              <span className="label-content order-remark">{order.itemCategoryName}</span>
            </Row>
            <Row>
              <span className="label">
                {intl.get(`mallf.common.view.delivery`).d('送货方式')}：
              </span>
              <span className="label-content order-remark">{order.deliveryTypeMeaning}</span>
            </Row>
            <Row>
              <span className="label">{intl.get(`mallf.common.view.CENum`).d('CE号')}：</span>
              <span
                className="label-content order-remark"
                style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}
              >
                {order.attributeVarchar2}
              </span>
            </Row>
            <Row>
              <span className="label">{intl.get(`mallf.common.model.remark`).d('备注')}：</span>
              <Popover overlayStyle={{ width: '400px' }} content={order.remark}>
                <span className="label-content order-remark">{order.remark}</span>
              </Popover>
            </Row>
            <Row>
              <Col span={6}>
                <div className="primary-color" onClick={openModal}>
                  {intl.get('mallf.common.view.attachment.info').d('附件信息')}({quantity})
                </div>
              </Col>
              <Col span={6}>
                <FillInfo
                  dataSet={dataSet}
                  cSupply={cSupply}
                  unitConfig={unitConfig}
                  dataSource={order}
                  code={headerCode}
                  fillCode={FillHeaderCode}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}
