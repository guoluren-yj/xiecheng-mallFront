import React, { useState, useEffect } from 'react';
import { EMAIL } from 'utils/regExp';
import { Spin, Modal, Icon, Input, Form } from 'choerodon-ui';
import classNames from 'classnames';
import OverflowTip from 'components/OverflowTip';

import intl from 'utils/intl';

const { Sidebar } = Modal;
const { TextArea } = Input;

function InvoiceModal(props) {
  const {
    visible,
    modalType,
    initInvoiceInfo = {},
    invoiceData = {},
    onOk,
    onCancel,
    form: { getFieldDecorator, validateFields, setFieldsValue },
    invoiceCheckData = {},
    // setInvoiceCheckData,
    // order,
  } = props;
  const [invoiceType, setInvoiceType] = useState({
    invoiceTypeCode: undefined,
    invoiceTypeName: '',
    validateFlag: false,
  }); // 发票类型
  const [invoiceTitleType, setInvoiceTitleType] = useState({
    invoiceTitleTypeCode: undefined,
    selectInvoiceName: '',
    validateFlag: false,
  }); // 发票抬头
  const [invoiceMethod, setInvoiceMethod] = useState({
    invoiceMethodCode: undefined,
    invoiceStatusName: '',
    validateFlag: false,
  }); // 开票方式
  const [invoiceDetailType, setInvoiceDetailType] = useState({
    invoiceDetailTypeCode: undefined,
    invoiceContentName: '',
    validateFlag: false,
  }); // 开票明细

  // 内采无需开票发票信息禁止编辑
  const innerDisabledFlag = modalType === 'cata' && invoiceMethod.invoiceMethodCode === '2';
  // // 内采注册电话/开户行账号必填标识
  // const innerNoRequiredFlag =
  //   modalType === 'cata' &&
  //   invoiceType.invoiceTypeCode === '1' &&
  //   invoiceTitleType.invoiceTitleTypeCode === '1';
  const specialInvoiceFlag = ['2', '4'].includes(invoiceType.invoiceTypeCode);

  useEffect(() => {
    setInvoiceType({
      ...invoiceType,
      invoiceTypeCode: initInvoiceInfo.invoiceTypeCode,
      invoiceTypeName: initInvoiceInfo.invoiceTypeName,
    });
    setInvoiceDetailType({
      ...invoiceDetailType,
      invoiceDetailTypeCode: initInvoiceInfo.invoiceDetailTypeCode,
      invoiceContentName: initInvoiceInfo.invoiceContentName,
    });
    setInvoiceMethod({
      ...invoiceMethod,
      invoiceMethodCode: initInvoiceInfo.invoiceMethodCode,
      invoiceStatusName: initInvoiceInfo.invoiceStatusName,
    });
    setInvoiceTitleType({
      ...invoiceTitleType,
      invoiceTitleTypeCode: initInvoiceInfo.invoiceTitleTypeCode,
      selectInvoiceName: initInvoiceInfo.selectInvoiceName,
    });
  }, [initInvoiceInfo]); // 发票初始信息
  const invoices = modalType === 'cata' ? invoiceData.catainvoiceData : invoiceData.ecinvoiceData;
  const {
    invoiceType: types = [],
    invoiceTitleType: titleTypes = [],
    invoiceMethod: methods = [],
    invoiceDetailType: detailTypes = [],
  } = invoices || {};

  // 无需开票
  const handleNoInvoiceMethod = () => {
    setInvoiceType({
      ...invoiceType,
      invoiceTypeCode: undefined,
      invoiceTypeName: '',
      validateFlag: false,
    });
    setInvoiceDetailType({
      ...invoiceDetailType,
      invoiceDetailTypeCode: undefined,
      invoiceContentName: '',
      validateFlag: false,
    });
    setInvoiceMethod({
      ...invoiceMethod,
      invoiceMethodCode: initInvoiceInfo.invoiceMethodCode,
      invoiceStatusName: initInvoiceInfo.invoiceStatusName,
      validateFlag: false,
    });
    setInvoiceTitleType({
      ...invoiceTitleType,
      invoiceTitleTypeCode: undefined,
      selectInvoiceName: '',
      validateFlag: false,
    });
    return false;
  };

  const handleOk = () => {
    if (innerDisabledFlag) {
      onOk({
        ...invoiceType,
        ...invoiceTitleType,
        ...invoiceMethod,
        ...invoiceDetailType,
        innerCompanyInvoiceVO: {},
      });
      return false;
    }
    if (
      innerDisabledFlag ||
      (invoiceType.invoiceTypeCode &&
        invoiceTitleType.invoiceTitleTypeCode &&
        invoiceMethod.invoiceMethodCode &&
        invoiceDetailType.invoiceDetailTypeCode)
    ) {
      validateFields(
        (err, values) => {
          if (!err) {
            if (modalType === 'cata') {
              onOk({
                ...invoiceType,
                ...invoiceTitleType,
                ...invoiceMethod,
                ...invoiceDetailType,
                innerCompanyInvoiceVO: {
                  ...invoiceCheckData,
                  ...values,
                },
              });
            } else {
              // setInvoiceCheckData({
              //   ...invoiceCheckData,
              //   ...values,
              // });
              onOk({ ...invoiceType, ...invoiceTitleType, ...invoiceMethod, ...invoiceDetailType });
            }
          }
        },
        {
          force: true,
        }
      );
    } else {
      setInvoiceMethod({
        ...invoiceMethod,
        validateFlag: invoiceMethod.invoiceMethodCode === undefined,
      });
      setInvoiceType({
        ...invoiceType,
        validateFlag: invoiceType.invoiceTypeCode === undefined,
      });
      setInvoiceTitleType({
        ...invoiceTitleType,
        validateFlag: invoiceTitleType.invoiceTitleTypeCode === undefined,
      });
      setInvoiceDetailType({
        ...invoiceDetailType,
        validateFlag: invoiceDetailType.invoiceDetailTypeCode === undefined,
      });
    }
  };

  return (
    <Sidebar
      destroyOnClose
      wrapClassName="invoice-edit-modal"
      width={742}
      title={intl.get(`mallf.myMall.model.invoiceInfo`).d('发票信息')}
      visible={visible}
      okText={intl.get(`mallf.common.model.confirm`).d('确认')}
      cancelText={intl.get(`mallf.common.model.cancel`).d('取消')}
      onCancel={onCancel}
      onOk={handleOk}
      maskClosable={false}
    >
      <Spin spinning={false}>
        <div className="invoice-wrapper">
          <div className="invoice-container">
            <div className="invoice-line">
              <div className="invoice-label">
                {intl.get('mallf.myMall.model.invoiceMethod').d('开票方式')}
              </div>
              <div className="invoice-sel">
                {methods.map((type) => {
                  return (
                    <span
                      key={type.valueCode}
                      title={type.valueName}
                      className={classNames({
                        active: invoiceMethod.invoiceMethodCode === type.valueCode,
                      })}
                      onClick={() => {
                        // 内采无需开票
                        if (modalType === 'cata' && type.valueCode === '2') {
                          handleNoInvoiceMethod();
                        }
                        setInvoiceMethod({
                          ...invoiceMethod,
                          invoiceMethodCode: type.valueCode,
                          invoiceStatusName: type.valueName,
                          validateFlag: false,
                        });
                      }}
                    >
                      <OverflowTip style={{ padding: '0 10px' }}>{type.valueName}</OverflowTip>
                      {invoiceMethod.invoiceMethodCode === type.valueCode && (
                        <div className="default-icon">
                          <Icon type="done" />
                        </div>
                      )}
                    </span>
                  );
                })}
              </div>
              <span
                className="validate-msg"
                style={{ display: invoiceMethod.validateFlag ? 'inline-block' : 'none' }}
              >
                {intl.get('mallf.companyOrder.view.chooseInvoice').d('请选择开票方式')}
              </span>
            </div>
            {!innerDisabledFlag && (
              <>
                <div className="invoice-line">
                  <p className="invoice-label">
                    {intl.get('mallf.myMall.model.invoiceType').d('发票类型')}
                  </p>
                  <div className="invoice-sel">
                    {types.map((type) => {
                      return (
                        <span
                          key={type.valueCode}
                          title={type.valueName}
                          className={classNames({
                            active: invoiceType.invoiceTypeCode === type.valueCode,
                            'disable-select':
                              (modalType === 'cata' && innerDisabledFlag) ||
                              ((invoiceMethod.invoiceMethodCode === '2' ||
                                invoiceTitleType.invoiceTitleTypeCode === '2') &&
                                // || invoiceDetailType.invoiceDetailTypeCode === '100'
                                type.valueCode === '2'),
                          })}
                          onClick={() => {
                            if (
                              (modalType === 'cata' && innerDisabledFlag) ||
                              ((invoiceMethod.invoiceMethodCode === '2' ||
                                invoiceTitleType.invoiceTitleTypeCode === '2') &&
                                // || invoiceDetailType.invoiceDetailTypeCode === '100'
                                type.valueCode === '2')
                            ) {
                              return false;
                            }
                            if (
                              invoiceTitleType.invoiceTitleTypeCode === '2' &&
                              type.valueCode === '2'
                            ) {
                              // 增票开个人，清空
                              setInvoiceTitleType({
                                ...invoiceTitleType,
                                invoiceTitleTypeCode: '',
                                selectInvoiceName: '',
                                validateFlag: false,
                              });
                            }
                            const data = props.form.getFieldsValue();
                            props.form.resetFields();
                            props.form.setFieldsValue(data);
                            setInvoiceType({
                              ...invoiceType,
                              invoiceTypeCode: type.valueCode,
                              invoiceTypeName: type.valueName,
                              validateFlag: false,
                            });
                          }}
                        >
                          <OverflowTip style={{ padding: '0 10px' }}>{type.valueName}</OverflowTip>
                          {invoiceType.invoiceTypeCode === type.valueCode && (
                            <div className="default-icon">
                              <Icon type="done" />
                            </div>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <span
                    className="validate-msg"
                    style={{ display: invoiceType.validateFlag ? 'inline-block' : 'none' }}
                  >
                    {intl.get('mallf.companyOrder.view.chooseInvoiceType').d('请选择发票类型')}
                  </span>
                </div>
                <div className="invoice-line">
                  <p className="invoice-label">
                    {intl.get('mallf.common.model.invoiceForm').d('发票形式')}
                  </p>
                  <div className="invoice-sel">
                    {titleTypes.map((type) => (
                      <span
                        key={type.valueCode}
                        title={type.valueName}
                        className={classNames({
                          active: invoiceTitleType.invoiceTitleTypeCode === type.valueCode,
                          'disable-select':
                            innerDisabledFlag ||
                            (invoiceType.invoiceTypeCode === '2' && type.valueCode === '2'),
                        })}
                        onClick={() => {
                          if (
                            innerDisabledFlag ||
                            (invoiceType.invoiceTypeCode === '2' && type.valueCode === '2')
                          ) {
                            return false;
                          }
                          if (modalType === 'cata') {
                            if (initInvoiceInfo.invoiceTitleTypeCode === '1') {
                              setFieldsValue({
                                invoiceHeader:
                                  type.valueCode === '1' ? invoiceCheckData.invoiceHeader : '',
                              });
                            } else {
                              setFieldsValue({
                                invoiceHeader:
                                  type.valueCode === '1'
                                    ? invoiceCheckData.defaultInvoiceHeader
                                    : invoiceCheckData.invoiceHeader,
                              });
                            }
                            const data = props.form.getFieldsValue();
                            props.form.resetFields();
                            props.form.setFieldsValue(data);
                          }
                          setInvoiceTitleType({
                            ...invoiceTitleType,
                            invoiceTitleTypeCode: type.valueCode,
                            selectInvoiceName: type.valueName,
                            validateFlag: false,
                          });
                        }}
                      >
                        <OverflowTip style={{ padding: '0 10px' }}>{type.valueName}</OverflowTip>
                        {invoiceTitleType.invoiceTitleTypeCode === type.valueCode && (
                          <div className="default-icon">
                            <Icon type="done" />
                          </div>
                        )}
                      </span>
                    ))}
                  </div>
                  <span
                    className="validate-msg"
                    style={{ display: invoiceTitleType.validateFlag ? 'inline-block' : 'none' }}
                  >
                    {intl.get('mallf.myMall.view.chooseInvoiceForm').d('请选择发票形式')}
                  </span>
                </div>
                <div className="invoice-line">
                  <p className="invoice-label">
                    {intl.get('mallf.myMall.model.invoiceDetail').d('开票明细')}
                  </p>
                  <div className="invoice-sel">
                    {detailTypes.map((type) => (
                      <span
                        key={type.valueCode}
                        title={type.valueName}
                        className={classNames({
                          active: invoiceDetailType.invoiceDetailTypeCode === type.valueCode,
                          // 'disable-select':
                          //   innerDisabledFlag ||
                          //   (invoiceType.invoiceTypeCode === '2' && type.valueCode === '100'),
                        })}
                        onClick={() => {
                          // if (
                          //   innerDisabledFlag ||
                          //   (invoiceType.invoiceTypeCode === '2' && type.valueCode === '100')
                          // ) {
                          //   return false;
                          // }
                          setInvoiceDetailType({
                            ...invoiceDetailType,
                            invoiceDetailTypeCode: type.valueCode,
                            invoiceContentName: type.valueName,
                            validateFlag: false,
                          });
                        }}
                      >
                        <OverflowTip style={{ padding: '0 10px' }}>{type.valueName}</OverflowTip>
                        {invoiceDetailType.invoiceDetailTypeCode === type.valueCode && (
                          <div className="default-icon">
                            <Icon type="done" />
                          </div>
                        )}
                      </span>
                    ))}
                  </div>
                  <span
                    className="validate-msg"
                    style={{ display: invoiceDetailType.validateFlag ? 'inline-block' : 'none' }}
                  >
                    {intl.get('mallf.myMall.view.chooseInvoiceDetail').d('请选择开票明细')}
                  </span>
                </div>
                <Form>
                  <Form.Item>
                    {getFieldDecorator('invoiceHeader', {
                      initialValue: invoiceCheckData.invoiceHeader,
                      rules: [
                        {
                          required: true,
                          message: intl
                            .get('hzero.common.validation.notNull', {
                              name: intl.get('mallf.myMall.model.invoiceTitle').d('发票抬头'),
                            })
                            .d('需求日期不能为空'),
                        },
                      ],
                    })(
                      <Input
                        disabled={modalType === 'ec' || innerDisabledFlag}
                        style={{ width: 512 }}
                        label={intl.get('mallf.myMall.model.invoiceTitle').d('发票抬头')}
                      />
                    )}
                  </Form.Item>
                  {invoiceTitleType.invoiceTitleTypeCode !== '2' && (
                    <>
                      <Form.Item>
                        {getFieldDecorator('taxRegistrationNumber', {
                          initialValue: invoiceCheckData.taxRegistrationNumber,
                          rules: [
                            {
                              required: invoiceType.invoiceTypeCode === '2',
                              message: intl
                                .get('hzero.common.validation.notNull', {
                                  name: intl.get('mallf.myMall.model.taxId').d('税务登记号'),
                                })
                                .d('税务登记号不能为空'),
                            },
                          ],
                        })(
                          <Input
                            disabled={modalType === 'ec' || innerDisabledFlag}
                            style={{ width: 512 }}
                            label={intl.get('mallf.myMall.model.taxId').d('税务登记号')}
                          />
                        )}
                      </Form.Item>
                      {modalType === 'cata' && (
                        <div style={{ width: 512, display: 'flex' }}>
                          <div>
                            <Form.Item>
                              {getFieldDecorator('taxRegistrationAddress', {
                                initialValue: invoiceCheckData.taxRegistrationAddress,
                                rules: [
                                  {
                                    required: invoiceType.invoiceTypeCode === '2',
                                    message: intl
                                      .get('hzero.common.validation.notNull', {
                                        name: intl
                                          .get('mallf.common.model.registerAddress')
                                          .d('注册地址'),
                                      })
                                      .d('注册地址不能为空'),
                                  },
                                ],
                              })(
                                <Input
                                  disabled={innerDisabledFlag}
                                  style={{ width: 251, marginRight: 10 }}
                                  label={intl
                                    .get('mallf.common.model.registerAddress')
                                    .d('注册地址')}
                                />
                              )}
                            </Form.Item>
                          </div>
                          <div>
                            <Form.Item>
                              {getFieldDecorator('taxRegistrationPhone', {
                                initialValue: invoiceCheckData.taxRegistrationPhone,
                                rules: [
                                  {
                                    required: specialInvoiceFlag,
                                    message: intl
                                      .get('hzero.common.validation.notNull', {
                                        name: intl
                                          .get('mallf.common.model.registerPhone')
                                          .d('注册电话'),
                                      })
                                      .d('注册电话不能为空'),
                                  },
                                ],
                              })(
                                <Input
                                  disabled={innerDisabledFlag}
                                  style={{ width: 251 }}
                                  label={intl.get('mallf.common.model.registerPhone').d('注册电话')}
                                />
                              )}
                            </Form.Item>
                          </div>
                        </div>
                      )}
                      <div style={{ width: 512, display: 'flex' }}>
                        <div>
                          <Form.Item>
                            {getFieldDecorator('depositBank', {
                              initialValue: invoiceCheckData.depositBank,
                              rules: [
                                {
                                  required: invoiceType.invoiceTypeCode === '2',
                                  message: intl
                                    .get('hzero.common.validation.notNull', {
                                      name: intl.get('mallf.myMall.model.openingBank').d('开户行'),
                                    })
                                    .d('开户行不能为空'),
                                },
                              ],
                            })(
                              <Input
                                disabled={modalType === 'ec' || innerDisabledFlag}
                                style={{ width: 251, marginRight: 10 }}
                                label={intl.get('mallf.myMall.model.openingBank').d('开户行')}
                              />
                            )}
                          </Form.Item>
                        </div>
                        <div>
                          <Form.Item>
                            {getFieldDecorator('bankAccountNum', {
                              initialValue: invoiceCheckData.bankAccountNum,
                              rules: [
                                {
                                  required: specialInvoiceFlag,
                                  message: intl
                                    .get('hzero.common.validation.notNull', {
                                      name: intl
                                        .get('mallf.myMall.model.openingBankId')
                                        .d('开户行账号'),
                                    })
                                    .d('开户行账号不能为空'),
                                },
                              ],
                            })(
                              <Input
                                disabled={modalType === 'ec' || innerDisabledFlag}
                                style={{ width: 251 }}
                                label={intl.get('mallf.myMall.model.openingBankId').d('开户行账号')}
                              />
                            )}
                          </Form.Item>
                        </div>
                      </div>
                    </>
                  )}
                  <div style={{ width: 256 }}>
                    <Form.Item>
                      {getFieldDecorator('innerInvoiceEmail', {
                        initialValue: invoiceCheckData.innerInvoiceEmail,
                        rules: [
                          {
                            pattern: EMAIL,
                            message: intl.get(`mallf.common.model.emailErrMsg`).d('邮箱格式不正确'),
                          },
                        ],
                      })(<Input label={intl.get('hzero.common.button.email').d('邮箱')} />)}
                    </Form.Item>
                  </div>
                  {modalType === 'cata' && (
                    <div style={{ width: '60%' }}>
                      <Form.Item>
                        {getFieldDecorator('invoiceRemark', {
                          initialValue: invoiceCheckData.invoiceRemark,
                        })(
                          <TextArea
                            maxLength={100}
                            label={intl.get('hzero.common.button.remark').d('备注')}
                          />
                        )}
                      </Form.Item>
                    </div>
                  )}
                </Form>
              </>
            )}
          </div>
        </div>
      </Spin>
    </Sidebar>
  );
}

export default Form.create({ fieldNameProp: null })(InvoiceModal);
