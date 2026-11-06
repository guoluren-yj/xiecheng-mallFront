import React, { useMemo } from 'react';
import { Table, DataSet, Icon } from 'choerodon-ui/pro';

// import intl from 'utils/intl';
import { numberRender } from 'mall-front/lib/utils/utils';
import ds from './ds';

export default function OutTable(props) {
  const { currentStatus, pointName, pointsTypeId } = props;

  const initDs = useMemo(() => {
    return new DataSet(ds({ pointName, pointsTypeId }).out);
  }, [pointsTypeId]);

  const columns = [
    { name: 'creationDate' },
    {
      name: 'operationIntegralTotal',
      renderer: ({ value }) => (
        <span className="price-color">
          <Icon style={{ fontSize: 12, marginTop: -2 }} type="donut_small" />
          {numberRender(Math.abs(value))}
        </span>
      ),
    },
    { name: 'sourceCode' },
  ];

  return (
    <div style={{ display: currentStatus === 'out' ? 'block' : 'none' }}>
      {/* <p className="sigl-content-title">
        {intl.get('mallf.mySigl.view.sigl.out', { name: pointName }).d(`累计支出${pointName}`)}
      </p> */}
      <Table dataSet={initDs} columns={columns} selectionMode="none" />
    </div>
  );
}
