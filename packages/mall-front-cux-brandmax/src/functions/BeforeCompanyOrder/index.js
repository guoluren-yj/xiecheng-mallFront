import { isEmpty } from 'lodash';
import Swal from 'components/swal';

import intl from 'utils/intl';
import { invoiceCheckService, getSourceKeyService } from 'services/cartService';

export function invoiceCheckData({ order, invoiceCheckData: data }) {
  return (
    (!isEmpty(data) &&
      data.find(
        (n) =>
          n.proxyCompanyId ===
          order.shoppingCartDTOList[0].brandmaxBudgetInfoList?.[0]?.brandmaxCompanyId
      )) ||
    {}
  );
}

export function promisGetInvoice({
  orderData = [],
  setSourceKeyList,
  setInvoiceCheckData,
  setCount,
}) {
  getSourceKeyService().then(async (sourceKeyList) => {
    setSourceKeyList(sourceKeyList);
    if (sourceKeyList) {
      const proxyCompanyList = new Set(
        orderData
          .map((n) => n.shoppingCartDTOList[0].brandmaxBudgetInfoList?.[0]?.brandmaxCompanyId)
          .filter((n) => n)
      );
      if (!isEmpty(Array.from(proxyCompanyList)) && !isEmpty(sourceKeyList)) {
        const fetchInnerCompanyInvoice = Array.from(proxyCompanyList).map((proxyCompanyId) => {
          const { sourceKey } = sourceKeyList.find((r) => r.companyId === proxyCompanyId) || {};
          return new Promise((resolve) => {
            invoiceCheckService({ sourceKey }).then((res) =>
              resolve({
                ...res,
                proxyCompanyId,
              })
            );
          });
        });
        const newCompanyInvoice = await Promise.all(fetchInnerCompanyInvoice).then((r) => {
          return r;
        });
        setInvoiceCheckData(newCompanyInvoice);
        setCount((c) => c + 1);
      }
    }
  });
}

export function confirmSwal({ orderData, submitOrderList }) {
  const hasEcProduct = orderData.some((order) =>
    order.shoppingCartDTOList.some(
      (product) => product.productSource !== 'CATA' && !product.qtHeaderNo
    )
  );
  const confirmMessage = hasEcProduct
    ? intl
        .get(`mallf.companyOrder.model.ECwraning.confirm`)
        .d('请7天内完成申请单审批，7天内无法完成电商会取消商品预占，需要重新提交！')
    : intl
        .get(`mallf.companyOrder.model.companyOrder.confirmCreatePurchase`)
        .d('确定生成采购申请！');
  Swal(confirmMessage, true).then((result) => {
    if (result.value) submitOrderList();
  });
}
