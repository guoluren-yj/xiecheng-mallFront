import React from 'react';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { Row, Col } from 'choerodon-ui';

import Link from 'components/Link';
import HmallConfig from 'utils/api-config';
import intl from 'utils/intl';

interface IListHeaderProps {
  record: Record,
}

const ListHeader: React.FC<IListHeaderProps> = ({
  record,
}) => {
  const {
    orderCode,
    orderId,
    cecOrderCode,
  } = record.get([
    'orderCode',
    'orderId',
    'cecOrderCode',
  ]);

  return (
    <Row className="invoice-detail-header">
      <Col className="header-ecpo" span={7}>
        <span className="header-label">
          {intl.get('mallf.myInvoice.view.order.srmPoNum').d('商城订单号')}：
        </span>
        <span className="header-content primary-color">
          <Link to={`${HmallConfig.contextPath}/oms-order-detail?orderId=${orderId}`}>
            {orderCode}
          </Link>
        </span>
      </Col>
      <Col className="header-ecnum" span={7}>
        <span className="header-label">
          {intl.get('mallf.myInvoice.view.order.ecOrderNum').d('电商订单号')}：
        </span>
        <span title={cecOrderCode} className="header-content">
          {cecOrderCode}
        </span>
      </Col>
    </Row>
  );
};

export default ListHeader;
