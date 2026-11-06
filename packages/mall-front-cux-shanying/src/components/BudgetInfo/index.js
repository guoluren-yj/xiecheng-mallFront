import React, { useState } from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import BudgetEditModal from './BudgetEditModal';
import styles from './budget.less';

function BudgetInfo(props) {
  const {
    budgetData,
    budgetList,
    budgetSelectList,
    saveCallBack,
    disabled,
    batchFlag = false,
    remainingVisible = true,
    labels = {},
  } = props;
  const { itemId } = batchFlag ? {} : budgetData;
  const [budgetVisible, setBudgetVisible] = useState(false);
  const { budgetSwitch } = getUserConfigInfo();

  const budgetModalProps = {
    budgetData,
    budgetList, // 预算维度配置
    budgetSelectList,
    budgetVisible,
    remainingVisible,
    setBudgetVisible,
    saveCallBack,
    itemId,
    disabled,
    pounchOut: budgetData?.qtHeaderNo,
    batchFlag,
    labels,
  };

  return (
    <>
      {!batchFlag && budgetSwitch === '1' && (
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
              : intl.get('mallf.common.budget.complete.info').d('完善信息')}
          </a>
        </div>
      )}
      {budgetVisible && <BudgetEditModal {...budgetModalProps} />}
    </>
  );
}

export default BudgetInfo;
