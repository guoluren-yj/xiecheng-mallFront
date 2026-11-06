/* eslint-disable no-param-reassign */
import React, { useState, useMemo, useEffect } from 'react';
import { isEmpty, isNil, isNumber } from 'lodash';
import { Input, Icon, Tooltip, Message } from 'choerodon-ui';
import { Attachment, DataSet, Select } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import classNames from 'classnames';
import { math } from 'choerodon-ui/dataset';
import { Observer } from 'mobx-react-lite';

import { SupplierComponent, SpanTitle } from 'utils/renderer';
import { accept } from 'utils/constants';
import { numberRender, getPrimaryColor, getUserConfigInfo, getOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import useRequest from '@/hooks/useRequest';
import cuxComponent from 'cuxTools/cuxComponent';
import { isUseOms } from 'services/cartService';
import styles from './index.less';
import CuxFn from '@/cuxTools/cuxFn';
import PrTypeLov from './PrTypeLov';
// eslint-disable-next-line import/no-cycle
import { HEADER_DETAIL_DOC, HEADER_DETAIL_ACEIPT, HEADER_DETAIL_PRICE } from '../Order';

function PurchaseHeaderDetail({
  shoppingCartDTOList,
  order,
  orderIndex,
  orderData: allOrderData,
  setOrderData,
  unitConfig,
  code,
  customizeDisplay,
}) {
  // 判断新老链路
  const [isOMS, setIsOMS] = useState(undefined);
  useEffect(() => {
    isUseOms().then((res) => setIsOMS(res));
  }, []);
  const {
    custWebConfig: { purchasFileSize = 100 },
  } = getUserConfigInfo();
  const { resData: deliveryMethodList } = useRequest({
    url: `/hpfm/v1/${getOrganizationId()}/lovs/value`,
    query: { lovCode: 'SMCT_PRE_DELIVERY_METHOD' },
  });

  const headerInfoDS = useMemo(() => new DataSet({ data: [order] }), []);

  const [prTypeVisible, setPrTypeVisible] = useState(false);
  const [remarkVisible, setRemarkVisible] = useState(false);
  const [wholeOrderFlagVisible, setWholeOrderFlagVisible] = useState(false);
  const [wholeOrderFlagConfig, setWholeOrderFlagConfig] = useState({});
  // const [modalType, setModalType] = useState(false);
  const [remarkConfig, setRemarkConfig] = useState({});
  const [prTypeConfig, setPrTypeConfig] = useState({});
  const [ouConfig, setOuConfig] = useState({});
  const [invOrganizationConfig, setInvOrganizationConfig] = useState({});
  const [purchaseOrgConfig, setPurchaseOrgConfig] = useState({});
  const imageUuid = useMemo(() => uuid(), []);
  const outerImageUuid = useMemo(() => uuid(), []);

  useEffect(() => {
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].attachmentUuid = imageUuid;
      newOrderData[orderIndex].outerAttachmentUuid = outerImageUuid;
      return newOrderData;
    });
  }, []);

  function getDefaultValueConfig(config) {
    if (isEmpty(config)) return {};
    if (!isEmpty(config.defaultValueConDTO)) {
      const { conValidList = [], conLineList = [] } = config.defaultValueConDTO;
      const newConLineList = conLineList?.map((c) => {
        let flag;
        const value = order[c.sourceFieldCode] || order.shoppingCartDTOList[0][c.sourceFieldCode];
        if (c.conExpression === '!=') {
          flag = c.targetValue !== value;
        } else if (c.conExpression === '=') {
          flag = c.targetValue === value;
        }
        return { ...c, flag };
      });
      conValidList.forEach((f) => {
        let newConExpression = f.conExpression;
        newConLineList.forEach((p) => {
          newConExpression = newConExpression?.replace(p.conCode, p.flag || false);
        });
        newConExpression = newConExpression.replace(/AND/g, '&&').replace(/OR/g, '||');
        let validateFlag;
        try {
          // eslint-disable-next-line no-eval
          validateFlag = eval(newConExpression);
        } catch (e) {
          validateFlag = false;
        }
        if (validateFlag) {
          config.defaultValueMetadata = {
            value: f.value,
            valueMeaning: f.valueMeaning,
          };
        }
      });
    }
    return config;
  }

  useEffect(() => {
    const fields = unitConfig?.[code]?.fields || [];
    if (!isEmpty(fields)) {
      const newWholeOrderFlagConfig =
        unitConfig?.[HEADER_DETAIL_DOC]?.fields?.find((p) => p.fieldCode === 'wholeOrderFlag') ||
        {};
      const config = getDefaultValueConfig(fields.find((f) => f.fieldCode === 'remark')) || {};
      const prconfig = getDefaultValueConfig(fields.find((f) => f.fieldCode === 'prTypeId') || {});
      const invOrganizationLov = fields.find((f) => f.fieldCode === 'invOrganizationLov') || {};
      const ouLov = fields.find((f) => f.fieldCode === 'ouLov') || {};
      const purchaseOrgLov = fields.find((f) => f.fieldCode === 'purchaseOrgLov') || {};
      setWholeOrderFlagConfig(newWholeOrderFlagConfig);
      setRemarkConfig(config);
      setPrTypeConfig(prconfig);
      setOuConfig(ouLov);
      setInvOrganizationConfig(invOrganizationLov);
      setPurchaseOrgConfig(purchaseOrgLov);
      setOrderData((data) => {
        data.forEach((o, i) => {
          if (i === orderIndex) {
            o.remark = o.remark || config.defaultValueMetadata?.value || config.defaultValue;
            o.remarkFieldName = config.fieldName;
            o.wholeOrderFlagFieldName =
              newWholeOrderFlagConfig.fieldName ||
              intl.get(`mallf.common.model.wholeOrder`).d('整单发货');
            o.wholeOrderFlagRequired = newWholeOrderFlagConfig.required === 1 ? 1 : 0;
            o.remarkRequired = config.required === 1 ? 1 : 0;
            o.prTypeIdRequired = prconfig.required === 1 ? 1 : 0;
            o.prTypeCode =
              o.shoppingCartDTOList?.[0]?.prTypeCode || prconfig.defaultValueMetadata?.prTypeCode;
            o.prTypeId =
              o.shoppingCartDTOList?.[0]?.prTypeId ||
              prconfig.defaultValueMetadata?.prTypeId ||
              prconfig.defaultValueMetadata?.value;
            o.prTypeName =
              o.shoppingCartDTOList?.[0]?.prTypeName ||
              prconfig.defaultValueMetadata?.prTypeName ||
              prconfig.defaultValueMetadata?.valueMeaning;
            o.wholeOrderFlag = headerInfoDS.current
              ?.getField('wholeOrderFlag')
              ?.get('defaultValue');
          }
        });
        return data;
      });
    }
  }, [unitConfig]);

  useEffect(() => {
    if (order.DS) {
      order.DS.current.set('prTypeCode', order.prTypeCode);
      order.DS.current.set('prTypeId', order.prTypeId);
      order.DS.current.set('prTypeName', order.prTypeName);
    }
  }, [order.DS]);

  const attachmentRender = CuxFn({
    name: 'BeforeCompanyOrder-fn-attachmentRender',
    value: { imageUuid },
  })(() => (
    <Attachment
      labelLayout="float"
      showHistory
      viewMode="popup"
      value={imageUuid}
      bucketName="private-bucket"
      bucketDirectory="mall-front"
      onChange={(e) => e}
      sortable
      funcType="link"
      accept={accept}
      help={intl
        .get('mallf.common.view.attProps.help', { accept, maxSize: `${purchasFileSize}M` })
        .d(`支持${accept}格式，且不能大于${`${purchasFileSize}M`}`)}
      fileSize={1024 * 1024 * purchasFileSize}
    />
  ));

  const headFirstGridAddRow = CuxFn({ name: 'BeforeCompanyOrder-fn-headFirstGridAddRow' })(() => (
    <></>
  ));

  return (
    <>
      <div className={styles['order-detail-info']}>
        <div className="detail-info-grid">
          <div className="grid-title">
            {intl.get('mallf.companyOrder.model.companyOrder.receiveInfo').d('收货信息')}
          </div>
          {customizeDisplay(
            { dataSet: headerInfoDS, code: HEADER_DETAIL_ACEIPT },
            <>
              <div className="grid-row" data-field="receiveName">
                <span className="grid-tag">
                  {intl.get(`mallf.companyOrder.model.companyOrder.receiveName`).d('收货人')}:
                </span>
                <span className="grid-content">{shoppingCartDTOList[0].contactName}</span>
              </div>
              <div className="grid-row" data-field="receiveAddress">
                <span
                  className="grid-tag"
                  title={intl
                    .get(`mallf.companyOrder.model.companyOrder.receiveAddress`)
                    .d('收货地址')}
                >
                  {intl.get(`mallf.companyOrder.model.companyOrder.receiveAddress`).d('收货地址')}:
                </span>
                <span className="grid-content address-content" title={order.address}>
                  {order.address}
                </span>
              </div>
              <div className="grid-row" data-field="concatWay">
                <span
                  className="grid-tag"
                  title={intl.get(`mallf.companyOrder.model.companyOrder.contacWay`).d('联系方式')}
                >
                  {intl.get(`mallf.companyOrder.model.companyOrder.contacWay`).d('联系方式')}:
                </span>
                <span className="grid-content">
                  <Tooltip
                    title={
                      <>
                        <Icon
                          type="phone_iphone"
                          style={{ fontSize: '14px', margin: '-3px 5px 0 0' }}
                        />
                        {intl.get(`mallf.common.view.phone`).d('手机')}
                      </>
                    }
                  >
                    <p style={{ marginBottom: '5px', width: 'max-content' }}>
                      {shoppingCartDTOList[0].contactMobile}
                    </p>
                  </Tooltip>
                  <Tooltip
                    title={
                      <>
                        <Icon type="phone" style={{ fontSize: '14px', margin: '-3px 5px 0 0' }} />
                        {intl.get(`mallf.common.view.fixedPhone`).d('固定电话')}
                      </>
                    }
                  >
                    {order.receiverPhone}
                  </Tooltip>
                </span>
              </div>
              <div className="grid-row" data-field="cuxAddRow">
                {headFirstGridAddRow()}
              </div>
            </>
          )}
        </div>
        <div className="detail-info-grid">
          <div className="grid-title">
            {intl.get('mallf.companyOrder.model.companyOrder.purOrgInfo').d('采购组织信息')}
          </div>
          <SupplierComponent>
            <div className="grid-row">
              <span className="grid-tag">
                {intl.get(`mallf.companyOrder.model.companyOrder.supplier`).d('供应商')}:
              </span>
              <span className="grid-content">{order.showSupplierName}</span>
            </div>
          </SupplierComponent>
          <div r-if={purchaseOrgConfig.visible !== 0} className="grid-row">
            <span
              className="grid-tag"
              title={
                purchaseOrgConfig.fieldName ||
                intl.get(`mallf.companyOrder.model.companyOrder.purchaseOrg`).d('采购组织')
              }
            >
              {purchaseOrgConfig.fieldName ||
                intl.get(`mallf.companyOrder.model.companyOrder.purchaseOrg`).d('采购组织')}
              :
            </span>
            <span className="grid-content">{order.purOrganizationName}</span>
          </div>
          <div r-if={ouConfig.visible !== 0} className="grid-row">
            <span
              className="grid-tag"
              title={
                ouConfig.fieldName ||
                intl.get(`mallf.companyOrder.model.companyOrder.businessEntity`).d('业务实体')
              }
            >
              {ouConfig.fieldName ||
                intl.get(`mallf.companyOrder.model.companyOrder.businessEntity`).d('业务实体')}
              :
            </span>
            <span className="grid-content">{order.ouName}</span>
          </div>
          <div r-if={invOrganizationConfig.visible !== 0} className="grid-row">
            <span
              className="grid-tag"
              title={
                invOrganizationConfig.fieldName ||
                intl.get(`mallf.companyOrder.model.inventoryOrg`).d('库存组织')
              }
            >
              {invOrganizationConfig.fieldName ||
                intl.get(`mallf.companyOrder.model.inventoryOrg`).d('库存组织')}
              :
            </span>
            <span className="grid-content">{order.organizationName}</span>
          </div>
        </div>
        <div className="detail-info-grid">
          <div className="grid-title">
            {intl.get('mallf.companyOrder.model.companyOrder.productTotal').d('商品合计')}
          </div>
          {customizeDisplay(
            { dataSet: headerInfoDS, code: HEADER_DETAIL_PRICE },
            <>
              <div className="grid-row" data-field="quantity">
                <span className="grid-tag">
                  {intl.get(`mallf.companyOrder.model.companyOrder.productPiece`).d('商品件数')}:
                </span>
                <span className="grid-content">{order.count}</span>
              </div>
              <div className="grid-row" data-field="exMoney">
                <span className="grid-tag">
                  {intl.get(`mallf.common.model.exMoney`).d('附加费(含税)')}:
                </span>
                <span className="grid-content">
                  <SpanTitle
                    className="text-overflow"
                    style={{ display: 'inline-block', maxWidth: 165 }}
                  >
                    {shoppingCartDTOList[0]?.currencySymbol}
                    {numberRender(
                      math.plus(order.freight, order.installPrice),
                      shoppingCartDTOList[0]?.financialPrecision,
                      true
                    )}
                  </SpanTitle>
                  {
                    <Tooltip
                      title={
                        <>
                          <p style={{ marginBottom: 5 }}>
                            {intl
                              .get(`mallf.companyOrder.model.companyOrder.freight`)
                              .d('运费(含税)')}
                            :{shoppingCartDTOList[0]?.currencySymbol}
                            {numberRender(
                              order.freight,
                              shoppingCartDTOList[0]?.financialPrecision,
                              true
                            )}
                          </p>
                          <p
                            r-if={order.installPrice && !String(order.installPrice)?.includes('*')}
                          >
                            {intl.get(`mallf.common.model..anzhuang`).d('安装费(含税)')}:
                            {shoppingCartDTOList[0]?.currencySymbol}
                            {numberRender(
                              order.installPrice,
                              shoppingCartDTOList[0]?.financialPrecision,
                              true
                            )}
                          </p>
                        </>
                      }
                    >
                      <Icon
                        type="help"
                        style={{
                          fontSize: 14,
                          marginLeft: 6,
                          marginTop: -12,
                          color: 'rgba(0,0,0,0.50)',
                        }}
                      />
                    </Tooltip>
                  }
                </span>
              </div>
              <div className="grid-row" data-field="prductTotal">
                <span className="grid-tag">
                  {intl
                    .get(`mallf.companyOrder.model.companyOrder.prductTotal`)
                    .d('商品金额(含税)')}
                  :
                </span>
                <span className="grid-content">
                  <SpanTitle
                    className="text-overflow"
                    style={{ display: 'inline-block', width: 180 }}
                  >
                    {shoppingCartDTOList[0]?.currencySymbol}
                    {numberRender(
                      order.totalProductPrice,
                      shoppingCartDTOList[0]?.financialPrecision,
                      true
                    )}
                  </SpanTitle>
                </span>
              </div>
              <div className="grid-row" data-field="applyTotal">
                <span className="grid-tag">
                  {intl.get(`mallf.companyOrder.model.companyOrder.applyTotal`).d('申请总额(含税)')}
                  :
                </span>
                <span className="grid-content">
                  <SpanTitle
                    className="text-overflow"
                    style={{ display: 'inline-block', width: 180 }}
                  >
                    {shoppingCartDTOList[0]?.currencySymbol}
                    {numberRender(order.price, shoppingCartDTOList[0]?.financialPrecision, true)}
                  </SpanTitle>
                </span>
              </div>
            </>
          )}
        </div>
        <div className="detail-info-grid">
          <div className="grid-title">{intl.get('mallf.common.model.docInfo').d('单据信息')} </div>
          {customizeDisplay(
            {
              code: HEADER_DETAIL_DOC,
              dataSet: headerInfoDS,
              missFields: ['prType', 'remarkInput'],
            },
            <>
              <div
                r-if={prTypeConfig.visible !== undefined && prTypeConfig.visible !== 0}
                className="grid-row"
                data-field="prType"
              >
                <span
                  className={classNames(['grid-tag', { require: prTypeConfig.required === 1 }])}
                  title={
                    prTypeConfig.fieldName || intl.get(`mallf.common.view.prType`).d('采购申请类型')
                  }
                >
                  {prTypeConfig.fieldName || intl.get(`mallf.common.view.prType`).d('采购申请类型')}
                  :
                </span>
                <span className="grid-content text-overflow" title={order.prTypeName}>
                  <PrTypeLov
                    prTypeConfig={{
                      ...prTypeConfig,
                      label:
                        prTypeConfig.fieldName ||
                        intl.get(`mallf.common.view.prType`).d('采购申请类型'),
                    }}
                    prTypeVisible={prTypeVisible}
                    order={order}
                    setPrTypeVisible={setPrTypeVisible}
                    setOrderData={setOrderData}
                    orderIndex={orderIndex}
                    setRemarkVisible={setRemarkVisible}
                  />
                </span>
              </div>
              <div
                r-if={remarkConfig.visible !== undefined && remarkConfig.visible !== 0}
                className="grid-row"
                data-field="remarkInput"
              >
                <span
                  className={classNames(['grid-tag', { require: remarkConfig.required === 1 }])}
                >
                  {remarkConfig.fieldName || intl.get(`mallf.common.model.remark`).d('备注')}:
                </span>
                <span className="grid-content text-overflow" title={order.remark}>
                  {remarkVisible ? (
                    <Input
                      style={{ height: 28 }}
                      required
                      value={order.remark}
                      autoFocus
                      onBlur={(e) => {
                        let { value } = e.target;
                        if (
                          isNumber(remarkConfig.textMaxLength) &&
                          value.length > remarkConfig.textMaxLength
                        ) {
                          value = value.slice(0, remarkConfig.textMaxLength);
                        }
                        setOrderData((orderData) => {
                          const newOrderData = [...orderData];
                          newOrderData[orderIndex].remark = value;
                          if (!newOrderData[orderIndex].DS) return newOrderData;
                          newOrderData[orderIndex].DS.current.set('remark', value);
                          return newOrderData;
                        });
                        setRemarkVisible(false);
                      }}
                      onChange={(e) => {
                        const { value } = e.target;
                        setOrderData((orderData) => {
                          const newOrderData = [...orderData];
                          newOrderData[orderIndex].remark = value;
                          if (!newOrderData[orderIndex].DS) return newOrderData;
                          newOrderData[orderIndex].DS.current.set('remark', value);
                          return newOrderData;
                        });
                      }}
                    />
                  ) : (
                    <span
                      style={{ display: 'inline-block', maxWidth: 140, verticalAlign: 'middle' }}
                      className="text-overflow"
                    >
                      {order.remark || '-'}
                    </span>
                  )}
                  <Icon
                    style={{ color: getPrimaryColor(), fontSize: 14, marginLeft: 10 }}
                    type="mode_edit"
                    onClick={() => {
                      setPrTypeVisible(false);
                      setRemarkVisible(true);
                    }}
                  />
                  {/* 多单才展示同步 */}
                  {allOrderData.length > 1 && (
                    <Tooltip
                      title={intl.get('mallf.common.view.syncAllOrderLine').d('同步至所有订单行')}
                    >
                      <Icon
                        style={{
                          color: getPrimaryColor(),
                          fontSize: 14,
                          fontWeight: 'bold',
                          marginLeft: 8,
                        }}
                        type="sync"
                        onClick={() => {
                          setOrderData((orderData) => {
                            return [...orderData].map((data) => {
                              data.remark = order.remark;
                              if (data.DS) {
                                data.DS.current.set('remark', order.remark);
                              }
                              return data;
                            });
                          });
                          Message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
                        }}
                      />
                    </Tooltip>
                  )}
                </span>
              </div>
              {/* 老购物车 走 新链路时 原先的附件作为内部附件   */}
              <div className="grid-row flex-end-item" data-field="attachmentCom">
                <span
                  className="grid-tag primary-hover-color"
                  title={intl.get('mallf.common.view.innerAttachment').d('内部附件')}
                >
                  {intl.get('mallf.common.view.innerAttachment').d('内部附件')}
                </span>
                <span className="grid-content">{attachmentRender()}</span>
              </div>
              <div
                // 仅新链路时可以查看
                r-if={isOMS}
                className="grid-row flex-end-item"
                data-field="outerAttachmentCom"
              >
                <span
                  className="grid-tag primary-hover-color"
                  title={intl.get('mallf.common.view.outterAttachment').d('外部附件')}
                >
                  {intl.get('mallf.common.view.outterAttachment').d('外部附件')}
                </span>
                <span className="grid-content">
                  <Attachment
                    labelLayout="float"
                    showHistory
                    viewMode="popup"
                    value={outerImageUuid}
                    bucketName="private-bucket"
                    bucketDirectory="mall-front"
                    onChange={(e) => e}
                    sortable
                    funcType="link"
                    accept={accept}
                    help={intl
                      .get('mallf.common.view.attProps.help', {
                        accept,
                        maxSize: `${purchasFileSize}M`,
                      })
                      .d(`支持${accept}格式，且不能大于${`${purchasFileSize}M`}`)}
                    fileSize={1024 * 1024 * purchasFileSize}
                  />
                </span>
              </div>
              <div className="grid-row" data-field="wholeOrderFlag">
                <span
                  className={classNames([
                    'grid-tag',
                    { require: wholeOrderFlagConfig.required === 1 },
                  ])}
                >
                  {intl.get(`mallf.common.model.wholeOrder`).d('整单发货')}:
                </span>
                <span className="grid-content">
                  {wholeOrderFlagVisible ? (
                    <Select
                      style={{ height: 28 }}
                      required={wholeOrderFlagConfig.required === 1}
                      value={order.wholeOrderFlag}
                      autoFocus
                      onBlur={() => setWholeOrderFlagVisible(false)}
                      onChange={(val) => {
                        setOrderData((orderData) => {
                          const newOrderData = [...orderData];
                          newOrderData[orderIndex].wholeOrderFlag = val;
                          return newOrderData;
                        });
                      }}
                    >
                      {deliveryMethodList?.map((p) => {
                        return <Select.Option value={p.value}>{p.meaning}</Select.Option>;
                      })}
                    </Select>
                  ) : (
                    <>
                      {!isNil(order.wholeOrderFlag) &&
                        deliveryMethodList?.find((p) => p.value === order.wholeOrderFlag)?.meaning}
                    </>
                  )}
                  <Observer>
                    {() => {
                      const editable = !headerInfoDS.current
                        ?.getField('wholeOrderFlag')
                        ?.get('disabled');
                      return (
                        <span>
                          <Icon
                            r-if={!wholeOrderFlagVisible && editable}
                            style={{ color: getPrimaryColor(), fontSize: 14, marginLeft: 10 }}
                            type="mode_edit"
                            onClick={() => {
                              setPrTypeVisible(false);
                              setRemarkVisible(false);
                              setWholeOrderFlagVisible(true);
                            }}
                          />
                        </span>
                      );
                    }}
                  </Observer>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default cuxComponent({ path: 'BeforeCompanyOrder/PurchaseHeaderDetail' })(
  PurchaseHeaderDetail
);
