import React from 'react';
import { Timeline } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

import styles from './index.less';

const RecordTimeline = (props) => {
  const { dataSet, timelineColor = () => {}, renderer = (e) => e } = props;

  const TimelineO = observer(({ dataSet: ds }) => {
    return (
      <Timeline className={styles['record-timeline']}>
        {ds.map((m, index) => {
          const color = timelineColor({ dataSet, record: m, index });
          return (
            <Timeline.Item color={color || '#e5e5e5'}>
              {renderer({ dataSet, record: m, index })}
            </Timeline.Item>
          );
        })}
        {ds.records.length < 1 && ds.status === 'ready' && (
          <div className="timeline-no-data">
            {intl.get(`mallf.common.model.noData`).d('暂无数据')}
          </div>
        )}
      </Timeline>
    );
  });

  return (
    <Spin dataSet={dataSet}>
      <TimelineO dataSet={dataSet} />
    </Spin>
  );
};

export default RecordTimeline;
