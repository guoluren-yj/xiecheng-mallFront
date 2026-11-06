import React, { Component } from 'react';
import { Popover, Icon, Text } from 'choerodon-ui';
import intl from 'utils/intl';
import ApprovalComment from '../ApprovalComment';
import styles from './index.less';

export default class CarbonCopyRecord extends Component {
  render() {
    const { ccList } = this.props;
    const content = (
      <div className={styles['approve-record-ccRecord']}>
        <p className={styles['approve-record-ccRecord-title']}>
          {intl.get('hzero.common.record.ccRecord').d('传阅记录')}
        </p>
        {ccList.map((item) => (
          <div className={styles['approve-record-ccRecord-content']}>
            <div className={styles.record}>
              <div className={styles['record-title']}>
                <Text>{intl.get('hzero.common.record.circulate').d('传阅')}</Text>
              </div>
              <div className={styles['record-content']}>{item.comment}</div>
            </div>
            <div className={styles.record}>
              <div className={styles['record-title']}>
                <Text>{intl.get('hzero.common.view.message.cron.date').d('日期')}</Text>
              </div>
              <div className={styles['record-content']}>{item.startTime}</div>
            </div>
            {item.appendComment && (
              <div className={styles.record}>
                <div className={styles['record-title']}>
                  <Text>{intl.get('hwfp.common.model.process.appendComment').d('传阅意见')}</Text>
                </div>
                <div className={styles['record-content']}>
                  <ApprovalComment data={item.appendComment} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
    return (
      <Popover
        content={content}
        placement="rightBottom"
        trigger="hover"
        overlayClassName={styles['cc-record-container']}
      >
        <span style={{ cursor: 'pointer', height: '0.18rem' }}>
          <Icon type="person_add-o" />
        </span>
      </Popover>
    );
  }
}
