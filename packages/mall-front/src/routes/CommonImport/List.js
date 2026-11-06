import React, { useMemo, useState } from 'react';
import { Input, InputNumber, Form, Switch } from 'hzero-ui';

import intl from 'utils/intl';
import EditTable from './EditTable';

import Tag from './Tag';

const FormItem = Form.Item;

const getInput = (type) => {
  switch (type) {
    case 'String':
      return <Input />;
    case 'Decimal':
      return <InputNumber />;
    case 'Long':
      return <InputNumber />;
    case 'Boolean':
      return <Switch checkedValue unCheckedValue={false} />;
    // case 'Date':
    //   return <Switch />;
    default:
      return <Input />;
  }
};

export default function List(props) {
  const {
    columns: dynamicColumns = [],
    dataSource = [],
    importStatus = [],
    loading,
    onSave = (e) => e,
  } = props;

  const [editKey, setEditKey] = useState(null);

  const getDynamicColumns = useMemo(() => {
    return dynamicColumns.map((item) => ({
      ...item,
      // editable
      // required
      // fixed: editKey !== null ? null : item.fixed,
      width: editKey !== null || !item.width ? 180 : item.width,
      render: (val, record) => {
        const { getFieldDecorator } = record.$form;
        if (item.editable && editKey === record._id) {
          return (
            <FormItem>
              {getFieldDecorator(item.dataIndex, {
                initialValue: record[item.dataIndex],
                rules: [
                  {
                    required: item.required,
                    message: intl
                      .get(`mallf.commonImport.validate.notNull`, {
                        value: item.title,
                      })
                      .d(`${item.title}不能为空`),
                  },
                ],
              })(getInput(item.columnType))}
            </FormItem>
          );
        } else {
          return val;
        }
      },
    }));
  }, [dynamicColumns, editKey]);

  const handleCancel = () => {
    setEditKey(null);
  };

  const handleEdit = (record) => {
    setEditKey(record._id);
  };

  const handleSave = (record) => {
    onSave(record, handleCancel);
  };

  const statusColumns = [
    {
      title: intl.get('mallf.commonImport.model.dataStatus').d('数据状态'),
      dataIndex: '_dataStatus',
      width: 120,
      render: (val) => {
        const statusList = [
          { status: 'NEW', color: '#7bbd53' /* , text: 'Excel导入' */ },
          { status: 'VALID_SUCCESS', color: '#c88f08' /* , text: '验证成功' */ },
          { status: 'VALID_FAILED', color: '#d05211' /* , text: '验证失败' */ },
          { status: 'IMPORT_SUCCESS', color: '#c88f08' /* , text: '导入成功' */ },
          { status: 'IMPORT_FAILED', color: '#d05211' /* , text: '导入失败' */ },
          { status: 'CHECK_FAILED', color: '#d05211' /* , text: '导入失败' */ },
          { status: 'IMPORT_FAILED', color: '#d05211' /* , text: '导入失败' */ },
          { status: 'ERROR', color: '#d05211' /* , text: '数据异常' */ },
        ];
        const tagProps = importStatus
          .map((item) => ({
            color: statusList.find((f) => f.status === item.value)?.color,
            text: item.meaning,
            status: item.value,
          }))
          .find((f) => f.status === val);
        return tagProps && <Tag {...tagProps} />;
      },
    },
    {
      title: intl.get('mallf.commonImport.model.comment.errorMsg').d('错误信息'),
      dataIndex: 'errorMsg',
    },
  ];

  const defaultColumns = [
    {
      title: intl.get('mallf.commonImport.view.operation').d('操作'),
      width: 110,
      key: '_operator',
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const disabled = getDynamicColumns.every((item) => !item.editable) || editKey !== null;
        const { getFieldDecorator } = record.$form;
        if (editKey === record._id) {
          return (
            <FormItem>
              {getFieldDecorator('_operator')(
                <>
                  <a style={{ marginRight: 8 }} onClick={() => handleSave(record)}>
                    {intl.get('mallf.commonImport.button.save').d('保存')}
                  </a>
                  <a onClick={handleCancel}>
                    {intl.get('mallf.commonImport.button.cancel').d('取消')}
                  </a>
                </>
              )}
            </FormItem>
          );
        } else {
          return (
            <a disabled={disabled} onClick={() => handleEdit(record)}>
              {intl.get('mallf.commonImport.model.edit').d('编辑')}
            </a>
          );
        }
      },
    },
  ];

  const renderContent = useMemo(() => {
    const columns = [...statusColumns, ...getDynamicColumns, ...defaultColumns];
    const scrollX =
      columns
        .filter((c) => c.width)
        .map((m) => m.width)
        .reduce((prev, next) => prev + next) + 300;
    const tableProps = {
      dataSource,
      columns,
      loading,
      bordered: true,
      scroll: { x: scrollX },
      pagination: false,
    };
    return <EditTable {...tableProps} />;
  }, [dataSource, getDynamicColumns, editKey]);

  return <div className="import-table-container">{renderContent}</div>;
}
