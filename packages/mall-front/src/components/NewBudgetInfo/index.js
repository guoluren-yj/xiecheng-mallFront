import React, { useState } from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
// import { getUserConfigInfo } from 'utils/utils';
import BudgetEditModal from './BudgetModal';
import styles from './budget.less';

function BudgetInfo(props) {
  const {
    budgetData,
    budgetList,
    budgetSelectList,
    saveCallBack,
    disabled,
    remainingVisible = true, // 是否展示余额
    batchFlag,
    alwayShow,
  } = props;
  const { itemId } = batchFlag ? {} : budgetData;
  const [budgetVisible, setBudgetVisible] = useState(false);
  // const { budgetSwitch } = getUserConfigInfo();

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
    pounchOut: batchFlag ? budgetData[0]?.qtHeaderNo : budgetData?.qtHeaderNo,
    batchFlag,
  };

  const budgetSwitchFlag = batchFlag || budgetData?.budgetSwitch === '1';

  // 代买情况下存在多公司id
  const companyIdList =
    (batchFlag && Array.from(new Set(budgetData.map((n) => n.companyId)))) || [];
  const companyIdOnlyFlag = companyIdList.length > 1;
  return (
    <>
      {(alwayShow ||
        (budgetSwitchFlag &&
          !isEmpty(budgetList) &&
          !(budgetData?.budgetInfoList?.[0]?.budget === '{}' && disabled))) && (
          <div className={styles[`${batchFlag ? 'budget-batch' : 'budget-item'}`]}>
            <a
              onClick={() => {
              setBudgetVisible(true);
            }}
              disabled={
              batchFlag &&
              (isEmpty(budgetData) ||
                companyIdOnlyFlag ||
                budgetData.some((n) => n.invalidFlag === 0))
            }
              className="primary-color"
            >
              {batchFlag
              ? intl.get('mallf.common.budget.info.batch').d('批量预算分配')
              : intl.get('mallf.common.budget.info').d('预算信息')}
            </a>
          </div>
      )}
      {budgetVisible && <BudgetEditModal {...budgetModalProps} />}
    </>
  );
}

export default BudgetInfo;
