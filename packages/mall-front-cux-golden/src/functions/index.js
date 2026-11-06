import { useEffect } from 'react';
import qs from 'qs';
import { filterNullValueObject, setCookie, getCookie } from 'utils/utils';
import Swal from 'components/swal';

export const layoutInit = () => {
  const search = qs.parse(window.location.search.substring(1)) || {};
  if (search.requestId) {
    setCookie('SRM-GOLDEN', filterNullValueObject(search));
  }
};

export function CustomizeHeaderInfoInit({ order }) {
  useEffect(() => {
    if (order.DS) {
      const { requestId, costCenter, department } = getCookie('SRM-GOLDEN') || {};
      order.DS.current.set({
        attributeVarchar1: requestId,
        attributeVarchar2: costCenter,
        attributeVarchar3: department,
      });
    }
  }, [order.DS]);
}

/**
 * 【高顿教育】预采提交前校验 OA requestId 是否存在
 * 使用标准二开埋点 BeforeCompanyOrder-fn-submitValid
 * 双层校验：Cookie + DS 字段 attributeVarchar1
 */
export async function submitValidate({ params, setSubmitLoading }) {
  // 第一层：Cookie 校验（SSO 参数是否成功保存）
  const { requestId } = getCookie('SRM-GOLDEN') || {};
  // 第二层：DS 字段校验（CustomizeHeaderInfoInit 是否已将 requestId 写入订单数据）
  const dsValid = params?.length > 0 && params.every((p) => p?.orderExtraInfo?.attributeVarchar1);

  if (!requestId || !dsValid) {
    setSubmitLoading(false);
    Swal('OA数据传输错误，请关闭此电商平台下单网页，重新登录OA采购申请，单点登录至电商平台下单。');
    return false;
  }
  return true;
}
