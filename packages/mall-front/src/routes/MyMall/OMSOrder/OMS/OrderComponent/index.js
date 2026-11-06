import React, { useState } from 'react';
import { Spin } from 'hzero-ui';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';

import intl from 'utils/intl';
import Loading from 'components/loading';
import Pagination from 'components/Pagination';
import InvoiceModal from 'components/InvoiceMadal';

import style from './index.less';
import OrderLine from './OrderLine';
import { getContextValue } from '../../common/Context';

function OrderComponent(props) {
  const [invoiceModalVisible, setVisible] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState({});

  const { loading, spinning, pagination, list: orderData = [], onPageChange } = getContextValue();

  function handleCloseModal() {
    setVisible(false);
    setCurrentInvoice({});
  }

  const invoiceProps = {
    ...currentInvoice,
    visible: invoiceModalVisible,
    onClose: handleCloseModal,
  };

  const { constants } = props;

  return (
    <div className="orderPanel-container">
      <div
        className={style.orderList}
        style={{ minHeight: `${window.innerHeight - constants.footerPaddingBottom - 400}px` }}
      >
        {loading ? (
          <Loading />
        ) : orderData.length > 0 ? (
          <Spin spinning={spinning}>
            {orderData.map((item, index) => (
              <OrderLine item={item} index={index} />
            ))}
            <Pagination
              showSizeChanger
              style={{ width: '100%', marginTop: 15 }}
              zeroStart
              showQuickJumper
              {...pagination}
              onForward={onPageChange}
            />
          </Spin>
        ) : (
          <div className="empty-order-list">
            <div className="info">{intl.get('mallf.myOrder.view.order.noOrder').d('暂无订单')}</div>
          </div>
        )}
      </div>
      {invoiceModalVisible && <InvoiceModal {...invoiceProps} />}
    </div>
  );
}
export default connect(({ global }) => ({ constants: global.constants }))(
  withRouter(OrderComponent)
);
