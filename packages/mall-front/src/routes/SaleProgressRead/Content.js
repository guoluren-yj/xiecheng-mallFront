import React, { useEffect, Fragment } from 'react';
import { Spin } from 'hzero-ui';

import intl from 'utils/intl';
import { HmallOptions } from 'utils/options';
import useState from '@/hooks/useState';

// import TimeShaft from './TimeShaft';
import Approving from '../../assets/images/afterSale/node_01.svg';
import Process from '../../assets/images/afterSale/node_02.svg';
import Cancel from '../../assets/images/afterSale/cancelSaleafter.svg';
import Confirm from '../../assets/images/afterSale/tobeConfirm.svg';
import DisMiss from '../../assets/images/afterSale/dismissSaleafter.svg';
import Finish from '../../assets/images/afterSale/salefinish.svg';

function Content(props) {
  const { serviceTypeMapping, pickWareTypeMapping } = HmallOptions();
  const { detail = {}, ecServiceList } = props;
  const [state, setState] = useState({
    progressImg: '',
    currentNode: 1,
    listDisplay: false,
  });

  const { currentNode, listDisplay } = state;

  /**
   * 运单展开收起
   */
  const toggleWaybill = () => {
    setState({
      listDisplay: !listDisplay,
    });
  };

  // const getClassName = (classnames = {}) => {
  //   const classList = Object.keys(classnames).filter(item => classnames[item]);
  //   return classList.join(' ');
  // };

  const getCurrentNode = () => {
    const { afterSaleStatus: status, practicalPickWareType, pickWareType } = detail;
    if (status === 'APPROVING') {
      setState({ progressImg: Approving, currentNode: 1 }); // SubmitAudit
    } else if (status === 'CANCELED') {
      setState({ progressImg: Cancel, currentNode: 2 }); // CancelSaleafter
    } else if (
      ['RECEIVED', 'PROCESSING_COMPLETED', 'WAIT_REFUNDED', 'DELIVERED', 'PROCESSING'].includes(
        status
      ) ||
      (status === 'PASS' &&
        (practicalPickWareType ? practicalPickWareType === '2' : pickWareType === '2'))
    ) {
      setState({ progressImg: Process, currentNode: 3 }); // Processing
    } else if (status === 'WAIT_CONFIRM' || status === 'CONFIRMED') {
      setState({ progressImg: Confirm, currentNode: 4 }); // TobeConfirm
    } else if (status === 'REJECT') {
      setState({ progressImg: DisMiss, currentNode: 5 }); // DismissSaleafter
    } else if (status === 'FINISHED') {
      setState({ progressImg: Finish, currentNode: 6 }); // SaleAfterComplete
    } else if (
      (status === 'PASS' &&
        (practicalPickWareType ? practicalPickWareType === '2' : pickWareType === '2')) ||
      status === 'NEED_SEND'
    ) {
      setState({ progressImg: Process, currentNode: 7 }); // SubmitWaybill
    } else if (
      status === 'PASS' &&
      (practicalPickWareType ? practicalPickWareType !== '2' : pickWareType !== '2')
    ) {
      setState({ progressImg: Process, currentNode: 8 });
    }
  };

  // const renderNodeInfo = () => {
  //   if (currentNode === 1) {
  //     return (
  //       <div>
  //         <span style={{ left: '-15px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.submitApplication`).d('提交申请')}
  //         </span>
  //         <span style={{ left: '-8px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.pendingReview`).d('待审核')}
  //         </span>
  //         {detail.pickWareType === '2' ? (
  //           <span style={{ left: '4px', width: 75 }}>
  //             {intl.get(`mallf.saleStatus.view.saleStatus.waitingCustomerDelivery`).d('待客户发货')}
  //           </span>
  //         ) : (
  //           <span style={{ left: '4px', width: 75 }}>
  //             {intl.get(`mallf.saleStatus.view.order.processed`).d('待处理')}
  //           </span>
  //         )}
  //         <span style={{ left: '15px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.toBeConfirmed`).d('待确认')}
  //         </span>
  //         <span style={{ left: '20px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.afterCompleted`).d('售后完成')}
  //         </span>
  //       </div>
  //     );
  //   } else if (currentNode === 2) {
  //     return (
  //       <div style={{ width: 196 }}>
  //         <span style={{ left: '-24px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.submitApplication`).d('提交申请')}
  //         </span>
  //         <span className="dismiss" style={{ left: '7px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.cancelApplication`).d('取消申请')}
  //         </span>
  //       </div>
  //     );
  //   } else if (currentNode === 3) {
  //     return (
  //       <div>
  //         <span style={{ left: '-15px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.submitApplication`).d('提交申请')}
  //         </span>
  //         <span style={{ left: '-16px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.examinationPassed`).d('审核通过')}
  //         </span>
  //         <span style={{ left: '2px' }}>{detail?.showAfterSaleStatusMeaning}</span>
  //         <span style={{ left: '16px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.toBeConfirmed`).d('待确认')}
  //         </span>
  //         <span style={{ left: '18px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.afterCompleted`).d('售后完成')}
  //         </span>
  //       </div>
  //     );
  //   } else if (currentNode === 4) {
  //     return (
  //       <div>
  //         <span style={{ left: -14 }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.submitApplication`).d('提交申请')}
  //         </span>
  //         <span style={{ left: -8 }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.examinationPassed`).d('审核通过')}
  //         </span>
  //         <span style={{ left: 2 }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.processingCompleted`).d('处理完成')}
  //         </span>
  //         <span style={{ left: 13 }}>{detail?.showAfterSaleStatusMeaning}</span>
  //         <span style={{ left: 19 }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.afterCompleted`).d('售后完成')}
  //         </span>
  //       </div>
  //     );
  //   } else if (currentNode === 5) {
  //     return (
  //       <div style={{ width: 196 }}>
  //         <span style={{ left: '-25px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.submitApplication`).d('提交申请')}
  //         </span>
  //         <span className="dismiss" style={{ left: '6px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.rejectApplication`).d('驳回申请')}
  //         </span>
  //       </div>
  //     );
  //   } else if (currentNode === 6) {
  //     return (
  //       <div>
  //         <span style={{ left: '-20px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.submitApplication`).d('提交申请')}
  //         </span>
  //         <span style={{ left: '-15px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.examinationPassed`).d('审核通过')}
  //         </span>
  //         <span style={{ left: '-4px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.processingCompleted`).d('处理完成')}
  //         </span>
  //         <span style={{ left: '9px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.confirmationCompleted`).d('确认完成')}
  //         </span>
  //         <span style={{ left: '15px', color: '#6abf36' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.afterCompleted`).d('售后完成')}
  //         </span>
  //       </div>
  //     );
  //   } else if (currentNode === 7) {
  //     return (
  //       <div>
  //         <span style={{ left: '-14px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.submitApplication`).d('提交申请')}
  //         </span>
  //         <span style={{ left: '-20px', width: '70px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.examinationPassed`).d('审核通过')}
  //         </span>
  //         <span style={{ left: '-7px' }}>{detail?.showAfterSaleStatusMeaning}</span>
  //         <span style={{ left: '12px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.toBeConfirmed`).d('待确认')}
  //         </span>
  //         <span style={{ left: '20px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.afterCompleted`).d('售后完成')}
  //         </span>
  //       </div>
  //     );
  //   } else if (currentNode === 8) {
  //     return (
  //       <div>
  //         <span style={{ left: '-15px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.submitApplication`).d('提交申请')}
  //         </span>
  //         <span style={{ left: '-8px' }}>
  //           {detail?.afterSaleStatusMeaning ||
  //             intl.get(`mallf.saleStatus.view.saleStatus.examinationPassed`).d('审核通过')}
  //         </span>
  //         <span style={{ left: '4px', width: 75 }}>
  //           {detail?.showAfterSaleStatusMeaning ||
  //             intl.get(`mallf.saleStatus.view.order.processed`).d('待处理')}
  //         </span>
  //         <span style={{ left: '15px', color: '#8c8c8c' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.toBeConfirmed`).d('待确认')}
  //         </span>
  //         <span style={{ left: '20px' }}>
  //           {intl.get(`mallf.saleStatus.view.saleStatus.afterCompleted`).d('售后完成')}
  //         </span>
  //       </div>
  //     );
  //   } else {
  //     return null;
  //   }
  // };

  useEffect(() => {
    getCurrentNode();
  }, []);

  const { afterSaleItemList = [], ecAfterSaleWaybillList = [] } = detail;

  const btnDisplay =
    ecAfterSaleWaybillList && ecAfterSaleWaybillList.length > 1 ? 'inline-block' : 'none';

  return (
    <Spin spinning={false}>
      <div>
        <div className="sale-application-list">
          {/* <div
            className={getClassName({
              'progress-step': true,
              'two-light': currentNode === 1,
              'three-light': currentNode === 3 || currentNode === 7,
              'five-light': currentNode === 4,
            })}
          >
            {currentNode === 2 || currentNode === 5 ? (
              <img src={progressImg} alt="" style={{ display: 'inline-block' }} />
            ) : (
              <img src={progressImg} alt="" width="100%" style={{ display: 'inline-block' }} />
            )}
            {renderNodeInfo()}
          </div> */}
          {/* {detail && detail.afterSaleRecordList && (
            <div>
              <div className="">
                <p className="after-num">
                  {intl.get(`mallf.saleStatus.view.saleStatus.after-salesProgress`).d('售后进度')}
                </p>
              </div>
              <div className="content-logistics-info" style={{ border: '1px solid #e9e8e8' }}>
                <TimeShaft data={detail.afterSaleRecordList} dataHeight={63} operator />
              </div>
            </div>
          )} */}
          <div className="sale-submit-table">
            <div className="sale-table-header">
              {intl.get(`mallf.saleStatus.view.saleStatus.serviceOrderInformation`).d('服务单信息')}
            </div>
            {[3, 4, 6].includes(currentNode) && (
              <div className="sale-table-head">
                <div className="sale-table-body">
                  <span className="label">
                    {intl.get(`mallf.saleStatus.view.saleStatus.E-commerceOrderNum`).d('电商单号')}
                    ：
                  </span>
                  <span className="sale-table-data out-right">{detail.ecPoNum}</span>
                  <span className="sale-table-ec">
                    {intl.get(`mallf.saleStatus.view.saleStatus.E-commerce`).d('电商')}：
                  </span>
                  <span className="sale-table-data">
                    {
                      ecServiceList.find(f => f.ecPlatformCode === detail.ecPlatform)
                        ?.ecPlatformName
                    }
                  </span>
                </div>
                <div className="sale-table-body">
                  {detail.ecNewPoNum && (
                    <Fragment>
                      <span className="label">
                        {intl.get(`mallf.saleStatus.view.saleStatus.newOrderNum`).d('新订单号')}：
                      </span>
                      <span className="sale-table-data out-right">{detail.ecNewPoNum}</span>
                    </Fragment>
                  )}
                  <span className="sale-table-number label">
                    {intl.get(`mallf.saleStatus.view.saleStatus.orderNum`).d('订单号')}：
                  </span>
                  <span className="sale-table-data">{detail.poNum}</span>
                </div>
              </div>
            )}
            <div className="sale-table-row">
              <span className="sale-table-info label">
                {intl.get(`mallf.saleStatus.view.saleStatus.serviceType`).d('服务类型')}
              </span>
              <span className="sale-table-linkman">
                {/* <span>{intl.get(`mallf.saleStatus.view.saleStatus.contact`).d('联系人')}：</span> */}
                <span className="sale-table-name" title={detail.afsType}>
                  {detail.afsType}
                </span>
              </span>
              <span className="label">
                {intl.get(`mallf.saleStatus.view.saleStatus.problemDesc`).d('问题描述')}：
              </span>
              <span className="sale-table-data">
                {afterSaleItemList && afterSaleItemList[0]?.problemDesc}
              </span>
              <span className="sale-table-phone">
                <span>{intl.get(`mallf.saleStatus.view.saleStatus.mobilePhone`).d('手机')}：</span>
                <span className="sale-table-content" title={detail.customerTel}>
                  {detail.customerTel}
                </span>
              </span>
              <span className="sale-table-address">
                <span>{intl.get(`mallf.saleStatus.view.saleStatus.address`).d('地址')}：</span>
                <span className="sale-table-content" title={detail.pickWareFullAddress}>
                  {detail.pickWareFullAddress}
                </span>
              </span>
            </div>
            {detail.pickWareType === '2' &&
              detail.afterSaleStatus !== 'APPROVING' &&
              detail.afterSaleStatus !== 'REJECT' && (
                <div className="sale-table-row">
                  <span className="sale-table-info label">
                    {intl.get(`mallf.saleStatus.view.saleStatus.serviceType`).d('服务类型')}
                  </span>
                  <span className="sale-table-linkman">
                    {/* <span>{intl.get(`mallf.saleStatus.view.saleStatus.contact`).d('联系人')}：</span> */}
                    <span className="sale-table-name" title={detail.afsType}>
                      {detail.afsType}
                    </span>
                  </span>
                  <span className="label">
                    {intl.get(`mallf.saleStatus.view.saleStatus.problemDesc`).d('问题描述')}：
                  </span>
                  <span className="sale-table-info label">
                    {intl.get(`mallf.saleStatus.view.saleStatus.supplierInfo`).d('供应商信息')}：
                  </span>
                  <span className="sale-table-linkman">
                    <span>
                      {intl.get(`mallf.saleStatus.view.saleStatus.contact`).d('联系人')}：
                    </span>
                    <span className="sale-table-name" title={detail.deliveryName}>
                      {detail.deliveryName}
                    </span>
                  </span>
                  <span className="sale-table-phone">
                    <span>
                      {intl.get(`mallf.saleStatus.view.saleStatus.mobilePhone`).d('手机')}：
                    </span>
                    <span className="sale-table-content" title={detail.deliveryTel}>
                      {detail.deliveryTel}
                    </span>
                  </span>
                  <span className="sale-table-address">
                    <span>{intl.get(`mallf.saleStatus.view.saleStatus.address`).d('地址')}：</span>
                    <span className="sale-table-content" title={detail.deliveryAddress}>
                      {detail.deliveryAddress}
                    </span>
                  </span>
                </div>
              )}
            <div className="sale-table-body">
              <span className="label">
                {intl.get(`mallf.saleStatus.view.saleStatus.returnAddress`).d('返件地址')}：
              </span>
              <span className="sale-table-data">{detail.returnWareFullAddress}</span>
            </div>
            {/* <div className="sale-table-body">
              <span className="label">
                {intl.get(`mallf.saleStatus.view.saleStatus.contactAddress`).d('联系人地址')}：
              </span>
              <span className="sale-table-data">{detail.pickWareFullAddress}</span>
            </div> */}
            <div className="sale-table-body">
              <span className="label">
                {intl.get(`mallf.saleStatus.view.saleStatus.afterSales`).d('售后信息')}：
              </span>
              {afterSaleItemList &&
                afterSaleItemList.length > 0 &&
                afterSaleItemList.map(item => (
                  <span className="sale-table-data" key={item.afterSaleItemId}>
                    {serviceTypeMapping[item.afsType]}：{item.realityQuantity || item.applyQuantity}
                  </span>
                ))}
            </div>
            <div className="sale-table-body">
              <span className="label">
                {intl.get(`mallf.saleStatus.view.saleStatus.pickupMethod`).d('取件方式')}：
              </span>
              {detail.practicalPickWareType &&
              detail.pickWareType !== detail.practicalPickWareType ? (
                <span className="sale-table-data">
                  {intl
                    .get(`mallf.saleStatus.view.saleStatus.wayCustomersExpectPickup`)
                    .d('客户期望的取件方式是')}
                  <span className="sale-data-bold">{pickWareTypeMapping[detail.pickWareType]}</span>
                  ，{intl.get(`mallf.saleStatus.view.actuaPickupMethod`).d('实际售后取件方式是')}
                  <span className="sale-data-bold">
                    {pickWareTypeMapping[detail.practicalPickWareType]}
                  </span>
                </span>
              ) : (
                <span className="sale-table-data">{pickWareTypeMapping[detail.pickWareType]}</span>
              )}
            </div>
            {detail.reserveTimeBegin && (
              <div className="sale-table-body">
                <span className="label">
                  {intl.get(`mallf.saleStatus.view.saleStatus.pickupTime`).d('取件时间')}：
                </span>
                <span className="sale-table-data">
                  {intl
                    .get(`mallf.saleStatus.view.saleStatus.appointmentStartPickupTime`)
                    .d('预约开始取件时间')}
                  ：{detail.reserveTimeBegin}，
                  {intl
                    .get(`mallf.saleStatus.view.saleStatus.appointmentPickupTime`)
                    .d('预约结束取件时间')}
                  ：{detail.reserveTimeEnd}
                </span>
              </div>
            )}
            {[3, 6].includes(currentNode) && (
              <Fragment>
                <div className="sale-table-body">
                  <span className="label">
                    {intl.get(`mallf.saleStatus.view.saleStatus.shippingInformation`).d('发运信息')}
                    ：
                  </span>
                  {ecAfterSaleWaybillList && ecAfterSaleWaybillList.length > 0 ? (
                    <p>
                      <span className="sale-table-data">
                        {intl
                          .get(`mallf.saleStatus.view.saleStatus.logisticsCompany`)
                          .d('物流公司')}
                        ：{ecAfterSaleWaybillList && ecAfterSaleWaybillList[0].logisticsCompanyName}
                        ，{intl.get(`mallf.saleStatus.view.saleStatus.shipmentNum`).d('物流单号')}：
                        {ecAfterSaleWaybillList && ecAfterSaleWaybillList[0].logisticsNum}，
                        {intl.get(`mallf.saleStatus.view.saleStatus.deliveryTime`).d('发货时间')}：
                        {ecAfterSaleWaybillList && ecAfterSaleWaybillList[0].deliverTime}
                      </span>
                      <span>
                        {listDisplay ? (
                          <a
                            className="logistics-info-more"
                            onClick={toggleWaybill}
                            style={{
                              display: `${btnDisplay}`,
                              color: '#C88F08',
                              paddingLeft: '50px',
                            }}
                          >
                            {intl.get(`mallf.saleStatus.model.saleStatus.collapse`).d('收起')}
                          </a>
                        ) : (
                          <a
                            className="logistics-info-less"
                            onClick={toggleWaybill}
                            style={{
                              display: `${btnDisplay}`,
                              color: '#C88F08',
                              paddingLeft: '50px',
                            }}
                          >
                            {intl.get(`mallf.saleStatus.model.saleStatus.expand`).d('展开')}
                          </a>
                        )}
                      </span>
                    </p>
                  ) : (
                    ''
                  )}
                </div>
                <div style={{ display: listDisplay ? 'inline-block' : 'none' }}>
                  {ecAfterSaleWaybillList &&
                    ecAfterSaleWaybillList.map(item => (
                      <div className="sale-table-body sale-table-waybill">
                        <span className="sale-table-data">
                          {intl
                            .get(`mallf.saleStatus.view.saleStatus.logisticsCompany`)
                            .d('物流公司')}
                          ：{item.logisticsCompanyName}，
                          {/* {intl.get(`mallf.saleStatus.view.saleStatus.freight`).d('运费')}：
                          {item.freightMoney} */}
                          {/* {intl.get(`mallf.saleStatus.view.saleStatus.yuan`).d('元')}， */}
                          {intl.get(`mallf.saleStatus.view.saleStatus.shipmentNum`).d('物流单号')}：
                          {item.logisticsNum}，
                          {intl.get(`mallf.saleStatus.view.saleStatus.deliveryTime`).d('发货时间')}
                          ：{item.deliverTime}
                        </span>
                      </div>
                    ))}
                </div>
              </Fragment>
            )}
            <div className="sale-table-body">
              <span className="label">
                {intl.get(`mallf.saleStatus.view.saleStatus.problemDesc`).d('问题描述')}：
              </span>
              <span className="sale-table-data">
                {afterSaleItemList && afterSaleItemList[0]?.problemDesc}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default Content;
