import React, { useEffect, useState } from 'react';
import { Modal, Form, message, Popover, Input, Icon, Tooltip } from 'choerodon-ui';
import { NumberField, Attachment, Button, Modal as C7nModal, DataSet } from 'choerodon-ui/pro';
import { Spin, Icon as HIcon } from 'hzero-ui';
import moment from 'moment';
import { convertImg, getToFixed, getPrecision, getOrganizationId } from 'utils/utils';
import uuid from 'uuid/v4';

import { SupplierComponent } from 'utils/renderer';
import intl from 'utils/intl';
import Link from 'components/Link';
import Image from 'components/Image';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { fetchomsProductAccept, receiveomsPreviewConfirm } from 'services/productAcceptService';
import image from 'mall-front/lib/assets/images/shougongshenqing-product.png';
import styles from './index.less';

import Invoice from './Invoice';

const { Sidebar } = Modal;
const { TextArea } = Input;

function AcceptModal(props) {
  const { acceptVisible, setState, acceptType = '', asnLineIds, fetchOrderData } = props;

  const [acceptData, setAcceptData] = useState([]);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    setSpinning(true);
    fetchomsProductAccept(asnLineIds)
      .then((res) => {
        if (res) {
          const newRes = res
            .map((product, index) => ({
              ...product,
              thisTimeReceiveQuantity: product.waitingReceiveQuantity,
              trxLineNum: index + 1,
              checked: true,
              attachmentUuid: product.attachmentUuid || uuid(),
            }))
            .filter((p) => p.waitingReceiveQuantity !== 0);
          setAcceptData(newRes);
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  // 图片地址处理
  function HandleImgUrl(code, url) {
    return code === 'CATA' ? url : convertImg(url, 1, code);
  }

  function handleReceiveChange(val, product) {
    const { uomPrecision } = product;
    const newAcceptData = acceptData.map((item) => {
      const newItem = item;
      if (item.consignmentEntryId === product.consignmentEntryId) {
        newItem.thisTimeReceiveQuantity = getToFixed(val, uomPrecision);
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
    const receiptEntryList = acceptData
      .filter((n) => n.checked)
      .map((p) => {
        return {
          waitingReceiveQuantity: p.waitingReceiveQuantity,
          freightFlag: p.freightFlag,
          cecConsignmentCode: p.srmConsignmentCode,
          consignmentLineNum: p.consignmentLineNum,
          consignmentCode: p.consignmentCode,
          remark: p.remark,
          quantity: p.thisTimeReceiveQuantity,
          attachmentUuid: p.attachmentUuid,
          attributeVarchar5: p.invoiceUser?.employeeNum,
          attributeVarchar6: p.invoiceAddress,
        };
      });
    if (receiptEntryList.some((p) => !p.attributeVarchar6 || !p.attributeVarchar5)) {
      return;
    }
    if (receiptEntryList.some((p) => p.quantity > p.waitingReceiveQuantity || p.quantity <= 0)) {
      return;
    }
    const params = {
      receiptTime: moment().format(DEFAULT_DATETIME_FORMAT),
      receiptEntryList,
    };
    setSpinning(true);
    receiveomsPreviewConfirm(params)
      .then((res) => {
        if (res) {
          message.destroy();
          message.config({
            top: 100,
            bottom: 100,
            duration: 2.5,
          });
          message.success(
            intl.get('mallf.myOrder.order.goods.success').d('收货成功'),
            undefined,
            undefined,
            'top'
          );
          setState({ acceptVisible: false });
          fetchOrderData();
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }

  async function handleSave({ index, batch, formDs, modal }) {
    const flag = await formDs.validate();
    if (flag) {
      const newData = JSON.parse(JSON.stringify(acceptData));
      const formData = formDs.current.toData();
      if (batch) {
        newData.forEach((_, i) => {
          newData[i].invoiceUser = formData.invoiceUser;
          newData[i].invoiceAddress = formData.invoiceAddress;
          newData[i].invoiceflag = true;
        });
      } else {
        newData[index].invoiceUser = formData.invoiceUser;
        newData[index].invoiceAddress = formData.invoiceAddress;
        newData[index].invoiceflag = true;
      }
      setAcceptData(newData);
      modal.close();
    }
    return flag;
  }

  function openInvoice(product, index) {
    const formDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'invoiceUser',
          label: '发票接收人',
          type: 'object',
          lovCode: 'HPFM.EMPLOYEE',
          required: true,
          lovPara: {
            tenantId: getOrganizationId(),
          },
        },
        {
          name: 'invoiceAddress',
          label: '发票接收地址',
          required: true,
        },
      ],
    });
    formDs.current.set({
      invoiceUser: product.invoiceUser,
      invoiceAddress: product.invoiceAddress,
    });
    const modal = C7nModal.open({
      title: '发票接收信息',
      drawer: true,
      closable: true,
      style: {
        width: 380,
      },
      onOk: () => {
        return handleSave({ index, batch: false, formDs, modal });
      },
      children: <Invoice productName={product.skuName} dataSet={formDs} />,
      footer: (okBtn, cancelBtn) => (
        <>
          {okBtn}
          <Button
            r-if={acceptData?.length > 1}
            onClick={() => {
              handleSave({ index, batch: true, formDs, modal });
            }}
          >
            批量保存
          </Button>
          {cancelBtn}
        </>
      ),
    });
  }

  return (
    <Sidebar
      title={intl.get('mallf.myOrder.view.catalog.accept').d('接收')}
      className={styles['accept-modal']}
      visible={acceptVisible}
      onOk={handleOk}
      onCancel={() => setState({ acceptVisible: false })}
      cancelText={intl.get('hzero.common.status.cancel').d('取消')}
      okText={intl.get('mallf.myOrder.view.sureEccept.product').d('确定收货')}
      // width={acceptType === 'batch' ? 1090 : 742}
      width={1190}
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
              {/* <div className="accept-displayPoNum">
                {intl.get('mallf.myOrder.view.orderNum').d('订单编码')}
              </div> */}
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
          <div className="accept-remark">{intl.get('hzero.common.button.remark').d('备注')}</div>
          <div className="accept-attachment">
            {intl.get(`mallf.common.view.operation`).d('操作')}
          </div>
        </div>
        <Spin spinning={spinning}>
          <div className="accept-list">
            {(acceptData.filter((n) => n.skuId || n.skuName) || []).map((product, index) => {
              const isMANUAL = product.cecFromCode === 'MANUAL';
              const { uomPrecision } = product;
              const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
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
                      <div className="accept-asnNum">{product.srmConsignmentCode}</div>
                      {/* <div className="accept-displayPoNum">{product.displayPoNum}</div> */}
                    </>
                  )}
                  <div className="accept-info">
                    <Link
                      disabled={isMANUAL || !!product.qtHeaderNo}
                      to={`/product-detail?productId=${product.skuId}&sourceFrom=${product.cecFromCode}`}
                    >
                      <Image
                        value={
                          isMANUAL ? image : HandleImgUrl(product.cecFromCode, product.primaryUrl)
                        }
                        width={40}
                        height={40}
                      />
                    </Link>
                    {acceptType === 'batch' ? (
                      <div className="product-name">
                        <Link
                          disabled={isMANUAL || !!product.qtHeaderNo}
                          className="product-name-label"
                          to={`/product-detail?productId=${product.skuId}&sourceFrom=${product.cecFromCode}`}
                        >
                          {product.skuName}
                        </Link>
                        {product.cecOrderCode && (
                          <span className="product-name-po">{product.cecOrderCode}</span>
                        )}
                        <p r-if={!product.invoiceflag} className="accept-info-invoice-warning">
                          <HIcon type="exclamation-circle" />
                          请填写发票地址信息
                        </p>
                      </div>
                    ) : (
                      <div className="product-name-one">
                        <Link
                          disabled={isMANUAL}
                          className="product-name-label"
                          to={`/product-detail?productId=${product.skuId}&sourceFrom=${product.cecFromCode}`}
                        >
                          {product.skuName}
                        </Link>
                        <p r-if={!product.invoiceflag} className="accept-info-invoice-warning">
                          <HIcon type="exclamation-circle" />
                          请填写发票地址信息
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="accept-ship-num">{product.sentQuantity}</div>
                  {acceptType === 'batch' && (
                    <div className="accept-can-num">{product.receiveQuantity}</div>
                  )}
                  <div className="accept-can-num">{product.waitingReceiveQuantity}</div>
                  <div className="accept-this-num">
                    {product.cecFromCode !== 'CATA' && !isMANUAL ? (
                      product.waitingReceiveQuantity
                    ) : (
                      <NumberField
                        className="accept-this-num-input"
                        min={defaultValue}
                        step={defaultValue}
                        max={product.waitingReceiveQuantity}
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
                      viewMode="popup"
                      funcType="link"
                      value={product.attachmentUuid}
                      bucketName="private-bucket"
                      bucketDirectory="mall-front"
                      onChange={(e) => e}
                    />
                    <div>
                      <Button
                        icon="mode_edit"
                        funcType="link"
                        color="primary"
                        onClick={() => openInvoice(product, index)}
                      >
                        发票信息 <span style={{ color: 'red' }}>*</span>
                      </Button>
                    </div>
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
