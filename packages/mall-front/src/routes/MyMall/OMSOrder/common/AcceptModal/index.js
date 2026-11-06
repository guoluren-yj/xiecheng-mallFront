import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  // notification,
  Popover,
  Input,
  Icon,
  Tooltip,
  // Upload,
  // Button,
  message,
} from 'choerodon-ui';
import { NumberField, Attachment } from 'choerodon-ui/pro';
import { Spin } from 'hzero-ui';
import * as Hmall from 'utils/utils';
import moment from 'moment';
import uuid from 'uuid/v4';

import { SupplierComponent } from 'utils/renderer';
import intl from 'utils/intl';
import Link from 'components/Link';
import Image from 'components/Image';
// import HmallConfig from 'utils/api-config';
import { fetchProductAccept, receivePreviewConfirm } from 'services/productAcceptService';
import styles from './index.less';

const { Sidebar } = Modal;
const { TextArea } = Input;

function AcceptModal(props) {
  const { acceptVisible, setState, asnLineIds, acceptType = '', fetchOrderData } = props;

  const [acceptData, setAcceptData] = useState([]);
  const [spinning, setSpinning] = useState(false);
  // const [allCheckFlag, setAllCheckFlag] = useState(true);

  useEffect(() => {
    setSpinning(true);
    fetchProductAccept(asnLineIds)
      .then((res) => {
        if (res) {
          const newRes = res.map((product, index) => ({
            ...product,
            thisTimeReceiveQuantity: product.canReceiveQuantity,
            trxLineNum: index + 1,
            checked: true,
            sinvLineAttachmentUuid: product.sinvLineAttachmentUuid || uuid(),
          }));
          setAcceptData(newRes);
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  // 图片地址处理
  function HandleImgUrl(code, url) {
    return code === 'CATA' ? url : Hmall.convertImg(url, 1, code);
  }

  function handleReceiveChange(val, product) {
    const { uomPrecision } = product;
    const newAcceptData = acceptData.map((item) => {
      const newItem = item;
      if (item.asnLineId === product.asnLineId) {
        newItem.thisTimeReceiveQuantity = Hmall.getToFixed(val, uomPrecision);
      }
      return newItem;
    });
    setAcceptData(newAcceptData);
  }

  function handleRemark(val, index) {
    const newData = JSON.parse(JSON.stringify(acceptData));
    newData[index].remark = val;
    setAcceptData(newData);
  }

  function handleOk() {
    let params = acceptData;
    if (acceptType === 'batch') {
      params = acceptData.filter((n) => n.checked);
    }
    if (
      params
        .filter((p) => !!p.product)
        .some(
          (p) => p.thisTimeReceiveQuantity > p.canReceiveQuantity || p.thisTimeReceiveQuantity <= 0
        )
    ) {
      return;
    }
    setSpinning(true);
    receivePreviewConfirm(params)
      .then((res) => {
        if (res) {
          // notification.success({
          //   message: intl.get('mallf.myOrder.order.goods.success').d('收货成功'),
          //   // placement: 'bottomLeft',
          //   className: styles['accept-success'],
          // });
          message.success(
            intl.get('mallf.myOrder.order.goods.success').d('收货成功'),
            undefined,
            undefined,
            top
          );
          setState({ acceptVisible: false });
          fetchOrderData();
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }

  return (
    <Sidebar
      title={intl.get('mallf.myOrder.view.catalog.accept').d('接收')}
      className={styles['accept-modal']}
      visible={acceptVisible}
      onOk={handleOk}
      onCancel={() => setState({ acceptVisible: false })}
      cancelText={intl.get('mallf.myOrder.status.cancel').d('取消')}
      okText={intl.get('mallf.myOrder.view.sureEccept.product').d('确定收货')}
      // width={acceptType === 'batch' ? 1090 : 742}
      width={1090}
      confirmLoading={spinning}
      closable
    >
      <div className={`accept-content ${acceptType === 'batch' ? 'accept-batch-content' : ''}`}>
        <div className="accept-header">
          {acceptType === 'batch' && (
            <>
              {/* <div className="accept-checkbox">
                <Checkbox
                  checked={allCheckFlag}
                  onChange={e => {
                    handleOnCheck(e.target.checked, 'all');
                  }}
                />
              </div> */}
              <div className="accept-asnNum">
                {intl.get('mallf.myOrder.view.delivery.noteNo').d('送货单号')}
              </div>
            </>
          )}
          <div className="accept-info">
            {intl.get(`mallf.myOrder.view.productInformation`).d('商品信息')}
          </div>
          <div className="accept-ship-num">
            {intl.get('mallf.myOrder.view.delivery.number').d('发货数量')}
          </div>
          {acceptType === 'batch' && (
            <div className="accept-can-num">
              {intl.get('mallf.myOrder.view.received.several').d('已接收数')}
            </div>
          )}
          <div className="accept-can-num">
            {intl.get('mallf.myOrder.view.residual.reception').d('剩余接收数')}
          </div>
          <div className="accept-this-num">
            {intl.get('mallf.myOrder.view.incoming.number').d('此次接收数')}
            <Tooltip
              title={intl.get('mallf.myOrder.warning.ECproduct.number').d('电商商品数量不可修改')}
              placement="top"
            >
              <Icon
                type="help"
                style={{ marginLeft: 3, marginTop: 1, color: 'rgba(0,0,0,0.50)', fontSize: 14 }}
              />
            </Tooltip>
          </div>
          {acceptType === 'batch' && (
            <>
              <div className="accept-creationDate">
                {intl.get('mallf.myOrder.view.orderoftime').d('下单时间')}
              </div>
              <SupplierComponent>
                <div className="accept-supCompanyName">
                  {intl.get('mallf.myOrder.view.supplier').d('供应商')}
                </div>
              </SupplierComponent>
            </>
          )}
          <div className="accept-remark">{intl.get('mallf.myOrder.button.remark').d('备注')}</div>
          <div className="accept-attachment">
            {intl.get('mallf.myOrder.view.common.annex').d('附件')}
          </div>
        </div>
        <Spin spinning={spinning}>
          <div className="accept-list">
            {(acceptData.filter((n) => n.productId) || []).map((product, index) => {
              const { uomPrecision } = product;
              const defaultValue = uomPrecision ? Hmall.getPrecision(uomPrecision) : 1;
              return (
                <div className="accept-list-line">
                  {acceptType === 'batch' && (
                    <>
                      {/* <div className="accept-checkbox">
                        <Checkbox
                          checked={!!product.checked}
                          onChange={e => {
                            handleOnCheck(e.target.checked, product, index);
                          }}
                        />
                      </div> */}
                      <div className="accept-asnNum">{product.asnNum}</div>
                      {/* <div className="accept-displayPoNum">{product.displayPoNum}</div> */}
                    </>
                  )}
                  <div className="accept-info">
                    <Link
                      disabled={!!product.qtHeaderNo}
                      to={`/product-detail?productId=${product.productId}&sourceFrom=${product.platformCode}`}
                    >
                      <Image
                        value={HandleImgUrl(product.platformCode, product.imagePath)}
                        width={40}
                        height={40}
                      />
                    </Link>
                    {acceptType === 'batch' ? (
                      <div className="product-name">
                        <Link
                          disabled={!!product.qtHeaderNo}
                          className="product-name-label"
                          to={`/product-detail?productId=${product.productId}&sourceFrom=${product.platformCode}`}
                        >
                          {product.productName}
                        </Link>
                        {product.displayPoNum && (
                          <span className="product-name-po">{product.displayPoNum}</span>
                        )}
                      </div>
                    ) : (
                      <div className="product-name-one">
                        <Link
                          className="product-name-label"
                          to={`/product-detail?productId=${product.productId}&sourceFrom=${product.platformCode}`}
                        >
                          {product.productName}
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="accept-ship-num">{product.shipQuantity}</div>
                  {acceptType === 'batch' && (
                    <div className="accept-can-num">{product.receiveQuantity}</div>
                  )}
                  <div className="accept-can-num">{product.canReceiveQuantity}</div>
                  <div className="accept-this-num">
                    {product.platformCode !== 'CATA' ? (
                      product.canReceiveQuantity
                    ) : (
                      <NumberField
                        className="accept-this-num-input"
                        min={defaultValue}
                        step={defaultValue}
                        max={product.canReceiveQuantity}
                        value={product.thisTimeReceiveQuantity}
                        onChange={(val) => handleReceiveChange(val, product)}
                      />
                    )}
                  </div>
                  {acceptType === 'batch' && (
                    <>
                      <div className="accept-creationDate">
                        {moment(product.creationDate).format('YYYY-MM-DD')}
                      </div>
                      <SupplierComponent>
                        <Popover content={product.supplierCompanyName}>
                          <div className="accept-supCompanyName">{product.supplierCompanyName}</div>
                        </Popover>
                      </SupplierComponent>
                    </>
                  )}
                  <div className="accept-remark">
                    <TextArea
                      onChange={(e) => handleRemark(e.target.value, index)}
                      rows={acceptType === 'batch' ? 2 : 1}
                    />
                  </div>
                  <div className="accept-attachment">
                    <Attachment
                      labelLayout="float"
                      showHistory
                      viewMode="popup"
                      funcType="link"
                      value={product.sinvLineAttachmentUuid}
                      bucketName="private-bucket"
                      bucketDirectory="mall-front"
                      onChange={(e) => e}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Spin>
      </div>
    </Sidebar>
  );
}

export default Form.create({ fieldNameProp: null })(AcceptModal);
