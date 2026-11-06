import { isEmpty } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import intl from 'utils/intl';
import { getPrecision, getToFixed } from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_MAX } from 'utils/constants';
import {
  handleAssociatField,
  handleQueryParams,
} from 'mall-front/lib/routes/CartProCopy/ProductAllocation/func';

const formDs = (props) => ({
  autoQuery: false,
  fields: renderField({ ...props, fieldType: 'header' }),
  events: {
    update({ record, name, value, oldValue, dataSet }) {
      const headerIndex = record.get('headerIndex');
      const { dimensionList, lineDsObj } = props;
      const { dimension = {}, dimensionComponent = {}, dimensionFieldRelationList = [] } =
        dimensionList.find((n) => name.includes(n.dimension.dimensionCode)) || {};
      // 动态默认值
      dimensionList
        .filter((n) => n.defaultCondition)
        .forEach((field) => {
          const { defaultCondition } = field;
          const { conditionHeader, conditionLineList, dimDefaultConditionList } = defaultCondition;
          const {
            dimension: { dimensionType, dimensionCode: code },
            dimensionComponent: {
              componentType: type,
              lovView = {},
              defaultValue,
              defaultValueMeaning,
            },
          } = dimensionList.find(
            (n) => conditionHeader.dimensionId === n.dimension.dimensionId
          ) || { dimension: {}, dimensionComponent: {} };
          const { valueField, displayField } = lovView || {};
          const conditionExpressionObj = handleConditionExpression({ conditionLineList });
          // 表达式是否包含改动的字段
          const includesExpressFieldFlag = conditionLineList.map(
            (n) =>
              // 过滤fx更新，避免污染
              (!name.includes('fx') && name.includes(n.dimensionCode)) ||
              name === 'ouIdfxDisplayFlag'
          );
          if (includesExpressFieldFlag.every((n) => !n)) return;
          const newDimDefaultConditionList = dimDefaultConditionList.map((dimDefault) => {
            const { conditionExpression } = dimDefault;
            return evalConditionExpression({
              conditionExpression,
              conditionLineList,
              conditionExpressionObj,
            });
          });
          // 找出第一个符合条件的表达式
          const firstIndex = newDimDefaultConditionList.findIndex((n) => !!n);
          const { value: fxDefaValue, valueName: fxDefaValueName } =
            dimDefaultConditionList[firstIndex] || {};
          let newValue;
          let newCode;
          // fx默认值优先级 > 默认值
          switch (type) {
            case 'LOV':
              newCode = `${code}Lov`;
              newValue =
                firstIndex >= 0 || defaultValue
                  ? {
                      [valueField]: fxDefaValue || defaultValue,
                      [displayField]: fxDefaValueName || defaultValueMeaning,
                    }
                  : null;
              break;
            default:
              newCode = code;
              newValue = firstIndex >= 0 || defaultValue ? fxDefaValue || defaultValue : null;
              break;
          }
          if (dimensionType.startsWith('LINE')) {
            lineDsObj[headerIndex].forEach((r) => {
              r.set(`${code}fxDefaultValue`, newValue);
              r.set(newCode, newValue);
            });
          } else {
            record.set(newCode, newValue);
          }
        });

      if (name.includes('Lov')) {
        const { dimensionId } = dimension;
        const { lovView } = dimensionComponent;
        const { valueField } = lovView || {};
        // lov实际上并没有发生改变(主键有可能没加密，所以要string一下)
        if (String(value?.[valueField]) === String(oldValue?.[valueField])) return;
        // 所有跟该字段有关联关系的字段集合
        const cascadeList =
          dimensionList.filter((n) =>
            n.dimensionParameterList?.some((p) => p.parameterDimensionId === dimensionId)
          ) || [];
        cascadeList.forEach((c) => {
          // 头关联头
          if (c.dimension.dimensionType.startsWith('HEAD')) {
            record.set(`${c.dimension?.dimensionCode}Lov`, null);
          } else {
            lineDsObj[headerIndex].forEach((lineReocrd) => {
              lineReocrd.set(`${c.dimension?.dimensionCode}Lov`, null);
            });
          }
        });
        // 值集关联字段
        if (!isEmpty(dimensionFieldRelationList)) {
          handleAssociatField({
            currentDimensiontype: dimension.dimensionType,
            dimensionList,
            record,
            dimensionFieldRelationList,
            currentData: value,
            lineDs: lineDsObj[headerIndex],
          });
        }
      }

      // 公司带出业务实体库存组织
      if (name === 'companyIdLov') {
        const { ouId, ouName, organizationId, organizationName, addressId, fullAddress } =
          value || {};
        record.set(
          'addressIdLov',
          addressId
            ? {
                addressId,
                fullAddress,
              }
            : null
        );
        record.set(
          'ouIdLov',
          ouId
            ? {
                ouId,
                ouName,
                organizationId,
                organizationName,
              }
            : null
        );
        // record.set(
        //   'invOrganizationIdLov',
        //   organizationId
        //     ? {
        //         organizationId,
        //         organizationName,
        //       }
        //     : null
        // );
        // return;
      }
      // 业务实体带出库存组织
      if (name === 'ouIdLov') {
        const { organizationId, organizationName } = value || {};
        record.set(
          'invOrganizationIdLov',
          organizationId
            ? {
                organizationId,
                organizationName,
              }
            : null
        );
        // return;
      }
      const { [`${dimension.dimensionCode}fxBudgetFlag`]: fxBudgetFlag } =
        dataSet.data?.[0]?.data || {};
      // 预算余额查询
      if ((dimension.budgetFlag === 1 || fxBudgetFlag === 1) && fxBudgetFlag !== 0) {
        props.fetchBudgetRemain(headerIndex);
      }

      // 处理条件判断
      function handleConditionExpression({ conditionLineList }) {
        const conditionExpressionObj = {};
        conditionLineList.forEach((line) => {
          const {
            conditionCode,
            dimensionId, // 当前维度id
            targetValue, // 目标字段值
            conditionExpression, // 条件表达式
            targetType, // 目标字段类型（维度/固定值）
            targetDimensionId, // 目标维度id
          } = line;
          // 找出当前维度
          const {
            dimension: { dimensionCode },
            dimensionComponent: { lovView = {} },
          } = dimensionList.find((n) => dimensionId === n.dimension.dimensionId) || {
            dimension: {},
            dimensionComponent: {},
          };
          const { valueField } = lovView || {};
          // 当前字段值
          const conditionValue =
            record.get(`${dimensionCode}Lov`)?.[valueField] || record.get(dimensionCode);
          let newTargetValue = targetValue;
          // 目标字段是维度类型
          if (targetType === 'DIMENSION') {
            const {
              dimension: { dimensionCode: targetDimensionCode },
            } = dimensionList.find((n) => targetDimensionId === n.dimension.dimensionId) || {
              dimension: {},
            };
            newTargetValue =
              record.get(`${targetDimensionCode}Lov`)?.[valueField] ||
              record.get(targetDimensionCode);
          }
          let conditionFlag;
          switch (conditionExpression) {
            // 等于
            case '=':
              // eslint-disable-next-line
              conditionFlag = conditionValue == newTargetValue;
              break;
            // 不等于
            case '<>':
              // eslint-disable-next-line
              conditionFlag = conditionValue != newTargetValue;
              break;
            // 空
            case 'ISNULL':
              conditionFlag = isEmpty(conditionValue);
              break;
            // 非空
            case 'NOTNULL':
              conditionFlag = !isEmpty(conditionValue);
              break;
            default:
              break;
          }
          conditionExpressionObj[conditionCode] = conditionFlag;
        });
        return conditionExpressionObj;
      }
      // 转换表达式为Boolean值
      function evalConditionExpression({
        conditionExpression,
        conditionLineList,
        conditionExpressionObj,
      }) {
        let newConditionExpression = conditionExpression.replace(/AND/g, '&&').replace(/OR/g, '||');
        conditionLineList.forEach((item) => {
          if (newConditionExpression.includes(item.conditionCode)) {
            newConditionExpression = newConditionExpression.replace(
              item.conditionCode,
              conditionExpressionObj[item.conditionCode]
            );
          }
        });
        // eslint-disable-next-line
        return eval(newConditionExpression);
      }

      dimensionList
        .filter((n) => n.conditionList)
        .forEach((field) => {
          const { conditionList } = field;
          conditionList.forEach((condition) => {
            const { conditionHeader, conditionLineList } = condition;
            const { conditionType, conditionExpression } = conditionHeader;
            const {
              dimension: { dimensionType, dimensionCode: code },
            } = dimensionList.find(
              (n) => conditionHeader.dimensionId === n.dimension.dimensionId
            ) || { dimension: {} };
            const conditionExpressionObj = handleConditionExpression({ conditionLineList });
            const flag = evalConditionExpression({
              conditionExpression,
              conditionLineList,
              conditionExpressionObj,
            });
            let propsName;
            switch (conditionType) {
              // 必输
              case 'NECESSARY':
                propsName = 'fxNecessaryFlag';
                break;
              // 编辑
              case 'EDIT':
                propsName = 'fxEditFlag';
                break;
              // 展示
              case 'DISPLAY':
                propsName = 'fxDisplayFlag';
                break;
              case 'BUDGET':
                propsName = 'fxBudgetFlag';
                break;
              default:
                break;
            }
            if (!propsName) return;
            if (dimensionType.startsWith('LINE')) {
              lineDsObj[headerIndex].forEach((r) => {
                r.set(`${code}${propsName}`, flag ? 1 : 0);
              });
            } else {
              record.set(`${code}${propsName}`, flag ? 1 : 0);
            }
          });
        });
    },
  },
});

