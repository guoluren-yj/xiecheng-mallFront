import React, { useMemo } from 'react';
import { Table, DataSet, Icon } from 'choerodon-ui/pro';

// import intl from 'utils/intl';
import Icons from 'mall-front/lib/components/Icons';
import { numberRender } from 'mall-front/lib/utils/utils';
import ds from './ds';

export default function AllTable(props) {
  const { currentStatus, pointName, pointsTypeId } = props;

  const initDs = useMemo(() => {
    return new DataSet(ds({ pointName, pointsTypeId }).all);
  }, [pointsTypeId]);

  const columns = [
    { name: 'creationDate' },
    {
      name: 'operationTypeMeaning',
      width: 100,
      renderer: ({ value, record }) => {
        return (
          <>
            <span>{value}</span>
            {record.get('operationIntegralTotal') > 0 ? (
              <Icons type="prise_rise" size="10" style={{ color: '#47B883' }} />
            ) : (
              <Icons type="prise_down" size="10" style={{ color: '#F56649' }} />
            )}
          </>
        );
      },
    },
    {
      name: 'operationIntegralTotal',
      width: 120,
      renderer: ({ value }) => (
        <span className="price-color">
          <Icon style={{ fontSize: 12, marginTop: -2 }} type="donut_small" />
          {numberRender(Math.abs(value))}
        </span>
      ),
    },
    { name: 'sourceCode' },
    {
      name: 'remarksMeaning',
      tooltip: 'overflow',
    },
  ];

  return (
    <div style={{ display: currentStatus === 'all' ? 'block' : 'none' }}>
      {/* <p className="sigl-content-title">
        {intl.get('mallf.mySigl.view.sigl.all', { name: pointName }).d(`剩余可用${pointName}`)}
      </p> */}
      <div className="sigl-content-table">
        <Table dataSet={initDs} columns={columns} selectionMode="none" />
      </div>
    </div>
  );
}
