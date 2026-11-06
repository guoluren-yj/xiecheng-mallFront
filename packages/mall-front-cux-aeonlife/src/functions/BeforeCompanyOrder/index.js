import React from 'react';
import { Attachment } from 'choerodon-ui/pro';

/* eslint-disable no-param-reassign */
import request from 'mall-front/lib/utils/request';
import { getOrganizationId } from 'mall-front/lib/utils/utils';
import { accept } from 'utils/constants';
import intl from 'utils/intl';

export const changeOrderData = ({ setOrderData, data }) => {
  setOrderData(data);
  const skuIds = data
    .map((n) => n.shoppingCartDTOList)
    .flat()
    .map((m) => m.productId);
  setTimeout(() => {
    request(`/smpc/v1/${getOrganizationId()}/aeonlife-smpc-catalogs/fetch-catalog-default`, {
      method: 'POST',
      body: JSON.stringify(Array.from(skuIds)),
    }).then((res) => {
      setOrderData((orderData) => {
        orderData.forEach((order) => {
          order.shoppingCartDTOList.forEach((product) => {
            const { expenseDetailCode, expenseDetailName } =
              res.find((r) => r.skuId === product.productId) || {};
            if (product.DS) {
              product.DS.set('attributeVarchar1Lov', {
                expenseDetailCode,
                expenseDetailName,
              });
            }
          });
        });
        return orderData;
      });
    });
  }, 1000);
};

export function attachmentRender({ imageUuid }) {
  return (
    <Attachment
      labelLayout="float"
      showHistory
      viewMode="list"
      value={imageUuid}
      bucketName="private-bucket"
      bucketDirectory="mall-front"
      onChange={(e) => e}
      sortable
      accept={accept}
      help={intl
        .get('mallf.common.view.attProps.help', { accept, maxSize: '5M' })
        .d(`支持${accept}格式，且不能大于${'5M'}`)}
      fileSize={1024 * 1024 * 5}
    />
  );
}
