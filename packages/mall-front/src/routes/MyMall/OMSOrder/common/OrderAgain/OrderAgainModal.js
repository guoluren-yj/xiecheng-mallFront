import React, { useState, useEffect, useRef, useMemo } from 'react';
import { isEmpty } from 'lodash';
import { Spin, Icon, Tooltip, Alert, Tag, Message } from 'choerodon-ui';
import {
  Form,
  Table,
  TextField,
  TextArea,
  Attachment,
  Lov,
  DataSet,
  Button,
  message,
  DatePicker,
} from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { runInAction } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { PrecisionField } from 'utils/precision';
import classNames from 'classnames';
import intl from 'utils/intl';
import {
  getUserConfigInfo,
  convertImg,
  numberRender,
  getPrimaryColor,
  getMinAndPack,
} from 'utils/utils';
import Image from 'components/Image';
import Icons from 'components/Icons';
import swal from 'components/swal';
import {
  againOrderCheckService,
  againOrderSubmitService,
  fetchAgainOrderService,
  orderLineDeleteService,
} from 'services/orderCenterService';
import { openComfirmModal } from 'utils/modals';
import { SpanTitle } from 'utils/renderer';
import TotalMount from './TotalMount';
import { formDataSet, tableDataset, isGift } from './dataSet';
import CustomAttr from './CustomAttr';
import CuxFn from '@/cuxTools/cuxFn';
import TaskController from './TaskController';
import style from './index.less';

// 计算出相同商品的总数量
function calcTotalQuantity(data) {
  if (isEmpty(data)) return data;
  const skuMap = data.reduce((p, c) => {
    const field = isEmpty(c.customizedProductValueList) ? 'packageQuantity' : 'quantity';
    const total = p[c.skuId] || 0;
    Object.assign(p, { [c.skuId]: math.plus(total, c[field] || 0) });
    return p;
  }, {});
  return data.map((d) => ({ ...d, totalQuantity: skuMap[d.skuId] }));
}

