import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Modal, Spin, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getThemeColor } from 'utils/utils';
import RecordTimeLine from 'components/RecordTimeLine';
import { fetchApprovalRecord } from 'services/openCartMyRequestService';
import ApproveRecord from 'components/ApproveRecord';
import moment from 'moment';
import EmptySvg from 'components/ApproveRecord/EmptySvg';
import CuxFn from '@/cuxTools/cuxFn';
import styles from './record.less';

const ApprovalHistory = (props) => {
  const { item } = props;
  const [loading, setLoading] = useState(false);
  const [approveData, setApproveData] = useState({});
  const dataSet = useMemo(() => {
    return new DataSet({
      paging: false,
    });
  }, []);

  const themeColors = useMemo(() => getThemeColor() || {}, []);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetchApprovalRecord([item]);
      if (res) {
        setApproveData(res[item.requestCode] || {});
      }
    } finally {
      setLoading(false);
    }
  }

  function setWorkflowData() {
    const { workflowApproveResponseDTOList = [] } = approveData || {};
    const list = workflowApproveResponseDTOList.reduce((p, c) => {
      const { historicTaskExtList, historicTaskList } = c;
      return p.concat(historicTaskExtList || []).concat(historicTaskList || []);
    }, []);
    // 时间降序
    return (
      list?.sort((a, b) => {
        const v = moment(a.endTime).isBefore(b.endTime);
        return v ? +v : +v - 1;
      }) || []
    );
  }

  function setExternalData() {
    const { mallRequestEntryApproveHistoryVOList: list } = approveData || {};
    dataSet.loadData(list || []);
  }

  const getTimelineColor = ({ record }) => {
    const colorMap = {
      red: 'danger-color',
      green: 'success-color',
      yellow: 'warning-color',
    };
    const color = colorMap[record.get('approveColor')];
    return color ? themeColors[color] : null;
  };

  const recordRenderer = useCallback(({ record, dataSet: ds, index }) => {
    const {
      approveColor,
      approveNodeName,
      approveOperation,
      approveOperationUser,
      approveRemark,
      approveCustomList = [],
      approveOperationDate,
    } = record.toData();
    const tagClsMap = {
      red: 'approve-tag-danger',
      green: 'approve-tag-success',
      yellow: 'approve-tag-warning',
    };
    const tagCls = tagClsMap[approveColor] || 'approve-tag';

    // 标准渲染
    const standardItem = (
      <div className="approve-item">
        <span className="approve-item-label">
          {index === ds.length - 1
            ? intl.get('mallf.myRequest.model.sponsor').d('发起人')
            : intl.get('mallf.myRequest.model.operateUser').d('审批人')}
        </span>
        <span className="approve-item-content">{approveOperationUser}</span>
      </div>
    );
    return (
      <div className={styles['approve-content']}>
        <div className="approve-header">
          <span className="approve-node">{approveNodeName}</span>
          <span className={tagCls}>
            <span className="approve-tag-content">{approveOperation}</span>
          </span>
        </div>
        {approveCustomList && approveCustomList.length > 0
          ? approveCustomList.map((m) => {
              return (
                <div className="approve-item">
                  <span className="approve-item-label">{m.label}</span>
                  <span className="approve-item-content">{m.value || '-'}</span>
                </div>
              );
            })
          : standardItem}
        <div className="approve-item" r-if={approveRemark}>
          <span className="approve-item-label">
            {intl.get('mallf.myRequest.model.approveRemark').d('审批意见')}
          </span>
          <span className="approve-item-content">{approveRemark}</span>
        </div>
        <div className="approve-item" r-if={approveOperationDate}>
          <span className="approve-item-label">
            {intl.get('mallf.myRequest.model.date').d('日期')}
          </span>
          <span className="approve-item-content">{approveOperationDate}</span>
        </div>
      </div>
    );
  }, []);

  const renderWorkFlow = () => {
    const data = setWorkflowData();
    const ApprovalRecordRender = CuxFn({
      name: 'OpenCartMyRequest-requestList-fn-approvalRecord',
      value: { data, item: [item] },
    })(() => <ApproveRecord showForecastBtnFlag={false} data={data} />)();
    return ApprovalRecordRender;
  };

  const renderExternal = () => {
    setExternalData();
    return (
      <RecordTimeLine
        dataSet={dataSet}
        renderer={recordRenderer}
        timelineColor={getTimelineColor}
      />
    );
  };

  const renderEmpty = () => {
    return (
      <div className={styles['no-data']}>
        <EmptySvg />
        <p>
          {intl
            .get('mallf.myOrder.view.info.noApproveHistory')
            .d('当前审批规则暂不支持查看审批记录，请自行查询或耐心等待审批结果')}
        </p>
      </div>
    );
  };

  const renderComponent = useCallback(() => {
    const { approveType } = approveData || {};
    switch (approveType) {
      case 'WORKFLOW_APPROVAL': // 工作流审批
      case 'WORKFLOW_EXTERNAL_APPROVAL': // 工作流外部审批
        return renderWorkFlow();
      case 'EXTERNAL_SYSTEM_APPROVAL': // 外部系统审批
        return renderExternal();
      default:
        return renderEmpty();
    }
  }, [approveData]);

  return <Spin spinning={loading}>{!loading && renderComponent()}</Spin>;
};

export default function openApprovalRecord(item) {
  return Modal.open({
    title: intl.get('mallf.myRequest.view.order.approvHistory').d('审批记录'),
    drawer: true,
    closable: false,
    style: { width: 742 },
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: <ApprovalHistory item={item} />,
  });
}
