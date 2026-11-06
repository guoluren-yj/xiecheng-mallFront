import React, { useState } from 'react';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import { Icon as HIcon } from 'hzero-ui';
import { Tooltip, Icon, Checkbox } from 'choerodon-ui';

import { myInvoice, afterSaleApplication } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import Link from 'components/Link';
import Tags from 'components/Tag';
import LogisticsDrawer from 'components/LogisticsDrawer';
import Product from './Product';
import InvoiceModal from '../../common/InvoiceModal';
import { getContextValue } from '../../common/Context';
import CuxFn from '@/cuxTools/cuxFn';

export default function rendersubOrders({
  item,
  currentStatus,
  onAccept,
  onComment,
  index, // 父订单下标
}) {
  const { list, setState } = getContextValue();
  const { error, poNum, poLineList, platformCode } = item;
  const { hideMenuList, hideFieldList } = getUserConfigInfo();
  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});

  const toggleInvoiceModal = () => {
    setInvoiceVisible(!invoiceVisible);
  };

  const userInfo = (p) => (
    <div>
      <p style={{ margin: '0 4px 5px' }}>
        <span>{intl.get('mallf.myOrder.view.order.deliveryInformation').d('收货信息')}</span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myOrder.view.order.receiver').d('收货人')}：
        <span>{p.receivingContactName}</span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myOrder.view.order.shippingAddress').d('收货地址')}：
        <span title={p.receivingAddress}>{p.receivingAddress}</span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myOrder.view.order.contactInformation').d('联系方式')}：
        <span>{p.receivingMobile}</span>
      </p>
      <p style={{ margin: '10px 4px 5px' }}>
        <span>{intl.get('mallf.myOrder.view.order.acquireInformation').d('收单信息')}</span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myOrder.view.order.acquirer').d('收单人')}：
        <span>{p.invoiceContactName}</span>
      </p>
      <p style={{ margin: '0 4px 5px' }}>
        {intl.get('mallf.myOrder.view.order.billingAddress').d('收单地址')}：
        <span title={p.invoiceAddress}>{p.invoiceAddress}</span>
      </p>
      <p style={{ margin: '0 4px' }}>
        {intl.get('mallf.myOrder.view.order.contactInformation').d('联系方式')}：
        <span>{p.invoiceMobile}</span>
      </p>
    </div>
  );

  const user = (p) => (
    <div className="product-info-line">
      <Tooltip placement="bottom" title={userInfo(p)}>
        <p className="receiver" style={error ? { color: '#999' } : {}}>
          <Icon type="assignment_ind-o" style={{ fontSize: 14, marginTop: -1 }} />{' '}
          {p.receivingContactName}
        </p>
      </Tooltip>
    </div>
  );

  const priceInfo = (product) => {
    return (
      <div className="product-info-price-num">
        <span className="price-num-label">
          <Icon type="assignment-o" style={{ fontSize: 14, marginTop: -1, marginRight: 4 }} />
          {intl.get('mallf.myOrder.view.order.amount').d('金额')}：
        </span>
        <span className={`price ${error ? 'error' : ''}`}>
          {product?.currencySymbol || ''}
          {product.priceMeaning || +product.price}
        </span>
        {/* {!!product.freightAmount && <p>{intl.get(`mallf.myOrder.model.companyOrder.freight`).d('运费')}：{item.freightAmount}</p>} */}
      </div>
    );
  };

  const status = (product) => {
    let subStatus;
    switch (product.subStatus) {
      case 'CANCELLED':
        subStatus = 'cancel';
        break;
      case 'FINISH':
        subStatus = 'success';
        break;
      case 'REJECT':
        subStatus = 'failed';
        break;
      case 'PRODUCT_REJECT':
        subStatus = 'failed';
        break;
      default:
        subStatus = 'info';
        break;
    }
    return subStatus;
  };

  const statusInfo = (product, ecSubList) => {
    return (
      <>
        {!product.qtHeaderNo && (
          <>
            {product.waitAssessFlag === 1 && (
              <a className="primary-btn" onClick={() => onComment(product)}>
                {intl.get('mallf.common.view.goto.comment').d('晒单评价')}
              </a>
            )}
            {product.waitAssessFlag === 2 && (
              <a onClick={() => onComment(product)}>
                {intl.get('mallf.common.view.goto.addComment').d('追加评论')}
              </a>
            )}
            {product.waitAssessFlag === 3 && (
              <a onClick={() => onComment(product)}>
                {intl.get('mallf.common.view.goto.commentView').d('查看评论')}
              </a>
            )}
            {/* {(!isEmpty(product.receiveList) || !isEmpty(product.freightReceiveList)) &&
              hideFieldList &&
              !hideFieldList.includes('ACCEPTANCE') && (
                <a onClick={() => onAccept(ecSubList || [product])}>
                  {intl.get('mallf.myOrder.view.catalog.accept').d('接收')}
                </a>
              )} */}
            {product.enableMallReceiveCheck !== '-1' &&
              hideFieldList &&
              !hideFieldList.includes('ACCEPTANCE') && (
                <Tooltip
                  title={
                    product.enableMallReceiveCheck === '0'
                      ? intl.get('mallf.myOrder.view.nosurport.accept').d('此商品不支持在商城接收')
                      : null
                  }
                  placement="bottom"
                >
                  <a
                    onClick={() => {
                      if (product.enableMallReceiveCheck === '1') onAccept(ecSubList || [product]);
                    }}
                    className={classnames([
                      'primary-btn',
                      { disabled: product.enableMallReceiveCheck === '0' },
                    ])}
                  >
                    {intl.get('mallf.myOrder.view.catalog.accept').d('接收')}
                  </a>
                </Tooltip>
              )}
            {false && (
              <a className="primary-btn" onClick={() => onAccept([product])}>
                {intl.get('mallf.myOrder.view.goto.pay').d('立即支付')}
              </a>
            )}
            {!!product.afterSaleFlag && (
              <PermissionWrapper permissionList={[afterSaleApplication]}>
                <Link
                  className="text-overflow"
                  title={intl.get('mallf.myOrder.view.afterSales.application').d('售后申请')}
                  to={`/sale-detail?poLineId=${product.poLineId}&poNum=${poNum}&productNum=${product.productNum}&poSubNum=${product.poSubNum}`}
                >
                  {intl.get('mallf.myOrder.view.afterSales.application').d('售后申请')}
                </Link>
              </PermissionWrapper>
            )}
          </>
        )}
      </>
    );
  };

  const allPriceInfo = (
    <li
      className="product-price"
      style={!['WAITING_RECEIVE'].includes(currentStatus) ? { width: 145 } : {}}
    >
      <div className="product-info-price-num">
        <span className="price-num-label">
          <Icon type="assignment-o" style={{ fontSize: 14, marginTop: -1, marginRight: 4 }} />
          {intl.get('mallf.myOrder.view.order.amount').d('金额')}：
        </span>
        <span
          title={item.orderAmountMeaning || item.orderAmount}
          className={`price ${error ? 'error' : ''}`}
        >
          {item?.currencySymbol || poLineList[0].currencySymbol || ''}
          {item.orderAmountMeaning || item.orderAmount}
        </span>
        {!!item.freightAmount && (
          <p>
            {intl.get(`mallf.myOrder.model.companyOrder.freight`).d('运费')}：
            {item?.currencySymbol || poLineList[0].currencySymbol || ''}
            {item.freightAmountMeaning || item.freightAmount}
          </p>
        )}
      </div>
    </li>
  );

  const subOrderLine = () => {
    const product = poLineList[0];
    const { poSubNum, poSubHeaderId } = product;
    const logisticsProps = {
      poSubNum,
      poSubHeaderId,
      ecPlatformCode: platformCode,
    };
    return (
      <div className={`"order-detail-product" ${error ? 'error' : ''}`}>
        <div className="detail-product-info">
          <div className="product-info-left">
            <ul>
              {poLineList.map((p, subIndex) => {
                return (
                  <Product
                    currencySymbol={item?.currencySymbol || poLineList[0].currencySymbol || ''}
                    currentStatus={currentStatus}
                    product={p}
                    index={index}
                    subIndex={subIndex}
                    platformCode={p.platformCode}
                  />
                );
              })}
            </ul>
          </div>
          <ul className="product-info-right">
            <li
              className="product-info-receiver"
              style={!['WAITING_RECEIVE'].includes(currentStatus) ? { width: 130 } : {}}
            >
              {user(product)}
            </li>
            {allPriceInfo}
            <li className="product-info-status" style={{ borderBottom: 'none' }}>
              <p className="text-overflow" title={product.subStatusName}>
                <Tags style={{ display: 'inline-block' }} type={status(product)}>
                  {product.subStatusName}
                </Tags>
                {product.denialReason && ['REJECT', 'CANCELLED'].includes(product.subStatus) && (
                  <Tooltip
                    title={`${intl.get('mallf.myOrder.view.denial.reason').d('拒绝原因')}：${
                      product.denialReason
                    }`}
                    placement="top"
                  >
                    <HIcon
                      style={{ marginLeft: '6px', color: '#F56649' }}
                      type="exclamation-circle"
                      size={14}
                    />
                  </Tooltip>
                )}
              </p>
              {['FINISH', 'WAITING_RECEIVE'].includes(product.subStatus) &&
                hideFieldList &&
                !hideFieldList.includes('LOGISTICS') && (
                  <a className="primary-link">
                    <LogisticsDrawer {...logisticsProps}>
                      {intl.get(`mallf.myOrder.view.check.logistics`).d('查看物流')}
                    </LogisticsDrawer>
                  </a>
                )}
              {/* {product.assessFlag === 1 && ( // 查看评价下个迭代做
                <a className="primary-link">
                  {intl.get(`mallf.orderDetail.view.check.comment`).d('查看评价')}
                </a>
              )} */}
              {product.srmInvoiceFlag === 1 && (
                <PermissionWrapper permissionList={myInvoice}>
                  <a
                    className="primary-link"
                    onClick={() => {
                      toggleInvoiceModal();
                      setCurrentProduct(product);
                    }}
                  >
                    {intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
                  </a>
                </PermissionWrapper>
              )}
            </li>
            <li className="product-info-handle">{statusInfo(product)}</li>
          </ul>
        </div>
      </div>
    );
  };

  const handleOnCheck = (checked, subIndex) => {
    const newList = JSON.parse(JSON.stringify(list));
    if (typeof subIndex !== 'number') {
      // 勾选整个子订单
      newList[index].poLineList.forEach((p) => {
        if (p.poSubNum === subIndex.poSubNum) {
          // eslint-disable-next-line no-param-reassign
          p.checked = checked;
        }
      });
    } else {
      newList[index].poLineList[subIndex].checked = checked;
    }
    if (
      newList[index].poLineList.every((p) => p.checked) ||
      newList[index].poLineList.every((p) => !p.checked)
    ) {
      newList[index].checked = checked;
    }
    setState({ list: newList });
  };

  // 订单状态信息展示
  const productInfoStatus = (product, logisticsProps) => {
    return (
      <>
        <p style={{ padding: '0 10px' }}>
          <Tags
            style={{
              display: 'inline-block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              verticalAlign: 'middle',
            }}
            title={product.subStatusName}
            type={status(product)}
          >
            {product.subStatusName}
          </Tags>
          {product.denialReason && ['REJECT', 'CANCELLED'].includes(product.subStatus) && (
            <Tooltip
              title={`${intl.get('mallf.myOrder.view.denial.reason').d('拒绝原因')}：${
                product.denialReason
              }`}
              placement="top"
            >
              <HIcon
                style={{ marginLeft: '6px', color: '#F56649' }}
                type="exclamation-circle"
                size={14}
              />
            </Tooltip>
          )}
          {product.subStatus === 'NEW' && (
            <Tooltip
              title={
                item?.externalErrorMessages ||
                intl.get('mallf.myOrder.view.confire.new.order').d('请确认采购申请单据状态并提交')
              }
              placement="top"
            >
              <HIcon
                style={{
                  color: item?.externalErrorMessages ? '#F56649' : '#999',
                  marginLeft: '6px',
                  verticalAlign: 'middle',
                }}
                type="exclamation-circle"
                size={14}
              />
            </Tooltip>
          )}
        </p>
        {['FINISH', 'WAITING_RECEIVE'].includes(product.subStatus) &&
          hideFieldList &&
          !hideFieldList.includes('LOGISTICS') && (
            <LogisticsDrawer {...logisticsProps}>
              <span className="primary-link">
                {intl.get(`mallf.myOrder.view.check.logistics`).d('查看物流')}
              </span>
            </LogisticsDrawer>
          )}
        {product.srmInvoiceFlag === 1 && (
          <PermissionWrapper permissionList={myInvoice}>
            <a
              className="primary-link"
              onClick={() => {
                toggleInvoiceModal();
                setCurrentProduct(product);
              }}
            >
              {intl.get('mallf.myOrder.view.check.invoince').d('查看发票')}
            </a>
          </PermissionWrapper>
        )}
      </>
    );
  };

  const productLine = () => {
    const subList = {};
    const isEC = poLineList[0].platformCode !== 'CATA';
    if (isEC) {
      poLineList.forEach((p) => {
        if (subList[p.poSubNum]) {
          subList[p.poSubNum] = subList[p.poSubNum].concat(p);
        } else {
          subList[p.poSubNum] = [p];
        }
      });
    }
    return (
      <div className={`"order-detail-product" ${error ? 'error' : ''}`}>
        <div className="detail-product-info">
          {currentStatus === 'WAITING_RECEIVE' &&
            hideFieldList &&
            !hideFieldList.includes('ACCEPTANCE') && (
              <div style={{ borderRight: '1px solid #EBEBEB' }}>
                {isEC
                  ? Object.keys(subList).map((poSubNum) => {
                      if (
                        subList[poSubNum].some(
                          (p) => !isEmpty(p.receiveList) || !isEmpty(p.freightReceiveList)
                        )
                      ) {
                        const product = subList[poSubNum].find(
                          (p) => !isEmpty(p.receiveList) || !isEmpty(p.freightReceiveList)
                        );
                        return (
                          <div
                            className="product-info-select"
                            style={{
                              height: `${(subList[poSubNum]?.length / poLineList.length) * 100}%`,
                            }}
                          >
                            {['WAITING_RECEIVE'].includes(currentStatus) && (
                              <Checkbox
                                disabled={product.enableMallReceiveCheck !== '1'}
                                className="product-line-checkbox"
                                checked={!!product.checked}
                                onChange={(e) => {
                                  handleOnCheck(e.target.checked, product);
                                }}
                              />
                            )}
                          </div>
                        );
                      } else {
                        return subList[poSubNum].map((product, subIndex) => {
                          return (
                            <div
                              className="product-info-select"
                              style={{ height: `${(1 / poLineList.length) * 100}%` }}
                            >
                              {['WAITING_RECEIVE'].includes(currentStatus) && (
                                <Checkbox
                                  disabled={product.enableMallReceiveCheck !== '1'}
                                  className="product-line-checkbox"
                                  checked={!!product.checked}
                                  onChange={(e) => {
                                    handleOnCheck(e.target.checked, subIndex);
                                  }}
                                />
                              )}
                            </div>
                          );
                        });
                      }
                    })
                  : poLineList.map((product, subIndex) => {
                      return (
                        <div
                          className="product-info-select"
                          style={{ height: `${(1 / poLineList.length) * 100}%` }}
                        >
                          {['WAITING_RECEIVE'].includes(currentStatus) && (
                            <Checkbox
                              disabled={product.enableMallReceiveCheck !== '1'}
                              className="product-line-checkbox"
                              checked={!!product.checked}
                              onChange={(e) => {
                                handleOnCheck(e.target.checked, subIndex);
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
              </div>
            )}
          <div className="product-info-left">
            <ul style={{ height: '100%' }}>
              {isEC
                ? Object.keys(subList).map((poSubNum, subIndex) => {
                    return subList[poSubNum].map((product) => {
                      return (
                        <Product
                          currencySymbol={
                            item?.currencySymbol || poLineList[0].currencySymbol || ''
                          }
                          style={{ height: `${(1 / poLineList.length) * 100}%` }}
                          currentStatus={currentStatus}
                          product={product}
                          index={index}
                          subIndex={subIndex}
                          platformCode={product.platformCode}
                        />
                      );
                    });
                  })
                : poLineList.map((product, subIndex) => {
                    return (
                      <Product
                        style={{
                          height: document.getElementById(`${subIndex}${poNum}`)?.offsetHeight,
                        }}
                        currencySymbol={item?.currencySymbol || poLineList[0].currencySymbol || ''}
                        currentStatus={currentStatus}
                        product={product}
                        index={index}
                        subIndex={subIndex}
                        platformCode={product.platformCode}
                      />
                    );
                  })}
            </ul>
          </div>
          <ul className="product-info-right">
            <li
              className="product-info-receiver"
              style={
                !['WAITING_RECEIVE'].includes(currentStatus) ||
                (['WAITING_RECEIVE'].includes(currentStatus) &&
                  hideFieldList &&
                  hideFieldList.includes('ACCEPTANCE'))
                  ? { width: 130 }
                  : {}
              }
            >
              {user(poLineList[0])}
            </li>
            {currentStatus === '' ? (
              allPriceInfo
            ) : (
              <li style={!['WAITING_RECEIVE'].includes(currentStatus) ? { width: 145 } : {}}>
                {isEC
                  ? Object.keys(subList).map((poSubNum) => {
                      return subList[poSubNum].map((product, i) => {
                        return (
                          <li
                            className="product-price line"
                            style={{
                              height: `${(1 / poLineList.length) * 100}%`,
                              borderBottom:
                                poLineList.length > 1 && i < poLineList.length - 1
                                  ? '1px solid #eaeaea'
                                  : 'none',
                            }}
                          >
                            {priceInfo(product)}
                          </li>
                        );
                      });
                    })
                  : poLineList.map((product, i) => {
                      return (
                        <li
                          className="product-price line"
                          style={{
                            height: `${(1 / poLineList.length) * 100}%`,
                            borderBottom:
                              poLineList.length > 1 && i < poLineList.length - 1
                                ? '1px solid #eaeaea'
                                : 'none',
                          }}
                        >
                          {priceInfo(product)}
                        </li>
                      );
                    })}
              </li>
            )}
            <li>
              {isEC
                ? Object.keys(subList).map((posub) => {
                    return subList[posub].map((product) => {
                      const { poSubNum, poSubHeaderId } = product;
                      const logisticsProps = {
                        poSubNum,
                        poSubHeaderId,
                        ecPlatformCode: platformCode,
                      };
                      return (
                        <li
                          className="product-info-status"
                          style={{ height: `${(1 / poLineList.length) * 100}%` }}
                        >
                          {CuxFn({
                            name: 'SubOrderLine-fn-productInfoStatus',
                            value: {
                              product,
                              logisticsProps,
                              hideFieldList,
                              hideMenuList,
                              toggleInvoiceModal,
                              setCurrentProduct,
                              status,
                            },
                          })(() => productInfoStatus(product, logisticsProps))()}
                        </li>
                      );
                    });
                  })
                : poLineList.map((product, pIndex) => {
                    const { poSubNum, poSubHeaderId } = product;
                    const logisticsProps = {
                      poSubNum,
                      poSubHeaderId,
                      ecPlatformCode: platformCode,
                    };
                    return (
                      <li
                        className="product-info-status"
                        style={{
                          height: document.getElementById(`${pIndex}${poNum}`)?.offsetHeight,
                        }}
                      >
                        {CuxFn({
                          name: 'SubOrderLine-fn-productInfoStatus',
                          value: {
                            product,
                            logisticsProps,
                            hideFieldList,
                            hideMenuList,
                            toggleInvoiceModal,
                            setCurrentProduct,
                            status,
                          },
                        })(() => productInfoStatus(product, logisticsProps))()}
                      </li>
                    );
                  })}
            </li>
            <li>
              {isEC
                ? Object.keys(subList).map((poSubNum) => {
                    // const p = subList[poSubNum]?.[0];
                    if (
                      subList[poSubNum].some(
                        (p) => !isEmpty(p.receiveList) || !isEmpty(p.freightReceiveList)
                      )
                    ) {
                      const product = subList[poSubNum].find(
                        (p) => !isEmpty(p.receiveList) || !isEmpty(p.freightReceiveList)
                      );
                      return (
                        <li
                          className="product-info-handle"
                          style={{
                            height: `${(subList[poSubNum]?.length / poLineList.length) * 100}%`,
                          }}
                        >
                          {statusInfo(product, subList[poSubNum])}
                        </li>
                      );
                    } else {
                      return subList[poSubNum].map((product) => {
                        return (
                          <li
                            className="product-info-handle"
                            style={{ height: `${(1 / poLineList.length) * 100}%` }}
                          >
                            {statusInfo(product)}
                          </li>
                        );
                      });
                    }
                  })
                : poLineList.map((product, pIndex) => {
                    return (
                      <li
                        id={`${pIndex}${poNum}`}
                        className="product-info-handle"
                        style={{ minHeight: 74 }}
                      >
                        {statusInfo(product)}
                      </li>
                    );
                  })}
            </li>
          </ul>
        </div>
        {invoiceVisible && (
          <InvoiceModal
            poNum={poNum}
            visible={invoiceVisible}
            toggleModal={toggleInvoiceModal}
            product={currentProduct}
          />
        )}
      </div>
    );
  };
  return <>{['WAITING_APPROVE'].includes(currentStatus) ? subOrderLine() : productLine()}</>;
}
