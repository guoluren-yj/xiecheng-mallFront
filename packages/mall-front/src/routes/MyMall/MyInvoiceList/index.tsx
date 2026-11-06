import React, { useRef, useMemo } from 'react';
import { Observer } from 'mobx-react';
import { Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { INVOICE_LIST_SEARCH_BAR } from 'utils/customizeCode';
import Searchbar from 'components/SearchBar';
import Pagination from 'components/Pagination';

import InvoiceDataSet from './InvoiceDataSet';
import InvoiceList from './InvoiceList';
import style from './index.less';

const MyInvoiceList: React.FC = () => {
  const searchBarRef = useRef<any>();
  const invoiceDataSet = useMemo(() => {
    return new InvoiceDataSet({
      autoQuery: false,
      paging: false,
    });
  }, []);
  return (
    <Observer>
      {() => (
        <Spin dataSet={invoiceDataSet}>
          <div className={style['myInvoice-container']}>
            <div className="title" style={{ marginBottom: 15 }}>
              {intl.get('mallf.myInvoice.view.invoice.myInvoice').d('我的发票')}
            </div>
            <div style={{ marginBottom: 5, width: 'max-content' }}>
              <Searchbar
                dataSet={invoiceDataSet}
                handleSearch={({ params }) => {
                  invoiceDataSet.queryData({
                    ...params,
                    page: 0,
                    customizeUnitCode: INVOICE_LIST_SEARCH_BAR,
                  });
                }}
                searchCode={INVOICE_LIST_SEARCH_BAR}
                searchBarRef={ref => {
                  searchBarRef.current = ref;
                }}
              />
            </div>
            <InvoiceList dataSet={invoiceDataSet} />
            <div className="empty-invoiceList" r-if={invoiceDataSet.length === 0}>
              <div className="info">
                {intl.get('mallf.myInvoice.view.invoice.noInvoice').d('暂无发票')}
              </div>
            </div>
            <Pagination
              showSizeChanger
              style={{ width: '100%', marginTop: 15 }}
              zeroStart
              showQuickJumper
              {...invoiceDataSet.pagination}
              onForward={page => {
                const searchBarParams = searchBarRef.current.getQueryParameter();
                invoiceDataSet.queryData({
                  ...searchBarParams,
                  ...page,
                  customizeUnitCode: INVOICE_LIST_SEARCH_BAR,
                });
              }}
            />
          </div>
        </Spin>
      )}
    </Observer>
  );
};

export default formatterCollections({ code: ['mallf.myInvoice'] })(MyInvoiceList);
