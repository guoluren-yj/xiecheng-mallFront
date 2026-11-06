// 返回选中的商品、总数、总价格
import { useMemo } from 'react';
import { math } from 'choerodon-ui/dataset';
import { numberRender, getUserConfigInfo } from 'utils/utils';
import { recordsFilter } from 'mall-front/lib/routes/CartProCopy/func';

function calcTotal(data) {
  const { financialPrecision } = data[0] || {};
  // 是否同时存在价格隐藏和不隐藏商品
  let hiddenSkuLength = 0; // 价格隐藏数量
  const [totalCount, totalPrice, notHiddenTotalPrice] = data.reduce(
    (p, c) => {
      const { totalQuantity, taxIncludedAmount } = c;
      const isPriceHidden =
        typeof taxIncludedAmount === 'string' && taxIncludedAmount.includes('*');
      if (isPriceHidden) hiddenSkuLength++;
      return [
        math.plus(p[0], totalQuantity),
        math.plus(p[1], taxIncludedAmount),
        isPriceHidden ? p[2] : math.plus(p[2], taxIncludedAmount),
      ];
    },
    [0, 0, 0]
  );

  if (hiddenSkuLength > 0 && hiddenSkuLength < data.length) {
    return [totalCount, `${numberRender(notHiddenTotalPrice, financialPrecision || 0, true)}+****`];
  }
  return [
    totalCount,
    totalCount === 0 ? 0 : numberRender(totalPrice, financialPrecision || 0, true),
  ];
}

export default function useCartSelected(dataSet) {
  const { companyId } = getUserConfigInfo();
  return useMemo(() => {
    const selectSku = recordsFilter(
      dataSet.selected,
      () => true,
      (m) => ({ ...m, templateUnitId: m.unitId, companyId }) // templateUnit、companyId统一加上
    );
    const [totalCount, totalPrice] = calcTotal(selectSku);
    // totalCountStr = new Big(purChaseData.totalCount).toString() 可能需要这样转换
    return {
      selectSku,
      totalCount,
      totalPrice,
      totalCountStr: totalCount,
      currencySymbol: selectSku[0]?.currencySymbol,
    };
  });
}
