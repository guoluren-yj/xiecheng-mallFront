import React from 'react';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { Attachment } from 'choerodon-ui/pro';
import { groupField, groupTypeField } from './enum';
import {
  AllCheckBox,
  GroupCheckBox,
  ProductGroupCheckBox,
  CartCheckBox,
  CartAssignCheckBox,
} from './CartCheckBox';
import {
  groupRenderer,
  unitPriceRenderer,
  quantityRenderer,
  totalAmountRenderer,
  skuInfoRenderer,
  optionsRenderer,
  centralizeStatusRender,
  basketOptionsRender,
  basketQuantityRenderer,
} from './renderer';
import CuxFn from '@/cuxTools/cuxFn';

// 根据分配头聚合
function onCellByAssign({ record, cartViewType }) {
  if (cartViewType !== 1) {
    const rowSpan = record.get(groupField.firstHeaderLineLength);
    if (rowSpan && rowSpan > 0) {
      return { rowSpan };
    } else {
      return { style: { display: 'none' } };
    }
  }
  return {};
}

export function getColumns({ cartViewType = 1, basketType } = {}) {
  const selectColumn = {
    align: 'right',
    tooltip: 'none',
    lock: 'left',
    width: 45,
    header: ({ dataSet: ds }) => <AllCheckBox dataSet={ds} />,
    renderer: ({ record, dataSet: ds }) => {
      const groupType = record.get(groupField.groupType);
      const groupFlag = record.get(groupField.groupFlag);
      if (groupType === groupTypeField.po && !groupFlag) {
        return <span />;
      }
      if (groupFlag) {
        return <GroupCheckBox record={record} dataSet={ds} align="left" />;
      }
      if (ds.getState('cartViewType') !== 1) {
        return <ProductGroupCheckBox record={record} dataSet={ds} align="right" />;
      }
      return <CartCheckBox record={record} dataSet={ds} align="right" />;
    },
    isGroupRender: true,
    colSpan: 2,
  };

  const productColumn = {
    header: (
      <div r-title className="text-overflow">
        {intl.get(`mallf.common.view.productInformation`).d('商品信息')}
      </div>
    ),
    tooltip: 'none',
    width: cartViewType === 1 ? 540 : 460,
    lock: cartViewType === 1 ? false : 'left',
    renderer: skuInfoRenderer,
    validateFirstFlag: true,
  };

  const lineSelectColumn = {
    name: 'lineSelectBox__cloumn',
    align: 'left',
    lock: 'left',
    width: 80,
    tooltip: 'none',
    hidden: true,
    header: (
      <div className="text-overflow">
        {intl.get('mallf.cart.view.field.lineChoose').d('行选择')}
      </div>
    ),
    renderer: ({ record, dataSet: ds }) => {
      const groupType = record.get(groupField.groupType);
      const groupFlag = record.get(groupField.groupFlag);
      if (groupType === groupTypeField.po && !groupFlag) {
        return <span>-</span>;
      }
      const CheckBox =
        record.get(groupField.firstHeaderLineLength) > 1 ? CartAssignCheckBox : CartCheckBox;
      return <CheckBox align="left" record={record} dataSet={ds} />;
    },
    onCellExtra: onCellByAssign,
  };

  const actionColumn = {
    lock: 'right',
    header: intl.get('hzero.common.button.action').d('操作'),
    width: 110,
    tooltip: 'none',
    headerClassName: 'sku-action-header',
    renderer: basketType ? basketOptionsRender : optionsRenderer,
  };
  return { selectColumn, productColumn, actionColumn, lineSelectColumn };
}

