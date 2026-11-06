/* eslint-disable no-param-reassign */
import { isEmpty } from 'lodash';
import request from 'mall-front/lib/utils/request';
import { getOrganizationId } from 'mall-front/lib/utils/utils';

export const changeOrderData = ({ setOrderData, data, hasSiglProduct }) => {
  setOrderData(data);
  // /hpfm/v1/${getOrganizationId()}/units/unitsList?enabledFlag=1&lovCode=SPFM.UNIT_G_C&size=0
  request(`/hpfm/v1/${getOrganizationId()}/lovs/sql/data?lovCode=SCUX.RUIJIE.UNIT&size=0`).then(
    (res) => {
      setOrderData((orderData) => {
        orderData.forEach((order) => {
          const { budget } = order?.shoppingCartDTOList?.[0]?.budgetInfoList?.[0] || {};
          if (budget) {
            const unitCode = JSON.parse(budget).ccCode?.replace('CCD', '');
            if (!isEmpty(res) && unitCode) {
              const { unitId } = res?.content.find((p) => p.unitCode === unitCode) || {};
              if (order?.DS) {
                order.DS.current.set('attributeBigint10', unitId);
              }
            }
          }
          if (hasSiglProduct) {
            order.siglPayFlag = 1;
            order.returnUrl = `${window.location.origin}/my-mall/my-order`;
          }
        });
        return orderData;
      });
    }
  );
};

export function addOrderApprover(params) {
  const currentData = [];
  const { content, setState } = params;
  content.forEach((val) => {
    if (val.mallOrderStatus === 'WAITING_APPROVE') {
      currentData.push({ orderCode: val.orderCode });
    }
  });

  if (isEmpty(currentData)) {
    setState({ list: content });
  } else {
    request(`/sprm/v1/${getOrganizationId()}/purchase-requests/prHeader/query-history-approval`, {
      method: 'POST',
      body: JSON.stringify(currentData),
    }).then((resp) => {
      content.forEach((o, index) => {
        const assigneeName = resp.find((p) => p.orderCode === o.orderCode)?.assigneeName;
        content[index].currentApproverList = [];
        content[index].assigneeName = assigneeName;
      });
      setState({ list: content });
    });
  }
}
