import React, { useEffect, useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

const tableDs = () => {
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'productName',
        label: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
      },
      {
        name: 'totalQuantity',
        label: intl.get(`mallf.common.view.addCartQuantity`).d('加购数量'),
      },
      {
        name: 'canReceiveQuantity',
        label: intl.get(`mallf.common.view.canReceiveNum`).d('可领用数量'),
      },
    ],
  };
};

function ReceiveOverDetail(props) {
  const { data } = props;
  const tableDataSet = useMemo(() => {
    return new DataSet(tableDs());
  }, []);

  const columns = [
    {
      name: 'productName',
      width: 200,
    },
    {
      name: 'totalQuantity',
      width: 100,
    },
    {
      name: 'canReceiveQuantity',
    },
  ];

  useEffect(() => {
    tableDataSet.loadData(data);
  }, [data]);

  return <Table border={false} highLightRow={false} dataSet={tableDataSet} columns={columns} />;
}

export default ReceiveOverDetail;
