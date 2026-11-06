import React, { useEffect, useState } from 'react';
import { Modal } from 'choerodon-ui/pro';
import ApproveRecord from 'components/ApproveRecord';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchApprovalRecordApi } from '../services/index.js';

function ApprovalRecord({ record }) {
  const [approveRecord, setApproveRecord] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetchApprovalRecordApi({
        centralizedRelationId: record.centralizedRelationId,
      });
      if (res) {
        setApproveRecord(res);
      }
    } catch {
      setApproveRecord([]);
    }
  }
  return <ApproveRecord data={approveRecord} />;
}

function AppendOptionsBtn(props) {
  const { record } = props || {};
  const centralizedStatus = record.oldCentralizedStatus;
  const handleApproveRecord = () => {
    Modal.open({
      title: '审批记录',
      drawer: true,
      closable: false,
      style: { width: 742 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      cancelButton: false,
      children: <ApprovalRecord record={record} />,
    });
  };
  return (
    ['APPROVEING', 'SUBMITTED', 'REJECTED', 'RETURNED'].includes(centralizedStatus) && (
      <a className="option-btn" style={{ marginTop: '4px' }} onClick={() => handleApproveRecord()}>
        审批记录
      </a>
    )
  );
}

export default formatterCollections({ code: ['component.operationRecord'] })(AppendOptionsBtn);
