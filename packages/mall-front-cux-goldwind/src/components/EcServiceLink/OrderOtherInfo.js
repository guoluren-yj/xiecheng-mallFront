import React from 'react';
import { Row } from 'choerodon-ui/pro';
import EcServiceLink from './index';

export default function OtherInfo(props) {
  const { data } = props;

  if (data?.cecFromCode !== 'JD') {
    return <></>;
  }

  return (
    <Row className="list-title">
      <span className="label">客服：</span>
      <span className="label-content">
        <EcServiceLink
          params={{
            platformType: 'PC',
            purchaseCompanyId: data?.purchaseCompanyId,
            orderSourceFrom: data?.cecFromCode,
            cecOrderCode: data?.cecOrderCode,
          }}
        />
      </span>
    </Row>
  );
}
