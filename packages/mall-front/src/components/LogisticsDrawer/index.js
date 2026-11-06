import React, { useEffect } from 'react';
import { Drawer, Button } from 'hzero-ui';
import { Timeline, Icon } from 'choerodon-ui';
import classNames from 'classnames';

import intl from 'utils/intl';
import Loading from 'components/loading';
import { fetchECTrackService } from '@/services/orderCenterService';
import styles from './index.less';
import useSetState from '@/hooks/useState';

export default function LogisticsDrawer(props) {
  const {
    poSubHeaderId, // 供目录化查询
    poSubNum, // 子订单号 // 供电商查询
    ecPlatformCode = 'CATA', // 电商code
    init, // 非必需，需要初始化的情况才加，不加则点击查询
  } = props;
  const [state, setState] = useSetState({ loading: false, visible: false, trackData: {} });
  const {
    loading,
    visible,
    trackData: {
      orderTrack,
      logisticsCompany,
      deliveryId,
      thirdOrderId,
      logisticsStaff,
      logisticsContactInfo,
    },
  } = state;

  function fetchTrack() {
    setState({ loading: true });
    if (poSubHeaderId || poSubNum) {
      fetchECTrackService({ poSubNum, ecPlatformCode, poSubHeaderId })
        .then((res) => {
          setState({ trackData: res, orderTrack: res?.orderTrack?.reverse() });
        })
        .catch((error) => {
          setState({ errorMsg: error.message });
        })
        .finally(() => {
          setState({ loading: false });
        });
    }
  }

  useEffect(() => {
    if (visible && !init) {
      fetchTrack();
    }
  }, [visible]);

  useEffect(() => {
    if (init && !visible) {
      fetchTrack();
    }
  }, [init]);

  const data = orderTrack || [];
  return (
    <>
      <div
        onClick={() => {
          setState((p) => ({ visible: !p.visible }));
        }}
      >
        {props.children}
      </div>
      <Drawer
        visible={visible}
        width={742}
        bodyStyle={{ overflowY: 'hidden' }}
        onClose={() => {
          setState({ visible: false });
        }}
        wrapClassName={styles['logistics-drawer-modal']}
        destroyOnClose
      >
        <div className="logistics-drawer-header">
          {intl.get('mallf.common.view.logistics.information').d('查看物流信息')}
        </div>
        {loading && (poSubHeaderId || poSubNum) ? (
          <Loading />
        ) : (
          <div className="logistics-drawer-content">
            {(deliveryId ||
              logisticsCompany ||
              thirdOrderId ||
              logisticsStaff ||
              logisticsContactInfo) && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <div className="base-info-title">
                    {intl.get('mallf.common.view.title.baseInfo').d('基础信息')}
                  </div>
                  <div>
                    <div className="base-info-item">
                      <span>{intl.get('mallf.common.view.courier.number').d('快递单号')}：</span>
                      <span>{deliveryId}</span>
                    </div>
                    <div className="base-info-item">
                      <span>{intl.get('mallf.common.view.logistics.company').d('物流公司')}：</span>
                      <span>{logisticsCompany}</span>
                    </div>
                    {ecPlatformCode === 'CATA' ? (
                      <div className="base-info-item">
                        <span>{intl.get('mallf.common.view.invoice.no').d('发货单号')}：</span>
                        <span>{thirdOrderId}</span>
                      </div>
                    ) : (
                      <div className="base-info-item">
                        <span>{intl.get('mallf.common.view.common.subPoNum').d('子订单号')}：</span>
                        <span>{thirdOrderId}</span>
                      </div>
                    )}
                    <div className="base-info-item">
                      <span>
                        {intl.get('mallf.common.view.common.deliveryStaff').d('配送人员')}：
                      </span>
                      <span>{logisticsStaff}</span>
                    </div>
                    <div className="base-info-item">
                      <span>
                        {intl.get(`mallf.common.view.contactInformation`).d('联系方式')}：
                      </span>
                      <span>{logisticsContactInfo}</span>
                    </div>
                  </div>
                </div>
                <div className="base-info-title">
                  {intl.get(`mallf.common.view.logisticsInfo`).d('物流信息')}
                </div>
                <div className="content-header">
                  <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1, color: '#191919' }}>
                      <span>
                        {intl.get('mallf.common.view.lastTimeUpdate').d('最后一次更新时间')}
                      </span>
                      ：{data?.[0]?.operateTime}
                    </div>
                    <span className="logistics-info-refresh" onClick={fetchTrack}>
                      <Icon type="refresh" />
                      {intl.get(`hzero.common.button.refresh`).d('刷新')}
                    </span>
                  </div>
                </div>
              </>
            )}
            {data?.length > 0 ? (
              <div className="content-info" style={{ maxHeight: window.innerHeight - 400 }}>
                <div>
                  <Timeline>
                    {data.map((item, index) => {
                      return (
                        <div className="time-line">
                          <span className="logistics-time">
                            {data[index]?.operateTime?.split(' ')[0] !==
                              data[index - 1]?.operateTime?.split(' ')[0] && (
                              <span>{item.operateTime?.split(' ')[0]}</span>
                            )}
                            <span style={{ marginLeft: 8 }}>{item.operateTime?.split(' ')[1]}</span>
                          </span>
                          <Timeline.Item
                            className={classNames({
                              'logistics-desc': true,
                              'c7n-timeline-item-last': index + 1 === data.length,
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
                <p>{state.errorMsg || intl.get(`mallf.common.view.noData`).d('暂无数据')}</p>
              </div>
            )}
          </div>
        )}
        <div className="logistics-drawer-footer">
          <Button type="primary" onClick={() => setState({ visible: false })}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </div>
      </Drawer>
    </>
  );
}
