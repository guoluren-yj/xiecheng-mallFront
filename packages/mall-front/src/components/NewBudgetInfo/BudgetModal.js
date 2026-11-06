/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Modal, Spin, Icon } from 'choerodon-ui';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { isEmpty, sum } from 'lodash';
import intl from 'utils/intl';
import Image from 'components/Image';
import uuid from 'uuid/v4';
import { getUserConfigInfo, priceNumberRender, convertImg } from 'utils/utils';
import { buggetRemain, updateBudget, fetchBudgetInfo, updateQuantity } from 'services/cartService';
import { tableDataset, childTableDataset } from './tableDs';
import style from './budget.less';
import CuxFn from '@/cuxTools/cuxFn';

const { Sidebar } = Modal;
const childTableDsObj = {}; // 子购物车表格DS对象集合

function budgetEdit(props) {
  const {
    budgetData: products,
    budgetList,
    budgetVisible,
    setBudgetVisible,
    saveCallBack,
    disabled,
    pounchOut, // pounchOut商品
    remainingVisible, // 是否展示余额
    batchFlag,
  } = props;
  const { organizationId } = getUserConfigInfo();
  const budgetData = useMemo(() => {
    let newProducts = [];
    if (batchFlag) {
      products.forEach((p) => {
        if (p.qtLine) {
          newProducts = [...newProducts, ...p.qtLine];
        } else {
          newProducts = [...newProducts, p];
        }
      });
    }
    return batchFlag ? newProducts : products;
  }, [products]);

  const tableDs = useRef(
    new DataSet(
      tableDataset({
        ...props,
        budgetData,
        handleFetchBudget,
        saveCallBack,
        organizationId,
        fetchBudgetRemain,
        batchFlag,
      })
    )
  ).current;
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetInfoList, setBudgetInfoList] = useState(disabled ? budgetData?.budgetInfoList : []);
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    if (!batchFlag) {
      handleFetchBudget();
    } else {
      // setBudgetLoading(true);
      const uuId = uuid();
      childTableDsObj[uuId] = new DataSet(childTableDataset(budgetData));
      childTableDsObj[uuId].loadData(
        budgetData.map((n) => ({
          ...n,
          uuId,
          quantity: tableDs.toData().length > 1 ? null : n.quantity, // 第一条默认购物车数量
        }))
      );
      CuxFn({
        name: 'cart-bulk-budget-allocation',
        value: { tableDs, setBudgetLoading, uuId },
      })();
    }
  }, []);

  useEffect(() => {
    const newBudgetInfoList = budgetInfoList?.map((m) => {
      const { budget } = m;
      let newBudget = {};
      try {
        newBudget = JSON.parse(budget);
      } catch {
        newBudget = {};
      }
      return {
        ...m,
        ...newBudget,
      };
    });
    tableDs.loadData(newBudgetInfoList);
    // loadData后record状态会有问题
    tableDs.forEach((record) => {
      record.status = record.get('budgetId') ? 'update' : 'add';
    });
  }, [budgetInfoList]);

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

  // 预算余额查询
  function fetchBudgetRemain(params, type) {
    if (!remainingVisible) return;
    setBudgetLoading(true);
    buggetRemain(params)
      .then((res) => {
        if (res[0]) {
          const newInfoList = res[0]?.budgetInfoList?.map((n) => {
            if (!batchFlag) {
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
            }
            return n;
          });
          if (batchFlag) {
            // 批量的时候更新预算余额
            const { remainingBudget } = newInfoList.find((n) => n.uuId === type.get('uuId'));
            type.set('remainingBudget', remainingBudget);
          } else {
            setBudgetInfoList(newInfoList);
          }
        }
      })
      .finally(() => {
        setBudgetLoading(false);
      });
  }

  // 新建预算行
  function handleCreate(params = {}) {
    if (batchFlag) {
      const uuId = uuid();
      childTableDsObj[uuId] = new DataSet(childTableDataset(budgetData));
      tableDs.create({ budget: '{}', quantity: null, uuId }, 0);
      childTableDsObj[uuId].loadData(
        budgetData.map((n) => ({
          ...n,
          uuId,
          quantity: tableDs.toData().length > 1 ? null : n.quantity, // 第一条默认购物车数量
        }))
      );
      setUpdate(!update);
    } else {
      tableDs.create(
        {
          ...params,
          budget: '{}',
          quantity: null,
        },
        0
      );
    }
  }

  // 批量分配子表格删除
  function handleChildTableDelete(record) {
    // 取消购物车勾选
    const newBudgetData = budgetData.map((m) => {
      return { ...m, checked: m.cartId !== record.get('cartId') };
    });
    saveCallBack(newBudgetData);
    // 删除后的子表格数据
    Object.values(childTableDsObj).forEach((ds) => {
      const data = ds.toData().filter((n) => n.cartId !== record.get('cartId'));
      ds.loadData(data);
    });
  }

  // 保存预算
  async function saveBudget() {
    let chidlFlag = true;
    // 批量维护预算
    function handleBatchBudgetData() {
      // 批量购物车行遍历
      return budgetData.map((cartLine) => {
        // 预算行遍历
        const newBudgetInfoList = tableDs.toData().map((budgetLine) => {
          // 通过uuId找出子购物车行
          const childTableCartData = childTableDsObj[budgetLine.uuId].toData();
          // 通过cartId找到单条购物车行上的数量(即单条预算行数量)
          const { quantity } = childTableCartData.find(
            (childCartLine) => childCartLine.cartId === cartLine.cartId
          );
          return { ...budgetLine, quantity };
        });
        return {
          ...cartLine,
          quantity: sum(newBudgetInfoList.map((q) => q.quantity)),
          budgetInfoList: newBudgetInfoList,
        };
      });
    }
    // 批量数量校验
    if (batchFlag) {
      tableDs.toData().map((n) => n.uuId);
      chidlFlag = tableDs.toData().every((n) => {
        const ds = childTableDsObj[n.uuId];
        // ds.forEach((record) => (record.status = 'update'));
        ds.validate();
        return ds.toData().every((d) => +d.quantity);
      });
    }
    // tableDs.forEach((record) => (record.status = 'update'));
    const flag = await tableDs.validate();
    if (flag && chidlFlag) {
      setBudgetLoading(true);
      const newBudgetData = !batchFlag
        ? [
            {
              ...budgetData,
              budgetInfoList: tableDs.toData(),
            },
          ]
        : handleBatchBudgetData();
      updateBudget(newBudgetData, batchFlag)
        .then((res) => {
          if (res) {
            // 更新购物车数量
            updateQuantity(res)
              .then((resp) => {
                saveCallBack(resp);
              })
              .finally(() => {
                setBudgetVisible(false);
              });
          }
        })
        .catch(() => {
          setBudgetLoading(false);
        });
    }
  }

  const budgetColumns = budgetList.map((item) => {
    const { fieldName, componentType } = item;
    return {
      name: componentType === 'LOV' ? `${fieldName}Lov` : fieldName,
      width: 200,
      editor: () => true,
    };
  });

  const columns = [
    {
      name: 'orderSeq',
      width: 60,
      renderer: ({ record }) => record.index + 1,
    },
    ...budgetColumns,
    !batchFlag && {
      name: 'quantity',
      width: 100,
      editor: () => !pounchOut,
    },
    remainingVisible && {
      name: 'remainingBudget',
      width: 120,
      tooltip: 'overflow',
      renderer: ({ record }) => {
        const precision = batchFlag
          ? budgetData[0]?.defaultPrecision
          : budgetData?.defaultPrecision;
        return record.get('remainingBudget')
          ? priceNumberRender(record.get('remainingBudget'), precision)
          : '-';
      },
    },
    !disabled && {
      name: 'errorMessage',
      width: 150,
      tooltip: 'always',
      renderer: ({ record }) =>
        record.get('errorMessage') ? (
          <span className="error-message">{record.get('errorMessage')}</span>
        ) : (
          ''
        ),
    },
  ].filter((p) => !!p);

  if (!pounchOut && !disabled) {
    columns.push({
      name: 'action',
      width: 100,
      renderer: ({ record }) =>
        !record.get('budgetId') ? (
          <a onClick={() => tableDs.remove(record)}>
            {intl.get('hzero.common.btn.cancel').d('取消')}
          </a>
        ) : (
          <a onClick={() => tableDs.delete([record])}>
            {intl.get('hzero.common.btn.delete').d('删除')}
          </a>
        ),
    });
  }

  const expandedRowRender = ({ record: partentRecord }) => {
    const childColumns = [
      {
        name: 'productInfo',
        width: 278,
        renderer: ({ record }) => {
          return (
            <div className="product-info">
              <div className="goods-img">
                <Image
                  value={convertImg(record.get('imagePath'), 1, record.get('productSource'))}
                  width={41}
                  height={41}
                />
              </div>
              <div className="goods-product-name text-overflow">
                <div title={record.get('productName')} className="goods-name">
                  {record.get('productName')}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        name: 'latestPrice',
        width: 150,
        renderer: ({ record }) => {
          const { latestPrice, uomName, defaultPrecision } = record.toData();
          return (
            <div className="columns-item">
              {priceNumberRender(latestPrice, defaultPrecision)}
              {uomName ? `/${uomName}` : ''}
            </div>
          );
        },
      },
      {
        name: 'quantity',
        width: 150,
        editor: () => !pounchOut,
      },
      {
        name: 'totalPrice',
        width: 150,
        renderer: ({ record }) => {
          const { latestPrice, currencyCode, quantity, financialPrecision } = record.toData();
          return (
            <div className="columns-item product-price">
              <p>{priceNumberRender(latestPrice * quantity, financialPrecision)}</p>
              <p>{currencyCode}</p>
            </div>
          );
        },
      },
      {
        name: 'action',
        renderer: ({ record }) =>
          !pounchOut && (
            <a onClick={() => handleChildTableDelete(record)}>
              {intl.get('hzero.common.btn.delete').d('删除')}
            </a>
          ),
      },
    ];
    return (
      <Table
        dataSet={childTableDsObj[partentRecord.get('uuId') || Object.keys(childTableDsObj)[0]]}
        columns={childColumns}
      />
    );
  };

  const footerProps = {
    [disabled && 'footer']: null,
  };
  const addButton = (
    <Button icon="playlist_add" onClick={() => handleCreate()}>
      {intl.get('mallf.common.view.button.addBudget').d('新建预算')}
    </Button>
  );
  const { productId } = budgetData;
  const getButtons = CuxFn({
    name: 'NewBudgetInfo-fn-getButtons',
    value: { handleCreate, productId, tableDs, addButton },
  })(() => (batchFlag ? [addButton] : [addButton, 'delete']));
  const tableWidth = sum(columns.map((n) => n.width)) + (batchFlag ? 200 : 100);

  const getBudgetColumns = CuxFn({
    name: 'NewBudgetInfo-fn-getBudgetColumns',
    value: { columns },
  })(() => columns);

  return (
    <Sidebar
      closable
      destroyOnClose
      width={tableWidth}
      wrapClassName={style['budget-modal']}
      title={
        disabled
          ? intl.get('mallf.common.look.budget.info').d('查看预算信息')
          : intl.get('mallf.common.choose.budget.info').d('选择预算信息')
      }
      visible={budgetVisible}
      okText={intl.get(`mallf.common.model.confirm`).d('确认')}
      cancelText={intl.get(`mallf.common.button.cancel`).d('取消')}
      onCancel={() => setBudgetVisible(false)}
      onOk={saveBudget}
      confirmLoading={budgetLoading}
      maskClosable={false}
      {...footerProps}
    >
      <Spin spinning={budgetLoading}>
        {batchFlag && (
          <div className="batch-budget-warn">
            <Icon type="error" size={13} style={{ marginRight: '6px' }} />
            {intl
              .get('mallf.common.view.budgetBatchWarn')
              .d('当前批量操作将会覆盖以下商品原有的预算信息，请谨慎操作。')}
          </div>
        )}
        <Table
          dataSet={tableDs}
          columns={getBudgetColumns()}
          buttons={!disabled && !pounchOut && getButtons()}
          defaultRowExpanded
          expandedRowRenderer={batchFlag && expandedRowRender}
        />
      </Spin>
    </Sidebar>
  );
}

export default budgetEdit;
