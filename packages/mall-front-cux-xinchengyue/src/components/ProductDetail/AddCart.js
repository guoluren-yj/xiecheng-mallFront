import React, { useEffect, useState } from 'react';
import { isNil } from 'lodash';
import intl from 'mall-front/lib/utils/intl';
import { AddCartCom } from 'routes/NewProductDetail/productInfo/AddCart.js';
import { getUserConfigInfo } from 'utils/utils';
import request from 'utils/request';

function AddCart(props) {
  const { itemCode, setProductData, productId } = props;
  const [sapData, setSapData] = useState();
  const {
    organizationId,
    purchaseUnit: { invOrganizationCode, unitCode },
  } = getUserConfigInfo();
  useEffect(() => {
    if (isNil(itemCode)) {
      const url = `/marmot/v1/${organizationId}/marmot-api/y9QFXpQynFb7fUWeWJjmECibDIiaoyU7lo8AicZnTicTGfo?skuId=${productId}`;
      request(url).then((res) => {
        if (res) {
          setProductData((data) => ({
            ...data,
            itemCode: res?.itemCode,
          }));
        }
      });
    } else {
      const url = `/sitf/v1/${organizationId}/execute-exp/generic/scux-common2`;
      request(url, {
        method: 'POST',
        body: JSON.stringify({
          ouCode: invOrganizationCode,
          inventoryCode: unitCode,
          itemCode,
        }),
      }).then((res) => {
        if (res) {
          setSapData(res?.result || {});
        }
      });
    }
  }, [itemCode]);
  useEffect(() => {
    setProductData((data) => ({
      ...data,
      sapStock: sapData?.labst,
    }));
  }, [sapData]);

  return (
    <>
      <AddCartCom {...props} />
      {(!!sapData?.labst || sapData?.labst === 0) && (
        <div style={{ marginLeft: 90, marginTop: -18 }}>
          <span>{intl.get('mallf.productDetail.view.sapStock').d('SAP现有库存')}</span>
          <span>{sapData?.labst}</span>
        </div>
      )}
    </>
  );
}

export default AddCart;
