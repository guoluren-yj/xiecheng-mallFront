import React, { useEffect } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { Form, Input, Row, Modal, Icon, Timeline, Button } from 'choerodon-ui';
import { DatePicker } from 'choerodon-ui/pro';
import { isEmpty, compose } from 'lodash';
import classNames from 'classnames';

import locale from 'hzero-ui/lib/date-picker/locale/zh_CN';
import 'moment/locale/zh-cn';
import Lov from 'components/lov';
import Loading from 'components/loading';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getPrimaryColor } from 'utils/utils';
import { fetchOMSSaleTrackService } from '@/services/orderCenterService';
import useSetState from '@/hooks/useState';
import OverflowTip from 'components/OverflowTip';

import styles from './wayBill.less';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();

function WayBillModal(props) {
  const {
    cecFromCode,
    wayBillData,
    orderEntryId,
    orderId,
    modalVisible,
    onOk,
    onCancel,
    submitLoading,
    form: { getFieldDecorator, validateFields, setFieldsValue },
  } = props;

  const [state, setState] = useSetState({
    loading: false,
    visible: false,
    trackData: {},
    orderTrack: [],
  });

  const handleOk = () => {
    if (isEmpty(wayBillData)) {
      validateFields((err, values) => {
        if (!err) {
          const params = {
            ...values,
            deliverTime: values?.deliverTime?.format('YYYY-MM-DD HH:mm:ss'),
          };
          onOk(params);
        }
      });
    } else {
      onCancel();
    }
  };

  useEffect(() => {
    if (modalVisible) {
      fetchTrack();
    }
  }, [modalVisible]);

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
  const footer = isEmpty(wayBillData)
    ? {}
    : {
        footer: [
          <Button
            style={{ height: 32, background: getPrimaryColor(), color: '#fff' }}
            key="back"
            onClick={onCancel}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ],
      };

  return (
    <Sidebar
      destroyOnClose
      wrapClassName={`hmall-content-Modal ${styles['way-bill-modal']}`}
      width={isEmpty(wayBillData) ? 400 : 742}
      title={
        isEmpty(wayBillData)
          ? intl.get(`mallf.orderDetail.view.saleStatus.logisticsEdit`).d('运单填写')
          : intl.get(`mallf.orderDetail.view.saleStatus.logisticsInfo`).d('运单信息')
      }
      visible={modalVisible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={intl.get(`mallf.orderDetail.model.confirm`).d('确认')}
      cancelText={intl.get(`mallf.orderDetail.button.cancel`).d('取消')}
      confirmLoading={submitLoading}
      {...footer}
    >
      {isEmpty(wayBillData) ? (
        <div className="way-bill-form">
          <Row>
            <FormItem
              label={intl.get(`mallf.orderDetail.view.saleStatus.logisticsCompany`).d('物流公司')}
              required
            >
              {getFieldDecorator('logisticsCompanyName')}
              {getFieldDecorator('logisticsCompanyCode', {
                rules: [
                  {
                    required: true,
                    message: `${intl
                      .get(`mallf.orderDetail.view.logisticsCompanNotEmpty`)
                      .d('物流公司不能为空')}！`,
                  },
                ],
              })(
                <Lov
                  c7n
                  lovCode="SINV.ASN_SHIPPER_NAME"
                  queryParams={{ tenantId: organizationId }}
                  onOkCallback={({ data }) => {
                    setFieldsValue({
                      logisticsCompanyCode: data.value,
                      logisticsCompanyName: data.meaning,
                    });
                  }}
                  width="100%"
                  placeholder={`${intl
                    .get(`mallf.orderDetail.view.chooseLogisticsCompany`)
                    .d('请填写物流公司')}`}
                />
              )}
            </FormItem>
          </Row>
          <Row>
            <FormItem
              label={intl.get(`mallf.orderDetail.view.saleStatus.shipmentNum`).d('物流单号')}
              required
            >
              {getFieldDecorator('logisticsNum', {
                rules: [
                  {
                    required: true,
                    message: `${intl
                      .get(`mallf.orderDetail.view.saleStatus.shipmentNumCannotBeEmpty`)
                      .d('物流单号不能为空')}！`,
                  },
                ],
              })(
                <Input
                  placeholder={`${intl
                    .get(`mallf.orderDetail.view.chooseLogisticsNum.`)
                    .d('请填写物流单号')}`}
                />
              )}
            </FormItem>
          </Row>
          {cecFromCode !== 'CATA' && (
            <Row>
              <FormItem
                label={intl.get(`mallf.orderDetail.view.saleStatus.deliveryTime`).d('发货时间')}
                required
              >
                {getFieldDecorator('deliverTime', {
                  rules: [
                    {
                      required: true,
                      message: `${intl
                        .get(`mallf.orderDetail.view.saleStatus.deliveryTimeCannotBeEmpty`)
                        .d('发货时间不能为空')}！`,
                    },
                  ],
                })(
                  <DatePicker
                    format="YYYY-MM-DD hh:mm:ss"
                    style={{ width: '100%' }}
                    locale={locale}
                    placeholder={`${intl
                      .get(`mallf.orderDetail.view.chooseSendTime.`)
                      .d('请选择发货时间')}`}
                    showTime
                  />
                )}
              </FormItem>
            </Row>
          )}
        </div>
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
                  <span>{intl.get('mallf.myOrder.view.lastTimeUpdate').d('最后一次更新时间')}</span>
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
  );
}

export default compose(
  Form.create({ fieldNameProp: null }),
  formatterCollections({ code: 'mallf.orderDetail' })
)(WayBillModal);
