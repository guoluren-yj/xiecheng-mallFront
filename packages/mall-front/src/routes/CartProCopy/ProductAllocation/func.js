import { isEmpty, isNil } from 'lodash';
import intl from 'utils/intl';
import {
  getPrecision,
  getUserConfigInfo,
  getProductLimit,
  calcValidatePack,
  getMinPurchaseQuantity,
} from 'utils/utils';
import { getOpenCartFlag } from 'utils/configUtils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { math } from 'choerodon-ui/dataset';
import moment from 'moment';
import { statementToJs, innerFunctionMap } from 'srm-front-scuz/lib/utils/index';
import CuxFn from '@/cuxTools/cuxFn';

// 头启用字段
export function getHeaderEnabledDimension(dimensionList) {
  return dimensionList.filter(
    (n) => n.dimension.dimensionType.startsWith('HEADER') && n.dimension.enabledFlag
  );
}
// 行启用
export function getLineEnabledDimension(dimensionList) {
  return dimensionList.filter(
    (n) => n.dimension.dimensionType.startsWith('LINE') && n.dimension.enabledFlag
  );
}

export function hasFxConfigFlag(dm, type) {
  const { conditionList = [] } = dm || {};
  return conditionList.some((n) => n.conditionHeader?.conditionType === type);
}

// 头展示
export function getHeaderDisplayDimension(dimensionList) {
  const headerList = dimensionList.filter((n) => {
    const hasFxDisplay = hasFxConfigFlag(n, 'DISPLAY');
    return (
      n.dimension.dimensionType.startsWith('HEADER') &&
      (hasFxDisplay || n.dimension.displayFlag) &&
      n.dimension.enabledFlag
    );
  });
  const maxRow = Math.max.apply(
    null,
    headerList.map((header) => header?.dimension?.rowSeq)
  );
  let newHeaderList = [];
  for (let row = 1; row < maxRow + 1; row++) {
    const rowList = headerList
      .filter((header) => header?.dimension?.rowSeq === row)
      .sort((a, b) => {
        const value1 = a?.dimension?.colSeq;
        const value2 = b?.dimension?.colSeq;
        return value1 - value2;
      });
    newHeaderList = [...newHeaderList, ...rowList];
  }
  return newHeaderList;
}

// 行展示
export function getLineDisplayDimension(dimensionList) {
  return dimensionList.filter((n) => {
    const hasFxDisplay = hasFxConfigFlag(n, 'DISPLAY');
    return (
      n.dimension.dimensionType.startsWith('LINE') &&
      (hasFxDisplay || n.dimension.displayFlag) &&
      n.dimension.enabledFlag
    );
  });
}

// Lov关联Lov
function handleLovAssociatToLov({
  targetDimensionCode,
  targetFieldCode,
  currentValue,
  record,
  valueField,
}) {
  const targetFieldData = record.get(`${targetDimensionCode}Lov`);
  record.set(`${targetDimensionCode}Lov`, {
    ...targetFieldData,
    [targetFieldCode]: currentValue,
  });
  if (valueField === targetFieldCode && isNil(currentValue)) {
    // 关联无值 清空值集，{}影响提交必输 id优先级在后方。后续可优化循环提取相同字段在关联设置值
    record.set(`${targetDimensionCode}Lov`, null);
  }
}

// 处理关联字段
export const handleAssociatField = ({
  currentDimensiontype, // 当前维度类型（头行）
  dimensionList,
  record,
  dimensionFieldRelationList = [], // 关联字段集合
  currentData,
  lineDs,
}) => {
  dimensionFieldRelationList.forEach((n) => {
    const {
      fieldCode, // 当前字段
      targetDimensionId, // 目标维度id
      targetDimensionCode,
      targetFieldCode, // 目标字段
      targetComponentType,
    } = n;
    const currentValue = (currentData || {})[fieldCode] ?? null;
    const { dimension = {}, dimensionComponent = {} } =
      dimensionList.find((m) => m.dimension.dimensionId === targetDimensionId) || {};
    const { dimensionType } = dimension;
    const { lovView = {} } = dimensionComponent;
    const { valueField = 'value' } = lovView;
    // 头关联行字段
    if (currentDimensiontype.startsWith('HEAD') && dimensionType.startsWith('LINE')) {
      lineDs.forEach((r) => {
        if (targetComponentType === 'LOV') {
          handleLovAssociatToLov({
            targetDimensionCode,
            targetFieldCode,
            currentValue,
            record: r,
            valueField,
          });
        } else {
          r.set(targetFieldCode, currentValue);
        }
      });
    } else if (targetComponentType === 'LOV') {
      // 头关联头字段/行关联行字段
      handleLovAssociatToLov({
        targetDimensionCode,
        targetFieldCode,
        currentValue,
        record,
        valueField,
      });
    } else {
      record.set(targetFieldCode, currentValue);
    }
  });
};

