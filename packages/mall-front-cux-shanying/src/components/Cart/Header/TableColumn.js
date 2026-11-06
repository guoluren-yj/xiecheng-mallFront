import React from 'react';

import intl from 'utils/intl';

import styles from './index.less';

function TableColumn() {
  return (
    <>
      <li className={styles['cart-header-project']}>
        <span id="project">{intl.get(`mallf.cart.view.projectinfo`).d('立项信息')}</span>
      </li>
      <li className={styles['cart-header-mangeUnit']}>
        <span id="manageUnit">{intl.get('mallf.common.model.mangeUnit').d('管理部门')}</span>
      </li>
    </>
  );
}

export default TableColumn;
