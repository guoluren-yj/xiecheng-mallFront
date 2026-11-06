import { getOrganizationId } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function fetchStock(p) {
  const url = `${
    HmallConfig.apiGateway
  }/marmot/v1/${getOrganizationId()}/marmot-api/bj0TOXKc4EoKQc9QA6sHE8odKkalA9jWLcfEpz1R8q6fYhlOdjmOzrngYtzE02hD`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(p),
  });
}
