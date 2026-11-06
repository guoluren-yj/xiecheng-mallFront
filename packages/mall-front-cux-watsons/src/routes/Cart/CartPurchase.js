import React, { useState } from 'react';
import classNames from 'classnames';
import { Input, Form, Button, Icon as C7nIcon } from 'choerodon-ui';
import intl from 'utils/intl';
import * as HmallConfig from 'utils/api-config';
import Lov from 'components/lov';
import { getUserConfigInfo } from 'utils/utils';
import { getLovColumns } from 'utils/options';
import components from '@/cuxTools/components';

const { 'Cart/AddressLov': AddressLov } = components;

const { TextArea } = Input;
const FormItem = Form.Item;

export default Form.create()(function CartPurches(props) {
  // const { info, modalProps, modalActive, toggleModalActive, cCartPurchase } = props;
  const { info, modalProps, modalActive, toggleModalActive } = props;
  const { currencyIndex, allProductNum, handleSave, belongTypeList } = modalProps;
  const {
    address,
    addressId,
    remark,
    purOrganizationId,
    purOrganizationName,
    ouName,
    ouId,
    organizationName,
    invOrganizationId,
    contactName,
    cartId,
  } = info;
  const { addressColumns, invOrgColumns, purchaseOrgColumns, ouColumns } = getLovColumns({
    belongTypeList,
  });

  const { organizationId, companyId } = getUserConfigInfo();
  const { getFieldDecorator, validateFields, setFieldsValue, getFieldValue } = props.form;

  const [showDetail, setShowDetail] = useState(false);

  const addressLovProps = {
    purOrganizationId,
    addressColumns,
    setFieldsValue,
    address,
  };
  // return cCartPurchase(
  // { code: 'MALL.TEST.CART.PURCHAZSE', form: props.form, record: info, uniqueKey: cartId },
  return (
    <li className={`cart-body-purches ${modalActive ? 'active' : ''}`}>
      <C7nIcon
        className="purches-edit-icon"
        type="edit-o"
        onClick={() => {
          toggleModalActive(cartId);
        }}
      />
      <div className="detail-info">
        <p className="detail-info-content">
          <span className="detail-info-tag">
            {intl.get(`mallf.common.model.receive.info`).d('收货信息')}：
          </span>
          <span className="detail-info-name">{contactName}</span>
          <span className="detail-info-address" title={address}>
            {address}
          </span>
        </p>
        <p className={`detail-info-remark ${remark && 'remark-no-hover'}`}>
          <span className="detail-info-tag">商品备注：</span>
          {remark && (
            <span title={remark} className="detail-info-address text-overflow">
              {remark}
            </span>
          )}
        </p>
        {showDetail && (
          <div className="detail-info-other">
            {purOrganizationName && (
              <div>
                <span className="detail-info-tag">
                  {intl.get(`mallf.common.model.purchaseOrg`).d('采购组织')}：
                </span>
                <span className="text-overflow" title={purOrganizationName}>
                  {purOrganizationName}
                </span>
              </div>
            )}
            {ouName && (
              <div>
                <span className="detail-info-tag">
                  {intl.get(`mallf.common.model.businessEntity`).d('业务实体')}：
                </span>
                <span className="text-overflow" title={ouName}>
                  {ouName}
                </span>
              </div>
            )}
            {organizationName && (
              <div>
                <span className="detail-info-tag">
                  {intl.get(`mallf.common.model.inventoryOrg`).d('库存组织')}：
                </span>
                <span className="text-overflow" title={organizationName}>
                  {organizationName}
                </span>
              </div>
            )}
          </div>
        )}
        <div
          className={`toggle-btn ${showDetail ? 'toggle-btn-active' : ''}`}
          onClick={() => setShowDetail(!showDetail)}
        >
          &nbsp;
        </div>
      </div>
      {modalActive && (
        <div
          className={classNames({
            'info-edit-modal': true,
            'modal-one': allProductNum - currencyIndex === 1 && allProductNum >= 4,
            'modal-two': allProductNum - currencyIndex === 2 && allProductNum >= 4,
            'modal-three': allProductNum - currencyIndex === 3 && allProductNum >= 4,
          })}
        >
          <Form>
            <div className="modal-item">
              <FormItem>
                {getFieldDecorator('addressId', {
                  rules: [{ required: true }],
                  initialValue: addressId,
                })(<AddressLov {...addressLovProps} />)}
              </FormItem>
            </div>
            <div className="modal-item">
              {getFieldDecorator('remark', { initialValue: remark })(
                <TextArea
                  label={intl.get('mallf.common.view.product.remark').d('商品备注')}
                  rows={3}
                />
              )}
            </div>
            <div className="modal-item">
              <FormItem>
                {getFieldDecorator('purchaseOrgName', { initialValue: purOrganizationName })}
                {getFieldDecorator('purchaseOrgId', {
                  rules: [{ required: true }],
                  initialValue: purOrganizationId,
                })(
                  <Lov
                    key={addressId}
                    notAllowClear
                    c7n
                    label={intl.get(`mallf.common.model.purchaseOrg`).d('采购组织')}
                    viewInfo={{
                      width: 770,
                      lovRowKey: 'purchaseOrgId',
                      queryUrl: `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/user-authority-data/purchase-organization`,
                      columns: purchaseOrgColumns,
                      title: intl
                        .get(`mallf.header.model.header.choosePurchaseOrg`)
                        .d('选择采购组织'),
                      displayField: 'organizationName',
                      valueField: 'purchaseOrgId',
                    }}
                    textValue={purOrganizationName}
                    onOkCallback={({ purchaseOrgId, organizationName: name }) => {
                      setFieldsValue({
                        purchaseOrgId,
                        purchaseOrgName: name,
                      });
                    }}
                    width={300}
                    height={35}
                  />
                )}
              </FormItem>
            </div>
            <div className="modal-item">
              <FormItem>
                {getFieldDecorator('ouName', { initialValue: ouName })}
                {getFieldDecorator('ouId', { rules: [{ required: true }], initialValue: ouId })(
                  <Lov
                    key={invOrganizationId}
                    notAllowClear
                    c7n
                    label={intl.get(`mallf.common.model.businessEntity`).d('业务实体')}
                    viewInfo={{
                      width: 770,
                      lovRowKey: 'ouId',
                      queryUrl: `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/user-authority-data/ou?companyId=${companyId}&enabledFlag=1`,
                      columns: ouColumns,
                      title: intl
                        .get(`mallf.header.model.header.chooseBusinessEntity`)
                        .d('选择业务实体'),
                      displayField: 'ouName',
                      valueField: 'ouId',
                    }}
                    textValue={ouName}
                    onOkCallback={({ ouId: id, ouName: name }) => {
                      setFieldsValue({
                        ouId: id,
                        ouName: name,
                      });
                    }}
                    width={300}
                    height={35}
                  />
                )}
              </FormItem>
            </div>
            <div className="modal-item">
              <FormItem>
                {getFieldDecorator('invoiceOrgName', { initialValue: organizationName })}
                {getFieldDecorator('invoiceOrgId', {
                  rules: [{ required: true }],
                  initialValue: invOrganizationId,
                })(
                  <Lov
                    notAllowClear
                    key={getFieldValue('ouId')}
                    disabled={!getFieldValue('ouId')}
                    c7n
                    label={intl.get(`mallf.common.model.inventoryOrg`).d('库存组织')}
                    viewInfo={{
                      width: 770,
                      lovRowKey: 'organizationId',
                      queryUrl: `${HmallConfig.apiGateway}/spfm/v1/${organizationId}/user-authority-data/invorg?lovCode=SPFM.USER_AUTH.INVORG&companyId=${companyId}`,
                      columns: invOrgColumns,
                      title: intl
                        .get(`mallf.header.model.header.chooseInventoryOrg`)
                        .d('选择库存组织'),
                      displayField: 'organizationName',
                      valueField: 'organizationId',
                    }}
                    textValue={organizationName}
                    onOkCallback={({ data }) => {
                      setFieldsValue({
                        invoiceOrgId: data.organizationId,
                        invoiceOrgName: data.organizationName,
                      });
                    }}
                    width={300}
                    height={35}
                  />
                )}
              </FormItem>
            </div>
          </Form>
          <div className="modal-footer">
            <Button
              style={{ marginLeft: 20 }}
              type="primary"
              onClick={() => {
                validateFields((err, values) => {
                  if (!err) {
                    handleSave(values);
                  }
                });
              }}
            >
              {intl.get('hzero.common.model.sure').d('确定')}
            </Button>
            <Button onClick={() => toggleModalActive('')}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        </div>
      )}
    </li>
  );
});
