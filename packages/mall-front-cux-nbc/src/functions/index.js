import { openComfirmModal } from 'utils/modals';
import intl from 'utils/intl';

function getProductValidlist(data) {
  return (
    data?.cartList?.reduce((pre, cur) => {
      const { checkStuse, productNum, productId } = cur;
      if (checkStuse === '0' && !pre.some((p) => p.productId === productId)) {
        return [
          ...pre,
          {
            productId,
            productNum,
          },
        ];
      }
      return pre;
    }, []) || []
  );
}

function getProductValidate(props) {
  const { res, successCallback } = props;
  const list = getProductValidlist(res);
  if (list.length) {
    openComfirmModal({
      title: intl.get('mallf.common.view.change.warning').d('温馨提示'),
      border: false,
      children: `${list
        .map((e) => `${e.productNum}`)
        .join('、')} 基础功能/兼容性不合格，请确认是否继续提交样品申请`,
      onOk: () => {
        successCallback(res);
      },
    });
  } else {
    successCallback(res);
  }
}

export { getProductValidate };
