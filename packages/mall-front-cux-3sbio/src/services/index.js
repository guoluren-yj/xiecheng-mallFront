import request from 'utils/request';

export function fetchCheckAddress(body) {
  return request(
    '/marmot/v1/{organizationId}/marmot-api/riamdueen3tUuW3llWoP8t4TjouFeiaQIIfhkI6hYKOIA',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}
