import React from 'react';

import ListHeader from './ListHeader';
import ListContent from './ListContent';

function RequestList({ dataSet }) {
  const listData = dataSet.toData() || [];
  return listData.map((item) => (
    <div className="request-list-container">
      <ListHeader item={item} dataSet={dataSet} />
      <ListContent item={item} dataSet={dataSet} />
    </div>
  ));
}

export default RequestList;
