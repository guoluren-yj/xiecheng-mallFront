import intl from 'utils/intl';

export function getValidateType(_record) {
  const dataSet = this;
  const validaTypes = {
    linkType: (record) => {
      const validateSkuType = this.getSkuSourceMeaning(record.toData());
      const selectedSkuType = this.getSkuSourceMeaning(dataSet.selected[0]?.toData() || {});
      return intl
        .get(`mallf.common.view.porduct.chooseSameLink`, {
          newType: validateSkuType,
          oldType: selectedSkuType,
        })
        .d(`${validateSkuType}商品和${selectedSkuType}商品不可同时勾选！`);
    },
    currencyCode: intl
      .get(`mallf.common.view.porduct.chooseSameCurrency`)
      .d('只能选择相同币种的商品！'),
    HEADER_prTypeId_value: intl
      .get('mallf.cart.view.chooseSame.prTypeProduct')
      .d('只能选择相同申请类型的商品！'),
  };
  const record = _record || dataSet.selected[0] || dataSet.get(0);
  if (record && record.get('linkType') === 'ORDER') {
    validaTypes.receiveFlag = intl
      .get(`mallf.cart.view.porduct.chooseSameReceive`)
      .d('领用商品和采购商品不可同时勾选！');
  }
  return validaTypes;
}
