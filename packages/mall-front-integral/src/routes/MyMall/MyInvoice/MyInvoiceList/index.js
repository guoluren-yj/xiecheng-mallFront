import React, { Fragment } from 'react';
import { Row, Col, Icon } from 'choerodon-ui';

import Image from 'components/Image';
import Pagination from 'components/Pagination';
import Loading from 'components/loading';
import Link from 'components/Link';
import HmallConfig from 'utils/api-config';
import intl from 'utils/intl';

import useSetState from 'hooks/useState';
import InvoiceModal from 'mall-front/lib/routes/MyMall/OMSOrder/common/InvoiceModal';
import style from './index.less';

export default function MyInvoiceList(props) {
  const [state, setState] = useSetState({
    invoiceVisible: false,
    currentProduct: {},
    poNum: '',
  });

  /**
   * 订单渲染 渲染头信息
   * @param {Object} 每个父订单
   */
  function renderInvoiceData(item) {
    return (
      <Fragment>
        <div className="invoice-detail">
          <Row className="invoice-detail-header">
            <Col className="header-ecpo" span={7}>
              <span className="header-label">
                {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}：
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
                      {intl.get('mallf.common.view.order.ecOrderNum').d('电商订单号')}：
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
              {(item?.poLineList || item?.orderEntryVOS || item?.orderEntryVOS).map((product) => {
                return (
                  <Row className="product-line">
                    <div className="product-img">
                      <Link
                        disabled={!!product.qtHeaderNo}
                        to={`/product-detail?productId=${
                          product.productId || product.skuId
                        }&sourceFrom=${product.platformCode || product.cecFromCode}`}
                      >
                        <Image
                          value={product.imagePath || product.primaryUrl}
                          width={40}
                          height={40}
                        />
                      </Link>
                    </div>
                    <Link
                      style={{ display: 'inline-block' }}
                      title={product.productName || product.skuName}
                      disabled={!!product.qtHeaderNo}
                      to={`/product-detail?productId=${
                        product.productId || product.skuId
                      }&sourceFrom=${product.platformCode || product.cecFromCode}`}
                    >
                      <p className="productname">{product.productName || product.skuName}</p>
                    </Link>
                    <div className="product-info-price">
                      {product.actualPriceMeaning ||
                        product.actualPrice ||
                        product?.orderPriceFinalVO?.entryAmountMeaning}
                    </div>
                    <div className="product-info-quantity">×{product.quantity}</div>
                  </Row>
                );
              })}
            </Col>
            <Col
              className="invoice-price"
              span={6}
              style={{ height: 81 * (item?.poLineList || item?.orderEntryVOS).length }}
            >
              <span className="price-num-label">
                <Icon type="assignment-o" style={{ fontSize: 14, marginTop: -1, marginRight: 4 }} />
                {intl.get('mallf.myMall.view.order.amount').d('金额')}：
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
                  {intl.get(`mallf.myMall.model.companyOrder.freight`).d('运费')}：
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
                      {intl.get('hzero.common.button.details').d('查看详情')}
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
          <Fragment>
            {invoiceData.map((item) => renderInvoiceData(item))}
            <Pagination zeroStart showQuickJumper {...pagination} onForward={searchFunc} />
          </Fragment>
        ) : (
          <div className="empty-invoiceList">
            <div className="info">
              {intl.get('mallf.myMall.view.invoice.noInvoice').d('暂无发票')}
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
