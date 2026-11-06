import { getCookie, generateUrlWithGetParam } from 'utils/utils';
import { fetchPayUrl } from '../../services';

const dedouCookie = getCookie('SRM-DEDOU') || {};

export const changeOrderData = ({ setOrderData, data }) => {
  setOrderData(
    data.map(p => ({
      ...p,
      attributeVarchar1: dedouCookie.employeeNum,
      attributeVarchar2: dedouCookie.name,
      attributeVarchar3: dedouCookie.orderId,
      attributeVarchar4: dedouCookie.nonceStr,
      attributeVarchar5: dedouCookie.fromSource,
    }))
  );
};

export const getPayUrl = ({ res }) => {
  fetchPayUrl([
    {
      nonceStr: dedouCookie.nonceStr,
      payFee: res.needPaymentAmount,
      batchNum: res.result,
      orderInfoJsonStr: res.orderJson,
    },
  ]).then(r => {
    if (r?.[0]?.payUrl) {
      window.location = generateUrlWithGetParam(r?.[0]?.payUrl, {
        waitTradeNo: r?.[0]?.waitTradeNo,
        accessToken: r?.[0]?.token,
      });
    }
  });
};
