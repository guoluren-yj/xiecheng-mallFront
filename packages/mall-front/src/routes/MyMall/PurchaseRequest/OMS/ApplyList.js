/* eslint-disable no-param-reassign */
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Row, Col, Icon, message, Input } from 'choerodon-ui';
import { Button, Tooltip, Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import { OMS_PURCHASE_APPLY_HEADER, OMS_PURCHASE_APPLY_LINE } from 'utils/customizeCode';
import { PermissionWrapper } from 'components/Permission';
import { copyPurchaseApply, cancelPurchaseApply } from 'components/Permission/permissionCode';
import {
  fetchDeleteApply,
  cancelRequestService,
  fetchOMSApplyDetail,
} from 'services/purchaseRequestService';
import intl from 'utils/intl';
import { TagRender, CopyButton, SpanTitle } from 'utils/renderer';
import Detail from './Detail';
import AssociatedDoc from './AssociatedDoc';
import useSetState from '@/hooks/useState';
import CuxFn from '@/cuxTools/cuxFn';

const { TextArea } = Input;

function ApplyList(props) {
  const {
    toggleLoading,
    item,
    fetchOrderData,
    currentStatus,
    custForm,
    custTable,
    pagination,
  } = props;
  const { manualRequestEntryList = [] } = item || {};

  const [state, setState] = useSetState({ detailVisible: false, associatedDocVisible: false });
  const { detailVisible, associatedDocVisible } = state;

  // 查询信息
  const fetchDetail = (manualRequestId) => {
    toggleLoading({ spinning: true });
    fetchOMSApplyDetail({
      copyFlag: 1,
      manualRequestId,
      customizeUnitCode: `${OMS_PURCHASE_APPLY_HEADER},${OMS_PURCHASE_APPLY_LINE}`,
    })
      .then((res) => {
        const deleteField = () => {
          if (res) {
            delete res._token;
            delete res.manualRequestId;
            delete res.manualRequestNum;
            delete res.objectVersionNumber;
            delete res.lastUpdatedBy;
            delete res.predictAmountMeaning;
            delete res.predictAmount;
            delete res.rejectedReason;
            delete res.mallManualRequestStatus;
            delete res.mallManualRequestStatusMeaning;
            delete res.showCancelFailedFlag;
            delete res.prNum; // 不复制prNum，用于做已提交/审批拒绝状态判断
            delete res.cancelReason; // 不复制原因
            if (res?.manualRequestEntryList) {
              res.manualRequestEntryList.forEach((m) => {
                delete m.objectVersionNumber;
                delete m._token;
                delete m.manualRequestEntryId;
                delete m.manualRequestId;
                delete m.predictEntryAmount;
                delete m.predictEntryAmountMeaning;
                delete m.lastUpdateDate;
                delete m.lastUpdatedBy;
              });
            }
          }
        };
        CuxFn({
          name: 'PurchaseRequest-fn-deleteField',
          value: {
            res,
          },
        })(() => deleteField())();
        props.history.push({
          pathname: `/add-purchase`,
          data: res,
        });
      })
      .finally(() => {
        toggleLoading({ spinning: false });
      });
  };

  const itemHeight = ['NEW', 'REJECTED'].includes(item.mallManualRequestStatus) ? 94 : 80;

  const status = (prStatusCode) => {
    let subStatus;
    switch (prStatusCode) {
      case 'CANCELED':
      case 'CLOSED':
        subStatus = 'failure';
        break;
      case 'APPROVED':
      case 'TO_PO':
        subStatus = 'success';
        break;
      case 'APPROVE_REJECT':
        subStatus = 'danger';
        break;
      default:
        subStatus = 'warning';
        break;
    }
    return subStatus;
  };

  // 删除申请
  const deleteHeaderApply = () => {
    toggleLoading({ spinning: true });
    fetchDeleteApply(item)
      .then(() => {
        fetchOrderData();
      })
      .catch(() => {
        toggleLoading({ spinning: false });
      });
  };

  // 取消申请
  const handleCancelRequest = (params) => {
    Modal.confirm({
      title: intl.get(`mallf.common.view.cancelReason`).d('取消原因'),
      children: <TextArea id="requestCancelReason" rows={3} cols={99} />,
      onOk() {
        const cancelReason = document.getElementById('requestCancelReason').value;
        toggleLoading('spinning');
        cancelRequestService({ ...params, cancelReason })
          .then((resp) => {
            if (resp) {
              const { number, size } = pagination;
              fetchOrderData({ page: number, size });
              message.success(
                intl.get('mallf.common.view.cancelRequestSuccess').d('操作成功，手工申请取消中')
              );
            }
          })
          .finally(() => {
            toggleLoading({ spinning: false });
          });
      },
    });
  };

  const CancelRequest = CuxFn({
    name: 'PurchaseRequest-fn-cancelRequest',
    value: {
      item,
      handleCancelRequest,
    },
  })(() => {
    return (
      ![
        'TO_PO',
        'TO_FOUND',
        'CANCELED',
        'CANCELLING',
        'NEW',
        'CANCEL_TO_CONFIRM',
        'CONTRACT_FOUND',
      ].includes(item.mallManualRequestStatus) && (
        <Button
          funcType="flat"
          color="primary"
          className="right-btn text-overflow "
          onClick={() => handleCancelRequest(item)}
        >
          {intl.get('mallf.myRequest.view.edit.cancelRequest').d('取消申请')}
        </Button>
      )
    );
  });

  const predictAmount = item.predictAmountMeaning || item.predictAmount;

  return (
    <div className="apply-list-line">
      <ul className="apply-header">
        <li>
          <span className="header-label">
            {intl.get('mallf.myRequest.view.mallRequset.number').d('商城申请号')}：
          </span>
          <span className="header-content primary-color">
            <span
              onClick={() => {
                setState({ detailVisible: true });
              }}
            >
              {item.manualRequestNum}
            </span>
            <CopyButton
              style={{ top: 6 }}
              num={item.manualRequestNum}
              label={intl.get('mallf.myRequest.view.mallRequset.number').d('商城申请号')}
            />
          </span>
        </li>
        {item.prNum && (
          <li>
            <span className="header-label">
              {intl.get('mallf.myRequest.model.purchaseApplicationNum').d('采购申请号')}：
            </span>
            <span className="header-content">{item.prNum}</span>
          </li>
        )}
        <li className="text-overflow" style={{ maxWidth: 180 }}>
          <span className="header-label">
            {intl.get('mallf.myRequest.model.productAccept.companyName').d('公司')}：
          </span>
          <span className="header-content" title={item.purchaseCompanyName}>
            {item.purchaseCompanyName}
          </span>
        </li>
        <li style={{ marginRight: 15, flex: 'auto', textAlign: 'right' }}>{item.creationDate}</li>
        <PermissionWrapper permissionList={[copyPurchaseApply]}>
          <li>
            <Tooltip title={intl.get('mallf.myRequest.view.edit.copyRequest').d('复制申请')}>
              <Button
                funcType="flat"
                color="primary"
                icon="content_copy"
                className="right-btn text-overflow right-btn-copy"
                size="small"
                onClick={() => {
                  fetchDetail(item.manualRequestId);
                }}
              />
            </Tooltip>
          </li>
        </PermissionWrapper>
      </ul>
      <Row className="apply-content" style={{ minHeight: itemHeight }}>
        <Col
          span={10}
          className="product-line"
          style={{ height: itemHeight * manualRequestEntryList.length }}
        >
          {manualRequestEntryList.map((line) => {
            const linePredictUnitPrice = line.predictUnitPriceMeaning || line.predictUnitPrice;
            return (
              <div className="content-item item-product" style={{ minHeight: itemHeight }}>
                <div className="product-name">
                  <p className="text-overflow">{line.goodsName}</p>
                  {/* <p className="text-overflow">
                    {intl.get('hzero.common.button.remark').d('备注')}：{line.remark}
                  </p> */}
                </div>
                <div className="product-price text-overflow">
                  <SpanTitle>
                    {item?.currencySymbol || ''}
                    {linePredictUnitPrice || '-'}
                  </SpanTitle>
                </div>
                <div className="product-qualite text-overflow">
                  x
                  {!!line.requestQuantityMeaning &&
                  String(line.requestQuantityMeaning)?.length > 4 ? (
                    <Tooltip title={`x ${line.requestQuantityMeaning}`} placement="top">
                      {line.requestQuantityMeaning}
                    </Tooltip>
                  ) : (
                    <SpanTitle>{line.requestQuantityMeaning}</SpanTitle>
                  )}
                </div>
              </div>
            );
          })}
        </Col>
        <Col
          span={3}
          className="user-line"
          style={{ height: itemHeight * manualRequestEntryList.length, minHeight: itemHeight }}
        >
          {manualRequestEntryList.map(() => {
            return (
              <div className="content-item item-user" style={{ minHeight: itemHeight }}>
                <p className="receiver">
                  <Icon
                    type="assignment_ind-o"
                    style={{ fontSize: 14, marginTop: -2, marginRight: 4 }}
                  />
                  {item.requestByName}
                </p>
              </div>
            );
          })}
        </Col>
        <Col
          span={5}
          className="content-item item-price"
          style={{ height: itemHeight * manualRequestEntryList.length, minHeight: itemHeight }}
        >
          <p className="text-overflow" title={predictAmount}>
            <Icon
              className="price-color"
              type="assignment-o"
              style={{ fontSize: 14, marginTop: -1, marginRight: 4 }}
            />
            <span>
              {/* {intl.get('mallf.common.view.Amount').d('总额')}： */}
              <span className="price-color">
                <SpanTitle>
                  {item?.currencySymbol || ''}
                  {predictAmount || '-'}
                </SpanTitle>
              </span>
            </span>
          </p>
        </Col>
        <Col
          span={3}
          className="content-item item-status"
          style={{ height: itemHeight * manualRequestEntryList.length, minHeight: itemHeight }}
        >
          <p style={{ height: '18px' }} title={item.mallManualRequestStatusMeaning}>
            {TagRender({
              text: item.mallManualRequestStatusMeaning,
              type: status(item.mallManualRequestStatus),
              style: { maxWidth: '80px', marginRight: 0 },
              icon: !isEmpty(item?.processErrorInfos) && ( // 申请报错改造为后端控制 - processErrorInfos
                <Tooltip
                  title={item.processErrorInfos
                    .filter((n) => n.color === item?.processErrorInfos?.[0]?.color)
                    .map((m) => (
                      <p>{`${m.infoType ? `${m.infoType}    :` : ``} ${m.info}`}</p>
                    ))}
                  placement="top"
                >
                  <Icon style={{ fontWeight: 400 }} type="error" />
                </Tooltip>
              ),
            })}
          </p>
          {['TO_PO', 'CONTRACT_FOUND', 'TO_FOUND', 'TO_CONTRACT'].includes(
            item.mallManualRequestStatus
          ) && (
            <Button
              funcType="flat"
              color="primary"
              className="text-overflow"
              style={{ marginTop: '8px', width: '80px' }}
              onClick={() => {
                setState({ associatedDocVisible: true });
              }}
              title={intl.get('mallf.myRequest.view.associated.doc').d('关联单据')}
            >
              {intl.get('mallf.myRequest.view.associated.doc').d('关联单据')}
            </Button>
          )}
        </Col>
        <Col
          span={3}
          className="content-item item-oparte"
          style={{ height: itemHeight * manualRequestEntryList.length, minHeight: itemHeight }}
        >
          {
            ['SUBMITTED', 'APPROVE_REJECT', 'NEW', 'REJECTED'].includes(
              item.mallManualRequestStatus
            ) && (
              <Button
                funcType="flat"
                color="primary"
                className="right-btn text-overflow right-btn-copy"
                onClick={() => {
                  props.history.push(`/add-purchase?manualRequestId=${item.manualRequestId || ''}`);
                }}
              >
                {intl.get('mallf.myRequest.view.edit.apply').d('编辑申请')}
              </Button>
            ) // 编辑申请置于取消申请按钮上方
          }
          <PermissionWrapper permissionList={[cancelPurchaseApply]}>
            <CancelRequest />
          </PermissionWrapper>
          {(item.mallManualRequestStatus === 'NEW' ||
            item.mallManualRequestStatus === 'REJECTED') && (
            <Button
              funcType="flat"
              color="primary"
              className="right-btn text-overflow"
              onClick={() => {
                Modal.confirm({
                  title: intl.get('mallf.myRequest.view.delete.apply').d('删除申请'),
                  content: intl
                    .get('mallf.myRequest.view.confirm.delete.apply', {
                      value: item.manualRequestNum,
                    })
                    .d(`确定要删除申请单 ${item.manualRequestNum} 吗?`),
                  onOk() {
                    deleteHeaderApply();
                  },
                });
              }}
            >
              {intl.get('mallf.myRequest.view.delete.apply').d('删除申请')}
            </Button>
          )}
        </Col>
      </Row>
      <Detail
        status={status}
        custTable={custTable}
        custForm={custForm}
        currentOrder={item}
        visible={detailVisible}
        toggleModal={() => {
          setState({ detailVisible: !detailVisible });
        }}
      />
      {associatedDocVisible && (
        <AssociatedDoc
          currentStatus={currentStatus}
          currentOrder={item}
          visible={associatedDocVisible}
          toggleModal={() => {
            setState({ associatedDocVisible: !associatedDocVisible });
          }}
        />
      )}
    </div>
  );
}

export default withRouter(ApplyList);
