import request from 'utils/request';
import { getUserConfigInfo } from 'utils/utils';

export function fetchToPay({ paymentOrderNum }) {
  const { organizationId } = getUserConfigInfo();
  return request(`/spct/v1/${organizationId}/basepay/pay-new/${paymentOrderNum}?payType=alipay`, {
    dataType: 'text',
  });
}
