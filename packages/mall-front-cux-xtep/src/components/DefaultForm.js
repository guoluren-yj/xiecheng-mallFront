import React from 'react';
import { Form, Lov, Message, Tooltip } from 'choerodon-ui/pro';
import { Icon as C7nIcon } from 'choerodon-ui';
import { getPrimaryColor } from 'utils/utils';
import intl from 'utils/intl';

export default function DefaultForm(props) {
  const { visible, product, products, code, dataSet, cSupply } = props;

  const getIcon = (type) => {
    return (
      <Tooltip
        title={intl.get('mallf.common.view.neededDate.info').d('可同步至该采购申请下的所有商品行')}
      >
        <C7nIcon
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
              <Lov name="attributeVarchar24Lov" addonAfter={getIcon('attributeVarchar24Lov')} />
              <Lov name="attributeVarchar25Lov" addonAfter={getIcon('attributeVarchar25Lov')} />
              <Lov name="attributeVarchar26Lov" addonAfter={getIcon('attributeVarchar26Lov')} />
            </Form>
            )
        : null}
    </>
  );
}
