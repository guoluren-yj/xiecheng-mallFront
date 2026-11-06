import request from 'mall-front/lib/utils/request';
import { getOrganizationId } from 'mall-front/lib/utils/utils';

export async function saveConfigInfo({ params }) {
  const organizationId = getOrganizationId();
  return request(`/iam/v1/${organizationId}/user/endow-auth`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
