import React from 'react';
import { Form, Input, Modal } from 'choerodon-ui';
import 'moment/locale/zh-cn';
import '../OMSSaleDetail/ReasonModal.less';
import intl from 'utils/intl';

const { TextArea } = Input;
const FormItem = Form.Item;

function ReasonModal(props) {
  const {
    reasonVisible,
    onOk,
    onCancel,
    afterSaleCode = '',
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
      width={520}
      title={intl.get(`mallf.common.view.cancel.application`).d('取消申请')}
      visible={reasonVisible}
      okText={intl.get(`mallf.common.model.confirm`).d('确认')}
      cancelText={intl.get(`mallf.common.button.cancel`).d('取消')}
      onCancel={onCancel}
      onOk={handleOk}
      // confirmLoading={listLoading}
    >
      <p style={{ fontSize: '14px', margin: '20px 0' }}>
        {intl
          .get('mallf.mySaleAfter.view.cancel.afterSaleRequestHeader.title', {
            value: afterSaleCode,
          })
          .d(`您确定要取消售后申请【${afterSaleCode}】吗？`)}
      </p>
      <FormItem label={intl.get(`mallf.common.view.cancelReason`).d('取消原因')} required>
        {getFieldDecorator('cancelReason', {
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
        })(<TextArea label={intl.get(`mallf.common.view.cancelReasonr`).d('取消原因')} rows={3} />)}
      </FormItem>
    </Modal>
  );
}
export default Form.create({ fieldNameProp: null })(ReasonModal);
