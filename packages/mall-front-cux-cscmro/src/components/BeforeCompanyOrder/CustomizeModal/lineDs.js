import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getSanctionNumber } from '../../../functions/index.js';

export default function lineDs() {
  return {
    fields: [
      {
        name: 'attributeVarchar11',
        label: intl.get('mallf.common.view.juecai.num').d('决裁号'),
        defaultValue: 'NA',
        computedProps: {
          required: ({ record }) => {
            return !record.get('attributeVarchar30') && record.get('attributeVarchar20') !== '1';
          },
        },
      },
      {
        name: 'attributeVarchar12Lov',
        type: 'object',
        label: intl.get('mallf.common.view.juecai.num').d('决裁号'),
        lovCode: 'SCUX_CSCMRO_JUECAI_DATA_VIEW',
        disabled: !!getSanctionNumber(),
        optionsProps: (dsProps) => {
          const queryFields =
            dsProps?.queryFields?.map((q) => {
              const newQ = { ...q };
              if (q.name === 'judgeAmountFlag') {
                newQ.defaultValue = '1';
              }
              if (q.name === 'cutOffDateFrom') {
                newQ.defaultValue = moment(new Date()).format(DEFAULT_DATE_FORMAT);
              }
              return newQ;
            }) || [];
          return {
            ...dsProps,
            queryFields,
          };
        },
        computedProps: {
          required: ({ record }) => {
            return !!record.get('attributeVarchar30') || record.get('attributeVarchar20') === '1';
          },
          lovPara: ({ record }) => ({
            ouCode: record.get('ouCode'),
          }),
        },
        validator: (value, name, record) => {
          // 校验器 自定义校验规则对内容进行校验
          if (
            (!!record.get('attributeVarchar30') && value) ||
            (!record.get('attributeVarchar30') && record.get('attributeVarchar20') !== '1')
          ) {
            return true;
          } else if (!value) {
            return false;
          } else if (record.get('preCurrencyCode') !== record.get('currencyCode')) {
            return `商品【${record.get('productName')}】决裁号${record.get(
              'attributeVarchar12'
            )}的币种信息不一致，请重新选择`;
          } else if (record.get('residueOccupyAmount') <= 0) {
            return `商品【${record.get('productName')}】决裁号${record.get(
              'attributeVarchar12'
            )}的可用金额不足，请重新选择`;
          }
          return true;
        },
      },
      {
        name: 'attributeVarchar12',
        bind: 'attributeVarchar12Lov.sanctionNo',
      },
      {
        name: 'preCurrencyCode',
        bind: 'attributeVarchar12Lov.currencyCode',
      },
      {
        name: 'residueOccupyAmount',
        bind: 'attributeVarchar12Lov.residueOccupyAmount',
      },
      {
        name: 'attributeVarchar1',
        label: intl.get('mallf.common.view.supplier.remark').d('供应商备注'),
      },
      {
        name: 'attributeDate1',
        label: intl.get('mallf.myMall.model.requestDate').d('需求日期'),
        min: moment(new Date()).format(DEFAULT_DATE_FORMAT),
      },
    ],
  };
}
