import React, { useMemo, useEffect } from 'react';
import { compose, isEmpty } from 'lodash';
import { toJS } from 'mobx';
import moment from 'moment';
import qs from 'qs';
import classNames from 'classnames';
import {
  Form,
  Radio,
  DataSet,
  Select,
  TextArea,
  Attachment,
  Cascader,
  TextField,
  DateTimePicker,
  Button,
  message,
  SelectBox,
  Spin,
  Output,
  NumberField,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';

import CuxFn from '@/cuxTools/cuxFn';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import AddressLov from 'components/AddressLov';
import { PrecisionField } from 'utils/precision';
import Link from 'components/Link';
import Image from 'components/Image';
import { SupplierComponent } from 'utils/renderer';
import { fetchOMSGoodsInfo, omsSubmitFetch } from 'services/saleDetailService';
import {
  getHomePath,
  getUserConfigInfo,
  getOrganizationId,
  generateUrlWithGetParam,
} from 'utils/utils';
import intl from 'utils/intl';
import { hasDoubleUomFlag, getDoubleUomFlag } from 'utils/configUtils';
import BreadCrumbs from 'components/BreadCrumbs';
import formatterCollections from 'utils/intl/formatterCollections';
import useSetState from '@/hooks/useState';
import { getMamanualRequestImg } from 'components/MamanualRequestImg';
import styles from './index.less';
import { formds, optionds } from './dataSet';
import GiftList from './GiftList';

const { Option } = SelectBox;

// 这里面可以控制node结点的判断来实现是否展示为叶结点
function nodeCover({ record }) {
  const nodeProps = {
    title: record.get('text'),
  };
  nodeProps.isLeaf = record.get('isLeaf');
  return nodeProps;
}

// 赠品表单
const GiftForm = observer((props) => {
  const { dataSet } = props;
  const checkAttachment = (record) => {
    return record.data?.skuType === 'ATTACHMENT';
  };
  const isOneGift = dataSet.filter((r) => !checkAttachment(r)).length === 1;
  const isOneAttach = dataSet.filter((r) => checkAttachment(r)).length === 1;
  const indexObj = { attachInd: 1, giftInd: 1 };
  return dataSet.map((record, ind) => {
    let value;
    if (!checkAttachment(record)) {
      value =
        intl.get('mallf.common.view.common.giveaway').d('赠品') +
        (isOneGift || indexObj.giftInd < 2 ? '' : indexObj.giftInd);
      indexObj.giftInd++;
    } else {
      value =
        intl.get('mallf.common.view.common.annex').d('附件') +
        (isOneAttach || indexObj.attachInd < 2 ? '' : indexObj.attachInd);
      indexObj.attachInd++;
    }
    const label = intl
      .get('mallf.saleAppli.view.applyGiftOrAttachment.quantity', { value })
      .d(`提交${value}数量`);
    return (
      <div style={{ marginBottom: ind + 1 < dataSet.length ? 20 : 0 }}>
        <NumberField
          record={record}
          name="quantity"
          label={label}
          help={dataSet.length < 2 ? null : record.get('skuName')}
          showHelp="tooltip"
          step={record.get('supplierCode') !== 'CATA' ? 1 : 0}
          style={{ width: '100%' }}
        />
      </div>
    );
  });
});

function SaleAfterApplication(props) {
  const { customizeForm } = props;

  const {
    ecpoNum: poNum,
    orderId,
    consignmentCode,
    skuCode,
    consignmentLineNum,
    orderEntryId,
  } = useMemo(() => {
    return qs.parse(window.location.search.substr(1));
  }, []);

  const optionDs = useMemo(() => {
    return new DataSet(optionds());
  }, []);

  const initDs = useMemo(() => {
    return new DataSet(formds({ optionDs }));
  }, []);

  const giftDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'quantity',
            type: 'number',
            required: true,
            min: 0,
            dynamicProps: {
              max: ({ record }) => record.get('originalQuantity'),
              precision: ({ record }) => (record.get('supplierCode') !== 'CATA' ? 0 : 9), // 电商赠品整数 目录化赠品需要支持维护小数
              defaultValidationMessages: ({ record }) => {
                const value =
                  record.get('skuType') !== 'ATTACHMENT'
                    ? intl.get('mallf.common.view.common.giveaway').d('赠品')
                    : intl.get('mallf.common.view.common.annex').d('附件');
                return {
                  valueMissingNoLabel: intl
                    .get('mallf.saleAppli.view.applyGiftOrAttach.QuantityNotNull', { value })
                    .d(`请填写${value}数量`),
                };
              },
            },
          },
        ],
      }),
    []
  );

  const {
    companyId,
    userId,
    userInfo: { realName, phone },
    mallType,
  } = useMemo(() => {
    return getUserConfigInfo();
  }, []);

  const [state, setState] = useSetState({
    loading: true,
    submitLoading: false,
    hasSaleNum: 0,
    goodsData: {},
    returnTypeList: [], // 退货方式
    // 金风二开地址入参
    pickAddressLovPara:
      mallType === 'sigl'
        ? {
            lovCode: 'SMAL.MEMBER.ADDRESS',
            lovPara: { addressType: 'RECEIVER', belongType: 3, enabledFlag: 1 },
          }
        : { lovPara: { companyId, userId } },
    customerAddressLovPara:
      mallType === 'sigl'
        ? {
            lovCode: 'SMAL.MEMBER.ADDRESS',
            lovPara: { addressType: 'RECEIVER', belongType: 3, enabledFlag: 1 },
          }
        : { lovPara: { companyId, userId } },
  });

  const saleNumMessage = useMemo(() => {
    const { saleNum, salePackageNum, uomName, customUomName, uomId, customUomId, customQuantity } =
      state.goodsData || {};
    return hasDoubleUomFlag({ uomId, customUomId, customQuantity })
      ? `${salePackageNum}${customUomName}${saleNum}${uomName}`
      : `${saleNum}${uomName}`;
  }, [state.goodsData]);

  // 有二开逻辑
  CuxFn({
    name: 'OMSSaleAfterApplication-fn-initDs',
    value: { initDs, state, setState },
  })();

  useEffect(() => {
    getGoodsInfo();
  }, []);

  // 提交
  async function handleSubmit() {
    const formFlag = await initDs.validate();
    const data = initDs.current.toData();
    const giftFlag = data.serviceType === 'RETURN' ? await giftDs.validate() : true;
    if (formFlag && giftFlag) {
      const giftData = data.serviceType === 'RETURN' ? giftDs.toData() : null;
      const receiptAddress = {
        internationalTelCode: data.customerInternationalTelCode,
        address: data.returnWareFullAddress,
        afterSaleAddressType: 'RECEIPT',
        cityId: data.returnWareRegionIdList?.[1],
        contactName: data.customerContactName,
        districtId: data.returnWareRegionIdList?.[2],
        fullAddress: data.returnWareFullAddress,
        mobilePhone: data.customerMobilePhone,
        addressId: data.customerAddressId,
        regionId: data.returnWareRegionIdList?.[0],
        streetId: data.returnWareRegionIdList?.[3],
        tenantId: getOrganizationId(),
      };
      const fetchData = {
        // 取件地址
        pickUpAddress:
          data.pickWareType === 'PICK_UP'
            ? {
                internationalTelCode: data.pickInternationalTelCode,
                afterSaleAddressType: 'PICKUP',
                contactName: data.pickContactName,
                mobilePhone: data.pickMobilePhone,
                addressId: data.pickAddressId,
                districtId: data.pickWareRegionIdList?.[2], // 取件县
                cityId: data.pickWareRegionIdList?.[1], // 取件城市
                regionId: data.pickWareRegionIdList?.[0], // 取件省
                streetId: data.pickWareRegionIdList?.[3], // 取件乡镇
                address: data.pickWareFullAddress,
                fullAddress: data.pickWareFullAddress,
                tenantId: getOrganizationId(),
              }
            : { ...receiptAddress, afterSaleAddressType: 'PICKUP' },
        receiptAddress,
        afterSaleEntryList: [
          {
            skuCode: state.goodsData?.skuCode,
            attachmentUuid: data.attachmentUuid,
            applyQuantity: data.applyQuantity, // 基本数量
            applyPackageQuantity: data.applyPackageQuantity, // 辅助数量
            remark: data.problemDesc,
            consignmentLineNum,
            afterSaleType: data.serviceType,
            orderEntryId: state.goodsData?.orderEntryId || orderEntryId,
            giveawayDetailed: giftData,
          },
        ],
        afterSale: {
          ...data,
          orderId,
          pickWareType: data.pickWareType, // 取件方式
          consignmentCode, // 配送单
          cecFromCode: state.goodsData?.supplierCode,
          afterSaleType: data.serviceType,
          applyTime: moment().format(DEFAULT_DATETIME_FORMAT), // 申请时间
          reserveTimeBegin: data.reserveTimeBegin, // 取件开始时间
          reserveTimeEnd: data.reserveTimeEnd, // 取件结束时间
          ownerName: realName,
          ownerId: userId,
          ownerPhone: phone,
          reason: data.problemDesc, // 问题描述
          returnReasonCode: data.returnReasonCode,
          exchangeReasonCode: data.exchangeReasonCode,
        },
        giveawayDetailed: giftData,
      };
      if (mallType === 'sigl') {
        fetchData.channel = 'PERSONAL';
      }
      setState({
        submitLoading: true,
      });
      omsSubmitFetch(fetchData)
        .then((res) => {
          if (res) {
            message.success(
              intl.get('mallf.orderDetail.saleAfter.submit.success').d('售后申请提交成功')
            );
            const pushUrl = generateUrlWithGetParam(`${getHomePath()}oms-sale-detail`, {
              orderId,
              consignmentCode,
              skuCode,
              ecpoNum: poNum,
              consignmentLineNum,
              orderEntryId,
            });
            props.history.push(pushUrl);
          }
        })
        .finally(() => {
          setState({
            submitLoading: false,
          });
        });
    }
  }

  /**
   * 获取商品信息
   */
  function getGoodsInfo() {
    initDs.status = 'loading';
    fetchOMSGoodsInfo({ orderId, skuCode, consignmentCode, consignmentLineNum })
      .then((res) => {
        setState({
          hasSaleNum: res?.saleNum || 0,
          goodsData: res,
          returnTypeList: res.pickWareTypes?.map((p) => ({
            ...p,
            value: p.pickWareType,
            meaning: p.pickWareTypeMeaning,
          })),
        });
        const { pickWareType } = res.pickWareTypes?.[0] || {};
        const {
          saleNum,
          salePackageNum,
          uomPrecision,
          customUomPrecision,
          customQuantity,
          uomId,
          customUomId,
          customFlag,
          giveawayDetailed,
          supplierCode,
        } = res || {};
        const giftData = giveawayDetailed || [];
        giftData.forEach((f) => {
          const { quantity, mediaPath, ...other } = f;
          giftDs.create({ ...other, originalQuantity: quantity, supplierCode });
        });
        initDs.current.set({
          saleNum,
          salePackageNum,
          uomPrecision,
          customUomPrecision,
          customQuantity,
          uomId,
          customUomId,
          customFlag,
          pickWareType,
          giftFlag: giftData.length > 0,
          serviceType: res?.afterSaleTypes?.[0]?.afterSaleType,
        });
      })
      .finally(() => {
        initDs.status = 'ready';
      });
  }

  const ServiceForm = observer(({ dataSet }) => {
    const { serviceType, giftFlag } = dataSet.current?.get(['serviceType', 'giftFlag']);
    const { uomId, customUomId, customQuantity } = state.goodsData || {};

    return (
      <>
        {customizeForm(
          {
            code: 'MALL.SALEAFTER.APPLICATION.AFTERSALE.SERVICE',
          },
          <Form dataSet={dataSet} labelLayout="float" columns={2}>
            <SelectBox newLine name="serviceType" className="after-service-select">
              {state.goodsData?.afterSaleTypes?.map((item) => {
                return <Option value={item.afterSaleType}>{item.afterSaleTypeMeaning}</Option>;
              })}
            </SelectBox>
            {getDoubleUomFlag() &&
              PrecisionField({
                newLine: true,
                name: 'applyPackageQuantity',
                precision: state.goodsData?.customUomPrecision,
                record: dataSet.current,
              })}
            {(hasDoubleUomFlag({ uomId, customUomId, customQuantity }) || !getDoubleUomFlag()) &&
              PrecisionField({
                newLine: true,
                name: 'applyQuantity',
                precision: state.goodsData?.uomPrecision,
                record: dataSet.current,
              })}
            {giftFlag && serviceType === 'RETURN' && (
              <Output
                newLine
                name="gift"
                style={{ fontWeight: 400 }}
                renderer={() => <GiftForm dataSet={giftDs} />}
              />
            )}
            <Select
              r-if={['EXCHANGE', 'RETURN'].includes(serviceType)}
              newLine
              name={serviceType === 'RETURN' ? 'returnReasonCode' : 'exchangeReasonCode'}
            />
            <TextArea newLine name="problemDesc" maxLength={1000} showLengthInfo resize="both" />
            <Attachment
              newLine
              name="attachmentUuid"
              colSpan={2}
              accept={['image/*']}
              listType="picture-card"
              max={9}
              bucketName="public-bucket"
              bucketDirectory="mall-front"
              showValidation="newLine"
              help={intl
                .get('mallf.common.view.attProps.helpAccept', {
                  accept: 'PNG、JPG、JPEG',
                })
                .d(`支持PNG、JPG、JPEG格式`)}
            />
          </Form>
        )}
      </>
    );
  });

  const ReturnTypeForm = observer(({ dataSet }) => {
    return (
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <form newLine className="radio-type-list">
          <p>
            {intl.get(`mallf.saleAppli.view.pickMethod`).d('退件方式')}
            <span className="require-icon">*</span>
          </p>
          {state.returnTypeList?.map((item) => {
            return (
              <Radio dataSet={dataSet} name="pickWareType" value={item.value}>
                {item.meaning}
              </Radio>
            );
          })}
        </form>
      </Form>
    );
  });

  const PickInfoForm = observer(({ dataSet }) => {
    const pickWareType = dataSet.current?.get('pickWareType');
    return (
      <div r-if={pickWareType === 'PICK_UP'}>
        <p className="seconed-title" style={{ fontSize: 14 }}>
          {intl.get(`mallf.saleAppli.view.takeInfo`).d('取件信息')}
          <AddressLov
            mode="button"
            color="primary"
            funcType="flat"
            className="address-lov-btn"
            clearButton={false}
            needCreateReceiverAddress={false}
            onChange={(address) => {
              initDs.current.init({
                pickMobilePhone: address?.mobile,
                pickWareFullAddress: address?.address,
                pickAddressId: address?.addressId,
                pickContactName: address?.contactName,
                pickInternationalTelCode: address?.internationalTelCode,
                pickWareAddress: address?.regionNameList,
                pickWareRegionCodeList: address?.regionCodeList,
                pickWareRegionIdList: address?.regionIdList,
                pickWareNeedValidate: 0,
                // 送货上门取件选择地址带出联系人信息
                returnWareFullAddress: address?.address,
                customerAddressId: address?.addressId,
                customerContactName: address?.contactName,
                customerMobilePhone: address?.mobile,
                customerInternationalTelCode: address?.internationalTelCode,
                returnWareAddress: address?.regionNameList,
                returnWareRegionCodeList: address?.regionCodeList,
                returnWareRegionIdList: address?.regionIdList,
                returnWareNeedValidate: 0,
              });
            }}
            {...state.pickAddressLovPara}
          >
            {intl.get(`mallf.saleAppli.model.choose.address`).d('选择地址')}
          </AddressLov>
        </p>
        <div className="after-service-info">
          <span>
            {intl
              .get('mallf.saleAppli.after.submit.pickInfoTip')
              .d(`售后申请提交后，商家可能会通过您维护的取件信息提供售后服务，请核实取件信息无误`)}
          </span>
        </div>
        <Form dataSet={dataSet} labelLayout="float" columns={2}>
          <Cascader
            async
            onOption={nodeCover}
            name="pickWareAddress"
            style={{ width: '100%' }}
            menuMode="single"
            onChoose={(value) => {
              // 处理暂不选择 去除最后一位
              const virtualFlag = value?.find((p) => p.virtualFlag);
              const isNAFlag = value?.find((p) => p.isNAFlag);
              if (isNAFlag) {
                // N/A字段 需要将regionName处理为空不展示 优先级大于虚拟字段
                const regionIdList = value?.reduce((pre, cur) => {
                  return pre.concat(cur.regionIdList || []);
                }, []);
                initDs.current.set({
                  pickWareRegionCodeList: isNAFlag?.levelPath?.split('.'), // 设置提交的regioncodeList 为N/A项的levelPath分割
                  pickWareRegionIdList: regionIdList,
                });
                const list = [...toJS(initDs.current.get('pickWareAddress'))];
                list.splice(list.length - 1, 1);
                initDs.current.set('pickWareAddress', list);
                return;
              }
              if (virtualFlag) {
                initDs.current.set({
                  pickWareRegionCodeList: value
                    ?.filter((p) => !p.countryFlag && !p.virtualFlag)
                    ?.map((p) => p.regionCode),
                  pickWareRegionIdList: value
                    ?.filter((p) => !p.countryFlag && !p.virtualFlag)
                    ?.map((p) => p.regionId),
                });
                const list = [...toJS(initDs.current.get('pickWareAddress'))];
                list[4].regionName = '';
                initDs.current.set('pickWareAddress', list);
              }
            }}
            changeOnSelect
            onChange={(value) => {
              initDs.current.set({
                pickWareRegionCodeList: value
                  ?.filter((p) => !p.countryFlag)
                  ?.map((p) => p.regionCode),
                pickWareRegionIdList: value?.filter((p) => !p.countryFlag)?.map((p) => p.regionId),
                pickWareNeedValidate: 1,
              });
              optionDs.setQueryParameter('countryId', value?.[0]?.countryId);
            }}
          />
          <TextField name="pickWareFullAddress" />
          <TextField name="pickContactName" />
          <TextField
            name="pickMobilePhone"
            addonBeforeStyle={{ padding: 0, border: 'none', width: 160 }}
            addonBefore={<Select clearButton={false} name="pickInternationalTelCode" />}
          />
          <DateTimePicker name="reserveTime" />
        </Form>
      </div>
    );
  });

  const PersonInfoForm = observer(({ dataSet }) => {
    return (
      <>
        <p className="seconed-title" style={{ fontSize: 14 }}>
          {intl.get(`mallf.saleAppli.view.contactInfo`).d('联系人信息')}
          <AddressLov
            mode="button"
            color="primary"
            funcType="flat"
            className="address-lov-btn"
            clearButton={false}
            needCreateReceiverAddress={false}
            lovPara={{ companyId, userId }}
            onChange={(address) => {
              initDs.current.init({
                returnWareFullAddress: address?.address,
                customerAddressId: address?.addressId,
                customerContactName: address?.contactName,
                customerMobilePhone: address?.mobile,
                customerInternationalTelCode: address?.internationalTelCode,
                returnWareAddress: address?.regionNameList,
                returnWareRegionCodeList: address?.regionCodeList,
                returnWareRegionIdList: address?.regionIdList,
                returnWareNeedValidate: 0,
              });
            }}
            {...state.customerAddressLovPara}
          >
            {intl.get(`mallf.saleAppli.model.choose.address`).d('选择地址')}
          </AddressLov>
        </p>
        <div className="after-service-info">
          <span>
            {intl
              .get('mallf.saleAppli.after.submit.returnInfoTip')
              .d(`售后申请提交后，商家可能会通过您维护的联系人信息与您沟通，请核实联系人信息无误`)}
          </span>
        </div>
        {CuxFn({ name: 'OMSSaleAfterApplication-fn-renderAddressInfo', value: { state } })()}
        <Form dataSet={dataSet} labelLayout="float" columns={2}>
          <Cascader
            async
            onOption={nodeCover}
            name="returnWareAddress"
            style={{ width: '100%' }}
            menuMode="single"
            onChoose={(value) => {
              // 处理暂不选择 去除最后一位
              const virtualFlag = value?.find((p) => p.virtualFlag);
              const isNAFlag = value?.find((p) => p.isNAFlag);
              if (isNAFlag) {
                // N/A字段 需要将regionName处理为空不展示 优先级大于虚拟字段
                const regionIdList = value?.reduce((pre, cur) => {
                  return pre.concat(cur.regionIdList || []);
                }, []);
                initDs.current.set({
                  returnWareRegionCodeList: isNAFlag?.levelPath?.split('.'), // 设置提交的regioncodeList 为N/A项的levelPath分割
                  returnWareRegionIdList: regionIdList,
                });
                const list = [...toJS(initDs.current.get('returnWareAddress'))];
                list.splice(list.length - 1, 1);
                initDs.current.set('returnWareAddress', list);
                return;
              }
              if (virtualFlag) {
                initDs.current.set({
                  returnWareRegionCodeList: value
                    ?.filter((p) => !p.countryFlag && !p.virtualFlag)
                    ?.map((p) => p.regionCode),
                  returnWareRegionIdList: value
                    ?.filter((p) => !p.countryFlag && !p.virtualFlag)
                    ?.map((p) => p.regionId),
                });
                const list = [...toJS(initDs.current.get('returnWareAddress'))];
                list[4].regionName = '';
                initDs.current.set('returnWareAddress', list);
              }
            }}
            changeOnSelect
            onChange={(value) => {
              initDs.current.set({
                returnWareRegionCodeList: value
                  ?.filter((p) => !p.countryFlag)
                  ?.map((p) => p.regionCode),
                returnWareRegionIdList: value
                  ?.filter((p) => !p.countryFlag)
                  ?.map((p) => p.regionId),
                returnWareNeedValidate: 1,
              });
              optionDs.setQueryParameter('countryId', value?.[0]?.countryId);
            }}
          />
          <TextField name="returnWareFullAddress" />
          <TextField name="customerContactName" />
          <TextField
            name="customerMobilePhone"
            addonBeforeStyle={{ padding: 0, border: 'none', width: 160 }}
            addonBefore={<Select clearButton={false} name="customerInternationalTelCode" />}
          />
        </Form>
      </>
    );
  });

  return (
    <div className={classNames(['container', styles['sale-after-application-body']])}>
      <BreadCrumbs
        value={{
          pageTitle: {
            path: `${getHomePath()}my-mall/my-order`,
            name: intl.get('mallf.common.view.orderCenter').d('订单中心'),
          },
          childTitle1: intl.get(`mallf.saleAppli.view.afterSalesAppli`).d('售后申请'),
        }}
      />
      <Spin dataSet={initDs}>
        <div className="application-container">
          <div className="application-header">
            {intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}: {poNum}
          </div>
          <div className="application-content">
            <div className="application-content-left">
              <div className="info-top">
                <div className="content-title-box">
                  <p className="content-title">
                    {intl.get('mallf.saleAppli.view.aftersales.service').d('售后服务')}
                    <p
                      r-if={!isEmpty(state.goodsData?.giveawayDetailed)}
                      className="warning-zengpin"
                    >
                      {intl
                        .get('mallf.saleAppli.warning.aftersales.zengpin')
                        .d('服务类型为退货时，需要连同赠品/附件一同退回')}
                    </p>
                  </p>
                </div>
                <SupplierComponent>
                  <div className="after-service-info">
                    <span>
                      {intl
                        .get('mallf.saleAppli.after.supplier.from', {
                          value: state.goodsData.supplierCompanyName,
                        })
                        .d(`本次售后服务将由${state.goodsData.supplierCompanyName}为您提供`)}
                    </span>
                  </div>
                </SupplierComponent>
                <ServiceForm dataSet={initDs} />
              </div>
              <div className="info-center">
                <p className="content-title">
                  {intl.get('mallf.saleAppli.view.sure.info').d('确认信息')}
                </p>
                <ReturnTypeForm dataSet={initDs} />
                <PickInfoForm dataSet={initDs} />
                <PersonInfoForm dataSet={initDs} />
              </div>
              <div className="info-bottom">
                <Button
                  waitType="throttle"
                  wait={500}
                  loading={state.submitLoading}
                  color="primary"
                  onClick={() => {
                    handleSubmit();
                  }}
                >
                  {intl.get('hzero.common.button.submit').d('提交')}
                </Button>
              </div>
            </div>
            <div className="application-content-right">
              <div className="goods-info-title">
                {intl.get(`mallf.saleAppli.view.productInformation`).d('商品信息')}
              </div>
              <div className="goods-info-box">
                <div r-if={state.goodsData?.supplierCode === 'MANUAL'}>
                  {getMamanualRequestImg({ width: '82px', height: '82px' })}
                </div>
                <Link
                  r-if={state.goodsData?.supplierCode !== 'MANUAL'}
                  className="goods-image"
                  to={`${getHomePath()}product-detail?productId=${
                    state.goodsData?.skuId
                  }&sourceFrom=${state.goodsData?.supplierCode}`}
                >
                  <Image value={state.goodsData?.imagePath} width={82} height={82} />
                </Link>
                <div className="goods-details">
                  <Link
                    className="goods-detail"
                    disabled={state.goodsData?.supplierCode === 'MANUAL'}
                    to={`${getHomePath()}product-detail?productId=${
                      state.goodsData?.skuId
                    }&sourceFrom=${state.goodsData?.supplierCode}`}
                  >
                    <p>{state.goodsData?.skuName}</p>
                  </Link>
                  <p className="goods-code">
                    {intl.get('mallf.saleAppli.view.productCode').d('商品编码')}：
                    {state.goodsData?.skuCode}
                  </p>
                  <p className="goods-code">
                    {intl.get('mallf.saleAppli.view.available.quantity').d('可售后数量')}：
                    {saleNumMessage}
                  </p>
                </div>
              </div>
              <GiftList
                giftList={state.goodsData?.giveawayDetailed || []}
                saleNumDesc={intl.get('mallf.saleAppli.view.available.quantity').d('可售后数量')}
              />
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
}

export default compose(
  c7nCustomize({
    unitCode: ['MALL.SALEAFTER.APPLICATION.AFTERSALE.SERVICE'],
  }),
  formatterCollections({ code: ['mallf.saleAppli', 'mallf.orderDetail', 'mallf.addOrderComment'] })
)(SaleAfterApplication);
