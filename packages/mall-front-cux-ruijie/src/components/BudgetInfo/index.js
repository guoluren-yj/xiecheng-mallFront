import React, { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import { fetchEmployeeNum } from '../../services/budgetService';
import BudgetEditModal from './BudgetModal';
import styles from './budget.less';

function BudgetInfo(props) {
  const {
    budgetData,
    budgetSelectList,
    saveCallBack,
    disabled,
    remainingVisible = true, // 是否展示余额
    batchFlag,
  } = props;
  const { itemId } = batchFlag ? {} : budgetData;
  const [budgetVisible, setBudgetVisible] = useState(false);
  const [employeeNum, setEmployeeNum] = useState(undefined);
  const { budgetSwitch } = getUserConfigInfo();

  const budgetModalProps = {
    budgetData,
    budgetSelectList,
    budgetVisible,
    remainingVisible,
    setBudgetVisible,
    saveCallBack,
    itemId,
    disabled,
    pounchOut: budgetData?.qtHeaderNo,
    batchFlag,
    employeeNum,
  };

  useEffect(() => {
    if (budgetVisible) {
      fetchEmployeeNum().then((res) => {
        setEmployeeNum(res?.employeeNum || '');
      });
    }
  }, [budgetVisible]);

  return (
    <>
      {budgetSwitch === '1' && (
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
      )}
      {budgetVisible && employeeNum !== undefined && <BudgetEditModal {...budgetModalProps} />}
    </>
  );
}

export default BudgetInfo;
