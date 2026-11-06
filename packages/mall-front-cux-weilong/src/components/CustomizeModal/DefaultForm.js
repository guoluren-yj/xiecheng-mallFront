import React from 'react';
import { Form, TextField, Message, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { getPrimaryColor } from 'utils/utils';
import intl from 'utils/intl';

export default function DefaultForm(props) {
  const { visible, product, products, code, dataSet, cSupply } = props;

  const getIcon = (type) => {
    return (
      <Tooltip
        title={intl.get('mallf.common.view.neededDate.info').d('可同步至该采购申请下的所有商品行')}
      >
        <Icon
          onClick={() => {
            const currentValue = product.DS?.get(type);
            products.forEach((i) => {
              if (i.DS) {
                i.DS.set(type, currentValue);
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
      {visible && product.DS !== undefined
        ? products.length === 1
          ? cSupply({ code, dataSet }, <Form record={product.DS} labelLayout="float" columns={1} />)
          : cSupply(
              { code, dataSet },
            <Form record={product.DS} labelLayout="float" columns={1}>
              <TextField name="remark" addonAfter={getIcon('remark')} />
              <TextField name="attributeVarchar1" addonAfter={getIcon('attributeVarchar1')} />
            </Form>
            )
        : null}
    </>
  );
}
