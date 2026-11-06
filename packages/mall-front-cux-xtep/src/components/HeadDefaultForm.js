import React, { useMemo, useEffect } from 'react';
import { DataSet, Form } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import request from 'utils/request';
import { getUserConfig, getUserConfigInfo } from 'utils/utils';

export default function DefaultForm({
  customizeForm,
  code,
  form,
  order,
  setCtxParams,
  setOrderData,
  orderIndex,
}) {
  const initDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [{ name: 'remark' }, { name: 'prTypeCode' }, { name: 'prTypeId' }],
        events: {
          update: ({ name, value, record }) => {
            if (name === 'attributeVarchar24Lov') {
              if (!isEmpty(value)) {
                const { organizationId } = getUserConfigInfo();
                const url = `/marmot/v1/${organizationId}/marmot-api/6QXubvibcpe2WwMZ3IfYZDNcOC8RKydt2wPa4TrzRAN0`;
                request(url, {
                  method: 'GET',
                  query: {
                    budget: value.code,
                  },
                }).then((res) => {
                  if (res) {
                    const { content = [] } = res;
                    if (content.length === 1) {
                      const { subjectId, subjectName } = content[0];
                      record.set({
                        attributeVarchar20: subjectId,
                        attributeVarchar20Meaning: subjectName,
                      });
                    } else {
                      record.set({
                        attributeVarchar20Lov: null,
                      });
                    }
                  }
                });
              } else {
                record.set({
                  attributeVarchar20Lov: null,
                });
              }
              setOrderData((data) => {
                const newOrderData = [...data];
                newOrderData[orderIndex].shoppingCartDTOList.forEach((s) => {
                  s.DS.set('attributeVarchar24Lov', value);
                });
                return newOrderData;
              });
            }
          },
        },
      }),
    []
  );
  useEffect(() => {
    setCtxParams({ ...getUserConfig() });
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].DS = initDs;
      return newOrderData;
    });
    if (initDs.current) {
      const { DS, ...other } = order;
      initDs.current.set({
        companyLov: order.companyLov,
        invOrganizationLov: order.invOrganizationLov,
        purchaseOrgLov: order.purchaseOrgLov,
        ouLov: order.ouLov,
        productSource: order.shoppingCartDTOList[0]?.productSource,
        ...other,
      });
    }
  }, [order]);
  return (
    <>{customizeForm({ code, form }, <Form dataSet={initDs} labelLayout="float" columns={3} />)}</>
  );
}
