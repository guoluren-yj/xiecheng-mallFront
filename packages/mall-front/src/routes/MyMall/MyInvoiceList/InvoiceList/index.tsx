import React from 'react';

import InvoiceDataSet from '../InvoiceDataSet';
import ListHeader from './ListHeader';
import ListContent from './ListContent';
import style from './index.less';

interface InvoiceProps {
  dataSet: InvoiceDataSet,
}

const InvoiceList: React.FC<InvoiceProps> = ({
  dataSet,
}) => {
  return (
    <div className={style['invoiceList-container']}>
      <div className="invoiceList" style={{ padding: 0 }}>
        {dataSet.map(record => (
          <div className="invoice-detail">
            <ListHeader record={record} />
            <ListContent dataSet={dataSet} record={record} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceList;
