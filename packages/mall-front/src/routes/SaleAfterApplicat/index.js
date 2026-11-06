import React, { useState, useRef, useEffect } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  Breadcrumb,
  Row,
  Form,
  Col,
  Radio,
  Input,
  Icon,
  Button,
  message,
  Select,
  Tooltip,
} from 'choerodon-ui';
import { DateTimePicker, NumberField, Attachment } from 'choerodon-ui/pro';
import qs from 'qs';
import intl from 'utils/intl';
import Swal from 'components/swal';
import Loading from 'components/loading';
import { convertImg, getUserConfigInfo, timestampToTime, getPrecision } from 'utils/utils';
import uuid from 'uuid/v4';
import moment from 'moment';

import Link from 'components/Link';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { isEmpty, compose } from 'lodash';

import { SupplierComponent } from 'utils/renderer';
import Image from 'components/Image';
import AddressCascader from 'components/AddressCascader';
import { fetchCode } from 'services/addressService';
import {
  fetchGoodsInfo,
  fetchSaleNum,
  submitFetch,
  canSaleTypeService,
} from 'services/saleDetailService';
import noSaleImage from '@/assets/images/noSaleImage.svg';

import styles from './index.less';

const RadioGroup = Radio.Group;
// const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;
const InputGroup = Input.Group;
const { Option } = Select;

const imageUuid = uuid();

