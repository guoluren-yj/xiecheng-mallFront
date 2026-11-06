import React, { useState, useEffect, useRef } from 'react';
import { Spin } from 'choerodon-ui';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
// import { getUserConfigInfo } from 'utils/utils';
import { fetchPriceDetailService } from 'services/newCartService';

const tableDs = () => {
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'taxIncludedPrice',
        label: intl.get(`mallf.common.view.newCart.price`).d('价格'),
      },
      {
        name: 'unitName',
        label: intl.get(`mallf.common.view.organization.name`).d('组织名称'),
      },
      {
        name: 'fullAddress',
        label: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
      },
    ],
  };
};

function PriceDetail(props) {
  const { cartId, count } = props;
  const [loading, setLoading] = useState(false);
  const tableDataSet = useRef(new DataSet(tableDs())).current;

  const columns = [
    {
      name: 'taxIncludedPrice',
      width: 150,
      align: 'right',
    },
    {
      name: 'unitName',
      width: 150,
    },
    {
      name: 'fullAddress',
    },
  ];

  useEffect(() => {
    setLoading(true);
    fetchPriceDetailService(cartId)
      .then((res) => {
        if (res) {
          tableDataSet.loadData(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [count]);

  return (
    <Spin spinning={loading}>
      <Table highLightRow={false} dataSet={tableDataSet} columns={columns} />
    </Spin>
  );
}

export default PriceDetail;
