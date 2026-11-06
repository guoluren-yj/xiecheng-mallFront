/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import React, { useState, useRef, useEffect } from 'react';
import { Modal, Spin, Icon } from 'choerodon-ui';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { isEmpty, sum, debounce, isNil } from 'lodash';
import intl from 'utils/intl';
import Image from 'components/Image';
import uuid from 'uuid/v4';
import {
  getUserConfigInfo,
  priceNumberRender,
  convertImg,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { buggetRemain, updateBudget, fetchBudgetInfo, updateQuantity } from 'services/cartService';
import { tableDataset, childTableDataset } from './tableDs';
import style from './budget.less';
import { getUnitCost, getSubject } from '../../services/budgetService';


const { Sidebar } = Modal;
const childTableDsObj = {}; // 子购物车表格DS对象集合
const lovDefaultDataObj = {};

function budgetEdit(props) {
  const {
    budgetData,
    budgetVisible,
    setBudgetVisible,
    saveCallBack,
    disabled,
    pounchOut, // pounchOut商品
    remainingVisible, // 是否展示余额
    batchFlag,
    labels = {},
  } = props;
  const { organizationId, unitId } = getUserConfigInfo();
  const { productLabelDTOList = [] } = labels;

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
        labels,
      })
    )
  ).current;
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetInfoList, setBudgetInfoList] = useState(disabled ? budgetData?.budgetInfoList : []);
  const [update, setUpdate] = useState(false);
  const [expensesSubjectList, setExpensesSubjectList] = useState([]);
  const [subjectsCategoryList, setSubjectsCategoryList] = useState([]);

  useEffect(() => {
    if (!batchFlag) {
      handleFetchBudget();
      handleFetchLovDefault();
      handleFetchSelect();
    }
  }, []);

  useEffect(() => {
    const newBudgetInfoList = budgetInfoList?.map((m) => {
      const { budget } = m;
      const newBudget = JSON.parse(budget) || {};
      return filterNullValueObject({
        ...m,
        ...newBudget,
      });
    });
    tableDs.loadData(newBudgetInfoList);
    // loadData后record状态会有问题
    tableDs.forEach((record) => {
      const flag = tableDs.find(
        (r) =>
          r.id !== record.id &&
          !isNil(record.get('subjectsCategoryCode')) &&
          r.get('subjectsCategoryCode') === record.get('subjectsCategoryCode')
      );
      record.set('subCateCodevalidat', !!flag);
      record.status = record.get('budgetId') ? 'update' : 'add';
    });
  }, [budgetInfoList]);

  // 查询lov默认值
  function handleFetchLovDefault() {
    const { catalogId, latestPrice } = budgetData;
    const costParam = {
      lovCode: 'SCUX.SHANYING.UNIT_COST',
      unitId,
      tenantId: organizationId,
    };
    const params = {
      page: 0,
      size: 10,
      catalogId,
      price: latestPrice,
    };
    // 费用中心默认值
    getUnitCost(costParam).then((res) => {
      const { content } = res;
      if (!isEmpty(content)) {
        // eslint-disable-next-line prefer-destructuring
        lovDefaultDataObj.costCenter = content[0];
      }
    });
    // 财务科目默认值
    getSubject({ ...params, lovCode: 'SCUX.SHANYING.FINANCIAL_SUBJECT' }).then((res) => {
      const { content } = res;
      if (!isEmpty(content)) {
        // eslint-disable-next-line prefer-destructuring
        lovDefaultDataObj.subject = content[0];
      }
    });
    // 费用科目默认值
    // getSubject({ ...params, lovCode: 'SCUX.SHANYING.EXPENSES_SUBJECT' }).then((res) => {
    //   const { content } = res;
    //   if (!isEmpty(content)) {
    //     // eslint-disable-next-line prefer-destructuring
    //     lovDefaultDataObj.expensesSubjectLov = content[0];
    //   }
    // });
  }

  // 查询独立值集
  function handleFetchSelect() {
    queryMapIdpValue({
      expensesSubjectList: 'SYSCFYLX', // 费用类型
      subjectsCategoryList: 'SYSCZCFL', // 资产分类
    }).then(res => {
      if (getResponse(res)) {
        setExpensesSubjectList((res.expensesSubjectList || []).map(item => item.value));
        setSubjectsCategoryList((res.subjectsCategoryList || []).map(item => item.value));
      }
    });
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

  // 预算余额查询
  function fetchBudgetRemain(params, type) {
    if (!remainingVisible) return;
    setBudgetLoading(true);
    buggetRemain(params)
      .then((res) => {
        if (res[0]) {
          const newInfoList = res[0]?.budgetInfoList?.map((n) => {
            if (!batchFlag) {
              const data = budgetData.budgetInfoList.find((m) => m.budgetId === n.budgetId);
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
  function handleCreate() {
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
      // 商品标签选到了费用类型/资产分类中的数据，则默认填充费用类型/资产分类的值（若有多条则取第一条）
      const expensesSubjectDefault =
        productLabelDTOList.find(item => expensesSubjectList.includes(item.labelCode)) || {};
      const subjectsCategoryDefault =
        productLabelDTOList.find(item => subjectsCategoryList.includes(item.labelCode)) || {};
      tableDs.create(
        {
          budget: '{}',
          quantity: budgetData?.attributeVarchar1 === '1' ? 1 : null,
          ...lovDefaultDataObj,
          expensesSubject: expensesSubjectDefault.labelCode || '',
          expensesSubjectName: expensesSubjectDefault.labelName || '',
          subjectsCategoryCode: subjectsCategoryDefault.labelCode || '',
          subjectsCategoryName: subjectsCategoryDefault.labelName || '',
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
      chidlFlag = Object.values(childTableDsObj).every((ds) => {
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
      updateBudget(newBudgetData, batchFlag).then((res) => {
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
      }).finally(() => {
        setBudgetLoading(false);
      });
    }
  }

  // 针对输入框查询预算余额
  const handleOnInput = debounce((field, record) => {
    const {
      subjectsCode,
      subjectsCodeName,
      costCode,
      costName,
      sapNum,
      expensesSubject,
      expensesSubjectName,
      subjectsCategoryCode,
    } = record.toData();
    const newBudget = {
      subjectsCode,
      subjectsCodeName,
      costCode,
      costName,
      sapNum,
      expensesSubject,
      expensesSubjectName,
      subjectsCategoryCode,
      ...field,
    };
    record.set('budget', JSON.stringify(newBudget));
    const newBudgetData = [
      {
        ...props.budgetData,
        budgetInfoList: tableDs.toData(),
      },
    ];
    fetchBudgetRemain(newBudgetData);
  }, 500);

  const columns = [
    {
      name: 'orderSeq',
      width: 60,
      renderer: ({ record }) => record.index + 1,
    },
    {
      name: 'expensesSubjectLov',
      width: 150,
      editor: () => !disabled,
    },

    productLabelDTOList?.some(item =>
      ['ZC_FIXED_ASSETS', 'ZC_INTANGIBLE_ASSETS'].includes(item?.labelCode)
    ) && {
      name: 'subjectsCategoryCodeObj',
      width: 150,
      editor: () => !disabled,
    },
    // {
    //   name: 'sapNum',
    //   width: 150,
    //   editor: () => !disabled,
    //   // editor: (record) =>
    //   //   !disabled && (
    //   //     <TextField onInput={(e) => handleOnInput({ sapNum: e.target?.value }, record)} />
    //   //   ),
    // },
    {
      name: 'costCenter',
      width: 200,
      editor: () => !disabled,
    },
    {
      name: 'manageUnitCodeObj',
      width: 200,
      editor: () => !disabled,
    },
    budgetData?.attributeVarchar1 === '1' && {
      name: 'fixAssetCode',
      width: 150,
      editor: () => !disabled,
    },

    !batchFlag && {
      name: 'quantity',
      width: 100,
      editor: () => !pounchOut && !disabled,
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
      renderer: ({ record }) => <span className="error-message">{record.get('errorMessage')}</span>,
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
        editor: () => true,
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
        renderer: ({ record }) => (
          <a onClick={() => handleChildTableDelete(record)}>
            {intl.get('hzero.common.btn.delete').d('删除')}
          </a>
        ),
      },
    ];
    return <Table dataSet={childTableDsObj[partentRecord.get('uuId')]} columns={childColumns} />;
  };

  const footerProps = {
    [disabled && 'footer']: null,
  };
  const addButton = (
    <Button icon="add" onClick={() => handleCreate()}>
      {intl.get('mallf.common.view.button.addBudget').d('新建预算')}
    </Button>
  );
  const buttons = batchFlag ? [addButton] : [addButton, 'delete'];
  return (
    <Sidebar
      closable
      destroyOnClose
      width={1000}
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
          columns={columns}
          buttons={!disabled && !pounchOut && buttons}
          defaultRowExpanded
          expandedRowRenderer={batchFlag && expandedRowRender}
        />
      </Spin>
    </Sidebar>
  );
}

export default budgetEdit;
