// 分组勾选按钮
import React, { useMemo } from 'react';
// import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { CheckBox } from 'choerodon-ui/pro';
import { getGroupRecords, recordsFilter } from './func';
import { groupField } from './enum';
import { groupRenderer } from './renderer';

// 顶部和底部勾选框
export const AllCheckBox = observer((props) => {
  const { dataSet } = props;
  const isCheckAll = dataSet.getState('isCheckAll');
  const [allCount, selectedCount] = [
    recordsFilter(dataSet).length,
    recordsFilter(dataSet.selected).length,
  ];
  return (
    isCheckAll && (
      <CheckBox
        onChange={(checked) => {
          if (checked) {
            dataSet.cartSelectAll();
          } else {
            dataSet.unSelectAll();
          }
        }}
        checked={allCount > 0 && allCount === selectedCount}
        indeterminate={selectedCount > 0 && selectedCount < allCount}
      />
    )
  );
});

// 组级勾选框
export const GroupCheckBox = observer((props) => {
  const { record, dataSet, align } = props;
  const groupRecords = getGroupRecords({ record, dataSet, headInclude: false });

  const [checked, indeterminate] = useMemo(() => {
    const _checked = groupRecords.length > 0 && groupRecords.every((s) => s.isSelected);
    const _indeterminate = !_checked && groupRecords.some((s) => s.isSelected);
    if (checked) {
      dataSet.select(record);
    }
    return [_checked, _indeterminate];
  }, [dataSet.selected]);
  return (
    <div style={{ textAlign: align || 'center', paddingLeft: 8 }}>
      <CheckBox
        checked={checked}
        indeterminate={indeterminate}
        onChange={(isSelected) => {
          if (isSelected) {
            const selectEventName = record.get('qtHeaderNo')
              ? 'cartPoBatchSelect'
              : 'cartBatchSelect';
            dataSet[selectEventName](groupRecords);
          } else {
            dataSet.batchUnSelect(groupRecords);
          }
        }}
      />
      {dataSet.getState('cartViewType') !== 1 && groupRenderer({ record, dataSet })}
    </div>
  );
});

// 商品级勾选框
export const ProductGroupCheckBox = observer((props) => {
  const { record, dataSet, align } = props;
  const groupIds = record.get(groupField.__cartIds) || [];
  const [checked, indeterminate] = useMemo(() => {
    const _checked =
      groupIds.length > 0 &&
      groupIds.every((id) => dataSet.selected.some((r) => r.get(groupField.__cartId) === id));
    const _indeterminate =
      !_checked &&
      groupIds.some((id) => dataSet.selected.some((r) => r.get(groupField.__cartId) === id));
    return [_checked, _indeterminate];
  }, [dataSet.selected]);
  return (
    <div style={{ textAlign: align || 'center', position: 'relative', top: 1 }}>
      <CheckBox
        disabled={!record.selectable}
        checked={checked}
        indeterminate={indeterminate}
        onChange={(isSelected) => {
          const groupRecords = dataSet.records.filter((r) =>
            groupIds.includes(r.get(groupField.__cartId))
          );
          if (isSelected) {
            dataSet.cartPoBatchSelect(groupRecords);
          } else {
            dataSet.batchUnSelect(groupRecords);
          }
        }}
      />
    </div>
  );
});

// 商品明细按分配头勾选
export const CartAssignCheckBox = observer(({ record, dataSet, align }) => {
  const groupRecords = getGroupRecords({ record, dataSet, headInclude: false });

  const [checked, indeterminate] = useMemo(() => {
    const _checked = groupRecords.length > 0 && groupRecords.every((s) => s.isSelected);
    const _indeterminate = !_checked && groupRecords.some((s) => s.isSelected);
    if (checked) {
      dataSet.select(record);
    }
    return [_checked, _indeterminate];
  }, [dataSet.selected]);
  return (
    <div style={{ textAlign: align || 'center' }}>
      <CheckBox
        disabled={!record.selectable}
        checked={checked}
        indeterminate={indeterminate}
        onChange={(isSelected) => {
          if (isSelected) {
            dataSet.cartPoBatchSelect(groupRecords);
          } else {
            dataSet.batchUnSelect(groupRecords);
          }
        }}
      />
    </div>
  );
});

export const CartCheckBox = observer(({ record, dataSet, align }) => {
  return (
    <div style={{ textAlign: align || 'center' }}>
      <CheckBox
        disabled={!record.selectable}
        checked={record.isSelected}
        onChange={(isSelected) => {
          if (isSelected) {
            dataSet.cartSelect(record);
          } else {
            dataSet.unSelect(record);
          }
        }}
      />
    </div>
  );
});
