import React, { useEffect, useMemo, useRef } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import Pagination from 'components/Pagination';
import TabButtons from 'components/TabButtons';
import { OPENCART_LIST_SEARCH_BAR } from 'utils/customizeCode';

import RequestDataSet from './dataSet';
import style from './index.less';
import RequestHeader from './RequestHeader';
import RequestList from './RequestList';

function OpenCartMyRequest() {
  const searchBarRef = useRef();

  const dataSet = useMemo(() => {
    return new RequestDataSet({
      autoQuery: false,
      paging: false,
    });
  }, []);

  useEffect(() => {
    dataSet.queryCount();
  }, []);

  return (
    <Observer>
      {() => (
        <Spin dataSet={dataSet}>
          <div className={style['my-request']}>
            <TabButtons
              tabList={dataSet.labelList}
              currentTab={dataSet.currentStatus}
              setCurrentTab={(type) => {
                dataSet.onRadioChange(type);
                if (searchBarRef.current) {
                  searchBarRef.current.handleResetFilter();
                }
              }}
              count={dataSet.count}
              customizedCode="MALL-APPLY-OPENCART-LIST-TAB"
            />

            <RequestHeader dataSet={dataSet} searchBarRef={searchBarRef} />
            <RequestList dataSet={dataSet} />
            <div className="empty-purchase-list" r-if={dataSet.toData()?.length === 0}>
              <div className="info">
                {intl.get('mallf.myRequest.view.order.noManualApplication').d('暂无申请')}
              </div>
            </div>
            <Pagination
              showSizeChanger
              style={{ width: '100%', marginTop: 15 }}
              zeroStart
              showQuickJumper
              {...dataSet.pagination}
              onForward={(page) => {
                const searchBarParams = searchBarRef.current?.getQueryParameter();
                dataSet.queryData({
                  ...searchBarParams,
                  ...page,
                  requestCode: dataSet.requestCode,
                  customizeUnitCode: OPENCART_LIST_SEARCH_BAR,
                });
              }}
            />
          </div>
        </Spin>
      )}
    </Observer>
  );
}

export default formatterCollections({
  code: [
    'mallf.myRequest',
    'mallf.cart',
    'component.docFlow',
    'mallf.companyOrder',
    'component.operationRecord',
    'hwfp.common',
    'hwfp.task',
    'mallf.myOrder',
  ],
})(OpenCartMyRequest);
