import React, { Fragment } from 'react';
import qs from 'qs';
import formatterCollections from 'utils/intl/formatterCollections';
// import { Modal } from 'choerodon-ui';
import { Button, Table, DataSet } from 'choerodon-ui/pro';

import BreadCrumbs from 'components/BreadCrumbs';
import {
  fetchOMSGoodsInfo,
  fetchomsCancelAfterSale,
  // fetchOmsSaleNum,
  fetchomsSureMessage,
  sentAfterSaleomsService,
  submitomsWayBill,
  fetchOrderId,
} from 'services/saleDetailService';
import intl from 'utils/intl';
import * as Hmall from 'utils/utils';
import { getAfterSaleNum } from 'utils/configUtils';
import Image from 'components/Image';
import Loading from 'components/loading';
import Link from 'components/Link';
import Tags from 'components/Tag';
import { getMamanualRequestImg } from 'components/MamanualRequestImg';
// import WayBillModal from './WayBillForm';
import { openComfirmModal } from 'utils/modals';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import { compose } from 'lodash';
import OverflowTip from 'components/OverflowTip';
import CuxWrapper from '@/cuxTools/CuxWrapper';
import CuxFn from '@/cuxTools/cuxFn';

import openWayBillModal from '../MyMall/MySaleRecord/openWayBillModal';
import ReasonModal from './ReasonModal';
import styles from './index.less';
import { tableDs } from './ds';
import { CopyButton } from '@/utils/renderer';

const customizeCode = 'MALL.SALEAFTER.APPLICATION.AFTERSALE.RECORDS';

// const { confirm } = Modal;
class SaleDetail extends React.Component {
  constructor(props) {
    super(props);
    // const { companyId, organizationId } = Hmall.getUserConfigInfo();
    this.state = {
      // companyId, // 公司id
      // organizationId, // 租户id
      goodsData: [],
      // numData: [],
      // jdOrderId: qs.parse(this.props.location.search.substr(1)).poNum, // 订单id
      // wareIds: [], // 商品Id
      loading: false,
      listLoading: false,
      // wareNum: '',
      // customerExpect: [], // 可售后类型
      // pickupWareType: [],
      // spinning: false,
      modalVisible: false,
      submitLoading: false,
      afterSaleId: '',
      wayBillData: {},
      reasonVisible: false,
      afterSaleCode: '',
    };
  }

  tableDS = new DataSet(tableDs());

  componentDidMount() {
    window.scrollTo(0, 0);
    const { orderId, ecpoNum } = qs.parse(this.props.location.search.substr(1));
    if (!orderId) {
      this.getOrderId(ecpoNum);
    } else {
      this.getGoodsInfo();
      this.querySaleAfterList();
      // this.fetchSaleGoodsNum();
    }
  }

  /**
   * 获取orderId
   */
  getOrderId = (orderCode) => {
    const queryData = qs.parse(this.props.location.search.substr(1));
    fetchOrderId(orderCode).then((res) => {
      queryData.orderId = res.orderId;
      this.props.history.push(`${this.props.location.pathname}?${qs.stringify(queryData)}`);
    });
  };

  /**
   * 取消售后
   */
  cancelAfterSale = (afterSaleId) => {
    const { goodsData } = this.state;
    this.setState({
      afterSaleId,
    });
    if (goodsData.orderTypeCode === 'EC') {
      this.setState({
        reasonVisible: true,
      });
      return false;
    }
    this.omsCancelAfterSale(afterSaleId);
  };

  // 取消售后接口
  omsCancelAfterSale = (afterSaleId, param) => {
    const { goodsData } = this.state;
    const parmas =
      goodsData.orderTypeCode === 'EC'
        ? {
            afterSaleId,
            ...param,
          }
        : { afterSaleId };
    this.setState({
      listLoading: true,
    });
    fetchomsCancelAfterSale(parmas)
      .then((res) => {
        if (res) {
          this.querySaleAfterList();
          this.getGoodsInfo();
        }
      })
      .finally(() => {
        this.setState({
          reasonVisible: false,
          listLoading: false,
        });
      });
  };

