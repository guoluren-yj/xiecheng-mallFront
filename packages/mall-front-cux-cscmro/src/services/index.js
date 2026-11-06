import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

export function fetchSanctionNumberVaildApi(body) {
  return request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/riamdueen3tUuW3llWoP8t4TjouFeiaQIIfhkI6hYKOIA`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}
