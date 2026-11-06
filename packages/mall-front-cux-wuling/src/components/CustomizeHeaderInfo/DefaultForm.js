import React from 'react';
import { Form, TextField, Tooltip, Icon, Message } from 'choerodon-ui/pro';
import customizes from 'cuxTools/customizes';
import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';

function DefaultForm({ customizeForm, code, form, order, orderData }) {
  const changeList = customizes[code] || {};
  const getIcon = (type) => {
    return (
      <Tooltip
        title={intl.get('mcux.common.view.orderCustom.info.sync').d('此操作会同步至所有预采申请单')}
      >
        <Icon
          onClick={() => {
            const currentValue = order.DS?.current?.get(type);
            orderData.forEach((i) => {
              if (i.DS.current) {
                i.DS.current.set(type, currentValue);
              }
            });
            Message.success(intl.get(`mcux.common.view.batchAlready`).d(`已批量`));
          }}
          style={{ color: getPrimaryColor() }}
          type="sync"
        />
      </Tooltip>
    );
  };
  return (
    <>
      {order.DS &&
        (orderData.length > 1
          ? customizeForm(
              { code, form, changeList, changeParams: { order } },
            <Form dataSet={order.DS} labelLayout="float" columns={3}>
              <TextField name="attributeVarchar3" addonAfter={getIcon('attributeVarchar3')} />
              <TextField name="attributeVarchar11" addonAfter={getIcon('attributeVarchar11')} />
            </Form>
            )
          : customizeForm(
              { code, form, changeList, changeParams: { order } },
            <Form dataSet={order.DS} labelLayout="float" columns={3} />
            ))}
    </>
  );
}

export default DefaultForm;