  /**
   * 确认售后完成
   */
  handleSureMessage = (afterSaleId) => {
    const { orderId } = qs.parse(this.props.location.search.substr(1));
    this.setState({
      listLoading: true,
    });
    fetchomsSureMessage({ afterSaleId, orderId })
      .then((res) => {
        if (res) this.querySaleAfterList(); // 请求售后列表
      })
      .finally(() => {
        this.setState({
          listLoading: false,
        });
      });
  };

  /**
   * 商品发出
   */
  sentAfterSale = (item = {}) => {
    const params = {
      ...item,
      afterSaleStatus: 'WAIT_PROCESS',
    };
    const children = (
      <CuxWrapper path="MySaleRecord/OMSSale/sentAfterSale/children" value={{ params }}>
        {intl.get(`mallf.orderDetail.view.isGoods.sent`).d('是否已发出商品')}?
      </CuxWrapper>
    );

    openComfirmModal({
      title: intl.get(`mallf.orderDetail.view.goods.sent`).d('商品发出'),
      border: false,
      children,
      onOk: async () => {
        const flag = await CuxFn({
          name: 'MySaleRecord-fn-sentAfterSaleOnOk',
          value: params,
        })();
        if (!flag) return false;
        sentAfterSaleomsService(params)
          .then((res) => {
            if (res) this.querySaleAfterList();
          })
          .finally(() => {
            this.setState({
              loading: false,
            });
          });
      },
    });
    // confirm({
    //   title: intl.get(`mallf.orderDetail.view.goods.sent`).d('商品发出'),
    //   content: `${intl.get(`mallf.orderDetail.view.isGoods.sent`).d('是否已发出商品')}?`,
    //   onOk: () => {
    //     this.setState({
    //       loading: true,
    //     });
    //     sentAfterSaleomsService(params)
    //       .then((res) => {
    //         if (res) this.querySaleAfterList();
    //       })
    //       .finally(() => {
    //         this.setState({
    //           loading: false,
    //         });
    //       });
    //   },
    //   onCancel() {},
    // });
  };

