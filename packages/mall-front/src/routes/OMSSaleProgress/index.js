import React, { useEffect, useMemo } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import qs from 'qs';
import { isEmpty } from 'lodash';
import { Steps } from 'choerodon-ui';
import { Button, Tooltip } from 'choerodon-ui/pro';

import BreadCrumbs from 'components/BreadCrumbs';
import intl from 'utils/intl';
import { getUserConfigInfo, handleCopy, getHomePath } from 'utils/utils';
import { hasDoubleUomFlag } from 'utils/configUtils';
import {
  fetchomsSaleProgress,
  submitomsWayBill,
  fetchomsCancelAfterSale,
  fetchomsSureMessage,
  sentAfterSaleomsService,
} from 'services/saleDetailService';
import Image from 'components/Image';
import Link from 'components/Link';
import Loading from 'components/loading';
import { getMamanualRequestImg } from 'components/MamanualRequestImg';
import useState from '@/hooks/useState';
// import Tags from 'components/Tag';
import { TagRender } from 'utils/renderer';
import CuxWrapper from '@/cuxTools/CuxWrapper';
import CuxFn from '@/cuxTools/cuxFn';
import GiftList from '@/routes/OMSSaleAfterApplication/GiftList';
import { openComfirmModal } from 'utils/modals';
import { afterSaleApplication } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';

import ServiceInfo from './ServiceInfo';
import ProcessInfo from './ProcessInfo';
// import WayBillModal from '@/routes/OMSSaleDetail//WayBillForm';
import openWayBillModal from '../MyMall/MySaleRecord/openWayBillModal';
import ReasonModal from '@/routes/OMSSaleDetail/ReasonModal';
import style from './index.less';
// const { confirm } = Modal;

