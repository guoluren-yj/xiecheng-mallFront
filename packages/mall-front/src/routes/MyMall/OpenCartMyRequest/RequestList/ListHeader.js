import React, { useMemo } from 'react';
import { Button, Tooltip, Modal, TextArea, Icon, Form } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import Icons from 'components/Icons';
import { PermissionButton, PermissionWrapper } from 'components/Permission';
import {
  requestResubmit,
  requestApprovHistory,
  requestCancelRequest,
} from 'components/Permission/permissionCode';
import intl from 'utils/intl';
import { TagRender, CopyButton } from 'utils/renderer';
import cuxComponent from 'cuxTools/cuxComponent';
import CuxWrapper from 'cuxTools/CuxWrapper';
import CuxFn from '@/cuxTools/cuxFn';
// eslint-disable-next-line import/no-cycle
import Detail from '../Detail.js';
import openApprovalRecord from './openApprovalRecord';

export const status = (lineStatus) => {
  let subStatus;
  switch (lineStatus) {
    case 'CANCELED': // 已取消
    case 'WITHDRAWN': // 已撤回
      subStatus = 'failure';
      break;
    case 'SUBMITTED': // 已提交
    case 'APPROVED': // 已审批
    case 'CONVERSION_COMPLETED': // 已完成
      subStatus = 'success';
      break;
    case 'REJECTED': // 审批拒绝
      subStatus = 'danger';
      break;
    default:
      subStatus = 'warning';
      break;
  }
  return subStatus;
};

