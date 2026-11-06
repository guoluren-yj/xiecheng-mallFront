import React, { useState, useEffect, useRef } from 'react';
import { Row, Col } from 'hzero-ui';

import { fetchInvoiceListService, fetchOmsInvoiceService } from 'services/myInvoiceService';
import intl from 'utils/intl';
import Searchbar from 'components/SearchBar';
import NewMyMallSearch from 'components/NewMyMallSearch';
import formatterCollections from 'utils/intl/formatterCollections';
import { INVOICE_LIST_SEARCH_BAR } from 'utils/customizeCode';

import style from './index.less';
import InvoiceList from './MyInvoiceList';
import useOmsFlag from '@/hooks/useOmsFlag';

function MyInvoice() {
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState([]);
  const [queryData] = useState({ page: 0, size: 10 });
  const [pagination, setPagination] = useState({});
  const searchRef = useRef(null);
  const isOMS = useOmsFlag();

  useEffect(() => {
    if (isOMS !== undefined) {
      if (isOMS) {
        fetchOMSInvoiceList(queryData);
      } else {
        fetchInvoiceList(queryData); // 获取发票列表信息
      }
    }
  }, [isOMS]);

  /**
   * 获取发票列表
   * @param {Array} 传入参数
   */
  function fetchInvoiceList(params = {}) {
    const queryParams = {
      ...(searchRef?.current?.getQueryParameter() || {}),
      ...queryData,
      ...params,
    };
    setLoading(true);
    fetchInvoiceListService(queryParams)
      .then((res) => {
        const { content = [], ...other } = res || {};
        setInvoiceData(content || []);
        setPagination(other);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  /**
   * 获取发票列表
   * @param {Array} 传入参数
   */
  function fetchOMSInvoiceList(params = {}) {
    const queryParams = {
      ...(searchRef?.current?.getQueryParameter() || {}),
      ...queryData,
      ...params,
      channel: 'ENTERPRISE',
      invoiceFlag: 1,
    };
    // eslint-disable-next-line no-param-reassign
    if (params.time) queryParams.queryDateCode = params.time;

    setLoading(true);
    fetchOmsInvoiceService(queryParams)
      .then((res) => {
        const { content = [], ...other } = res || {};
        setInvoiceData(content || []);
        setPagination(other);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const invoiceProps = {
    isOMS,
    loading,
    invoiceData,
    pagination,
    searchFunc: isOMS ? fetchOMSInvoiceList : fetchInvoiceList,
  };

  const searchProps = {
    onSearch: fetchInvoiceList,
    autoQuery: false,
    configs: [
      {
        defaultFlag: true,
        fieldName: intl.get('mallf.myInvoice.view.srmPoNum').d('SRM订单号'),
        fieldCode: isOMS ? 'orderCode' : 'srmPoNum',
      },
      {
        fieldName: intl.get('mallf.myInvoice.model.search.parentOrderNumber').d('父订单号'),
        fieldCode: 'ecPoNum',
      },
      {
        fieldName: intl.get('mallf.myInvoice.model.search.childOrderNumber').d('子订单号'),
        fieldCode: 'poSubNum',
      },
      {
        fieldName: intl.get('mallf.myInvoice.model.search.commodityNames').d('商品名称'),
        fieldCode: 'productName',
      },
      {
        fieldName: intl.get('mallf.common.view.message.timeRange').d('时间范围'),
        fieldCode: 'time',
        fieldType: 'Select',
        filedContent: [
          {
            value: '',
            meaning: intl.get('mallf.myInvoice.model.search.all').d('全部'),
          },
          {
            value: 'threeMonth',
            meaning: intl.get('mallf.myInvoice.model.search.threeMonths').d('三个月'),
          },
          {
            value: 'oneMonth',
            meaning: intl.get('mallf.myInvoice.model.search.oneMonth').d('一个月'),
          },
          {
            value: 'oneWeek',
            meaning: intl.get('mallf.myInvoice.model.search.oneWeek').d('一周'),
          },
        ],
      },
    ],
  };
  return (
    <div className={style['myInvoice-container']}>
      <Row style={{ marginBottom: 15 }}>
        <Col span={12} className="title">
          {intl.get('mallf.myInvoice.view.invoice.myInvoice').d('我的发票')}
        </Col>
      </Row>
      <div style={{ marginBottom: 5, width: 'max-content' }}>
        {isOMS ? (
          <Searchbar
            handleSearch={({ params }) => {
              fetchOMSInvoiceList({
                ...params,
                customizeUnitCode: INVOICE_LIST_SEARCH_BAR,
              });
            }}
            searchCode={INVOICE_LIST_SEARCH_BAR}
          />
        ) : (
          <NewMyMallSearch {...searchProps} ref={searchRef} />
        )}
      </div>
      <InvoiceList {...invoiceProps} />
    </div>
  );
}

export default formatterCollections({ code: ['mallf.myInvoice'] })(MyInvoice);
