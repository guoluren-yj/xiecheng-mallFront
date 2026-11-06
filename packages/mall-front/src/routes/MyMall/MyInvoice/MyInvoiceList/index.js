import React, { Fragment, useState } from 'react';
import { Row, Col, Icon } from 'choerodon-ui';

import Image from 'components/Image';
import Pagination from 'components/Pagination';
import Loading from 'components/loading';
import Link from 'components/Link';
import HmallConfig from 'utils/api-config';
import intl from 'utils/intl';
import numberRender from 'utils/numberRender';

import { Button, Spin } from 'choerodon-ui/pro';
import { fetchOMSInvoiceByGoodsService } from 'services/myInvoiceService';
import style from './index.less';
import useSetState from '@/hooks/useState';
import InvoiceModal from '@/routes/MyMall/OMSOrder/common/InvoiceModal';
import { openOmsInvoiceModal } from '../MyInvoiceModal/index';

export default function MyInvoiceList(props) {
  const [state, setState] = useSetState({
    invoiceVisible: false,
    currentProduct: {},
    poNum: '',
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  /**
   * 订单渲染 渲染头信息
   * @param {Object} 每个父订单
   */
  function renderInvoiceData(item) {
    function queryInvoiceData(order) {
      const { searchFunc, searchParams } = props;
      const { consignmentCode } = order;
      const params = {
        consignmentCode,
      };
      setSubmitLoading(true);
      fetchOMSInvoiceByGoodsService(params)
        .then((res) => {
          setSubmitLoading(false);
          if (res) {
            searchFunc(searchParams);
          }
        })
        .catch(() => {
          setSubmitLoading(false);
        });
    }

    const renderProduct = (product) => {
      return (
        <Row className="product-line">
          <div className="product-img">
            <Link
              disabled={!!product.qtHeaderNo}
              to={`/product-detail?productId=${product.productId || product.skuId}&sourceFrom=${
                product.platformCode || product.cecFromCode
              }`}
            >
              <Image value={product.imagePath || product.primaryUrl} width={40} height={40} />
            </Link>
          </div>
          <p r-if={!product.productId && !product.skuId} className="productname">
            {product.productName || product.skuName}
          </p>
          <Link
            r-if={product.productId || product.skuId}
            style={{ display: 'inline-block' }}
            title={product.productName || product.skuName}
            disabled={!!product.qtHeaderNo}
            to={`/product-detail?productId=${product.productId || product.skuId}&sourceFrom=${
              product.platformCode || product.cecFromCode
            }`}
          >
            <p className="productname">{product.productName || product.skuName}</p>
          </Link>
          <div className="product-info-price">
            {item.currencySymbol}
            {product.actualPriceMeaning ||
              product.actualPrice ||
              product?.orderPriceFinalVO?.entryAmountMeaning ||
              product.unitPriceMeaning ||
              product.unitPrice}
          </div>
          <div className="product-info-quantity">×{product.quantity}</div>
        </Row>
      );
    };

    const renderOmsInvoice = () => {
      return (
        <Fragment>
          <div className="invoice-detail">
            <Row className="invoice-detail-header">
              <Col className="header-ecpo" span={7}>
                <span className="header-label">
                  {intl.get('mallf.myInvoice.view.order.srmPoNum').d('商城订单号')}：
                </span>
                <span className="header-content primary-color">
                  <Link to={`${HmallConfig.contextPath}/oms-order-detail?orderId=${item.orderId}`}>
                    {item.orderCode}
                  </Link>
                </span>
              </Col>
              <Col className="header-ecnum" span={7}>
                <span className="header-label">
                  {intl.get('mallf.myInvoice.view.order.ecOrderNum').d('电商订单号')}：
                </span>
                <span title={item.cecOrderCode} className="header-content">
                  {item.cecOrderCode}
                </span>
              </Col>
              <Col className="header-time" offset={4} span={6}>
                {intl.get('mallf.common.order.complete.time').d('下单时间')}：{item.cecCreatedTime}
              </Col>
            </Row>
            {item.consignmentVOList?.map((line) => {
              return (
                <>
                  <div className="invoice-detail-ecps">
                    <div className="header-ecnum">
                      <span className="header-label">
                        {intl.get('mallf.myMall.view.order.ecSubOrderNum').d('电商子订单号')}：
                      </span>
                      <span title={line.ecConsignmentCode} className="header-content">
                        {line.ecConsignmentCode}
                      </span>
                    </div>
                    <div className="header-time" r-if={line.invoiceTime}>
                      {intl.get('mallf.myInvoice.view.creationDate').d('开票时间')}：
                      {line.invoiceTime}
                    </div>
                  </div>
                  <Row className="invoice-detail-body">
                    <Col className="invoice-product" span={14}>
                      {(line?.consignmentEntryVOList).map((product) => renderProduct(product))}
                    </Col>
                    <Col
                      className="invoice-price"
                      span={6}
                      style={{ height: 78 * (line?.consignmentEntryVOList).length }}
                    >
                      <span className="price-num-label">
                        <Icon
                          type="assignment-o"
                          className="price-assignment"
                          style={{ fontSize: 14, marginTop: -1, marginRight: 4 }}
                        />
                      </span>
                      <span
                        title={
                          item.currencySymbol +
                          (line.consignmentAmountMeaning || line.consignmentAmount)
                        }
                        className="price"
                      >
                        {item.currencySymbol}
                        {line.consignmentAmountMeaning || numberRender(line.consignmentAmount)}
                      </span>
                      <div className="invoice-type">{line.invoiceTypeName} </div>
                    </Col>
                    <Col span={4} style={{ height: 78 * (line?.consignmentEntryVOList).length }}>
                      <ul className="invoice-operate">
                        {line.submitInvoiceFlag ? (
                          <li>
                            <Button
                              funcType="flat"
                              color="primary"
                              className="invoice-operate-btn"
                              onClick={() => queryInvoiceData(line)}
                              title={intl.get('mallf.myInvoice.button.getInvoice').d('获取发票')}
                            >
                              {intl.get('mallf.myInvoice.button.getInvoice').d('获取发票')}
                            </Button>
                          </li>
                        ) : (
                          ''
                        )}
                        {line.invoiceFlag ? (
                          <li>
                            <Button
                              funcType="flat"
                              color="primary"
                              className="invoice-operate-btn"
                              onClick={() => {
                                const { orderCode, cecOrderCode } = item;
                                openOmsInvoiceModal({
                                  invoice: {
                                    ...line,
                                    orderCode,
                                    cecOrderCode,
                                  },
                                });
                              }}
                              title={intl.get('mallf.myInvoice.button.details').d('查看详情')}
                            >
                              {intl.get('mallf.myInvoice.button.details').d('查看详情')}
                            </Button>
                          </li>
                        ) : (
                          ''
                        )}
                      </ul>
                    </Col>
                  </Row>
                </>
              );
            })}
          </div>
        </Fragment>
      );
    };

    return isOMS ? (
      renderOmsInvoice()
    ) : (
      <Fragment>
        <div className="invoice-detail">
          <Row className="invoice-detail-header">
            <Col className="header-ecpo" span={7}>
              <span className="header-label">
                {intl.get('mallf.myInvoice.view.order.srmPoNum').d('商城订单号')}：
              </span>
              <span className="header-content primary-color">
                {isOMS ? (
                  <Link to={`${HmallConfig.contextPath}/oms-order-detail?orderId=${item.orderId}`}>
                    {item.orderCode}
                  </Link>
                ) : (
                  <Link
                    to={`${HmallConfig.contextPath}/order-detail?poHeaderId=${item.poHeaderId}`}
                  >
                    {item.poNum}
                  </Link>
                )}
              </span>
            </Col>
            <Col className="header-ecnum" span={7}>
              {item.ecPoNum ||
                (item.cecOrderCode && (
                  <>
                    <span className="header-label">
                      {intl.get('mallf.myInvoice.view.order.ecOrderNum').d('电商订单号')}：
                    </span>
                    {isOMS ? (
                      <span title={item.cecOrderCode} className="header-content">
                        {item.cecOrderCode}
                      </span>
                    ) : (
                      <span className="header-content">{item.ecPoNum}</span>
                    )}
                  </>
                ))}
            </Col>
            <Col className="header-time" offset={4} span={6}>
              {item.creationDate}
            </Col>
          </Row>
          <Row className="invoice-detail-body">
            <Col className="invoice-product" span={14}>
              {(item?.poLineList || item?.orderEntryVOS || item?.orderEntryVOS).map((product) =>
                renderProduct(product)
              )}
            </Col>
            <Col
              className="invoice-price"
              span={6}
              style={{ height: 81 * (item?.poLineList || item?.orderEntryVOS).length }}
            >
              <span className="price-num-label">
                <Icon type="assignment-o" style={{ fontSize: 14, marginTop: -1, marginRight: 4 }} />
                {intl.get('mallf.myInvoice.view.order.amount').d('金额')}：
              </span>
              <span
                title={item.orderAmountMeaning || item.orderAmount || item?.finalAmountMeaning}
                className="price"
              >
                {item.orderAmountMeaning ||
                  item.orderAmount ||
                  item?.orderPriceFinalVO?.finalAmountMeaning}
              </span>
              {!!item.freightAmount && (
                <p className="feight-price">
                  {intl.get(`mallf.myInvoice.model.companyOrder.freight`).d('运费')}：
                  {item.freightAmountMeaning || item.freightAmount}
                </p>
              )}
            </Col>
            <Col span={4} style={{ height: 81 * (item?.poLineList || item?.orderEntryVOS).length }}>
              {(item?.poLineList || item?.orderEntryVOS).map((product) => {
                return (
                  <Row className="invoice-operate">
                    <a
                      className="primary-color"
                      onClick={() =>
                        setState({
                          currentProduct: product,
                          invoiceVisible: true,
                          poNum: item.poNum || item.orderCode,
                        })
                      }
                    >
                      {intl.get('mallf.myInvoice.button.details').d('查看详情')}
                    </a>
                  </Row>
                );
              })}
            </Col>
          </Row>
        </div>
      </Fragment>
    );
  }

  const { pagination = {}, invoiceData = [], loading, searchFunc, isOMS } = props;
  return (
    <div className={style['invoiceList-container']}>
      <div className="invoiceList" style={{ padding: 0 }}>
        {loading ? (
          <Loading />
        ) : invoiceData.length > 0 ? (
          <Spin spinning={submitLoading}>
            <Fragment>
              {invoiceData.map((item) => renderInvoiceData(item))}
              <Pagination
                style={{ marginTop: 15 }}
                zeroStart
                showQuickJumper
                {...pagination}
                onForward={searchFunc}
              />
            </Fragment>
          </Spin>
        ) : (
          <div className="empty-invoiceList">
            <div className="info">
              {intl.get('mallf.myInvoice.view.invoice.noInvoice').d('暂无发票')}
            </div>
          </div>
        )}
      </div>
      {state.invoiceVisible && (
        <InvoiceModal
          isOMS={isOMS}
          poNum={state.poNum}
          visible={state.invoiceVisible}
          toggleModal={() => setState({ invoiceVisible: !state.invoiceVisible })}
          product={state.currentProduct}
        />
      )}
    </div>
  );
}
