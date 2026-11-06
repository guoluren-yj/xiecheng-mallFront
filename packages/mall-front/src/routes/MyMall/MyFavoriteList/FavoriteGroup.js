import React, { useMemo, useRef } from 'react';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { Icon } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import { animated } from 'react-spring';
import useMeasure from 'react-use-measure';

import Image from 'components/Image';
import intl from 'utils/intl';
import useAnimatedItems from 'hooks/useAnimatedItems';
import { fetchCreateGroup } from './api';
import { openDeleteGroup, openCreateGroup } from './modals';

const columnLength = 4;

const FavoriteGroup = observer(({ dataSet }) => {
  const [gridRef, gridDimensions] = useMeasure();
  const itemDimensions = useMemo(() => {
    const width = gridDimensions.width / columnLength;
    const height = 200;
    return { width, height };
  }, [gridDimensions]);

  const items = useMemo(() => {
    return dataSet.favoriteGroupList.map((item) => ({ id: uuid(), ...item }));
  }, [dataSet.favoriteGroupList]);

  const { animatedItems, bindGesture } = useAnimatedItems({
    items,
    itemDimensions,
    columnLength,
    orderField: 'orderSeq',
    handleDragStart: () => {
      useRef.current = setTimeout(() => {
        dataSet.changeStore('isDragging', true);
      }, 300);
    },
    handleDragEnd: ({ animatedItems: list }) => {
      fetchCreateGroup(list).then((res) => {
        dataSet.changeStore({
          isDragging: false,
          favoriteGroupList: res,
        });
      });
    },
    handleDebounceDragEnd: () => {
      if (useRef.current) clearTimeout(useRef.current);
      dataSet.changeStore('isDragging', false);
    },
  });

  return (
    <div
      className={classNames([
        'favorite-list-group',
        { 'favorite-list-group-isDragged': dataSet.isDragging },
      ])}
      ref={gridRef}
      style={{ height: Math.ceil(dataSet.favoriteGroupList.length / columnLength) * 200 }}
    >
      {animatedItems.map((group) => {
        const { id, controller, categoryName, productFavoritesDTOList } = group;
        return (
          <animated.div
            key={id}
            className="favorite-list-group-itemWrapper"
            style={controller.springs}
            {...bindGesture(id)}
          >
            <div
              className="favorite-list-group-item"
              onClick={() => {
                if (dataSet.isDragging) return;
                dataSet.changeStore({ currentGroup: group, isDragging: false });
                dataSet.getCurrentGroupProduct(group.categoryId);
              }}
            >
              <div className="group-item-product">
                <div className="group-item-product-imgs">
                  {productFavoritesDTOList?.slice(0, 3)?.map((product, index) => {
                    return (
                      <Image
                        wrapperClassName={`group-item-product-imgs-${index}`}
                        value={product.imagePath}
                        width={100}
                        height={100}
                      />
                    );
                  })}
                  <div
                    className={classNames([
                      'group-item-product-imgs-block',
                      { 'only-one-group': productFavoritesDTOList?.length === 1 },
                      { 'empty-group': isEmpty(productFavoritesDTOList) },
                    ])}
                  />
                </div>
                <div className="group-item-product-name text-overflow" r-title>
                  {categoryName}
                </div>
                <div className="group-item-product-count">
                  {intl
                    .get('mallf.myFavorite.view.products.totalNum', {
                      value: productFavoritesDTOList?.length || 0,
                    })
                    .d(`共${productFavoritesDTOList?.length || 0}件商品`)}
                </div>
              </div>
              <div className="group-item-drag icon-span">
                <Icon type="baseline-drag_indicator" />
                <span>{intl.get('mallf.myFavorite.button.drag').d('拖拽')}</span>
              </div>
              <div className="group-item-operate">
                <div
                  className="group-item-operate-delete icon-span"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteGroup({ dataSet, group });
                  }}
                >
                  <Icon type="delete_black-o" />
                  <span>{intl.get('mallf.myFavorite.view.delete.group').d('删除收藏夹')}</span>
                </div>
                <div
                  className="group-item-operate-edit icon-span"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateGroup({ dataSet, group });
                  }}
                >
                  <Icon type="mode_edit" />
                  <span>{intl.get('mallf.myFavorite.view.edit.group').d('编辑收藏夹')}</span>
                </div>
              </div>
            </div>
          </animated.div>
        );
      })}
    </div>
  );
});

export default FavoriteGroup;
