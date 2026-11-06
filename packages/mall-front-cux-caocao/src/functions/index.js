export function attachmentRequireCux({ order }) {
  const { shoppingCartDTOList = [] } = order || {};
  const { headerCustomizedList = [] } = shoppingCartDTOList[0] || {};
  const { value } = headerCustomizedList.find((n) => n.dimensionCode === 'attributeVarchar1') || {};
  // eslint-disable-next-line no-param-reassign
  order.attachmentRequired = +value;
}
