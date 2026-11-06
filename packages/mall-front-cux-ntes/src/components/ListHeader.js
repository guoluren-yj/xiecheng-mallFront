import React from 'react';
import { Button, Tooltip, Modal, TextArea, Form, DataSet, Output, Icon } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import Icons from 'mall-front/lib/components/Icons';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import { openComfirmModal } from 'utils/modals';
import { TagRender, CopyButton } from 'utils/renderer';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import Detail from 'mall-front/lib/routes/MyMall/OpenCartMyRequest/Detail';

export const status = (lineStatus) => {
  let subStatus;
  switch (lineStatus) {
    case 'CANCELED': // 已取消
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
    openComfirmModal({
      title: intl.get('mallf.myRequest.view.edit.cancelRequest').d('取消申请'),
      children: (
        <>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            {intl
              .get('mallf.myRequest.view.cancelRequestHeader.title', {
                value: item.requestCode,
              })
              .d(`您确定要取消商城申请【${item.requestCode}】吗？`)}
          </p>
          <TextArea
            placeholder={intl.get('mallf.myRequest.view.edit.cancelReason').d('取消原因')}
            id="requestCancelReason"
            rows={3}
            style={{ width: '100%' }}
          />
        </>
      ),
      onOk() {
        const cancelReason = document.getElementById('requestCancelReason').value;
        const { mallRequestEntryViewVOList, requestId } = item || {};
        const params = {
          requestId,
          mallRequestEntryViewDTO: mallRequestEntryViewVOList,
          cancelReason,
        };
        dataSet.cancelRequest(params, 'header');
      },
    });
  };

  // 申请详情
  const openDetailModal = () => {
    const modal = Modal.open({
      title: intl.get('mallf.myRequest.view.apply.information').d('查看申请详情'),
      drawer: true,
      style: { width: 1090 },
      children: <Detail item={item} />,
      footer: () => (
        <Button key="back" onClick={() => modal.close()} color="primary">
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      ),
    });
  };

  // 审批记录
  const openApprovHistoryModal = async () => {
    const { organizationId } = getUserConfigInfo();
    const ds = new DataSet({
      autoQuery: false,
      fields: [
        {
          name: 'approveFlowId',
          label: intl.get('mallf.myRequest.model.flowIds').d('流程ID'),
        },
        {
          name: 'approveNodeName',
          label: intl.get('mallf.myRequest.model.nodeName').d('审批节点'),
        },
        {
          name: 'approveOperationUser',
          label: intl.get('mallf.myRequest.model.operateUser').d('审批人'),
        },
        {
          name: 'approveOperationDate',
          label: intl.get('mallf.myRequest.model.operateTime').d('审批时间'),
        },
        {
          name: 'approveRemark',
          label: intl.get('mallf.myRequest.model.approveRemark').d('审批意见'),
        },
        {
          name: 'approveNextOperationUser',
          label: intl.get('mallf.myRequest.model.receiveUser').d('下一审批人'),
        },
      ],
    });
    let res;
    // eslint-disable-next-line no-param-reassign
    dataSet.status = 'loading';
    try {
      res = await request(
        `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${organizationId}/mall-requests/approval-progress`,
        {
          method: 'POST',
          body: JSON.stringify([item]),
        }
      );
    } finally {
      // eslint-disable-next-line no-param-reassign
      dataSet.status = 'ready';
    }
    if (res) {
      const { currentMallRequestEntryApproveHistoryVO } = res[item.requestCode] || {};
      ds.loadData([currentMallRequestEntryApproveHistoryVO]);
      const modal = Modal.open({
        title: intl.get('mallf.myRequest.view.apply.approvInforView').d('查看审批记录'),
        drawer: true,
        style: { width: 380 },
        children: (
          <Form columns={1} dataSet={ds} className="c7n-pro-vertical-form-display">
            <Output name="approveFlowId" />
            <Output name="approveNodeName" />
            <Output name="approveOperationUser" />
            <Output name="approveOperationDate" />
            <Output name="approveRemark" />
            <Output name="approveNextOperationUser" />
          </Form>
        ),
        footer: () => (
          <Button key="back" onClick={() => modal.close()} color="primary">
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        ),
      });
    }
  };

  return (
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
      <div className="header-request-status">
        {TagRender({
          text: item.requestStatusMeaning,
          type: status(item.requestStatus),
          style: { maxWidth: '80px', marginRight: 0 },
          icon: !isEmpty(item.processErrorInfoList) && ( // 申请报错改造为后端控制 - processErrorInfos
            <Tooltip
              title={item.processErrorInfoList
                .filter((n) => n.color === item.processErrorInfoList?.[0]?.color)
                .map((m) => (
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
      <div r-if={item.requestStatus === 'SUBMITTED'}>
        <Tooltip
          title={intl.get('mallf.myRequest.view.order.approvHistory').d('审批记录')}
          placement="top"
        >
          <Button
            funcType="flat"
            color="primary"
            icon="approval-o"
            className="right-btn"
            size="small"
            style={{ margin: '-3px 0 0 5px' }}
            onClick={() => openApprovHistoryModal()}
          >
            {intl.get('mallf.myRequest.view.order.approvHistory').d('审批记录')}
          </Button>
        </Tooltip>
      </div>
      <div className="header-right">
        <span className="header-creationDate">{item.creationDate}</span>
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
            r-if={['NEW', 'RETURNED', 'REJECTED'].includes(item.requestStatus)}
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
            onClick={() => dataSet.buyAgain(item)}
          />
        </Tooltip>
      </div>
    </div>
  );
}

export default ListHeader;
