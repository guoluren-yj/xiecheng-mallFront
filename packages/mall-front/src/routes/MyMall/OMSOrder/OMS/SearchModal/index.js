import React from 'react';
import { Modal, Form, Input } from 'choerodon-ui';
import { DatePicker } from 'choerodon-ui/pro';
import moment from 'moment';

import intl from 'utils/intl';

import styles from './index.less';
import { getContextValue } from '../../common/Context';

const FormItem = Form.Item;
const { Sidebar } = Modal;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 14 },
};

function SearchModal(props) {
  const { form, searchVisible, setState, textFieldVal, loading, searchMoreParams } = props;
  const { getFieldDecorator } = form;

  const { label } = getContextValue();

  function handleOk() {
    const { createDate = {}, orderCode, ...other } = form.getFieldsValue();
    const { beginDate, endDate } = createDate;
    const params = {
      ...other,
      beginDate: beginDate && moment(beginDate).format('YYYY-MM-DD 00:00:00'),
      endDate: endDate && moment(endDate).format('YYYY-MM-DD 23:59:59'),
    };
    setState({
      searchMoreParams: { ...params, orderCode: textFieldVal || orderCode },
    });
  }

  return (
    <Sidebar
      title={intl.get('mallf.myOrder.view.orderCenter.advancedQuery').d('高级查询')}
      className={styles['search-modal']}
      visible={searchVisible}
      onOk={handleOk}
      onCancel={() => setState({ searchVisible: false })}
      cancelText={intl.get(`mallf.myOrder.button.cancel`).d('取消')}
      okText={intl.get(`mallf.myOrder.button.ok`).d('确定')}
      width={400}
      closable
      confirmLoading={loading}
    >
      <Form className="search-modal-form">
        <FormItem label={label.orderCode} {...formLayout}>
          {getFieldDecorator('orderCode', {
            initialValue: searchMoreParams.orderCode,
          })(<Input placeholder={label.orderCode} label={label.orderCode} />)}
        </FormItem>
        <FormItem label={label.skuName} {...formLayout}>
          {getFieldDecorator('skuName', {
            initialValue: searchMoreParams.skuName,
          })(<Input placeholder={label.skuName} label={label.skuName} />)}
        </FormItem>
        <FormItem label={label.srmOrderCode} {...formLayout}>
          {getFieldDecorator('srmOrderCode', {
            initialValue: searchMoreParams.srmOrderCode,
          })(<Input placeholder={label.srmOrderCode} label={label.srmOrderCode} />)}
        </FormItem>
        <FormItem label={label.reqNum} {...formLayout}>
          {getFieldDecorator('reqNum', {
            initialValue: searchMoreParams.reqNum,
          })(<Input placeholder={label.reqNum} label={label.reqNum} />)}
        </FormItem>
        <FormItem label={label.cecOrderCode} {...formLayout}>
          {getFieldDecorator('cecOrderCode', {
            initialValue: searchMoreParams.cecOrderCode,
          })(<Input label={label.cecOrderCode} placeholder={label.cecOrderCode} />)}
        </FormItem>
        <FormItem label={label.ecConsignmentCode} {...formLayout}>
          {getFieldDecorator('ecConsignmentCode', {
            initialValue: searchMoreParams.ecConsignmentCode,
          })(<Input label={label.ecConsignmentCode} placeholder={label.ecConsignmentCode} />)}
        </FormItem>
        <FormItem label={label.supplierCompanyName} {...formLayout}>
          {getFieldDecorator('supplierCompanyName', {
            initialValue: searchMoreParams.supplierCompanyName,
          })(<Input placeholder={label.supplierCompanyName} label={label.supplierCompanyName} />)}
        </FormItem>
        <FormItem label={label.logisticOrderNum} {...formLayout}>
          {getFieldDecorator('logisticOrderNum', {
            initialValue: searchMoreParams.logisticOrderNum,
          })(<Input placeholder={label.logisticOrderNum} label={label.logisticOrderNum} />)}
        </FormItem>
        <FormItem {...formLayout}>
          {getFieldDecorator('createDate', {
            initialValue: {
              beginDate: searchMoreParams.beginDate,
              endDate: searchMoreParams.endDate,
            },
          })(
            <DatePicker
              range={['beginDate', 'endDate']}
              placeholder={[
                intl.get('mallf.myOrder.view.startDate').d('开始时间'),
                intl.get('mallf.myOrder.view.endDate').d('结束时间'),
              ]}
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          )}
        </FormItem>
      </Form>
    </Sidebar>
  );
}

export default Form.create({ fieldNameProp: null })(SearchModal);
