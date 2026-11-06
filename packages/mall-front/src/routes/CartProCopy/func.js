import { getIsHideSupplierFlag } from 'utils/configUtils';

import {
  groupField,
  typeField,
  groupTypeField,
  businessTypeField,
  checkValueField,
  checkFieldValue,
  validFieldArray,
  headerGroupTypeFields,
} from './enum';

/**
 * @description 获取数据中的分组值
 * @param {Object} obj 数据对象
 * @param {String} checkField 数据中的字段组'id,code,name'
 * @returns {String} 'obj.id,obj.code,obj.name'
 */
export function getCheckFieldValue(obj, checkField) {
  const checkFields = (checkField || '').split(',');
  return checkFields.map((m) => obj[m]).join(',');
}

/**
 * @description 判断两条数据是否为同一组
 * @param {Object} prev 对比数据1
 * @param {Object} next 对比数据2
 * @param {String} checkField 对比数据中的字段组判断其值是否为一组'id,code,name'
 * @returns {Boolean}
 */
export function checkRecordSame(prev, next, checkField) {
  // const checkFields = (checkField || '').split(',');
  // return checkFields.every(e => prev[e] === next[e]); // 每一个字段都相等
  const prevVal = getCheckFieldValue(prev, checkField);
  const nextVal = getCheckFieldValue(next, checkField);
  return prevVal === nextVal; // 每一个字段都相等
}

/**
 * @description 判断两条Record是否为同一组
 * @param {Record} prevRe DataSet Record
 * @param {Record} nextRe DataSet Record
 * @returns {Boolean}
 */
export function checkGroupRecord(prevRe, nextRe) {
  const checkField = prevRe.get(groupField.groupCheckField);
  return (
    prevRe.get(groupField.groupType) === nextRe.get(groupField.groupType) &&
    checkRecordSame(prevRe.toData(), nextRe.toData(), checkField)
  );
}

/**
 * @description 获取同一组Records
 * @param {object} {} record：目标记录，records | dataSet: 需要与目标记录对比的记录集，headInclude：是否需要包含分组头记录
 * @returns {Array} Records []
 */
export function getGroupRecords({ record, records, dataSet, headInclude = true }) {
  // records优先
  const filterRecords = records || dataSet;
  // 分组头记录
  let headRecord;
  const groupRecords = filterRecords.filter((re) => {
    // 是否为头
    const isHead = re.get(groupField.groupFlag);
    // 是否为同一组
    const isGroup = checkGroupRecord(record, re);
    // 保证头记录在数组顶部
    if (isHead && isGroup && headInclude) {
      headRecord = re;
    }
    return !isHead && isGroup;
  });
  if (headRecord) {
    groupRecords.unshift(headRecord);
  }
  return groupRecords;
}

/**
 * @description 替换[].filter().map()
 * @param {Array|DataSet} data 需要过滤构造的数组或者具备reduce方法的实例
 * @param {Function} filterFn 过滤器方法，同array.filter
 * @param {Function} mapFn 构造器方法，同array.map
 * @returns {Array} Array
 */
export function filterMap(data, filterFn = () => {}, mapFn = (r) => r) {
  return data.reduce((p, c) => {
    if (filterFn(c)) {
      p.push(mapFn(c));
    }
    return p;
  }, []);
}

/**
 * @description 购物车商品筛选方法，默认筛选掉分组商品头
 * @param {Records|DataSet} records record数组或者dataSet
 * @param {Function} filterFn 过滤函数，默认返回true
 * @param {Function} mapFn 构造函数，通array.map，map接收一个Object
 * @returns {Array} Records []
 */
export function recordsFilter(records, filterFn = () => true, mapFn = (r) => r) {
  return filterMap(
    records,
    (record) => {
      return !record.get(groupField.groupFlag) && filterFn(record);
    },
    (record) => {
      return mapFn(record.toData());
    }
  );
}

/**
 * @description 获取相同特性的记录集
 * @param {Object} args records: records [] | dataSet,filter: (record) => boolean,自定义过滤方法, sameFields: [],过滤相同特性的字段名数组，sameRecord: 对比出相同特性的目标记录
 * @returns {Array} [records, isAllSelected] records: 过滤出的相同特性记录集，isAllSelected: 此次得到的records是否已全部选中
 */
