import React, { useState } from 'react';

import intl from 'utils/intl';
import Loading from 'components/loading';
import Pagination from 'components/Pagination';
import { deleteWishOrderApi } from 'services/myWishListService';
import { Spin } from 'choerodon-ui';
import WishCard from './WishCard';

import style from './index.less';

export default function WishList(props) {
  const [spinning, setSpinning] = useState(false); // 表单刷新
  const { loading, wishList, pagination = {}, searchFunc } = props;

  const handlerRemove = (order) => {
    setSpinning(true);
    deleteWishOrderApi([order])
      .then(() => {
        searchFunc();
      })
      .finally(() => {
        setSpinning(false);
      });
  };

  return (
    <div>
      <div className={style.wishList} style={{ minHeight: `${window.innerHeight - 400}px` }}>
        {loading ? (
          <Loading />
        ) : wishList.length > 0 ? (
          <Spin spinning={spinning}>
            <>
              {wishList.map((item) => (
                <WishCard item={item} handlerRemove={handlerRemove} />
              ))}
              <Pagination
                showSizeChanger
                style={{ width: '100%', marginTop: 15 }}
                zeroStart
                showQuickJumper
                {...pagination}
                onForward={searchFunc}
              />
            </>
          </Spin>
        ) : (
          <div className="empty-order-list">
            <div className="info">{intl.get('mallf.common.view.noData').d('暂无数据')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
