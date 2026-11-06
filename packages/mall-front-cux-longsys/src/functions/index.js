import React from 'react';

function getBasketColumns(props) {
  const { basketColumns, type } = props || {};
  const cuxBasketColumns = [
    {
      name: 'centralizedApproveKey',
      header: '审批编号',
      width: 100,
      tooltip: 'none',
      show: type === 'demander',
      renderer: ({ text }) => (
        <div className="text-overflow" style={{ lineHeight: '18px' }}>
          {text || '-'}
        </div>
      ),
    },
    {
      name: 'centralizedApproveRemark',
      header: '审批意见',
      width: 100,
      tooltip: 'none',
      show: type === 'demander',
      renderer: ({ text }) => (
        <div className="text-overflow" style={{ lineHeight: '18px' }}>
          {text || '-'}
        </div>
      ),
    },
  ].filter((f) => f.show !== false);
  return [...basketColumns, ...cuxBasketColumns];
}

function setDemanderDataSetSelectable({ record }) {
  return !['INVALID', 'SUBMITTED', 'APPROVEING'].includes(record.get('centralizedStatus'));
}

export { getBasketColumns, setDemanderDataSetSelectable };
