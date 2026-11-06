import React, { useEffect, useState } from 'react';

import ApproveRecord from 'components/ApproveRecord';
import { isEmpty } from 'lodash';
import { Spin } from 'choerodon-ui/pro';
import { fetchMyRequestApproveRecord } from '../services/index';

export default function ApproveRecordRender(props) {
  const { data, item } = props;
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetchMyRequestApproveRecord(item);
    setForecastData(res || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Spin spinning={loading} />;
  }

  try {
    return (
      <ApproveRecord
        showForecastBtnFlag={!isEmpty(forecastData)}
        cuxShowForecastFlag={!isEmpty(forecastData)}
        forecastData={forecastData}
        data={data}
      />
    );
  } catch (err) {
    return <ApproveRecord showForecastBtnFlag={false} data={data} />;
  }
}
