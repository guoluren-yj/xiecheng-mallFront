import React, { useMemo, useEffect } from 'react';
import { Form, DataSet, Lov, Modal, TextField, DatePicker } from 'choerodon-ui/pro';
import { Timeline, Icon } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { fetchOMSSaleTrackService } from '@/services/orderCenterService';
import useSetState from '@/hooks/useState';
import Loading from 'components/loading';
import classNames from 'classnames';
import OverflowTip from 'components/OverflowTip';
import styles from '../../OMSSaleDetail/wayBill.less';

function CommoditySendsOutModal(props) {
  const { modal, onOk, afterSaleId, cecFromCode, wayBillData, orderEntryId, orderId } = props;
  const DS = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'logisticsCompany',
          type: 'object',
          lovCode: 'SINV.ASN_SHIPPER_NAME',
          required: true,
          label: intl.get('mallf.common.view.logistics.company').d('物流公司'),
        },
        {
          name: 'logisticsNum',
          required: true,
          label: intl.get(`mallf.orderDetail.view.saleStatus.shipmentNum`).d('物流单号'),
        },
        {
          name: 'deliverTime',
          label: intl.get(`mallf.orderDetail.view.saleStatus.deliveryTime`).d('发货时间'),
          required: cecFromCode !== 'CATA',
        },
      ],
    });
  }, [cecFromCode]);
  useEffect(() => {
    fetchTrack();
  }, []);

  modal.handleOk(async () => {
    const flag = await DS.current?.validate();
    const submitWaybill = () => {
      if (flag) {
        const data = DS.current?.toData();
        const params = {
          ...data,
          afterSaleId,
          logisticsCompanyCode: data?.logisticsCompany?.value,
          logisticsCompanyName: data?.logisticsCompany?.meaning,
        };
        onOk(params);
      } else {
        return false;
      }
    };

    // 填写运单 和 查看运单
    return isEmpty(wayBillData) ? submitWaybill() : true;
  });
  const [state, setState] = useSetState({
    loading: false,
    trackData: {},
    orderTrack: [],
  });

  function fetchTrack() {
    setState({ loading: true });
    const { logisticsCompanyCode, logisticsNum, EcConsignmentCode, logisticsType } = wayBillData;
    const params = {
      orderEntryId,
      logisticsCompanyCode,
      logisticsNum,
      EcConsignmentCode,
      orderId,
      logisticsType,
    };
    if (!logisticsNum) return;
    fetchOMSSaleTrackService(params)
      .then((res) => {
        setState({
          orderTrack: res?.[0].orderTrack?.reverse(),
        });
      })
      .catch((error) => {
        setState({ errorMsg: error.message });
      })
      .finally(() => {
        setState({ loading: false });
      });
  }
  const { loading, orderTrack } = state;
  return (
    <>
      {isEmpty(wayBillData) ? (
        <Form labelLayout="float" dataSet={DS}>
          <Lov name="logisticsCompany" />
          <TextField name="logisticsNum" />
          {cecFromCode !== 'CATA' && <DatePicker name="deliverTime" />}
        </Form>
      ) : loading ? (
        <Loading />
      ) : (
        <div className="logistics-drawer-content">
          <div style={{ marginBottom: '15px' }}>
            <div className="base-info-title">
              {intl.get('mallf.common.view.title.baseInfo').d('基础信息')}
            </div>
            <div>
              <div className="base-info-item">
                <span>
                  <OverflowTip style={{ display: 'inline-block' }}>
                    {intl.get(`mallf.orderDetail.view.saleStatus.logisticsCompany`).d('物流公司')}
                  </OverflowTip>
                  ：
                </span>
                <span>{wayBillData.logisticsCompanyName}</span>
              </div>
              <div className="base-info-item">
                <span>
                  <OverflowTip style={{ display: 'inline-block' }}>
                    {intl.get(`mallf.orderDetail.view.saleStatus.shipmentNum`).d('物流单号')}
                  </OverflowTip>
                  ：
                </span>
                <span>{wayBillData.logisticsNum}</span>
              </div>
              {cecFromCode !== 'CATA' && (
                <div className="base-info-item">
                  <span>
                    {intl.get(`mallf.orderDetail.view.saleStatus.deliveryTime`).d('发货时间')}：
                  </span>
                  <span>{wayBillData.deliverTime}</span>
                </div>
              )}
            </div>
          </div>
          <div className="base-info-title">
            {intl.get(`mallf.common.view.logisticsInfo`).d('物流信息')}
          </div>
          {!state.errorMsg && (
            <div className="content-header">
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, color: '#191919' }}>
                  <span>{intl.get('mallf.common.view.lastTimeUpdate').d('最后一次更新时间')}</span>
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
              <p>{state.errorMsg || intl.get(`mallf.common.view.noData`).d('暂无数据')}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function handleCommoditySendsOutModal(props) {
  const { wayBillData } = props;
  return Modal.open({
    title: isEmpty(wayBillData)
      ? intl.get(`mallf.orderDetail.view.saleStatus.logisticsEdit`).d('运单填写')
      : intl.get(`mallf.orderDetail.view.saleStatus.logisticsInfo`).d('运单信息'),
    destroyOnClose: true,
    movable: false,
    drawer: true,
    className: styles['way-bill-modal'],
    children: <CommoditySendsOutModal {...props} />,
    style: {
      width: isEmpty(wayBillData) ? 380 : 742,
    },
    okText: isEmpty(wayBillData)
      ? intl.get(`mallf.common.model.confirm`).d('确认')
      : intl.get('hzero.common.button.close').d('关闭'),
    okCancel: !!isEmpty(wayBillData),
  });
}
