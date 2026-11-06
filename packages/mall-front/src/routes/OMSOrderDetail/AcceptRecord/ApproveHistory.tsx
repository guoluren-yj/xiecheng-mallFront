import React from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import { PermissionButton } from 'components/Permission';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import ApproveRecord from 'components/ApproveRecord';
import { fetchAcceptApproveRecord } from 'services/productAcceptService';


interface WorkflowApproveDTO {
  historicTaskExtList: any[];
};

interface ApproveHistoryProps {
  receiptCode: string;
  approveType: string
}

interface ApproveResponseMap {
  [x: string]: WorkflowApproveDTO[] | null | [];
}

function ApproveHistory(props: ApproveHistoryProps) {
  const { receiptCode, approveType } = props;

  async function openModal() {
    let approveRecord: any[] = [];
    let forecastData: any[] = [];
    try {
      const res = await fetchAcceptApproveRecord({ receiptCode, approveType });
      const forecastMap = res?.workflowForecastListMap || {};
      const approveMap = res?.workflowApproveResponseMap || {}
      const approveList = isEmpty(approveMap) ? [] : (Object.values(approveMap as ApproveResponseMap)?.[0])?.reverse() || [];
      forecastData = isEmpty(forecastMap) ? [] : Object.values(forecastMap as ApproveResponseMap)?.[0] || [];
      approveRecord = approveList.reduce((pre: any[], curr) => {
        const { historicTaskExtList = [] } = curr;
        const list = historicTaskExtList.reverse();
        pre.push(...list);
        return pre;
      }, []);
    } catch {
      approveRecord = [];
    }
    Modal.open({
      title: intl.get('mallf.myOrder.view.button.approveHistory').d('审批记录'),
      mask: true,
      style: { width: 750 },
      drawer: true,
      destroyOnClose: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      children: <ApproveRecord showForecastBtnFlag={!isEmpty(forecastData)} data={approveRecord} forecastData={forecastData} />,
    });
  }

  return (
    <Button
      funcType={FuncType.link}
      color={ButtonColor.primary}
      onClick={() => openModal()}
    >
      {intl.get('mallf.myOrder.view.button.approveHistory').d('审批记录')}
    </Button>
  );
}

export default ApproveHistory;
