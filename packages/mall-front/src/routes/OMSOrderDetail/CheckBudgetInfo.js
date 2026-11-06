import React, { useEffect } from 'react';
import { isEmpty } from 'lodash';
import BudgetInfo from 'components/NewBudgetInfo';
import { getUserConfigInfo } from 'utils/utils';

import cuxComponent from 'cuxTools/cuxComponent';
import { batchGetCodes } from 'services/api';
import { fetchBudgetLov } from 'services/productDetailService';
import useSetState from '@/hooks/useState';

function CheckBudgetInfo(props) {
  const { budgetData: product } = props;
  const { isNewCart } = getUserConfigInfo();
  const [state, setState] = useSetState({
    budgetList: [],
    budgetSelectList: [],
  });
  const { budgetSwitch } = getUserConfigInfo();

  const { budgetList, budgetSelectList } = state;

  useEffect(() => {
    if (budgetSwitch === '1') {
      getBudgetInfo();
    }
  }, [budgetSwitch]);

  // 预算值集查询
  const getBudgetInfo = () => {
    fetchBudgetLov().then((res) => {
      if (res) {
        let selectLovCodeObj = {};
        res
          .filter((item) => item.componentType === 'SELECT')
          .forEach((n) => {
            const { lovCode } = n;
            selectLovCodeObj = { ...selectLovCodeObj, [lovCode]: lovCode };
          });
        setState({
          budgetList: res,
        });
        if (!isEmpty(selectLovCodeObj)) {
          batchGetCodes(selectLovCodeObj).then((resp) => {
            if (resp) {
              setState({
                budgetSelectList: resp,
              });
            }
          });
        }
      }
    });
  };

  return (
    !isEmpty(budgetList) && (
      <div className="right-btn">
        <span>
          <BudgetInfo
            remainingVisible={false}
            disabled
            budgetData={{
              ...product,
              budgetSwitch: !isEmpty(product.budgetInfoList) && !isNewCart ? '1' : '0',
            }}
            budgetList={budgetList}
            budgetSelectList={budgetSelectList}
            editBudget={(n) => n}
          />
        </span>
      </div>
    )
  );
}

export default cuxComponent({ path: 'OMSOrderDetail/CheckBudgetInfo' })(CheckBudgetInfo);
