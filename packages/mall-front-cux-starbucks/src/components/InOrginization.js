/* eslint-disable no-param-reassign */
import React, { useMemo, useEffect } from 'react';
import { Lov, DataSet } from 'choerodon-ui/pro';
// import { Icon as C7nIcon, Tooltip } from 'choerodon-ui';

import { getUserConfigInfo } from 'utils/utils';
// import intl from 'utils/intl';

export default function ProjectNum({
  order,
  setOrderData,
  orderIndex,
  product,
  productIndex,
  form,
  FormItem,
  dataSet,
}) {
  product.productNumDs = useMemo(() => {
    const { organizationId } = getUserConfigInfo();
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'projectNumLov',
          type: 'object',
          lovCode: 'SMAL.USER_AUTH.INVORG',
          label: '库存组织',
          required: true,
          lovPara: {
            ouId: order.ouId,
            tenantId: organizationId,
          },
        },
        {
          name: 'attributeBigint1',
          bind: 'projectNumLov.organizationId',
        },
        {
          name: 'attributeBigint1Meaning',
          bind: 'projectNumLov.organizationName',
        },
      ],
    });
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      [`projectNumLov${productIndex}`]: product.attributeBigint1,
    });
  }, [product.attributeBigint1]);

  return (
    <div className="columns-item" style={{ paddingTop: 10 }}>
      <div>
        <Lov
          style={{ width: 130 }}
          dataSet={product.productNumDs}
          name="projectNumLov"
          onChange={(lovData) => {
            setOrderData((data) => {
              const newData = [...data];
              const current = newData[orderIndex].shoppingCartDTOList[productIndex];
              current.attributeBigint1 = lovData?.organizationId;
              current.attributeBigint1Meaning = lovData?.organizationName;
              product.DS = product.DS || dataSet.create({});
              product.DS.set('attributeBigint1', lovData?.organizationId);
              return newData;
            });
          }}
        />
        {/* {order.shoppingCartDTOList?.length > 1 && (
          <Tooltip
            title={intl
              .get('mallf.common.view.neededDate.info')
              .d('可同步至该采购申请下的所有商品行')}
          >
            <C7nIcon
              onClick={() => {
                setOrderData((data) => {
                  const newData = [...data];
                  newData[orderIndex].shoppingCartDTOList.forEach((p) => {
                    p.attributeBigint1 = product.attributeBigint1;
                    p.attributeBigint1Meaning = product.attributeBigint1Meaning;
                    const lovData = product.productNumDs.current.toData();
                    p.productNumDs.loadData([lovData]);
                    p.DS.set('attributeBigint1', lovData.attributeBigint1);
                  });
                  return newData;
                });
              }}
              style={{ marginLeft: 12, color: getPrimaryColor() }}
              type="sync"
            />
          </Tooltip>
        )} */}
      </div>
      <FormItem>
        {form.getFieldDecorator(`projectNumLov${productIndex}`, {
          rules: [
            {
              required: true,
              message: '库存组织不能为空',
            },
          ],
        })(<div />)}
      </FormItem>
    </div>
  );
}
