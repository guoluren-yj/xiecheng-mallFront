import request from 'utils/request';

export function fetchConfigList() {
  return request('/hpfm/v1/{organizationId}/lovs/data?lovCode=SCUX.NTES.CONFIG.TYPE');
}

export function fetchHandleSave(body) {
  return request(
    '/marmot/v1/{organizationId}/marmot-api/t3GicWpyjJldfd7Mv5xnZiamj0avx1taCkPBYrHuFK5B0',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}
