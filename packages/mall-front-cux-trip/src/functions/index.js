export function getInitUnitData(props) {
  const { data, isNew, userConfig } = props || {};
  const { defaultPurchaseOrgId, defaultPurchaseOrgCode, defaultPurchaseOrgName } = userConfig || {};
  return isNew
    ? {
        ...data,
        PURCHASE_ORGANIZATION: {
          unitId: defaultPurchaseOrgId,
          unitCode: defaultPurchaseOrgCode,
          unitName: defaultPurchaseOrgName,
        },
      }
    : data;
}
