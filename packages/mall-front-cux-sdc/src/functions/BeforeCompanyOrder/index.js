/* eslint-disable no-param-reassign */
import Swal from 'components/swal';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

import { fetchCardInfo } from 'services/cartService';
import { getUserConfigInfo } from 'mall-front/lib/utils/utils';

export function validateWechat({ orderData, submitOrderList }) {
  // 水滴筹名片校验
  const wechatFlag = orderData.some((order) => {
    return order.shoppingCartDTOList.some((n) => n?.businessCardFlag && !n?.attributeLongtext2);
  });
  const WorkLicenseItemFlag = orderData.some((order) => {
    return order.shoppingCartDTOList.some(
      (item) => isEmpty(order?.fileList) && item.isWorkLicenseItem === 1
    );
  });
  if (WorkLicenseItemFlag) {
    Swal(intl.get(`mallf.common.view.workLicenseItemFlag`).d('附件必传，且内容为头像'));
    return;
  }
  if (wechatFlag) {
    Swal(
      intl
        .get(`mallf.common.view.validateWechat`)
        .d('您还未上传微信二维码等印刷信息，是否继续下单？'),
      true
    ).then((result) => {
      if (result.value) submitOrderList();
    });
    return false;
  }
  return 1;
}

export const changeOrderData = ({ setOrderData, data }) => {
  let shoppingCartList = [];
  data.forEach((n) => {
    shoppingCartList = [...shoppingCartList, ...n.shoppingCartDTOList];
  });
  const cardFlag = shoppingCartList.some((n) => !!n.businessCardFlag);
  if (cardFlag) {
    const { userId } = getUserConfigInfo();
    fetchCardInfo(userId)
      .then((res) => {
        if (res) {
          const newOrderData = [...data];
          newOrderData.forEach((o) => {
            o.cardInfo = res;
            o.shoppingCartDTOList.forEach((p, i) => {
              if (p.businessCardFlag) {
                o.shoppingCartDTOList[i] = {
                  ...p,
                  ...res,
                  cartUserId: userId,
                  cartUserType: 'USER',
                };
              }
            });
          });
          setOrderData(newOrderData);
        } else {
          setOrderData(data);
        }
      })
      .catch(() => {
        setOrderData(data);
      });
  } else {
    setOrderData(data);
  }
};
