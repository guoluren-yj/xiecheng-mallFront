import React from 'react';
import intl from 'utils/intl';
import { Timeline } from 'choerodon-ui';
import moment from 'moment';

const successColor = '#47B883';
const dangerColor = '#FFEEEB';

export default function ProcessInfo(props) {
  const { detail } = props;
  const { operationRecordList = [] } = detail;
  return (
    <div style={{ flex: 1 }}>
      <div className="sale-process">
        <div className="sale-submit-table">
          <div className="sale-table-header">
            {intl.get(`mallf.saleStatus.view.saleStatus.after-salesProgress`).d('售后进度')}
          </div>
          <div className="sale-process-content">
            <div className="sale-process-steps-date">
              {operationRecordList.map(step => {
                return (
                  <div
                    className={`steps-date-item ${
                      ['REJECT', 'PRODUCT_REJECT'].includes(step.operationCode) ? 'step-reject' : ''
                    }`}
                  >
                    <div className="steps-date-title">
                      {moment(step.creationDate).format('YYYY-MM-DD')}
                    </div>
                    <div className="steps-date-des">
                      {moment(step.creationDate).format('HH:mm:ss')}
                    </div>
                  </div>
                );
              })}
            </div>
            <Timeline className="sale-process-steps" direction="vertical" progressDot>
              {operationRecordList.map(step => {
                const { description, userName, operationCode } = step;
                const stepColor = ['REJECT', 'PRODUCT_REJECT'].includes(operationCode)
                  ? dangerColor
                  : successColor;
                const operator = (
                  <>
                    <span>
                      {intl.get(`mallf.saleStatus.view.saleStatus.operator`).d('操作人')}：
                    </span>
                    <span>{userName}</span>
                  </>
                );
                return (
                  <Timeline.Item color={stepColor}>
                    <p className="sale-process-operatedRemark">
                      {['REJECT', 'PRODUCT_REJECT'].includes(operationCode)
                        ? description.split('，')[0]
                        : description}
                    </p>
                    <p
                      className={
                        ['REJECT', 'PRODUCT_REJECT'].includes(operationCode)
                          ? 'sale-process-operatedRemark'
                          : 'sale-process-description'
                      }
                    >
                      {operator}
                    </p>
                    {/* {['REJECT', 'PRODUCT_REJECT'].includes(operationCode) && (
                      <Popover content={operatedRemark.split('，')[1]}>
                        <p className="sale-process-description">
                          {operatedRemark.split('，')[1] || ''}
                        </p>
                      </Popover>
                    )} */}
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </div>
        </div>
      </div>
    </div>
  );
}
