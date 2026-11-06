import React, { useMemo, useEffect } from 'react';
import { isEmpty } from 'lodash';
import cuxComponent from 'cuxTools/cuxComponent';
import intl from 'utils/intl';
import { getUserConfig } from 'utils/utils';
import style from './index.less';
import DefaultForm from './DefaultForm';
import MapOmsForm from './MapOmsForm';

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
    unitConfig,
  } = props;

  // 头映射维度
  const mapOmsHeaderFieldList = useMemo(() => {
    const { orderLineValue = {} } = preOrder.orderLineList[0] || {};
    const { headerCustomizedList = [] } = orderLineValue;
    return headerCustomizedList.filter((n) => n.mappingHeadFlag === 1);
  }, [preOrder]);

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
    <div>
      <div
        className={style['header-info']}
        r-if={
          unitConfig[code]?.fields?.some((f) => f.visible === 1) || !isEmpty(mapOmsHeaderFieldList)
        }
      >
        <p className="header-info-title">
          {intl.get('mallf.common.apply.fill.info').d('采购申请补充信息')}
        </p>
        {CusForm}
        <MapOmsForm preOrder={preOrder} />
      </div>
    </div>
  );
}

export default cuxComponent({ path: 'NewBeforeOrder/CustomizeHeaderInfo/HeaderInfo' })(HeaderInfo);
