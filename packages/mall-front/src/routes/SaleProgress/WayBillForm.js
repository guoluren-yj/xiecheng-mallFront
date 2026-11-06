import React from 'react';
import { Form, Input, Row, Modal, DatePicker, Button } from 'choerodon-ui';
import { getPrimaryColor } from 'utils/utils';
import { isEmpty } from 'lodash';

import locale from 'hzero-ui/lib/date-picker/locale/zh_CN';
import 'moment/locale/zh-cn';

import intl from 'utils/intl';

import styles from './wayBill.less';

const FormItem = Form.Item;
const { Sidebar } = Modal;

function WayBillModal(props) {
  const {
    wayBillData,
    modalVisible,
    onOk,
    onCancel,
    submitLoading,
    form: { getFieldDecorator, validateFields },
  } = props;

  const handleOk = () => {
    validateFields((err, values) => {
      if (!err) {
        const params = {
          ...values,
          deliverTime: values.deliverTime.format('YYYY-MM-DD HH:mm:ss'),
        };
        onOk(params);
      }
    });
  };

  const footer = isEmpty(wayBillData)
    ? {}
    : {
        footer: [
          <Button
            wait={1000}
            style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
            key="back"
            onClick={() => props.onCancel()}
          >
            {intl.get('mallf.saleAppli.button.close').d('关闭')}
          </Button>,
        ],
      };
  return (
    <Sidebar
      {...footer}
      destroyOnClose
      wrapClassName={`hmall-content-Modal ${styles['way-bill-modal']}`}
      width={400}
      title={intl.get(`mallf.saleStatus.view.waybill.info`).d('运单信息')}
      visible={modalVisible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={submitLoading}
    >
      <div className="way-bill-form">
        <Row>
          <FormItem
            label={intl.get(`mallf.saleStatus.view.saleStatus.logisticsCompany`).d('物流公司')}
            required
          >
            {isEmpty(wayBillData) ? (
              getFieldDecorator('logisticsCompanyName', {
                rules: [
                  {
                    required: true,
                    message: `${intl
                      .get(`mallf.saleStatus.view.logisticsCompanNotEmpty`)
                      .d('物流公司不能为空')}！`,
                  },
                ],
              })(
                <Input
                  placeholder={`${intl
                    .get(`mallf.saleStatus.view.chooseLogisticsCom.`)
                    .d('请填写物流公司')}`}
                />
              )
            ) : (
              <div className="waybill-info">
                <p>{intl.get(`mallf.saleStatus.view.saleStatus.logisticsCompany`).d('物流公司')}</p>
                <p>{wayBillData.logisticsCompanyName}</p>
              </div>
            )}
          </FormItem>
        </Row>
        <Row>
          <FormItem
            label={intl.get(`mallf.saleStatus.view.saleStatus.shipmentNum`).d('物流单号')}
            required
          >
            {isEmpty(wayBillData) ? (
              getFieldDecorator('logisticsNum', {
                rules: [
                  {
                    required: true,
                    message: `${intl
                      .get(`mallf.saleStatus.view.saleStatus.shipmentNumCannotBeEmpty`)
                      .d('物流单号不能为空')}！`,
                  },
                ],
              })(
                <Input
                  placeholder={`${intl
                    .get(`mallf.saleStatus.view.chooseLogisticsNum.`)
                    .d('请填写物流单号')}`}
                />
              )
            ) : (
              <div className="waybill-info">
                <p>{intl.get(`mallf.saleStatus.view.saleStatus.shipmentNum`).d('物流单号')}</p>
                <p>{wayBillData.logisticsNum}</p>
              </div>
            )}
          </FormItem>
        </Row>
        <Row>
          <FormItem
            label={intl.get(`mallf.saleStatus.view.saleStatus.deliveryTime`).d('发货时间')}
            required
          >
            {isEmpty(wayBillData) ? (
              getFieldDecorator('deliverTime', {
                rules: [
                  {
                    required: true,
                    message: `${intl
                      .get(`mallf.saleStatus.view.saleStatus.deliveryTimeCannotBeEmpty`)
                      .d('发货时间不能为空')}！`,
                  },
                ],
              })(
                <DatePicker
                  format="YYYY-MM-DD hh:mm:ss"
                  style={{ width: '100%' }}
                  locale={locale}
                  placeholder={`${intl
                    .get(`mallf.saleStatus.view.chooseSendTime.`)
                    .d('请选择发货时间')}`}
                  showTime
                />
              )
            ) : (
              <div className="waybill-info">
                <p>{intl.get(`mallf.saleStatus.view.saleStatus.deliveryTime`).d('发货时间')}</p>
                <p>{wayBillData.deliverTime}</p>
              </div>
            )}
          </FormItem>
        </Row>
      </div>
    </Sidebar>
  );
}

export default Form.create({ fieldNameProp: null })(WayBillModal);
