import React, { useState } from 'react';

import intl from 'utils/intl';
import Icons from 'components/Icons';

function SearchRow(props) {
  const [rowStatus, setRowStatus] = useState({
    moreBtn: true,
    chooseMore: true,
    rowShow: true,
  });

  const [rowData, setRowData] = useState({
    selectItems: props.selectItems,
  });

  const { selectItems } = rowData;
  const { id, name, rowItems, rowCodeItems, attributeQuery, fetchParams } = props;

  const { moreBtn, chooseMore, rowShow } = rowStatus;
  function getSubConditions(rowdataId, data) {
    return (
      data &&
      data.map((d) => {
        // 因为标签是对象数组(展示name，传code)，其他的是字符串数组，所以要判断类型
        const item = typeof d === 'object' ? d?.labelName : d;
        let liClass = '';
        let labelClass = 'del';
        if (
          selectItems.some(
            (tmp) => tmp === item || (typeof d === 'object' && tmp.labelCode === d?.labelCode)
          )
        ) {
          liClass = 'chooseMore-li';
          labelClass = 'del-show';
        }

        return (
          <li
            className={liClass}
            onClick={() => {
              if (chooseMore) {
                const newSelectItems = [item];
                let params = {};
                setRowData({
                  selectItems: newSelectItems,
                });
                setRowStatus({
                  ...rowStatus,
                  rowShow: false,
                });

                const itemCode = rowCodeItems.find((i) => (i.meaning || i) === item) || {};

                if (rowdataId === 'sourceFrom') {
                  params = {
                    [`${rowdataId}`]: [itemCode.code || itemCode.meaning || itemCode],
                    page: 0,
                  };
                } else {
                  params = {
                    ...fetchParams,
                    attribute: {
                      ...attributeQuery,
                      [`${rowdataId}`]: [
                        typeof d === 'object' ? d : itemCode.code || itemCode.meaning || itemCode,
                      ],
                    },
                    page: 0,
                  };
                }
                props.fetchProductList(params, [], true);
              } else if (
                !selectItems.some(
                  (tmp) =>
                    tmp === item || (typeof d === 'object' && tmp?.labelCode === d?.labelCode)
                )
              ) {
                const newItem = typeof d === 'object' ? d : item;
                const newSelectItems = [...selectItems, newItem];
                setRowData({
                  selectItems: newSelectItems,
                });
              }
            }}
          >
            <React.Fragment>
              <span key="1" title={typeof item === 'object' ? item.labelName : item}>
                {typeof item === 'object' ? item.labelName : item}
              </span>
              <div
                key="2"
                onClick={() => {
                  const tmpSelectItems = [...selectItems];
                  const newSelectItems = tmpSelectItems.filter((tmp) => {
                    return tmp !== item;
                  });
                  setRowData({
                    selectItems: newSelectItems,
                  });
                }}
                className={labelClass}
              />
            </React.Fragment>
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
              overflowX: 'hidden',
              overflowY: moreBtn ? 'hidden' : 'auto',
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
          {chooseMore ? (
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
              {id !== 'catalogId' && (
                <>
                  <span
                    className="choose-more"
                    onClick={() => {
                      setRowStatus({ ...rowStatus, chooseMore: false, moreBtn: false });
                    }}
                  >
                    + {intl.get('mallf.common.model.common.multipleSelect').d('多选')}
                  </span>
                </>
              )}
            </>
          ) : (
            <div id={`btnGroup-${id}`} className="brand-btnGroup">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setRowStatus({ ...rowStatus, chooseMore: true });
                  setRowData({
                    selectItems: [],
                  });
                }}
              >
                {intl.get('mallf.common.model.common.cancel').d('取消')}
              </button>
              <button
                type="button"
                className="btn-submit"
                text=""
                disabled={!(selectItems.length > 0)}
                onClick={() => {
                  setRowStatus({ ...rowStatus, chooseMore: false, rowShow: false });
                  // const queryValues = selectItems.map(item => item.value);
                  let params = {};
                  const newSelectItems = selectItems.map((s) => {
                    const { code, meaning } =
                      rowCodeItems.find((i) => (i.meaning || i) === s) || {};
                    return code || meaning || s;
                  });
                  if (id === 'sourceFrom') {
                    params = {
                      [`${id}`]: newSelectItems,
                      page: 0,
                    };
                  } else {
                    params = {
                      attribute: {
                        ...attributeQuery,
                        [`${id}`]: newSelectItems,
                      },
                      page: 0,
                    };
                  }
                  props.fetchProductList(params, [], true);
                }}
              >
                {intl.get('mallf.common.model.button.confirm').d('确定')}
              </button>
            </div>
          )}
        </td>
      </tr>
    </React.Fragment>
  );
}

export default SearchRow;
