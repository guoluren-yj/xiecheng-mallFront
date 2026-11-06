import React, { useEffect } from 'react';
import qs from 'qs';
import { Steps } from 'choerodon-ui';
// import { Button } from 'choerodon-ui/pro';
// import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { convertImg } from 'utils/utils';
// import { HmallOptions } from 'utils/options';
import {
  fetchSaleProgress,
  // submitWayBill,
  // fetchCancelAfterSale,
  // fetchSureMessage,
  // sentAfterSaleService,
} from 'services/saleDetailService';
import Image from 'components/Image';
import Link from 'components/Link';
import Loading from 'components/loading';
import useState from '@/hooks/useState';
import Tags from 'components/Tag';

// import Content from './Content';
import ServiceInfo from './ServiceInfo';
import ProcessInfo from './ProcessInfo';
// import WayBillModal from './WayBillForm';
import style from './index.less';

// const { confirm } = Modal;
function SaleProgress(props) {
  // const { ecServiceList } = useSelector(state => state.Global);
  const { afterSaleId } = qs.parse(props.history.location.search.substr(1));
  const [state, setState] = useState({
    detail: {},
    loading: false,
    confirmLoading: false,
    submitLoading: false,
    modalVisible: false,
    wayBillData: {},
  });

  const { detail, loading } = state;
  const { afterSaleStatusList = [] } = detail;

  const {
    afterSaleItemList = [],
    // afterSaleStatus,
    // practicalPickWareType,
    // pickWareType,
    // ecAfterSaleWaybillList = [],
  } = detail;

  // 初始化查询售后信息
  const fetchInfo = () => {
    setState({ loading: true });
    fetchSaleProgress({ afterSaleId })
      .then((res) => {
        setState({ detail: res || {} });
      })
      .finally(() => {
        setState({ loading: false });
      });
  };

  // 提交运单
  // const handleSubmit = params => {
  //   setState({ submitLoading: true });
  //   submitWayBill({ ...params, afterSaleId: afterSaleItemList[0].afterSaleId })
  //     .then(res => {
  //       if (res) fetchInfo();
  //     })
  //     .finally(() => {
  //       setState({ submitLoading: false, modalVisible: false });
  //     });
  // };

  useEffect(() => {
    fetchInfo();
  }, []);

  // const modalProps = {
  //   wayBillData,
  //   modalVisible,
  //   submitLoading,
  //   onOk: handleSubmit,
  //   onCancel: () => setState({ modalVisible: false }),
  // };

  /**
   * 取消售后
   */
  // const cancelAfterSale = afterId => {
  //   confirm({
  //     title: intl.get(`mallf.saleStatus.view.cancelApplication`).d('取消申请'),
  //     content: `${intl.get(`mallf.saleStatus.view.sure.cancelApplication`).d('确认取消该申请')}?`,
  //     onOk() {
  //       fetchCancelAfterSale(afterId).then(res => {
  //         if (res) fetchInfo();
  //       });
  //     },
  //     onCancel() {},
  //   });
  // };

  /**
   * 确认售后完成
   */
  // const handleSureMessage = afterId => {
  //   fetchSureMessage(afterId).then(res => {
  //     if (res) fetchInfo();
  //   });
  // };

  /**
   * 商品发出
   */
  // const sentAfterSale = (item = {}) => {
  //   const params = {
  //     afterSaleId: item.afterSaleId,
  //     afterSaleStatus: 'WAIT_PROCESS',
  //   };
  //   confirm({
  //     title: intl.get(`mallf.common.view.goods.sent`).d('商品发出'),
  //     content: `${intl.get(`mallf.common.view.isGoods.sent`).d('是否已发出商品')}?`,
  //     onOk() {
  //       sentAfterSaleService(params).then(res => {
  //         if (res) fetchInfo();
  //       });
  //     },
  //     onCancel() {},
  //   });
  // };

  const currentStep = afterSaleStatusList.map((step) => step.flag).indexOf(1);

  return (
    <div className={style['sale-status-container']} style={{ marginTop: 50 }}>
      {loading ? (
        <Loading />
      ) : (
        <div className="after-sale-body">
          {afterSaleStatusList.length > 0 && (
            <Steps
              className="after-sale-steps"
              status={afterSaleStatusList[currentStep]?.failed === 1 ? 'error' : 'process'}
              current={
                currentStep === 4 && afterSaleStatusList[currentStep]?.failed !== 1
                  ? 5
                  : currentStep + 1
              }
            >
              {afterSaleStatusList.map((step) => (
                <Steps.Step title={step.statusName} />
              ))}
            </Steps>
          )}
          <div className="goods-info-list">
            <div className="goods-info-content">
              <div className="goods-title">
                {intl
                  .get(`mallf.saleStatus.view.saleStatus.afterSalesApplicationForm`)
                  .d('售后申请单')}
                ：{detail.afterSaleNum}
              </div>
              <div className="goods-info-box">
                <Link
                  to={`product-detail?productId=${afterSaleItemList[0]?.productId}&sourceFrom=${detail.platformCode}`}
                >
                  <Image
                    value={convertImg(
                      afterSaleItemList[0]?.productImagePath,
                      1,
                      detail.platformCode
                    )}
                    width={70}
                    height={70}
                  />
                </Link>
                <div className="goods-details">
                  <Link
                    className="goods-detail"
                    to={`product-detail?productId=${afterSaleItemList[0]?.productId}&sourceFrom=${detail.platformCode}`}
                  >
                    <p>{afterSaleItemList[0]?.productName}</p>
                  </Link>
                  <p className="goods-code">
                    <span>
                      {intl.get('mallf.saleStatus.view.productCode').d('商品编码')}：
                      {afterSaleItemList[0]?.productNum}
                    </span>
                    <span className="after-sale-quantity">
                      {intl
                        .get(`mallf.saleStatus.view.saleStatus.afterSalesQuantity`)
                        .d('售后数量')}
                      ：{afterSaleItemList[0]?.applyQuantity}
                    </span>
                    <Tags style={{ display: 'inline' }} type="info">
                      {detail?.afterSaleStatusName}
                    </Tags>
                  </p>
                </div>
                {/* <div className="sale-after-handle">
                  {['APPROVING', 'WAIT_SENT'].includes(detail?.afterSaleStatus) &&
                    detail?.platformCode === 'CATA' && (
                      <Button onClick={() => cancelAfterSale(detail.afterSaleId)}>
                        {intl.get('mallf.common.view.cancel.application').d('取消申请')}
                      </Button>
                    )}
                  {detail?.afterSaleStatus === 'WAIT_SENT' && (
                    <Button onClick={() => sentAfterSale(detail)}>
                      {intl.get(`mallf.common.view.goods.sent`).d('商品发出')}
                    </Button>
                  )}
                  {detail?.afterSaleStatus === 'WAIT_CONFIRM' && (
                    <Button onClick={() => handleSureMessage(detail.afterSaleId)}>
                      {intl.get('mallf.common.view.sure.complete').d('确认完成')}
                    </Button>
                  )}
                  {detail?.afterSaleStatus === 'WAIT_PROCESS' &&
                    isEmpty(detail?.afterSaleWaybillList) && (
                      <Button
                        onClick={() =>
                          setState({ modalVisible: true, wayBillData: detail.afterSaleWaybillList })
                        }
                      >
                        {intl.get('mallf.common.model.submitWaybill').d('提交运单')}
                      </Button>
                    )}
                  {detail?.afterSaleStatus === 'WAIT_PROCESS' &&
                    !isEmpty(detail?.afterSaleWaybillList) && (
                      <Button
                        onClick={() =>
                          setState({
                            modalVisible: true,
                            wayBillData:
                              detail.afterSaleWaybillList && detail.afterSaleWaybillList[0],
                          })
                        }
                      >
                        {intl.get('mallf.common.model.fetchWaybill').d('查看运单')}
                      </Button>
                    )}
                </div> */}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', border: '1px solid #eaeaea' }}>
            <ServiceInfo detail={detail} />
            <ProcessInfo detail={detail} />
          </div>
          {/* {detail && <Content detail={detail} ecServiceList={ecServiceList} />} */}
        </div>
      )}
      {/* {modalVisible && <WayBillModal {...modalProps} />} */}
    </div>
  );
}

export default formatterCollections({ code: ['mallf.saleStatus', 'mallf.saleAppli'] })(
  SaleProgress
);
