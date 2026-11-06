import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import Swal from 'components/swal';
import { submitAddressService } from 'services/addressService';

export function afterQueryPrepare() {
  const isHome = ['/'].includes(location.pathname);
  if (isHome) {
    const { organizationId, companyId, purchaseUnit } = getUserConfigInfo();
    const { invOrganizationId, invOrganizationName, inventoryId, inventoryName } =
      purchaseUnit || {};
    const params = {
      companyId,
      inventoryId,
      invOrganizationId,
    };
    const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/Qia6sOpB3jl7tXNia9Cau7sa9ZRrdzwszTyYLuEeQzsS8`;
    request(url, { method: 'GET', query: params }).then((res) => {
      if (res && res.checkAddressFlag === '1') {
        Swal(
          `您当前的默认的库存组织为【${invOrganizationName}】库房为【${inventoryName}】，该地址为【${res.address?.fullAddress}】，请确认是否要将该地址更新为默认地址？`,
          true
        ).then(async (swalRes) => {
          if (swalRes.value && res.address) {
            await submitAddressService({ ...res.address, companyId, method: 'POST' });
            window.location.reload();
          }
        });
      }
    });
  }
}
