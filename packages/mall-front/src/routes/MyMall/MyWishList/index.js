import React, { useState, useEffect } from 'react';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { fetchWishListApi } from 'services/myWishListService';
import style from './index.less';
import WishList from './WishList';

function MyWishList() {
  const [wishList, setWishList] = useState([]); // 心愿单列表
  const [loading, setLoading] = useState(false); // 查询loading
  const [pagination, setPagination] = useState({});
  const [queryData] = useState({ page: 0, size: 10 });

  useEffect(() => {
    fetchWishList();
  }, []);

  const fetchWishList = (param) => {
    const params = {
      ...queryData,
      ...param,
    };
    // 查询心愿单
    setLoading(true);
    fetchWishListApi(params).then((res) => {
      const { content = [], ...paging } = res;
      const suppilers = {};
      const resultArr = [];
      content.forEach((c) => {
        const { supplierId } = c;
        if (suppilers[`${supplierId}-`]) {
          suppilers[`${supplierId}-`].push(c);
        } else {
          suppilers[`${supplierId}-`] = [c];
        }
      });
      Object.keys(suppilers).forEach((id) => {
        const { supplierId, partnerFlag, supplierCompanyName } = suppilers[id][0];
        resultArr.push({
          supplierId,
          partnerFlag,
          supplierCompanyName,
          productList: suppilers[id],
        });
      });
      setLoading(false);
      setPagination(paging);
      setWishList(resultArr);
    });
  };

  const wishListProps = {
    loading,
    wishList,
    pagination,
    setLoading,
    searchFunc: fetchWishList,
  };

  return (
    <div>
      <div className={style.wishListHeader}>
        {intl.get('mallf.myOrder.view.wishHead.myWishList').d('我的心愿单')}
      </div>
      <WishList {...wishListProps} />
    </div>
  );
}
export default formatterCollections({ code: ['mallf.myOrder', 'mallf.common'] })(MyWishList);
