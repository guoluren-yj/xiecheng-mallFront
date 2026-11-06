import React, { useEffect, useMemo } from 'react';
import { isEmpty } from 'lodash';
import { DataSet, Form, TextField } from 'choerodon-ui/pro';

export default function MapOmsForm({ preOrder = {} }) {
  const mapOmsHeaderFieldList = useMemo(() => {
    const { orderLineValue = {} } = preOrder.orderLineList[0] || {};
    const { headerCustomizedList = [] } = orderLineValue;
    return headerCustomizedList.filter((n) => n.mappingHeadFlag === 1);
  }, []);

  const initDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: mapOmsHeaderFieldList.map((f) => ({
          name: f.dimensionCode,
          label: f.dimensionName,
          type: 'string',
          disabled: true,
        })),
      }),
    [mapOmsHeaderFieldList]
  );

  useEffect(() => {
    const obj = {};
    mapOmsHeaderFieldList.forEach((field) => {
      obj[field.dimensionCode] = field.valueName || field.value;
    });
    initDs.current.set(obj);
  }, [mapOmsHeaderFieldList]);

  return (
    !isEmpty(mapOmsHeaderFieldList) && (
      <Form dataSet={initDs} labelLayout="float" columns={3} style={{ marginTop: 20 }}>
        {mapOmsHeaderFieldList.map((f) => {
          return <TextField name={f.dimensionCode} />;
        })}
      </Form>
    )
  );
}
