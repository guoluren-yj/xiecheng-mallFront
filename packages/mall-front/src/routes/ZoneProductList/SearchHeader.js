import React, { memo } from 'react';
import classNames from 'classnames';
import { Icon } from 'choerodon-ui';
import { TextField } from 'choerodon-ui/pro';

import intl from 'utils/intl';

function SearchHeader(props) {
  const { conditionType, fetchParams, order, keyword, getProductList = (e) => e, setState } = props;

  const handleSearch = (e) => {
    getProductList({
      ...fetchParams,
      keyword: e,
    });
  };

  function changeCondition(type) {
    const params = { ...fetchParams };
    if (type === 'price') {
      params.priceOrder = order === 'asc' ? 'desc' : 'asc';
      if (conditionType === 'price') {
        setState({
          conditionType: 'price',
          order: order === 'asc' ? 'desc' : 'asc',
        });
      } else {
        setState({
          conditionType: 'price',
          order: order === 'asc' ? 'desc' : 'asc',
        });
      }
    } else {
      params.priceOrder = null;
      setState({
        conditionType: '',
        order: 'desc',
      });
    }
    getProductList(params);
  }

  return (
    <div className="search-header">
      <div className="search-header-content">
        <div className="select-box">
          <div
            onClick={() => {
              changeCondition();
            }}
            className={classNames(['select-box-item', 'left', { active: !conditionType }])}
          >
            {intl.get(`mallf.productList.view.productList.comprehensive`).d('综合')}
          </div>
        </div>
        <div className="searchBar">
          <TextField
            defaultValue={keyword}
            className="searchInput"
            placeholder={intl.get('mallf.productList.view.searchInResult').d('在结果中搜索')}
            onChange={handleSearch}
          />
          <Icon type="search" className="searchIcon" />
        </div>
      </div>
    </div>
  );
}

export default memo(SearchHeader);
