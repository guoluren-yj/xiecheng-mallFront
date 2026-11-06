import { useEffect } from 'react';
import Swal from 'components/swal';

export function initPreDs({ formDs, orderData = {} }) {
  function handleFieldValueList(type, fieldCode) {
    const list = orderData.openOrderInfo.orderLineList.reduce((pre, curr) => {
      const filedList = type === 'head' ? curr.headerValueList : curr.lineValueList;
      const { value } = (filedList || []).find((n) => n.dimensionCode === fieldCode) || {};
      if (value) pre.push(value);
      return pre;
    }, []);
    return list;
  }
  function setFormData() {
    const lineAmount = handleFieldValueList('line', 'taxIncludedAmount'); // 部门
    formDs.current.set({
      attributeVarchar2: lineAmount.some((p) => +p > 5000) ? '1' : '0',
    });
  }
  useEffect(() => {
    if (orderData.openOrderInfo) {
      formDs.addEventListener('load', setFormData);
    }
    return () => {
      formDs.removeEventListener('load', setFormData);
    };
  }, []);
}

export function beforeHandleSubmit({ formDs, handleSubmit }) {
  const attributeVarchar2 = formDs?.current?.get('attributeVarchar2');
  if (+attributeVarchar2 === 1) {
    Swal(`当前单品金额超5000，请确认是否提交`, true).then((res) => {
      if (res.value) {
        handleSubmit();
      }
    });
  } else {
    handleSubmit();
  }
}
