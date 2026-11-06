/* eslint-disable no-param-reassign */
import React, { useMemo, useEffect } from 'react';
import { Lov, DataSet } from 'choerodon-ui/pro';
import { Icon as C7nIcon, Tooltip } from 'choerodon-ui';

import { getPrimaryColor, getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';

export default function ProjectNum({
  order,
  setOrderData,
  orderIndex,
  product,
  productIndex,
  form,
  FormItem,
}) {
  product.productNumDs = useMemo(() => {
    const { organizationId } = getUserConfigInfo();
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'projectNumLov',
          type: 'object',
          lovCode: 'SPCM.PROJECT',
          label: '项目号',
          required: true,
          lovPara: {
            companyId: order.companyId,
            tenantId: organizationId,
          },
        },
        {
          name: 'attributeVarchar1',
          bind: 'projectNumLov.projectNum',
        },
        {
          name: 'attributeVarchar1Meaning',
          bind: 'projectNumLov.projectName',
        },
      ],
    });
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      [`projectNumLov${productIndex}`]: product.attributeVarchar1,
    });
  }, [product.attributeVarchar1]);

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
              current.attributeVarchar1 = lovData?.projectNum;
              current.attributeVarchar1Meaning = lovData?.projectName;
              product.DS.set('attributeVarchar1', lovData?.projectNum);
              return newData;
            });
          }}
        />
        {order.shoppingCartDTOList?.length > 1 && (
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
                    p.attributeVarchar1 = product.attributeVarchar1;
                    p.attributeVarchar1Meaning = product.attributeVarchar1Meaning;
                    const lovData = product.productNumDs.current.toData();
                    p.productNumDs.loadData([lovData]);
                    p.DS.set('attributeVarchar1', lovData.attributeVarchar1);
                  });
                  return newData;
                });
              }}
              style={{ marginLeft: 12, color: getPrimaryColor() }}
              type="sync"
            />
          </Tooltip>
        )}
      </div>
      <FormItem>
        {form.getFieldDecorator(`projectNumLov${productIndex}`, {
          rules: [
            {
              required: true,
              message: '项目号不能为空',
            },
          ],
        })(<div />)}
      </FormItem>
    </div>
  );
}
