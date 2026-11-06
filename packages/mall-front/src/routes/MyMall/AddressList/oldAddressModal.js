import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'dva';
import qs from 'qs';
import { isEmpty } from 'lodash';
import { Form, Checkbox, Input, Message, Select, Tooltip, Icon } from 'choerodon-ui';
import { Modal, Button } from 'choerodon-ui/pro';
import Lov from 'components/lov';
import NewLov from 'components/NewLov';
import AddressCascader from 'components/AddressCascader';
import { EMAIL, PHONE, TRIM, NOT_CHINA_PHONE, FIXEDPHONE, ZIP } from 'utils/regExp';
import { getUserConfigInfo, getPhoneEncrypt } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import intl from 'utils/intl';
import { submitAddressService, fetchCode } from 'services/addressService';
import style from './index.less';
import CuxFn from '@/cuxTools/cuxFn';

const FormItem = Form.Item;
const { TextArea } = Input;
const InputGroup = Input.Group;
const { Option } = Select;

function AddressModal(props) {
  const {
    organizationId,
    addressPermission,
    userInfo: { userId, loginName, realName, internationalTelCode, phone, email },
    companyId,
  } = getUserConfigInfo();
  const {
    form,
    edit = false,
    initAddress = {},
    onCancel,
    onSuccess,
    addressType = 'RECEIVER',
    setVisible = (e) => e,
    setDefault,
    modal,
  } = props;

  const linkColumns = [
    {
      title: intl.get(`mallf.common.view.contact`).d('联系人'),
      width: 200,
      dataIndex: 'contactName',
      isQuery: true,
    },
    {
      title: intl.get(`mallf.common.view.phone`).d('手机'),
      width: 120,
      dataIndex: 'mobile',
      isQuery: true,
    },
    {
      title: intl.get(`mallf.common.view.email`).d('邮箱'),
      width: 200,
      dataIndex: 'email',
    },
  ];
  const regionColumns = [
    {
      title: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
      width: 400,
      dataIndex: 'fullAddress',
      isQuery: true,
    },
  ];
  const [loads, setLoads] = useState({
    saveLoading: false,
  });
  const [regionIdList, setRegionIdList] = useState([]);
  const [regionNameList, setRegionNameList] = useState(initAddress.regionNameList || []);
  const [idds, setIdds] = useState([]);
  const [country, setCountry] = useState([]);
  const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
  const { saveLoading } = loads;

  useEffect(() => {
    modal.update({
      footer: [
        <Button loading={saveLoading} color="primary" onClick={submitApplication}>
          {intl.get('mallf.common.button.save').d('保存')}
        </Button>,
        <Button onClick={() => setVisible(false)}>
          {intl.get(`mallf.common.button.cancel`).d('取消')}
        </Button>,
      ],
    });
  }, [saveLoading, regionIdList]);

  useEffect(() => {
    fetchCode().then((res) => {
      setIdds(res || []);
    });
  }, []);

  // 联系人不可编辑
  const linkDisabled = addressPermission === 'ADDRESS' && addressType === 'RECEIVER';
  // 地区不可编辑
  const regionDisabled = addressPermission === 'CONTACT' && addressType === 'RECEIVER';

  /**
   * 地址提交
   */
  const submitApplication = () => {
    // const { companyId, invoiceOrgId } = getUserConfigInfo();
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
            addressType: 'RECEIVER',
            belongType: 2,
            enabledFlag: 1,
            ...initAddress,
            ...formData,
            defaultFlag: formData.defaultFlag ? 1 : 0,
            regionId: regionIdList.pop() || initAddress.regionIdList?.pop(),
            fullAddress: isEmpty(regionNameList)
              ? initAddress.fullAddress
              : `${regionNameList.join('')}${formData.address}`,
            companyId: getUserConfigInfo().companyId,
            editFlag: getFieldValue('phoneChangeFlag'), // 是否修改过手机号，可跳过后端校验
            method: 'POST',
            // invOrganizationId: invoiceOrgId,
          };
          if (!isEmpty(country)) params.countryId = country.countryId;
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
              setLoads({
                saveLoading: false,
              });
            });
        }
      }
    );
  };

  const LinkEdtior = () => {
    const queryParams = {
      enabledFlag: 1,
      addressType: 'RECEIVER',
      belongType: 1,
      ownerType: 'COMPANY',
      tenantId: organizationId,
    };
    return linkDisabled ? (
      <Lov
        viewInfo={{
          queryUrl: `${HmallConfig.apiGateway}/${
            HmallConfig.serviceName
          }/v1/${organizationId}/addresss/list?${qs.stringify(queryParams)}`,
          title: intl.get(`mallf.common.model.choose.contact`).d('选择联系人'),
          placeholder: intl.get(`mallf.common.model.pleaseChoose.contact`).d('请选择联系人'),
          valueField: 'contactName',
          displayField: 'contactName',
          columns: linkColumns,
          lovRowKey: 'addressId',
        }}
        c7n
        label={intl.get(`mallf.common.view.contact`).d('联系人')}
        allowClear
        textValue={initAddress.contactName}
        onOkCallback={(n) => {
          setFieldsValue({
            contactName: n.contactName,
            mobile: n.data.mobile,
            email: n.data.email,
            internationalTelCode: n.data.internationalTelCode || '+86',
            quoteAddressId: n.data.addressId,
          });
        }}
        width="100%"
      />
    ) : (
      <Input
        disabled={form.getFieldValue('loginName')}
        trim
        label={intl.get(`mallf.common.view.contact`).d('联系人')}
      />
    );
  };

  const RegionEdtior = () => {
    const queryParams = {
      enabledFlag: 1,
      addressType: 'RECEIVER',
      // belongType: 1,
      // ownerType: 'COMPANY',
      // tenantId: organizationId,
      companyId,
    };
    return regionDisabled ? (
      <Lov
        viewInfo={{
          queryUrl: `${HmallConfig.apiGateway}/${
            HmallConfig.serviceName
          }/v1/${organizationId}/addresss/list-receive?${qs.stringify(queryParams)}`,
          title: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
          placeholder: intl.get(`mallf.common.model.pleaseChoose.addressInfo`).d('请选择地址信息'),
          valueField: 'address',
          displayField: 'address',
          lovRowKey: 'addressId',
          columns: regionColumns,
        }}
        c7n
        label={intl.get(`mallf.common.model.addressDetail`).d('详细地址')}
        textValue={initAddress.address}
        onOkCallback={(n) => {
          const { address = '', regionIdList: idList = [], regionNameList: nameList = [] } =
            n.data || {};
          form.setFieldsValue({
            pickWareAddress: nameList.join('/'),
            address,
          });
          setRegionIdList(idList);
          setRegionNameList(nameList);
        }}
        width="100%"
      />
    ) : (
      <Input trim label={intl.get(`mallf.common.model.addressDetail`).d('详细地址')} />
    );
  };

  const isLeafRef = useRef();
  /**
   * 选择地址
   * @param {*} idList 地区id
   * @param {*} nameList 地区name
   * @param {*} isLeaf 是否最后一级
   */
  function onAddressChange(idList, nameList, isLeaf, _, countryData) {
    form.setFieldsValue({
      pickWareAddress: nameList.join('/'),
    });
    setCountry(countryData);
    isLeafRef.current = isLeaf;
    setRegionIdList(idList);
    setRegionNameList(nameList);
  }

  const cuxAddressHelp = CuxFn({
    name: 'addressList-fn-cuxAddressHelp',
  })();

  const cuxRemarkHelp = CuxFn({
    name: 'addressList-fn-cuxRemarkHelp',
  })();

  const defaultAddInfo =
    isEmpty(initAddress) && addressPermission !== 'ADDRESS'
      ? {
          userId,
          loginName,
          contactName: realName,
          realName,
          internationalTelCode,
          mobile: getPhoneEncrypt(phone),
          email,
        }
      : initAddress;
  return (
    <>
      {!linkDisabled && (
        <FormItem>
          {getFieldDecorator('loginName', {
            initialValue: defaultAddInfo.loginName,
          })}
          {getFieldDecorator('userId', {
            initialValue: defaultAddInfo.userId,
          })(
            <NewLov
              label={intl.get(`mallf.common.view.contact.user`).d('联系人账户')}
              title={intl.get(`mallf.common.view.contact.user`).d('联系人账户')}
              textValue={defaultAddInfo.loginName}
              code="SMAL.QUERY_USER"
              onOk={(_, data) => {
                form.setFieldsValue({
                  userId: data.id,
                  loginName: data.loginName,
                  contactName: data.realName,
                  mobile: data.phone,
                  email: data.email,
                  phoneChangeFlag: 0,
                });
              }}
              onClear={() => {
                form.setFieldsValue({
                  userId: '',
                  loginName: '',
                });
                form.setFieldsValue({
                  phoneChangeFlag: 1,
                });
              }}
              disabled={linkDisabled}
            />
          )}
        </FormItem>
      )}
      <FormItem>
        {getFieldDecorator('quoteAddressId')}
        {getFieldDecorator('contactName', {
          initialValue: defaultAddInfo.contactName,
          rules: [
            {
              max: 30,
              message: intl.get(`mallf.common.view.maxWidth30`).d('最大长度为30'),
            },
            {
              required: true,
              message: intl.get(`mallf.common.view.contact.notNull`).d('联系人不能为空'),
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
          {getFieldDecorator('phoneChangeFlag', { initialValue: 0 })}
          {getFieldDecorator('internationalTelCode', {
            initialValue: defaultAddInfo.internationalTelCode || '+86',
          })(
            <Select
              allowClear={false}
              disabled={linkDisabled}
              // dropdownMatchSelectWidth={false}
              style={{ width: 110 }}
              label={intl.get(`mallf.common.view.internationalTelCode`).d('区号')}
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
            initialValue: defaultAddInfo.mobile,
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
                message: intl.get(`mallf.common.view.phone.notNull`).d('手机不能为空'),
              },
            ],
          })(
            <Input
              label={intl.get(`mallf.common.view.phone`).d('手机')}
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
      {!linkDisabled && (
        <FormItem>
          {getFieldDecorator('phoneEditFlag')}
          {getFieldDecorator('phone', {
            initialValue: initAddress.phone,
            rules: [
              {
                pattern: FIXEDPHONE,
                message: intl.get(`mallf.common.model.fixedPhoneErrMsg`).d('固定电话不正确'),
              },
              {
                max: 100,
                message: intl.get(`mallf.common.model.emailLengthMsg`).d('长度不能超过100'),
              },
            ],
          })(
            <Input
              label={intl.get(`mallf.common.view.fixedPhone`).d('固定电话')}
              onFocus={() => {
                if (!isEmpty(initAddress)) {
                  setFieldsValue({
                    phone: '',
                    phoneEditFlag: 1,
                  });
                }
              }}
              suffix={
                <Tooltip
                  placement="topRight"
                  title={intl
                    .get('mallf.common.view.fixPhonHelp')
                    .d('若为仓库或办公室等需要固定电话接收的情况，请维护固定电话')}
                >
                  <Icon type="help" />
                </Tooltip>
              }
              onChange={() => {
                if (!isEmpty(initAddress)) {
                  setFieldsValue({
                    phoneEditFlag: 1,
                  });
                }
              }}
            />
          )}
        </FormItem>
      )}
      <FormItem>
        {getFieldDecorator('email', {
          initialValue: defaultAddInfo.email,
          rules: [
            {
              pattern: EMAIL,
              message: intl.get(`mallf.common.model.emailErrMsg`).d('邮箱格式不正确'),
            },
            {
              max: 100,
              message: intl.get(`mallf.common.model.emailLengthMsg`).d('长度不能超过100'),
            },
          ],
        })(<Input label={intl.get(`mallf.common.view.email`).d('邮箱')} disabled={linkDisabled} />)}
      </FormItem>
      <FormItem className={style['address-cascader']}>
        {getFieldDecorator('pickWareAddress', {
          initialValue: (initAddress.regionNameList || []).join('/'),
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get(`mallf.common.view.orderDetail.contactAddress`).d('联系人地址'),
                })
                .d('联系人地址不能为空'),
            },
            {
              validator: (rule, val, callback) => {
                if (isLeafRef.current === false && !regionDisabled) {
                  callback(intl.get('mallf.common.view.errorAddress').d('地区不完整'));
                } else {
                  callback();
                }
              },
            },
          ],
        })(
          <AddressCascader
            label={intl.get(`mallf.common.view.orderDetail.contactAddress`).d('联系人地址')}
            disabled={regionDisabled}
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
              max: 100,
              message: intl.get(`mallf.common.view.maxWidth100`).d('最大长度为100'),
            },
            {
              required: true,
              message: intl.get(`mallf.common.view.addressDetail.notNull`).d('详细地址不能为空'),
            },
            {
              pattern: TRIM,
              message: intl.get('hzero.common.validate.trim').d('前后不能为空'),
            },
          ],
        })(RegionEdtior())}
      </FormItem>
      {cuxAddressHelp}
      <FormItem>
        {getFieldDecorator('zip', {
          initialValue: initAddress.zip,
          rules: [
            {
              pattern: ZIP,
              message: intl.get(`mallf.common.model.zipErrMsg`).d('邮编格式不正确'),
            },
            {
              max: 10,
              message: intl.get('hzero.common.validation.max', {
                max: 10,
              }),
            },
          ],
        })(<Input label={intl.get(`mallf.common.view.zip`).d('邮编')} />)}
      </FormItem>
      <FormItem>
        {getFieldDecorator('remark', {
          initialValue: initAddress.remark,
        })(<TextArea row={3} label={intl.get(`mallf.common.model.remark`).d('备注')} />)}
      </FormItem>
      {cuxRemarkHelp}
      <FormItem>
        {getFieldDecorator('defaultFlag', {
          initialValue: !!initAddress.defaultFlag || setDefault,
        })(
          <Checkbox defaultChecked={!!initAddress.defaultFlag || setDefault}>
            {intl.get(`mallf.common.model.setDefault`).d('设为默认')}
          </Checkbox>
        )}
      </FormItem>
    </>
  );
}

const AddressModal1 = Form.create({ fieldNameProp: null })(AddressModal);

function Address(props) {
  const { edit, visible } = props;
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
        children: <AddressModal1 {...props} modal={modal.current} />,
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

export default connect(({ global }) => ({ addressPermission: global.addressPermission }))(Address);
