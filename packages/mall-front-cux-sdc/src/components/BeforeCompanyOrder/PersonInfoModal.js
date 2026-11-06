import React, { useState } from 'react';
import { Form, Row, Col, Input, Modal, Spin, Menu, Radio, Button, Pagination } from 'hzero-ui';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import { searchUuidImage } from 'services/api';
import { fetchCardInfo } from '../../services';

import './PersonInfoModal.less';

const RadioGroup = Radio.Group;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

function PersonInfoModal(props) {
  const {
    onSave,
    loading,
    visible,
    onCancel,
    comList = [],
    orgList = [],
    comListPage = {},
    orgListPage = {},
    fetchComList,
    fetchOrgList,
  } = props;

  const { getFieldsValue, getFieldDecorator, resetFields } = props.form;

  const [key, setKey] = useState('com');
  const [user, setUser] = useState('');
  const [selectedRow, setSelectedRow] = useState({});

  const fetchData = (page = 1) => {
    setUser('');
    const formParams = filterNullValueObject(getFieldsValue());
    const params = { page: page - 1, size: 10, ...formParams };
    if (key === 'com') fetchComList(params);
    else fetchOrgList(params);
  };

  const changeSelected = value => {
    setUser(value);
    const item =
      (key === 'com'
        ? comList.find(i => i.cardId === value)
        : orgList.find(i => i.userId === value)) || {};
    setSelectedRow(item);
  };

  const changeMenu = ({ key: activeKey }) => {
    setKey(activeKey);
    reset();
  };

  const handleOk = () => {
    const {
      cardId,
      userId: id,
      name,
      realName,
      email,
      mobile,
      phone,
      qrCodeUuid,
      wxQrCodeUuid,
    } = selectedRow;
    if (key === 'com') {
      Promise.all([searchUuidImage(qrCodeUuid), searchUuidImage(wxQrCodeUuid)]).then(arr => {
        if (arr) {
          const { fileUrl: fileUrl1 } = arr[0][0] || {};
          const { fileUrl: fileUrl2 } = arr[1][0] || {};
          onSave({
            email,
            mobile: phone,
            name: realName,
            cartUserId: cardId,
            isChange: true,
            cartUserType: 'GROUP',
            attributeLongtext1: fileUrl1,
            attributeLongtext2: fileUrl2,
          });
        }
      });
    } else {
      fetchCardInfo(id).then(res => {
        if (res) {
          const { attributeLongtext1, attributeLongtext2 } = res;
          onSave({
            name,
            email,
            mobile,
            cartUserId: id,
            cartUserType: 'USER',
            attributeLongtext1,
            attributeLongtext2,
            isChange: true,
          });
        }
      });
    }
  };

  const showTotal = (total, range) => {
    return `显示 ${range[0]}-${range[1]}条， 共${total}条`;
  };

  const reset = () => {
    resetFields();
  };

  const list = key === 'com' ? comList : orgList;
  const page = key === 'com' ? comListPage : orgListPage;
  const { number = 0, totalElements: total = 0 } = page;

  return (
    <Modal
      destroyOnClose
      width={800}
      title={intl.get('mallf.myMall.model.companyOrder.personInfo').d('人员信息')}
      visible={visible}
      onCancel={() => onCancel()}
      onOk={handleOk}
      className="person-info-wrapper"
    >
      <Form className="person-info-header">
        <Row gutter={12}>
          <Col span={6}>
            <Form.Item
              {...formLayout}
              label={intl.get('mallf.myMall.model.companyOrder.name').d('姓名')}
            >
              {getFieldDecorator(key === 'com' ? 'realName' : 'name')(<Input />)}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item {...formLayout} label={intl.get('mallf.common.view.tel').d('电话')}>
              {getFieldDecorator(key === 'com' ? 'phone' : 'mobile')(<Input />)}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item {...formLayout} label={intl.get('mallf.common.view.email').d('邮箱')}>
              {getFieldDecorator('email')(<Input />)}
            </Form.Item>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={() => reset()}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button className="ant-btn-primary" onClick={() => fetchData()}>
                {intl.get('hzero.common.button.query').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Spin spinning={loading} wrapperClassName="person-info-content">
        <Menu
          onClick={changeMenu}
          mode="vertical"
          selectedKeys={[key]}
          className="person-info-menu"
        >
          <Menu.Item key="com">
            {intl.get('mallf.myMall.model.companyOrder.comGroup').d('常用组')}
          </Menu.Item>
          <Menu.Item key="org">
            {intl.get('mallf.myMall.model.companyOrder.orgStructure').d('组织架构')}
          </Menu.Item>
        </Menu>
        <div className="person-info-list">
          {list.length > 0 ? (
            <RadioGroup value={user} onChange={e => changeSelected(e.target.value)}>
              {list.map(item => (
                <Radio
                  value={key === 'com' ? item.cardId : item.userId}
                  key={key === 'com' ? item.cardId : item.userId}
                  disabled={item.enabledFlag === 0}
                >
                  <span className="radio-field">{key === 'com' ? item.realName : item.name}</span>
                  <span className="radio-field">{key === 'com' ? item.phone : item.mobile}</span>
                  <span className="radio-field">{item.email}</span>
                </Radio>
              ))}
            </RadioGroup>
          ) : (
            <p style={{ textAlign: 'center' }}>
              {intl.get(`mallf.common.view.noData`).d('暂无数据')}
            </p>
          )}
        </div>
      </Spin>
      {total > 0 && (
        <Pagination
          current={number + 1}
          pageSize={10}
          total={total}
          showTotal={showTotal}
          onChange={p => fetchData(p)}
        />
      )}
    </Modal>
  );
}

export default Form.create({ fieldNameProp: null })(PersonInfoModal);