export function getDefaultColumns({ dataSet }) {
  if (isEmpty(dataSet.cartColumns)) return [];
  return [
    {
      name: 'unitPrice',
      header: dataSet.cartColumns.find((p) => p.code === 'taxIncludedPrice')?.name,
      width: 140,
      align: 'right',
      tooltip: 'none',
      renderer: unitPriceRenderer,
      onCellExtra: onCellByAssign,
    },
    {
      name: 'totalQuantity',
      header: dataSet.cartColumns.find((p) => p.code === 'quantity')?.name,
      width: 140,
      tooltip: 'none',
      renderer: dataSet?.basketType !== 'order' ? quantityRenderer : basketQuantityRenderer,
    },
    {
      name: 'total',
      header: dataSet.cartColumns.find((p) => p.code === 'taxIncludedAmount')?.name,
      width: 160,
      align: 'right',
      tooltip: 'none',
      renderer: totalAmountRenderer,
    },
  ];
}

export function getBasketColumns(type) {
  const basketColumns = [
    {
      name: 'centralizedStatus',
      header: intl.get('mallf.common.view.centralizeStatus').d('拼单状态'),
      width: 100,
      tooltip: 'none',
      show: type === 'demander',
      renderer: centralizeStatusRender,
    },
    {
      name: 'centralizedBetweenDay',
      header: intl.get('mallf.common.view.countDown').d('倒计时'),
      width: 100,
      tooltip: 'none',
      show: type === 'demander',
      renderer: ({ value }) => (
        <div className="text-overflow" style={{ lineHeight: '18px' }}>
          {typeof value === 'number'
            ? `${value}${intl.get('hzero.common.date.unit.day').d('天')}`
            : '-'}
        </div>
      ),
    },
    {
      name: 'centralizedPurchaseQuantity',
      header: intl.get('mallf.common.view.predictQuantity').d('预计拼单数量'),
      width: 100,
      tooltip: 'none',
      show: type === 'order',
      renderer: ({ text }) => (
        <div className="text-overflow" style={{ lineHeight: '18px' }}>
          {text || '-'}
        </div>
      ),
    },
  ].filter((f) => f.show !== false);
  const newBasketColumns = CuxFn({
    name: 'cart-pro-fn-getBasketColumns',
    value: { basketColumns, type },
  })(() => basketColumns)();

  return newBasketColumns;
}

export function getCustColumns({ dataSet, cartViewType }) {
  const defaultColumns = getDefaultColumns({ dataSet, cartViewType });
  const { productColumn, actionColumn, lineSelectColumn } = getColumns({
    cartViewType,
    basketType: dataSet.basketType,
  });
  const easeColumns = [
    productColumn,
    ...defaultColumns,
    ...getBasketColumns(dataSet.basketType),
    actionColumn,
  ];
  if (cartViewType === 1) {
    easeColumns[0].isGroupRender = true;
    easeColumns[0].needColSpan = 6;
    easeColumns[0].renderGroupInfo = true;
    // 二开埋点：扩展表格列
    const cuxExtraColumns = CuxFn({
      name: 'cart-pro-fn-getCuxColumns',
      value: { dataSet, cartViewType },
    })(() => [])();
    return [...easeColumns, ...cuxExtraColumns];
  } else {
    const custColumns = [
      productColumn,
      ...dataSet.cartColumns
        .map((column) => {
          switch (column.code) {
            case 'quantity':
              return {
                ...defaultColumns.find((p) => p.name === 'totalQuantity'),
                header: `${column.name}`,
                // name: `${column.type}_${column.code}`,
              };
            case 'taxIncludedAmount':
              return {
                ...defaultColumns.find((p) => p.name === 'total'),
                header: `${column.name}`,
                name: `${column.type}_${column.code}`,
              };
            case 'taxIncludedPrice':
              return {
                ...defaultColumns.find((p) => p.name === 'unitPrice'),
                header: `${column.name}`,
                name: `${column.type}_${column.code}`,
              };
            default:
              return dataSet.basketType
                ? null // 拼单不展示额外字段
                : {
                    name: `${column.type}_${column.code}`,
                    header: `${column.name}`,
                    width: 180,
                    hidden: ['uomId'].includes(column.code), // 手工申请商品的单位需要隐藏
                    renderer: ({ text, record }) => {
                      const attachmentFlag =
                        record
                          .get('currentDimValue')
                          ?.cartDimValueList?.slice()
                          ?.find(
                            (p) =>
                              p.dimensionCode === column.code && p.dimensionType === column.type
                          )?.componentType === 'UPLOAD';
                      return (
                        <>
                          {attachmentFlag ? (
                            <Attachment
                              name={`${column.type}_${column.code}`}
                              sortable
                              bucketName="private-bucket"
                              bucketDirectory="mall-front"
                              viewMode="popup"
                              funcType="link"
                              label={`${column.name}`}
                              value={record.get(`${column.type}_${column.code}`)}
                              style={{ paddingLeft: 0 }}
                              readOnly
                            />
                          ) : (
                            <div className="text-overflow" style={{ lineHeight: '18px' }}>
                              {text || '-'}
                            </div>
                          )}
                        </>
                      );
                    },
                  };
          }
        })
        .filter((c) => !!c),
    ];
    if (dataSet.basketType) {
      custColumns.splice(5, 0, ...getBasketColumns(dataSet.basketType));
    } else {
      custColumns.unshift(lineSelectColumn);
    }
    if (custColumns[1]) custColumns[1].needColSpan = 1;
    if (custColumns[2]) custColumns[2].needColSpan = 'auto';
    return custColumns;
  }
}

