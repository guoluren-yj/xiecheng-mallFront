import React from 'react';
import intl from 'utils/intl';

export default function OtherInfo({ associatedData }) {
  return (
    <>
      <p className="content-title" style={{ marginTop: '30px' }}>
        {intl.get('mallf.common.view.other.information').d('其他信息')}
      </p>
      {associatedData.attributeVarchar4 && (
        <p className="line-item">
          <span className="line-item-label">
            {intl.get('mallf.myMall.view.order.attributeVarchar4').d('驳回人')}:
          </span>
          <span className="line-item-info">{associatedData.attributeVarchar4}</span>
        </p>
      )}
      {associatedData.attributeVarchar5 && (
        <p className="line-item">
          <span className="line-item-label">
            {intl.get('mallf.myMall.view.order.attributeVarchar5').d('驳回理由')}:
          </span>
          <span className="line-item-info">{associatedData.attributeVarchar5}</span>
        </p>
      )}
      {associatedData.attributeVarchar8 && (
        <p className="line-item">
          <span className="line-item-label">
            {intl.get('mallf.myMall.view.order.attributeVarchar8').d('审核人')}:
          </span>
          <span className="line-item-info">{associatedData.attributeVarchar8}</span>
        </p>
      )}
      {associatedData.attributeVarchar9 && (
        <p className="line-item">
          <span className="line-item-label">
            {intl.get('mallf.myMall.view.order.attributeVarchar9').d('SQ单号')}:
          </span>
          <span className="line-item-info">{associatedData.attributeVarchar9}</span>
        </p>
      )}
    </>
  );
}
