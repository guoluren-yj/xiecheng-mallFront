import React, { useEffect } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import qs from 'qs';
import { Steps, Modal, Breadcrumb } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { convertImg, getUserConfigInfo } from 'utils/utils';
// import { HmallOptions } from 'utils/options';
import {
  fetchSaleProgress,
  submitWayBill,
  fetchCancelAfterSale,
  fetchSureMessage,
  sentAfterSaleService,
} from 'services/saleDetailService';
import LogisticsDrawer from 'components/LogisticsDrawer';
import Image from 'components/Image';
import Link from 'components/Link';
import Loading from 'components/loading';
import useState from '@/hooks/useState';
import Tags from 'components/Tag';

// import Content from './Content';
import { afterSaleApplication } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import ServiceInfo from './ServiceInfo';
import ProcessInfo from './ProcessInfo';
import WayBillModal from './WayBillForm';
import ReasonModal from '@/routes/SaleDetail/ReasonModal';
import style from './index.less';

const { confirm } = Modal;
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
    reasonVisible: false,
  });

  const { detail, loading, submitLoading, modalVisible, wayBillData, reasonVisible } = state;
  const {
    afterSaleStatusList = [],
    platformCode,
    poSubNum,
    afterSaleItemList = [],
    poSubHeaderId,
    // afterSaleStatus,
    // practicalPickWareType,
    // pickWareType,
    // ecAfterSaleWaybillList = [],
  } = detail;
  const logisticsProps = { poSubNum, ecPlatformCode: platformCode, poSubHeaderId };
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
  const handleSubmit = (params) => {
    setState({ submitLoading: true });
    submitWayBill({ ...params, afterSaleId: afterSaleItemList[0].afterSaleId, logisticsType: 0 })
      .then((res) => {
        if (res) fetchInfo();
      })
      .finally(() => {
        setState({ submitLoading: false, modalVisible: false });
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const modalProps = {
    wayBillData,
    modalVisible,
    submitLoading,
    onOk: handleSubmit,
    onCancel: () => setState({ modalVisible: false }),
  };
  const reasonProps = {
    reasonVisible,
    onOk: (param) => cancelAfterSaleService(afterSaleId, param),
    onCancel: () => setState({ reasonVisible: false }),
  };

  /**
   * 取消售后
   */
  const cancelAfterSale = (afterId) => {
    if (detail.sourceCode !== 'CATA') {
      setState({
        reasonVisible: true,
      });
      return false;
    }
    confirm({
      title: intl.get(`mallf.saleStatus.view.cancelApplication`).d('取消申请'),
      content: `${intl.get(`mallf.saleStatus.view.sure.cancelApplication`).d('确认取消该申请')}?`,
      onOk() {
        cancelAfterSaleService(afterId);
      },
      onCancel() {},
    });
  };

  const cancelAfterSaleService = (afterId, param) => {
    const params =
      detail.sourceCode !== 'CATA'
        ? {
            afterSaleId: afterId,
            ...param,
          }
        : { afterSaleId };
    fetchCancelAfterSale(params)
      .then((res) => {
        if (res) fetchInfo();
      })
      .finally(() => {
        setState({
          reasonVisible: false,
        });
      });
  };

  /**
   * 确认售后完成
   */
  const handleSureMessage = (afterId) => {
    setState({ loading: true });
    fetchSureMessage(afterId)
      .then((res) => {
        if (res) fetchInfo();
      })
      .catch(() => {
        setState({ loading: false });
      });
  };

  /**
   * 商品发出
   */
  const sentAfterSale = (item = {}) => {
    const params = {
      afterSaleId: item.afterSaleId,
      afterSaleStatus: 'WAIT_PROCESS',
    };
    confirm({
      title: intl.get(`mallf.saleStatus.view.goods.sent`).d('商品发出'),
      content: `${intl.get(`mallf.saleStatus.view.isGoods.sent`).d('是否已发出商品')}?`,
      onOk() {
        sentAfterSaleService(params).then((res) => {
          if (res) fetchInfo();
        });
      },
      onCancel() {},
    });
  };

  const currentStep = afterSaleStatusList.map((step) => step.flag).indexOf(1);

  return (
    <div className={style['sale-status-container']}>
      <Breadcrumb className="order-detail-breadcrumb" separator=">">
        <Breadcrumb.Item href={getUserConfigInfo().mallType === 'sigl' ? '/sigl' : '/'}>
          {intl.get('mallf.saleStatus.view.homePage').d('首页')}
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/my-mall/sale-record">
          {intl.get(`mallf.saleStatus.view.afterSalesInformation`).d('售后信息')}
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {intl.get(`mallf.saleStatus.view.saleStatus.afterSalesDetails`).d('售后详情')}
        </Breadcrumb.Item>
      </Breadcrumb>
      {loading ? (
        <Loading />
      ) : (
        <div className="after-sale-body">
          {afterSaleStatusList.length > 0 && (
            <Steps
              className="after-sale-steps"
              status={afterSaleStatusList[currentStep]?.failed === 1 ? 'error' : 'process'}
              current={
                afterSaleStatusList[currentStep]?.failed === 1 ? currentStep : currentStep + 1
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
                <PermissionWrapper permissionList={[afterSaleApplication]}>
                  <div className="sale-after-handle">
                    {['APPROVING', 'WAIT_SENT', 'INTERNAL_APPROVING'].includes(
                      detail?.afterSaleStatus
                    ) &&
                      detail?.isCanceAfsEnabled && (
                        <Button onClick={() => cancelAfterSale(detail.afterSaleId)}>
                          {intl.get('mallf.saleStatus.view.cancel.application').d('取消申请')}
                        </Button>
                      )}
                    {detail?.afterSaleStatus === 'WAIT_SENT' && (
                      <Button onClick={() => sentAfterSale(detail)}>
                        {intl.get(`mallf.saleStatus.view.goods.sent`).d('商品发出')}
                      </Button>
                    )}
                    {detail?.afterSaleStatus === 'WAIT_CONFIRM' && (
                      <div className="logistics-info">
                        <Button onClick={() => handleSureMessage(detail.afterSaleId)}>
                          {intl.get('mallf.saleStatus.view.sure.complete').d('确认完成')}
                        </Button>
                        {detail?.afsType === '2' && detail?.platformCode !== 'CATA' && (
                          <LogisticsDrawer {...logisticsProps}>
                            <Button>
                              {intl.get('mallf.saleStatus.view.logistics.info').d('物流信息')}
                            </Button>
                          </LogisticsDrawer>
                        )}
                      </div>
                    )}
                    {detail?.afterSaleStatus === 'WAIT_PROCESS' &&
                      isEmpty(detail?.afterSaleWaybillList) && (
                        <Button
                          onClick={() =>
                            setState({
                              modalVisible: true,
                              wayBillData: detail.afterSaleWaybillList,
                            })
                          }
                        >
                          {intl.get('mallf.saleStatus.model.submitWaybill').d('提交运单')}
                        </Button>
                      )}
                    {!isEmpty(detail?.afterSaleWaybillList?.find((n) => n.logisticsType === 1)) && (
                      <Button
                        onClick={() =>
                          setState({
                            modalVisible: true,
                            wayBillData:
                              detail.afterSaleWaybillList &&
                              detail.afterSaleWaybillList.find((n) => n.logisticsType === 1),
                          })
                        }
                      >
                        {intl.get('mallf.saleStatus.model.check.back.yundan').d('查看商家返件运单')}
                      </Button>
                    )}
                  </div>
                </PermissionWrapper>
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
      {modalVisible && <WayBillModal {...modalProps} />}
      {reasonVisible && <ReasonModal {...reasonProps} />}
    </div>
  );
}

export default formatterCollections({ code: ['mallf.saleStatus', 'mallf.saleAppli'] })(
  SaleProgress
);
