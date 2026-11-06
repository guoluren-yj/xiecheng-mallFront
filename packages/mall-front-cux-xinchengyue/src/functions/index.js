import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';

export function cuxHeaderList({ headerList, product = {}, organizationId }) {
  const newHeaderList = headerList.map((n) => {
    if (n.dimensionCode === 'sapStock') {
      return {
        ...n,
        headerNum: 1,
        tenantId: organizationId,
        value: product?.sapStock,
      };
    }
    return n;
  });
  return newHeaderList;
}

export function allocationCreate({ ds, data = {}, product }) {
  const { sapStock } = product || {};
  ds.create({ ...data, sapStock }, 0);
}

export async function submitValid({ params, setSubmitLoading, setOrderData }) {
  setSubmitLoading(true);
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/y9QFXpQynFb7fUWeWJjmEOwwAmibrX3nqeeoS9kvVvick`;
  try {
    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    const errFlag = res.some((n) => n.orderInfo?.flag === '1');
    if (errFlag) {
      // 标准else里面有个setOrderData
      setTimeout(() => {
        setOrderData((data) => {
          return data.map((m, index) => {
            const { message } = res[index]?.orderInfo || {};
            return {
              ...m,
              message,
            };
          });
        });
        setTimeout(() => {
          const errorsetTop =
            document.getElementsByClassName('order-header-error-mesage')?.[0]?.offsetTop || 0;
          document.body.scrollTop = errorsetTop;
        }, 10);
      }, 500);
    }
    setSubmitLoading(false);
    return !errFlag;
  } catch {
    setSubmitLoading(false);
    return false;
  }
}
