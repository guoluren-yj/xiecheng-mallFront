import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';

function getAddressValidate(props) {
  const { res, successCallback } = props;
  const flag = res?.cartList?.some((c) => c?.checkAddressFlag === 1);
  if (flag) {
    openComfirmModal({
      title: intl.get('mallf.common.view.prompt').d('提示'),
      border: false,
      children:
        '商品涉及IT类的成本中心和品类，若收货地址不为IT类地址，继续提交则会更新收货信息，若有疑问可咨询管理人员',
      onOk: () => successCallback(res),
    });
  } else {
    successCallback(res);
  }
}
function getBuyNowAddressValidate(props) {
  const { resp, orderData } = props;
  const flag = resp?.cartList?.some((c) => c?.checkAddressFlag === 1);
  if (flag) {
    openComfirmModal({
      title: intl.get('mallf.common.view.prompt').d('提示'),
      border: false,
      children:
        '商品涉及IT类的成本中心和品类，若收货地址不为IT类地址，继续提交则会更新收货信息，若有疑问可咨询管理人员',
      onOk: async () => {
        props.history.push({
          pathname: '/before-order',
          data: { orderData, preData: resp.orderList },
        });
      },
    });
  } else {
    props.history.push({
      pathname: '/before-order',
      data: { orderData, preData: resp.orderList },
    });
  }
}

export { getAddressValidate, getBuyNowAddressValidate };
