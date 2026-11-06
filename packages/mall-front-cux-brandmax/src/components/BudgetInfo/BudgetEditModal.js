import React, { useEffect, useRef, useState } from 'react';
import { Modal, Spin, Table as C7nTable, Icon } from 'choerodon-ui';
import { DataSet, Table, Button, Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { numberRender, convertImg, getUserConfigInfo } from 'utils/utils';
import Image from 'components/Image';
import { observer } from 'mobx-react-lite';

import { saveBudgetService } from '../../services/budgetService';
import { tableDs } from './tableDs';
import style from './budget.less';

const { Sidebar } = Modal;

export default function BudgetEditModal(props) {
  const { budgetVisible, setBudgetVisible, disabled, budgetData, saveCallBack, batchFlag } = props;
  const { organizationId } = getUserConfigInfo();

  const budgetTableDs = useRef(
    new DataSet(tableDs({ disabled, organizationId, budgetData, saveCallBack }))
  ).current;
  const [budgetLoading, setBudgetLoading] = useState(false);

  useEffect(() => {
    if (!batchFlag) {
      const { cartId, budgetInfoList = [] } = budgetData;
      const { cartId: orderCartId } = budgetInfoList[0] || {};
      budgetTableDs.setQueryParameter('cartId', cartId || orderCartId);
      budgetTableDs.query();
    }
  }, []);

  const handleCreate = () => {
    budgetTableDs.create({}, 0);
  };

  const handleProjectChange = (record) => {
    record.set('budgetSubject', null);
  };

  const handleOK = async () => {
    const budgetFlag = await budgetTableDs.validate();
    if (budgetFlag) {
      const params = batchFlag
        ? budgetData.map((m) => ({
            ...m,
            brandmaxBudgetInfoList: budgetTableDs.toData(),
            budgetInfoList: budgetTableDs.toData().map((p) => {
              // eslint-disable-next-line no-param-reassign
              delete p.budgetSubject;
              // eslint-disable-next-line no-param-reassign
              delete p.project;
              return {
                budget: JSON.stringify(p),
                budgetId: p.projectId,
                cartId: m.cartId,
              };
            }),
          }))
        : [
            {
              ...budgetData,
              brandmaxBudgetInfoList: budgetTableDs.toData(),
              budgetInfoList: budgetTableDs.toData().map((p) => {
                // eslint-disable-next-line no-param-reassign
                delete p.budgetSubject;
                // eslint-disable-next-line no-param-reassign
                delete p.project;
                return {
                  budget: JSON.stringify(p),
                  budgetId: p.projectId,
                  cartId: budgetData.cartId,
                };
              }),
            },
          ];
      setBudgetLoading(true);
      saveBudgetService(params, batchFlag)
        .then((res) => {
          if (res) {
            saveCallBack(res);
          }
        })
        .finally(() => {
          setBudgetVisible(false);
          setBudgetLoading(false);
        });
    }
  };

  const columns = [
    {
      name: 'orderSeq',
      width: 50,
      renderer: ({ record }) => record.index + 1,
    },
    {
      name: 'project',
      width: 200,
      editor: (record) => {
        return !disabled && <Lov noCache onChange={() => handleProjectChange(record)} />;
      },
    },
    {
      name: 'projectName',
      width: 200,
    },
    {
      name: 'budgetSubject',
      width: 200,
      editor: () => {
        return !disabled && <Lov noCache />;
      },
    },
    {
      name: 'brandmaxCompanyName',
      width: 200,
    },
    {
      name: 'profitCenterName',
      width: 200,
    },
    {
      name: 'costTypeCode',
      width: 200,
      editor: () => !disabled,
    },
    !disabled && {
      name: 'option',
      width: 60,
      renderer: ({ record }) =>
        record.status === 'add' ? (
          <a onClick={() => budgetTableDs.remove(record)}>
            {intl.get('hzero.common.btn.cancel').d('取消')}
          </a>
        ) : (
          <a onClick={() => budgetTableDs.delete([record])}>
            {intl.get('hzero.common.btn.delete').d('删除')}
          </a>
        ),
    },
  ];

  const expandedRowRender = () => {
    const expandColumns = [
      {
        title: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
        dataIndex: 'product',
        key: 'product',
        width: 278,
        render: (v, product) => {
          return (
            <div className="product-info">
              <div className="goods-img">
                <Image
                  value={convertImg(product.imagePath, 1, product.productSource)}
                  width={41}
                  height={41}
                />
              </div>
              <div className="goods-product-name text-overflow">
                <div title={product.productName} className="goods-name">
                  {product.productName}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: intl.get(`mallf.myMall.model.companyOrder.unitPrice`).d('单价'),
        dataIndex: 'latestPrice',
        key: 'latestPrice',
        width: 150,
        align: 'right',
        render: (v, product) => {
          const { latestPrice, uomName } = product;
          return (
            <div className="columns-item">
              {numberRender(latestPrice)}
              {uomName ? `/${uomName}` : ''}
            </div>
          );
        },
      },
      {
        title: intl.get(`mallf.myMall.model.companyOrder.count`).d('数量'),
        dataIndex: 'quantity',
        key: 'quantity',
        width: 150,
        render: (v, product) => {
          const { quantity } = product;
          return <div className="columns-item">{quantity}</div>;
        },
      },
      {
        title: intl.get(`mallf.common.view.all.money`).d('金额'),
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        render: (v, product) => {
          const { totalPrice, currencyCode } = product;
          return (
            <div className="columns-item product-price">
              <p>{numberRender(totalPrice)}</p>
              <p>{currencyCode}</p>
            </div>
          );
        },
      },
    ];
    return (
      <C7nTable
        columns={expandColumns}
        filterBar={false}
        dataSource={budgetData}
        pagination={false}
      />
    );
  };

  const AddButton = observer(({ dataSet }) => (
    <Button
      icon="add"
      funcType="flat"
      className="primary-color"
      disabled={dataSet.toData()?.length > 0}
      onClick={() => handleCreate()}
    >
      {intl.get('mallf.common.view.button.addBudget').d('新建预算')}
    </Button>
  ));

  const footerProps = {
    [disabled && 'footer']: null,
  };
  // const tableWidth = sum(columns.map((n) => n.width)) + (batchFlag ? 200 : 100);
  return (
    <Sidebar
      closable
      destroyOnClose
      className={style['budget-modal']}
      title={
        disabled
          ? intl.get('mallf.common.look.budget.info').d('查看预算信息')
          : intl.get('mallf.common.choose.budget.info').d('选择预算信息')
      }
      width={1000}
      visible={budgetVisible}
      okText={intl.get(`mallf.common.model.confirm`).d('确认')}
      cancelText={intl.get(`mallf.common.button.cancel`).d('取消')}
      onCancel={() => setBudgetVisible(false)}
      onOk={handleOK}
      confirmLoading={budgetLoading}
      maskClosable={false}
      {...footerProps}
    >
      <Spin spinning={disabled ? false : budgetLoading}>
        {batchFlag && (
          <div className="batch-budget-warn">
            <Icon type="error" size={13} style={{ marginRight: '6px' }} />
            {intl
              .get('mallf.common.view.budgetBatchWarn')
              .d('当前批量操作将会覆盖以下商品原有的预算信息，请谨慎操作。')}
          </div>
        )}
        {!disabled && (
          <div style={{ marginBottom: 4 }}>
            <AddButton dataSet={budgetTableDs} />
          </div>
        )}
        <Table
          dataSet={budgetTableDs}
          columns={columns}
          expandedRowRenderer={batchFlag && expandedRowRender}
        />
      </Spin>
    </Sidebar>
  );
}
