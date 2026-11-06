import React, { useEffect, useState, useLayoutEffect } from 'react';

import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';
import { AddCartCom } from 'routes/NewProductDetail/productInfo/AddCart.js';
import { queryERPStock } from '../services';

function AddCart(props) {
  const { itemCode, operationAuth } = props || {};
  const [ERPStock, setERPStock] = useState('');
  const { companyId } = getUserConfigInfo();
  useEffect(() => {
    queryERPStock({
      company: companyId,
      materialCode: itemCode || 0,
    }).then((res) => {
      setERPStock(res?.data[0]?.CurQuanBalance);
    });
  }, []);
  useLayoutEffect(() => {
    if (operationAuth !== 'VIEW' && document.querySelector('.stock-info')) {
      document.querySelector('.stock-info').style.display = 'none';
    }
  }, [operationAuth, document.querySelector('.stock-info')]);
  return (
    <>
      <AddCartCom {...props} />
      <div style={{ marginLeft: 90 }}>
        <span>{intl.get('mallf.productDetail.view.ERPStock').d('ERP库存：')}</span>
        {ERPStock || '-'}
      </div>
    </>
  );
}
export default AddCart;