// 处理值集参数关联字段集合
export const handleLovCascadeList = ({
  dimension,
  dimensionComponent,
  value,
  oldValue,
  dimensionList,
  name,
}) => {
  const { dimensionId } = dimension;
  const { lovView } = dimensionComponent;
  const { valueField } = lovView || {};
  // lov实际上并没有发生改变(主键有可能没加密，所以要string一下)
  if (
    (String(value?.[valueField]) === String(oldValue?.[valueField]) && name.includes('Lov')) ||
    !dimensionId
  ) {
    return [];
  }
  // 所有跟该字段有关联关系的字段集合
  const cascadeList =
    dimensionList.filter((n) =>
      n.dimensionParameterList?.some((p) => p.parameterDimensionId === dimensionId)
    ) || [];
  return cascadeList;
};

// 获取field对应的dimensionCode
export const getDimensionCode = (filed) => {
  const { dimension = {}, dimensionComponent = {} } = filed || {};
  return dimensionComponent.componentType === 'LOV'
    ? `${dimension.dimensionCode}Lov`
    : dimension.dimensionCode;
};

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
  product = {},
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
        // eslint-disable-next-line no-case-declarations
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
        queryParams[parameterKey] = product[parameterValue];
        break;
      default:
        break;
    }
  });
  return queryParams;
}

