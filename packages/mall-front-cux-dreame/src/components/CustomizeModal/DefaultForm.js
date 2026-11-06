import React from 'react';
import { Form, TextField, Select, Message } from 'choerodon-ui/pro';
import { Icon as C7nIcon } from 'choerodon-ui';
import { getPrimaryColor } from 'utils/utils';
import intl from 'utils/intl';

export default function DefaultForm(props) {
  const { visible, product, products, code, dataSet, cSupply } = props;

  const getIcon = (type) => {
    return (
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
                <TextField name="attributeVarchar1" addonAfter={getIcon('attributeVarchar1')} />
                <TextField name="attributeVarchar2" addonAfter={getIcon('attributeVarchar2')} />
                <Select name="attributeVarchar17" addonAfter={getIcon('attributeVarchar17')} />
              </Form>
            )
        : null}
    </>
  );
}
