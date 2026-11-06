/* eslint-disable no-unused-vars */
import React, { ReactNode, FormEventHandler, ReactInstance } from 'react';
import moment from 'moment';
import {
  DataSet,
  Select,
  Lov,
  CheckBox,
  NumberField,
  TextField,
  DatePicker,
  TimePicker,
  Currency,
  WeekPicker,
  DateTimePicker,
  MonthPicker,
  YearPicker,
  IntlField,
  EmailField,
  UrlField,
  ColorPicker,
  Icon,
} from 'choerodon-ui/pro';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import warning from 'choerodon-ui/lib/_util/warning';
import { isString, isEmpty, isNil, isEqual, isArray, keys } from 'lodash';

import { lovQueryAxiosConfig } from 'utils/c7nUIConfig';

import {
  selectOrLovPopupCls,
  FieldFlag,
  ComparisonSetFieldSuffix,
  MeaingFieldSuffix,
  RangeStartFieldSuffix,
  RangeEndFieldSuffix,
} from './enum';

export interface fieldProperties extends FieldProps {
  fieldName?: string; // 字段名称
  widget?: any; // 组件
  displayField?: string; // 值集显示字段
  comparison?: string; // 筛选条件
  defaultValueMeaning?: any; // 默认值翻译,适用于Lov、Select
  display?: boolean; // 是否为显示字段标识
  lock?: boolean; // 是的为固定字段标识
  rangeTime?: boolean; // DatePicker是否为范围日期选择标识
  record?: Record | undefined; // DateSet Record
  multipleFlag?: number; // 多选
  lovInfo?: any; // 值集配置
  virtual?: boolean; // 虚拟字段
  rank?: number; // 排序
  customComparisonSet?: string[]; // 查询关系符列表
  fieldWidget?: string; // 组件类型
  editorProps?: object; // 组件属性
  modelCode?: string; // 字段所属模型
  fieldCode?: string; // 字段编码
  fieldAlias?: string; // 字段别名
  lovValueRecords?: object; // lov翻译数据
  showFlag?: 0 | 1; // 字段显示在可选列表下标识，0-不显示，1-显示
  usedFlag?: 0 | 1; // 字段显示标识，0-不显示，1-显示
  fixedFlag?: 0 | 1; // 字段固定标识，0-不固定，1-固定
  sortedFlag?: 0 | 1; // 字段可排序标识，0-不可排序，1-可排序
  fieldVisible?: 0 | 1; // 字段显示隐藏标识，0-不显示，1-显示
  gridSeq?: number; // 位置,
  originDefaultValue?: any; // 原始默认值，用于保存公式类型默认值
  proDefaultFlag?: 0 | 1; // 默认值类型，0-固定值，1-公式
  fieldEditable?: 0 | 1; // 是否可编辑，0-否，1-是
  helpMessage?: string; // 气泡提示
  defaultValueCon?: ConValid; // 条件默认值
  originFieldCode?: string; // 虚拟字段关联的原字段
}

interface fieldEditorProperties extends fieldProperties {
  ref?: any;
  normalEditorWidth?: any;
  onInput?: FormEventHandler<any>;
  onChange?: (value: any, oldValue: any, form?: ReactInstance) => void;
}

export interface filterProperties {
  filterCode?: string; // 编码
  filterName?: string; // 名称
  type?: string; // 类型, system-预定义,custom-自定义
  // lock?: boolean; //
  _tls?: any; // 多语言
  _token?: any; // token,用于查询多语言
  defaultFlag?: number; // 是否默认筛选器标识
  allFields?: fieldProperties[]; // 所有字段列表
  defaultSortedField?: string; // 默认排序字段别名
  defaultSortedOrder?: string; // 默认排序顺序
}

export interface queryProps {
  params: object;
  filter: filterProperties;
  fields: [fieldProperties];
  dataSet: DataSet;
}

export interface fieldChangeProps {
  dataSet: DataSet;
  record: Record;
  name: string;
  value: any;
  oldValue: any;
}

