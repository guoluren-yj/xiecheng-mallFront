import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Modal, Form, Checkbox, Input, Message, Select, Tooltip } from 'choerodon-ui';
import AddressCascader from 'components/AddressCascader';
import { EMAIL, PHONE, TRIM, NOT_CHINA_PHONE } from 'utils/regExp';
import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';
import { submitAcAddressService, fetchCode } from 'services/addressService';
import style from './index.less';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const { TextArea } = Input;
const InputGroup = Input.Group;
const { Option } = Select;

function AddressModal(props) {
  const {
    form,
    visible,
    edit = false,
    initAddress = {},
    onCancel,
    onSuccess,
    addressType,
    setVisible,
    addressPermission,
  } = props;
  const [loads, setLoads] = useState({
    saveLoading: false,
  });
  const [regionIdList, setRegionIdList] = useState([]);
  const [regionNameList, setRegionNameList] = useState(initAddress.regionNameList || []);
  const [idds, setIdds] = useState([]);
  // const [phoneChangeFlag, setPhoneChangeFlag] = useState();
  const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
  const { saveLoading } = loads;

  useEffect(() => {
    fetchCode().then((res) => {
      setIdds(res || []);
    });
  }, []);

  // 联系人不可编辑
  const linkDisabled = addressPermission === 'ADDRESS' && addressType === 'RECEIVER';
  // 地区不可编辑
  const regionDisabled = addressPermission === 'CONTACT' && addressType === 'RECEIVER';

  // 邮箱是否有变更
  const emailEditFlag = getFieldValue('email') !== initAddress.email ? 1 : 0;

  /**
   * 地址提交
   */
  const submitApplication = () => {
    const { companyId, invoiceOrgId } = getUserConfigInfo();
    form.validateFields(
      {
        force: true,
      },
      (err) => {
        if (!err) {
          setLoads({
            saveLoading: true,
          });
          const formData = form.getFieldsValue();
          const params = {
            addressType: 'INVOICE',
            belongType: 2,
            enabledFlag: 1,
            ...initAddress,
            ...formData,
            defaultFlag: formData.defaultFlag ? 1 : 0,
            regionId: regionIdList.pop() || initAddress.regionIdList.pop(),
            fullAddress: isEmpty(regionNameList)
              ? initAddress.fullAddress
              : `${regionNameList.join('')}${formData.address}`,
            companyId,
            invOrganizationId: invoiceOrgId,
            editFlag: getFieldValue('phoneChangeFlag'), // 是否修改过手机号，可跳过后端校验
            emailEditFlag,
          };
          submitAcAddressService(params)
            .then(() => {
              onCancel();
              onSuccess(formData.defaultFlag, edit);
              const msg = edit
                ? intl.get(`mallf.addressManage.model.addressModel.editSuccess`).d('地址修改成功')
                : intl.get(`mallf.addressManage.model.addressModel.addSuccess`).d('新建地址成功');
              Message.success(msg);
            })
            .catch((e) => e)
            .finally(() => {
              setLoads({
                saveLoading: false,
              });
            });
        }
      }
    );
  };

  const LinkEdtior = () => {
    return <Input trim label={intl.get(`mallf.addressManage.view.contact`).d('联系人')} />;
  };

  const RegionEdtior = () => {
    return <Input trim label={intl.get(`mallf.addressManage.model.addressDetail`).d('详细地址')} />;
  };

  const isLeafRef = useRef();
  /**
   * 选择地址
   * @param {*} idList 地区id
   * @param {*} nameList 地区name
   * @param {*} isLeaf 是否最后一级
   */
  function onAddressChange(idList, nameList, isLeaf) {
    form.setFieldsValue({
      pickWareAddress: nameList.join('/'),
    });
    isLeafRef.current = isLeaf;
    setRegionIdList(idList);
    setRegionNameList(nameList);
  }
  return (
    <Sidebar
      className={style['address-modal']}
      title={
        edit
          ? intl.get(`mallf.addressManage.model.editAddress`).d('修改地址')
          : intl.get(`mallf.addressManage.model.addAddress`).d('新建地址')
      }
      visible={visible}
      onOk={() => submitApplication()}
      onCancel={() => setVisible(false)}
      okText={intl.get('mallf.addressManage.button.save').d('保存')}
      width={380}
      confirmLoading={saveLoading}
      closable
      maskClosable={false}
    >
      <FormItem>
        {getFieldDecorator('contactName', {
          initialValue: initAddress.contactName,
          rules: [
            {
              max: 30,
              message: intl.get(`mallf.addressManage.view.maxWidth30`).d('最大长度为30'),
            },
            {
              required: true,
              message: intl.get(`mallf.addressManage.view.contact.notNull`).d('联系人不能为空'),
            },
            {
              pattern: TRIM,
              message: intl.get('hzero.common.validate.trim').d('前后不能为空'),
            },
          ],
        })(LinkEdtior())}
      </FormItem>
      <InputGroup compact style={{ display: 'flex' }}>
        <FormItem>
          {getFieldDecorator('internationalTelCode', {
            initialValue: initAddress.internationalTelCode || '+86',
          })(
            <Select
              allowClear={false}
              disabled={linkDisabled}
              // dropdownMatchSelectWidth={false}
              style={{ width: 110 }}
              label={intl.get(`mallf.addressManage.view.internationalTelCode`).d('区号')}
              onChange={() => {
                setFieldsValue({
                  mobile: getFieldValue('mobile'),
                });
              }}
            >
              {idds.map((m) => (
                <Option value={m.value} key={m.value} title={m.meaning}>
                  <Tooltip title={m.meaning} placement="left">
                    {m.meaning}
                  </Tooltip>
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem style={{ flex: 1 }}>
          {getFieldDecorator('mobile', {
            initialValue: initAddress.mobile,
            rules: [
              {
                pattern: !getFieldValue('phoneChangeFlag')
                  ? null
                  : getFieldValue('internationalTelCode') === '+86'
                  ? PHONE
                  : NOT_CHINA_PHONE,
                message: intl.get(`mallf.common.view.validate.phoneNum`).d('手机号码格式不正确'),
              },
              {
                required: true,
                message: intl.get(`mallf.addressManage.view.phone.notNull`).d('手机不能为空'),
              },
            ],
          })(
            <Input
              label={intl.get(`mallf.addressManage.view.phone`).d('手机')}
              disabled={linkDisabled}
              onChange={() => {
                setFieldsValue({
                  phoneChangeFlag: 1,
                });
              }}
            />
          )}
        </FormItem>
      </InputGroup>
      <FormItem>
        {getFieldDecorator('email', {
          initialValue: initAddress.email,
          rules: [
            {
              pattern: emailEditFlag ? EMAIL : null,
              message: intl.get(`mallf.addressManage.model.emailErrMsg`).d('邮箱格式不正确'),
            },
            {
              max: 100,
              message: intl.get(`mallf.addressManage.model.emailLengthMsg`).d('长度不能超过100'),
            },
          ],
        })(
          <Input
            label={intl.get(`mallf.addressManage.view.email`).d('邮箱')}
            disabled={linkDisabled}
          />
        )}
      </FormItem>
      <FormItem className={style['address-cascader']}>
        {getFieldDecorator('pickWareAddress', {
          initialValue: (initAddress.regionNameList || []).join('/'),
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl
                    .get(`mallf.addressManage.view.orderDetail.contactAddress`)
                    .d('联系人地址'),
                })
                .d('联系人地址不能为空'),
            },
            {
              validator: (rule, val, callback) => {
                if (isLeafRef.current === false && !regionDisabled) {
                  callback(intl.get('mallf.addressManage.view.errorAddress').d('地区不完整'));
                } else {
                  callback();
                }
              },
            },
          ],
        })(
          <AddressCascader
            label={intl.get(`mallf.addressManage.view.orderDetail.contactAddress`).d('联系人地址')}
            onChange={onAddressChange}
            displayValue={regionNameList.join('/')}
          />
        )}
      </FormItem>
      <FormItem>
        {getFieldDecorator('address', {
          initialValue: initAddress.address,
          rules: [
            {
              max: 30,
              message: intl.get(`mallf.addressManage.view.maxWidth30`).d('最大长度为30'),
            },
            {
              required: true,
              message: intl
                .get(`mallf.addressManage.view.addressDetail.notNull`)
                .d('详细地址不能为空'),
            },
            {
              pattern: TRIM,
              message: intl.get('hzero.common.validate.trim').d('前后不能为空'),
            },
          ],
        })(RegionEdtior())}
      </FormItem>
      <FormItem>
        {getFieldDecorator('remark', {
          initialValue: initAddress.remark,
        })(<TextArea row={3} label={intl.get(`mallf.addressManage.model.remark`).d('备注')} />)}
      </FormItem>
      <FormItem>
        {getFieldDecorator('defaultFlag', {
          initialValue: !!initAddress.defaultFlag,
        })(
          <Checkbox defaultChecked={!!initAddress.defaultFlag}>
            {intl.get(`mallf.addressManage.model.setDefault`).d('设为默认')}
          </Checkbox>
        )}
      </FormItem>
    </Sidebar>
  );
}

export default connect(({ global }) => ({ addressPermission: global.addressPermission }))(
  Form.create({ fieldNameProp: null })(AddressModal)
);
