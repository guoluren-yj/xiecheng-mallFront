import React from 'react';
import { isEmpty } from 'lodash';
import { Form, Lov, message } from 'choerodon-ui/pro';

import { fetchAssigns } from 'services/api';

export default function DefaultForm(props) {
  const { visible, product, code, dataSet, cSupply } = props;
  return (
    <>
      {visible && product.DS !== undefined
        ? cSupply(
            { code, dataSet },
          <Form record={product.DS} labelLayout="float" columns={1}>
            <Lov
              name="attributeVarchar5Lov"
              onChange={(data) => {
                  if (!isEmpty(data)) {
                    fetchAssigns(data?.employeeId).then((res) => {
                      const assign = res?.[0] || {};
                      product.DS.set('attributeVarchar2', assign.positionName);
                      product.DS.set('attributeVarchar2Meaning', assign.positionName);
                    });
                    product.DS.set('attributeBigint1', data?.unitId);
                    product.DS.set('attributeBigint1Meaning', data?.unitName);
                    product.DS.set('attributeVarchar7', data?.unitCode);
                  } else {
                    product.DS.set('attributeVarchar2', '');
                    product.DS.set('attributeVarchar2Meaning', '');
                    product.DS.set('attributeBigint1', '');
                    product.DS.set('attributeBigint1Meaning', '');
                    product.DS.set('attributeVarchar7', '');
                  }
                }}
            />
            <Lov
              name="attributeVarchar2Lov"
              onChange={(data) => {
                  product.DS.set('attributeBigint1', data?.unitId);
                  product.DS.set('attributeBigint1Meaning', data?.unitName);
                  product.DS.set('attributeVarchar7', data?.unitCode);
                }}
            />
            <Lov name="attributeVarchar3Lov" />
            <Lov
              name="attributeBigint1Lov"
              onChange={() => {
                  dataSet.current.set('attributeVarchar4', '');
                  dataSet.current.set('attributeVarchar4Meaning', '');
                }}
            />
            <Lov name="attributeVarchar4Lov" />
            <Lov
              name="attributeVarchar6Lov"
              onChange={(data) => {
                  if (
                    !isEmpty(data) &&
                    product.DS.get('attributeVarchar10') &&
                    data?.unitCode !== product.DS.get('attributeVarchar10')
                  ) {
                    message.error(
                      '职能管控部门和职能管控部门联系人所在部门不一致，如确认无误，请点击“保存”继续提交',
                      3,
                      undefined,
                      'bottomRight'
                    );
                  } else {
                    message.destroy();
                  }
                }}
            />
          </Form>
          )
        : null}
    </>
  );
}
