import React from 'react';
import { Form, Select, Tooltip, Icon } from 'choerodon-ui/pro';

import customizes from 'cuxTools/customizes';
import { getPrimaryColor } from 'utils/utils';
import intl from 'utils/intl';

export default function DefaultForm({ customizeForm, code, form, order, orderData }) {
  const syncAttributeVarchar10 = () => {
    const currentValue = order?.DS?.current?.get('attributeVarchar10');
    orderData.forEach((n) => {
      if (!n.DS?.current) return;
      n.DS.current.set('attributeVarchar10', currentValue);
    });
  };

  const changeList = customizes[code] || {};
  return (
    order.DS && (
      <>
        <Form dataSet={order.DS} labelLayout="float" columns={3}>
          <Select name="attributeVarchar10" />
          <Tooltip
            title={intl
              .get('mcux.common.view.attributeVarchar10.info')
              .d(
                '此操作会同步至所有预采申请单，如有预采申请单不属于此OA审批分类，请检查并手动修改！'
              )}
          >
            <Icon
              onClick={syncAttributeVarchar10}
              style={{ color: getPrimaryColor() }}
              type="sync"
            />
          </Tooltip>
        </Form>
        {customizeForm(
          { code, form, changeList, changeParams: { order } },
          <Form dataSet={order.DS} labelLayout="float" columns={3} style={{ marginTop: 15 }} />
        )}
      </>
    )
  );
}
