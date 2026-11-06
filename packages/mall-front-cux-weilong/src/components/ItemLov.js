import React, { useMemo } from 'react';
import { Lov, DataSet } from 'choerodon-ui/pro';
import { Icon as C7nIcon } from 'choerodon-ui';

export default function ItemLov({ product, setOrderData, orderIndex, productIndex, order }) {
  const lovDS = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'itemLov',
          type: 'object',
          lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
          lovPara: {
            invOrganizationId: order.invOrganizationId,
          },
        },
      ],
    });
  }, []);

  return (
    <>
      <p>
        <span>编码</span>：
        <span
          title={product.itemCode || '-'}
          className="text-overflow"
          style={{ display: 'inline-block', maxWidth: 105, position: 'relative', top: 5 }}
        >
          {product.itemCode}
        </span>
        {product.itemEditable && (
          <Lov
            dataSet={lovDS}
            funcType="flat"
            color="primary"
            name="itemLov"
            mode="button"
            clearButton={false}
            onChange={(lovData) => {
              setOrderData((data) => {
                const newData = [...data];
                const current = newData[orderIndex].shoppingCartDTOList[productIndex];
                newData[orderIndex].shoppingCartDTOList[productIndex] = {
                  ...current,
                  itemId: lovData?.itemId,
                  itemCode: lovData?.itemCode,
                  itemName: lovData?.itemName,
                };
                return newData;
              });
            }}
          >
            <C7nIcon style={{ fontSize: 14 }} type="mode_edit" />
          </Lov>
        )}
      </p>
      <p>名称：{product.itemName}</p>
    </>
  );
}