export interface searchBarConfigProperties {
  autoQuery?: boolean; // 自动查询，默认为true
  closeMergeSearchInput?: boolean; // 关闭合并查询输入框，默认为false，不关闭
  closeFilterSelector?: boolean; // 关闭筛选器切换功能，默认为false，不关闭
  defaultExpand?: boolean; // 默认展开或收起，关闭筛选器切换功能时默认收起，否则默认展开
  editorProps?: object; // 组件属性
  expandable?: boolean; // 启用展开收起功能，false不启用
  fieldProps?: object; // 字段ds属性
  showLoading?: boolean; // 查询时显示loading, 默认为true，开启
  onQuery?: (props: queryProps) => void; // 自定义查询
  onReset?: () => void; // 重置回调
  onClear?: () => void; // 清空回调
  onFilterChange?: (filter: filterProperties, oldFilter: filterProperties) => void; // 筛选器更改时回调
  onFieldChange?: (props: fieldChangeProps) => void; // 筛选器字段更改时回调
  onLoad?: (dataSet: DataSet, record: Record) => void; // 初始化加载完成后回调
  left?: searchBarLeftProperties; // searchBar 左侧容器
  right?: searchBarRightProperties; // searchBar 右侧容器
}
export interface searchBarLeftProperties {
  render?: (filter: filterProperties, dataSet: DataSet) => ReactNode; // 自定义渲染函数
}

export interface searchBarRightProperties {
  render?: (filter: filterProperties, dataSet: DataSet) => ReactNode; // 自定义渲染函数
}

export interface ICacheData {
  currentFilter: filterProperties;
  queryDsData: any;
  searchInputDsData: any;
  fields: fieldProperties[];
  customizeDs: DataSet;
  state: any;
}

export enum FieldEditMode {
  OUTPUT = 'output', // 文本展示
  INPUT = 'input', // 输入
}

// 默认值类型
export enum DefaultValueType {
  CONSTANT = 0, // 常量
  EXPRESSION = 1, // 公式
}

export interface ConValid {
  valids: {
    conExpression?: string;
    errorMessage?: string;
    [extProp: string]: any;
  }[];
  lines: {
    conCode: string | number;
    sourceFieldCode?: string;
    sourceModelCode?: string;
    sourceUnitCode: string;
    conExpression: string;
    targetType: string;
    targetFieldCode?: string;
    targetModelCode?: string;
    targetValue: any;
  }[];
}

export interface CalculateConfig {
  fieldCode: string;
  modelCode: string;
  queryDsRecord: Record;
  searchInputDsRecord: Record;
  queryDsFields: fieldProperties[];
  searchInputDsFields: fieldProperties[];
  ctxParams: CtxParams;
  getFieldValue: Function;
}

export interface CtxParams {
  ctx: {
    tenantId?: number | string;
    organizationId?: number | string;
    loginName?: string;
    realName?: string;
    currentRoleCode?: string;
    currentRoleId?: number;
    currentRoleLabels?: string[];
    currentRoleLevel?: string;
    currentRoleName?: string;
    additionInfo: {
      defaultCompanyId: number | string;
    };
  };
}

// 通用范围日期字段-开始时间字段name
export function getRangeBeforeFieldName(fieldName) {
  return `_${fieldName}${RangeStartFieldSuffix}`;
}

// 通用范围日期字段-结算时间字段name
export function getRangeAfterFieldName(fieldName) {
  return `_${fieldName}${RangeEndFieldSuffix}`;
}

// lov,select组件多选字段虚拟字段name
export function getTempFieldName(fieldName) {
  return `${fieldName}_tmp`;
}

// 通用字段-关系符字段name
export function getComparsionFieldName(fieldName) {
  return `_${fieldName}${ComparisonSetFieldSuffix}`;
}

export function getRangeFieldName(fieldName) {
  return `${fieldName}_range`;
}

export function getInFieldName(fieldName) {
  return `_${fieldName}_In`;
}

