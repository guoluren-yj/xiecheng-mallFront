import React, { useState, useEffect, useCallback } from 'react';
import { Select } from 'hzero-ui';

import Lov from 'components/lov';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import { batchGetCodes } from 'services/api';
import { Input } from 'choerodon-ui';

import { buggetRemain } from 'services/cartService';

// 水滴筹预算维度默认值遍历过渡对象
let transitBudgetObj = {};
export default function BudgetInfo(props) {
  const { budgetList, setBudget, budget, productData = {}, quantity } = props;
  const { itemId, productId, companyId, currencyCode } = productData;
  const { userId, purchaseType, levelPath, secondRegionId } = getUserConfigInfo();
  const [remainingBudget, setRemainingBudget] = useState();

  useEffect(() => {
    let selectLovCodeObj = {};
    budgetList
      .filter((item) => item.componentType === 'SELECT')
      .forEach((n) => {
        const { lovCode } = n;
        selectLovCodeObj = { ...selectLovCodeObj, [lovCode]: lovCode };
      });
    batchGetCodes(selectLovCodeObj).then((res) => {
      if (res) {
        setSelectList(res);
      }
    });
  }, [budgetList]);

  const setBudgetCallBack = useCallback(
    (data) => {
      transitBudgetObj = { ...transitBudgetObj, ...data };
      const params = [
        {
          productId,
          purchaseType,
          levelPath,
          secondRegionId,
          currencyCode,
          companyId,
          budgetInfoList: [
            {
              budget: JSON.stringify(transitBudgetObj),
              quantity: null,
            },
          ],
          quantity,
        },
      ];
      buggetRemain(params).then((res) => {
        if (res[0]) {
          const { budgetInfoList } = res[0];
          setRemainingBudget(budgetInfoList[0]?.remainingBudget);
        }
      });
      setBudget(transitBudgetObj);
    },
    [remainingBudget]
  );

  const [selectList, setSelectList] = useState([]);
  return (
    <>
      {budgetList.length > 0 && (
        <div className="product-budget">
          <div className="product-attr">
            <div className="p-label" style={{ lineHeight: '30px', width: '60px' }}>
              {intl.get('mallf.common.view.budget').d('预算')}
            </div>
            <div className="p-content">
              {budgetList.map((item) => {
                const {
                  fieldName,
                  lovCode,
                  tenantId,
                  valueField,
                  displayField,
                  componentType,
                  title,
                } = item;
                const { [lovCode]: optionList = [] } = selectList;
                let queryParams = { tenantId };
                // 水滴筹预算科目二开
                if (lovCode === 'SCUX.SD.BUDGET_ACCOUNT') {
                  queryParams = { tenantId, itemId };
                }
                if (lovCode === 'SCUX.SD_SBUD_UNIT') {
                  queryParams = { tenantId, userId };
                }
                return componentType === 'LOV' ? (
                  <Lov
                    onOkCallback={(data) => {
                      setBudgetCallBack({
                        [fieldName]: data[valueField],
                        [`${fieldName}Meaning`]: data[displayField],
                      });
                    }}
                    c7n
                    setDefaultValue
                    label={title}
                    queryParams={queryParams}
                    lovCode={lovCode}
                    style={{ width: '140px', margin: '0 10px 10px 0' }}
                    // width="100%"
                  />
                ) : (
                  <Select
                    allowClear
                    labelInValue
                    style={{ width: '140px', margin: '0 10px 10px 0' }}
                    onChange={(val) => {
                      const { key, label } = val || {};
                      setBudget({
                        ...budget,
                        [fieldName]: key,
                        [`${fieldName}Meaning`]: label,
                      });
                    }}
                  >
                    {(optionList || []).map((option) => (
                      <Select.Option value={option.value} key={option.value}>
                        {option.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                );
              })}
              <Input
                style={{ width: '140px' }}
                disabled
                label={intl.get('mallf.common.view.budget.balance').d('预算余额')}
                value={remainingBudget}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
