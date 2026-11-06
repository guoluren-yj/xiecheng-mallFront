import { openComfirmModal } from 'utils/modals';
import intl from 'utils/intl';
import { getBasketApprovalTypeApi } from '../services/index';

function basketBeforeSubmit(props) {
  return new Promise(async (resolve) => {
    const result = await getBasketApprovalTypeApi();
    if (result && +result.tag === 1) {
      // 是工作流审批
      openComfirmModal({
        title: intl.get('mallf.common.view.change.warning').d('温馨提示'),
        children: '是否提交加入拼单',
        onOk() {
          resolve(true);
        },
        onCancel() {
          const { dataSet } = props || {};
          if (dataSet) {
            dataSet.status = 'ready';
          }
          resolve(false);
        },
      });
    } else {
      resolve(true);
    }
  });
}

export { basketBeforeSubmit };
