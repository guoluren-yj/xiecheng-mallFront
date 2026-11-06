// 备注弹窗组件
import React, { useMemo } from 'react';
import { DataSet, Form, TextArea } from 'choerodon-ui/pro';

const RemarkModal = ({ modal, onOk, message, label, required, maxLength }) => {
  const ds = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [{ name: 'remark', label, required, maxLength }],
      }),
    []
  );
  modal.handleOk(() => handleOk());
  async function handleOk() {
    const flag = await ds.validate();
    if (flag) {
      return onOk(ds.current.get('remark'));
    }
    return false;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>{message}</div>
      <Form labelLayout="float" columns={1} dataSet={ds}>
        <TextArea name="remark" resize="vertical" showLengthInfo />
      </Form>
    </div>
  );
};

export default RemarkModal;
