import React from 'react';
import { Form, Input, Modal } from 'choerodon-ui';
import intl from 'utils/intl';
import '../OMSSaleDetail/ReasonModal.less';

import 'moment/locale/zh-cn';

const { TextArea } = Input;
const FormItem = Form.Item;

function ReasonModal(props) {
  const {
    reasonVisible,
    onOk,
    onCancel,
    form: { getFieldDecorator, validateFields },
  } = props;

  const handleOk = () => {
    validateFields((err, values) => {
      if (!err) {
        const params = {
          ...values,
        };
        onOk(params);
      }
    });
  };
  return (
    <Modal
      destroyOnClose
      wrapClassName="hmall-content-Modal add-adrees-modal reason-modal-button-style"
      width={400}
      title={intl.get(`mallf.common.view.cancelReason`).d('取消原因')}
      visible={reasonVisible}
      okText={intl.get(`mallf.common.model.confirm`).d('确认')}
      cancelText={intl.get(`mallf.common.button.cancel`).d('取消')}
      onCancel={onCancel}
      onOk={handleOk}
      // confirmLoading={listLoading}
    >
      <FormItem label={intl.get(`mallf.common.view.cancelReason`).d('取消原因')} required>
        {getFieldDecorator('reason', {
          rules: [
            {
              required: true,
              message: intl
                .get('hzero.common.validation.notNull', {
                  name: intl.get(`mallf.common.view.cancelReason`).d('取消原因'),
                })
                .d(`${intl.get(`mallf.common.view.cancelReason`).d('取消原因')}不能为空`),
            },
          ],
        })(<TextArea rows={3} />)}
      </FormItem>
    </Modal>
  );
}
export default Form.create({ fieldNameProp: null })(ReasonModal);