export function getDateTimeMinFormat(format) {
  return `${format} 00:00:00`;
}

export function getDateTimeMaxFormat(format) {
  return `${format} 23:59:59`;
}

export function getMeaningFieldName(fieldName) {
  return `${fieldName}${MeaingFieldSuffix}`;
}

export function filterTempFields(fields) {
  if (isEmpty(fields)) {
    return [];
  }
  return fields.filter(item => !item[FieldFlag.VIRTUAL]);
}

export function checkValueValid(value) {
  if (value === 0) {
    return true;
  }
  if (!value) {
    return false;
  }
  if (isArray(value)) {
    return value.filter(Boolean).length > 0;
  }
  if (typeof value === 'object' && isEmpty(value)) {
    return false;
  }
  return true;
}

/**
 * 获取字段编辑组件
 * @param fieldPorps
 */
export function getEditorByField(props: fieldEditorProperties) {
  const {
    name,
    type,
    lookupCode,
    lookupUrl,
    lovCode,
    options,
    record,
    ref,
    onInput,
    onChange,
    normalEditorWidth,
    editorProps: originEditorProps = {},
  } = props;
  const editorProps = {
    ...originEditorProps,
    name,
    record,
    autoFocus: true,
  };
  const normalEditorProps = {
    ref,
    style: {
      width: normalEditorWidth,
    },
    onInput,
    onChange,
  };
  if (lookupCode || isString(lookupUrl) || (type !== FieldType.object && (lovCode || options))) {
    return (
      <Select
        {...editorProps}
        suffix={<Icon type="arrow_drop_down" />}
        popupCls={selectOrLovPopupCls}
      />
    );
  }
  if (lovCode) {
    return <Lov {...editorProps} popupCls={selectOrLovPopupCls} />;
  }
  switch (type) {
    case FieldType.boolean:
      return <CheckBox {...editorProps} />;
    case FieldType.number:
      return <NumberField {...editorProps} {...normalEditorProps} />;
    case FieldType.currency:
      return <Currency {...editorProps} />;
    case FieldType.date:
      return <DatePicker {...editorProps} />;
    case FieldType.dateTime:
      return <DateTimePicker {...editorProps} />;
    case FieldType.time:
      return <TimePicker {...editorProps} />;
    case FieldType.week:
      return <WeekPicker {...editorProps} />;
    case FieldType.month:
      return <MonthPicker {...editorProps} />;
    case FieldType.year:
      return <YearPicker {...editorProps} />;
    case FieldType.intl:
      return <IntlField {...editorProps} />;
    case FieldType.email:
      return <EmailField {...editorProps} />;
    case FieldType.url:
      return <UrlField {...editorProps} />;
    case FieldType.color:
      return <ColorPicker {...editorProps} />;
    case FieldType.string:
      return <TextField {...editorProps} {...normalEditorProps} />;
    default:
      warning(
        false,
        `Table auto editor: No editor exists on the field<${name}>'s type<${type}>, so use the TextField as default editor`
      );
      return <TextField {...editorProps} />;
  }
}

export function sortFields(fields: any, sortBy: string) {
  fields.sort((before, after) => {
    // if (!before[sortBy]) {
    //   return true;
    // }
    // if (!after[sortBy]) {
    //   return false;
    // }
    return before[sortBy] - after[sortBy];
  });
  return fields;
}

// 根据字段name获取所有关联字段
export function getRelatedFilterFields(
  fields: fieldProperties[] = [],
  targetFeild: fieldProperties
) {
  const { name } = targetFeild;
  const relatedFields = fields.filter(item => {
    const { name: fieldName } = item;
    return (
      fieldName === name ||
      fieldName === getTempFieldName(name) ||
      fieldName === getRangeAfterFieldName(name) ||
      fieldName === getRangeBeforeFieldName(name) ||
      fieldName === getComparsionFieldName(name)
    );
  });
  // rank, display, proDefaultFlag 属性保留
  return relatedFields.map(item => ({
    ...item,
    defaultValue: undefined,
    defaultValueMeaning: undefined,
    rank: targetFeild.rank,
    display: targetFeild.display,
    proDefaultFlag: targetFeild.proDefaultFlag,
    // defaultValueCon: targetFeild.defaultValueCon,
  }));
}

