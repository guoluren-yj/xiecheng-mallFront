/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useState } from 'react';
import { isEmpty, isNil, isNumber } from 'lodash';
import { Input, Icon, Tooltip, Message } from 'choerodon-ui';
import { Attachment, DataSet, Select, Form } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import classNames from 'classnames';
import OverflowTip from 'components/OverflowTip';

import { SpanTitle } from 'utils/renderer';
import { accept } from 'utils/constants';
import { numberRender, getPrimaryColor, getUserConfigInfo, getCustVisible } from 'utils/utils';
import intl from 'utils/intl';
import useSetState from 'hooks/useState';
import { HEADER_DETAIL_DOC, HEADER_DETAIL_ACEIPT, HEADER_DETAIL_PRICE } from 'utils/customizeCode';
import { Observer } from 'mobx-react-lite';
import styles from './index.less';
import CuxFn from '@/cuxTools/cuxFn';
import PrTypeLov from './PrTypeLov';
import CuxWrapper from '@/cuxTools/CuxWrapper';

export default function PurchaseHeaderDetail({
  shoppingCartDTOList,
  order,
  orderIndex,
  orderData: allOrderData,
  setOrderData,
  unitConfig,
  code,
  isReceive,
  customizeDisplay,
  deliveryMethodList,
  preOrder, // 预采信息
}) {
  const {
    custWebConfig: { purchasFileSize = 100 },
  } = getUserConfigInfo();
  const headerInfoDS = useMemo(() => new DataSet({ data: [order] }), []);

  const [state, setState] = useSetState({
    prTypeVisible: false,
    remarkVisible: false,
    wholeOrderFlagVisible: false,
    wholeOrderFlagConfig: {},
    remarkConfig: {},
    prTypeConfig: {},
    companyConfig: {},
    ouConfig: {},
    invOrganizationConfig: {},
    purchaseOrgConfig: {},
  });
  const {
    wholeOrderFlagVisible,
    prTypeVisible,
    remarkVisible,
    remarkConfig,
    prTypeConfig,
    companyConfig,
    ouConfig,
    invOrganizationConfig,
    purchaseOrgConfig,
    wholeOrderFlagConfig,
  } = state;
  const [remarkInput, setRemarkInput] = useState(order.remark);
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
      const remarkconfig =
        getDefaultValueConfig(fields.find((f) => f.fieldCode === 'remark')) || {};
      const prconfig = getDefaultValueConfig(fields.find((f) => f.fieldCode === 'prTypeId') || {});
      const wholeOrderFlagconfig =
        unitConfig?.[HEADER_DETAIL_DOC]?.fields?.find((p) => p.fieldCode === 'wholeOrderFlag') ||
        {};
      // const attachmentConfig =
      //   unitConfig?.[HEADER_DETAIL_DOC]?.fields?.find((p) => p.fieldCode === 'attachmentCom') || {};
      setState({
        wholeOrderFlagConfig: wholeOrderFlagconfig || {}, // 整单发货配置 新加
        remarkConfig: remarkconfig,
        prTypeConfig: prconfig,
        companyConfig: fields.find((f) => f.fieldCode === 'companyLov') || {},
        ouConfig: fields.find((f) => f.fieldCode === 'ouLov') || {},
        invOrganizationConfig: fields.find((f) => f.fieldCode === 'invOrganizationLov') || {},
        purchaseOrgConfig: fields.find((f) => f.fieldCode === 'purchaseOrgLov') || {},
      });
      setOrderData((data) => {
        data.forEach((o, i) => {
          if (i === orderIndex) {
            o.remark =
              o.remark || remarkconfig.defaultValueMetadata?.value || remarkconfig.defaultValue;
            o.remarkFieldName =
              remarkconfig.fieldName ||
              intl.get('mallf.companyOrder.view.remark.info').d('备注信息');
            o.wholeOrderFlagFieldName =
              wholeOrderFlagconfig.fieldName ||
              intl.get(`mallf.common.model.wholeOrder`).d('整单发货');
            o.remarkRequired = remarkconfig.required === 1 ? 1 : 0;
            o.wholeOrderFlagRequired = wholeOrderFlagconfig.required === 1 ? 1 : 0;
            o.prTypeIdRequired = prconfig.required === 1 ? 1 : 0;
            o.prTypeCode = o?.prTypeCode || prconfig.defaultValueMetadata?.prTypeCode;
            o.prTypeId =
              o?.prTypeId ||
              prconfig.defaultValueMetadata?.prTypeId ||
              prconfig.defaultValueMetadata?.value;
            o.prTypeName =
              o?.prTypeName ||
              prconfig.defaultValueMetadata?.prTypeName ||
              prconfig.defaultValueMetadata?.valueMeaning;
            o.wholeOrderFlag = headerInfoDS.current
              ?.getField('wholeOrderFlag')
              ?.get('defaultValue');
            o.attachmentRequired = false; // TODO 有客户提再放开个性化
            o.outerAttachmentRequired = false; // TODO 有客户提再放开个性化
            CuxFn({
              name: 'BeforeCompanyOrder-fn-remarkRequireCux',
              value: {
                remarkconfig,
                order: o,
                attachmentUuidNotNull: preOrder?.orderExtraInfo?.attachmentUuidNotNull, // 附件必输
              },
            })();
          }
        });
        return data;
      });
    }
  }, [unitConfig]);

  useEffect(() => {
    if (order.DS) {
      // 不记得为什么写这个了
      order.DS.current.set('prTypeCode', order.prTypeCode);
      order.DS.current.set('prTypeId', order.prTypeId);
      order.DS.current.set('prTypeName', order.prTypeName);
      order.DS.addField('attachmentUuid', {
        required: order.attachmentRequired,
        type: 'attachment',
      });
      order.DS.addField('outerAttachmentUuid', {
        required: order.outerAttachmentRequired,
        type: 'attachment',
      });
      setRemarkInput(order.remark); // 用于上面个性化赋值后再次给当前备注状态赋值
    }
  }, [order.DS, order.attachmentRequired, order.outerAttachmentRequired]);

  // 个性化配置开关判断
  const custFlag = (flag) => flag !== undefined && flag !== 0;

  return (
    <>
      <div className={styles['order-detail-info']}>
        <div r-if={isReceive} className="detail-info-grid">
          <div className="grid-title">
            {intl.get('mallf.common.view.companyOrder.warehouseInfo').d('库房信息')}
          </div>
          <div className="grid-row">
            <span className="grid-tag">
              <OverflowTip>
                {intl.get(`mallf.common.view.companyOrder.warehouseName`).d('领用库房')}
              </OverflowTip>
              :
            </span>
            <span className="grid-content">{order.warehouseName}</span>
          </div>
          <div className="grid-row">
            <span className="grid-tag">
              <OverflowTip>
                {intl.get(`mallf.common.view.companyOrder.warehouseAddress`).d('库房地址')}
              </OverflowTip>
              :
            </span>
            <span className="grid-content address-content" title={order.warehouseAddress}>
              {order.warehouseAddress || '-'}
            </span>
          </div>
        </div>
        <div r-if={!isReceive} className="detail-info-grid">
          <div className="grid-title">
            {intl.get('mallf.myMall.model.companyOrder.receiveInfo').d('收货信息')}
          </div>
          {customizeDisplay(
            { dataSet: headerInfoDS, code: HEADER_DETAIL_ACEIPT },
            <>
              <div className="grid-row" data-field="receiveName">
                <span className="grid-tag">
                  {intl.get(`mallf.myMall.model.companyOrder.receiveName`).d('收货人')}:
                </span>
                <span className="grid-content">{order.address?.contactName}</span>
              </div>
              <div className="grid-row" data-field="receiveAddress">
                <span className="grid-tag">
                  <OverflowTip>
                    {intl.get(`mallf.myMall.model.companyOrder.receiveAddress`).d('收货地址')}
                  </OverflowTip>
                  :
                </span>
                <span className="grid-content address-content" title={order.address?.fullAddress}>
                  {order.address?.fullAddress}
                </span>
              </div>
              <div className="grid-row" data-field="concatWay">
                <span
                  className="grid-tag"
                  title={intl.get(`mallf.myMall.model.companyOrder.contacWay`).d('联系方式')}
                >
                  {intl.get(`mallf.myMall.model.companyOrder.contacWay`).d('联系方式')}:
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
                    <p style={{ marginBottom: '5px', width: 'max-content' }}>{order?.mobile}</p>
                  </Tooltip>
                  <Tooltip
                    title={
                      <>
                        <Icon type="phone" style={{ fontSize: '14px', margin: '-3px 5px 0 0' }} />
                        {intl.get(`mallf.common.view.fixedPhone`).d('固定电话')}
                      </>
                    }
                  >
                    {order.phone}
                  </Tooltip>
                </span>
              </div>
            </>
          )}
          <CuxWrapper
            path="PurchaseHeaderDetail/renderReceiveInfo"
            value={{
              shoppingCartDTOList,
              order,
              orderIndex,
              orderData: allOrderData,
              setOrderData,
              unitConfig,
              code,
              isReceive,
              customizeDisplay,
              deliveryMethodList,
              preOrder, // 预采信息
            }}
          />
        </div>
        <div
          className="detail-info-grid"
          r-if={getCustVisible(
            [companyConfig, ouConfig, invOrganizationConfig, purchaseOrgConfig],
            [
              { name: 'companyLov' },
              { name: 'ouLov', hidden: isReceive },
              { name: 'invOrganizationLov', hidden: isReceive },
              { name: 'purchaseOrgLov', hidden: isReceive },
            ]
          )}
        >
          <div className="grid-title">
            {intl.get(`mallf.common.view.newCart.tradeInformation`).d('交易组织信息')}
          </div>
          <div r-if={companyConfig.visible !== 0} className="grid-row">
            <span className="grid-tag">
              <OverflowTip>
                {companyConfig.fieldName ||
                  intl.get(`mallf.common.view.company.name`).d('公司名称')}
              </OverflowTip>
              :
            </span>
            <span className="grid-content text-overflow" title={order.companyName}>
              {order.companyName}
            </span>
          </div>
          <div r-if={purchaseOrgConfig.visible !== 0 && !isReceive} className="grid-row">
            <span className="grid-tag">
              <OverflowTip>
                {purchaseOrgConfig.fieldName ||
                  intl.get(`mallf.myMall.model.companyOrder.purchaseOrg`).d('采购组织')}
              </OverflowTip>
              :
            </span>
            <span className="grid-content text-overflow" title={order.purOrganizationName}>
              {order.purOrganizationName}
            </span>
          </div>
          <div r-if={ouConfig.visible !== 0 && !isReceive} className="grid-row">
            <span className="grid-tag">
              <OverflowTip>
                {ouConfig.fieldName ||
                  intl.get(`mallf.myMall.model.companyOrder.businessEntity`).d('业务实体')}
              </OverflowTip>
              :
            </span>
            <span className="grid-content text-overflow" title={order.ouName}>
              {order.ouName}
            </span>
          </div>
          <div r-if={invOrganizationConfig.visible !== 0 && !isReceive} className="grid-row">
            <span className="grid-tag">
              <OverflowTip>
                {invOrganizationConfig.fieldName ||
                  intl.get(`mallf.common.model.inventoryOrg`).d('库存组织')}
              </OverflowTip>
              :
            </span>
            <span className="grid-content text-overflow" title={order.invOrganizationName}>
              {order.invOrganizationName}
            </span>
          </div>
        </div>
        <div className="detail-info-grid">
          <div className="grid-title">
            {intl.get('mallf.myMall.model.companyOrder.productTotal').d('商品合计')}
          </div>
          {customizeDisplay(
            { dataSet: headerInfoDS, code: HEADER_DETAIL_PRICE },
            <>
              <div className="grid-row" data-field="quantity">
                <span className="grid-tag">
                  <OverflowTip>
                    {intl.get(`mallf.myMall.model.companyOrder.productPiece`).d('商品件数')}
                  </OverflowTip>
                  :
                </span>
                <span className="grid-content">{order.quantity}</span>
              </div>
              <div className="grid-row" data-field="exMoney">
                <span className="grid-tag">
                  <OverflowTip>
                    {intl.get(`mallf.common.model.exMoney`).d('附加费(含税)')}
                  </OverflowTip>
                  :
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
                  <OverflowTip>
                    {intl
                      .get(`mallf.companyOrder.model.companyOrder.prductTotal`)
                      .d('商品金额(含税)')}
                  </OverflowTip>
                  :
                </span>
                <span className="grid-content">
                  <SpanTitle>
                    {shoppingCartDTOList[0]?.currencySymbol}
                    {numberRender(
                      order.taxIncludedAmount,
                      shoppingCartDTOList[0]?.financialPrecision,
                      true
                    )}
                  </SpanTitle>
                </span>
              </div>
              <div className="grid-row" data-field="applyTotal">
                <span className="grid-tag">
                  <OverflowTip>
                    {intl
                      .get(`mallf.companyOrder.model.companyOrder.applyTotal`)
                      .d('申请总额(含税)')}
                  </OverflowTip>
                  :
                </span>
                <span className="grid-content">
                  <SpanTitle>
                    {shoppingCartDTOList[0]?.currencySymbol}
                    {numberRender(
                      order.totalTaxIncludedAmount,
                      shoppingCartDTOList[0]?.financialPrecision,
                      true
                    )}
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
                data-field="prType"
                className="grid-row"
              >
                <span
                  className={classNames(['grid-tag', { require: prTypeConfig.required === 1 }])}
                >
                  <OverflowTip>
                    {prTypeConfig.fieldName ||
                      intl.get(`mallf.common.view.prType`).d('采购申请类型')}
                  </OverflowTip>
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
                    setPrTypeVisible={(v) => setState({ prTypeVisible: v })}
                    setOrderData={setOrderData}
                    orderIndex={orderIndex}
                    setRemarkVisible={(v) => setState({ remarkVisible: v })}
                    setState={setState}
                  />
                </span>
              </div>
              <div
                data-field="remarkInput"
                r-if={remarkConfig.visible !== undefined && remarkConfig.visible !== 0}
                className="grid-row"
              >
                <span
                  className={classNames([
                    'grid-tag',
                    { require: remarkConfig.required === 1 || order.remarkRequired === 1 },
                  ])}
                >
                  {remarkConfig.fieldName || intl.get(`mallf.common.model.remark`).d('备注')}:
                </span>
                <span className="grid-content text-overflow" title={order.remark}>
                  {remarkVisible && custFlag(remarkConfig.editable) ? (
                    <Observer>
                      {() => (
                        <Input
                          style={{ height: 28 }}
                          required
                          value={remarkInput}
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
                            setState({ remarkVisible: false });
                          }}
                          onChange={(e) => {
                            const { value } = e.target;
                            setRemarkInput(value);
                          }}
                        />
                      )}
                    </Observer>
                  ) : (
                    <span
                      style={{ display: 'inline-block', maxWidth: 140, verticalAlign: 'middle' }}
                      className="text-overflow"
                    >
                      {order.remark || '-'}
                    </span>
                  )}
                  <Icon
                    r-if={custFlag(remarkConfig.editable)}
                    style={{ color: getPrimaryColor(), fontSize: 14, marginLeft: 10 }}
                    type="mode_edit"
                    onClick={() => {
                      setState({
                        prTypeVisible: false,
                        remarkVisible: true,
                        wholeOrderFlagVisible: false,
                      });
                    }}
                  />
                  {allOrderData.length > 1 && custFlag(remarkConfig.editable) && (
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
                        title={intl.get('mallf.common.view.syncAllOrderLine').d('同步至所有订单行')}
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
              {/* 原先的附件作为内部附件 */}
              <div className="grid-row flex-end-item" data-field="attachmentCom">
                <span
                  className={classNames([
                    'grid-tag',
                    'primary-hover-color',
                    { require: order?.attachmentRequired },
                  ])}
                >
                  <OverflowTip>
                    {intl.get('mallf.common.view.innerAttachment').d('内部附件')}
                  </OverflowTip>
                  :{/* ({order.fileList?.length > 0 ? order.fileList?.length : 0}) */}
                </span>
                <span className="grid-content">
                  <Form dataSet={order.DS}>
                    <Attachment
                      name="attachmentUuid"
                      labelLayout="float"
                      showHistory
                      viewMode="popup"
                      value={order.attachmentUuid}
                      bucketName="private-bucket"
                      bucketDirectory="mall-front"
                      onChange={(e) => e}
                      sortable
                      accept={accept}
                      funcType="link"
                      help={intl
                        .get('mallf.common.view.attProps.help', {
                          accept,
                          maxSize: `${purchasFileSize}M`,
                        })
                        .d(`支持${accept}格式，且不能大于${`${purchasFileSize}M`}`)}
                      fileSize={1024 * 1024 * purchasFileSize}
                    />
                  </Form>
                </span>
              </div>
              <div className="grid-row flex-end-item" data-field="outerAttachmentCom">
                <span
                  className={classNames([
                    'grid-tag',
                    'primary-hover-color',
                    { require: order?.outerAttachmentRequired }, // todo：外部附件必传控制
                  ])}
                >
                  <OverflowTip>
                    {intl.get('mallf.common.view.outterAttachment').d('外部附件')}
                  </OverflowTip>
                  :
                </span>
                <span className="grid-content">
                  <Form dataSet={order.DS}>
                    <Attachment
                      name="outerAttachmentUuid"
                      labelLayout="float"
                      showHistory
                      viewMode="popup"
                      value={order.outerAttachmentUuid}
                      bucketName="private-bucket"
                      bucketDirectory="mall-front"
                      onChange={(e) => e}
                      sortable
                      accept={accept}
                      funcType="link"
                      help={intl
                        .get('mallf.common.view.attProps.help', {
                          accept,
                          maxSize: `${purchasFileSize}M`,
                        })
                        .d(`支持${accept}格式，且不能大于${`${purchasFileSize}M`}`)}
                      fileSize={1024 * 1024 * purchasFileSize}
                    />
                  </Form>
                </span>
              </div>

              <div data-field="wholeOrderFlag" className="grid-row">
                <span
                  className={classNames([
                    'grid-tag',
                    { require: wholeOrderFlagConfig.required === 1 },
                  ])}
                >
                  <OverflowTip>
                    {intl.get(`mallf.common.model.wholeOrder`).d('整单发货')}
                  </OverflowTip>
                  :
                </span>
                <span className="grid-content">
                  {wholeOrderFlagVisible ? (
                    <Select
                      style={{ height: 28 }}
                      required={wholeOrderFlagConfig.required === 1}
                      value={order.wholeOrderFlag}
                      autoFocus
                      onBlur={() => setState({ wholeOrderFlagVisible: false })}
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
                              setState({
                                prTypeVisible: false,
                                remarkVisible: false,
                                wholeOrderFlagVisible: true,
                              });
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
