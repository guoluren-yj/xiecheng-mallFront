import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import emptyImg from '@/assets/images/product/illu_search_nodata_default.svg';
import FavoriteGroup from './FavoriteGroup';
import FavoriteList from './FavoriteList';

const EmptyImage = ({ msg }) => {
  return (
    <div className="favorite-empty-content">
      <p>
        <img alt="" src={emptyImg} />
      </p>
      <span>{msg}</span>
    </div>
  );
};

const FavoriteContent = observer(({ dataSet }) => {
  // if (dataSet.spinning) return <></>;
  if (isEmpty(dataSet.records) && dataSet.searchName) {
    return (
      <EmptyImage
        msg={intl
          .get('mallf.myFavorite.view.empty.searchProduct', { value: dataSet.searchName })
          .d(`没有找到“${dataSet.searchName}”相关的商品`)}
      />
    );
  }
  if (
    (isEmpty(dataSet.favoriteGroupList) && isEmpty(dataSet.records)) ||
    (dataSet.currentGroup && isEmpty(dataSet.records))
  ) {
    return <EmptyImage msg={intl.get('mallf.myFavorite.view.empty.product').d('暂无收藏')} />;
  }
  return (
    <>
      <FavoriteGroup
        r-if={!isEmpty(dataSet.favoriteGroupList) && !dataSet.searchName && !dataSet.currentGroup}
        dataSet={dataSet}
      />
      <div
        className="product-divide"
        r-if={
          !isEmpty(dataSet.favoriteGroupList) &&
          !isEmpty(dataSet.favoriteProductList) &&
          !dataSet.searchName &&
          !dataSet.currentGroup &&
          !dataSet.isDragging
        }
      />
      <div
        r-if={dataSet.records?.length > 0}
        style={{ visibility: dataSet.isDragging ? 'hidden' : 'visible' }}
      >
        <FavoriteList dataSet={dataSet} />
      </div>
    </>
  );
});

export default FavoriteContent;
