import React, { useState } from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

function CatalogRow(props) {
  const [rowStatus, setRowStatus] = useState({
    moreBtn: true,
    rowShow: true,
  });

  const { id, name, rowItems } = props;

  const { moreBtn, rowShow } = rowStatus;

  function getSubConditions(rowdataId, data) {
    return (
      data &&
      data.map((item) => {
        const { value, meaning } = item;
        let tmpCatalogLevel = Number(props.catalogLevel);
        tmpCatalogLevel++;
        return (
          <li
            key={meaning}
            onClick={() => {
              props.fetchProductList({
                [`${rowdataId}`]: value,
                catalogLevel: tmpCatalogLevel,
                catalogName: meaning,
              });
              props.fetchCurrentCategory({
                [`${rowdataId}`]: value,
                catalogLevel: tmpCatalogLevel,
                catalogName: meaning,
              });
              props.getCategoryRow({
                [`${rowdataId}`]: value,
                catalogLevel: tmpCatalogLevel,
                catalogName: meaning,
              });
            }}
          >
            <span key="1" title={meaning}>
              {meaning}
            </span>
          </li>
        );
      })
    );
  }

  return (
    <React.Fragment>
      <tr
        id={id}
        key="1"
        className="option2"
        style={{
          display: rowShow ? 'visible' : 'none',
        }}
      >
        <td className="tab-th">{name}</td>
        <td className="option2List">
          <ul
            style={{
              overflow: moreBtn ? 'hidden' : 'hidden auto',
              height: moreBtn ? '38px' : 'auto',
              maxHeight: '150px',
            }}
          >
            <div className="li-container" style={{ overflow: 'hidden' }}>
              {getSubConditions(id, rowItems)}
            </div>
          </ul>
        </td>
        <td className="last-td">
          {moreBtn ? (
            <Button
              onClick={() => {
                setRowStatus({ ...rowStatus, moreBtn: !moreBtn });
              }}
              icon="expand_more"
              size="small"
            >
              {intl.get('mallf.common.button.more').d('更多')}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setRowStatus({ ...rowStatus, moreBtn: !moreBtn });
              }}
              icon="expand_less"
              size="small"
            >
              {intl.get('mallf.common.button.pickUp').d('收起')}
            </Button>
          )}
        </td>
      </tr>
    </React.Fragment>
  );
}

export default CatalogRow;