function App(props) {
  const { location, form, history } = props;
  const {
    getFieldDecorator,
    getFieldsValue,
    // setFieldsValue,
    validateFieldsAndScroll,
    getFieldValue,
  } = form;
  const [submitLoading, setSubmitLoading] = useState(false);
  const [serviceType, setServiceType] = useState('1');
  const [pickType, setPickType] = useState();
  const [goodsData, setGoodsData] = useState({});
  const [hasSaleNum, setHasSaleNum] = useState(0);
  const { poLineId } = qs.parse(location.search.substr(1));
  const [afterSaleTypeList, setAfterSaleTypeList] = useState([{}]);
  const [loading, setLoading] = useState(false);
  const [idds, setIdds] = useState([]);

  const { sourceCode, uomPrecision } = goodsData;
  const defaultValue = uomPrecision && sourceCode === 'CATA' ? getPrecision(uomPrecision) : 1;

  useEffect(() => {
    getGoodsInfo();
    fetchSaleGoodsNum();
  }, []);

  useEffect(() => {
    fetchCode().then((res) => {
      setIdds(res || []);
    });
  }, []);

  // 获取电商可售后类型
  function fetchCanSaleType(params) {
    canSaleTypeService(params)
      .then((res) => {
        setAfterSaleTypeList(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  /**
   * 获取商品信息
   */
  function getGoodsInfo() {
    setLoading(true);
    fetchGoodsInfo(poLineId).then((res) => {
      if (res?.sourceCode !== 'CATA') {
        const params = {
          ecPlatformCode: res?.platformCode,
          orderId: res?.poNum,
          thirdOrderId: res?.poSubNum,
          skuId: res?.productId,
        };
        fetchCanSaleType(params);
      } else {
        setLoading(false);
      }
      setGoodsData(res);
    });
  }

  // 查询可售后数量
  function fetchSaleGoodsNum() {
    const { poSubNum, productNum } = qs.parse(location.search.substr(1));
    fetchSaleNum({ poSubNum, productNum })
      .then((res) => {
        if (res) setHasSaleNum(res);
      })
      .finally(() => {});
  }

  const isLeafRef = useRef();
  /**
   * 选择地址
   * @param {*} idList 地区id
   * @param {*} nameList 地区name
   * @param {*} isLeaf 是否最后一级
   */
  function onAddressChange(codeList, nameList, isLeaf, field) {
    form.setFieldsValue({
      [field]: codeList,
    });
    isLeafRef.current = {
      ...isLeafRef.current,
      [field]: isLeaf,
    };
  }

  /**
   * 提交申请单
   * @param {data} 所有数据
   */
  function handleSubmit() {
    const data = getFieldsValue();
    const {
      reserveTime = {},
      pickWareAddress,
      pickWareFullAddress,
      returnWareAddress,
      returnWareFullAddress,
      applyQuantity,
    } = data;

    if (applyQuantity && String(applyQuantity).split('.')?.[1]?.length > (uomPrecision || 0)) {
      Swal(intl.get('mallf.saleAppli.validation.applyQuantity').d('请输入正确的数量'));
      return;
    }
    const fetchData = {
      ...goodsData,
      ...data,
      afterSaleItem: {
        ...goodsData,
        ...data,
        attachmentUuid: imageUuid,
        productType: 10,
        afsType: data.serviceType, // 服务类型
        tenantId: getUserConfigInfo().organizationId,
      },
      poLineId,
      applicationTime: timestampToTime(), // 申请时间
      companyId: getUserConfigInfo().companyId, // 公司
      pickWareAddress: pickWareFullAddress, // 取件地址
      pickWareProvince: pickWareAddress && pickWareAddress[0], // 取件省
      pickWareCity: pickWareAddress && pickWareAddress[1], // 取件城市
      pickWareCountry: pickWareAddress && pickWareAddress[2], // 取件县
      pickWareVillage: pickWareAddress && pickWareAddress[3], // 取件乡镇
      returnWareAddress: returnWareFullAddress, // 返件地址
      returnWareProvince: returnWareAddress && returnWareAddress[0], // 返件省
      returnWareCity: returnWareAddress && returnWareAddress[1], // 返件城市
      returnWareCountry: returnWareAddress && returnWareAddress[2], // 返件县
      returnWareVillage: returnWareAddress && returnWareAddress[3], // 返件乡镇
      reserveTimeBegin: reserveTime.reserveTimeBegin
        ? reserveTime.reserveTimeBegin.format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      reserveTimeEnd: reserveTime.reserveTimeEnd
        ? reserveTime.reserveTimeEnd.format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      afsType: data.serviceType, // 服务类型
      tenantId: getUserConfigInfo().organizationId, // 租户id
      ouId: getUserConfigInfo().ouId, // ouId
      fromViewUrl: `${window.location.origin}/pub/sale-status-read?afterSaleId=`,
    };
    if (applyQuantity === 0) {
      Swal(intl.get('mallf.saleAppli.quantity.aftersale.more0').d('售后数量不能为0'));
      return;
    }

    if (pickType === '1' && (!fetchData.reserveTimeBegin || !fetchData.reserveTimeEnd)) {
      Swal(
        intl
          .get('hzero.common.validation.notNull', {
            name: intl.get(`mallf.saleAppli.view.reserveTime`).d('预约取件时间'),
          })
          .d('预约取件时间不能为空')
      );
      return;
    }
    validateFieldsAndScroll({ force: true }, (err) => {
      if (serviceType !== '2') {
        // eslint-disable-next-line no-param-reassign
        if (err?.['returnWareAddress-s']) delete err['returnWareAddress-s'];
        // eslint-disable-next-line no-param-reassign
        if (err?.returnWareFullAddress) delete err.returnWareFullAddress;
      }
      if (isEmpty(err)) {
        setSubmitLoading(true);
        submitFetch(fetchData)
          .then((res) => {
            if (res) {
              message.success(
                intl.get('mallf.saleAppli.saleAfter.submit.success').d('售后申请提交成功')
              );
              history.push(
                `/sale-detail?poLineId=${res.poLineId}&poNum=${res.poNum}&productNum=${res.afterSaleItem?.productNum}&poSubNum=${res.poSubNum}`
              );
            }
          })
          .finally(() => {
            setSubmitLoading(false);
          });
      }
    });
  }

  return loading ? (
    <Loading />
  ) : (
    <div className={styles['sale-after-application-body']}>
      <Breadcrumb className="sale-after-application-title" separator=">">
        <Breadcrumb.Item href={getUserConfigInfo().mallType === 'sigl' ? '/sigl' : '/'}>
          {intl.get('mallf.common.view.homePage').d('首页')}
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/my-mall/my-order">
          {intl.get('mallf.common.view.orderCenter').d('订单中心')}
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {intl.get(`mallf.saleAppli.view.afterSalesAppli`).d('售后申请')}
        </Breadcrumb.Item>
      </Breadcrumb>
      {isEmpty(afterSaleTypeList) && goodsData.sourceCode !== 'CATA' ? (
        <>
          <img src={noSaleImage} alt="" style={{ display: 'block', margin: '0 auto' }} />
          <p style={{ fontSize: 14, margin: '0 auto', textAlign: 'center' }}>
            {intl.get('mallf.saleAppli.view.noSaleImage').d('暂不支持售后类型')}
          </p>
        </>
      ) : (
        <>
          <div className="sale-after-application-content">
            <div className="application-header">
              {intl.get('mallf.saleAppli.view.mallOrder.umber').d('商城订单编号')}：
              {goodsData.poNum}
            </div>
            <div className="application-content">
              <Form>
                <div className="application-content-left">
                  <div className="after-service">
                    <div className="after-service-title">
                      {intl.get('mallf.saleAppli.view.aftersales.service').d('售后服务')}
                    </div>
                    <div className="after-service-content">
                      <Row>
                        <Col>
                          <Form.Item
                            label={intl.get(`mallf.saleAppli.view.serviceType`).d('服务类型')}
                          >
                            {getFieldDecorator('serviceType', {
                              rules: [
                                {
                                  required: true,
                                  message: intl
                                    .get('hzero.common.validation.notNull', {
                                      name: intl
                                        .get(`mallf.saleAppli.view.serviceType`)
                                        .d('服务类型'),
                                    })
                                    .d('服务类型不能为空'),
                                },
                              ],
                            })(
                              <RadioGroup
                                label={intl.get(`mallf.saleAppli.view.serviceType`).d('服务类型')}
                                name="serviceType"
                                onChange={(e) => setServiceType(e.target?.value)}
                              >
                                {goodsData.sourceCode === 'CATA' ? (
                                  <>
                                    <Radio value="1">
                                      {intl.get(`mallf.saleAppli.view.return`).d('退货')}
                                    </Radio>
                                    <Radio value="2">
                                      {intl.get(`mallf.saleAppli.view.exchange`).d('换货')}
                                    </Radio>
                                  </>
                                ) : (
                                  afterSaleTypeList.map((n) => (
                                    <Radio value={n.afterSaleType}>{n.afterSaleTypeName}</Radio>
                                  ))
                                )}
                              </RadioGroup>
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Item>
                            {getFieldDecorator('applyQuantity', {
                              rules: [
                                {
                                  required: true,
                                  message: intl
                                    .get('hzero.common.validation.notNull', {
                                      name: intl
                                        .get(`mallf.saleAppli.view.numSubmission`)
                                        .d('提交数量'),
                                    })
                                    .d('提交数量不能为空'),
                                },
                                {
                                  validator: (rule, value, callback) =>
                                    value > hasSaleNum
                                      ? callback(
                                          intl
                                            .get(`mallf.saleAppli.view.maxNumSupportRequest`, {
                                              value: hasSaleNum,
                                            })
                                            .d(`本次支持申请最大数量是${hasSaleNum}`)
                                        )
                                      : callback(),
                                },
                              ],
                            })(
                              <NumberField
                                style={{ width: '100%' }}
                                min={defaultValue}
                                step={defaultValue}
                                max={hasSaleNum}
                                placeholder={intl
                                  .get(`mallf.saleAppli.view.numSubmission`)
                                  .d('提交数量')}
                                precision={uomPrecision}
                              />
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Form.Item>
                            {getFieldDecorator('problemDesc', {
                              rules: [
                                {
                                  required: true,
                                  max: 500,
                                  message: intl
                                    .get('hzero.common.validation.notNull', {
                                      name: intl
                                        .get(`mallf.saleAppli.view.problemDesc`)
                                        .d('问题描述'),
                                    })
                                    .d('问题描述不能为空'),
                                },
                              ],
                            })(
                              <TextArea
                                rows={3}
                                maxLength={500}
                                label={intl.get(`mallf.saleAppli.view.problemDesc`).d('问题描述')}
                              />
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      <div className="add-img">
                        <div className="upload-img">
                          <Attachment
                            label={intl.get('mallf.common.view.uploadPictures').d('上传图片')}
                            labelLayout="float"
                            accept={['image/*']}
                            listType="picture-card"
                            max={9}
                            value={imageUuid}
                            bucketName="public-bucket"
                            bucketDirectory="mall-front"
                            onChange={(e) => e}
                            help={intl
                              .get('mallf.common.view.attProps.helpAccept', {
                                accept: 'PNG、JPG、JPEG',
                              })
                              .d(`支持PNG、JPG、JPEG格式`)}
                          />
                        </div>
                      </div>
                    </div>
                    <SupplierComponent>
                      <div className="after-service-info">
                        <Icon
                          type="error"
                          style={{
                            float: 'left',
                            color: '#FCA000',
                            fontSize: '16px',
                            marginRight: '5px',
                          }}
                        />
                        <span>
                          {intl
                            .get('mallf.saleAppli.after.supplier.from', {
                              value: goodsData.supplierCompanyName,
                            })
                            .d(`本次售后服务将由${goodsData.supplierCompanyName}为您提供`)}
                        </span>
                      </div>
                    </SupplierComponent>
                  </div>
                  <div className="after-confirm-info">
                    <div className="after-confirm-info-title">
                      {intl.get('mallf.saleAppli.view.sure.info').d('确认信息')}
                    </div>
                    <div className="after-confirm-info-content">
                      {/* {goodsData.platformCode !== 'CATA' && (
                        <Row>
                          <Col>
                            <Form.Item>
                              {getFieldDecorator('isNeedDetectionReport')}
                              {getFieldDecorator('isHasInvoice')}
                              {getFieldDecorator('applicationCredentials', {
                                rules: [
                                  {
                                    required: true,
                                    message: intl.get('hzero.common.validation.notNull', {
                                      name: intl
                                        .get(`mallf.saleAppli.view.applicationCredentials`)
                                        .d('申请凭据'),
                                    }),
                                  },
                                ],
                              })(
                                <CheckboxGroup
                                  label={intl
                                    .get(`mallf.saleAppli.view.applicationCredentials`)
                                    .d('申请凭据')}
                                  onChange={(val) => credentialsChange(val)}
                                >
                                  <Checkbox value="isNeedDetectionReport">
                                    {intl.get(`mallf.saleAppli.view.testReport`).d('有检测报告')}
                                  </Checkbox>
                                  <Checkbox value="isHasInvoice">
                                    {intl.get(`mallf.saleAppli.view.haveInvoice`).d('有发票')}
                                  </Checkbox>
                                </CheckboxGroup>
                              )}
                            </Form.Item>
                          </Col>
                        </Row>
                      )} */}
                      <Row>
                        <Col>
                          <Form.Item>
                            {getFieldDecorator('pickWareType', {
                              rules: [
                                {
                                  required: true,
                                  message: intl
                                    .get('hzero.common.validation.notNull', {
                                      name: intl
                                        .get(`mallf.saleAppli.view.pickMethod`)
                                        .d('退件方式'),
                                    })
                                    .d('退件方式不能为空'),
                                },
                              ],
                            })(
                              <RadioGroup
                                label={intl.get(`mallf.saleAppli.view.pickMethod`).d('退件方式')}
                                name="pickType"
                                onChange={(e) => setPickType(e.target?.value)}
                              >
                                {goodsData.platformCode !== 'CATA' ? (
                                  <>
                                    <Radio value="1">
                                      {intl.get('mallf.saleAppli.new.view.pickup').d('上门取件')}
                                    </Radio>
                                    <Radio value="2">
                                      {intl
                                        .get('mallf.saleAppli.view.customer.delivery')
                                        .d('客户发货')}
                                    </Radio>
                                  </>
                                ) : (
                                  <>
                                    <Radio value="3">
                                      {intl.get('mallf.saleAppli.view.pickup').d('第三方物流')}
                                    </Radio>
                                    <Radio value="4">
                                      {intl
                                        .get('mallf.saleAppli.view.customer.delivery')
                                        .d('自行送货')}
                                    </Radio>
                                  </>
                                )}
                              </RadioGroup>
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      <div className="contact-info-title">
                        {intl.get(`mallf.saleAppli.view.contactAddress`).d('联系人地址')}
                      </div>
                      <Row className="contact-info-row">
                        <Col>
                          <Form.Item>
                            {getFieldDecorator('pickWareAddress')}
                            {getFieldDecorator('pickWareAddress-s', {
                              rules: [
                                {
                                  required: true,
                                  message: intl
                                    .get('hzero.common.validation.notNull', {
                                      name: intl
                                        .get(`mallf.common.view.orderDetail.contactAddress`)
                                        .d('联系人地址'),
                                    })
                                    .d('联系人地址不能为空'),
                                },
                                {
                                  validator: (rule, val, callback) => {
                                    if (!isLeafRef.current?.pickWareAddress) {
                                      callback(
                                        intl
                                          .get('mallf.orderDetail.view.errorAddress')
                                          .d('地区不完整')
                                      );
                                    } else {
                                      callback();
                                    }
                                  },
                                },
                              ],
                            })(
                              <AddressCascader
                                label={intl
                                  .get(`mallf.common.view.orderDetail.contactAddress`)
                                  .d('联系人地址')}
                                onChange={(idList, nameList, isLeaf, codeList) =>
                                  onAddressChange(codeList, nameList, isLeaf, 'pickWareAddress')
                                }
                              />
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row className="contact-info-row">
                        <Col>
                          <Form.Item>
                            {getFieldDecorator('pickWareFullAddress', {
                              rules: [
                                {
                                  required: true,
                                  max: 100,
                                  message: intl
                                    .get('hzero.common.validation.notNull', {
                                      name: intl
                                        .get(`mallf.orderDetail.view.pickWareAddress`)
                                        .d('详细地址'),
                                    })
                                    .d('详细地址不能为空'),
                                },
                              ],
                            })(
                              <TextArea
                                rows={3}
                                maxLength={100}
                                label={intl
                                  .get(`mallf.orderDetail.view.pickWareAddress`)
                                  .d('详细地址')}
                              />
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      {serviceType === '2' && (
                        <>
                          <div className="contact-info-title">
                            {intl.get(`mallf.orderDetail.view.returnAddress`).d('返件地址')}
                          </div>
                          <Row className="contact-info-row">
                            <Col>
                              <Form.Item>
                                {getFieldDecorator('returnWareAddress')}
                                {getFieldDecorator('returnWareAddress-s', {
                                  rules: [
                                    {
                                      required: serviceType === '2',
                                      message: intl
                                        .get('hzero.common.validation.notNull', {
                                          name: intl
                                            .get(`mallf.orderDetail.view.returnAddress`)
                                            .d('返件地址'),
                                        })
                                        .d('返件地址不能为空'),
                                    },
                                    {
                                      validator: (rule, val, callback) => {
                                        if (!isLeafRef.current?.returnWareAddress) {
                                          callback(
                                            intl
                                              .get('mallf.orderDetail.view.errorAddress')
                                              .d('地区不完整')
                                          );
                                        } else {
                                          callback();
                                        }
                                      },
                                    },
                                  ],
                                })(
                                  <AddressCascader
                                    label={intl
                                      .get(`mallf.orderDetail.view.returnAddress`)
                                      .d('返件地址')}
                                    onChange={(idList, nameList, isLeaf, codeList) =>
                                      onAddressChange(
                                        codeList,
                                        nameList,
                                        isLeaf,
                                        'returnWareAddress'
                                      )
                                    }
                                  />
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row className="contact-info-row">
                            <Col>
                              <Form.Item>
                                {getFieldDecorator('returnWareFullAddress', {
                                  rules: [
                                    {
                                      required: serviceType === '2',
                                      max: 100,
                                      message: intl
                                        .get('hzero.common.validation.notNull', {
                                          name: intl
                                            .get(`mallf.saleAppli.view.pickWareAddress`)
                                            .d('详细地址'),
                                        })
                                        .d('详细地址不能为空'),
                                    },
                                  ],
                                })(
                                  <TextArea
                                    rows={3}
                                    maxLength={100}
                                    label={intl
                                      .get(`mallf.saleAppli.view.pickWareAddress`)
                                      .d('详细地址')}
                                  />
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      )}
                      <Row>
                        <Col>
                          <Form.Item>
                            {getFieldDecorator('customerContactName', {
                              rules: [
                                {
                                  required: true,
                                  message: intl
                                    .get('hzero.common.validation.notNull', {
                                      name: intl.get(`mallf.orderDetail.view.contact`).d('联系人'),
                                    })
                                    .d('联系人不能为空'),
                                },
                              ],
                            })(
                              <Input
                                label={intl.get(`mallf.orderDetail.view.contact`).d('联系人')}
                              />
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          {/* <Form.Item>
                            {getFieldDecorator('customerMobilePhone', {
                              rules: [
                                {
                                  required: true,
                                  message: intl.get('hzero.common.validation.notNull', {
                                    name: intl.get(`mallf.common.view.contactPhone`).d('联系电话'),
                                  }),
                                },
                                {
                                  pattern: PHONE,
                                  message: intl
                                    .get(`mallf.common.view.validate.phoneNum`)
                                    .d('手机号码格式不正确'),
                                },
                              ],
                            })(
                              <Input
                                label={intl.get(`mallf.common.view.contactPhone`).d('联系电话')}
                              />
                            )}
                          </Form.Item> */}
                          <InputGroup compact style={{ display: 'flex' }}>
                            <Form.Item style={{ width: 110 }}>
                              {getFieldDecorator('internationalTelCode', {
                                initialValue: '+86',
                              })(
                                <Select
                                  allowClear={false}
                                  // disabled={linkDisabled}
                                  // dropdownMatchSelectWidth={false}
                                  style={{ width: 110 }}
                                  label={intl
                                    .get(`mallf.orderDetail.view.internationalTelCode`)
                                    .d('区号')}
                                >
                                  {idds.map((m) => (
                                    <Option value={m.value} key={m.value} title={m.meaning}>
                                      <Tooltip title={m.meaning} placement="left">
                                        {m.meaning}
                                      </Tooltip>
                                    </Option>
                                  ))}
                                </Select>
                              )}
                            </Form.Item>
                            <Form.Item style={{ width: 402 }}>
                              {getFieldDecorator('customerMobilePhone', {
                                rules: [
                                  {
                                    pattern:
                                      getFieldValue('internationalTelCode') === '+86'
                                        ? PHONE
                                        : NOT_CHINA_PHONE,
                                    message: intl
                                      .get(`mallf.orderDetail.view.validate.phoneNum`)
                                      .d('手机号码格式不正确'),
                                  },
                                  {
                                    required: true,
                                    message: intl
                                      .get(`mallf.orderDetail.view.phone.notNull`)
                                      .d('手机不能为空'),
                                  },
                                ],
                              })(
                                <Input label={intl.get(`mallf.orderDetail.view.phone`).d('手机')} />
                              )}
                            </Form.Item>
                          </InputGroup>
                        </Col>
                      </Row>
                      {goodsData.platformCode !== 'CATA' && (
                        <>
                          <Row>
                            <Col>
                              <Form.Item>
                                {getFieldDecorator('customerTel')(
                                  <Input
                                    label={intl
                                      .get('mallf.orderDetail.view.order.contactInformation')
                                      .d('联系方式')}
                                  />
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <Form.Item>
                                {getFieldDecorator('customerPostCode', {
                                  rules: [
                                    {
                                      max: 10,
                                      message: intl.get('hzero.common.validation.max', {
                                        max: 10,
                                      }),
                                    },
                                  ],
                                })(
                                  <Input
                                    label={intl.get(`mallf.saleAppli.view.zipCode`).d('邮编')}
                                  />
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                          {pickType === '1' && (
                            <Row>
                              <Col>
                                <Form.Item>
                                  {getFieldDecorator('reserveTime', {
                                    rules: [
                                      {
                                        required: true,
                                        message: intl
                                          .get('hzero.common.validation.notNull', {
                                            name: intl
                                              .get(`mallf.saleAppli.view.reserveTime`)
                                              .d('预约取件时间'),
                                          })
                                          .d('预约取件时间不能为空'),
                                      },
                                      {
                                        validator: (rule, value, callback) =>
                                          moment(value.reserveTimeBegin) < moment().add(2, 'h')
                                            ? callback(
                                                intl
                                                  .get(
                                                    `mallf.saleAppli.view.appointRequiredToTwoHoursLater`
                                                  )
                                                  .d('预约取件开始时间要求在两小时之后！')
                                              )
                                            : callback(),
                                      },
                                    ],
                                  })(
                                    <DateTimePicker
                                      range={['reserveTimeBegin', 'reserveTimeEnd']}
                                      placeholder={[
                                        intl
                                          .get('mallf.saleAppli.view.reserveTime.start')
                                          .d('预约取件开始时间'),
                                        intl
                                          .get('mallf.saleAppli.view.reserveTime.end')
                                          .d('预约取件结束时间'),
                                      ]}
                                      style={{ width: '100%' }}
                                      min={moment().add(2, 'h')}
                                    />
                                  )}
                                </Form.Item>
                              </Col>
                            </Row>
                          )}
                        </>
                      )}
                    </div>
                    <div className="after-service-info">
                      <Icon
                        type="error"
                        style={{
                          float: 'left',
                          color: '#FCA000',
                          fontSize: '16px',
                          marginRight: '5px',
                        }}
                      />
                      {intl
                        .get(`mallf.saleAppli.view.pleaseKeepPhoneOpen`)
                        .d('提交服务单后，售后专员可能与您电话沟通，请保持手机畅通')}
                    </div>
                  </div>
                </div>
              </Form>
              <div className="application-content-right">
                <div className="goods-info-title">
                  {intl.get(`mallf.orderDetail.view.productInformation`).d('商品信息')}
                </div>
                <div className="goods-info-box">
                  <Link
                    className="goods-image"
                    to={`/product-detail?productId=${goodsData.productId}&sourceFrom=${goodsData.platformCode}`}
                  >
                    <Image
                      value={convertImg(goodsData.imagePath, 1, goodsData.platformCode)}
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
                      {intl.get('mallf.orderDetail.view.productCode').d('商品编码')}：
                      {goodsData.productNum}
                    </p>
                    <p className="goods-code">
                      {intl.get('mallf.orderDetail.view.available.quantity').d('可售后数量')}：
                      {hasSaleNum}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sale-after-footer">
            <Button
              className="sale-after-sub-botton"
              onClick={handleSubmit}
              loading={submitLoading}
            >
              {intl.get(`mallf.orderDetail.button.submit`).d('提交')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// const SaleAfterApplication = Form.crete({ fieldNameProp: null })(App);
export default compose(
  Form.create({ fieldNameProp: null }),
  formatterCollections({ code: ['mallf.saleAppli', 'mallf.orderDetail', 'mallf.addOrderComment'] })
)(App);
