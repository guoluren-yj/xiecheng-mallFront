import React, { useMemo, useEffect } from 'react';
import { DatePicker, Upload, Input, Button, Icon, Row, Col, Form, Modal } from 'choerodon-ui';
import moment from 'moment';
import uuid from 'uuid/v4';

import HmallConfig from 'utils/api-config';
import { timestampToTime, getUserConfigInfo, getHeader, getOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const { TextArea } = Input;
const FormItem = Form.Item;
function CataInfo(props) {
  const { hideFieldList = [] } = getUserConfigInfo();
  const { getFieldDecorator } = props.form; // setFieldsValue, getFieldValue
  const { order, orderIndex, orderTime, setOrderData, orderData } = props;

  useEffect(() => {
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].purchaseHeaderForm = props.form;
      return newOrderData;
    });
  }, []);

  function handleChange(value, field) {
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex][field] = value;
      newOrderData[orderIndex].purchaseHeaderForm = props.form;
      return newOrderData;
    });
  }

  function useOtherHeaderPurchase() {
    Modal.confirm({
      title: intl.get('mallf.myMall.view.sureNum').d('确认数量'),
      width: 460,
      content: (
        <div className="content-modal-confirm">
          {intl
            .getHTML('mallf.common.view.beforeOrder.useOther', {
              value: orderIndex < 9 ? `0${orderIndex + 1}` : orderIndex + 1,
            })
            .d(
              <span>
                确定将
                <strong>采购申请单${orderIndex < 9 ? `0${orderIndex + 1}` : orderIndex + 1}</strong>
                的采购申请信息应用至全部采购申请单吗？
              </span>
            )}
        </div>
      ),
      onOk() {
        orderData.forEach((o) => {
          o.purchaseHeaderForm.setFieldsValue({
            neededDate: props.form.getFieldValue('neededDate'),
          });
          o.purchaseHeaderForm.setFieldsValue({ remark: props.form.getFieldValue('remark') });
        });
      },
    });
  }

  const imageUuid = useMemo(() => {
    return uuid();
  }, []);

  // 供货周期
  const addDateNum = order.deliveryCycle ? Number(order.deliveryCycle) + 3 : 10;

  return (
    <div className="other-info date-urgent-info">
      <p style={{ fontSize: 14, color: '#191919', marginBottom: 15, fontWeight: 500 }}>
        {intl.get('mallf.common.view.apply.info').d('采购申请信息')}
      </p>
      <Form>
        <Row gutter={12}>
          {!hideFieldList.includes('DEMAND_DATE') && (
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('neededDate', {
                  initialValue: moment().add(addDateNum, 'days'),
                })(
                  <DatePicker
                    label={intl.get('mallf.myMall.model.requestDate').d('需求日期')}
                    placeholder={intl.get('mallf.myMall.model.requestDate').d('需求日期')}
                    format="YYYY-MM-DD hh:mm:ss"
                    allowClear={false}
                    style={{ width: 370 }}
                    onChange={(_, dateString) => {
                      orderTime(dateString, orderIndex);
                    }}
                    disabledDate={(currentDate) =>
                      moment(timestampToTime()).isAfter(currentDate, 'day')
                    }
                  />
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            <FormItem>
              {getFieldDecorator('remark')(
                <TextArea
                  rows={2}
                  maxLength={100}
                  label={intl.get('hzero.common.button.remark').d('备注')}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
      <Row gutter={12}>
        <Col span={8}>
          <Upload
            action={`${
              HmallConfig.apiGateway
            }/hfle/v1/${getOrganizationId()}/files/attachment/multipart`}
            headers={getHeader({})}
            multiple
            data={{
              bucketName: 'private-bucket',
              directory: 'mall-upload',
              attachmentUUID: imageUuid,
            }}
            onChange={() => handleChange(imageUuid, 'attachmentUuid')}
          >
            <Button className="primary-color">
              <Icon type="file_upload" />{' '}
              {intl.get('mallf.common.model.upload.attachments').d('上传附件')}
            </Button>
          </Upload>
        </Col>
      </Row>
      {orderData.length > 1 && (
        <Row>
          <Button
            className="purchase-header-useOther-btn"
            onClick={() => {
              useOtherHeaderPurchase();
            }}
          >
            {intl.get('mallf.common.header.useOther.orders').d('应用至全部采购申请单')}
          </Button>
        </Row>
      )}
    </div>
  );
}

export default Form.create({ fieldNameProp: null })(CataInfo);
