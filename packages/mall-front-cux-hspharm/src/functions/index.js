import request from 'utils/request';
import { getUserConfigInfo, getResponse, getStorage, setStorage } from 'utils/utils';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getViewTypeStorageKey } from 'utils/configUtils';

export function setListNewProduct({ newProduct, saleList, uomList }) {
  return {
    ...newProduct,
    saleList,
    uomList,
  };
}

export async function confirmSwal({ preData, submitOrderList, setSubmitLoading }) {
  const { organizationId } = getUserConfigInfo();
  setSubmitLoading(true);
  const res = await request(
    `/marmot/v1/${organizationId}/marmot-api/4LxGfFw9wtlJwIq6CoOoULxQ9b8Sr57Kicx04rKgiaKqs`,
    {
      method: 'POST',
      body: JSON.stringify({ originType: 'CART', preData }),
    }
  );
  setSubmitLoading(false);
  if (getResponse(res)) {
    if (res.detailMsg) {
      Modal.confirm({
        title: intl.get('mallf.companyOrder.scux.message.hspharm.submit').d('提交'),
        children: res.detailMsg,
        onOk: () => {
          submitOrderList();
        },
        onCancel: () => {
          
        }
      });
    } else {
      submitOrderList();
    }
  } else {
    return false;
  }
}

export function setDefaultListType() {
  return 'line';
}

export function getDefaultTabKey() {
  const newTabKey = 2;
  const oldTabKey = getStorage(getViewTypeStorageKey());
  if (!oldTabKey) {
    // 首次没有缓存明细，让拼单结算默认也为明细视图
    setStorage(getViewTypeStorageKey(), newTabKey);
  }
  return newTabKey;
}