export function renderField(props) {
  const { fieldList, dimensionList, headerDs, fieldType, bindFieldList = [] } = props;
  // const defaultUomPrec = uomPrecision ? getPrecision(uomPrecision) : 1;
  let fields = [];
  if (fieldType === 'line') {
    const lineFields = [
      {
        name: 'orderSeq',
        label: intl.get(`mallf.common.view.orderSeq`).d('序号'),
      },
      {
        name: 'totalQuantity',
      },
      {
        name: 'action',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ];
    fields = lineFields;
  }
  // 数量字段额外处理
  [...fieldList, ...bindFieldList]
    .filter((n) => n.dimension.dimensionCode !== 'quantity')
    .forEach((item) => {
      const { dimension, dimensionComponent, dimensionParameterList } = item;
      const { dimensionCode, dimensionName, dimensionType, necessaryFlag, editFlag } = dimension;
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
        componentType === 'LOV' && dimensionType.includes('FIXED')
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
          newType = 'string';
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
            fileSize: 1024 * 1024 * 5,
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
              // required: !!(editFlag && (fxNecessaryFlag || necessaryFlag)),
              type: newType,
              ...lovOrSel,
              ...otherProps,
              // defaultValue: defaultVal,
              computedProps: {
                defaultValue: ({ dataSet }) => {
                  const { [`${dimensionCode}fxDefaultValue`]: fxDefaultValue } =
                    dataSet.data?.[0]?.data || {};
                  const defaultVal =
                    componentType === 'LOV'
                      ? fxDefaultValue || defaultValue
                        ? {
                            [valueField]: defaultValue,
                            [displayField]: defaultValueMeaning,
                          }
                        : null
                      : fxDefaultValue || defaultValue;
                  return defaultVal;
                },
                required: ({ dataSet }) => {
                  const {
                    [`${dimensionCode}fxDisplayFlag`]: fxDisplayFlag,
                    [`${dimensionCode}fxEditFlag`]: fxEditFlag,
                    [`${dimensionCode}fxNecessaryFlag`]: fxNecessaryFlag,
                  } = dataSet.data?.[0]?.data || {};
                  const realEditFlag = ![1, 0].includes(fxEditFlag) ? !!editFlag : !!fxEditFlag;
                  return (
                    realEditFlag &&
                    fxDisplayFlag !== 0 &&
                    (![1, 0].includes(fxNecessaryFlag) ? !!necessaryFlag : !!fxNecessaryFlag)
                  );
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
                disabled: ({ record, dataSet }) => {
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
                    const { [`${dimensionCode}fxEditFlag`]: fxEditFlag } =
                      dataSet.data?.[0]?.data || {};
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

const tableDs = (props) => {
  return {
    primaryKey: 'orderSeq',
    autoQuery: false,
    paging: false,
    selection: false,
    expandField: 'expand',
    fields: renderField({ ...props, fieldType: 'line' }),
    events: {
      update({ name, dataSet, record: r, value, oldValue }) {
        const { dimensionList } = props;
        const { dimension, dimensionFieldRelationList } = dimensionList.find((n) =>
          name.includes(n.dimension.dimensionCode)
        ) || {
          dimension: {},
          dimensionComponent: {},
          dimensionFieldRelationList: [],
        };
        const fxBudgetFlag = r.get(`${dimension.dimensionCode}fxBudgetFlag`);
        if ((dimension.budgetFlag === 1 || fxBudgetFlag === 1) && fxBudgetFlag !== 0) {
          props.fetchBudgetRemain(r.get('headerIndex'));
        }
        if (name === 'quantity') {
          const { minPackageQuantity, minPurchaseQuantity, uomPrecision = 0 } = props;
          const defaultUomPrec = uomPrecision ? getPrecision(uomPrecision) : 1;
          const totalQuantity = dataSet.data
            .map((n) => n.data.quantity)
            .reduce((pre, curr) => math.plus(pre, curr), 0);
          if (value < 0) {
            r.set(name, oldValue);
            return;
          }
          dataSet.forEach((record) => {
            record.set('totalQuantity', totalQuantity);
            if (
              !(
                (!uomPrecision && totalQuantity % (minPackageQuantity || 1) !== 0) ||
                totalQuantity < (minPurchaseQuantity || defaultUomPrec)
              )
            ) {
              Object.keys(record.data).forEach((key) => {
                record.init(key, record.get(key));
              });
              record.reset();
            }
          });
        }
        // 值集关联字段
        if (name.includes('Lov') && !isEmpty(dimensionFieldRelationList)) {
          handleAssociatField({
            currentDimensiontype: dimension.dimensionType,
            dimensionList,
            record: r,
            dimensionFieldRelationList,
            currentData: value,
          });
        }
      },
    },
  };
};

const childTableDataset = (products) => {
  return {
    selection: false,
    paging: false,
    fields: [
      {
        name: 'productInfo',
        label: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
      },
      {
        name: 'taxIncludedPrice',
        label: intl.get(`mallf.common.model.unitPrice`).d('单价(含税)'),
      },
      {
        name: 'quantity',
        label: intl.get(`mallf.common.model.companyOrder.count`).d('数量'),
        type: 'number',
        required: true,
        validator: (val, name, record) => {
          const { uomPrecision, minPackageQuantity } = record.toData();
          if (val && !uomPrecision && val % (minPackageQuantity || 1) !== 0) {
            return `${intl
              .get('mallf.common.view.errorMinPackageQuantity')
              .d('最小包装量为')}${minPackageQuantity}`;
          }
          if (!val) {
            return intl.get('mallf.common.view.quantityNull').d('请输入数量');
          }
        },
        dynamicProps({ record }) {
          const { uomPrecision, minPurchaseQuantity, minPackageQuantity, taxIncludedPrice } =
            products[record?.index] || {};
          const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
          return {
            step: getPrecision(uomPrecision) || minPackageQuantity,
            min: minPurchaseQuantity || defaultValue,
            max: math.floor(DEFAULT_MAX / taxIncludedPrice),
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
    events: {
      update: ({ record, name, value, oldValue }) => {
        if (name === 'quantity') {
          const { uomPrecision, latestPrice } = products[record?.index] || {};
          const newValue = value > math.floor(DEFAULT_MAX / latestPrice) ? oldValue : value;
          record.set('quantity', getToFixed(newValue, uomPrecision));
        }
      },
    },
  };
};

export { formDs, tableDs, childTableDataset };
