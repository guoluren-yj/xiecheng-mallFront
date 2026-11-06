import React, { useEffect } from 'react';
import { Modal, Button, Timeline, Icon } from 'choerodon-ui';
import classNames from 'classnames';

import Loading from 'components/loading';
import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';
import { fetchOMSTrackService, fetchBaseInfoService } from 'services/orderCenterService';
import useSetState from 'hooks/useState';
import style from './index.less';

const { Sidebar } = Modal;
export default function InvoiceModal(props) {
  const { visible, product = {}, toggleModal, cecOrderCode } = props;
  const {
    consignmentCode, // 配送单
    cecFromCode: platformCode,
  } = product;

  const [state, setState] = useSetState({
    loading: false,
    visible: false,
    trackData: {},
    orderTrack: [],
  });
  const {
    loading,
    orderTrack,
    trackData: {
      logisticCompanyMeaning,
      logisticOrderNum,
      logisticsStaff,
      logisticsContactInfo,
      ecConsignmentCode,
      srmConsignmentCode,
    },
  } = state;

  useEffect(() => {
    if (visible) {
      fetchTrack();
    }
  }, [visible]);

  function fetchTrack() {
    setState({ loading: true });
    if (consignmentCode) {
      fetchBaseInfoService({ consignmentCode }).then((res) => {
        setState({
          trackData: res?.[0],
        });
      });
      fetchOMSTrackService({ consignmentCode })
        .then((res) => {
          setState({
            orderTrack: res?.orderTrack?.reverse(),
          });
        })
        .catch((error) => {
          setState({ errorMsg: error.message });
        })
        .finally(() => {
          setState({ loading: false });
        });
    }
  }

  return (
    <>
      <Sidebar
        title={intl.get('mallf.myOrder.view.logistics.information').d('查看物流信息')}
        className={style.content}
        visible={visible}
        width={742}
        onCancel={toggleModal}
        footer={[
          <Button
            style={{ height: 32, background: getPrimaryColor(), color: '#fff' }}
            key="back"
            onClick={toggleModal}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
        closable
      >
        {loading && consignmentCode ? (
          <Loading />
        ) : (
          <div className="logistics-drawer-content">
            <div style={{ marginBottom: '15px' }}>
              <div className="base-info-title">
                {intl.get('mallf.myOrder.view.title.baseInfo').d('基础信息')}
              </div>
              <div>
                <div className="base-info-item">
                  <span>{intl.get('mallf.myOrder.view.courier.number').d('快递单号')}：</span>
                  <span>{logisticOrderNum}</span>
                </div>
                <div className="base-info-item">
                  <span>{intl.get('mallf.myOrder.view.logistics.company').d('物流公司')}：</span>
                  <span>{logisticCompanyMeaning}</span>
                </div>
                {platformCode === 'CATA' ? (
                  <div className="base-info-item">
                    <span>{intl.get('mallf.myOrder.view.invoice.no').d('发货单号')}：</span>
                    <span>{srmConsignmentCode}</span>
                  </div>
                ) : (
                  <div className="base-info-item">
                    <span>{intl.get('mallf.myOrder.view.common.subPoNum').d('子订单号')}：</span>
                    <span>{ecConsignmentCode || cecOrderCode}</span>
                  </div>
                )}
                <div className="base-info-item">
                  <span>{intl.get('mallf.myOrder.view.common.deliveryStaff').d('配送人员')}：</span>
                  <span>{logisticsStaff}</span>
                </div>
                <div className="base-info-item">
                  <span>{intl.get(`mallf.myOrder.view.contactInformation`).d('联系方式')}：</span>
                  <span>{logisticsContactInfo}</span>
                </div>
              </div>
            </div>
            <div className="base-info-title">
              {intl.get(`mallf.myOrder.view.logisticsInfo`).d('物流信息')}
            </div>
            {!state.errorMsg && (
              <div className="content-header">
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1, color: '#191919' }}>
                    <span>
                      {intl.get('mallf.myOrder.view.lastTimeUpdate').d('最后一次更新时间')}
                    </span>
                    ：{orderTrack?.[0]?.operateTime}
                  </div>
                  <span className="logistics-info-refresh" onClick={fetchTrack}>
                    <Icon type="refresh" />
                    {intl.get(`hzero.common.button.refresh`).d('刷新')}
                  </span>
                </div>
              </div>
            )}
            {orderTrack?.length > 0 ? (
              <div className="content-info" style={{ maxHeight: window.innerHeight - 400 }}>
                <div>
                  <Timeline>
                    {orderTrack.map((item, index) => {
                      return (
                        <div className="time-line">
                          <span className="logistics-time">
                            {orderTrack[index]?.operateTime?.split(' ')[0] !==
                              orderTrack[index - 1]?.operateTime?.split(' ')[0] && (
                              <span>{item.operateTime?.split(' ')[0]}</span>
                            )}
                            <span style={{ marginLeft: 8 }}>{item.operateTime?.split(' ')[1]}</span>
                          </span>
                          <Timeline.Item
                            className={classNames({
                              'logistics-desc': true,
                              'c7n-timeline-item-last': index + 1 === orderTrack.length,
                            })}
                          >
                            {item.content}
                          </Timeline.Item>
                        </div>
                      );
                    })}
                  </Timeline>
                </div>
              </div>
            ) : (
              <div className="no-params">
                <p>{state.errorMsg || intl.get(`mallf.myOrder.view.noData`).d('暂无数据')}</p>
              </div>
            )}
          </div>
        )}
      </Sidebar>
    </>
  );
}
