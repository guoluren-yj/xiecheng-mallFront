import React, { useMemo, useEffect } from 'react';
import { isEmpty, debounce } from 'lodash';
import { TextField, Button, Icon, Spin } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import styles from './index.less';
import Store from './store';
import { openCreateGroup, openBatchMove } from './modals';
import FavoriteContent from './FavoriteContent';

function MyFavoriteList() {
  const dataSet = useMemo(
    () =>
      new Store({
        selection: 'multiple',
        pageSize: 20,
      }),
    []
  );

  useEffect(() => {
    dataSet.favoriteInit();
  }, []);

  const changeSearch = debounce((val) => {
    dataSet.changeStore('searchName', val);
    dataSet.productName = val;
    dataSet.getGroupList();
  }, 100);

  return (
    <Observer>
      {() => (
        <Spin spinning={dataSet.spinning}>
          <div className={styles['favorite-list-container']}>
            {dataSet.currentGroup?.categoryName ? (
              <p className="favorite-list-group-title">
                <span
                  className="group-title-name"
                  onClick={() => {
                    dataSet.changeStore({
                      searchName: '',
                      currentGroup: null,
                    });
                    dataSet.getGroupList();
                  }}
                >
                  {intl.get(`mallf.myMall.view.myFavorite`).d('我的收藏')}
                </span>
                <span className="group-title-space">/</span>
                <span className="group-group-name">
                  <span>{dataSet.currentGroup?.categoryName}</span>
                </span>
              </p>
            ) : (
              <p className="favorite-list-title">
                {intl.get(`mallf.myMall.view.myFavorite`).d('我的收藏')}
              </p>
            )}
            <div className="favorite-list-operate">
              <div className="favorite-list-operate-input">
                <TextField
                  clearButton
                  value={dataSet.searchName}
                  style={{ width: '100%' }}
                  placeholder={intl
                    .get('mallf.myFavorite.search.placeholder.name')
                    .d('请输入商品名称/编码查询')}
                  onChange={(val) => {
                    changeSearch(val);
                  }}
                />
                <Icon className="input-search-icon" type="search" />
              </div>
              <div className="favorite-list-operate-btns">
                <Button
                  r-if={!dataSet.currentGroup}
                  icon="add"
                  funcType="flat"
                  color="primary"
                  style={{ marginLeft: 10 }}
                  onClick={() => openCreateGroup({ dataSet })}
                >
                  {intl.get('mallf.myFavorite.button.addList').d('新建收藏夹')}
                </Button>
                <Button
                  disabled={dataSet.selected.length === 0}
                  icon="sync_alt"
                  funcType="flat"
                  color="primary"
                  style={{ marginLeft: 10 }}
                  onClick={() => openBatchMove({ dataSet })}
                >
                  {intl.get('mallf.myFavorite.button.batch.leaveTo').d('批量移动至')}
                </Button>
                <Button
                  icon="delete_sweep-o"
                  funcType="flat"
                  color="primary"
                  onClick={() => dataSet.batchDelInvalideProcut()}
                  disabled={
                    dataSet.currentGroup
                      ? dataSet.toData().every((p) => +p.saleEnable)
                      : (dataSet.favoriteProductList.totalPages === 1 &&
                          dataSet.favoriteProductList.content.every((p) => +p.saleEnable)) ||
                        isEmpty(dataSet.toData())
                  }
                >
                  {intl.get('mallf.myFavorite.clear.all.validProduct').d('清空失效商品')}
                </Button>
              </div>
            </div>
            <FavoriteContent dataSet={dataSet} />
          </div>
        </Spin>
      )}
    </Observer>
  );
}
export default formatterCollections({
  code: ['mallf.myFavorite'],
})(MyFavoriteList);
