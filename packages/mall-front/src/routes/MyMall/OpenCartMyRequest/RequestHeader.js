import React, { useMemo } from 'react';
import moment from 'moment';

import Searchbar from 'components/SearchBar';
import { OPENCART_LIST_SEARCH_BAR } from 'utils/customizeCode';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import cuxComponent from 'cuxTools/cuxComponent';

function RequestHeader(props) {
  const { dataSet, searchBarRef } = props;
  // 默认查询6个月之内的数据
  const requestDateRange = useMemo(() => {
    return [
      moment(new Date()).subtract(6, 'M').format(DATETIME_MIN),
      moment(new Date()).format(DATETIME_MAX),
    ];
  }, []);

  return (
    <div style={{ marginTop: '15px' }}>
      <Searchbar
        handleSearch={({ params }) => {
          dataSet.queryData({
            ...params,
            customizeUnitCode: OPENCART_LIST_SEARCH_BAR,
            page: 0, // 筛选器条件改动时 需要将内容置为第一页
          });
        }}
        searchCode={OPENCART_LIST_SEARCH_BAR}
        searchBarRef={(ref) => {
          searchBarRef.current = ref;
        }}
        searchBarConfig={{
          fieldProps: {
            requestDate: {
              defaultValue: () => requestDateRange,
            },
          },
        }}
      />
    </div>
  );
}

export default cuxComponent({ path: 'OpenCartMyRequest/RequestHeader' })(RequestHeader);