  /**
   * 获取商品信息
   */
  getGoodsInfo() {
    const { orderId, skuCode, consignmentCode, consignmentLineNum } = qs.parse(
      this.props.location.search.substr(1)
    );
    this.setState({
      loading: true,
    });
    fetchOMSGoodsInfo({ orderId, skuCode, consignmentCode, consignmentLineNum })
      .then((res) => {
        this.setState({
          goodsData: res,
        });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  // 图片地址处理
  HandleImgUrl(code, url) {
    return code === 'CATA' ? url : Hmall.convertImg(url, 1, code);
  }

  /**
   *根据订单查询售后列表
   */
  querySaleAfterList = (params = {}) => {
    const { orderId, consignmentCode, skuCode, consignmentLineNum = '' } = qs.parse(
      this.props.location.search.substr(1)
    ); // 订单行id,srm订单号,供应商
    const newParams = {
      ...params,
      orderId,
      consignmentCode,
      skuCode: skuCode === 'undefined' ? null : skuCode, // 防止其他地方跳转漏掉
      consignmentLineNum,
    };
    this.tableDS.setQueryParameter('params', newParams);
    this.tableDS.query();
  };

  /**
   * 服务类型
   */
  serviceType(type) {
    if (type === '1') {
      return intl.get('mallf.orderDetail.view.return').d('退货');
    } else if (type === '2') {
      return intl.get('mallf.orderDetail.view.exchange').d('换货');
    } else if (type === '3') {
      return intl.get('mallf.orderDetail.view.service').d('维修');
    }
  }

  // 填写运单
  handleSubmit = (params) => {
    const { afterSaleId } = this.state;
    const newParams = {
      ...params,
      afterSaleId,
    };
    submitomsWayBill(newParams).then((res) => {
      if (res) {
        this.querySaleAfterList();
        this.setState({ modalVisible: false });
      }
    });
  };

  handleCommoditySendsOut = (otherProps) => {
    const { modalVisible, submitLoading, wayBillData, cecFromCode } = this.state;
    const { orderId, orderEntryId } = qs.parse(this.props.location.search.substr(1));
    const modalProps = {
      cecFromCode,
      orderId,
      orderEntryId,
      wayBillData,
      modalVisible,
      submitLoading,
      onOk: this.handleSubmit,
      ...otherProps,
    };
    openWayBillModal(modalProps);
  };

  render() {
    const {
      // wareNum,
      loading,
      listLoading,
      goodsData = {},
      // numData=[],
      // customerExpect = [],
      // spinning,p
      reasonVisible,
      afterSaleId,
      afterSaleCode,
    } = this.state;
    const {
      orderTypeCode,
      saleNum, // 可售后数量
      salePackageNum, // 可售后基本数量
      uomId,
      uomName,
      customUomId,
      customUomName,
      customQuantity, // 双单位系数
    } = goodsData || {};
    const saleNumMessage = getAfterSaleNum({
      uomId,
      customUomId,
      customQuantity,
      salePackageNum,
      customUomName,
      saleNum,
      uomName,
    });
    const {
      ecpoNum: poNum,
      orderId,
      consignmentCode,
      skuCode,
      consignmentLineNum,
      orderEntryId,
    } = qs.parse(this.props.location.search.substr(1));
    // const modalProps = {
    //   cecFromCode,
    //   orderId,
    //   orderEntryId,
    //   wayBillData,
    //   modalVisible,
    //   submitLoading,
    //   onOk: this.handleSubmit,
    //   onCancel: () => this.setState({ modalVisible: false }),
    // };
    const reasonProps = {
      reasonVisible,
      afterSaleCode,
      onOk: (param) => this.omsCancelAfterSale(afterSaleId, param),
      onCancel: () => this.setState({ reasonVisible: false }),
    };
    const { mallType } = Hmall.getUserConfigInfo();
    const columns = [
      {
        name: 'afterSaleCode',
        width: 170,
        renderer: ({ record }) => {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link
                to={`${mallType === 'sigl' ? '/sigl' : ''}/oms-sale-status?afterSaleId=${record.get(
                  'afterSaleId'
                )}&afterSaleCode=${record.get('afterSaleCode')}`}
              >
                {record.get('afterSaleCode')}
              </Link>
              <CopyButton
                num={record.get('afterSaleCode')}
                label={intl.get('mallf.saleDetail.view.saleDetail.afterSalesNum').d('售后申请单号')}
              />
            </div>
          );
        },
      },
      {
        name: 'quantity',
        width: 120,
      },
      {
        name: 'afterSaleTypeMeaning',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 180,
      },
      {
        name: 'afterSaleStatusMeaning',
        width: 130,
        renderer: ({ record }) => {
          let afterSaleStatus;
          switch (record.get('afterSaleStatus')) {
            case 'CANCELED':
              afterSaleStatus = 'cancel';
              break;
            case 'FINISH':
              afterSaleStatus = 'success';
              break;
            case 'REJECT':
            case 'INTERNAL_REJECT':
            case 'PRODUCT_REJECT':
              afterSaleStatus = 'failed';
              break;
            default:
              afterSaleStatus = 'info';
              break;
          }
          return (
            <Tags style={{ display: 'inline-block', marginTop: 5 }} type={afterSaleStatus}>
              {record.get('afterSaleStatusMeaning')}
            </Tags>
          );
        },
      },
      {
        name: 'remark',
        width: 210,
      },
      {
        name: 'operate',
        width: 180,
        lock: 'right',
        tooltip: 'none',
        renderer: ({ record }) => {
          const item = record.toData();
          return (
            <span className="sale-list-operation">
              <Link
                to={`${mallType === 'sigl' ? '/sigl' : ''}/oms-sale-status?afterSaleId=${
                  item.afterSaleId
                }&afterSaleCode=${item.afterSaleCode}`}
                className="operation-btn"
              >
                <OverflowTip>{intl.get('hzero.common.button.details').d('查看详情')}</OverflowTip>
              </Link>
              {item.afterSaleStatus === 'WAIT_SENT' && (
                <>
                  {['CATA', 'MANUAL'].includes(item.cecFromCode) ||
                  item.pickWareType === 'PICK_UP' ? (
                    <div className="operation-btn" onClick={() => this.sentAfterSale(item)}>
                      <OverflowTip>
                        {intl.get('mallf.orderDetail.view.product.send').d('商品发出')}
                      </OverflowTip>
                    </div>
                  ) : (
                    <div
                      className="operation-btn"
                      onClick={() => {
                        this.setState(
                          {
                            modalVisible: true,
                            afterSaleId: item.afterSaleId,
                            wayBillData: {},
                          },
                          () => {
                            this.handleCommoditySendsOut();
                          }
                        );
                      }}
                    >
                      <OverflowTip>
                        {intl.get('mallf.orderDetail.view.product.send').d('商品发出')}
                      </OverflowTip>
                    </div>
                  )}
                </>
              )}
              {item.canCancelFlag === 1 && (
                <div
                  className="operation-btn"
                  onClick={() => {
                    this.cancelAfterSale(item.afterSaleId);
                    this.setState({ afterSaleCode: item.afterSaleCode });
                  }}
                >
                  <OverflowTip>
                    {' '}
                    {intl.get('mallf.common.view.cancel.application').d('取消申请')}
                  </OverflowTip>
                </div>
              )}
              {item.afterSaleStatus === 'WAIT_CONFIRM' && (
                <div
                  className="operation-btn"
                  onClick={() => this.handleSureMessage(item.afterSaleId)}
                >
                  <OverflowTip>
                    {intl.get('mallf.orderDetail.view.sure.complete').d('确认完成')}
                  </OverflowTip>
                </div>
              )}
              {item.afterSaleStatus === 'WAIT_PROCESS' &&
                !item?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RETURN') && (
                  <>
                    {(['CATA', 'MANUAL'].includes(item.cecFromCode) ||
                      item.pickWareType === 'PICK_UP') && (
                      <div
                        className="operation-btn"
                        onClick={() => {
                          this.setState(
                            {
                              modalVisible: true,
                              cecFromCode: item?.cecFromCode,
                              wayBillData: {},
                              afterSaleId: item.afterSaleId,
                            },
                            () => {
                              this.handleCommoditySendsOut();
                            }
                          );
                        }}
                      >
                        <OverflowTip>
                          {intl.get('mallf.orderDetail.model.submitWaybill').d('提交运单')}
                        </OverflowTip>
                      </div>
                    )}
                  </>
                )}
              {item.afterSaleStatus === 'WAIT_PROCESS' &&
                item?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RETURN') && (
                  <div
                    className="operation-btn"
                    onClick={() => {
                      this.setState(
                        {
                          modalVisible: true,
                          cecFromCode: item?.cecFromCode,
                          wayBillData: item?.afterSaleWaybillList?.find(
                            (p) => p.logisticsType === 'RETURN'
                          ),
                        },
                        () => {
                          this.handleCommoditySendsOut();
                        }
                      );
                    }}
                  >
                    <OverflowTip>
                      {intl.get('mallf.orderDetail.model.fetchWaybill').d('查看运单')}
                    </OverflowTip>
                  </div>
                )}
              {item?.afterSaleWaybillList?.some((p) => p.logisticsType === 'RENEW') && (
                <div
                  className="operation-btn"
                  onClick={() => {
                    this.setState(
                      {
                        modalVisible: true,
                        cecFromCode: item?.cecFromCode,
                        wayBillData: item?.afterSaleWaybillList?.find(
                          (p) => p.logisticsType === 'RENEW'
                        ),
                      },
                      () => {
                        this.handleCommoditySendsOut();
                      }
                    );
                  }}
                >
                  <OverflowTip>
                    {intl.get('mallf.orderDetail.model.check.back.yundan').d('查看商家返件运单')}
                  </OverflowTip>
                </div>
              )}
            </span>
          );
        },
      },
    ];
    return (
      <Fragment>
        <div className={styles['sale-afterdetail-container']}>
          <BreadCrumbs
            value={{
              pageTitle: {
                path: `${Hmall.getHomePath()}my-mall/my-order`,
                name: intl.get('mallf.common.view.orderCenter').d('订单中心'),
              },
              childTitle1: poNum,
            }}
          />
          {loading || !orderId ? (
            <Loading />
          ) : (
            <div className="sale-afterdetail-list">
              <div className="goods-info">
                {goodsData && (
                  <div className="goods-info-content">
                    <div className="goods-title">
                      {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}：{poNum}
                    </div>
                    <div className="goods-info-box">
                      <div r-if={orderTypeCode === 'MANUAL'}>
                        {getMamanualRequestImg({ width: '70px', height: '70px' })}
                      </div>
                      <Link
                        r-if={orderTypeCode !== 'MANUAL'}
                        disabled={orderTypeCode === 'PUNCHOUT'}
                        className="goods-image"
                        to={`${mallType === 'sigl' ? '/sigl' : ''}/product-detail?productId=${
                          goodsData.skuId
                        }&sourceFrom=${goodsData.supplierCode}`}
                      >
                        <Image
                          value={Hmall.convertImg(goodsData.imagePath, 1, goodsData.supplierCode)}
                          width={70}
                          height={70}
                        />
                      </Link>
                      <div className="goods-details">
                        <Link
                          disabled={['MANUAL', 'PUNCHOUT'].includes(orderTypeCode)}
                          className="goods-detail"
                          to={`${mallType === 'sigl' ? '/sigl' : ''}/product-detail?productId=${
                            goodsData.skuId
                          }&sourceFrom=${goodsData.supplierCode}`}
                        >
                          <p>{goodsData.skuName}</p>
                        </Link>
                        <p className="goods-code">
                          {intl.get('mallf.mySaleAfter.view.productCode').d('商品编码')}：
                          {goodsData.skuCode}
                        </p>
                      </div>
                      <div className="sale-after-handle">
                        <Button
                          onClick={() =>
                            Hmall.openPage(
                              `${
                                mallType === 'sigl' ? '/sigl' : ''
                              }/oms-sale-applicat?orderId=${orderId}&consignmentCode=${consignmentCode}&skuCode=${skuCode}&ecpoNum=${poNum}&consignmentLineNum=${consignmentLineNum}&orderEntryId=${orderEntryId}`
                            )
                          }
                          disabled={!goodsData.afterSaleFlag}
                        >
                          {intl.get('mallf.mySaleAfter.model.applyAfterSale').d('申请售后')}
                        </Button>
                        <p className="sale-hint" style={{ whiteSpace: 'nowrap' }}>
                          {goodsData.afterSaleFlag
                            ? intl
                                .get('mallf.myMall.view.saleDetail.saleNumMessage', {
                                  value: saleNumMessage,
                                })
                                .d(`共有${saleNumMessage}可进行售后`)
                            : intl.get('mallf.myMall.product.cannot.aftersale').d('该商品不可售后')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="sale-after-list">
                  <div className="sale-after-history">
                    {intl.get('mallf.saleDetail.afterSales.record').d('历史售后记录')}
                  </div>
                  {this.props.customizeTable(
                    {
                      code: customizeCode,
                      readOnly: true,
                    },
                    <Table
                      spin={listLoading}
                      border={false}
                      dataSet={this.tableDS}
                      columns={columns}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {/* {modalVisible && <WayBillModal {...modalProps} />} */}
          {reasonVisible && <ReasonModal {...reasonProps} />}
        </div>
      </Fragment>
    );
  }
}

export default compose(
  formatterCollections({
    code: ['mallf.mySaleAfter', 'mallf.orderDetail', 'mallf.saleDetail', 'mallf.myOrder'],
  }),
  c7nCustomize({
    unitCode: [customizeCode],
  })
)(SaleDetail);
