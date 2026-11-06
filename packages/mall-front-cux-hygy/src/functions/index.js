import { getUserConfigInfo, getOrganizationId } from 'utils/utils';
import request from 'utils/request';

export function handleProductData(props) {
  const { setProductData, productData = {} } = props;
  const { userConfigVersion: { invOrganizationCode } = {} } = getUserConfigInfo() || {};
  const url = `/marmot/v1/${getOrganizationId()}/marmot-api/6JhQoSTyucTEN0JgGbdBk8OuibWygibCHc2iauAIuww8YM`;
  request(url, {
    method: 'POST',
    body: JSON.stringify({
      invOrganizationCode,
      itemCode: productData?.itemCode,
    }),
  }).then((res) => {
    if (res) {
      setProductData((data) => ({
        ...data,
        sapData: res?.inventory ?? '-',
      }));
    }
  });
}
