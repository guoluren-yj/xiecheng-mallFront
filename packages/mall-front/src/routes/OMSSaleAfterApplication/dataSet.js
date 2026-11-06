import moment from 'moment';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { serviceName } from 'utils/api-config';
import { getCurrentOrganizationId, getPrecision } from 'utils/utils';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { getDoubleUomFlag, hasDoubleUomFlag } from 'utils/configUtils';
import { numberChange } from 'utils/precision';

export const optionds = () => ({
  transport: {
    read({ data: { parentRegionCode, countryId } }) {
      return {
        url: !parentRegionCode
          ? `/${serviceName}/v1/mall-regions/${getCurrentOrganizationId()}/country-list-by-config`
          : `/${serviceName}/v1/mall-regions/${getCurrentOrganizationId()}/Subordinate?page=-1&countryId=${countryId}`,
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
  autoCreate: true,
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

export function formds({ optionDs }) {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'serviceType',
        label: intl.get(`mallf.saleAppli.view.serviceType`).d('服务类型'),
        required: true,
      },
      {
        name: 'applyPackageQuantity',
        required: true,
        label: intl.get(`mallf.saleAppli.view.numSubmission`).d('提交数量'),
        computedProps: {
          label: ({ record }) => {
            const { giftFlag } = record.get(['giftFlag']);
            return giftFlag
              ? intl.get(`mallf.saleAppli.view.numMainSubmission`).d('提交主商品数量')
              : intl.get(`mallf.saleAppli.view.numSubmission`).d('提交数量');
          },
          min: ({ record }) => {
            const { uomId, customUomId, customQuantity, customFlag } = record.get([
              'uomId',
              'customUomId',
              'customQuantity',
              'customFlag',
            ]);
            const flag =
              hasDoubleUomFlag({ uomId, customUomId, customQuantity }) && +customFlag !== 1;
            return flag ? 0 : getPrecision(record.get('customUomPrecision'));
          },
          max: ({ record }) => (getDoubleUomFlag() ? record.get('salePackageNum') : null),
        },
      },
      {
        name: 'applyQuantity',
        required: true,
        label: getDoubleUomFlag()
          ? intl.get(`mallf.saleAppli.view.applyQuantity`).d('提交基本数量')
          : intl.get(`mallf.saleAppli.view.numSubmission`).d('提交数量'),
        computedProps: {
          label: ({ record }) => {
            const { uomId, customUomId, customQuantity, giftFlag } = record.get([
              'uomId',
              'customUomId',
              'customQuantity',
              'giftFlag',
            ]);
            const flag = hasDoubleUomFlag({ uomId, customUomId, customQuantity });
            if (giftFlag) {
              return flag
                ? intl.get(`mallf.saleAppli.view.applyMainQuantity`).d('提交主商品基本数量')
                : intl.get(`mallf.saleAppli.view.numMainSubmission`).d('提交主商品数量');
            }
            return flag
              ? intl.get(`mallf.saleAppli.view.applyQuantity`).d('提交基本数量')
              : intl.get(`mallf.saleAppli.view.numSubmission`).d('提交数量');
          },
          disabled: ({ record }) => getDoubleUomFlag() && +record.get('customFlag') === 1,
          min: ({ record }) => getPrecision(record.get('uomPrecision')),
          max: ({ record }) => record.get('saleNum'),
        },
      },
      {
        name: 'returnReasonCode',
        label: intl.get(`mallf.saleAppli.view.saleAfterReason`).d('售后原因'),
        lookupCode: 'S2FUL.RETURN_REASON',
        computedProps: {
          required: ({ record }) => record.get('serviceType') === 'RETURN',
        },
      },
      {
        name: 'pickInternationalTelCode',
        label: intl.get(`mallf.saleAppli.view.internationalTelCode`).d('区号'),
        lookupCode: 'HPFM.IDD',
        required: true,
        defaultValue: '+86',
      },
      {
        name: 'customerInternationalTelCode',
        label: intl.get(`mallf.saleAppli.view.internationalTelCode`).d('区号'),
        lookupCode: 'HPFM.IDD',
        required: true,
        defaultValue: '+86',
      },
      {
        name: 'exchangeReasonCode',
        label: intl.get(`mallf.saleAppli.view.saleAfterReason`).d('售后原因'),
        lookupCode: 'S2FUL.EXCHANGE_REASON',
        computedProps: {
          required: ({ record }) => record.get('serviceType') === 'EXCHANGE',
        },
      },
      {
        name: 'problemDesc',
        required: true,
        label: intl.get(`mallf.saleAppli.view.problemDesc`).d('问题描述'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get('mallf.common.view.uploadPictures').d('上传图片'),
      },
      {
        name: 'pickWareType',
        label: intl.get(`mallf.saleAppli.view.pickMethod`).d('退件方式'),
      },
      {
        name: 'returnWareNeedValidate',
        defaultValue: 1,
      },
      {
        name: 'returnWareAddress',
        type: 'object',
        label: intl.get(`mallf.common.view.orderDetail.contactAddress`).d('联系人地址'),
        textField: 'regionName',
        valueField: 'regionCode',
        required: true,
        options: optionDs,
        computedProps: {
          defaultValue: ({ record }) => {
            return (record.get('customerRegionNameList') || []).join('/');
          },
        },
        validator: (value, _, record) => {
          if (!record.get('returnWareNeedValidate')) return true;
          const isNAFlag =
            record.get('returnWareRegionIdList')?.length > 3 && value?.slice()?.length > 1; // 新建的地址为isNAFlag
          const isNormalFlag = value?.slice()?.length >= 4;
          if (isNormalFlag || isNAFlag) {
            return true;
          } else {
            return intl.get('mallf.common.model.errorAddress').d('地区不完整');
          }
        },
      },
      {
        name: 'returnWareFullAddress',
        required: true,
        label: intl.get(`mallf.saleAppli.view.pickWareAddress`).d('详细地址'),
      },
      {
        name: 'customerContactName',
        required: true,
        label: intl.get(`mallf.orderDetail.view.contact`).d('联系人'),
      },
      {
        name: 'customerAddressId',
      },
      {
        name: 'customerMobilePhone',
        required: true,
        label: intl.get(`mallf.orderDetail.view.contactPhone`).d('联系电话'),
        computedProps: {
          pattern: ({ record }) => {
            return record.get('customerAddressId')
              ? null
              : record.get('customerInternationalTelCode') === '+86'
              ? PHONE
              : NOT_CHINA_PHONE;
          },
        },
      },
      {
        name: 'pickWareNeedValidate',
        defaultValue: 1,
      },
      {
        name: 'pickWareAddress',
        type: 'object',
        label: intl.get(`mallf.saleAppli.view.takeAddress`).d('取件地址'),
        textField: 'regionName',
        valueField: 'regionCode',
        options: optionDs,
        computedProps: {
          defaultValue: ({ record }) => {
            return (record.get('pickRegionNameList') || []).join('/');
          },
          required: ({ record }) => record.get('pickWareType') === 'PICK_UP',
        },
        validator: (value, _, record) => {
          if (!record.get('pickWareNeedValidate')) return true;
          const isNAFlag =
            record.get('pickWareRegionIdList')?.length > 3 && value?.slice()?.length > 1; // 新建的地址为isNAFlag
          const isNormalFlag = value?.slice()?.length >= 4;
          if (isNormalFlag || isNAFlag) {
            return true;
          } else if (record.get('pickWareType') === 'PICK_UP') {
            return intl.get('mallf.common.model.errorAddress').d('地区不完整');
          }
        },
      },
      {
        name: 'pickWareFullAddress',
        label: intl.get(`mallf.saleAppli.view.pickWareAddress`).d('详细地址'),
        computedProps: {
          required: ({ record }) => record.get('pickWareType') === 'PICK_UP',
        },
      },
      {
        name: 'pickContactName',
        required: true,
        label: intl.get(`mallf.orderDetail.view.contact`).d('联系人'),
        computedProps: {
          required: ({ record }) => record.get('pickWareType') === 'PICK_UP',
        },
      },
      {
        name: 'pickAddressId',
      },
      {
        name: 'pickMobilePhone',
        required: true,
        label: intl.get(`mallf.orderDetail.view.contactPhone`).d('联系电话'),
        computedProps: {
          pattern: ({ record }) => {
            return record.get('pickAddressId')
              ? null
              : record.get('pickInternationalTelCode') === '+86'
              ? PHONE
              : NOT_CHINA_PHONE;
          },
          required: ({ record }) => record.get('pickWareType') === 'PICK_UP',
        },
      },

      {
        name: 'reserveTime',
        required: true,
        range: ['reserveTimeBegin', 'reserveTimeEnd'],
        min: moment().format(DEFAULT_DATETIME_FORMAT),
        label: intl.get(`mallf.saleAppli.view.reserveTime`).d('预约取件时间'),
        computedProps: {
          required: ({ record }) => record.get('pickWareType') === 'PICK_UP',
        },
        validator: (value, _, record) => {
          if (value?.reserveTimeBegin && value?.reserveTimeBegin < moment().add(2, 'h')) {
            return intl
              .get(`mallf.saleAppli.view.appointRequiredToTwoHoursLater`)
              .d('预约取件开始时间要求在两小时之后！');
          }
          if (
            (!value?.reserveTimeBegin || !value?.reserveTimeEnd) &&
            record.get('pickWareType') === 'PICK_UP'
          ) {
            return intl
              .get('hzero.common.validation.notNull', {
                name: intl.get(`mallf.saleAppli.view.reserveTime`).d('预约取件时间'),
              })
              .d('预约取件时间不能为空');
          }
          return true;
        },
      },
      {
        name: 'reserveTimeBegin',
        type: 'date',
        bind: 'reserveTime.reserveTimeBegin',
      },
      {
        name: 'reserveTimeEnd',
        type: 'date',
        bind: 'reserveTime.reserveTimeEnd',
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        switch (name) {
          case 'pickInternationalTelCode':
            record.set('pickMobilePhone', null);
            break;
          case 'customerInternationalTelCode':
            record.set('customerMobilePhone', null);
            break;
          case 'pickMobilePhone':
            record.set('pickAddressId', null);
            break;
          case 'customerMobilePhone':
            record.set('customerAddressId', null);
            break;
          default:
            break;
        }
        if (name === 'applyQuantity' && !getDoubleUomFlag()) {
          record.set('applyPackageQuantity', value);
        }
        if (name === 'applyPackageQuantity' && +value !== 0 && getDoubleUomFlag()) {
          const customQuantity = +record.get('customQuantity');
          const quantity = math.multipliedBy(+value, customQuantity);
          const newQuantity = numberChange({
            value: quantity,
            name: 'applyQuantity',
            record,
            precision: +record.get('uomPrecision'),
          });
          record.set('applyQuantity', newQuantity);
        }
      },
    },
  };
}
