import React, { useState, useMemo } from 'react';
import moment from 'moment';
import uuid from 'uuid/v4';
import { Modal, Button, Row, Col, message } from 'choerodon-ui';
import { Form, TextField, TextArea, DatePicker, Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getUserConfigInfo, timestampToTime } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import UploadFile from 'components/CommonUpload';
import style from './index.less';
import { getSanctionNumber } from '../../../functions/index.js';

const { Sidebar } = Modal;

function CustomizeModal(props) {
  const {
    orderIndex,
    orderData,
    setOrderData,
    product,
    productIndex,
    setCtxParams,
    dataSet,
  } = props;
  const { productName } = product || {};
  const { companyId } = getUserConfigInfo();
  const productLength = orderData[orderIndex].shoppingCartDTOList.length;
  const showAttribute11Flag = useMemo(() => {
    return !getSanctionNumber() && product.attributeVarchar20 !== '1';
  }, [orderData]);

  useMemo(() => {
    setCtxParams({
      itemCategoryId: product.itemCategoryId,
      invoiceOrgId: product.invoiceOrgId,
      itemCode: product.itemCode,
      companyId,
    });
    product.DS = dataSet.create(product);
    product.attachmentUuid = uuid();
    product.DS.set(
      'attributeDate1',
      moment(timestampToTime())
        .add(product.deliveryCycle || 7, 'days')
        .format(DEFAULT_DATETIME_FORMAT)
    );
  }, []);

  const [visible, setVisible] = useState(false);

  const handleChange = ({ field, type }) => {
    if (type) {
      orderData[orderIndex].shoppingCartDTOList.forEach((p) => {
        p.DS.set(field, product.DS.get(field));
      });
      message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
    } else {
      product.DS.set(field, product.DS.get('field'));
    }
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
            className="footer-btn-save"
            type="primary"
            key="save"
            onClick={() => {
              product.DS.validate().then((res) => {
                const newOrderData = [...orderData];
                newOrderData[orderIndex].shoppingCartDTOList[productIndex] = {
                  ...newOrderData[orderIndex].shoppingCartDTOList[productIndex],
                  DS: newOrderData[orderIndex].shoppingCartDTOList[productIndex].DS,
                  error: !res,
                };
                setOrderData(newOrderData);
              });
              setVisible(false);
            }}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
        closable
      >
        <div className="customize-modal-content" style={{ height: window.innerHeight - 230 }}>
          <p className="product-title">{productName}</p>
          <Form record={product.DS} labelLayout="float" columns={1}>
            <Row gutter={16} r-if={showAttribute11Flag} className="line-info-row">
              <Col span={productLength > 1 ? 18 : 24}>
                <TextField name="attributeVarchar11" style={{ width: '100%' }} />
              </Col>
              {productLength > 1 && (
                <Col
                  span={6}
                  className="batch-btn"
                  onClick={() => handleChange({ field: 'attributeVarchar11', type: 'batch' })}
                >
                  {intl.get('mallf.common.view.batch.set').d('批量维护')}
                </Col>
              )}
            </Row>

            <Row gutter={16} r-if={!showAttribute11Flag} className="line-info-row">
              <Col span={productLength > 1 ? 18 : 24}>
                <Lov
                  name="attributeVarchar12Lov"
                  style={{ width: '100%' }}
                  modalProps={{
                    style: { maxWidth: 1080 },
                  }}
                />
              </Col>
              {productLength > 1 && (
                <Col
                  span={6}
                  className="batch-btn"
                  onClick={() => {
                    handleChange({ field: 'attributeVarchar12Lov', type: 'batch' });
                  }}
                >
                  {intl.get('mallf.common.view.batch.set').d('批量维护')}
                </Col>
              )}
            </Row>

            <Row gutter={16} className="line-info-row">
              <Col span={productLength > 1 ? 18 : 24}>
                <TextArea name="attributeVarchar1" style={{ width: '100%' }} maxLength={100} />
              </Col>
              {productLength > 1 && (
                <Col
                  span={6}
                  className="batch-btn"
                  onClick={() => handleChange({ field: 'attributeVarchar1', type: 'batch' })}
                >
                  {intl.get('mallf.common.view.batch.set').d('批量维护')}
                </Col>
              )}
            </Row>

            <Row gutter={16} className="line-info-row">
              <Col span={productLength > 1 ? 18 : 24}>
                <DatePicker name="attributeDate1" style={{ width: '100%' }} />
              </Col>
              {productLength > 1 && (
                <Col
                  span={6}
                  className="batch-btn"
                  onClick={() => handleChange({ field: 'attributeDate1', type: 'batch' })}
                >
                  {intl.get('mallf.common.view.batch.set').d('批量维护')}
                </Col>
              )}
            </Row>

            <Row gutter={16} className="line-info-row">
              <UploadFile
                maxSize={5}
                bucketName="private-bucket"
                directory="mall-front"
                attachmentUuid={product.attachmentUuid}
              />
            </Row>
          </Form>
        </div>
      </Sidebar>
    </>
  );
}
export default CustomizeModal;
