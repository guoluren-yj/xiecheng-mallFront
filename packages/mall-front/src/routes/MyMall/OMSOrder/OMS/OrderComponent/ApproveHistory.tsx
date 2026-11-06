import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { PermissionButton } from 'components/Permission';
import { orderApprovHistory } from 'components/Permission/permissionCode';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import ApproveRecord from 'components/ApproveRecord';
import EmptySvg from 'components/ApproveRecord/EmptySvg';
import { fetchApproveRecord } from 'services/orderCenterService';
import cuxComponent from '../../../../../cuxTools/cuxComponent';
import CuxFn from '../../../../../cuxTools/cuxFn';

import styles from './index.less';

enum ApproveType {
  EXTERNALAPPROVAL = "EXTERNAL_APPROVAL", // srm审批
  EXTERNALSYSTEMAPPROVAL = "EXTERNAL_SYSTEM_APPROVAL", // 外部系统审批
  FUNCTIONAPPROVAL = "FUNCTION_APPROVAL", // 功能审批
  WORKFLOWAPPROVAL = "WORKFLOW_APPROVAL", // 工作流审批
}

interface WorkflowApproveDTO {
  historicTaskExtList: any[];
};

interface ApproveHistoryProps {
  item: {
    batchNum: string;
    orderCode: string;
    approveType: ApproveType;
    reqNum?: string;
  };
}

interface ApproveResponseMap {
  [x: string]: WorkflowApproveDTO[] | null | [];
}

function ApproveHistory(props: ApproveHistoryProps) {
  const {
    item: {
      batchNum,
      orderCode,
      approveType,
      reqNum,
    },
  } = props;

  async function openModal() {
    const params = {
      batchNum,
      orderCode,
      approveType,
      reqNum,
    };
    let approveRecord: any[] = [];
    let forecastData: any[] = [];
    let type: string;
    // 工作流跟srm审批才有数据
    switch (approveType) {
      case ApproveType.WORKFLOWAPPROVAL:
        type = 'workflow';
        break;
      case ApproveType.EXTERNALAPPROVAL:
        type = 'srm';
        break;
      default:
        type = '';
        break;
    }
    try {
      // const res = await fetchApproveRecord(params);
      const res = await CuxFn({
        name: 'AomsOrder-myOrder-setApproveUrl',
        value: { orderCode: params.orderCode },
      })(()=>fetchApproveRecord(params))();
      // 深信服外部审批显示审批记录
      const typeValue: ApproveResponseMap | undefined | null | {} = CuxFn({
        name: 'AomsOrder-myOrder-setVariable',
        value: { value: 'workflow' },
      })(() => type)();
      const approveMap: ApproveResponseMap | undefined | null | {} = res[`${typeValue}ApproveResponseMap`];
      const forecastMap: ApproveResponseMap | undefined | null | {} = res[`${typeValue}ForecastListMap`];
      const approveList = isEmpty(approveMap) ? [] : (Object.values(approveMap as ApproveResponseMap)[0] || []).reverse();
      forecastData = isEmpty(forecastMap) ? [] : (Object.values(forecastMap as ApproveResponseMap)[0] || []).reverse();
      approveRecord = approveList.reduce((pre: any[], curr) => {
        const { historicTaskExtList = [] } = curr;
        const list = historicTaskExtList.reverse();
        pre.push(...list);
        return pre;
      }, []);
    } catch {
      approveRecord = [];
    }
    // 深信服外部审批显示审批记录
    const viewModelFlag = CuxFn({
      name: 'AomsOrder-myOrder-setVariable',
      value: { value: false },
    })(() => [ApproveType.EXTERNALSYSTEMAPPROVAL, ApproveType.FUNCTIONAPPROVAL].includes(approveType))();
    Modal.open({
      title: intl.get('mallf.myOrder.view.button.approveHistory').d('审批记录'),
      mask: true,
      style: { width: 750 },
      drawer: true,
      destroyOnClose: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      children: viewModelFlag ? (
        <div className={styles['no-data']}>
          <EmptySvg />
          <p>{intl.get('mallf.myOrder.view.info.noApproveHistory').d('当前审批规则暂不支持查看审批记录，请自行查询或耐心等待审批结果')}</p>
        </div>
      ) : <ApproveRecord showForecastBtnFlag={!isEmpty(forecastData)} data={approveRecord} forecastData={forecastData} />,
    });
  }

  return (
    <PermissionButton
      funcType={FuncType.flat}
      className="primary-link"
      style={{ marginTop: '8px' }}
      onClick={() => openModal()}
      permissionList={[orderApprovHistory]}
    >
      {intl.get('mallf.myOrder.view.button.approveHistory').d('审批记录')}
    </PermissionButton>
  );
}

export default cuxComponent({ path: 'MyMall/OMSOrder/OMS/OrderComponent/ApproveHistory' })(ApproveHistory);
