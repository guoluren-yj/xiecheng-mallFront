import React, { Fragment } from 'react';
import qs from 'qs';
import { Spin } from 'hzero-ui';
import { Breadcrumb, Modal, Tooltip } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import moment from 'moment';
import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  fetchGoodsInfo,
  // goodsAttributes,
  saleAfterList,
  fetchCancelAfterSale,
  fetchSaleNum,
  fetchSureMessage,
  sentAfterSaleService,
  submitWayBill,
} from 'services/saleDetailService';
import intl from 'utils/intl';
import * as Hmall from 'utils/utils';
import Image from 'components/Image';
import Loading from 'components/loading';
import Link from 'components/Link';
import Pagination from 'components/Pagination';
import Tags from 'components/Tag';
import WayBillModal from './WayBillForm';
import ReasonModal from './ReasonModal';
import styles from './index.less';

const { confirm } = Modal;
class SaleDetail extends React.Component {
  constructor(props) {
    super(props);
    // const { companyId, organizationId } = Hmall.getUserConfigInfo();
    this.state = {
      // companyId, // 公司id
      // organizationId, // 租户id
      goodsData: [],
      // numData: [],
      saleAfterData: [],
      // jdOrderId: qs.parse(this.props.location.search.substr(1)).poNum, // 订单id
      // wareIds: [], // 商品Id
      loading: false,
      listLoading: false,
      // wareNum: '',
      // customerExpect: [], // 可售后类型
      // pickupWareType: [],
      // spinning: false,
      hasSaleNum: 0,
      pagination: {},
      modalVisible: false,
      submitLoading: false,
      afterSaleId: '',
      wayBillData: {},
      reasonVisible: false,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    const { poLineId } = qs.parse(this.props.location.search.substr(1)); // 订单行id,srm订单号,供应商
    this.getGoodsInfo(poLineId);
    this.querySaleAfterList();
    this.fetchSaleGoodsNum();
  }

  /**
   * 取消售后
   */
  cancelAfterSale = (afterSaleId) => {
    const { goodsData } = this.state;
    this.setState({ afterSaleId });
    if (goodsData.sourceCode !== 'CATA') {
      this.setState({
        reasonVisible: true,
      });
      return false;
    }
    this.cancelAfterSaleService(afterSaleId);
  };

  // 取消售后接口
  cancelAfterSaleService = (afterSaleId, param) => {
    const { goodsData } = this.state;
    const { poLineId } = qs.parse(this.props.location.search.substr(1)); // 订单行id,srm订单号,供应商
    const parmas =
      goodsData.sourceCode !== 'CATA'
        ? {
            afterSaleId,
            ...param,
          }
        : { afterSaleId };
    this.setState({
      listLoading: true,
    });
    fetchCancelAfterSale(parmas)
      .then((res) => {
        if (res) this.querySaleAfterList();
        this.getGoodsInfo(poLineId);
      })
      .finally(() => {
        this.setState({
          listLoading: false,
          reasonVisible: false,
        });
      });
  };

  /**
   * 确认售后完成
   */
  handleSureMessage = (afterSaleId) => {
    this.setState({
      listLoading: true,
    });
    fetchSureMessage(afterSaleId)
      .then((res) => {
        if (res) this.querySaleAfterList(); // 请求售后列表
      })
      .catch(() => {
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
    confirm({
      title: intl.get(`mallf.saleDetail.view.goods.sent`).d('商品发出'),
      content: `${intl.get(`mallf.saleDetail.view.isGoods.sent`).d('是否已发出商品')}?`,
      onOk: () => {
        this.setState({
          loading: true,
        });
        sentAfterSaleService(params)
          .then((res) => {
            if (res) this.querySaleAfterList();
          })
          .finally(() => {
            this.setState({
              loading: false,
            });
          });
      },
      onCancel() {},
    });
  };

  /**
   * 获取商品信息
   */
  getGoodsInfo(ecPoLineId) {
    this.setState({
      loading: true,
    });
    fetchGoodsInfo(ecPoLineId)
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

  // 查询可售后数量
  fetchSaleGoodsNum = () => {
    const { poSubNum, productNum } = qs.parse(this.props.location.search.substr(1));
    fetchSaleNum({ poSubNum, productNum }).then((res) => {
      this.setState({
        hasSaleNum: res,
      });
    });
  };

  /**
   *根据订单查询售后列表
   */
  querySaleAfterList(params = {}) {
    const { poNum, poLineId } = qs.parse(this.props.location.search.substr(1));
    const newParams = {
      ...params,
      poNum,
      poLineId,
    };
    saleAfterList(newParams)
      .then((res) => {
        const { content = [], ...pagination } = res;
        this.setState({
          saleAfterData: content || [],
          pagination,
        });
      })
      .finally(() => {
        this.setState({
          listLoading: false,
        });
      });
  }

  /**
   * 服务类型
   */
  serviceType(type) {
    if (type === '1') {
      return intl.get('mallf.saleDetail.view.return').d('退货');
    } else if (type === '2') {
      return intl.get('mallf.saleDetail.view.exchange').d('换货');
    } else if (type === '3') {
      return intl.get('mallf.saleDetail.view.service').d('维修');
    }
  }

  // 填写运单
  handleSubmit = (params) => {
    const { afterSaleId } = this.state;
    const newParams = {
      ...params,
      afterSaleId,
      logisticsType: 0,
    };
    submitWayBill(newParams).then((res) => {
      if (res) {
        this.querySaleAfterList();
        this.setState({ modalVisible: false });
      }
    });
  };

  // 加载售后申请单
  renderlistDetail = (saleAfterData) => {
    return (
      <Fragment>
        {saleAfterData.map((item) => {
          let afterSaleType;
          switch (item.afterSaleStatus) {
            case 'CANCELED':
              afterSaleType = 'cancel';
              break;
            case 'FINISH':
              afterSaleType = 'success';
              break;
            case 'REJECT':
              afterSaleType = 'failed';
              break;
            case 'PRODUCT_REJECT':
              afterSaleType = 'failed';
              break;
            default:
              afterSaleType = 'info';
              break;
          }
          return (
            <Fragment>
              <ul className="sale-after-list-info">
                <li className="sale-list-afterSalesNum">
                  <Tooltip
                    title={
                      item.procInstId &&
                      `${intl
                        .get('mallf.saleDetail.view.externalProcessCode')
                        .d('外部流程编码')}：${item.procInstId}`
                    }
                  >
                    <Link to={`/sale-status?afterSaleId=${item.afterSaleId}`}>
                      {item.afterSaleNum}
                    </Link>
                  </Tooltip>
                </li>
                <li className="sale-list-afterSalesQuantity">
                  {item?.afterSaleItem?.applyQuantity}
                </li>
                <li className="sale-list-serviceType">{this.serviceType(item.afsType)}</li>
                <li className="sale-list-applicationTime">
                  {moment(item.applicationTime).format('YYYY-MM-DD')}
                </li>
                <li className="sale-list-status">
                  <Tags style={{ display: 'inline-block' }} type={afterSaleType}>
                    {item.afterSaleStatusName}
                  </Tags>
                </li>
                <li className="sale-list-explain">{item.remark}</li>
                <li className="sale-list-operation">
                  {/* {item.afterSaleStatus === 'APPROVING' && (
                    <button
                      type="button"
                      className="canclebtn"
                      onClick={() => this.cancelAfterSale(item, index)}
                    >
                      {intl.get('mallf.common.model.cancel').d('取消')}
                    </button>
                  )} */}
                  <Link
                    to={`/sale-status?afterSaleId=${item.afterSaleId}`}
                    className="operation-btn"
                  >
                    {intl.get('hzero.common.button.details').d('查看详情')}
                  </Link>
                  {item.afterSaleStatus === 'WAIT_SENT' && (
                    <div className="operation-btn" onClick={() => this.sentAfterSale(item)}>
                      {intl.get('mallf.saleDetail.view.product.send').d('商品发出')}
                    </div>
                  )}
                  {['APPROVING', 'WAIT_SENT'].includes(item.afterSaleStatus) &&
                    item.isCanceAfsEnabled && (
                      <div
                        className="operation-btn"
                        onClick={() => this.cancelAfterSale(item.afterSaleId)}
                      >
                        {intl.get('mallf.saleDetail.view.cancel.application').d('取消申请')}
                      </div>
                    )}
                  {item.afterSaleStatus === 'WAIT_CONFIRM' && (
                    <div
                      className="operation-btn"
                      onClick={() => this.handleSureMessage(item.afterSaleId)}
                    >
                      {intl.get('mallf.saleDetail.view.sure.complete').d('确认完成')}
                    </div>
                  )}
                  {item.afterSaleStatus === 'WAIT_PROCESS' && !item.afterSaleWaybill && (
                    <div
                      className="operation-btn"
                      onClick={() =>
                        this.setState({ modalVisible: true, afterSaleId: item.afterSaleId })
                      }
                    >
                      {intl.get('mallf.saleDetail.model.submitWaybill').d('提交运单')}
                    </div>
                  )}
                  {item.afterSaleStatus === 'WAIT_PROCESS' && item.afterSaleWaybill && (
                    <div
                      className="operation-btn"
                      onClick={() =>
                        this.setState({ modalVisible: true, wayBillData: item.afterSaleWaybill })
                      }
                    >
                      {intl.get('mallf.saleDetail.model.fetchWaybill').d('查看运单')}
                    </div>
                  )}
                </li>
              </ul>
            </Fragment>
          );
        })}
      </Fragment>
    );
  };

  render() {
    const {
      // wareNum,
      loading,
      listLoading,
      goodsData = [],
      hasSaleNum,
      // numData=[],
      saleAfterData = [],
      pagination = {},
      // customerExpect = [],
      // spinning,p
      modalVisible,
      submitLoading,
      wayBillData,
      reasonVisible,
      afterSaleId,
    } = this.state;
    const { poNum, poLineId, poSubNum, productNum } = qs.parse(
      this.props.location.search.substr(1)
    );
    const modalProps = {
      wayBillData,
      modalVisible,
      submitLoading,
      onOk: this.handleSubmit,
      onCancel: () => this.setState({ modalVisible: false }),
    };
    const reasonProps = {
      reasonVisible,
      onOk: (param) => this.cancelAfterSaleService(afterSaleId, param),
      onCancel: () => this.setState({ reasonVisible: false }),
    };
    return (
      <Fragment>
        <div className={styles['sale-afterdetail-container']}>
          <Breadcrumb className="order-detail-breadcrumb" separator=">">
            <Breadcrumb.Item href={Hmall.getUserConfigInfo().mallType === 'sigl' ? '/sigl' : '/'}>
              {intl.get('mallf.common.view.homePage').d('首页')}
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/my-mall/my-order">
              {intl.get('mallf.common.view.orderCenter').d('订单中心')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {`${intl.get('mallf.saleDetail.view.afterSalesInformation').d('售后信息')}: ${poNum}`}
            </Breadcrumb.Item>
          </Breadcrumb>
          {loading ? (
            <Loading />
          ) : (
            <div className="sale-afterdetail-list">
              <div className="goods-info">
                {goodsData && (
                  <div className="goods-info-content">
                    <div className="goods-title">
                      {intl.get('mallf.saleDetail.view.order.srmPoNum').d('商城订单号')}：{poNum}
                    </div>
                    <div className="goods-info-box">
                      <Link
                        className="goods-image"
                        to={`/product-detail?productId=${goodsData.productId}&sourceFrom=${goodsData.platformCode}`}
                      >
                        <Image
                          value={Hmall.convertImg(goodsData.imagePath, 1, goodsData.platformCode)}
                          width={70}
                          height={70}
                        />
                      </Link>
                      <div className="goods-details">
                        <Link
                          className="goods-detail"
                          to={`/product-detail?productId=${goodsData.productId}&sourceFrom=${goodsData.platformCode}`}
                        >
                          <p>{goodsData.productName}</p>
                        </Link>
                        <p className="goods-code">
                          {intl.get('mallf.saleDetail.view.productCode').d('商品编码')}：
                          {goodsData.productNum}
                        </p>
                      </div>
                      <div className="sale-after-handle">
                        <Button
                          onClick={() =>
                            Hmall.openPage(
                              `/sale-applicat?poLineId=${poLineId}&productNum=${productNum}&poSubNum=${poSubNum}`
                            )
                          }
                          disabled={hasSaleNum <= 0 || !goodsData.afterSaleFlag}
                        >
                          {intl.get('mallf.saleDetail.model.applyAfterSale').d('申请售后')}
                        </Button>
                        <p className="sale-hint" style={{ whiteSpace: 'nowrap' }}>
                          {goodsData.afterSaleFlag
                            ? intl
                                .get('mallf.saleDetail.view.saleDetail.hintMessage', {
                                  value: hasSaleNum,
                                })
                                .d(`共有${hasSaleNum}个商品可进行售后`)
                            : intl
                                .get('mallf.saleDetail.product.replacement.overdue')
                                .d('该商品超过退换货时间')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="sale-after-list">
                  <div className="sale-after-history">
                    {intl.get('mallf.saleDetail.afterSales.record').d('历史售后记录')}
                  </div>
                  <ul className="sale-list-title">
                    <li className="sale-list-afterSalesNum">
                      {intl.get('mallf.saleDetail.view.saleDetail.afterSalesNum').d('售后申请单号')}
                    </li>
                    <li className="sale-list-afterSalesQuantity">
                      {intl
                        .get('mallf.saleDetail.view.saleDetail.afterSalesQuantity')
                        .d('售后数量')}
                    </li>
                    <li className="sale-list-serviceType">
                      {intl.get('mallf.saleDetail.view.saleDetail.serviceType').d('服务类型')}
                    </li>
                    <li className="sale-list-applicationTime">
                      {intl.get('mallf.saleDetail.view.saleDetail.applicationTime').d('申请时间')}
                    </li>
                    <li className="sale-list-status">
                      {intl.get('mallf.saleDetail.view.status').d('状态')}
                    </li>
                    <li className="sale-list-explain">
                      {intl.get('mallf.saleDetail.view.explain').d('说明')}
                    </li>
                    <li className="sale-list-operation">
                      {intl.get('mallf.saleDetail.view.operation').d('操作')}
                    </li>
                  </ul>
                  {!isEmpty(saleAfterData) ? (
                    <Spin spinning={listLoading}>
                      {this.renderlistDetail(saleAfterData)}
                      <Pagination
                        showSizeChanger
                        style={{ width: '100%', marginTop: 15 }}
                        zeroStart
                        showQuickJumper
                        {...pagination}
                        onForward={this.querySaleAfterList}
                      />
                    </Spin>
                  ) : (
                    <div className="noGoods">
                      <span className="bg-images">&nbsp;</span>
                      <p>{intl.get(`mallf.saleDetail.view.noData`).d('暂无数据')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {modalVisible && <WayBillModal {...modalProps} />}
          {reasonVisible && <ReasonModal {...reasonProps} />}
        </div>
      </Fragment>
    );
  }
}

export default formatterCollections({ code: ['mallf.saleDetail'] })(SaleDetail);
