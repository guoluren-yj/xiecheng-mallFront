import * as React from 'react';
import { Modal } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { WrapperCommonImport } from './index';
import styles from './index.less';

const useModal = () => {
  /**
   *
   */
  const openModal = (props, modalProps?: any) => {
    const { templateCode, businessObjectTemplateCode, businessObjectTemplateCategory } = props;
    const {
      action = intl.get('hzero.common.button.import').d('导入'),
      actionParams = {},
      key = templateCode || businessObjectTemplateCode || businessObjectTemplateCategory,
    } = props;

    const modal = Modal.open({
      closable: true,
      movable: false,
      drawer: true,
      style: { width: 550 },
      key,
      className: styles['import-modal'],
      destroyOnClose: true,
      title: intl.get(action, actionParams) || action,
      children: <WrapperCommonImport {...props} modalProps={modalProps} />,
      modalFlag: true,
      bodyStyle: { padding: '0.2rem', overflowX: 'hidden' },
      // footer: () => { // modal.update动态写入footer
      //   return (
      //     <>
      //       <C7NButton>
      //         {intl.get('hzero.common.componenets.import.title.history').d('导入历史')}
      //       </C7NButton>
      //       <C7NButton
      //         onClick={() => {
      //           modal.close();
      //         }}
      //       >
      //         {intl.get('hzero.common.button.close').d('关闭')}
      //       </C7NButton>
      //     </>
      //   );
      // },
      ...modalProps,
    });
    return modal;
  };

  return {
    openModal,
  };
};

export default useModal;