export function getSameRecords({
  records,
  filter = () => true,
  sameFields = [],
  sameRecord, // 用来对比的记录，没有则取records的第一条
}) {
  // 记录上次选中的记录集
  const lastSelectedRecords = [];
  const sameRecords = records.reduce((p, record) => {
    // 过滤条件，外部传入的过滤方法
    const isFilterRecord = filter(record);
    // 对每一项根据传入的特性值判断的字段名数组与sameRecord || records[0]来判断
    const isSameRecord =
      sameFields.length === 0 ||
      sameFields.every((field) => {
        if (!sameRecord && p.length < 1) return true;
        const compareRecord = sameRecord || p[0];
        return compareRecord.get(field) === record.get(field);
      });
    // 迭代记录选中则存进上次选中记录集
    if (record.isSelected) {
      lastSelectedRecords.push(record);
    }
    // 符合过滤以及相同特性的记录
    if (isFilterRecord && isSameRecord && record.selectable) {
      p.push(record);
    }
    return p;
  }, []);

  // 相同特性的记录集长度等于上次选中的数据集长度同时其中有一项在两者中都存在则判断此次相同特性的记录集已经被全部选中
  const isAllSelected =
    sameRecords.length > 0 &&
    lastSelectedRecords.length === sameRecords.length &&
    lastSelectedRecords.some((s) => cartEqual(s.toData(), sameRecords[0].toData()));
  return [sameRecords, isAllSelected];
}

/**
 * @description 根据列表以及需要置顶的列表获取排序好的列表
 * @param {Array} cartList 当前购物车数据
 * @param {Array} topList 需要置顶的购物车数据
 * @returns {Array} cartList
 */
export function getSortCartList(cartList, topList, equalFn = cartEqual) {
  // 迭代置顶数据，找到则删除原数据，再头增加置顶数据
  return topList.reduce((p, c) => {
    const findIndex = p.findIndex((f) => equalFn(f, c));
    const findItem = p[findIndex] || {};
    if (findIndex > -1) {
      p.splice(findIndex, 1);
    }
    p.unshift({ ...c, ...findItem });
    return p;
  }, cartList);
}

/**
 * @description 比较是否是同一条购物车数据
 * @param {Object} prevSku 对比购物车数据1
 * @param {Object} nextSku 对比购物车数据2
 * @returns {Boolean}
 */
export function cartEqual(prevSku, nextSku) {
  // 如果qtHeaderNo存在则通过qtHeaderNo判断，否则通过cartId判断
  if (prevSku.qtHeaderNo) {
    return prevSku.qtHeaderNo === nextSku.qtHeaderNo;
  } else {
    return prevSku.cartId === nextSku.cartId;
  }
}

/**
 * @description 对于一些请求结果的响应回调
 * @param {Object} result 返回结果
 * @param {Array} resp 回调数组
 */
export function respCallback(result = {}, resp = []) {
  for (let i = 0; i < resp.length; i++) {
    const { field, value, calc, callback = (e) => e } = resp[i];
    const val = typeof calc === 'function' ? calc(result[field]) : value;
    if (result[field] === val) {
      callback();
      return;
    }
  }
}

/**
 * @description 根据某种条件通过一次循环filter得到两个数组
 * @param {Array} data 需要过滤的数组
 * @param {Function} filterFn 过滤函数
 * @returns {Array} [filterData, noFilterData]
 */
export function splitArray(data, filterFn = () => true) {
  const matchData = [];
  const notMatchData = [];
  data.forEach((f) => {
    if (filterFn(f)) {
      matchData.push(f);
    } else {
      notMatchData.push(f);
    }
  });
  return [matchData, notMatchData];
}

/**
 * @description 从对象数据中通过条件判断得到结果值
 * @param {Object} source 对象数据
 * @param {Array} switchs 条件判断数组
 * @param {Any} defaultResult 默认结果
 * @returns {Any} result
 */
