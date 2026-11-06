/* eslint-disable no-param-reassign */
import React, { useMemo, useEffect, useState } from 'react';
import classnames from 'classnames';
import { DatePicker, Input, Button, Row, Col, Form, Modal, Select, Tooltip } from 'choerodon-ui';
import moment from 'moment';
import uuid from 'uuid/v4';

import { PHONE, EMAIL } from 'utils/regExp';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import Lov from 'components/NewLov';
import { timestampToTime, getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';
import UploadFile from 'mall-front/lib/routes/BeforeCompanyOrder/UploadFile';
import { queryUnifyIdpValue } from 'mall-front/lib/services/api';

import styles from './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const { Option } = Select;
function CataInfo(props) {
  const { hideFieldList = [] } = getUserConfigInfo();
  const [ceView, setCeView] = useState('');
  const [receiverTypeData, setReceiverTypeData] = useState([]);
  const { order = {}, orderIndex, orderTime, setOrderData, orderData, form } = props;

  const isStore = useMemo(() => order.isStoreDo === 1, []);

  useEffect(() => {
    queryUnifyIdpValue('SCUX.WATSONS.RECEIVER_TYPE').then((res) => {
      setReceiverTypeData(res);
    });
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].purchaseHeaderForm = form;
      return newOrderData;
    });
  }, []);

  function handleChange(value, field) {
    setOrderData((data) => {
      const newOrderData = [...data];
      if (field === 'isStoreDo') {
        const {
          smId,
          smName,
          smMobile,
          createId,
          createName,
          createMobile,
          pmId,
          pmName,
          pmMobile,
        } = order;
        const { ceNumber, realPmId, realPmName, realPmMobile } = props.form.getFieldsValue() || {};
        if (value === '2' && ceNumber) {
          newOrderData[orderIndex].receiverContactId = realPmId || pmId;
          newOrderData[orderIndex].receiverContactName = realPmName || pmName;
          newOrderData[orderIndex].realReceiverContactId = realPmId || pmId;
          newOrderData[orderIndex].realReceiverContactName = realPmName || pmName;
          props.form.setFieldsValue({
            receiverContactId: realPmId || pmId,
            receiverContactName: realPmName || pmName,
            receiverContactMobile: realPmMobile || pmMobile,
            realReceiverContactId: realPmId || pmId,
            realReceiverContactName: realPmName || pmName,
            mobile: realPmMobile || pmMobile,
          });
        } else {
          newOrderData[orderIndex].receiverContactId = value === '1' ? smId : createId;
          newOrderData[orderIndex].receiverContactName = value === '1' ? smName : createName;
          newOrderData[orderIndex].realReceiverContactId = value === '1' ? smId : createId;
          newOrderData[orderIndex].realReceiverContactName = value === '1' ? smName : createName;
          props.form.setFieldsValue({
            receiverContactId: value === '1' ? smId : createId,
            receiverContactName: value === '1' ? smName : createName,
            receiverContactMobile: value === '1' ? smMobile : createMobile,
            realReceiverContactId: value === '1' ? smId : createId,
            realReceiverContactName: value === '1' ? smName : createName,
            mobile: value === '1' ? smMobile : createMobile,
          });
        }
      }
      if (field === 'remark') {
        // if(value)
        const hasSpace = /\s/.test(value);
        let newValue = value;
        if (hasSpace) {
          newValue = value.replace(/\s/g, '');
          // 更新表单值
          form.setFieldsValue({ [field]: newValue });
        }
      }
      newOrderData[orderIndex][field] = value;
      delete newOrderData[orderIndex].DS;
      return newOrderData;
    });
  }

  function useOtherHeaderPurchase() {
    Modal.confirm({
      title: intl.get('mallf.myMall.view.sureNum').d('确认数量'),
      width: 460,
      content: (
        <div className="content-modal-confirm">
          {intl
            .getHTML('mallf.common.view.beforeOrder.useOther', {
              value: orderIndex < 9 ? `0${orderIndex + 1}` : orderIndex + 1,
            })
            .d(
              <span>
                确定将
                <strong>采购申请单${orderIndex < 9 ? `0${orderIndex + 1}` : orderIndex + 1}</strong>
                的采购申请信息应用至全部采购申请单吗？
              </span>
            )}
        </div>
      ),
      onOk() {
        orderData.forEach((o, index) => {
          const {
            smId,
            smName,
            smMobile,
            createId,
            createName,
            createMobile,
            pmId,
            pmName,
            pmMobile,
          } = o;
          const isStoreDo = props.form.getFieldValue('isStoreDo');
          const { ceNumber, realPmId, realPmName, realPmMobile } =
            o.purchaseHeaderForm.getFieldsValue() || {};
          let realReceiverContactId;
          let realReceiverContactName;
          let receiverContactName;
          let receiverContactId;
          let receiverContactMobile;
          let mobile;
          switch (isStoreDo) {
            case '0':
              realReceiverContactId = props.form.getFieldValue('realReceiverContactId');
              realReceiverContactName = props.form.getFieldValue('realReceiverContactName');
              receiverContactName = props.form.getFieldValue('receiverContactName');
              receiverContactId = props.form.getFieldValue('receiverContactId');
              receiverContactMobile = props.form.getFieldValue('receiverContactMobile');
              mobile = props.form.getFieldValue('mobile');
              break;
            case '1':
              realReceiverContactId = smId;
              realReceiverContactName = smName;
              receiverContactName = smName;
              receiverContactId = smId;
              receiverContactMobile = smMobile;
              mobile = smMobile;
              break;
            case '2':
              realReceiverContactId = ceNumber ? realPmId || pmId : createId;
              realReceiverContactName = ceNumber ? realPmName || pmName : createName;
              receiverContactName = ceNumber ? realPmName || pmName : createName;
              receiverContactId = ceNumber ? realPmId || pmId : createId;
              receiverContactMobile = ceNumber ? realPmMobile || pmMobile : createMobile;
              mobile = ceNumber ? realPmMobile || pmMobile : createMobile;
              break;
            default:
              break;
          }
          if (index !== orderIndex) {
            o.purchaseHeaderForm.setFieldsValue({
              neededDate: props.form.getFieldValue('neededDate'),
              remark: props.form.getFieldValue('remark'),
              // discription: props.form.getFieldValue('discription'),
              thirdPhone: props.form.getFieldValue('thirdPhone'),
              thirdEmail: props.form.getFieldValue('thirdEmail'),
              isStoreDo,
              realReceiverContactId,
              realReceiverContactName,
              receiverContactName,
              receiverContactId,
              receiverContactMobile,
              mobile,
            });
            o.remark = props.form.getFieldValue('remark');
            o.neededDate = props.form.getFieldValue('neededDate')?.format(DEFAULT_DATETIME_FORMAT);
            o.shoppingCartDTOList.forEach((product) => {
              product.neededDate = props.form
                .getFieldValue('neededDate')
                ?.format(DEFAULT_DATETIME_FORMAT);
            });
          }
        });
      },
    });
  }

  // 内部附件
  const imageUuid = useMemo(() => {
    const u = uuid();
    handleChange(u, 'attachmentUuid');
    return u;
  }, []);

  // 外部附件
  const outerAttachmentUuid = useMemo(() => {
    const u = uuid();
    handleChange(u, 'outerAttachmentUuid');
    return u;
  }, []);

  const { getFieldDecorator } = props.form;
  const {
    ceId,
    ceNumber,
    ceDetail,
    ceDiscription,
  } = order.watsonsShoppingCartDTOList?.[0].allocationInfoList?.[0];
  // 费用项目为固资必填
  const ceRequiredFlag = order.watsonsShoppingCartDTOList?.some((n) =>
    n.allocationInfoList?.some((m) => m.projectCostCode === '1406')
  );

  return (
    <div className={styles.container}>
      <div className={classnames(['other-info', 'date-urgent-info'])} style={{ padding: '20px 0' }}>
        <p
          style={{
            fontSize: 14,
            color: '#191919',
            marginBottom: 15,
            fontWeight: 500,
            padding: '0 20px',
          }}
        >
          {intl.get('mallf.common.view.apply.info').d('采购申请信息')}
        </p>
        <Form normalize={(value) => value?.trim() || ''}>
          <Row gutter={12} style={{ margin: '18px -6px', padding: '0 20px' }}>
            {order?.showCeFlag === 1 && (
              <Col span={8}>
                <FormItem>
                  {getFieldDecorator('discription', {
                    initialValue: ceDiscription,
                  })}
                  {getFieldDecorator('ceId', {
                    initialValue: ceId,
                  })}
                  {getFieldDecorator('itemName', {
                    initialValue: ceDetail,
                  })}
                  {getFieldDecorator('realPmId', {
                    initialValue: order.pmId,
                  })}
                  {getFieldDecorator('realPmName', {
                    initialValue: order.pmName,
                  })}
                  {getFieldDecorator('realPmMobile', {
                    initialValue: order.pmMobile,
                  })}
                  {getFieldDecorator('ceNumber', {
                    initialValue: ceNumber ? `${ceNumber}(${ceDetail})` : null,
                    rules: [
                      {
                        required: ceRequiredFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: 'CE号',
                        }),
                      },
                    ],
                  })(
                    <Lov
                      tooltip={ceView}
                      placeholder="CE号（采购固定资产时必须填写）"
                      label="CE号"
                      title="CE号"
                      textValue={ceNumber ? `${ceNumber}(${ceDetail})` : null}
                      code="SCUX.WATSONS.CE_BASIC_VIEW"
                      queryParams={{ storeNo: order.storeNo }}
                      lovOptions={{
                        displayField: 'ceView',
                        valueField: 'ceId',
                      }}
                      onOk={(_, data) => {
                        setCeView(data.ceView);
                        form.setFieldsValue({
                          ceNumber: data.ceView,
                          discription: data.description,
                          ceId: data.ceId,
                          itemName: data.itemName,
                          realPmId: data.realPmId,
                          realPmName: data.realPmName,
                          realPmMobile: data.realPmMobile,
                        });
                      }}
                      onClear={() => {
                        setCeView('');
                        form.setFieldsValue({
                          ceNumber: '',
                          discription: '',
                          ceId: '',
                          itemName: '',
                          realPmId: '',
                          realPmName: '',
                          realPmMobile: '',
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={8}>
              <UploadFile
                maxSize={5}
                bucketName="private-bucket"
                directory="mall-front"
                attachmentUuid={imageUuid}
                uploadText={intl.get('mallf.common.view.button.insideFile').d('内部附件')}
              />
            </Col>
            <Col span={8}>
              <UploadFile
                maxSize={5}
                bucketName="private-bucket"
                directory="mall-front"
                attachmentUuid={outerAttachmentUuid}
                uploadText={intl.get('mallf.common.view.button.externalFile').d('外部附件')}
              />
            </Col>
          </Row>
          {orderData.length > 1 && (
            <Row
              style={{
                paddingTop: 18,
                borderTop: '1px solid #EBEBEB',
                padding: '20px',
              }}
            >
              <Tooltip title="“系统收货人”、“实际收货人”和“实际收货人联系电话”只有系统收货人类型为【创建人】时才可以应用至全部，其他类型如有修改，需要逐单编辑">
                <Button
                  className="purchase-header-useOther-btn"
                  onClick={() => {
                    useOtherHeaderPurchase();
                  }}
                >
                  {intl
                    .get('mallf.companyOrder.watsons.header.useOther')
                    .d('应用以下至全部采购申请单')}
                </Button>
              </Tooltip>
            </Row>
          )}
          <Row gutter={12} style={{ padding: '0 20px' }}>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('isStoreDo', {
                  initialValue: isStore ? '1' : null,
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get('hzero.common.validation.notNull', {
                          name: intl.get(`mallf.common.view.receiverType`).d('系统收货人类型'),
                        })
                        .d('系统收货人类型不能为空'),
                    },
                  ],
                })(
                  <Select
                    label={intl.get(`mallf.common.view.receiverType`).d('系统收货人类型')}
                    // disabled={isStore}
                    onChange={(val) => handleChange(val, 'isStoreDo')}
                  >
                    {receiverTypeData.map((option) => (
                      <Option value={option.value}>{option.meaning}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('receiverContactId', {
                  initialValue: order.receiverContactId,
                })}
                {getFieldDecorator('receiverContactName', {
                  initialValue: isStore ? order.receiverContactName : '',
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`mallf.myMall.model.companyOrder.systemReceiveName`)
                            .d('系统收货人'),
                        })
                        .d('系统收货人不能为空'),
                    },
                  ],
                })(
                  <Lov
                    label={intl
                      .get(`mallf.myMall.model.companyOrder.systemReceiveName`)
                      .d('系统收货人')}
                    textValue={props.form.getFieldValue('receiverContactName')}
                    code="SCUX.MALL.WATSON.SUB.ACCOUNT"
                    queryParams={{
                      lovCode: 'HWFP.SUB_ACCOUNT',
                      tenantId: getUserConfigInfo().organizationId,
                    }}
                    lovOptions={{
                      displayField: 'realName',
                      valueField: 'id',
                    }}
                    allowClear={false}
                    onOk={(_, data) => {
                      form.setFieldsValue({
                        receiverContactName: data.realName,
                        receiverContactId: data.id,
                        receiverContactMobile: data.phone,
                      });
                    }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('receiverContactMobile', {
                  initialValue: isStore ? order.smMobile : '',
                  rules: [
                    {
                      max: 30,
                      message: intl.get(`mallf.common.view.maxWidth30`).d('最大长度为30'),
                    },
                  ],
                })(
                  <Input
                    label={intl
                      .get(`mallf.common.view.receiverContactMobile`)
                      .d('系统收货人联系电话')}
                    value={props.form.getFieldValue('receiverContactMobile')}
                    onChange={(e) => handleChange(e.target.value, 'receiverContactMobile')}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={12} style={{ padding: '0 20px' }}>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('realReceiverContactId', {
                  initialValue: order.realReceiverContactId,
                })}
                {getFieldDecorator('realReceiverContactName', {
                  initialValue: isStore ? order.realReceiverContactName : '',
                  rules: [
                    {
                      max: 30,
                      message: intl.get(`mallf.common.view.maxWidth30`).d('最大长度为30'),
                    },
                    {
                      required: true,
                      message: intl
                        .get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`mallf.myMall.model.companyOrder.realReceiverContact`)
                            .d('实际收货人'),
                        })
                        .d('实际收货人不能为空'),
                    },
                  ],
                })(
                  <Input
                    label={intl
                      .get(`mallf.myMall.model.companyOrder.realReceiverContact`)
                      .d('实际收货人')}
                    value={props.form.getFieldValue('realReceiverContactName')}
                    onChange={(e) => handleChange(e.target.value, 'realReceiverContactName')}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('mobile', {
                  initialValue: isStore ? order.smMobile : '',
                  rules: [
                    {
                      max: 30,
                      message: intl.get(`mallf.common.view.maxWidth30`).d('最大长度为30'),
                    },
                    {
                      pattern: PHONE,
                      message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                    },
                    {
                      required: true,
                      message: intl
                        .get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`mallf.common.view.realConsigneeContactPhone`)
                            .d('实际收货人联系电话'),
                        })
                        .d('实际收货人联系电话不能为空'),
                    },
                  ],
                })(
                  <Input
                    label={intl
                      .get(`mallf.common.view.realConsigneeContactPhone`)
                      .d('实际收货人联系电话')}
                    value={props.form.getFieldValue('mobile')}
                    onChange={(e) => handleChange(e.target.value, 'mobile')}
                  />
                )}
              </FormItem>
            </Col>
            {!hideFieldList.includes('DEMAND_DATE') && (
              <Col span={8}>
                <FormItem>
                  {getFieldDecorator('neededDate')(
                    <DatePicker
                      label={intl.get('mallf.myMall.model.requestDate').d('需求日期')}
                      placeholder={intl.get('mallf.myMall.model.requestDate').d('需求日期')}
                      format="YYYY-MM-DD hh:mm:ss"
                      allowClear={false}
                      style={{ width: 370 }}
                      defaultValue={moment(order.neededDate)}
                      onChange={(_, dateString) => {
                        orderTime(dateString, orderIndex);
                      }}
                      disabledDate={(currentDate) =>
                        moment(timestampToTime()).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            )}
          </Row>
          <Row gutter={12} style={{ padding: '0 20px' }}>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('thirdPhone', {
                  initialValue: order.thirdPhone,
                  rules: [
                    {
                      max: 30,
                      message: intl.get(`mallf.common.view.maxWidth30`).d('最大长度为30'),
                    },
                    {
                      pattern: PHONE,
                      message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                    },
                  ],
                })(
                  <Input
                    label={intl.get(`mallf.common.view.thirdPhone`).d('第三方(施工方）手机号')}
                    placeholder={intl
                      .get('mallf.common.view.watsons.thirdPhoneConfirm')
                      .d('第三方(施工方）手机号(非必填，一般适用于店铺维修品类)')}
                    value={order.thirdPhone}
                    onChange={(e) => handleChange(e.target.value, 'thirdPhone')}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('thirdEmail', {
                  initialValue: order.thirdEmail,
                  rules: [
                    {
                      max: 30,
                      message: intl.get(`mallf.common.view.maxWidth30`).d('最大长度为30'),
                    },
                    {
                      pattern: EMAIL,
                      message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                    },
                  ],
                })(
                  <Input
                    label={intl.get(`mallf.common.view.thirdEmail`).d('第三方(施工方）邮箱')}
                    placeholder={intl
                      .get('mallf.common.view.watsons.thirdEmailConfirm')
                      .d('第三方(施工方）邮箱(非必填，一般适用于店铺维修品类)')}
                    value={order.thirdEmail}
                    onChange={(e) => handleChange(e.target.value, 'thirdEmail')}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem>
                {getFieldDecorator('remark', {
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get('hzero.common.validation.notNull', {
                          name: intl.get('mallf.common.view.amount.remark').d('费用说明'),
                        })
                        .d('费用说明不能为空'),
                    },
                    {
                      pattern: /^\S*$/,
                      message: '输入的内容不允许存在空格或换行！',
                    },
                  ],
                })(
                  <TextArea
                    value={order.remark}
                    placeholder="费用说明填写指引：信息填写不全可能会导致审批驳回，请在此处填写订单申请原因，及物料汇总信息如：购买5个skin货架，更换32个skin货架价格签……"
                    rows={6}
                    maxLength={100}
                    label={intl.get('mallf.common.view.amount.remark').d('费用说明')}
                    onChange={(e) => handleChange(e.target.value, 'remark')}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

export default Form.create({ fieldNameProp: null })(CataInfo);
