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

export function cuxHiddenBtnList({ companyAttributeBigint1 = '' }) {
  console.log('companyAttributeBigint1', companyAttributeBigint1);
  return {
    cuxReSubmitFlag: ['0', 0].includes(companyAttributeBigint1),
  };
}

export function dsUpdateFn({ name, value, record }) {
  console.log('埋点111');
  // if (name === 'prTypeIdLov') {
  //   record.set('accountAssignTypeCode', null);
  //   record.set('accountAssignTypeId', null);
  //   record.set('costIdLov', null); // 成本中心
  //   record.set('costId', null); // 成本中心
  //   record.set('costCode', null); // 成本中心
  //   record.set('costName', null); // 成本中心
  //   record.set('accountSubjectIdLov', null); // 总账科目
  //   record.set('accountSubjectId', null); // 总账科目
  //   record.set('accountSubjectName', null); // 总账科目
  //   record.set('ioNum', null); // IO号
  // }
  // 值集入参改变清空值集

  // 账户分类别
  if (name === 'accountAssignTypeIdfxEditFlag') {
    if (value === 0) {
      record.set('accountAssignTypeId', null);
    }
  }
  // 成本中心
  if (name === 'costIdfxEditFlag') {
    if (value === 0) {
      record.set('costIdLov', null);
      record.set('costId', null);
      record.set('costCode', null);
    }
  }
  // 总账科目
  if (name === 'accountSubjectIdfxEditFlag') {
    if (value === 0) {
      record.set('accountSubjectIdLov', null);
      record.set('accountSubjectId', null);
      record.set('accountSubjectName', null);
    }
  }

  // IO号
  if (name === 'ioNumfxEditFlag') {
    if (value === 0) {
      record.set('ioNum', null);
    }
  }
}
