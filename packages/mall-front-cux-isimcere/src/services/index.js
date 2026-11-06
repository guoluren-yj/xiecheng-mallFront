import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';

export function queryERPStock(params) {
  const url = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/rChVfFnqEfUF3yOxeMLzHozbM67VqpkA1vwzxutltqA`;
  return request(url, {
    method: 'POST',
    query: params,
  });
}
