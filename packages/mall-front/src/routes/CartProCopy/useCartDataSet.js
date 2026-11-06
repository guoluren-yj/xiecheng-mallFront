import { useMemo } from 'react';
import { runInAction } from 'mobx';
import { isNil } from 'lodash';

import { getStorage, setStorage } from 'utils/utils';
import { getViewTypeStorageKey, getCartGrounpType } from 'utils/configUtils';
import { groupField, headerGroupTypeFields } from './enum';
import CartDataSet from './CartDataSet';
import BasketDataSet from './BasketDataSet';
import useColumns, { getCustColumns, getColumns } from './useColumns';
import CuxFn from '@/cuxTools/cuxFn';

export default function useCartDataSet() {
  // cartViewType: 1, // 1普通视图，2行维度视图
  // 购物篮只有行维度视图 // 下单人切换为普通视图
  function initViewType({ dataSet }) {
    const viewType = getStorage(getViewTypeStorageKey()) || 1;
    dataSet.setState('cartViewType', [1, 4].includes(viewType) ? 1 : 2);
    dataSet.setState('checkCartChoosed', 0);
    dataSet.setState('groupType', getCartGrounpType() || headerGroupTypeFields.ungrouped);
  }

  function getTableColumns({ dataSet }) {
    const cartViewType = dataSet.getState('cartViewType');
    return useColumns({
      columns: getCustColumns({ dataSet, cartViewType }),
      params: {
        cartViewType,
        dataSet,
      },
    });
  }

  function getTableGroups({ dataSet }) {
    const cartViewType = dataSet.getState('cartViewType');
    return cartViewType === 1
      ? [
          {
            name: 'cartId',
            type: 'column',
            columnProps: getColumns({ cartViewType: 1, basketType: dataSet.basketType })
              .selectColumn,
          },
        ]
      : useColumns({
          params: {
            cartViewType: 2,
            dataSet,
          },
          columns: [
            {
              name: 'cartCheckBox__cloumn',
              type: 'column',
              columnProps: getColumns({ cartViewType: 2 }).selectColumn,
            },
            {
              name: 'action__cloumn',
              type: 'column',
              columnProps: getColumns({ cartViewType: 2, basketType: dataSet.basketType })
                .actionColumn,
            },
          ],
        });
  }

  // 购物车
  const dataSet = useMemo(() => {
    return new CartDataSet(
      {
        paging: false,
        record: {
          dynamicProps: {
            defaultSelected: (record) => record.get(groupField.isSelected),
          },
        },
        events: {
          selectAll() {
            dataSet.cartSelectAll();
          },
        },
      },
      {
        events: {
          cartInit: () => {
            runInAction(() => {
              initViewType({ dataSet });
              // 表格列，useColumns内部处理组header相关的逻辑
              dataSet.tabelColumns = getTableColumns({ dataSet });
              dataSet.tabelGroups = getTableGroups({ dataSet });
            });
          },
          cartFinally: ({ data }) => {
            runInAction(() => {
              dataSet.isCartEmpty = data.length < 1;
              dataSet.cartLoading = false;
            });
          },
          changeViewType: (val) => {
            runInAction(() => {
              const oldCartViewType = dataSet.getState('cartViewType');
              const newType = !isNil(val) ? val : dataSet.getState('cartViewType') === 1 ? 2 : 1;
              if (oldCartViewType === newType) return;
              dataSet.setState('cartViewType', newType);
              setStorage(getViewTypeStorageKey(), newType);
              // 表格列，useColumns内部处理组header相关的逻辑
              dataSet.tabelColumns = getTableColumns({ dataSet });
              dataSet.tabelGroups = getTableGroups({ dataSet });

              dataSet.loadCartData(dataSet.cartData);
              dataSet.setState('checkCartChoosed', 0);
            });
          },
        },
      }
    );
  }, []);

  // 购物篮提需人
  const demanderDataSet = useMemo(() => {
    return new BasketDataSet(
      {
        paging: false,
        record: {
          dynamicProps: {
            defaultSelected: (record) => record.get(groupField.isSelected),
            selectable: (record) =>
              CuxFn({
                name: 'cart-pro-fn-demanderDataSetSelectable',
                value: { record },
              })(() => !['INVALID', 'SUBMITTED'].includes(record.get('centralizedStatus')))(),
          },
        },
        events: {
          selectAll() {
            demanderDataSet.cartSelectAll();
          },
        },
      },
      {
        basketType: 'demander',
        params: {
          centralizedUserType: 0,
        },
        events: {
          cartInit: () => {
            initViewType({ dataSet: demanderDataSet });
            demanderDataSet.tabelGroups = getTableGroups({
              dataSet: demanderDataSet,
            });
            demanderDataSet.tabelColumns = getTableColumns({
              dataSet: demanderDataSet,
            });
          },
          cartFinally: ({ data }) => {
            runInAction(() => {
              demanderDataSet.isCartEmpty = data.length < 1;
              demanderDataSet.cartLoading = false;
            });
          },
        },
      }
    );
  }, []);

  // 购物篮下单
  const orderDataSet = useMemo(() => {
    return new BasketDataSet(
      {
        paging: false,
        record: {
          dynamicProps: {
            defaultSelected: (record) => record.get(groupField.isSelected),
          },
        },
        events: {
          selectAll() {
            orderDataSet.cartSelectAll();
          },
        },
      },
      {
        basketType: 'order',
        params: {
          centralizedUserType: 1,
        },
        events: {
          cartInit: () => {
            initViewType({ dataSet: orderDataSet });
            orderDataSet.tabelGroups = getTableGroups({
              dataSet: orderDataSet,
            });
            orderDataSet.tabelColumns = getTableColumns({
              dataSet: orderDataSet,
            });
          },
          cartFinally: ({ data }) => {
            runInAction(() => {
              orderDataSet.isCartEmpty = data.length < 1;
              orderDataSet.cartLoading = false;
            });
          },
        },
      }
    );
  }, []);

  return { dataSet, basketDataSetList: [demanderDataSet, orderDataSet] };
}
