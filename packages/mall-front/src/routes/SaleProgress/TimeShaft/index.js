import React, { Fragment } from 'react';

import intl from 'utils/intl';
import './index.less';

class TimeShaft extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 渲染物流list
   */
  renderList = (data, firstItem, lastItem) => {
    const { operator, remark } = this.props;
    if (data.length === 0) {
      return false;
    } else if (data.length === 1) {
      return (
        <Fragment>
          <li className="active">
            <div className="logistics-date">
              <span>{firstItem.operatedDate.split(' ')[0]}</span>
            </div>
            <div className="logistics-time">
              <span>{firstItem.operatedDate.split(' ')[1]}</span>
            </div>
            <div className="logistics-box-cicle">
              <span className="logistics-cicle active" />
            </div>
            <div className="logistics-desc" style={{ borderBottom: 'none' }}>
              {operator && (
                <span className="logistics-desc-operator">
                  {intl.get(`mallf.saleStatus.view.saleStatus.operator`).d('操作人')}：
                  {firstItem.operatedName}
                </span>
              )}
              <span>{firstItem.operatedRemark}</span>
              {remark && (
                <span
                  title={remark}
                  style={{
                    marginLeft: 24,
                    color: '#999',
                  }}
                >
                  {intl.get(`mallf.saleStatus.view.remark`).d('备注')}：{remark}
                </span>
              )}
            </div>
          </li>
        </Fragment>
      );
    } else if (data.length > 1) {
      return (
        <Fragment>
          <li className="active">
            <div className="logistics-date">
              <span>{firstItem.operatedDate.split(' ')[0]}</span>
            </div>
            <div className="logistics-time">
              <span>{firstItem.operatedDate.split(' ')[1]}</span>
            </div>
            <div className="logistics-box-cicle">
              <span className="logistics-cicle active line" />
            </div>
            <div className="logistics-desc">
              {operator && (
                <span className="logistics-desc-operator">
                  {intl.get(`mallf.saleStatus.view.saleStatus.operator`).d('操作人')}：
                  {firstItem.operatedName}
                </span>
              )}
              <span>{firstItem.operatedRemark}</span>
              {remark && (
                <span
                  style={{
                    marginLeft: 24,
                    color: '#999',
                  }}
                  title={remark}
                >
                  {intl.get(`mallf.saleStatus.view.remark`).d('备注')}：{remark}
                </span>
              )}
            </div>
          </li>
          {data.map(
            (item, index) =>
              index > 0 &&
              index < data.length - 1 && (
                <li>
                  <div className="logistics-date">
                    {data[index - 1].operatedDate.split(' ')[0] &&
                      data[index].operatedDate.split(' ')[0] !==
                        data[index - 1].operatedDate.split(' ')[0] && (
                        <span>{item.operatedDate.split(' ')[0]}</span>
                      )}
                  </div>
                  <div className="logistics-time">
                    <span>{item.operatedDate.split(' ')[1]}</span>
                  </div>
                  <div className="logistics-box-cicle">
                    <span className="logistics-cicle line" />
                  </div>
                  <div className="logistics-desc">
                    {operator && (
                      <span className="logistics-desc-operator">
                        {intl.get(`mallf.saleStatus.view.saleStatus.operator`).d('操作人')}：
                        {item.operatedName}
                      </span>
                    )}
                    <span>{item.operatedRemark}</span>
                  </div>
                </li>
              )
          )}
          <li>
            <div className="logistics-date">
              {data[data.length - 1].operatedDate.split(' ')[0] &&
                data[data.length - 1].operatedDate.split(' ')[0] !==
                  lastItem.operatedDate.split(' ')[0] && (
                  <span>{lastItem.operatedDate.split(' ')[0]}</span>
                )}
            </div>
            <div className="logistics-time">
              <span>{lastItem.operatedDate.split(' ')[1]}</span>
            </div>
            <div className="logistics-box-cicle">
              <span className="logistics-cicle" />
            </div>
            <div className="logistics-desc" style={{ borderBottom: 'none' }}>
              {operator && (
                <span className="logistics-desc-operator">
                  {intl.get(`mallf.saleStatus.view.saleStatus.operator`).d('操作人')}：
                  {lastItem.operatedName}
                </span>
              )}
              <span>{lastItem.operatedRemark}</span>
            </div>
          </li>
        </Fragment>
      );
    }
  };

  render() {
    const { closeModal = (e) => e, data = [], header } = this.props;
    const newData = [...data].reverse();
    const firstItem = newData[0];
    const lastItem = newData[newData.length - 1];

    return (
      <Fragment>
        <div className="logistics-madal">
          {header ? (
            <div className="logistics-header">
              <span>
                {intl.get(`mallf.saleStatus.view.saleStatus.logisticsInformation`).d('物流信息')}
              </span>
              <a
                onClick={() => {
                  closeModal();
                }}
                className="logistics-header-close"
              >
                &nbsp;
              </a>
            </div>
          ) : (
            ''
          )}
          <div className="logistics-content">
            <div className="logistics-list">
              <ul>{this.renderList(newData, firstItem, lastItem)}</ul>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default TimeShaft;
