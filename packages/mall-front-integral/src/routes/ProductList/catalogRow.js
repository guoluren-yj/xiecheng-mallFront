import React, { useState } from 'react';

import intl from 'utils/intl';
import Icons from 'components/Icons';

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
          {
            <>
              <div
                onClick={() => {
                  setRowStatus({ ...rowStatus, moreBtn: !moreBtn });
                }}
                className={`show-more show${rowItems.length > 6 ? 1 : 0}`}
              >
                <span>
                  {moreBtn
                    ? intl.get('mallf.common.button.more').d('更多')
                    : intl.get('mallf.common.button.pickUp').d('收起')}
                </span>
                <Icons size="10" style={{ marginLeft: '2px' }} type={moreBtn ? 'down' : 'pull'} />
              </div>
            </>
          }
        </td>
      </tr>
    </React.Fragment>
  );
}

export default CatalogRow;
