import { openComfirmModal } from 'utils/modals';
import intl from 'utils/intl';

function getERPlist(data) {
  return (
    data?.cartList?.reduce((pre, cur) => {
      const { erpFlag, productName, productId, itemCode } = cur;
      if (erpFlag === 1 && !pre.some((p) => p.productId === productId)) {
        return [
          ...pre,
          {
            productId,
            productName,
            itemCode,
          },
        ];
      }
      return pre;
    }, []) || []
  );
}

function getERPValidate(props) {
  const { res, successCallback } = props;
  const ERPList = getERPlist(res);
  if (ERPList.length) {
    openComfirmModal({
      title: intl.get('mallf.common.view.change.warning').d('温馨提示'),
      border: false,
      children: `您选中的商品中，${ERPList.map((e) => `${e.productName}(${e.itemCode})`).join(
        '、'
      )} 存在外部库存，可点击物料编码查看外部库存情况。是否继续提交购物车？`,
      onOk: () => {
        successCallback(res);
      },
    });
  } else {
    successCallback(res);
  }
}

function setCurrentStockInfo(props) {
  const { estimatedDeliveryDate } = props;
  const descSuffix = estimatedDeliveryDate ? `，${estimatedDeliveryDate}` : '';
  return descSuffix;
}

export { getERPValidate, setCurrentStockInfo };
