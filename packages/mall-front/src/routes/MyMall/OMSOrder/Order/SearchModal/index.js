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
  const { searchMoreParams, form, searchVisible, setState, textFieldVal, loading } = props;
  const { getFieldDecorator } = form;

  const { label } = getContextValue();

  function handleOk() {
    const { createDate = {}, poNum, ...other } = form.getFieldsValue();
    const { startDate, endDate } = createDate;
    const params = {
      ...other,
      startDate: startDate && moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
      endDate: endDate && moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
    };
    setState({
      searchMoreParams: { ...params, poNum: textFieldVal || poNum },
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
        <FormItem label={label.poNum} {...formLayout}>
          {getFieldDecorator('poNum', {
            initialValue: searchMoreParams.poNum,
          })(<Input placeholder={label.poNum} label={label.poNum} />)}
        </FormItem>
        <FormItem label={label.productName} {...formLayout}>
          {getFieldDecorator('productName', {
            initialValue: searchMoreParams.productName,
          })(<Input placeholder={label.productName} label={label.productName} />)}
        </FormItem>
        <FormItem label={label.srmPoNum} {...formLayout}>
          {getFieldDecorator('srmPoNum', {
            initialValue: searchMoreParams.srmPoNum,
          })(<Input placeholder={label.srmPoNum} label={label.srmPoNum} />)}
        </FormItem>
        <FormItem label={label.prNum} {...formLayout}>
          {getFieldDecorator('prNum', {
            initialValue: searchMoreParams.prNum,
          })(<Input placeholder={label.prNum} label={label.prNum} />)}
        </FormItem>
        <FormItem label={label.ecPoNum} {...formLayout}>
          {getFieldDecorator('ecPoNum', {
            initialValue: searchMoreParams.ecPoNum,
          })(<Input label={label.ecPoNum} placeholder={label.ecPoNum} />)}
        </FormItem>
        <FormItem label={label.poSubNum} {...formLayout}>
          {getFieldDecorator('poSubNum', {
            initialValue: searchMoreParams.poSubNum,
          })(<Input label={label.poSubNum} placeholder={label.poSubNum} />)}
        </FormItem>
        <FormItem label={label.supplierCompanyName} {...formLayout}>
          {getFieldDecorator('supplierCompanyName', {
            initialValue: searchMoreParams.supplierCompanyName,
          })(<Input placeholder={label.supplierCompanyName} label={label.supplierCompanyName} />)}
        </FormItem>
        <FormItem {...formLayout}>
          {getFieldDecorator('createDate', {
            initialValue: {
              startDate: searchMoreParams.startDate,
              endDate: searchMoreParams.endDate,
            },
          })(
            <DatePicker
              range={['startDate', 'endDate']}
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
