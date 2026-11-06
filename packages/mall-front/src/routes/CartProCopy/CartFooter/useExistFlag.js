import { useMemo } from 'react';
import { groupField, typeField, businessTypeField } from '../enum';

// 是否存在某种类型的商品：按业务类型、按商品类型
export default function useExistFlag(data) {
  const typeIsExist = (type) => data.some((s) => s[groupField.type] === type);
  const businessExist = (businessType) =>
    data.some((s) => s[groupField.businessType] === businessType);
  return useMemo(() => {
    return {
      poFlag: typeIsExist(typeField.po), // po商品是否存在
      receiveFlag: typeIsExist(typeField.receive), // 领用商品是否存在
      centralizedFlag: typeIsExist(typeField.centralized), // 拼单商品是否存在
      purchaseFlag: businessExist(businessTypeField.purchase), // 采购商品是否存在
    };
  }, [data]);
}
