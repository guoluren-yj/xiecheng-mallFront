import React from 'react';
import { Tooltip } from 'choerodon-ui';
import { Icon as HIcon } from 'hzero-ui';

import { myInvoice } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import intl from 'utils/intl';
import Tags from 'components/Tag';
import LogisticsDrawer from 'components/LogisticsDrawer';

// 订单状态信息展示
const productInfoStatus = (props) => {
  const {
    product,
    logisticsProps,
    hideFieldList,
    toggleInvoiceModal,
    setCurrentProduct,
    status,
  } = props;
  return (
    <>
      <p style={{ marginBottom: '5px' }}>
        <Tags style={{ display: 'inline-block' }} type={status(product)}>
          {product.subStatusName}
        </Tags>
        {product.denialReason &&
          !['REVOKE', 'CANCELED', 'REFUSED'].includes(product.cancelCode) &&
          ['REJECT', 'CANCELLED'].includes(product.subStatus) && (
            <Tooltip
              title={`${intl.get('mallf.common.view.denial.reason').d('拒绝原因')}：${
                product.denialReason
              }`}
              placement="top"
            >
              <HIcon
                style={{ marginLeft: '6px', color: '#F56649' }}
                type="exclamation-circle"
                size={14}
              />
            </Tooltip>
          )}
      </p>
      {/* 水滴筹按行取消 */}
      {product.subStatus === 'CANCELLED' && !product.cancelCode && (
        <a className="primary-link">{intl.get('mallf.common.view.denial.cancelled').d('已取消')}</a>
      )}
      {['REVOKE', 'CANCELED', 'REFUSED'].includes(product.cancelCode) && product.cancelCodeMeaning && (
        <a className="primary-link">
          {product.cancelCodeMeaning}
          {product.denialReason && ['REJECT', 'CANCELLED'].includes(product.subStatus) && (
            <Tooltip
              title={`${intl.get('mallf.common.view.denial.reason').d('拒绝原因')}：${
                product.denialReason
              }`}
              placement="top"
            >
              <HIcon
                style={{ marginLeft: '6px', color: '#F56649' }}
                type="exclamation-circle"
                size={14}
              />
            </Tooltip>
          )}
        </a>
      )}
      {['FINISH', 'WAITING_RECEIVE'].includes(product.subStatus) &&
        hideFieldList &&
        !hideFieldList.includes('LOGISTICS') && (
          <LogisticsDrawer {...logisticsProps}>
            <span className="primary-link">
              {intl.get(`mallf.orderDetail.view.check.logistics`).d('查看物流')}
            </span>
          </LogisticsDrawer>
        )}
      {product.srmInvoiceFlag === 1 && (
        <PermissionWrapper permissionList={myInvoice}>
          <a
            className="primary-link"
            onClick={() => {
              toggleInvoiceModal();
              setCurrentProduct(product);
            }}
          >
            {intl.get('mallf.common.view.check.invoince').d('查看发票')}
          </a>
        </PermissionWrapper>
      )}
    </>
  );
};

export { productInfoStatus };
