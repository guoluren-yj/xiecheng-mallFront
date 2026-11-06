/**
 * pagination - 分页组件
 * @date: 2019-09-01
 * @author: <peng.yang05@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Pagination } from 'choerodon-ui/pro';
import styles from './index.less';

function PaginationCom(props) {
  const {
    style = {},
    size,
    onForward,
    totalElements,
    number = 0,
    empty,
    showSizeChanger,
    pageSizeOptions = ['10', '20', '30'],
    showTotal,
    scrollTop = 0,
    scroll = true,
  } = props;
  return (
    <div className={styles.pagination} style={style}>
      {!empty && (
        <Pagination
          showSizeChangerLabel
          page={number + 1}
          total={totalElements}
          hideOnSinglePage
          showSizeChanger={!!showSizeChanger}
          showTotal={!!showTotal}
          showPager
          pageSizeOptions={pageSizeOptions}
          onChange={(p, z) => {
            if (scroll) window.scrollTo(0, scrollTop);
            onForward({ page: p - 1, size: z });
          }}
          pageSize={size}
        />
      )}
    </div>
  );
}

export default PaginationCom;
