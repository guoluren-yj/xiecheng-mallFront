import React, { useMemo, useEffect } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';

import ProductListDataSet from './ProductListDataSet';
import SearchInput from './SearchInput';
import ProductList from './ProductList';
import './index.less';

function ProductListModal({ alloctionDs, templateId, modal }) {
  const ds = useMemo(
    () =>
      new ProductListDataSet(
        {
          paging: false,
          autoQuery: false,
        },
        { templateId }
      ),
    []
  );

  useEffect(() => {
    ds.queryData();
  }, []);

  modal.handleOk(() => ds.handleSelectProduct(alloctionDs));

  return (
    <Spin dataSet={ds}>
      <div>
        <SearchInput dataSet={ds} />
        <Observer>{() => <ProductList productData={ds.toData()} dataSet={ds} />}</Observer>
      </div>
    </Spin>
  );
}

export default ProductListModal;