function ListHeader({ item, dataSet }) {
  // 头取消申请
  const handleCancelHeader = () => {
    const children = (
      <>
        <p style={{ fontSize: '14px', marginBottom: '20px' }}>
          {intl
            .get('mallf.myRequest.view.cancelRequestHeader.title', {
              value: item.requestCode,
            })
            .d(`您确定要取消商城申请【${item.requestCode}】吗？`)}
        </p>
        <Form labelLayout="float">
          <TextArea
            label={intl.get('mallf.myRequest.view.edit.cancelReason').d('取消原因')}
            id="requestCancelReason"
            rows={3}
            style={{ width: '100%', fontSize: 12 }}
          />
        </Form>
      </>
    );
    dataSet.handleCancelRequest({ item, children, type: 'header' });
  };

  // 头撤回申请
  const handleWithdrawRequest = () => {
    const children = (
      <>
        <p style={{ fontSize: '14px', marginBottom: '20px' }}>
          {intl
            .get('mallf.myRequest.view.withdrawRequestHeader.title', {
              value: item.requestCode,
            })
            .d(`您确定要撤回申请【${item.requestCode}】吗？`)}
        </p>
        <Form labelLayout="float">
          <TextArea
            rows={3}
            id="requestCancelReason"
            label={intl.get('mallf.myRequest.view.edit.withdrawReason').d('撤回原因')}
            style={{ width: '100%', fontSize: 12 }}
          />
        </Form>
      </>
    );
    dataSet.handleCancelRequest({ item, children, type: 'withdraw' });
  };

  // 申请详情
  const openDetailModal = () => {
    const modal = Modal.open({
      title: intl.get('mallf.myRequest.view.apply.information').d('查看申请详情'),
      drawer: true,
      style: { width: 1090 },
      children: <Detail item={item} readOnly />,
      footer: () => (
        <Button key="back" onClick={() => modal.close()} color="primary">
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      ),
    });
  };

  // 重新编辑
  const handleEditDetail = () => {
    Modal.open({
      title: `${intl.get('mallf.myRequest.view.editRequest').d('编辑申请')}-${item.requestCode}`,
      drawer: true,
      style: { width: 1090 },
      children: <Detail item={item} updateSuccessCallback={() => dataSet.queryData()} />,
    });
  };

  const errorList = useMemo(
    () =>
      item.processErrorInfoList.filter(
        (n) => n.info && n.color === item.processErrorInfoList?.[0]?.color
      ),
    [item.processErrorInfoList]
  );

  const ApprovHistoryRender = CuxFn({
    name: 'OpenCartMyRequest-listHeader-fn-approvHistoryRender',
  })(() => <span>{intl.get('mallf.myRequest.view.order.approvHistory').d('审批记录')}：</span>)();

  return (
    <div className="list-header">
      <div className="list-header-container">
        <div className="header-request-code">
          <span>{intl.get('mallf.myRequest.view.mallRequset.number').d('商城申请号')}：</span>
          <span className="primary-color">
            <span onClick={() => openDetailModal()}>{item.requestCode}</span>
            <CopyButton
              style={{ top: 6 }}
              num={item.requestCode}
              label={intl.get('mallf.myRequest.view.mallRequset.number').d('商城申请号')}
            />
          </span>
        </div>
        <PermissionWrapper permissionList={[requestApprovHistory]}>
          <div className="header-request-approval">
            {ApprovHistoryRender}
            <a onClick={() => openApprovalRecord(item)}>
              {intl.get('hzero.common.button.look').d('查看')}
            </a>
          </div>
        </PermissionWrapper>
        <div className="header-request-status">
          {TagRender({
            text: item.requestStatusMeaning,
            type: status(item.requestStatus),
            style: { maxWidth: '160px', marginRight: 0 },
            icon: !isEmpty(errorList) && ( // 申请报错改造为后端控制 - processErrorInfos
              <Tooltip
                title={errorList.map((m) => (
                  <p>{m.info}</p>
                ))}
                placement="top"
              >
                <Icon
                  className="status-error"
                  type="error"
                  style={{
                    fontSize: '14px',
                    marginLeft: '5px',
                    fontWeight: 400,
                    verticalAlign: 'text-bottom',
                  }}
                />
              </Tooltip>
            ),
          })}
        </div>
        <div className="header-right">
          <span className="header-creationDate">{item.creationDate}</span>
          <Tooltip
            title={intl.get('mallf.myRequest.view.button.reEdit').d('重新编辑')}
            placement="top"
          >
            <PermissionButton
              type="c7n-pro"
              funcType="flat"
              color="primary"
              size="small"
              icon="mode_edit"
              className="right-btn"
              r-if={item.canEditFlag === 1}
              permissionList={[requestResubmit]}
              onClick={() => handleEditDetail()}
            />
          </Tooltip>
          <PermissionWrapper permissionList={[requestCancelRequest]}>
            <Tooltip
              title={intl.get('mallf.myRequest.view.edit.cancelRequest').d('取消申请')}
              placement="top"
            >
              <Button
                funcType="flat"
                color="primary"
                size="small"
                className="right-btn"
                style={{ borderRadius: '50%' }}
                r-if={item.canCancelFlag === 1}
                onClick={() => handleCancelHeader()}
              >
                <Icons
                  type="cancel_order"
                  style={{
                    fontWeight: 400,
                  }}
                />
              </Button>
            </Tooltip>
          </PermissionWrapper>
          <Tooltip
            title={intl.get('mallf.myRequest.view.order.orderAgain').d('再来一单')}
            placement="top"
          >
            <Button
              funcType="flat"
              color="primary"
              icon="add_shopping_cart-o"
              className="right-btn"
              size="small"
              r-if={item.canBuyAgainFlag === 1}
              onClick={() => dataSet.buyAgain(item)}
            />
          </Tooltip>
          <Tooltip
            title={intl.get('mallf.myRequest.view.edit.withdrawRequest').d('撤回申请')}
            placement="top"
          >
            <Button
              funcType="flat"
              color="primary"
              size="small"
              icon="reply"
              className="right-btn"
              r-if={item.canWithdrawFlag === 1}
              onClick={() => handleWithdrawRequest()}
            />
          </Tooltip>
        </div>
      </div>
      <div className="list-header-extra" r-if={item.activityType === 'COLLAGE'}>
        <span>{item.activityTypeMeaning}</span>：<span>{item.activityName || '-'}</span>
      </div>
    </div>
  );
}

export default cuxComponent({ path: 'OpenCartMyRequest/RequestList/ListHeader' })(ListHeader);
