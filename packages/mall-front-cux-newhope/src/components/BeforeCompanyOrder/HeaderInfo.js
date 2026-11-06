import React, { useMemo, useEffect } from 'react';
import { getUserConfig } from 'utils/utils';

import intl from 'utils/intl';
import MapOmsForm from 'mall-front/lib/routes/NewBeforeOrder/CustomizeHeaderInfo/MapOmsForm';
import style from 'mall-front/lib/routes/NewBeforeOrder/CustomizeHeaderInfo/index.less';
import DefaultForm from './DefaultForm';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
function HeaderInfo(props) {
  const {
    setOrderData,
    orderIndex,
    form,
    order,
    customizeForm,
    code,
    setCtxParams,
    orderData,
    preOrder = {},
  } = props;

  useEffect(() => {
    setCtxParams({ ...getUserConfig() });
  }, [order]);

  const itemsProps = {
    formLayout,
    form,
    order,
    customizeForm,
    code,
    setCtxParams,
    setOrderData,
    orderIndex,
    orderData,
  };

  const CusForm = useMemo(() => <DefaultForm {...itemsProps} />, [
    formLayout,
    form,
    order,
    customizeForm,
    code,
    setCtxParams,
    setOrderData,
    orderIndex,
    orderData,
    // initDs,
  ]);

  return (
    <div className={style['header-info']}>
      <p className="header-info-title">
        {intl.get('mallf.common.apply.fill.info').d('采购申请补充信息')}
      </p>
      {CusForm}
      <MapOmsForm preOrder={preOrder} />
    </div>
  );
}

export default HeaderInfo;