function swicthValue(source = {}, switchs = [], defaultResult) {
  // 迭代条件判断
  while (switchs.length) {
    const scase = switchs.shift();
    // fieldName: 对象数据中的某一个字段名
    // result: 符合该条件得到的结果
    // fieldMatch: 匹配值，默认无
    const [fieldName, result, fieldMatch] = scase;
    // 最终计算条件则是没有fieldMatch则直接根据值存在判断，存在fieldMatch则通过值与fieldMatch对比判断
    const isMatch = scase.length > 2 ? source[fieldName] === fieldMatch : source[fieldName];
    if (isMatch) {
      return result;
    }
  }
  return defaultResult;
}

// 构造前端所需要的数据
export function dataToCart(item, dataSet) {
  // 商品类型：po、领用、拼单、标准
  const type = swicthValue(
    item,
    [
      ['qtHeaderNo', typeField.po],
      ['receiveFlag', typeField.receive],
      ['centralizedFlag', typeField.centralized],
    ],
    typeField.basic
  );
  // 组类型：po、拼单、领用 - 增加聚合分组
  const groupType = swicthValue(
    item,
    [
      ['qtHeaderNo', groupTypeField.po],
      ['centralizedFlag', groupTypeField.centralized],
      ...(dataSet.getState('cartViewType') === 1
        ? [[dataSet.getState('groupType'), headerGroupTypeFields[dataSet.getState('groupType')]]]
        : []),
    ],
    groupTypeField.other
  );
  // 分组字段、用于组勾选联动
  const groupCheckField = swicthValue(
    item,
    [
      ['qtHeaderNo', 'qtHeaderNo'],
      ...(dataSet.getState('cartViewType') === 1
        ? [[dataSet.getState('groupType'), headerGroupTypeFields[dataSet.getState('groupType')]]]
        : []),
      // ['centralizedTemplateId', 'centralizedTemplateId'],
    ],
    checkValueField.otherCheck
  );
  // 分组字段值、用于组勾选联动
  const groupCheckFieldValue = swicthValue(
    item,
    [
      ['qtHeaderNo', item.qtHeaderNo],
      ...(dataSet.getState('cartViewType') === 1
        ? [[dataSet.getState('groupType'), item[dataSet.getState('groupType')]]]
        : []),
      // ['centralizedTemplateId', item.centralizedTemplateId],
    ],
    checkFieldValue.checkOther
  );
  // 业务类型：领用、拼单、采购，用于判断
  const businessType = swicthValue(
    item,
    [
      ['receiveFlag', businessTypeField.receive],
      ['centralizedFlag', businessTypeField.centralized],
    ],
    businessTypeField.purchase
  );
  return {
    ...item,
    [groupField.type]: type,
    [groupField.groupType]: groupType,
    [groupField.groupCheckField]: groupCheckField,
    [groupCheckField]: groupCheckFieldValue,
    [groupField.businessType]: businessType,
    receiveFlag: +item.receiveFlag === 1 ? 1 : 0,
    // centralizedFlag: +item.centralizedFlag === 1 ? 1 : 0,
    invalidFlag: +item.invalidFlag,
  };
}

// 用于可提交的数据
export function cartToJSONData(cartData, mapFn = (r) => r) {
  return cartData.map((m) => {
    const n = m;
    Object.keys({
      ...groupField,
      ...checkValueField,
    }).forEach((f) => {
      delete n[groupField[f]];
    });
    validFieldArray.forEach((j) => {
      delete n[j];
    });
    Object.keys(n).forEach((f) => {
      if (f?.startsWith('LINE_') || f?.startsWith('HEADER_') || f.endsWith('__cloumn')) {
        delete n[f];
      }
    });
    delete n.dimensionTemplateDTO;
    return mapFn(n);
  });
}

export function calcCartIsUngrouped(dataSet) {
  return (
    (dataSet.getState('cartViewType') || 1) === 1 &&
    dataSet.getState('groupType') === headerGroupTypeFields.ungrouped
  );
}

// 处理头分组过滤
export function handleGroupingFilter(record) {
  return (
    (getIsHideSupplierFlag() &&
      record.get('value') !== headerGroupTypeFields.supplierCompanyName) ||
    !getIsHideSupplierFlag()
  );
}
