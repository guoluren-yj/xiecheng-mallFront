import React, { useState } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import BudgetEditModal from './BudgetEditModal';
import styles from './budget.less';

export default function Budget(props) {
  const { disabled, budgetData = {}, saveCallBack, batchFlag } = props;
  const [budgetVisible, setBudgetVisible] = useState(false);

  const budgetModalProps = {
    budgetData,
    budgetVisible,
    setBudgetVisible,
    disabled,
    saveCallBack,
    batchFlag,
  };

  return (
    <>
      <div className={styles[`${batchFlag ? 'budget-batch' : 'budget-item'}`]}>
        <a
          onClick={() => {
            setBudgetVisible(true);
          }}
          disabled={batchFlag && isEmpty(budgetData)}
          className="primary-color"
        >
          {batchFlag
            ? intl.get('mallf.common.budget.info.batch').d('批量预算分配')
            : intl.get('mallf.common.budget.info').d('预算信息')}
        </a>
      </div>
      {budgetVisible && <BudgetEditModal {...budgetModalProps} />}
    </>
  );
}
