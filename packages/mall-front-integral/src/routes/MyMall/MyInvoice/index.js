import React, { useState, useEffect } from 'react';
import { Row, Col } from 'hzero-ui';

import { fetchInvoiceListService } from 'services/myInvoiceService';
import { fetchOmsOrderCentent } from 'services/orderCenterService';
import intl from 'utils/intl';
import Search from 'components/NewMyMallSearch';

import useOmsFlag from 'hooks/useOmsFlag';
import style from './index.less';
import InvoiceList from './MyInvoiceList';

function MyInvoice() {
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState([]);
  const [queryData] = useState({ page: 0, size: 10 });
  const [pagination, setPagination] = useState({});

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
      ...queryData,
      ...params,
    };
    setLoading(true);
    fetchInvoiceListService(queryParams)
      .then((res) => {
        setInvoiceData(res.content || []);
        setPagination(res.pagination);
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
      ...queryData,
      ...params,
      channel: 'PERSONAL',
      invoiceFlag: 1,
    };
    // eslint-disable-next-line no-param-reassign
    if (params.time) queryParams.queryDateCode = params.time;

    setLoading(true);
    fetchOmsOrderCentent(queryParams)
      .then((res) => {
        setInvoiceData(res?.content || []);
        setPagination(res.pagination);
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
    searchFunc: fetchInvoiceList,
  };

  const searchProps = {
    onSearch: isOMS ? fetchOMSInvoiceList : fetchInvoiceList,
    autoQuery: false,
    configs: [
      {
        defaultFlag: true,
        fieldName: intl.get('mallf.common.view.srmPoNum').d('SRM订单号'),
        fieldCode: isOMS ? 'srmOrderCode' : 'srmPoNum',
      },
      {
        fieldName: intl.get('mallf.myMall.model.search.parentOrderNumber').d('父订单号'),
        fieldCode: isOMS ? 'cecOrderCode' : 'ecPoNum',
      },
      {
        fieldName: intl.get('mallf.myMall.model.search.childOrderNumber').d('子订单号'),
        fieldCode: isOMS ? 'ecConsignmentCode' : 'poSubNum',
      },
      {
        fieldName: intl.get('mallf.myMall.model.search.commodityNames').d('商品名称'),
        fieldCode: isOMS ? 'skuName' : 'productName',
      },
      {
        fieldName: intl.get('mallf.common.view.message.timeRange').d('时间范围'),
        fieldCode: 'time',
        fieldType: 'Select',
        filedContent: [
          {
            value: isOMS ? 'all' : '',
            meaning: intl.get('mallf.myMall.model.search.all').d('全部'),
          },
          {
            value: isOMS ? 'threeMonthAgo' : 'threeMonth',
            meaning: intl.get('mallf.myMall.model.search.threeMonths').d('三个月'),
          },
          {
            value: isOMS ? 'oneMonthAgo' : 'oneMonth',
            meaning: intl.get('mallf.myMall.model.search.oneMonth').d('一个月'),
          },
          {
            value: isOMS ? 'oneWeekAgo' : 'oneWeek',
            meaning: intl.get('mallf.myMall.model.search.oneWeek').d('一周'),
          },
        ],
      },
    ],
  };
  return (
    <div className={style['myInvoice-container']}>
      <Row style={{ marginBottom: 10 }}>
        <Col span={12} className="title">
          {intl.get('mallf.myMall.view.invoice.myInvoice').d('我的发票')}
        </Col>
      </Row>
      <Row style={{ marginBottom: 10 }}>
        <Search {...searchProps} />
      </Row>
      <InvoiceList {...invoiceProps} />
    </div>
  );
}

export default MyInvoice;
