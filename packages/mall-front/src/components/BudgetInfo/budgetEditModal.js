import React, { useState } from 'react';
import { Form, Modal, Select, Button, Table, Popover, InputNumber, Spin } from 'choerodon-ui';
import { sum, isEmpty } from 'lodash';
import intl from 'utils/intl';
import Lov from 'components/lov';
import { getUserConfigInfo, filterNullValueObject, getPrecision } from 'utils/utils';
import style from './budget.less';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const FormItem = Form.Item;
const { Sidebar } = Modal;

function budgetEdit(props) {
  const {
    form,
    budgetInfoList,
    budgetList,
    minPackageQuantity,
    minPurchaseQuantity,
    budgetSelectList,
    budgetVisible,
    onCancelBudget,
    onSaveBudget,
    buggetRemainChange,
    onHandleDalete,
    budgetLoading,
    disabled,
    pounchOut, // pounchOut商品
    itemId, // 水滴筹预算科目二开查询条件
    remainingVisible, // 是否展示余额
    uomPrecision, // 单位精度
  } = props;
  const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
  const { getFieldDecorator, setFieldsValue } = form;
  const { tenantNum } = getUserConfigInfo()?.userInfo;
  const { userId, companyId } = getUserConfigInfo();
  const [selectedRows, setSelectedRows] = useState([]);
  const [cancelBudgetIds, setCancelBudgetIds] = useState([]); // 取消行的budgetId集合
  function splitBudgetId(params = []) {
    const formData = form.getFieldsValue();
    // 多个预算维度信息遍历
    return params.map((n) => {
      const { budgetId } = n;
      let newObj = {};
      // 预算维度字段遍历n
      Object.keys(formData).forEach((key) => {
        if (key.includes(budgetId)) {
          newObj = {
            ...newObj,
            [key.split(budgetId)[1]]: formData[key], // 去除budgetId
          };
        }
      });
      const { quantity, ...others } = newObj;
      return { ...n, quantity, budget: JSON.stringify(filterNullValueObject(others)) };
    });
  }

  function handleOK() {
    form.validateFields((err) => {
      // 过滤掉不需要检验的字段(取消行)
      const newErr = Object.keys(err || {}).filter((n) => {
        return !n.includes('null') && !cancelBudgetIds.find((m) => n.includes(m));
      });
      if (isEmpty(newErr)) {
        onSaveBudget(splitBudgetId(budgetInfoList));
      }
    });
  }

  function handleRemainChange() {
    buggetRemainChange(splitBudgetId(budgetInfoList), 'change');
  }

  function handleDalete(record = [], index) {
    setCancelBudgetIds([...cancelBudgetIds, record[0].budgetId]);
    onHandleDalete(splitBudgetId(record), index);
    setSelectedRows([]);
  }

  const budgetColumns = budgetList.map((item) => {
    const { fieldName, budgetItemName, lovCode, tenantId, valueField, displayField } = item;
    return {
      title: budgetItemName,
      dataIndex: valueField,
      width: 200,
      render: (v, record) => {
        const { budgetId, budget } = record;
        const { componentType, requiredFlag } = item;
        const { [lovCode]: optionList = [] } = budgetSelectList;
        let queryParams = { tenantId };
        // 水滴筹预算科目二开
        if (tenantNum === 'SRM-SDC') {
          if (lovCode === 'SCUX.SD.BUDGET_ACCOUNT') {
            queryParams = { tenantId, itemId };
          }
          if (lovCode === 'SCUX.SD_SBUD_UNIT') {
            queryParams = { tenantId, userId };
          }
        }
        if (tenantNum === 'SRM-CSCMRO') {
          queryParams = { tenantId, companyId };
        }
        return (
          <FormItem {...formLayout}>
            {getFieldDecorator(`${budgetId}${fieldName}`, {
              initialValue: budget[`${budgetId}${fieldName}`],
            })}
            {getFieldDecorator(`${budgetId}${fieldName}Meaning`, {
              initialValue: budget[`${budgetId}${fieldName}Meaning`],
              rules: [
                {
                  required: !!requiredFlag,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: budgetItemName,
                    })
                    .d(`${budgetItemName}不能为空`),
                },
              ],
            })(
              componentType === 'LOV' ? (
                <Lov
                  onOkCallback={(data) => {
                    setFieldsValue({
                      [`${budgetId}${fieldName}`]: data[valueField],
                      [`${budgetId}${fieldName}Meaning`]: data[displayField],
                    });
                    handleRemainChange();
                  }}
                  disabled={disabled}
                  label={budgetItemName}
                  textValue={budget[`${budgetId}${fieldName}Meaning`]}
                  queryParams={queryParams}
                  lovCode={lovCode}
                  width="100%"
                  notAllowClear={disabled}
                />
              ) : (
                <Select
                  allowClear
                  labelInValue
                  label={budgetItemName}
                  style={{ width: '100%' }}
                  disabled={disabled}
                  onChange={(val) => {
                    const { key, label } = val || {};
                    setFieldsValue({
                      ...budget,
                      [`${budgetId}${fieldName}`]: key,
                      [`${budgetId}${fieldName}Meaning`]: label,
                    });
                    handleRemainChange();
                  }}
                >
                  {(optionList || []).map((option) => (
                    <Select.Option value={option.value} key={option.value}>
                      {option.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )
            )}
          </FormItem>
        );
      },
    };
  });

  const columns = [
    {
      title: intl.get(`mallf.common.view.orderSeq`).d('序号'),
      dataIndex: 'orderSeq',
      width: 60,
      render: (val, record, index) => index + 1,
    },
    ...budgetColumns,
    {
      title: intl.get(`mallf.common.view.productNum.order`).d('数量'),
      dataIndex: 'quantity',
      width: 100,
      render: (value, record) => {
        const { budgetId } = record;
        return (
          <FormItem>
            {getFieldDecorator(`${budgetId}quantity`, {
              initialValue: record.quantity,
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get(`mallf.common.view.productNum.order`).d('数量'),
                    })
                    .d(`数量不能为空`),
                },
                {
                  validator: (rule, val, callback) => {
                    if (val && !uomPrecision && val % (minPackageQuantity || 1) !== 0) {
                      callback(
                        `${intl
                          .get('mallf.common.view.errorMinPackageQuantity')
                          .d('最小包装量为')}${minPackageQuantity}`
                      );
                    } else {
                      callback();
                    }
                  },
                },
              ],
            })(
              <InputNumber
                disabled={disabled || pounchOut}
                onChange={(val) => setFieldsValue({ [`${budgetId}quantity`]: val })}
                step={minPackageQuantity || defaultValue}
                min={minPurchaseQuantity || defaultValue}
                precision={uomPrecision}
              />
            )}
          </FormItem>
        );
      },
    },
    remainingVisible && {
      title: intl.get('mallf.common.view.budget.balance').d('预算余额'),
      dataIndex: 'remainingBudget',
      align: 'right',
      width: 120,
      render: (val) => {
        return (
          <Popover content={val ? `${val}` : '-'}>
            <span className="budget-remain">{val ? `${val}` : '-'}</span>
          </Popover>
        );
      },
    },
    {
      title: intl.get('mallf.common.view.prompt').d('提示'),
      dataIndex: 'errorMessage',
      width: 150,
      render: (val) => {
        return (
          <Popover content={val}>
            <span className="error-message">{val}</span>
          </Popover>
        );
      },
    },
  ].filter((p) => !!p);
  if (!pounchOut) {
    columns.push({
      title: intl.get('hzero.common.action').d('操作'),
      dataIndex: 'action',
      width: 100,
      render: (v, record, index) => {
        return (
          !disabled &&
          (record.status !== 'create' ? (
            <a className="delete-budget" onClick={() => handleDalete([record])}>
              {intl.get(`mallf.common.button.delete`).d('删除')}
            </a>
          ) : (
            <a className="delete-budget" onClick={() => handleDalete([record], index)}>
              {intl.get(`mallf.common.button.cancel`).d('取消')}
            </a>
          ))
        );
      },
    });
  }
  const rowSelection = {
    selectedRowKeys: selectedRows.map((n) => n.budgetId),
    onChange: (key, rows) => setSelectedRows(rows),
    getCheckboxProps: (record) => ({ disabled: record.status === 'create' }),
  };
  const rowSelectionProps = {
    [!disabled && 'rowSelection']: rowSelection,
  };
  const tableWidth = sum(columns.map((n) => n.width));
  const footerProps = {
    [disabled && 'footer']: null,
  };
  return (
    <Sidebar
      closable
      destroyOnClose
      wrapClassName={style['budget-modal']}
      width={tableWidth + 100}
      title={
        disabled
          ? intl.get('mallf.common.look.budget.info').d('查看预算信息')
          : intl.get('mallf.common.choose.budget.info').d('选择预算信息')
      }
      visible={budgetVisible}
      okText={intl.get(`mallf.common.model.confirm`).d('确认')}
      cancelText={intl.get(`mallf.common.button.cancel`).d('取消')}
      onCancel={() => onCancelBudget()}
      onOk={handleOK}
      confirmLoading={budgetLoading}
      maskClosable={false}
      {...footerProps}
    >
      {!disabled && !pounchOut && (
        <>
          <Button className="add-budget" icon="playlist_add" onClick={() => props.handleCreate()}>
            {intl.get('mallf.common.view.button.addBudget').d('新建预算')}
          </Button>
          <Button
            className="batch-delete-budget"
            icon="delete"
            disabled={selectedRows.length === 0}
            onClick={() => handleDalete(selectedRows)}
          >
            {intl.get('mallf.common.view.button.batchDelete').d('批量删除')}
          </Button>
        </>
      )}
      <Spin spinning={disabled ? false : budgetLoading}>
        <Table
          rowKey="budgetId"
          filterBar={false}
          columns={columns}
          pagination={false}
          scroll={{ x: tableWidth }}
          dataSource={budgetInfoList}
          {...rowSelectionProps}
        />
      </Spin>
    </Sidebar>
  );
}

const BudgetEditModal = Form.create({ fieldNameProp: null })(budgetEdit);
export default BudgetEditModal;
