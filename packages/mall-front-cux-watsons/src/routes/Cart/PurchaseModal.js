import React from 'react';
import classNames from 'classnames';
import { Input, Form, Button } from 'choerodon-ui';

import intl from 'utils/intl';
import * as HmallConfig from 'utils/api-config';
import Lov from 'components/lov';
import { getUserConfigInfo } from 'utils/utils';
import { getLovColumns } from 'utils/options';
import components from '@/cuxTools/components';

const { 'Cart/AddressLov': AddressLov } = components;
const { TextArea } = Input;
const FormItem = Form.Item;
function PurchaseModal(props) {
  const {
    currencyIndex,
    allProductNum,
    belongTypeList,
    replaceUnit,
    chooseAddress,
    item: {
      address,
      addressId,
      remark,
      purOrganizationId,
      purOrganizationName,
      ouName,
      ouId,
      organizationName,
      invOrganizationId,
    },
    oncancel,
  } = props;
  const { addressColumns, invOrgColumns, purchaseOrgColumns, ouColumns } = getLovColumns({
    belongTypeList,
  });
  const { organizationId, companyId } = getUserConfigInfo();
  const { getFieldDecorator, validateFields, setFieldsValue, getFieldValue } = props.form;

  function handleSave(values) {
    replaceUnit(values);
    if (addressId !== values.addressId) {
      chooseAddress({ addressId: values.addressId, item: props.item });
    }
  }

  const AddressLovProps = {
    purOrganizationId,
    addressColumns,
    setFieldsValue,
    address,
  };

  return (
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
            })(<AddressLov {...AddressLovProps} />)}
          </FormItem>
        </div>
        <div className="modal-item">
          {getFieldDecorator('remark', { initialValue: remark })(
            <TextArea
              style={{ resize: 'none' }}
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
                  title: intl.get(`mallf.header.model.header.choosePurchaseOrg`).d('选择采购组织'),
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
                  title: intl.get(`mallf.header.model.header.chooseInventoryOrg`).d('选择库存组织'),
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
        <Button
          onClick={() => {
            oncancel();
          }}
        >
          {intl.get('hzero.common	button.cancel').d('取消')}
        </Button>
      </div>
    </div>
  );
}

export default Form.create({ fieldNameProp: null })(PurchaseModal);
