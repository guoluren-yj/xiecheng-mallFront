import React, { useEffect, useState } from 'react';
import { Col, Icon, Row, Spin, Timeline } from 'choerodon-ui';
import intl from 'utils/intl';
import { getCurrentLanguage, getCurrentOrganizationId, getResponse } from 'utils/utils';
import request from 'utils/request';
import styles from './index.less';

const AttachmentHistory = (props) => {
  const {
    attachment: { url, fileName },
  } = props;
  const [opList, setOpList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (url) {
      request(`/hfle/v1/files/${getCurrentOrganizationId()}/oplog`, {
        method: 'GET',
        headers: {
          'h-request-auto-decrypt': true,
        },
        query: {
          fileUrlOrKey: url,
        },
      })
        .then((res) => {
          if (getResponse(res)) {
            setOpList(res.logs.content);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(true);
    }
  }, [url]);

  return opList.length > 0 ? (
    <Timeline>
      {opList.map((line) => (
        <Timeline.Item color="#e8e8e8" className={styles['srm-attachment-history-detail']}>
          <Row>
            <Col span={2} className="history-detail-icon">
              <Icon type={line.opTypeCode === 'UPLOAD' ? 'file_upload' : 'get_app'} />
            </Col>
            <Col span={22} className="history-detail-item">
              <div>
                <span className="realName">
                  {line.realName}({line.userName})
                </span>
                <span>
                  {line.opType}
                  {getCurrentLanguage() === 'zh_CN' ? '了' : undefined}
                </span>
                <span className="realName">{`【${fileName}】`}</span>
              </div>
              <div>{line.tenantName}</div>
              <div>{line.date}</div>
            </Col>
          </Row>
        </Timeline.Item>
      ))}
    </Timeline>
  ) : loading ? (
    <Spin spinning />
  ) : (
    intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')
  );
};

export default AttachmentHistory;
