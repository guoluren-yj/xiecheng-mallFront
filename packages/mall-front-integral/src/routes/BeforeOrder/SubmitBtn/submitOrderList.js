/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
import { isEmpty } from 'lodash';
import HmallConfig from 'utils/api-config';
import { getOrganizationId, getHeader } from 'utils/utils';
import Swal from 'components/swal';
import intl from 'utils/intl';
import { gotoPayUrl } from 'mall-front/lib/utils/utils';

/**
 * 提交采购预申请
 */
const submitOrderList = (params) => {
  const { setOrderData, orderData, setSubmitLoading, history } = params;
  // 提交采购预申请
  // 过滤掉不符合最小下单金额的数据
  const data = orderData.filter((item) => item.minPurchaseFlag !== 0);

  const productRemarkError = [];

  if (!isEmpty(productRemarkError)) {
    setOrderData(data);
    return;
  }
  const newOrderData = orderData.map((n) => {
    return {
      ...n,
      returnUrl: `${window.location.origin}/sigl/my-mall/my-order`,
      innerInvoiceEmail: n.innerCompanyInvoiceVO?.innerInvoiceEmail,
      invoiceRemark: n.innerCompanyInvoiceVO?.invoiceRemark,
    };
  });
  setSubmitLoading(true);
  fetch(
    `${HmallConfig.apiGateway}/${
      HmallConfig.serviceName
    }/v1/${getOrganizationId()}/member/pre-order`,
    {
      method: 'POST',
      headers: getHeader({
        'Content-type': 'application/json;charset=UTF-8',
      }),
      body: JSON.stringify(newOrderData),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      if (res) {
        const resultMsg = {
          failed: res.failed || false,
          fieldMsg: res.message || '',
          lotNum: res.result,
          ...res,
        };
        if (res.paymentOrderNum && (res.cashierHtml || res.cashierUri)) {
          gotoPayUrl(res);
        } else {
          const newPath = `${HmallConfig.contextPath}/sigl/apply-result`;
          setTimeout(() => {
            history.push({
              pathname: newPath,
              resultMsg,
            });
          }, 1000);
        }
      }
    })
    .catch(() => {
      setSubmitLoading(false);
      Swal(
        intl.get(`mallf.companyOrder.model.companyOrder.createPurchaseErr`).d('生成采购申请失败')
      );
    });
};

export default submitOrderList;
