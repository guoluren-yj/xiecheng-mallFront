import React from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';

function SearchInput({ dataSet }) {
  return (
    <div>
      <TextField
        prefix={<Icon style={{ margin: '0 10px', cursor: 'pointer' }} type="search" />}
        clearButton
        // value={dataSet.requestCode}
        onChange={(value) => {
          dataSet.searchProduct(value);
        }}
        style={{ width: 340 }}
        placeholder={intl.get('mallf.common.view.search.productName').d('请输入商品名称查询')}
      />
    </div>
  );
}

export default SearchInput;
