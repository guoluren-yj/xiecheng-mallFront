import React, { useMemo } from 'react';
import { Icon, Lov, DataSet } from 'choerodon-ui/pro';

import cuxComponent from 'cuxTools/cuxComponent';
import { getPrimaryColor } from 'utils/utils';

function PrTypeLov(props) {
  const {
    prTypeConfig,
    prTypeVisible,
    order,
    setPrTypeVisible,
    setOrderData,
    orderIndex,
    setRemarkVisible,
    setState,
  } = props;

  const lovDS = useMemo(() => {
    return new DataSet({
      data: [{ prTypeIdLov: { prTypeId: order.prTypeId, prTypeName: order.prTypeName } }],
      fields: [
        {
          name: 'prTypeIdLov',
          type: 'object',
          lovCode: 'SPUC.PR_DEMAND_TYPE',
          textField: 'prTypeName',
          valueField: 'prTypeId',
          required: prTypeConfig.required === 1,
          label: prTypeConfig.label,
          lovPara: {
            storeNo: order.storeNo,
          },
        },
      ],
    });
  }, []);

  return (
    <>
      {prTypeVisible ? (
        <Lov
          name="prTypeIdLov"
          dataSet={lovDS}
          onChange={(data) => {
            setPrTypeVisible(false);
            setOrderData((orderData) => {
              const newOrderData = [...orderData];
              newOrderData[orderIndex].prTypeId = data?.prTypeId;
              newOrderData[orderIndex].prTypeName = data?.prTypeName;
              newOrderData[orderIndex].prTypeCode = data?.prTypeCode;
              newOrderData[orderIndex].hiddenTypeWarning = true;
              if (!newOrderData[orderIndex].DS) return newOrderData;
              newOrderData[orderIndex].DS.current.set('prTypeId', data?.prTypeId);
              newOrderData[orderIndex].DS.current.set('prTypeCode', data?.prTypeCode);
              newOrderData[orderIndex].DS.current.set('prTypeName', data?.prTypeName);
              return newOrderData;
            });
          }}
        />
      ) : (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <span className="text-overflow">{order.prTypeName || '-'}</span>
          {prTypeConfig.editable !== 0 && (
            <Icon
              style={{ color: getPrimaryColor(), fontSize: 14, marginTop: -4, marginLeft: 10 }}
              type="mode_edit"
              onClick={() => {
                setPrTypeVisible(true);
                setRemarkVisible(false);
                setState({
                  wholeOrderFlagVisible: false,
                });
              }}
            />
          )}
        </span>
      )}
    </>
  );
}

export default cuxComponent({ path: 'NewBeforeOrder/PurchaseHeaderDetail/PrTypeLov' })(PrTypeLov);
