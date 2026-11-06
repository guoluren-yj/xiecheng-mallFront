import React, { useMemo, useEffect, useRef, useState } from 'react';
import { isArray, isEmpty } from 'lodash';
import { Tooltip, Icon } from 'choerodon-ui';
import {
  Form,
  Lov,
  Select,
  TextField,
  Cascader,
  DataSet,
  CheckBox,
  Modal,
  Button,
  Message,
} from 'choerodon-ui/pro';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';

import intl from 'utils/intl';
import { getUserConfigInfo, getPhoneEncrypt } from 'utils/utils';
import { submitAddressService } from 'services/addressService';
import CuxFn from '@/cuxTools/cuxFn';
import { formDataSet, optionDataSet } from './tableDs';

function Drawer(props) {
  const {
    addressPermission,
    userId,
    userInfo: { loginName, realName, internationalTelCode, phone, email },
    companyId,
  } = getUserConfigInfo();
  const {
    edit = false,
    initAddress = {},
    onCancel,
    onSuccess,
    addressType = 'RECEIVER',
    setVisible = (e) => e,
    setDefault,
    modal,
    customizeForm,
  } = props;

  // 联系人不可编辑
  const linkDisabled = addressPermission === 'ADDRESS' && addressType === 'RECEIVER';
  // 地区不可编辑
  const regionDisabled = addressPermission === 'CONTACT' && addressType === 'RECEIVER';

  const [saveLoading, setSaveLoading] = useState(false);
  const optionsDs = useMemo(() => new DataSet(optionDataSet()), []);
  const formDs = useMemo(
    () => new DataSet(formDataSet({ optionsDs, linkDisabled, regionDisabled })),
    []
  );
  const getInitForm = () => {
    const data =
      isEmpty(initAddress) && addressPermission !== 'ADDRESS'
        ? {
            userId,
            loginName,
            contactName: realName,
            realName,
            internationalTelCode,
            mobile: getPhoneEncrypt(phone),
            email,
            defaultFlag: setDefault ? 1 : 0,
          }
        : initAddress;

    return CuxFn({
      name: 'address-modal-init-form',
      value: { data, edit },
    })(() => {
      return data;
    })();
  };

  useEffect(() => {
    const data = getInitForm();
    formDs.create(data);
  }, []);

  function nodeCover({ record }) {
    const nodeProps = {
      title: record.get('text'),
    };
    nodeProps.isLeaf = record.get('isLeaf');
    return nodeProps;
  }

  // 处理暂不选择 去除最后一位
  function onChoose(value, record) {
    formDs.current.set('regionIdList', []);
    if (record.get('isNAFlag')) {
      // N/A字段 需要将regionName处理为空不展示
      const region = value.slice(0, value.length - 1);
      region[region.length - 1].regionId = value[value.length - 1].regionId; // 设置提交的regionId为末级
      const regionIdList = value.reduce((pre, cur) => {
        return pre.concat(cur.regionIdList || []);
      }, []);
      formDs.current.set('regionIdList', regionIdList);
      formDs.current.set('region', region);
      return;
    }
    if (record.get('virtualFlag')) {
      const region = value.slice(0, value.length - 1);
      formDs.current.set('region', region);
    }
  }

  /**
   * 详细地址拼接
   */
  function handleFullAdress(address, region) {
    if (!isArray(region)) {
      const regionNameList = formDs.current.get('regionNameList') || [];
      return `${regionNameList.join('')}${address}`;
    }
    return `${region.map((r) => (r.countryFlag ? '' : r.regionName)).join('')}${address}`; // 处理fulladdress 从region取
  }

  // 保存
  async function handleSave() {
    const flag = await formDs.validate();
    if (!flag) return;
    const formData = formDs.toJSONData()?.[0];
    const { region, address } = formData;
    const params = {
      addressType: 'RECEIVER',
      belongType: 2,
      enabledFlag: 1,
      ...initAddress,
      ...formData,
      regionId: isArray(region) ? region[region.length - 1].regionId : formData.regionId,
      fullAddress: handleFullAdress(address, region),
      companyId,
      method: 'POST',
    };
    setSaveLoading(true);
    submitAddressService(params)
      .then(() => {
        onCancel();
        onSuccess(formData.defaultFlag, edit);
        const msg = edit
          ? intl.get(`mallf.common.model.addressModel.editSuccess`).d('地址修改成功')
          : intl.get(`mallf.common.model.addressModel.addSuccess`).d('新建地址成功');
        Message.success(msg);
      })
      .catch((e) => e)
      .finally(() => {
        setSaveLoading(false);
      });
  }

  useEffect(() => {
    modal.update({
      footer: [
        <Button
          waitType="throttle"
          wait={500}
          loading={saveLoading}
          color="primary"
          onClick={() => handleSave()}
        >
          {intl.get('mallf.common.button.save').d('保存')}
        </Button>,
        <Button
          onClick={() => {
            setVisible(false);
            if (props.onCancel) {
              onCancel();
            }
          }}
        >
          {intl.get(`mallf.common.button.cancel`).d('取消')}
        </Button>,
      ],
    });
  }, [saveLoading]);

  return customizeForm(
    {
      code: 'SMALL.ADDRESS_MANAGE.MALLEDITFORM',
    },
    <Form labelLayout="float" columns={1} dataSet={formDs}>
      {!linkDisabled && <Lov name="userIdLov" />}
      {linkDisabled ? <Lov name="contactNameLov" /> : <TextField name="contactName" />}
      <TextField
        name="mobile"
        addonBeforeStyle={{ padding: 0, border: 'none' }}
        addonBefore={<Select name="internationalTelCode" />}
      />
      <TextField
        name="phone"
        addonAfter={
          <Tooltip
            placement="topRight"
            title={intl
              .get('mallf.common.view.fixPhonHelp')
              .d('若为仓库或办公室等需要固定电话接收的情况，请维护固定电话')}
          >
            <Icon type="help" style={{ fontSize: 16, color: '#7f7f7f' }} />
          </Tooltip>
        }
        onFocus={() => formDs.current.set('phone', '')}
      />
      <TextField name="email" />
      <Cascader
        async
        onOption={nodeCover}
        name="region"
        style={{ width: '100%' }}
        menuMode="single"
        onChoose={(value, record) => onChoose(value, record)}
        changeOnSelect
        onChange={(value) => {
          formDs.current.set('regionIdList', []); // 改变时，去除regionIdList，用来校验
          optionsDs.setQueryParameter('countryId', value?.[0]?.countryId);
        }}
      />
      {regionDisabled ? <Lov name="addressLov" /> : <TextField name="address" />}
      <TextField name="zip" />
      <TextField name="remark" />
      <CheckBox name="defaultFlag" />
    </Form>
  );
}

export const DrawerCom = c7nCustomize({
  unitCode: ['SMALL.ADDRESS_MANAGE.MALLEDITFORM'],
})(Drawer);

function AddressModal(props) {
  const { edit, visible, setVisible } = props;
  const modal = useRef();
  useEffect(() => {
    if (visible) {
      modal.current = Modal.open({
        destroyOnClose: true,
        mask: true,
        drawer: true,
        title: edit
          ? intl.get(`mallf.common.model.editAddress`).d('修改地址')
          : intl.get(`mallf.common.model.addAddress`).d('新建地址'),
        style: { width: 380 },
        children: <Drawer {...props} modal={modal.current} />,
        afterClose: () => {
          setVisible(false);
        },
      });
    } else if (modal.current) {
      modal.current.close();
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (modal.current) {
        modal.current.close();
      }
    };
  }, []);
  return <></>;
}

export default c7nCustomize({
  unitCode: ['SMALL.ADDRESS_MANAGE.MALLEDITFORM'],
})(AddressModal);
