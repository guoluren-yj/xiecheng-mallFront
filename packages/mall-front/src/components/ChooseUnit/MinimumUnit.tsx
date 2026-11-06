/* eslint-disable no-unused-vars */
import React, { useMemo, useEffect, FC } from 'react';
import { Form, DataSet, Lov } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import { ds } from './ds';
import { IDimensionData } from './typings';
import { setInitData } from './utils';

interface IProps {
  unitDimensionData: IDimensionData;
  onRef: (dataSet: DataSet) => void;
  isNew?: boolean | undefined; // 无采买权限，新建
}

const MinimumUnit: FC<IProps> = (props) => {
  const { isNew, onRef, unitDimensionData } = props;
  const { currentList = [] } = unitDimensionData || {};

  const formDs = useMemo(() => {
    return new DataSet(ds({ fields: currentList }));
  }, [currentList]);

  useEffect(() => {
    setInitData({ dataSet: formDs, isNew });
  }, [formDs, currentList]);

  useEffect(() => {
    onRef(formDs);
  }, []);

  return (
    <Form dataSet={formDs} labelLayout={LabelLayout.float} columns={1}>
      {currentList.map((item) => (
        <Lov
          name={item.name}
          onChange={data => {
            if (data && formDs.current && item.name === 'PURCHASE_ORGANIZATION') {
              if (currentList.some(field => field.name === 'COMPANY')) { // 公司
                const currentField = currentList.find(field => field.name === 'COMPANY') || { lovViewInfo: { displayField: '', valueField: '' } };
                const { displayField, valueField } = currentField.lovViewInfo;
                if (data.companyId) {
                  formDs.current.set('COMPANY', {
                    [displayField]: data.companyName,
                    [valueField]: data.companyId,
                  });
                }
              }
              if (currentList.some(field => field.name === 'BUSINESS_ENTITY')) { // 业务实体
                const currentField = currentList.find(field => field.name === 'BUSINESS_ENTITY') || { lovViewInfo: { displayField: '', valueField: '' } };
                const { displayField, valueField } = currentField.lovViewInfo;
                if (data.ouId) {
                  formDs.current.set('BUSINESS_ENTITY', {
                    [displayField]: data.ouName,
                    [valueField]: data.ouId,
                  });
                }
              }
              if (currentList.some(field => field.name === 'INVENTORY_ORGANIZATION')) { // 库存组织
                const currentField = currentList.find(field => field.name === 'INVENTORY_ORGANIZATION') || { lovViewInfo: { displayField: '', valueField: '' } };
                const { displayField, valueField } = currentField.lovViewInfo;
                if (data.invOrganizationId) {
                  formDs.current.set('INVENTORY_ORGANIZATION', {
                    [displayField]: data.invOrganizationName,
                    [valueField]: data.invOrganizationId,
                  });
                }
              }
              if (currentList.some(field => field.name === 'PUR_ORGANIZATION')) { // 采购组织
                const currentField = currentList.find(field => field.name === 'PUR_ORGANIZATION') || { lovViewInfo: { displayField: '', valueField: '' } };
                const { displayField, valueField } = currentField.lovViewInfo;
                if (data.purOrganizationId) {
                  formDs.current.set('PUR_ORGANIZATION', {
                    [displayField]: data.purOrganizationName,
                    [valueField]: data.purOrganizationId,
                  });
                }
              }
            };
          }}
        />
      ))}
    </Form>
  );
};

export default MinimumUnit;