export default function useColumns({ columns = [], params = {} }) {
  return columns.map((column) => {
    const currentColumn = column.columnProps || column;
    // isGroupRender // 当前单元格需要占用来渲染组头
    // renderGroupInfo // 当前单元格需要有内容需要渲染，所以需要占用colspan
    // needColSpan 占用的colspan
    // validateFirstFlag // 需要校验行是否聚合
    // 有点冗余，后期优化
    const {
      header,
      renderer = ({ text }) => text,
      isGroupRender,
      renderGroupInfo,
      validateFirstFlag,
      needColSpan,
      onCellExtra = () => ({}),
    } = currentColumn;
    const newColumProps = {
      ...currentColumn,
      // tooltip: 'none',
      header: typeof header === 'string' ? <div className="text-overflow">{header}</div> : header,
      renderer: (args) => {
        const { record } = args;
        if (record.get(groupField.groupFlag) && isGroupRender) {
          return renderGroupInfo ? groupRenderer(args) : renderer(args);
        }
        if (record.get(groupField.groupFlag) && needColSpan) {
          return <span />; // 需要用span占位
        }
        return renderer(args);
      },
      onCell: ({ record, dataSet }) => {
        if (!record) return {};
        const colSpan = record.get(groupField.groupFlag)
          ? params?.dataSet.cartColumns.length + 7
          : 1;
        const cellProps = {};
        if (
          dataSet.getState('carViewType') !== 1 &&
          dataSet.cartData.findIndex((p) => p.cartId === record.get('cartId')) ===
            dataSet.cartData.length - 1 &&
          (column.validateFirstFlag || column.columnProps)
        ) {
          // 去掉最后一组的边框
          cellProps.style = { borderBottom: 'none' };
        }

        if (record.get(groupField.groupFlag)) {
          if (needColSpan) {
            cellProps.colSpan = needColSpan === 'auto' ? colSpan : needColSpan;
          } else if (!isGroupRender) {
            // 如果不需要渲染格子就隐藏
            cellProps.style = { display: 'none' };
          }
          if (currentColumn.colSpan) {
            cellProps.colSpan = currentColumn.colSpan;
          }
        } else if (validateFirstFlag && params.cartViewType !== 1) {
          if (record.get(groupField.firstLine)) {
            // 仅第一行商品保留
            cellProps.rowSpan = record.get(groupField.__cartIds).length;
          } else {
            cellProps.style = { display: 'none' };
          }
        }
        const extraCellProps =
          onCellExtra({ record, dataSet, cartViewType: params.cartViewType }) || {};
        return { ...cellProps, ...extraCellProps };
      },
    };
    return {
      ...column,
      ...(column.columnProps ? {} : newColumProps),
      columnProps: column.columnProps ? newColumProps : null,
    };
  });
}
