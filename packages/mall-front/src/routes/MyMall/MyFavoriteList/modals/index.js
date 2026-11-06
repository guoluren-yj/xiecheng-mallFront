import React from 'react';
import { DataSet, Form, SelectBox, message } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';
import { fetchCreateGroup, fetchBatchMove, fetchBatchRemove } from '../api';
import MoveSelect from './MoveSelect';
import CreateGroup from './CreateGroup';
import styles from '../index.less';

export function openCreateGroup({ dataSet, group }) {
  const initDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'categoryName',
        type: 'intl',
        label: intl.get('mallf.myFavorite.view.categoryName').d('收藏夹名称'),
        required: true,
      },
    ],
  });
  if (group) initDs.loadData([group]);
  openComfirmModal({
    title: group
      ? intl.get('mallf.myFavorite.button.editList').d('编辑收藏夹')
      : intl.get('mallf.myFavorite.button.addList').d('新建收藏夹'),
    width: 520,
    children: <CreateGroup group={group} initDs={initDs} />,
    okText: intl.get('hzero.common.button.save').d('保存'),
    onOk: async () => {
      const flag = await initDs.validate();
      if (!flag) return false;
      const res = await fetchCreateGroup(initDs.toData());
      dataSet.getGroupList();
      message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
      return res;
    },
  });
}

/**
 * 批量移动
 */
export function openBatchMove({ dataSet, record }) {
  const initDs = new DataSet({
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'favoriteCategoryId',
        label: intl.get('mallf.myFavorite.view.categoryName').d('收藏夹名称'),
      },
    ],
  });

  openComfirmModal({
    title: record
      ? intl.get('mallf.myFavorite.view.move.title').d('移动商品')
      : intl.get('mallf.myFavorite.view.batchMove.title').d('批量移动商品'),
    width: 520,
    children: <MoveSelect initDs={initDs} dataSet={dataSet} />,
    onOk: async () => {
      const favoriteCategoryId = initDs.current.get('favoriteCategoryId');
      const channel = dataSet.userInfo.mallType === 'sigl' ? 'PERSONAL' : null;
      const res = await fetchBatchMove(
        record
          ? [{ ...record.toData(), favoriteCategoryId, channel }]
          : dataSet.selected.map((p) => ({
              ...p.toData(),
              favoriteCategoryId,
              channel,
            }))
      );
      dataSet.getGroupList();
      message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
      return res;
    },
  });
}

/**
 * 删除收藏夹
 */
export function openDeleteGroup({ dataSet, group }) {
  dataSet.changeStore('isDragging', false);
  const initDs = new DataSet({
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'removeType',
        required: true,
        lookupCode: 'SMAL_FAVORITES_REMOVE_TYPE',
        defaultValue: 'ONLY_FAVORITES',
      },
    ],
  });
  openComfirmModal({
    title: intl.get('mallf.myFavorite.view.deleteGroup').d('删除收藏夹'),
    width: 520,
    children: (
      <>
        <p
          style={{
            fontSize: 14,
            color: '#000',
            lineHeight: '22px',
            fontWeight: 400,
            marginBottom: 20,
          }}
        >
          {intl
            .get('mallf.myFavorite.view.deleteGroup.desc', { value: group.categoryName })
            .d(`您确定要删除收藏夹【${group.categoryName}】吗？`)}
        </p>
        <Form
          labelLayout="float"
          columns={1}
          dataSet={initDs}
          className={styles['delete-group-form']}
        >
          <SelectBox name="removeType" />
        </Form>
      </>
    ),
    onOk: async () => {
      const res = await fetchBatchRemove([
        {
          ...group,
          removeType: initDs.current.get('removeType'),
        },
      ]);
      dataSet.getGroupList();
      message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
      return res;
    },
  });
}
