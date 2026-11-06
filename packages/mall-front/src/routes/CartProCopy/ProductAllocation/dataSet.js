import { isEmpty } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { getPrecision } from 'utils/utils';
import { getOpenCartFlag } from 'utils/configUtils';
import CuxFn from '@/cuxTools/cuxFn';
import {
  renderField,
  handleAssociatField,
  getDimensionCode,
  handleLovCascadeList,
  getDimValue,
} from './func';

// 转换表达式为Boolean值
export function evalConditionExpression({
  conditionExpression,
  conditionLineList,
  conditionExpressionObj,
}) {
  let newConditionExpression = conditionExpression.replace(/AND/g, '&&').replace(/OR/g, '||');
  const newConditionLineList = [...conditionLineList].reverse();
  newConditionLineList.forEach((item) => {
    if (newConditionExpression.includes(item.conditionCode)) {
      newConditionExpression = newConditionExpression.replace(
        new RegExp(item.conditionCode, 'g'),
        conditionExpressionObj[item.conditionCode]
      );
    }
  });
  try {
    newConditionExpression = newConditionExpression.replace(/\d+/g, false); // 处理没匹配上的数字
    // eslint-disable-next-line
    return eval(newConditionExpression);
  } catch {
    return false;
  }
}

// 处理条件判断
export function handleConditionExpression({
  conditionLineList,
  dimensionList,
  record,
  headerRecord,
  lineRecord,
}) {
  const conditionExpressionObj = {};
  const getDimension = (dimId) => {
    const {
      dimension: { dimensionCode, dimensionType },
      dimensionComponent: { lovView = {}, componentType },
    } = dimensionList.find((n) => dimId === n.dimension.dimensionId) || {
      dimension: {},
      dimensionComponent: {},
    };
    return {
      lovView,
      componentType,
      dimensionCode,
      dimensionType,
      dimensionRecord: (dimensionType?.startsWith('LINE') ? lineRecord : headerRecord) || record,
    };
  };
  conditionLineList.forEach((line) => {
    const {
      conditionCode,
      dimensionId, // 当前维度id
      targetValue, // 目标字段值
      conditionExpression, // 条件表达式
      targetType, // 目标字段类型（维度/固定值）
      targetDimensionId, // 目标维度id
    } = line;
    const { dimensionCode, lovView = {}, componentType, dimensionRecord } = getDimension(
      dimensionId
    );
    const { valueField } = lovView || {};

    // 当前字段值
    const conditionValue =
      componentType === 'LOV'
        ? dimensionRecord.get(`${dimensionCode}Lov`)?.[valueField]
        : dimensionRecord.get(dimensionCode);
    let newTargetValue = targetValue;
    // 目标字段是维度类型
    if (targetType === 'DIMENSION') {
      const {
        dimensionCode: targetDimensionCode,
        dimensionRecord: targetDimensionRecord,
        componentType: targetComponentType,
        lovView: targetLovView,
      } = getDimension(targetDimensionId);
      const { valueField: targetValueField } = targetLovView || {};
      newTargetValue =
        targetComponentType === 'LOV'
          ? targetDimensionRecord.get(`${targetDimensionCode}Lov`)?.[targetValueField]
          : targetDimensionRecord.get(targetDimensionCode);
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

export const getFxFlag = ({
  conditionLineList,
  dimensionList,
  conditionExpression,
  record,
  headerRecord, // 头记录
  lineRecord, // 行记录
}) => {
  const conditionExpressionObj = handleConditionExpression({
    conditionLineList,
    dimensionList,
    record,
    headerRecord,
    lineRecord,
  });
  return evalConditionExpression({
    conditionExpression,
    conditionLineList,
    conditionExpressionObj,
  });
};

// 行字段联动
export function lineDimensionUpdate({ dimensionList, headerRecord, lineRecord }) {
  // 行字段联动
  // 维度字段集合
  dimensionList
    .filter((n) => n.conditionList)
    .forEach((field) => {
      const { conditionList } = field;
      conditionList.forEach((condition) => {
        const { conditionHeader, conditionLineList } = condition;
        const { conditionType, conditionExpression } = conditionHeader;
        const {
          dimension: { dimensionType, dimensionCode: code },
        } = dimensionList.find((n) => conditionHeader.dimensionId === n.dimension.dimensionId) || {
          dimension: {},
          dimensionComponent: {},
        };
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
          // case 'BUDGET':
          //   propsName = 'fxBudgetFlag';
          //   break;
          default:
            break;
        }
        if (!propsName) return;
        if (dimensionType.startsWith('LINE')) {
          const flag = getFxFlag({
            conditionLineList,
            dimensionList,
            conditionExpression,
            headerRecord,
            lineRecord,
          });
          lineRecord.set(`${code}${propsName}`, flag ? 1 : 0);
        }
      });
    });
}

// 获取计算行
function getConditionLineList(dimension, firstIndex) {
  const condList = [];
  const { defaultCondition = {}, formulaConditionFx = {}, formulaCondition = {} } = dimension || {};
  condList.push(
    ...(defaultCondition.conditionLineList || []),
    ...(formulaConditionFx.conditionLineList || [])
  );
  // 表达式成立，还需取fx公式配置行formulaCondition
  if (firstIndex > -1) {
    const { conditionLineList = [] } =
      formulaConditionFx.dimFormulaConditionList?.[firstIndex]?.formulaCondition || {};
    condList.push(...conditionLineList);
  } else {
    // FX不成立取公式formulaCondition
    condList.push(...(formulaCondition.conditionLineList || []));
  }
  return condList;
}

const formDs = (props) => ({
  autoQuery: false,
  fields: renderField({ ...props, fieldType: 'header' }),
  events: {
    update({ record, name, value, oldValue, dataSet }) {
      const headerIndex = record.get('headerIndex');
      const { dimensionList, lineDsObj } = props;
      const { dimension = {}, dimensionComponent = {}, dimensionFieldRelationList = [] } =
        dimensionList.find((n) => name === getDimensionCode(n)) || {};
      // 值集入参改变清空值集
      if (!name.includes('fx')) {
        // 值集参数关联的字段集合
        const cascadeList = handleLovCascadeList({
          dimension,
          dimensionComponent,
          value,
          oldValue,
          dimensionList,
          name,
        });
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
      }

      // 动态默认值
      dimensionList
        .filter((n) => n.defaultCondition || n.formulaConditionFx || n.formulaCondition) // defaultCondition固定fx默认值 formulaConditionFx公式fx默认值
        .forEach((field) => {
          const {
            defaultCondition,
            formulaConditionFx,
            formulaCondition: fieldFormulaCondition,
          } = field;
          const {
            conditionHeader = {},
            conditionLineList = [],
            dimDefaultConditionList,
            dimFormulaConditionList,
          } = defaultCondition || formulaConditionFx || fieldFormulaCondition || {};
          const dimConditionList = dimDefaultConditionList || dimFormulaConditionList || [];
          const {
            dimension: { dimensionType, dimensionCode: code },
            dimensionComponent: {
              componentType: type,
              lovView = {},
              defaultValue,
              defaultValueMeaning,
              defaultType,
            },
          } = dimensionList.find(
            (n) => conditionHeader.dimensionId === n.dimension.dimensionId
          ) || {
            dimension: {},
            dimensionComponent: {},
          };
          const { valueField, displayField } = lovView || {};
          const conditionExpressionObj = handleConditionExpression({
            conditionLineList,
            dimensionList,
            record,
          });
          // 表达式不包含改动的字段
          // const isNewLine =
          //   name === 'updateFx' && dimensionType.startsWith('LINE');
          // const conditionLineList = [...(defaultCondition.conditionLineList || []), ...(formulaConditionFx.conditionLineList || [])];

          const newDimDefaultConditionList = dimConditionList.map((dimDefault) => {
            const { conditionExpression } = dimDefault;
            return evalConditionExpression({
              conditionExpression,
              conditionLineList,
              conditionExpressionObj,
            });
          });
          // 找出第一个符合条件的表达式
          const firstIndex = newDimDefaultConditionList.findIndex((n) => !!n);
          // 所有表达式计算行（公式行和fx行）
          const condList = getConditionLineList(field, firstIndex);
          // 计算行是否包含当前改变字段
          const noIncludesExpressFieldFlag = (
            condList.map(
              (n) =>
                // 过滤fx更新，避免污染
                (!name.includes('fx') && dimension.dimensionCode === n.dimensionCode) ||
                (!isEmpty(dimension) && dimension.dimensionId === n.targetDimensionId)
            ) || []
          ).every((n) => !n);
          // 不包含则无需后续计算
          if (noIncludesExpressFieldFlag) return;
          const { value: fxDefaValue, valueName: fxDefaValueName } = getDimValue(
            dimConditionList?.[firstIndex],
            { record, lineDs: lineDsObj[headerIndex], dimensionList }
          );
          let newValue;
          let newCode;
          let componentDefaultValue = defaultValue;
          // 判断公式默认值
          if (defaultType === 'FORMULA') {
            const { value: formulaValue } = getDimValue(
              { formulaCondition: fieldFormulaCondition },
              { record, lineDs: lineDsObj[headerIndex], dimensionList }
            );
            componentDefaultValue = formulaValue;
          }
          // fx默认值优先级 > 默认值
          switch (type) {
            case 'LOV':
              newCode = `${code}Lov`;
              newValue =
                firstIndex >= 0 || componentDefaultValue
                  ? {
                      [valueField]: fxDefaValue || componentDefaultValue,
                      [displayField]: fxDefaValueName || defaultValueMeaning,
                    }
                  : null;
              break;
            default:
              newCode = code;
              newValue =
                firstIndex >= 0 || componentDefaultValue
                  ? fxDefaValue || componentDefaultValue
                  : null;
              break;
          }
          const getNewValue = (index = 0) =>
            typeof newValue === 'function' ? newValue(index) : newValue;
          if (dimensionType.startsWith('LINE')) {
            // if (isNewLine) {
            //   // 新建行只需给新建的赋值、
            //   const maxKey = lineDsObj[headerIndex].length - 1;
            //   lineDsObj[headerIndex].get(maxKey).set(`${code}fxDefaultValue`, getNewValue(maxKey));
            //   lineDsObj[headerIndex].get(maxKey).set(newCode, getNewValue(maxKey));
            // } else {
            lineDsObj[headerIndex].forEach((r, i) => {
              r.set(`${code}fxDefaultValue`, getNewValue(i));
              r.set(newCode, getNewValue(i));
            });
            // }
          } else {
            record.set(newCode, getNewValue());
          }
        });

      // 值集关联字段
      if (name.includes('Lov') && !isEmpty(dimensionFieldRelationList)) {
        handleAssociatField({
          currentDimensiontype: dimension.dimensionType,
          dimensionList,
          record,
          dimensionFieldRelationList,
          currentData: value,
          lineDs: lineDsObj[headerIndex],
        });
      }

      // 公司带出业务实体库存组织
      if (name === 'companyIdLov') {
        const { ouId, ouName, organizationId, organizationName, addressId, fullAddress } =
          value || {};
        record.set(
          'addressIdLov',
          addressId
            ? {
                ...value,
                addressId,
                fullAddress,
              }
            : null
        );
        record.set(
          'ouIdLov',
          ouId
            ? {
                ...value,
                ouId,
                ouName,
                organizationId,
                organizationName,
              }
            : null
        );
      }
      // 业务实体带出库存组织
      if (name === 'ouIdLov') {
        const handleOuChange = () => {
          const { organizationId } = value || {};
          record.set('invOrganizationIdLov', organizationId ? value : null);
        };
        CuxFn({
          // 明喆-二开
          name: 'CartProCopy-ProdctAllocation-cuxHandleOuChange',
          value: {},
        })(() => handleOuChange())();
      }

      const { [`${dimension.dimensionCode}fxBudgetFlag`]: fxBudgetFlag } =
        dataSet.data?.[0]?.data || {};
      // 预算余额查询
      if ((dimension.budgetFlag === 1 || fxBudgetFlag === 1) && fxBudgetFlag !== 0) {
        props.fetchBudgetRemain(headerIndex);
      }

      // 维度字段集合
      dimensionList
        .filter((n) => n.conditionList)
        .forEach((field) => {
          const { conditionList } = field;
          conditionList.forEach((condition) => {
            const { conditionHeader, conditionLineList } = condition;
            const { conditionType, conditionExpression } = conditionHeader;
            const {
              dimension: { dimensionType, dimensionCode: code },
              dimensionComponent: { componentType },
            } = dimensionList.find(
              (n) => conditionHeader.dimensionId === n.dimension.dimensionId
            ) || { dimension: {}, dimensionComponent: {} };
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
            const flag = getFxFlag({
              conditionLineList,
              dimensionList,
              conditionExpression,
              record,
            });
            const fieldCode = `${code}${componentType === 'LOV' ? 'Lov' : ''}`;
            if (dimensionType.startsWith('LINE')) {
              if (propsName === 'fxDisplayFlag' && lineDsObj[headerIndex].getField(fieldCode)) {
                lineDsObj[headerIndex].getField(fieldCode).set('visibled', flag);
              }
              lineDsObj[headerIndex].forEach((r) => {
                const lineFlag = getFxFlag({
                  conditionLineList,
                  dimensionList,
                  conditionExpression,
                  headerRecord: record,
                  lineRecord: r,
                });
                r.set(`${code}${propsName}`, lineFlag ? 1 : 0);
              });
            } else {
              if (propsName === 'fxDisplayFlag' && record.getField(fieldCode)) {
                record.getField(fieldCode).set('visibled', flag);
              }
              record.set(`${code}${propsName}`, flag ? 1 : 0);
            }
          });
        });

      CuxFn({
        name: 'CartProCopy-ProdctAllocation-cuxUpdate',
        value: { record, name, value, dataSet, dimensionList, lineDsObj },
      })();
    },
  },
});

const tableDs = (props) => {
  return {
    primaryKey: 'orderSeq',
    autoQuery: false,
    paging: false,
    selection: props.multipleFlag ? 'multiple' : false,
    fields: renderField({ ...props, fieldType: 'line' }),
    events: {
      update({ name, dataSet, record: r, value, oldValue }) {
        const { dimensionList, product = {}, headerDs } = props;
        const { dimension, dimensionComponent, dimensionFieldRelationList } = dimensionList.find(
          (n) => name === getDimensionCode(n) && n.dimension.dimensionType.includes('LINE')
        ) || {
          dimension: {},
          dimensionComponent: {},
          dimensionFieldRelationList: [],
        };
        const fxBudgetFlag = r.get(`${dimension.dimensionCode}fxBudgetFlag`);
        if ((dimension.budgetFlag === 1 || fxBudgetFlag === 1) && fxBudgetFlag !== 0) {
          props.fetchBudgetRemain(r.get('headerIndex'));
        }
        // 手工修改单位清空数量
        // 手工修改物料编码清空数量
        if (product.manualFlag && ['itemIdLov', 'uomIdLov'].includes(name)) {
          r.set('quantity', null);
        }
        if (name === 'quantity') {
          const { minPackageQuantity, minPurchaseQuantity, uomPrecision = 0 } = props;
          const defaultUomPrec = uomPrecision ? getPrecision(uomPrecision) : 1;
          const totalQuantity = dataSet.data
            .map((n) => n.data.quantity || 0)
            .reduce((pre, curr) => math.plus(pre, curr), 0);
          if (value < 0) {
            r.set(name, oldValue);
            return;
          }
          // 未开启开放购物车按总行数量计算
          if (!getOpenCartFlag(product?.linkType)) {
            dataSet.forEach((record) => {
              record.set('totalQuantity', totalQuantity);
              if (
                !(
                  (!(uomPrecision || record.get('uomPrecision')) &&
                    totalQuantity % (minPackageQuantity || 1) !== 0) ||
                  totalQuantity < (minPurchaseQuantity || defaultUomPrec)
                )
              ) {
                // 重置数量校验报错
                Object.keys(record.toData()).forEach((key) => {
                  record.init(key, record.get(key));
                });
                record.reset();
              }
            });
          }
        }
        if (!name.includes('fx')) {
          // 值集参数关联的字段集合
          const cascadeList = handleLovCascadeList({
            dimension,
            dimensionComponent,
            value,
            oldValue,
            dimensionList,
            name,
          });
          cascadeList.forEach((c) => {
            r.set(`${c.dimension?.dimensionCode}Lov`, null);
          });
        }
        // 值集关联字段
        if (name.includes('Lov')) {
          if (!isEmpty(dimensionFieldRelationList)) {
            handleAssociatField({
              currentDimensiontype: dimension.dimensionType,
              dimensionList,
              record: r,
              dimensionFieldRelationList,
              currentData: value,
            });
          }
        }

        lineDimensionUpdate({ dimensionList, headerRecord: headerDs.current, lineRecord: r });

        CuxFn({
          name: 'CartProCopy-ProdctAllocation-cuxLineUpdate',
          value: { record: r, name, value, dataSet, dimensionList, headerDs, product },
        })();
      },
    },
  };
};

export { formDs, tableDs };