function SaleProgress(props) {
  // const { ecServiceList } = useSelector(state => state.Global);
  const { afterSaleId, afterSaleCode } = qs.parse(props.history.location.search.substr(1));
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
  const { afterSaleStatusList = [], afterSaleEntryList, orderId, cecFromCode } = detail;

  const { mallType } = getUserConfigInfo();

  // 商品发出 查看运单 提交运单 modal
  const handleCommoditySendsOut = (otherProps) => {
    const modalProps = {
      cecFromCode,
      orderId,
      orderEntryId: afterSaleEntryList?.[0].orderEntryId,
      wayBillData,
      modalVisible,
      submitLoading,
      onOk: handleSubmit,
      ...otherProps,
    };
    openWayBillModal(modalProps);
  };
  const saleNumMessage = useMemo(() => {
    const { quantityMeaning, packageQuantityMeaning } = state.detail || {};
    const { uomId, customUomId, customQuantity, uomName, customUomName } =
      afterSaleEntryList?.[0] || {};
    const flag = hasDoubleUomFlag({ uomId, customUomId, customQuantity });
    return flag
      ? `${packageQuantityMeaning}${customUomName}${quantityMeaning}${uomName}`
      : `${quantityMeaning}${uomName}`;
  }, [state.detail]);

  // 初始化查询售后信息
  const fetchInfo = () => {
    setState({ loading: true });
    fetchomsSaleProgress({ afterSaleId, afterSaleCode })
      .then((res) => {
        setState({ detail: res || {} });
      })
      .finally(() => {
        setState({ loading: false });
      });
  };

  // 提交运单
  // const handleSubmit = (params) => {
  //   setState({ submitLoading: true });
  //   submitomsWayBill({ ...params, afterSaleId: detail.afterSaleId })
  //     .then((res) => {
  //       if (res) fetchInfo();
  //     })
  //     .finally(() => {
  //       setState({ submitLoading: false, modalVisible: false });
  //     });
  // };

  const handleSubmit = (params) => {
    const newParams = {
      ...params,
      afterSaleId: detail.afterSaleId,
    };
    submitomsWayBill(newParams).then((res) => {
      if (res) {
        fetchInfo();
      } else {
        return false;
      }
    });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  // const modalProps = {
  //   cecFromCode,
  //   orderEntryId: afterSaleEntryList?.[0].orderEntryId,
  //   orderId,
  //   wayBillData,
  //   modalVisible,
  //   submitLoading,
  //   onOk: handleSubmit,
  //   onCancel: () => setState({ modalVisible: false }),
  // };
  const reasonProps = {
    reasonVisible,
    afterSaleCode,
    onOk: (param) => omsCancelAfterSale(afterSaleId, param),
    onCancel: () => setState({ reasonVisible: false }),
  };

  /**
   * 取消售后
   */
  const cancelAfterSale = (afterId) => {
    if (detail.orderTypeCode === 'EC') {
      setState({
        reasonVisible: true,
      });
      return false;
    }
    openComfirmModal({
      title: intl.get(`mallf.saleStatus.view.cancelApplication`).d('取消申请'),
      border: false,
      children: `${intl.get(`mallf.saleStatus.view.sure.cancelApplication`).d('确认取消该申请')}?`,
      onOk: () => {
        omsCancelAfterSale(afterId);
      },
    });
    // confirm({
    //   title: intl.get(`mallf.saleStatus.view.cancelApplication`).d('取消申请'),
    //   content: `${intl.get(`mallf.saleStatus.view.sure.cancelApplication`).d('确认取消该申请')}?`,
    //   onOk() {
    //     omsCancelAfterSale(afterId);
    //   },
    //   onCancel() {},
    // });
  };

  const omsCancelAfterSale = (afterId, param) => {
    const parmas =
      detail.orderTypeCode === 'EC'
        ? {
            afterSaleId: afterId,
            ...param,
          }
        : { afterSaleId };
    fetchomsCancelAfterSale(parmas)
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
    fetchomsSureMessage({ afterSaleId: afterId, orderId: detail.orderId }).then((res) => {
      if (res) fetchInfo();
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
    const children = (
      <CuxWrapper path="MySaleRecord/OMSSale/sentAfterSale/children" value={{ params }}>
        {intl.get(`mallf.saleStatus.view.isGoods.sent`).d('是否已发出商品')}?
      </CuxWrapper>
    );
    openComfirmModal({
      title: intl.get(`mallf.saleStatus.view.goods.sent`).d('商品发出'),
      border: false,
      children,
      onOk: async () => {
        const flag = await CuxFn({
          name: 'MySaleRecord-fn-sentAfterSaleOnOk',
          value: params,
        })();
        if (!flag) return false;
        sentAfterSaleomsService(params).then((res) => {
          if (res) fetchInfo();
        });
      },
    });
    // confirm({
    //   title: intl.get(`mallf.saleStatus.view.goods.sent`).d('商品发出'),
    //   content: `${intl.get(`mallf.saleStatus.view.isGoods.sent`).d('是否已发出商品')}?`,
    //   onOk() {
    //     sentAfterSaleomsService(params).then((res) => {
    //       if (res) fetchInfo();
    //     });
    //   },
    //   onCancel() {},
    // });
  };

  const currentStep = afterSaleStatusList.map((step) => step.flag).indexOf(1);

  const status = (s) => {
    let afterSaleType;
    switch (s) {
      case 'CANCELED':
        afterSaleType = 'failure';
        break;
      case 'FINISH':
        afterSaleType = 'success';
        break;
      case 'REJECT':
      case 'INTERNAL_REJECT':
        afterSaleType = 'danger';
        break;
      case 'PRODUCT_REJECT':
        afterSaleType = 'danger';
        break;
      default:
        afterSaleType = 'warning';
        break;
    }
    return afterSaleType;
  };
  return (
    <div className={style['sale-status-container']}>
      <BreadCrumbs
        value={{
          pageTitle: {
            path: `${getHomePath()}my-mall/sale-record`,
            name: intl.get(`mallf.common.view.afterSalesInformation`).d('售后信息'),
          },
          childTitle1: intl.get(`mallf.saleStatus.view.saleStatus.afterSalesDetails`).d('售后详情'),
        }}
      />
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
                <Steps.Step title={step.statusName} className="after-sale-steps-step" />
              ))}
            </Steps>
          )}
          <div className="goods-info-list">
            <div className="goods-info-content">
              <div className="goods-title">
                {intl
                  .get(`mallf.saleStatus.view.saleStatus.afterSalesApplicationForm`)
                  .d('售后申请单')}
                ：{detail.afterSaleCode}
              </div>
              <div className="goods-info-box">
                <div r-if={detail.cecFromCode === 'MANUAL'}>
                  {getMamanualRequestImg({ width: '70px', height: '70px' })}
                </div>
                <Link
                  r-if={detail.cecFromCode !== 'MANUAL'}
                  to={`${mallType === 'sigl' ? '/sigl' : ''}/product-detail?productId=${
                    detail?.afterSaleEntryList?.[0]?.skuId
                  }&sourceFrom=${detail.cecFromCode}`}
                >
                  <Image
                    value={detail?.afterSaleEntryList?.[0]?.productImagePath}
                    width={70}
                    height={70}
                  />
                </Link>
                <div className="goods-details">
                  <Link
                    disabled={detail.cecFromCode === 'MANUAL'}
                    className="goods-detail"
                    to={`${mallType === 'sigl' ? '/sigl' : ''}/product-detail?productId=${
                      detail?.afterSaleEntryList?.[0]?.skuId
                    }&sourceFrom=${detail.cecFromCode}`}
                  >
                    <p>{detail?.afterSaleEntryList?.[0]?.skuName}</p>
                  </Link>
                  <p className="goods-code">
                    <span>
                      {intl.get('mallf.saleStatus.view.productCode').d('商品编码')}：
                      {detail?.afterSaleEntryList?.[0]?.skuCode}
                      <Button
                        r-if={detail.cecFromCode !== 'MANUAL'}
                        funcType="flat"
                        color="primary"
                        icon="content_copy"
                        className="right-btn text-overflow right-btn-copy"
                        size="small"
                        onClick={() => handleCopy(detail?.afterSaleEntryList?.[0]?.skuCode)}
                      />
                    </span>
                    <span className="after-sale-quantity">
                      {intl
                        .get(`mallf.saleStatus.view.saleStatus.afterSalesQuantity`)
                        .d('售后数量')}
                      ：{saleNumMessage}
                    </span>
                    {TagRender({
                      text: detail?.afterSaleStatusMeaning,
                      type: status(detail.afterSaleStatus),
                      style: { maxWidth: '80px', marginRight: 0 },
                      icon: !isEmpty(detail?.afterSaleStatusMeaning) && ( // 申请报错改造为后端控制 - processErrorInfos
                        <Tooltip title={detail?.afterSaleStatusMeaning} placement="top" />
                      ),
                    })}

                    {/* <Tags style={{ display: 'inline' }} type={status(detail.afterSaleStatus)}>
                      {detail?.afterSaleStatusMeaning}
                    </Tags> */}
                  </p>
                </div>
                <PermissionWrapper permissionList={[afterSaleApplication]}>
                  <div className="sale-after-handle">
                    {detail?.canCancelFlag === 1 && (
                      <Button onClick={() => cancelAfterSale(detail.afterSaleId)}>
                        {intl.get('mallf.saleStatus.view.cancellation.request').d('取消申请')}
                      </Button>
                    )}
                    {detail?.afterSaleStatus === 'WAIT_SENT' && (
                      <>
                        {['CATA', 'MANUAL'].includes(detail.cecFromCode) ||
                        detail.pickWareType === 'PICK_UP' ? (
                          <Button onClick={() => sentAfterSale(detail)}>
                            {intl.get(`mallf.saleStatus.view.goods.sent`).d('商品发出')}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setState({
                                // modalVisible: true,
                                wayBillData: detail.afterSaleWaybillList,
                              });
                              handleCommoditySendsOut({
                                wayBillData: detail.afterSaleWaybillList,
                              });
                            }}
                          >
                            {intl.get(`mallf.saleStatus.view.goods.sent`).d('商品发出')}
                          </Button>
                        )}
                      </>
                    )}
                    {detail?.afterSaleStatus === 'WAIT_CONFIRM' && (
                      <Button onClick={() => handleSureMessage(detail.afterSaleId)}>
                        {intl.get('mallf.saleStatus.view.sure.complete').d('确认完成')}
                      </Button>
                    )}
                    {detail?.afterSaleStatus === 'WAIT_PROCESS' &&
                      !detail?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RETURN') && (
                        <>
                          {(['CATA', 'MANUAL'].includes(detail.cecFromCode) ||
                            detail.pickWareType === 'PICK_UP') && (
                            <Button
                              onClick={() => {
                                setState({
                                  // modalVisible: true,
                                  wayBillData: detail.afterSaleWaybillList,
                                });
                                handleCommoditySendsOut({
                                  wayBillData: detail.afterSaleWaybillList,
                                });
                              }}
                            >
                              {intl.get('mallf.saleStatus.model.submitWaybill').d('提交运单')}
                            </Button>
                          )}
                        </>
                      )}
                    {/* {detail?.afterSaleStatus === 'WAIT_PROCESS' &&
                    detail?.afterSaleWaybillList?.some(p => p.logisticsType === 'RETURN') && (
                      <Button
                        onClick={() =>
                          setState({
                            modalVisible: true,
                            wayBillData: detail?.afterSaleWaybillList?.some(
                              p => p.logisticsType === 'RETURN'
                            ),
                          })
                        }
                      >
                        {intl.get('mallf.common.model.fetchWaybill').d('查看运单')}
                      </Button>
                    )} */}
                    {detail?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RENEW') && (
                      <Button
                        onClick={() => {
                          setState({
                            // modalVisible: true,
                            wayBillData: detail?.afterSaleWaybillList?.find(
                              (p) => p.logisticsType === 'RENEW'
                            ),
                          });
                          handleCommoditySendsOut({
                            wayBillData: detail?.afterSaleWaybillList?.find(
                              (p) => p.logisticsType === 'RENEW'
                            ),
                          });
                        }}
                      >
                        {intl.get('mallf.saleStatus.model.check.back.yundan').d('查看商家返件运单')}
                      </Button>
                    )}
                  </div>
                </PermissionWrapper>
              </div>
              <GiftList
                giftList={afterSaleEntryList?.[0]?.afterSaleEntryExtras || []}
                style={{ marginLeft: 30, marginTop: -10, marginBottom: 10 }}
                productNameWidth={980}
                saleNumField="applyQuantity"
                saleNumDesc={intl.get('mallf.saleStatus.view.available.quantity').d('售后数量')}
              />
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
      {reasonVisible && <ReasonModal {...reasonProps} />}
    </div>
  );
}

export default formatterCollections({
  code: [
    'mallf.saleStatus',
    'mallf.saleAppli',
    'mallf.myOrder',
    'mallf.orderDetail',
    'mallf.mySaleAfter',
  ],
})(SaleProgress);
