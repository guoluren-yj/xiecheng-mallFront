import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';

export async function cuxHeaderList({ headerList, organizationId }) {
  const url = `/marmot/v1/${organizationId}/marmot-api/yTvKRwibJel1xyjqpv189WwgD3WdfnN6RMzlW4ibYNXibY`;
  const res = getResponse(await request(url, {
    method: 'GET',
  }));
  const newHeaderList = headerList.map((n) => {
    if (n.dimensionCode === 'attributeVarchar1') {
      return ({
        ...n,
        headerNum: 1,
        tenantId: organizationId,
        value: res?.attributeVarchar1,
        valueName: res?.hsUnitName,
      });
    }
    return n;
  });
  return newHeaderList;
}


export async function cuxHeaderDsSetValue({ headerDsObj, dsKey }) {
  console.log(323232);
  const attributeVarchar1Value = headerDsObj[dsKey]?.current?.get('attributeVarchar1');
  if (!attributeVarchar1Value) {
    const url = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/yTvKRwibJel1xyjqpv189WwgD3WdfnN6RMzlW4ibYNXibY`;
    const res = getResponse(await request(url, {
      method: 'GET',
    }));
    // eslint-disable-next-line no-unused-expressions
    headerDsObj[dsKey]?.current?.set({ attributeVarchar1: res?.attributeVarchar1, attributeVarchar1Lov: { unitCode: res?.attributeVarchar1, unitName: res?.hsUnitName } });
  }
}
