import React, { useMemo, useEffect } from 'react';
import { DataSet, Form, Lov } from 'choerodon-ui/pro';

import { getUserConfig } from 'utils/utils';

export default function DefaultForm({
  customizeForm,
  code,
  form,
  setCtxParams,
  setOrderData,
  orderIndex,
}) {
  const initDs = useMemo(() => {
    const fields = [];
    return new DataSet({ autoCreate: true, fields });
  }, []);
  useEffect(() => {
    setCtxParams({ ...getUserConfig() });
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].DS = initDs;
      return newOrderData;
    });
  }, []);

  return (
    <>
      {customizeForm(
        { code, form },
        <Form dataSet={initDs} labelLayout="float" columns={3}>
          <Lov
            name="attributeVarchar2Lov"
            onChange={(data) => {
              initDs.current.set('attributeVarchar1', data?.value);
            }}
          />
        </Form>
      )}
    </>
  );
}
