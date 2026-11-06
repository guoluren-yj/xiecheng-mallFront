import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import { Message } from 'choerodon-ui';
import uuid from 'uuid/v4';

import intl from 'utils/intl';
import {
  buggetRemain,
  deleteBudget,
  updateBudget,
  fetchBudgetInfo,
  updateQuantity,
} from 'services/cartService';
import BudgetEditModal from './budgetEditModal';
import styles from './budget.less';

function BudgetInfo(props) {
  const {
    budgetData,
    budgetList,
    budgetSelectList,
    saveCallBack,
    disabled,
    remainingVisible = true, // 是否展示余额
  } = props;
  const { itemId, minPackageQuantity, minPurchaseQuantity } = budgetData;
  const [budgetVisible, setBudgetVisible] = useState(false);
  const [budgetInfoList, setBudgetInfoList] = useState(budgetData.budgetInfoList || []);
  const [budgetLoading, setBudgetLoading] = useState(false);

  const newBudgetInfoList = budgetInfoList?.map((m) => {
    const { budgetId, budget } = m;
    const newBudgetId = budgetId;
    const newBudget = JSON.parse(budget) || {};
    let newObj = {};
    // 初始化预算维度数据绑定budgetId
    Object.keys(newBudget).forEach((key) => {
      if (!key.includes(budgetId)) {
        newObj = {
          ...newObj,
          [`${newBudgetId}${key}`]: newBudget[key],
        };
      }
    });
    return {
      ...m,
      budgetId: newBudgetId,
      budget: isEmpty(newObj) ? newBudget : newObj,
    };
  });

  // 预算余额查询
  function fetchBudgetRemain(params, type) {
    if (!remainingVisible) return;
    setBudgetLoading(true);
    buggetRemain(params)
      .then((res) => {
        if (res[0]) {
          const newInfoList = res[0]?.budgetInfoList?.map((n) => {
            const data = budgetData.budgetInfoList?.find((m) => m.budgetId === n.budgetId);
            // 匹配预算校验的错误提示
            if (!isEmpty(data)) {
              return {
                ...n,
                budgetId: n.budgetId || n.uuid,
                errorMessage: type ? null : data.errorMessage, // 修改预算后提示消失
              };
            }
            return {
              ...n,
              budgetId: n.budgetId || n.uuid,
            };
          });
          setBudgetInfoList(newInfoList);
        }
      })
      .finally(() => {
        setBudgetLoading(false);
      });
  }

  // 删除新建行budgetId字段(uuid)
  function deleteBudgetIdObj(params) {
    const newParams = params.map((n) => {
      const m = n;
      if (m.status === 'create') {
        m.uuid = m.budgetId;
        delete m.budgetId;
      }
      return m;
    });
    return newParams;
  }

  // 预算信息查询
  function handleFetchBudget() {
    const { cartId } = budgetData;
    // 预采购申请查询预算余额
    if (disabled) {
      fetchBudgetRemain([budgetData]);
    } else {
      // 购物车查询预算后再查询余额
      fetchBudgetInfo({ cartId }).then((res) => {
        if (res) {
          const newBudgetData = [
            {
              ...budgetData,
              budgetInfoList: res,
            },
          ];
          fetchBudgetRemain(newBudgetData);
        }
      });
    }
  }

  // 新建预算行
  function handleCreate() {
    setBudgetInfoList([
      {
        budgetId: uuid(),
        budget: '{}',
        quantity: null,
        status: 'create',
      },
      ...budgetInfoList,
    ]);
  }

  // 取消
  function onCancelBudget() {
    setBudgetVisible(false);
  }

  // 保存预算
  function onSaveBudget(params) {
    setBudgetLoading(true);
    const newParams = deleteBudgetIdObj(params);
    const newBudgetData = [
      {
        ...budgetData,
        budgetInfoList: newParams,
      },
    ];
    updateBudget(newBudgetData).then((res) => {
      if (res[0]) {
        // 更新购物车数量
        updateQuantity(res[0])
          .then((resp) => {
            saveCallBack(resp);
          })
          .finally(() => {
            setBudgetVisible(false);
          });
      }
    });
  }

  // 预算维度改变实时查询预算余额
  function buggetRemainChange(params, type) {
    const newParams = deleteBudgetIdObj(params);
    const newBudgetData = [
      {
        ...budgetData,
        budgetInfoList: newParams,
      },
    ];
    fetchBudgetRemain(newBudgetData, type);
  }

  // 删除预算
  function handleDeletaBudget(params) {
    setBudgetLoading(true);
    deleteBudget(params)
      .then((res) => {
        if (res) {
          if (res[0]) {
            handleFetchBudget();
            saveCallBack(res[0]);
          }
          Message.success(intl.get('mallf.common.view.delete.success').d('删除成功'));
        }
      })
      .finally(() => {
        setBudgetLoading(false);
      });
  }

  // 删除预算行
  function onHandleDalete(params, cancelIndex) {
    const newParams = deleteBudgetIdObj(params);
    const newBudgetData = [
      {
        ...budgetData,
        budgetInfoList: newParams,
      },
    ];
    // 取消未保存的新建行
    if (cancelIndex !== undefined) {
      setBudgetInfoList(budgetInfoList.filter((_, index) => index !== cancelIndex));
    } else {
      handleDeletaBudget(newBudgetData);
    }
  }
  const budgetModalProps = {
    uomPrecision: budgetData?.uomPrecision || 0,
    budgetList, // 预算维度配置
    minPackageQuantity,
    minPurchaseQuantity,
    budgetInfoList: newBudgetInfoList,
    budgetSelectList,
    budgetVisible,
    setBudgetVisible,
    itemId,
    disabled,
    pounchOut: budgetData.qtHeaderNo,
    budgetLoading,
    handleCreate,
    onCancelBudget,
    onSaveBudget,
    buggetRemainChange: (params, type) => buggetRemainChange(params, type),
    onHandleDalete,
    remainingVisible,
  };

  return (
    <>
      {budgetList.length > 0 && (
        <div className={styles['budget-a']}>
          <a
            onClick={() => {
              handleFetchBudget();
              setBudgetVisible(true);
            }}
            className="primary-color"
          >
            {intl.get('mallf.common.budget.info').d('预算信息')}
          </a>
        </div>
      )}
      {budgetVisible && <BudgetEditModal {...budgetModalProps} />}
    </>
  );
}

export default BudgetInfo;