// 比较字段值是否发生更改
export function checkFieldValueModified(field: fieldProperties, value: any, oldValue: any) {
  const { fieldWidget, format, multipleFlag } = field;
  let newValue = !isNil(value) ? value : undefined;
  let originValue = !isNil(oldValue) ? oldValue : undefined;
  if (fieldWidget === 'DATE_PICKER') {
    const formatMoment = (momentValue, formatter) => {
      if (momentValue instanceof moment) {
        return (momentValue as any).format(formatter);
      } else if (isString(momentValue)) {
        return moment(momentValue).format(formatter);
      } else {
        return momentValue;
      }
    };
    if (multipleFlag !== 1) {
      newValue = !isNil(newValue) ? formatMoment(newValue, format) : undefined;
      originValue = !isNil(originValue) ? formatMoment(originValue, format) : undefined;
    } else {
      newValue =
        !isNil(newValue) && isArray(newValue)
          ? newValue.map(item => (!isNil(item) ? formatMoment(item, format) : '')).join(',')
          : undefined;
      originValue =
        !isNil(originValue) && isArray(originValue)
          ? originValue.map(item => (!isNil(item) ? formatMoment(item, format) : '')).join(',')
          : undefined;
    }
  } else if (fieldWidget === 'INPUT_NUMBER' && multipleFlag === 1) {
    newValue =
      !isNil(newValue) && isArray(newValue)
        ? newValue.filter(item => !isNil(item)).join(',')
        : undefined;
    originValue =
      !isNil(originValue) && isArray(originValue)
        ? originValue.filter(item => !isNil(item)).join(',')
        : undefined;
  }
  return newValue !== originValue;
}

// 比较字段配置是否发生更改
export function checkFieldConfigModified(
  oldField: fieldProperties,
  newField: fieldProperties
): boolean {
  if (isNil(oldField) || isNil(newField)) {
    return true;
  }
  const configArr = [
    'label', // 字段名称
    'customComparisonSet', // 筛选条件
    'fieldWidget', // 组件
    'multipleFlag', // 多选/范围
    'type', // 字段类型
    'fieldVisible', // 是否显示
    'format', // 日期格式
    'sourceCode', // 值集编码
    'textField', // 值集显示字段
    'valueField', // 值集值字段
    'sortFlag', // 是否可排序
    'gridSeq', // 位置
    'proDefaultFlag', // 默认值类型
    'disabled', // 是否可编辑
    'helpMessage', // 气泡提示,
    'defaultValueCon', // 默认值条件
  ];
  return configArr.some(
    item =>
      !isEqual(
        !isNil(oldField[item]) ? oldField[item] : '',
        !isNil(newField[item]) ? newField[item] : ''
      )
  );
}

export const getLovQueryAxiosConfig = (code, config, options) => {
  const axiosConfig = lovQueryAxiosConfig(code, config);
  return {
    ...axiosConfig,
    headers: {
      ...axiosConfig.headers,
      ...options.headers,
    },
  };
};

export const isObjectEqual = (targetObj, sourceObj) => {
  const objKeys = keys(targetObj);
  if (!isEqual(objKeys, keys(sourceObj))) {
    return false;
  }
  if (objKeys.length < 1) {
    return true;
  }
  return objKeys.every(item => {
    const targetValue = isNil(targetObj[item]) ? undefined : targetObj[item];
    const sourceValue = isNil(sourceObj[item]) ? undefined : sourceObj[item];
    return targetValue === sourceValue;
  });
};

export const transformNilValue = (value, nilValue) => {
  return isNil(value) ? nilValue : value;
};

export const checkComparsionWithNull = comparsion => {
  return ['NOTNULL', 'ISNULL'].includes(comparsion);
};