export default function OrderAgainModal(props) {
  const { order, fetchOrderData, modal, readOnly = false } = props;
  const { changeInfo = [], approveMethod, batchNum } = order;
  const { userId, theme } = getUserConfigInfo();
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [allInfo, setAllInfo] = useState(props.allInfo || {});
  const { orderCode } = allInfo;
  const { currencySymbol, financialPrecision } = allInfo.orderEntryVOS?.[0] || {};
  const formDs = useRef(new DataSet(formDataSet({ userId }))).current;
  const tableDs = useRef(new DataSet(tableDataset(readOnly))).current;
  const batchOrderList = useMemo(() => props.allInfo?.batchOrderList || [], []);
  const task = useMemo(() => new TaskController(), []);

  const getProductRecords = () => {
    // 非赠品商品行
    return tableDs?.filter((r) => !isGift(r?.get('skuType')));
  };

  useEffect(() => {
    setDsData(allInfo);
  }, [allInfo]);

  function setDsData(params) {
    const { orderEntryVOS, receiverAddress, ...other } = params || {};
    formDs.loadData([
      {
        ...other,
        deliveryAddressLov: { ...receiverAddress, mobile: receiverAddress.mobilePhone },
      },
    ]);
    tableDs.loadData(calcTotalQuantity(orderEntryVOS));
  }

  // 查询下一条
  function fetchNextOrderCode(code) {
    setLoading(true);
    fetchAgainOrderService(code)
      .then((res) => {
        if (res) {
          setAllInfo(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // 快速定位
  function quickNavClick(code) {
    if (loading) return;
    if (formDs.dirty || tableDs.dirty) {
      openComfirmModal({
        title: intl.get('mallf.common.view.prompt').d('提示'),
        border: false,
        children: intl
          .get('mallf.myOrder.view.currentOrderNoSave')
          .d('当前订单修改内容尚未保存，请确认是否进行保存'),
        onOk: () => {
          handleSubmitOrSave({ saveFlag: 1 }, 'next');
        },
      });
      return;
    }
    fetchNextOrderCode(code);
  }

  // 行数据check后更新
  function lineCheckUpdate(data) {
    runInAction(() => {
      tableDs.forEach((r) => {
        const item = data?.find((f) => f.orderEntryId === r.get('orderEntryId'));
        if (item) {
          r.set(item);
        }
      });
    });
  }

  // 数据检测
  const againOrderCheck = task.sign(async function againOrderCheck({
    record,
    updateFlag,
    oldValue,
  }) {
    const addressId = formDs.current.get('addressId');
    const params = {
      ...allInfo,
      updateFlag,
      receiverAddress: {
        ...allInfo.receiverAddress,
        addressId,
      },
      remark: formDs.current.get('remark'),
      orderEntryVOS: tableDs.map((m) => {
        // 当前数量发生变更
        const qtyUpdateFlag = m.getField('_quantity').isDirty();
        if (qtyUpdateFlag || updateFlag) {
          return { ...m.toData(), updatePriceFieldFlag: 1 };
        }
        return m.toData();
      }),
    };
    const formFlag = await formDs.validate();
    const tableFlag = await tableDs.validate();
    if (
      formFlag &&
      (tableFlag ||
        tableDs.getValidationErrors().every((n) => {
          // check时不校验需求日期来进行价格更新
          return n.errors.every((err) => {
            return err?.field?.get('name') === 'neededDate'; // 报错只为需求日期
          });
        }))
    ) {
      setLoading(true);
      try {
        const res = await againOrderCheckService(params);
        if (res) {
          // 地址修改
          if (params.updateFlag) {
            formDs.setState('updateFlag', 1);
          }
          const { orderEntryVOS = [], receiverAddress, ...other } = res || {};
          formDs.current.set({
            ...other,
            deliveryAddressLov: { ...receiverAddress, mobile: receiverAddress.mobilePhone },
          });

          lineCheckUpdate(orderEntryVOS);
        }
      } catch {
        if (params.updateFlag) {
          formDs.current.set('deliveryAddressLov', oldValue);
        } else if (record) {
          record.set('_quantity', oldValue);
        }
      } finally {
        setLoading(false);
      }
    }
  });

  // 保存/提交
  const handleSubmitOrSave = task.sign(async function handleSubmitOrSave(
    param = {},
    type = 'close'
  ) {
    const formFlag = await formDs.validate();
    const tableFlag = await tableDs.validate();
    if (formFlag && tableFlag) {
      setLoading(true);
      setBtnLoading(true);
      const params = {
        ...allInfo,
        changeInfo,
        ...formDs.current.toData(),
        receiverAddress: formDs.current.get('deliveryAddressLov'),
        orderEntryVOS: tableDs.toData(),
        ...param,
        updateFlag: formDs.getState('updateFlag'),
      };
      if (params.agreementType === 'SALE') {
        // 销售协议价格处理
        params.orderEntryVOS.forEach((prodct, index) => {
          params.orderEntryVOS[index].proxyUnitPrice = prodct.unitPrice;
        });
      }
      const submitFunc = async () => {
        try {
          const res = await againOrderSubmitService(params);
          formDs.setState('updateFlag', null);
          // 保存并关闭
          if (type === 'close') {
            modal.close();
          }
          // 保存并下一条
          if (type === 'next') {
            const currentIndex = batchOrderList.findIndex((n) => n === orderCode);
            const nextIndex = currentIndex === batchOrderList.length - 1 ? 0 : currentIndex + 1;
            const code = batchOrderList[nextIndex];
            fetchNextOrderCode(code);
          }
          if (res) {
            fetchOrderData();
          }
          if (param.saveFlag) {
            Message.success(intl.get('mallf.myOrder.view.save.success').d('保存成功'));
            return;
          }
        } finally {
          setLoading(false);
          setBtnLoading(false);
        }
      };
      const dirtyGiftProducts = tableDs.reduce((pre, cur) => {
        // 当前数量发生变更
        const qtyUpdateFlag = cur.getField('_quantity').isDirty();
        const isHaveGift = tableDs.some(
          (r) => r.get('parentOrderEntryId') === cur.get('orderEntryId')
        );
        // 存在商品行数量变化且含赠品
        return qtyUpdateFlag && isHaveGift ? [...pre, cur.get('skuName')] : pre;
      }, []);
      if (dirtyGiftProducts.length > 0) {
        openComfirmModal({
          title: intl.get('mallf.common.view.prompt').d('提示'),
          border: false,
          children: param.saveFlag
            ? intl
                .get('mallf.myOrder.view.gift.saveGiftTip', {
                  name: dirtyGiftProducts.join('】【'),
                })
                .d(
                  `当前订单商品【${dirtyGiftProducts.join(
                    '】【'
                  )}】发生数量变更，可能导致关联赠品行数量发生变化，是否继续保存？`
                )
            : intl
                .get('mallf.myOrder.view.gift.submitGiftTip', {
                  name: dirtyGiftProducts.join('】【'),
                })
                .d(
                  `当前订单商品【${dirtyGiftProducts.join(
                    '】【'
                  )}】发生数量变更，可能导致关联赠品行数量发生变化，是否继续提交？`
                ),
          onOk: submitFunc,
        });
        setLoading(false);
        setBtnLoading(false);
        return false;
      }

      submitFunc();
    }
  });

  // 重新提交
  function handleSubmit() {
    if (approveMethod === 'BATCH' && batchOrderList?.length > 1) {
      openComfirmModal({
        title: intl.get('mallf.common.view.prompt').d('提示'),
        border: false,
        children: intl
          .get('mallf.myOrder.view.orderAgainWarning', {
            value: batchNum,
          })
          .d(
            `该订单审批方式为工作流批次审批，提交订单将触发整个批次${batchNum}的订单一起提交，请确认批次下订单均处理完成。`
          ),
        onOk: () => {
          handleSubmitOrSave();
        },
      });
    } else {
      handleSubmitOrSave();
    }
  }

  function handleAddressChange(oldValue) {
    againOrderCheck({ updateFlag: 1, oldValue });
  }

  async function handleDelete(records) {
    if (records.length === getProductRecords().length) {
      swal(intl.get('mallf.myOrder.view.deleteAllMessage').d('至少保留一个商品行'));
      return false;
    }
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
      children: (
        <div style={{ fontSize: '14px' }}>
          {intl
            .get('mallf.myOrder.view.deleteLineMessage')
            .d('删除后金额和预算等将重新计算，请确认。')}
        </div>
      ),
      onOk: async () => {
        const addressId = formDs.current.get('addressId');
        const params = {
          ...allInfo,
          receiverAddress: {
            ...allInfo.receiverAddress,
            addressId,
          },
          deleteLineFlag: 1,
          remark: formDs.current.get('remark'),
          orderEntryVOS: tableDs
            .filter((f) => !records.some((s) => s.get('orderEntryId') === f.get('orderEntryId')))
            .map((m) => {
              const line = m.toData();
              // 相同商品行遭到删除
              if (records.some((s) => s.get('skuId') === line.skuId)) {
                return { ...line, updatePriceFieldFlag: 1 };
              }
              return line;
            }),
        };
        const formFlag = await formDs.validate();
        const tableFlag = await tableDs.validate();
        if (formFlag && tableFlag) {
          try {
            setLoading(true);
            // check接口获取计算后的结果
            const checkRes = await againOrderCheckService(params);
            if (checkRes) {
              // 删除接口
              const deleteRes = await orderLineDeleteService({
                ...allInfo,
                ...formDs.current.toData(),
                orderEntryVOS: records.map((m) => m.toData()),
              });
              if (deleteRes) {
                const { receiverAddress, orderEntryVOS, ...other } = checkRes || {};
                formDs.current.set({
                  ...other,
                  deleteLineFlag: 1,
                  objectVersionNumber: deleteRes.objectVersionNumber,
                  deliveryAddressLov: { ...receiverAddress, mobile: receiverAddress.mobilePhone },
                });
                tableDs.remove(records, true);
                lineCheckUpdate(orderEntryVOS);
                fetchOrderData();
                message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
              }
            }
          } catch {
            // do nothing
          } finally {
            setLoading(false);
          }
        }
      },
    });
  }

  // 阶梯价
  function ladderPriceRender(ladderPriceList, quantity) {
    return (
      <div style={{ padding: '5px', width: '125px' }}>
        <div style={{ marginBottom: '10px' }}>
          {intl.get(`mallf.myOrder.view.cart.rangPrice`).d('阶梯价格')}
        </div>
        {ladderPriceList?.map((ladderPrice) => {
          const { ladderFrom, ladderTo, salePrice } = ladderPrice;
          const activeColor =
            (quantity < ladderTo || !ladderTo) && quantity >= ladderFrom
              ? getPrimaryColor()
              : '#fff';
          return (
            <div style={{ marginBottom: '5px', color: activeColor }}>
              <span>{ladderTo ? `${ladderFrom}-${ladderTo}` : `>=${ladderFrom}`}</span>
              <span style={{ float: 'right' }}>{salePrice}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const columns = [
    {
      name: 'productInfo',
      width: 280,
      className: 'product-info',
      tooltip: 'none',
      renderer: ({ record }) => {
        const { skuId, skuName, primaryUrl, customizedProductValueList, skuType } = record.get([
          'skuId',
          'skuName',
          'primaryUrl',
          'customizedProductValueList',
          'skuType',
        ]);

        const customFlag = !isEmpty(customizedProductValueList);
        return (
          <div className="product-info">
            <div className="goods-img">
              <Image
                value={convertImg(primaryUrl, 1, record.get('productSource'))}
                width={41}
                height={41}
              />
            </div>
            <div className="goods-product-name">
              <div
                title={skuName}
                className={{
                  'goods-name': true,
                  'gift-goods-name': isGift(skuType),
                }}
              >
                {skuName}
              </div>
              <Tooltip
                r-if={skuType === 'GIFT'}
                title={intl.get('mallf.common.view.common.giveaway').d('赠品')}
              >
                <div className="gift-label">
                  {intl.get('mallf.common.view.common.giveaway').d('赠品')}
                </div>
              </Tooltip>
              <Tooltip
                r-if={skuType === 'ATTACHMENT'}
                title={intl.get(`mallf.common.view.common.annex`).d('附件')}
              >
                <div className="gift-label">
                  {intl.get(`mallf.common.view.common.annex`).d('附件')}
                </div>
              </Tooltip>
              <CustomAttr
                r-if={customFlag && !isGift(skuType)}
                skuId={skuId}
                customList={customizedProductValueList}
                readOnly={!changeInfo.includes('CUSTOM_SPECIFICATION') || readOnly}
                onOk={(value) => record.set('customizedProductValueList', value)}
              />
            </div>
          </div>
        );
      },
    },
    {
      name: 'neededDate',
      className: 'neededDate',
      width: 150,
      renderer: ({ name, text, record }) =>
        changeInfo.includes('NEEDED_DATE') && !readOnly && !isGift(record.get('skuType')) ? (
          <DatePicker name={name} record={record} />
        ) : (
          text
        ),
    },
    {
      name: 'unitPrice',
      width: 140,
      align: 'right',
      className: 'unitPrice',
      tooltip: 'none',
      renderer: ({ record }) => {
        const {
          unitPrice,
          uomName,
          unitPriceMeaning,
          diffPrice,
          ladderPriceList,
          totalQuantity,
          per,
        } = record.get([
          'unitPrice',
          'uomName',
          'unitPriceMeaning',
          'diffPrice',
          'ladderPriceList',
          'totalQuantity',
          'per',
        ]);
        return (
          <div style={{ lineHeight: diffPrice ? '15px' : '25px' }}>
            <SpanTitle className="text-overflow" style={{ width: 110, display: 'inline-block' }}>
              {currencySymbol || ''}
              {unitPrice || unitPriceMeaning || 0}
              {uomName ? `/${per > 1 ? per : ''}${uomName}` : ''}
            </SpanTitle>
            <div>
              {!!diffPrice && (
                <React.Fragment>
                  {diffPrice > 0 ? (
                    <span className="diffPrice-up">
                      <Icons
                        type="prise_rise"
                        size="10"
                        style={{ color: '#F56649', marginRight: '8px' }}
                      />
                      {currencySymbol || ''}
                      {Math.abs(diffPrice)}
                    </span>
                  ) : (
                    <span className="diffPrice-down">
                      <Icons
                        type="prise_down"
                        size="10"
                        style={{ color: '#47B883', marginRight: '8px' }}
                      />
                      {currencySymbol || ''}
                      {Math.abs(diffPrice)}
                    </span>
                  )}
                </React.Fragment>
              )}
            </div>
            {ladderPriceList?.length > 0 && (
              <Tooltip placement="left" title={ladderPriceRender(ladderPriceList, totalQuantity)}>
                <span style={{ color: '#666666' }}>
                  {intl.get(`mallf.myOrder.view.cart.rangPrice`).d('阶梯价格')}
                </span>
                <Icon
                  style={{
                    fontSize: 14,
                    marginLeft: 3,
                    cursor: 'pointer',
                    color: '#666666',
                  }}
                  type="find_in_page"
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      name: '_quantity',
      width: 140,
      className: 'quantity',
      align: 'left',
      header: () => {
        // 购物车静态提示
        const handleProductComfirmInfo = () => {
          return (
            <>
              <div>{intl.get('mallf.common.view.maxAgainQuantity').d('不能超过原有商品数量')}</div>
            </>
          );
        };
        return (
          <>
            <span>{intl.get(`mallf.common.model.companyOrder.count`).d('数量')}</span>
            <Tooltip title={handleProductComfirmInfo()}>
              <Icon
                type="error"
                style={{
                  color: '#FCA000',
                  marginLeft: '5px',
                  fontSize: 14,
                  fontWeight: 100,
                }}
              />
            </Tooltip>
          </>
        );
      },
      renderer: ({ name, record, text }) => {
        const isMultiLine = getProductRecords().length > 1; // 是否多行
        const precision = record.get('uomPrecision') || 0;
        const minPurchaseQuantity = !isMultiLine // 多行最小值不生效
          ? record.get('minPurchaseQuantity') ||
            (precision ? Number(math.pow(0.1, precision).toFixed(precision)) : 1)
          : undefined;
        return changeInfo.includes('QUANTITY') && !readOnly ? (
          <PrecisionField
            name={name}
            nonStrictStep
            precision={precision}
            record={record}
            min={minPurchaseQuantity}
            disabled={isGift(record.get('skuType'))}
            onChange={(value, oldValue) => {
              // 小于最小值需设置为最小值 - 多行不设置
              if (!math.gt(value || 0, minPurchaseQuantity || 0) && !isMultiLine) {
                record.set(
                  '_quantity',
                  getMinAndPack(minPurchaseQuantity, record.get('minPackageQuantity'))
                );
              }
              // 值与旧值不同则校验
              if (!math.eq(oldValue, record.get('_quantity'))) {
                // 主要校验输入后又被最小值修改
                againOrderCheck({ record, oldValue });
              }
            }}
          />
        ) : (
          text
        );
      },
    },
    {
      name: 'entryAmount',
      minWidth: 150,
      align: 'right',
      renderer: ({ record }) => {
        const { entryAmount } = record.toData();
        return (
          <p
            className="price-color text-overflow"
            style={{ maxWidth: 300, textAlign: 'right', margin: 0 }}
          >
            {currencySymbol}
            {numberRender(entryAmount, financialPrecision, true)}
          </p>
        );
      },
    },
    !readOnly && {
      name: 'action',
      width: 80,
      header: intl.get('hzero.common.action').d('操作'),
      renderer: ({ dataSet, record }) => (
        <Button
          funcType="link"
          color="primary"
          disabled={dataSet.length < 2 || isGift(record.get('skuType'))}
          onClick={() => handleDelete([record])}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      ),
    },
  ];

  const getColumns = CuxFn({
    name: 'OrderAgainModal-fn-getFields',
    value: { columns },
  })(() => columns);

  const orderDetail = (
    <Spin spinning={loading}>
      <div className={style['order-again-detail']}>
        {allInfo?.changeReason && (
          <div className="order-reject">
            <Tag
              style={{
                color: theme['danger-color'],
                height: '18px',
                lineHeight: '16px',
                margin: '0 10px',
                padding: '0 5px',
              }}
              color={theme['danger-bg-color']}
            >
              {allInfo?.changeTypeMeaning}
            </Tag>
            <span>{allInfo?.changeReason}</span>
          </div>
        )}
        <div className="header-title">{intl.get(`mallf.myOrder.view.baseInfo`).d('基本信息')}</div>
        <Form style={{ marginBottom: 25 }} dataSet={formDs} labelLayout="float" columns={3}>
          <TextField name="contactName" disabled />
          <TextField name="fullPhone" disabled />
          <Lov
            name="deliveryAddressLov"
            disabled={!changeInfo.includes('DELIVERY_ADDRESS') || readOnly}
            onChange={(value, oldValue) => handleAddressChange(oldValue)}
          />
          <TextArea
            name="remark"
            disabled={!changeInfo.includes('ORDER_REMARK') || readOnly}
            rows={3}
          />
          <Attachment
            name="attachmentUuid"
            readOnly={!changeInfo.includes('ORDER_ATTACHMENT') || readOnly}
            max={10}
            colSpan={2}
          />
          <Attachment
            name="outerAttachmentUuid"
            readOnly={!changeInfo.includes('ORDER_ATTACHMENT') || readOnly}
            max={10}
            colSpan={2}
          />
        </Form>
        <div className="header-title">
          {intl.get(`mallf.common.view.productInformation`).d('商品信息')}
          <Observer>
            {() =>
              !readOnly && (
                <Button
                  icon="delete"
                  color="primary"
                  funcType="flat"
                  disabled={tableDs.selected.length < 1 || getProductRecords().length < 2}
                  style={{ float: 'right', fontSize: '12px', marginTop: -6 }}
                  onClick={() => handleDelete(tableDs.selected)}
                >
                  {intl.get('mallf.common.view.button.batchDelete').d('批量删除')}
                </Button>
              )
            }
          </Observer>
        </div>
        <Table parityRow={false} dataSet={tableDs} columns={getColumns()} rowHeight="auto" />
        <div className="total-count">
          <Observer>
            {() => {
              const newAllInfo = {
                ...allInfo,
                ...formDs.current?.toData(),
                orderEntryVOS: tableDs.toData(),
              };
              return <TotalMount allInfo={newAllInfo} />;
            }}
          </Observer>
        </div>
      </div>
    </Spin>
  );

  return (
    <div className={style['quick-edit-container']}>
      <div className="quick-edit-content">
        <div className="quick-content-title">
          <span>
            {intl.get('mallf.myOrder.view.editOrder').d('修改订单')}-{orderCode}
            {approveMethod === 'BATCH' && (
              <span>
                （{intl.get('mallf.myOrder.view.order.batchNum').d('批次号')}：{batchNum}）
              </span>
            )}
          </span>
        </div>
        <Alert
          type="warning"
          showIcon
          iconType="error"
          className="order-again-warn"
          message={
            approveMethod !== 'BATCH'
              ? intl
                  .get('mallf.myOrder.view.orderAgainWarn')
                  .d(
                    '温馨提示：修改地址/商品数量可能会导致商品的单价、可售情况以及订单运费、总金额产生变化。'
                  )
              : intl
                  .get('mallf.myOrder.view.orderAgainWarn1')
                  .d(
                    '温馨提示：该订单审批方式为工作流批次审批，重新提交将触发整个批次下的订单一起提交，请确认所有订单都完成更新。修改地址/商品数量可能会导致商品的单价、可售情况以及订单运费、总金额产生变化。'
                  )
          }
        />
        <div className="quick-content-body">{orderDetail}</div>
        <div r-if={!readOnly} className="quick-content-footer">
          <Button
            waitType="throttle"
            wait={500}
            color="primary"
            loading={btnLoading}
            onClick={() => handleSubmit()}
          >
            {intl.get('mallf.myOrder.view.againSubmitOrder').d('重新提交')}
          </Button>
          {approveMethod === 'BATCH' && batchOrderList?.length > 1 && (
            <Button
              waitType="throttle"
              wait={500}
              loading={btnLoading}
              onClick={() => handleSubmitOrSave({ saveFlag: 1 }, 'next')}
            >
              {intl.get('mallf.myOrder.view.saveNext').d('保存并下一条')}
            </Button>
          )}
          <Button
            waitType="throttle"
            wait={500}
            loading={btnLoading}
            onClick={() => handleSubmitOrSave({ saveFlag: 1 }, 'close')}
          >
            {intl.get('mallf.myOrder.view.saveClose').d('保存并关闭')}
          </Button>
          <Button onClick={() => modal.close()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
        <div r-if={readOnly} className="quick-content-footer">
          <Button onClick={() => modal.close()} color="primary">
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </div>
      {approveMethod === 'BATCH' && (
        <div className="quick-edit-nav">
          <div className="quick-nav-title">
            {`${intl.get('mallf.myOrder.view.title.quickEdit').d('快速定位')}(${
              batchOrderList.length
            })`}
          </div>
          <div className="quick-nav-body">
            {batchOrderList.map((n) => {
              return (
                <div
                  key={n}
                  className={classNames({
                    'quick-nav-li': true,
                    'text-overflow': true,
                    active: n === orderCode,
                  })}
                  onClick={() => quickNavClick(n)}
                >
                  {n}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
