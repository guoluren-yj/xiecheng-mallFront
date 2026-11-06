/* eslint-disable no-case-declarations */
import React from 'react';
import {
  TextField,
  NumberField,
  Select,
  Lov,
  DatePicker,
  Switch,
  TextArea,
  Attachment,
  Button,
} from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';

import { getUserConfigInfo, getPrecision, getProductLimit, calcValidatePack } from 'utils/utils';
import { accept, DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import CuxFn from 'cuxTools/cuxFn';

// 值集获取维度目标入参
export function handleGetDimensionParams({ componentType, lovView, record, dimensionCode }) {
  if (componentType === 'LOV') {
    const { valueField } = lovView || {};
    const lovData = record?.get(`${dimensionCode}Lov`) || {};
    return lovData[valueField];
  }
  return record?.get(dimensionCode);
}

// 处理lov查询参数
export function handleQueryParams({
  dimensionParameterList,
  dimensionList,
  dimensionType,
  record,
  headerDs,
}) {
  const queryParams = {};
  (dimensionParameterList || []).forEach((para) => {
    const { parameterType, parameterKey, parameterValue, parameterDimensionId } = para;
    switch (parameterType) {
      // 固定值
      case 'FIXED':
        queryParams[parameterKey] = parameterValue;
        break;
      // 上下文
      case 'CONTEXT':
        queryParams[parameterKey] = getUserConfigInfo()?.[parameterValue];
        break;
      // 维度
      case 'DIMENSION':
        const {
          dimension: { dimensionCode, dimensionType: ParamDimensionType },
          dimensionComponent: { componentType, lovView },
        } = dimensionList.find((n) => n.dimension?.dimensionId === parameterDimensionId) || {
          dimension: {},
          dimensionComponent: {},
        };
        // 头取头、行取行
        if (
          dimensionType.startsWith('HEAD') ||
          (dimensionType.startsWith('LINE') && ParamDimensionType?.startsWith('LINE'))
        ) {
          queryParams[parameterKey] = handleGetDimensionParams({
            componentType,
            lovView,
            record,
            dimensionCode,
          });
        } else if (ParamDimensionType?.startsWith('HEAD')) {
          // 行取头
          queryParams[parameterKey] = handleGetDimensionParams({
            componentType,
            lovView,
            record: headerDs.current || headerDs || {},
            dimensionCode,
          });
        }
        break;
      // 商品来源
      case 'PRODUCT':
        const currentRecord = dimensionType.startsWith('HEAD') ? record.lineDs.get(0) : record;
        const product = currentRecord?.get('batchProductList')?.[0] || {};
        queryParams[parameterKey] = product[parameterValue];
        break;
      default:
        break;
    }
  });
  return queryParams;
}

// 可编辑组件
export function getComponent(type, extra) {
  let Component = null;
  switch (type) {
    case 'INPUT':
      Component = (prop) => {
        return <TextField {...prop} />;
      };
      break;
    case 'INPUT_NUMBER':
      Component = (prop) => <NumberField {...prop} />;
      break;
    case 'SELECT':
      Component = (prop) => <Select {...prop} />;
      break;
    case 'LOV':
      Component = (prop) => <Lov noCache {...prop} />;
      break;
    case 'DATE_PICKER':
      Component = (prop) => <DatePicker {...prop} />;
      break;
    case 'SWITCH':
      Component = (prop) => (
        <>
          <span>{prop.label}</span>
          <Switch {...prop} style={{ width: 50 }} showHelp="newLine" />
        </>
      );
      break;
    case 'TEXT_AREA':
      Component = (prop) => <TextArea {...prop} rows={1} resize="both" showHelp="newLine" />;
      break;
    case 'UPLOAD':
      Component = (prop) => {
        const maxSize = '5M';
        const attProps = {
          sortable: true,
          bucketName: 'private-bucket',
          bucketDirectory: 'mall-front',
          viewMode: 'list',
          style: { paddingLeft: 0 },
          accept,
          fileSize: 1024 * 1024 * 5,
          showValidation: 'newLine',
          ...prop,
          help: (
            <div>
              <div r-if={prop.help}>{prop.help}</div>
              <div>
                {intl
                  .get('mallf.common.view.attProps.help', { accept, maxSize })
                  .d(`支持${accept.join(',')}格式，且不能大于${maxSize}`)}
              </div>
            </div>
          ),
          showHelp: 'newLine',
        };
        return (
          <>
            <Attachment {...attProps} />
          </>
        );
      };
      break;
    default:
      Component = (prop) => <TextField {...prop} />;
  }
  return (options) => Component(options, extra);
}

export const getColumns = ({ ds, lineDisplayDimension, alloctionDs }) => {
  const lineColumns = lineDisplayDimension.map((item) => {
    const { dimension, dimensionComponent } = item;
    const { dimensionCode, editFlag, width, annotation } = dimension;
    const { componentType } = dimensionComponent;
    // const {
    //   [`${dimensionCode}fxDisplayFlag`]: fxDisplayFlag,
    //   [`${dimensionCode}fxEditFlag`]: fxEditFlag,
    // } = ds?.toData()?.[0] || {};
    const {
      [`${dimensionCode}fxDisplayFlag`]: fxDisplayFlag,
      [`${dimensionCode}fxEditFlag`]: fxEditFlag,
    } = ds.current.get([`${dimensionCode}fxDisplayFlag`, `${dimensionCode}fxEditFlag`]) || {};
    const newEditFlag = [1, 0].includes(fxEditFlag) ? !!fxEditFlag : !!editFlag;
    if (fxDisplayFlag === 0) {
      return null;
    }
    if (['budgetBalance', 'quantity', 'taxIncludedAmount'].includes(dimensionCode)) {
      return null;
    }
    // 批量手工申请行上不展示单价、商品名称
    if (['taxIncludedPrice', 'goodsName'].includes(dimensionCode) && alloctionDs.hasManulFlag) {
      return null;
    }
    if (componentType === 'SWITCH') {
      return {
        name: dimensionCode,
        width: width || 120,
        help: annotation,
        editor: () => {
          return newEditFlag && <Switch />;
        },
      };
    }
    if (componentType === 'TEXT_AREA') {
      return {
        name: dimensionCode,
        width: width || 120,
        help: annotation,
        editor: () => {
          return newEditFlag && <TextArea rows={1} />;
        },
      };
    }
    return {
      name: componentType === 'LOV' ? `${dimensionCode}Lov` : dimensionCode,
      width: width || 120,
      help: annotation,
      editor: () => {
        return newEditFlag;
      },
    };
  });
  const columns = [
    {
      name: 'orderSeq',
      width: 60,
      renderer: ({ record }) => record.index + 1,
    },
    ...lineColumns,
    {
      name: 'action',
      width: 100,
      renderer: ({ record, dataSet }) => {
        return (
          <Button
            disabled={dataSet.length === 1}
            funcType="link"
            color="primary"
            onClick={() => dataSet.remove(record, true)}
          >
            {intl.get('hzero.common.btn.delete').d('删除')}
          </Button>
        );
      },
    },
  ];
  return columns.filter((n) => !!n);
};

export function renderField(props) {
  const { fieldList = [], dimensionList = [], headerDs, fieldType, hasManulFlag } = props;
  // const defaultUomPrec = uomPrecision ? getPrecision(uomPrecision) : 1;
  let fields = [];
  if (fieldType === 'line') {
    const lineFields = [
      {
        name: 'orderSeq',
        label: intl.get(`mallf.common.view.orderSeq`).d('序号'),
      },
      {
        name: 'action',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ];
    fields = lineFields;
  }
  // 数量字段额外处理
  fieldList
    .filter(
      (n) =>
        n.dimension.dimensionCode !== 'quantity' &&
        (n.dimension.batchFlag === 1 || isNil(n.dimension.batchFlag))
    )
    .forEach((item) => {
      const { dimension, dimensionComponent, dimensionParameterList } = item;
      const {
        dimensionCode,
        dimensionName,
        dimensionType,
        necessaryFlag,
        editFlag,
        treeSelectFlag,
        displayFlag,
        minLength,
        maxLength,
      } = dimension;
      const {
        componentType,
        lovCode,
        lovView,
        defaultValue,
        defaultValueMeaning,
      } = dimensionComponent;
      const { displayField, valueField } = lovView || {};
      const lovOrSel =
        componentType === 'LOV'
          ? { lovCode }
          : componentType === 'SELECT'
          ? { lookupCode: lovCode }
          : {};
      let lovFieldBind =
        componentType === 'LOV' && dimensionType === 'HEADER_FIXED'
          ? [
              {
                name: valueField,
                bind: `${dimensionCode}Lov.${valueField}`,
              },
              {
                name: displayField,
                bind: `${dimensionCode}Lov.${displayField}`,
              },
            ]
          : componentType === 'SELECT'
          ? [{ name: `${dimensionCode}Name` }]
          : [];
      if (dimensionCode === 'unitId') {
        lovFieldBind = [
          { name: 'unitId', bind: 'unitIdLov.unitId' },
          { name: 'unitName', bind: 'unitIdLov.unitName' },
        ];
      }
      const lovFieldProps =
        componentType === 'LOV'
          ? {
              valueField,
              textField: displayField,
            }
          : {};
      let newType = '';
      let otherProps = {};
      switch (componentType) {
        case 'INPUT':
        case 'TEXT_AREA':
          newType = 'string';
          otherProps = {
            minLength,
            maxLength,
          };
          break;
        case 'INPUT_NUMBER':
          newType = 'number';
          break;
        case 'LOV':
          newType = 'object';
          break;
        case 'DATE_PICKER':
          newType = 'date';
          otherProps = {
            format: DEFAULT_DATE_FORMAT,
          };
          break;
        case 'SWITCH':
          newType = 'boolean';
          otherProps = {
            trueValue: '1',
            falseValue: '0',
            label: dimensionType.startsWith('LINE') && dimensionName,
          };
          break;
        case 'UPLOAD':
          newType = 'attachment';
          otherProps = {
            bucketName: 'private-bucket',
            bucketDirectory: 'mall-front',
            fileSize:
              hasManulFlag && fieldType === 'line' && dimensionCode === 'attachmentUuid'
                ? 1024 * 1024 * 100
                : 1024 * 1024 * 5,
          };
          break;
        default:
          newType = 'string';
      }
      fields.push(
        dimensionCode !== 'unitId'
          ? {
              name: componentType === 'LOV' ? `${dimensionCode}Lov` : dimensionCode,
              bind: dimension.fieldBinding || null,
              label: dimensionName,
              ...lovFieldProps,
              type: newType,
              ...lovOrSel,
              ...otherProps,
              visibled: displayFlag,
              optionsProps: (dsProps) => {
                return {
                  ...dsProps,
                  childrenField: 'children',
                  paging: componentType === 'LOV' ? 'server' : 'false', // server为支持树型lov 不能影响下拉框的不分页
                  record: {
                    dynamicProps: {
                      disabled: (record) => treeSelectFlag && +record?.get('hasChild'),
                    },
                  },
                  events: {
                    loadFailed: ({ dataSet: ds }) => {
                      ds.loadData([]);
                    },
                  },
                };
              },
              computedProps: {
                defaultValue: ({ record }) => {
                  const fxDefaultValue = record?.get(`${dimensionCode}fxDefaultValue`);
                  const defaultVal =
                    fxDefaultValue ||
                    (componentType === 'LOV'
                      ? defaultValue
                        ? {
                            [valueField]: defaultValue,
                            [displayField]: defaultValueMeaning,
                          }
                        : null
                      : defaultValue);
                  return defaultVal;
                },
                required: ({ record }) => {
                  const fxNecessaryFlag = record?.get(`${dimensionCode}fxNecessaryFlag`);
                  return ![1, 0].includes(fxNecessaryFlag) ? !!necessaryFlag : !!fxNecessaryFlag;
                },
                lovPara: ({ record }) => {
                  return handleQueryParams({
                    dimensionParameterList,
                    dimensionList,
                    dimensionType,
                    record,
                    headerDs,
                  });
                },
                disabled: ({ record }) => {
                  if (
                    ['invOrganizationId', 'ouId', 'purOrganizationId'].includes(dimensionCode) &&
                    !record.get('unitId')
                  ) {
                    // 无采买组织则禁用
                    return true;
                  } else {
                    const queryParams = handleQueryParams({
                      dimensionParameterList,
                      dimensionList,
                      dimensionType,
                      record,
                      headerDs,
                    });
                    const fxEditFlag = record.get(`${dimensionCode}fxEditFlag`);
                    const realEditFlag = ![1, 0].includes(fxEditFlag) ? !!editFlag : !!fxEditFlag;
                    // 如果存在其他维度作为参数，且有参数维度为空，则不允许编辑
                    return (
                      (!isEmpty(dimensionParameterList) &&
                        Object.values(queryParams).some((n) => !n)) ||
                      !realEditFlag
                    );
                  }
                },
              },
            }
          : {
              name: 'unitIdLov',
              label: dimensionName,
              type: 'object',
              textField: 'unitName',
              valueField: 'unitId',
              lovCode: 'SMCT.UNIT_INFO',
              visibled: displayFlag,
              required: !!(editFlag && necessaryFlag),
              lovPara: { amendFlag: true },
            },
        ...lovFieldBind,
        { name: `${dimensionCode}fxDisplayFlag` },
        { name: `${dimensionCode}fxEditFlag` },
        { name: `${dimensionCode}fxNecessaryFlag` },
        { name: `${dimensionCode}fxBudgetFlag` }
      );
    });
  return fields;
}

// 获取精度 手工 单位批量-则只取行单位值集带出 不批量只取自带精度
const getUomPrecision = ({ record, partentRecord, manulUomIdBatchFlag, hasManulFlag }) =>
  (hasManulFlag
    ? manulUomIdBatchFlag
      ? partentRecord.get('uomPrecision')
      : record.get('uomPrecision')
    : partentRecord.get('uomPrecision') || record.get('uomPrecision')) || 0;

export const childTableDataset = ({
  partentRecord,
  hasManulFlag,
  manulUomIdBatchFlag,
  hasAssignFlag,
}) => {
  return {
    selection: false,
    paging: false,
    forceValidate: true,
    fields: [
      {
        name: 'productName',
        required: true,
        label: intl.get(`mallf.common.view.batchAlloction.goodsName`).d('物资名称'),
      },
      {
        name: 'productInfo',
        // label: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
        label: CuxFn({
          name: 'BatchAllocation-fn-getProductInformationLabel',
          value: { hasAssignFlag },
        })(() => intl.get(`mallf.common.view.productInformation`).d('商品信息'))(),
      },
      {
        name: 'taxIncludedPrice',
        required: hasManulFlag,
        label: intl.get(`mallf.common.model.unitPrice`).d('单价(含税)'),
      },
      {
        name: 'quantity',
        label: intl.get(`mallf.common.model.companyOrder.count`).d('数量'),
        type: 'number',
        required: true,
        visibled: true,
        nonStrictStep: true,
        validator: (val, name, record) => {
          const uomPrecision = +getUomPrecision({
            record,
            partentRecord,
            manulUomIdBatchFlag,
            hasManulFlag,
          });
          const minPackageQuantity = record.get('minPackageQuantity');
          if (
            val &&
            calcValidatePack(uomPrecision, minPackageQuantity) &&
            val % (minPackageQuantity || 1) !== 0
          ) {
            return `${intl
              .get('mallf.common.view.errorMinPackageQuantity')
              .d('最小包装量为')}${minPackageQuantity}`;
          }
          return undefined;
        },
        computedProps: {
          precision: ({ record }) => {
            return +getUomPrecision({ record, partentRecord, manulUomIdBatchFlag, hasManulFlag });
          },
          step: ({ record }) => {
            return +record.get('minPackageQuantity') || 1;
          },
          // mall-8739 放开单位数量可编辑
          // disabled: () => {
          //   // 手工且单位批量且无单位 数量不可编辑
          //   return manulUomIdBatchFlag && !partentRecord.get('uomIdLov');
          // },
        },
        dynamicProps({ record }) {
          const {
            minPurchaseQuantity,
            purchaseQuantityLimit,
            taxIncludedPrice,
            productSource,
            ladderPriceList,
            minPackageQuantity,
            centralizedTemplateId,
          } =
            record?.get([
              'minPurchaseQuantity',
              'purchaseQuantityLimit',
              'taxIncludedPrice',
              'productSource',
              'ladderPriceList',
              'minPackageQuantity',
              'centralizedTemplateId',
            ]) || {};
          const uomPrecision =
            record?.get('uomPrecision') || partentRecord?.get('uomPrecision') || 0;
          const defaultUomPrec = uomPrecision ? getPrecision(uomPrecision) : 1;
          let minLimit = minPurchaseQuantity;
          let maxLimit = purchaseQuantityLimit;
          [minLimit, maxLimit] = getProductLimit({
            sourceFrom: productSource,
            minPurchaseQuantity,
            purchaseQuantityLimit,
            price: taxIncludedPrice,
            ladderPriceLimit: ladderPriceList,
          });
          const min = centralizedTemplateId // 拼单商品 最小为包装量
            ? calcValidatePack(defaultUomPrec, minPackageQuantity)
              ? minPackageQuantity
              : defaultUomPrec
            : hasManulFlag
            ? defaultUomPrec
            : minLimit || defaultUomPrec;
          return {
            min,
            max: maxLimit,
          };
        },
      },
      {
        name: 'totalPrice',
        label: intl.get(`mallf.common.view.all.money`).d('金额'),
      },
      {
        name: 'action',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
  };
};