export function renderField(props) {
  const {
    fieldList,
    dimensionList,
    headerDs,
    fieldType,
    purchaseQuantityLimit,
    initialSpecialObj, // 特殊默认值集合
    product = {},
  } = props;
  const {
    sourceFrom,
    productSource,
    maxPurchaseQuantity,
    taxIncludedPrice,
    ladderPriceList,
    minPackageQuantity,
    minPurchaseQuantity,
    uomPrecision = 0,
    linkType,
    manualFlag,
    receiveFlag,
    centralizedFlag,
  } = product;
  let minLimit = minPurchaseQuantity;
  let maxLimit = purchaseQuantityLimit;
  [minLimit, maxLimit] = getProductLimit({
    sourceFrom: sourceFrom || productSource,
    minPurchaseQuantity: getMinPurchaseQuantity({
      minPurchaseQuantity,
      isReceive: !!receiveFlag,
      uomPrecision,
    }),
    maxPurchaseQuantity,
    purchaseQuantityLimit,
    price: taxIncludedPrice,
    ladderPriceLimit: ladderPriceList,
  });
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
        name: 'quantity',
        label: intl.get(`mallf.common.view.quantity`).d('数量'),
        type: 'number',
        max: maxLimit,
        required: true,
        visibled: true,
        step: minPackageQuantity || 1,
        nonStrictStep: true,
        computedProps: {
          precision: ({ record }) => {
            // 暂用 sync 判断 解决uomIdLov字段绑定精度导致清空问题
            const precision =
              manualFlag && record.status !== 'sync'
                ? record.get('uomPrecision')
                : record.get('uomPrecision') || uomPrecision;
            return isNaN(+precision) ? 0 : +precision;
          },
          // mall-8739 放开单位数量可编辑
          // disabled: ({ record }) => {
          //   return manualFlag && !record.get('uomIdLov');
          // },
        },
        validator: (val, name, record) => {
          const precision = manualFlag
            ? record.get('uomPrecision')
            : record.get('uomPrecision') || uomPrecision;
          const defaultUomPrec = precision ? getPrecision(precision) : 1;
          const min = centralizedFlag // 拼单商品 最小为包装量
            ? calcValidatePack(precision, minPackageQuantity)
              ? minPackageQuantity
              : defaultUomPrec
            : manualFlag
            ? defaultUomPrec
            : minLimit || defaultUomPrec;
          // 开发购物车按行数量
          const totalQuantity = getOpenCartFlag(linkType)
            ? val
            : record.get('totalQuantity') || val;
          if (!val) {
            return intl.get('mallf.common.view.quantityNull').d('请输入数量');
          }
          if (totalQuantity < min) {
            return intl
              .get(`mallf.common.model.minPurchaseNumber`, {
                value: min,
              })
              .d(`最小购买量为${min}`);
          }
          if (
            val &&
            totalQuantity &&
            calcValidatePack(precision, minPackageQuantity) &&
            !math.eq(math.mod(totalQuantity, minPackageQuantity || 1), 0)
          ) {
            return `${intl
              .get('mallf.common.view.errorMinPackageQuantity')
              .d('最小包装量为')}${minPackageQuantity}`;
          }
          return undefined;
        },
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
    .filter((n) => n.dimension.dimensionCode !== 'quantity')
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
          otherProps = {
            tableProps: {
              mode: 'tree',
            },
          };
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
              manualFlag && fieldType === 'line' && dimensionCode === 'attachmentUuid'
                ? 1024 * 1024 * 100
                : 1024 * 1024 * 5,
          };
          break;
        default:
          newType = 'string';
      }
      const cuxComputedProps = CuxFn({
        name: 'allocation-fn-computedProps',
        value: { item, ...props },
      })(() => {})();
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
              noCache: true,
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
                defaultValue: ({ record, dataSet, name }) => {
                  const fxDefaultValue =
                    record?.get(`${dimensionCode}fxDefaultValue`) ||
                    dataSet?.get(0)?.get(`${dimensionCode}fxDefaultValue`);
                  const defaultVal =
                    initialSpecialObj[`${dimensionType}_${dimensionCode}`] ||
                    fxDefaultValue ||
                    (componentType === 'LOV'
                      ? defaultValue
                        ? {
                            [valueField]: defaultValue,
                            [displayField]: defaultValueMeaning,
                          }
                        : null
                      : defaultValue);
                  // 处理新建行字段FX 不处理LOV,因为会影响bind字段
                  if (dimensionType.startsWith('LINE') && defaultVal && componentType !== 'LOV') {
                    record.init(name, defaultVal);
                  }
                  return defaultVal;
                },
                required: ({ record }) => {
                  const fxNecessaryFlag = record.get(`${dimensionCode}fxNecessaryFlag`);
                  return ![1, 0].includes(fxNecessaryFlag) ? !!necessaryFlag : !!fxNecessaryFlag;
                },
                lovPara: ({ record }) => {
                  return handleQueryParams({
                    dimensionParameterList,
                    dimensionList,
                    dimensionType,
                    record,
                    headerDs,
                    product,
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
                      product,
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
                ...cuxComputedProps,
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
              visibled: displayFlag,
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

export function handleHeaderFixLov({ dimensionList = [], unitData }) {
  const lovList = ['invOrganization', 'ou', 'purOrganization', 'company'];
  const lovData = {};
  // 不确定lov以后的value跟name是否会更换
  function handleLovValue(dimensionCode) {
    const header = dimensionList?.find((n) => n.dimension.dimensionCode === dimensionCode) || {
      dimensionComponent: {},
    };
    const { dimensionComponent } = header;
    const { lovView } = dimensionComponent;
    const { displayField, valueField } = lovView || {};
    const field = lovList.find((d) => dimensionCode.includes(d));
    const lovValue = unitData[`${field}Id`]
      ? {
          [valueField]: unitData[`${field}Id`],
          [displayField]: unitData[`${field}Name`],
        }
      : null;
    return lovValue;
  }
  lovList.forEach((item) => {
    lovData[`${item}IdLov`] = handleLovValue(`${item}Id`);
  });
  return lovData;
}

export const getDimensionCodeFromId = (dimId, dimensionList) => {
  const {
    dimension: { dimensionCode: dimCode, dimensionType: dimType },
  } = dimensionList.find((n) => dimId === n.dimension.dimensionId) || {
    dimension: {},
  };
  return {
    dimensionCode: dimCode,
    dimensionType: dimType,
  };
};

export const getDimValue = (targetObj, props = {}) => {
  if (isEmpty(targetObj)) {
    return {};
  }
  const { record, lineDs, dimensionList } = props;
  const { formulaCondition } = targetObj;
  const resultObj = Object.assign({}, targetObj);
  if (formulaCondition) {
    const {
      conditionHeader: formulConditionHeader,
      conditionLineList: formulaConditionLineList = [],
    } = formulaCondition || {};
    // 组合成个性化字符串
    let defStr = formulaConditionLineList
      .map((l) =>
        l.targetType === 'FIXED'
          ? `DEF ${l.paramCode} SPEC DATE ${l.targetValue};`
          : `DEF ${l.paramCode} UNIT ${
              getDimensionCodeFromId(l.targetDimensionId, dimensionList).dimensionType?.startsWith(
                'LINE'
              )
                ? 'LINE'
                : 'HEAD'
            } ${getDimensionCodeFromId(l.targetDimensionId, dimensionList).dimensionCode};`
      )
      .join('');
    defStr += `RES ${formulConditionHeader.conditionExpression};`;
    const cacheData = {
      HEAD: {
        getValue: (valueCode) => record.get(valueCode)?.toString(),
      },
      LINE: {
        getValue: (valueCode, rawKey) => lineDs.get(rawKey).get(valueCode)?.toString(),
      },
    };
    try {
      // 调用公式计算并设置值
      // eslint-disable-next-line no-new-func
      resultObj.value = new Function(
        'cache, innerFunctionMap, moment',
        statementToJs(defStr).join('\r\n')
      )(cacheData, innerFunctionMap, moment);
    } catch (error) {
      resultObj.value = null;
    }
  }
  return resultObj;
};
