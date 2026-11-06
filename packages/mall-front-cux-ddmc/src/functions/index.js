export function cuxHeaderList({ headerList, organizationId }) {
  const newHeaderList = headerList.map((n) => {
    if (n.dimensionCode === 'invOrganizationId') {
      return {
        ...n,
        headerNum: 1,
        tenantId: organizationId,
        value: null,
      };
    }
    return n;
  });
  return newHeaderList;
}
