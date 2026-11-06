import request from 'mall-front/lib/utils/request';
import { getOrganizationId } from 'mall-front/lib/utils/utils';

export async function getBasketApprovalTypeApi() {
  const organizationId = getOrganizationId();
  return request(
    `/marmot/v1/${organizationId}/marmot-api/AYMT51CKNTiamUEnzibdGk79icluBxqcwc1XdQ0pWyT7N2GKF1w5Wiaj4dWo1ITNtHiax`,
    {
      method: 'GET',
    }
  );
}
