export function setAddress({
  product,
  currentAddress = {},
  addressRef,
  companyId,
  userId,
  setCurrentAddress = (e) => e,
}) {
  const { sourceFrom = 'CATA' } = product || {};
  if (
    (sourceFrom === 'CATA' && currentAddress.belongType === 2) ||
    (sourceFrom !== 'CATA' && currentAddress.belongType === 1)
  ) {
    setCurrentAddress({});
  }
  addressRef.current.dataSet.current.set('lovPara', {
    companyId,
    userId,
    belongType: sourceFrom === 'CATA' ? 1 : 2,
  });
}

export function handleTitleMap({ titleMap, products }) {
  const list = new Set(products.map((n) => n.sourceFrom || n.productSource));
  if (list.size > 1) {
    titleMap.set(true, '电商目录化商品不可一起批量分配');
  }
}
