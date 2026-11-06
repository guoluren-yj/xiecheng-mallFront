import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import { EMAIL, PHONE, NOT_CHINA_PHONE, FIXEDPHONE, ZIP } from 'utils/regExp';
import { getUserConfigInfo, getCacheAddress, removeCookie } from 'utils/utils';
import CuxFn from '@/cuxTools/cuxFn';

// 移除缓存地址
const { userId, unitId } = getUserConfigInfo();
const removeCacheAddress = (data) => {
  const cacheAddress = getCacheAddress();
  if (cacheAddress.addressId === data.addressId) {
    removeCookie(`${unitId}${userId}AddressInfo`);
  }
};

const tableDataSet = (props) => ({
  selection: props.comOrPerson ? 'multiple' : false,
  pageSize: 11,
  cacheSelection: true,
  primaryKey: 'addressId',
  record: {
    dynamicProps: {
      selectable: (record) => record.get('belongType') !== 1,
    },
  },
  fields: [
    {
      name: 'contactName',
      label: intl.get(`mallf.addressManage.view.contact`).d('联系人'),
    },
    {
      name: 'mobile',
      label: intl.get(`mallf.addressManage.view.phone`).d('手机'),
    },
    {
      name: 'phone',
      label: intl.get(`mallf.common.view.fixedPhone`).d('固定电话'),
    },
    {
      name: 'email',
      label: intl.get(`mallf.addressManage.view.email`).d('邮箱'),
    },
    {
      name: 'regionNameList',
      label: intl.get(`mallf.addressManage.model.regionNameList`).d('地址区域'),
    },
    {
      name: 'address',
      label: intl.get(`mallf.addressManage.model.addressDetail`).d('详细地址'),
    },
    {
      name: 'belongTypeMeaning',
      label: intl.get(`mallf.addressManage.model.type`).d('类型'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'uniqueCode',
      label: intl.get('mallf.addressManage.model.addressCode').d('地址编码'),
    },
  ],
  events: {
    load: () => {
      document.querySelector('body').scrollTop = 0;
    },
  },
  transport: {
    read({ data }) {
      return {
        url: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${props.organizationId}/addresss/list-receive`,
        method: 'GET',
        data: data.params,
      };
    },
    destroy: ({ data, dataSet }) => {
      dataSet.clearCachedSelected();
      dataSet.unSelectAll();
      return {
        url: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${props.organizationId}/addresss/delete-personal-address`,
        method: 'POST',
        data: data[0],
        transformResponse: () => {
          removeCacheAddress(data[0]);
        },
      };
    },
  },
});

const optionDataSet = () => ({
  transport: {
    read({ data: { parentRegionCode, countryId } }) {
      const { organizationId } = getUserConfigInfo();
      return {
        url: !parentRegionCode
          ? `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/mall-regions/${organizationId}/country-list-by-config`
          : `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/mall-regions/${organizationId}/Subordinate?page=-1&countryId=${countryId}`,
        method: 'GET',
        // eslint-disable-next-line eqeqeq
        data: { regionCode: parentRegionCode != countryId ? parentRegionCode : null },
        transformResponse: (res) => {
          const resp = JSON.parse(res);
          const { content } = resp;
          const getRegionCodeMap = (value) => {
            return [
              {
                condition: value.virtualFlag || value.isNAFlag,
                result: `${value.regionCode}1`, // 处理暂不选择的regionCode为更低层级 渲染
              },
              {
                condition: !parentRegionCode,
                result: value.countryId,
              },
              {
                condition: parentRegionCode,
                result: value.regionCode,
              },
            ].find((c) => c.condition).result;
          };
          const getParentRegionCodeMap = (value) => {
            return [
              {
                condition: value.virtualFlag || value.isNAFlag,
                result: parentRegionCode, // 处理暂不选择的parentRegionCode为同层级
              },
              {
                condition: !parentRegionCode,
                result: '',
              },
              {
                condition: parentRegionCode,
                result: value.parentRegionCode || value.countryId,
              },
            ].find((c) => c.condition).result;
          };
          const newNationRes = content.map((val) => {
            const value = val;
            if (parentRegionCode && val?.regionIdList?.length >= 2) {
              // 针对N/A处理为暂不选择虚拟字段
              value.isNAFlag = true;
              value.regionName = intl
                .get('mallf.common.view.address.NANotSelectTmep')
                .d('暂不选择');
            }
            return {
              ...value,
              countryFlag: !parentRegionCode, // 是否为countryList 请求出的数据
              countryId: value.countryId,
              countryName: value.countryName,
              regionName: parentRegionCode ? value.regionName : value.countryName, // 国家地区数据没有regionName
              regionId: parentRegionCode ? value.regionId : value.countryId,
              regionCode: getRegionCodeMap(value),
              parentRegionCode: getParentRegionCodeMap(value),
              oldParentRegionCode: parentRegionCode
                ? value.parentRegionCode || value.countryId
                : '', // 保存真实的parentRegionCode
              oldRegionCode: parentRegionCode ? value.regionCode : value.countryId,
              _token: value._token,
            };
          });
          return newNationRes;
        },
      };
    },
  },
  autoQuery: true,
  parentField: 'parentRegionCode',
  idField: 'regionCode',
  fields: [
    { name: 'regionId', type: 'string' },
    { name: 'regionName', type: 'string' },
    { name: 'regionCode', type: 'string' },
    { name: 'expand', type: 'boolean' },
    { name: 'parentRegionCode', type: 'string' },
  ],
});

const formDataSet = ({ optionsDs, linkDisabled, regionDisabled }) => ({
  autoQuery: false,
  fields: [
    {
      name: 'userIdLov',
      type: 'object',
      label: intl.get(`mallf.common.view.contact.user`).d('联系人账户'),
      lovCode: 'SMAL.QUERY_USER',
      valueField: 'id',
      textField: 'loginName',
      ignore: 'always',
    },
    {
      name: 'userId',
      bind: 'userIdLov.id',
    },
    {
      name: 'loginName',
      bind: 'userIdLov.loginName',
    },
    {
      name: linkDisabled ? 'contactNameLov' : 'contactName',
      label: intl.get(`mallf.common.view.contact`).d('联系人'),
      computedProps: {
        disabled: ({ record }) => {
          return !linkDisabled && !!record.get('loginName');
        },
        type: () => {
          return linkDisabled ? 'object' : 'string';
        },
        lovCode: () => {
          return linkDisabled ? 'SMAL.CHOOSE_ADDRESS_USER_INFO' : '';
        },
      },
      required: true,
    },
    {
      name: 'internationalTelCode',
      label: intl.get('mallf.common.view.internationalTelCode').d('区号'),
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      required: true,
      disabled: linkDisabled,
    },
    {
      name: 'editFlag',
      defaultValue: 0,
    },
    {
      name: 'mobile',
      label: intl.get('hzero.common.phone').d('手机'),
      computedProps: {
        pattern: ({ record }) => {
          return record.get('editFlag') !== 1
            ? null
            : record.get('internationalTelCode') === '+86'
            ? PHONE
            : NOT_CHINA_PHONE;
        },
      },
      required: true,
      disabled: linkDisabled,
    },
    {
      name: 'phone',
      label: intl.get(`mallf.common.view.fixedPhone`).d('固定电话'),
      disabled: linkDisabled,
      computedProps: {
        pattern: ({ record }) => {
          return linkDisabled || !record.get('phoneEditFlag') ? null : FIXEDPHONE;
        },
      },
    },
    {
      name: 'email',
      label: intl.get(`mallf.common.view.email`).d('邮箱'),
      disabled: linkDisabled,
      computedProps: {
        pattern: ({ record, name }) => {
          // 新值
          const value = record.get(name);
          // 初始值
          const pristineValue = record.getPristineValue(name);
          return value !== pristineValue ? EMAIL : null;
        },
      },
    },
    {
      name: 'emailEditFlag',
      transformRequest: (value, record) => (record.getField('email').isDirty() ? 1 : 0),
    },
    {
      name: 'region',
      type: 'object',
      label: intl.get(`mallf.common.model.regionArea`).d('地址区域'),
      textField: 'regionName',
      valueField: 'regionCode',
      required: true,
      options: optionsDs,
      disabled: regionDisabled,
      computedProps: {
        defaultValue: ({ record }) => {
          return (record.get('regionNameList') || []).join('/');
        },
      },
      validator: (value, name, record) => {
        const isNAFlag = record.get('regionIdList')?.length >= 4 && value?.slice()?.length > 1; // 新建的地址为isNAFlag，编辑的是有regionIdList > 4
        const isNormalFlag = value?.slice()?.length >= 4;
        if (isNAFlag || isNormalFlag || regionDisabled) {
          return true;
        } else {
          return intl.get('mallf.common.view.errorAddress').d('地区不完整');
        }
      },
    },
    {
      name: regionDisabled ? 'addressLov' : 'address',
      label: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
      required: true,
      lovPara: {
        companyId: getUserConfigInfo()?.companyId,
      },
      computedProps: {
        type: () => {
          return regionDisabled ? 'object' : 'string';
        },
        lovCode: () => {
          return regionDisabled ? 'SMAL.CHOOSE_ADDRESS_INFO' : '';
        },
        textField: () => {
          return regionDisabled ? 'address' : '';
        },
        valueField: () => {
          return regionDisabled ? 'address' : '';
        },
        defaultValue: ({ record }) => {
          return regionDisabled ? { address: record.get('address') } : record.get('address');
        },
      },
    },
    {
      name: 'zip',
      label: intl.get(`mallf.common.view.zip`).d('邮编'),
      pattern: ZIP,
    },
    {
      name: 'remark',
      label: intl.get('mallf.common.model.remark').d('备注'),
    },
    {
      name: 'defaultFlag',
      label: intl.get(`mallf.common.model.setDefault`).d('设为默认'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],
  events: {
    update: ({ record, name }) => {
      if (name === 'userIdLov') {
        const data = record.get('userIdLov') || {};
        if (!isEmpty(data)) {
          record.set('contactName', data?.realName);
          record.init('mobile', data.phone);
          record.init('email', data.email);
          record.set('editFlag', 0);
        } else {
          record.set('editFlag', 1);
        }
      }
      // 联系人不可编辑
      if (name === 'contactNameLov') {
        const data = record.get('contactNameLov') || {};
        record.set('contactName', data.contactName);
        record.init('mobile', data.mobile);
        record.init('phone', data.phone);
        record.init('email', data.email);
        record.init('internationalTelCode', data.internationalTelCode || '+86');
        record.set('quoteAddressId', data.addressId);
      }
      // 地区不可编辑
      if (name === 'addressLov') {
        const data = record.get('addressLov') || {};
        record.set('regionIdList', data.regionIdList);
        record.init('regionNameList', data.regionNameList);
        record.set('address', data.address);
        record.set('region', (record.get('regionNameList') || []).join('/'));
        record.set('regionId', data.regionId);
      }
      // 手机号是否被编辑过
      if (name === 'mobile') {
        record.set('editFlag', 1);
      }
      // 座机号是否被编辑过
      if (name === 'phone' && record.get('addressId')) {
        record.set('phoneEditFlag', 1);
      }
      CuxFn({
        name: 'address-modal-update-form',
        value: { name, record, optionsDs },
      })();
    },
  },
});

export { tableDataSet, optionDataSet, formDataSet, removeCacheAddress };
