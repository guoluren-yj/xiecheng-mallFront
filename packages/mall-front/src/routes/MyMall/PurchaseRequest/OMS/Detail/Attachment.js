import React from 'react';
import { Row, Col } from 'choerodon-ui';

import AttachmentItem from 'components/AttachmentItem';
import intl from 'utils/intl';

export default function Attachment({ header }) {
  return (
    <Row className="content-box-item" style={{ display: 'flex' }}>
      <Col style={{ width: 100 }} className="content-box-item-label">
        {intl.get('mallf.common.view.attachment.info').d('附件信息')}
      </Col>
      <Col style={{ flex: 1 }} className="content-box-item-content">
        <AttachmentItem attachmentUuid={header?.attachmentUuid} bucketName="private-bucket" />
      </Col>
    </Row>
  );
}
