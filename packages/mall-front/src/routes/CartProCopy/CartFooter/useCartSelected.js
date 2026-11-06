// 返回选中的商品、总数、总价格
import { useMemo } from 'react';
import { math } from 'choerodon-ui/dataset';
import { numberRender, getUserConfigInfo } from 'utils/utils';
import cuxComonent from 'cuxTools/cuxComponent';
import { recordsFilter } from '../func';

function calcTotal(data) {
  const { financialPrecision } = data[0] || {};
  const [totalCount, totalPrice] = data.reduce(
    (p, c) => {
      const { totalQuantity, taxIncludedAmount } = c;
      return [math.plus(p[0], totalQuantity), math.plus(p[1], taxIncludedAmount)];
    },
    [0, 0]
  );
  return [
    totalCount,
    totalCount === 0 ? 0 : numberRender(totalPrice, financialPrecision || 0, true),
  ];
}

function useCartSelected(dataSet) {
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

export default cuxComonent({ path: 'CartProCopy/CartFooter/useCartSelected', isFn: true })(
  useCartSelected
);
