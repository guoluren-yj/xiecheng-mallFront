import React, { useState } from 'react';
import { Button, Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';

import { Input, Icon } from 'hzero-ui';
import intl from 'utils/intl';
// import Icons from 'components/Icons';

function SearchRow(props) {
  const [rowStatus, setRowStatus] = useState({
    moreBtn: true,
    chooseMore: true,
    rowShow: true,
    filterShow: false,
  });

  const [rowData, setRowData] = useState({
    selectItems: props.selectItems,
  });
  const [brandData, setBrandData] = useState(props.rowCodeItems);
  const [brandValue, setBrandValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { selectItems } = rowData;
  const {
    id,
    name,
    // rowItems,
    rowCodeItems,
    mergeRowItems,
    attributeQuery,
    fetchParams,
    brandMap,
    attributeMap,
  } = props;

  // 首字母列表
  const otherBrand = intl.get('mallf.common.productList.brand.other').d('其他');
  let brandList = [];
  const brandMaplist = Object.keys(brandMap || {});
  if (!brandMaplist?.find((a) => a === otherBrand)) {
    brandList = brandMaplist;
  } else {
    brandList = brandMaplist?.filter((i) => i !== otherBrand);
    brandList.push(otherBrand);
  }
  brandList.unshift({
    value: 'ALL',
    meaning: intl.get('mallf.common.productList.brand.all').d('所有品牌'),
  });

  const { moreBtn, chooseMore, rowShow } = rowStatus;
  function getSubConditions(rowdataId, data) {
    // 判断数据源是品牌还是其他项目
    const res = id === '品牌' || id === 'brand' || id === 'ブランド' ? brandData : data;
    const subItems = [...mergeRowItems, ...(res || [])];
    return (
      <>
        {subItems.length > 0 &&
          subItems.map((d, index) => {
            // 因为标签是对象数组(展示name，传code)，其他的是字符串数组，所以要判断类型
            const item = d?.meaning || d;
            const isMergeItems = d?.mergeRowId;
            const isSelected = selectItems.some((tmp) => (tmp.meaning || tmp) === item);
            const isDisibled = !chooseMore && d?.multDisible;
            const labelClass = isSelected ? 'del-show' : 'del';
            const itemTips = isDisibled
              ? intl.get('mallf.common.productList.sourceMultDisabled').d('不能对商品来源进行多选')
              : null;

            return (
              <li
                className={classNames({
                  'chooseMore-li': isSelected,
                  'disibled-li': isDisibled,
                  'last-merge-li': isMergeItems && index === mergeRowItems.length - 1,
                })}
                onClick={() => {
                  if (isDisibled) return;
                  if (chooseMore) {
                    const newSelectItems = [item.code];
                    let params = {};
                    setRowData({
                      selectItems: newSelectItems,
                    });
                    setRowStatus({
                      ...rowStatus,
                      rowShow: false,
                    });

                    const itemCode = rowCodeItems?.find((i) => (i.meaning || i) === item) || {};
                    if (rowdataId === 'sourceFrom') {
                      params = {
                        [`${rowdataId}`]: [itemCode.code || itemCode.meaning || itemCode],
                        page: 0,
                      };
                    } else {
                      const attributeQueryKey = d?.mergeRowId || rowdataId;
                      const attributeQueryItem = isMergeItems ? d : itemCode;

                      params = {
                        ...fetchParams,
                        attribute: {
                          ...attributeQuery,
                          [attributeQueryKey]: [
                            attributeQueryItem?.code ||
                              attributeQueryItem?.meaning ||
                              attributeQueryItem,
                          ],
                        },
                        page: 0,
                      };
                    }
                    props.fetchProductList({ ...params, needContinue: false }, [], true);
                  } else {
                    const newItem = d;
                    const newSelectItems = [...selectItems, newItem];
                    setRowData({
                      selectItems: newSelectItems,
                    });
                  }
                }}
              >
                <React.Fragment>
                  <Tooltip title={itemTips}>
                    <span key="1" title={typeof item === 'object' ? item.meaning : item}>
                      {typeof item === 'object' ? item.meaning : item}
                    </span>
                  </Tooltip>
                  <div
                    key="2"
                    onClick={(e) => {
                      e.stopPropagation();
                      const tmpSelectItems = [...selectItems];
                      setRowData({
                        selectItems: tmpSelectItems.filter((tmp) => {
                          return tmp.meaning !== item;
                        }),
                      });
                    }}
                    className={labelClass}
                  />
                </React.Fragment>
              </li>
            );
          })}
      </>
    );
  }

  /* 选择对应首字母 */
  const selectintial = (brand, idx) => {
    setCurrentIndex(idx);
    if (brand?.value === 'ALL') {
      setBrandData(attributeMap['品牌'] || attributeMap[brand] || attributeMap['ブランド']);
    } else {
      setBrandData(brandMap[brand]?.map((f) => f.meaning));
    }
  };

  /* 本地搜索功能 */
  const searchBrand = () => {
    const brandName = attributeMap['品牌'] || attributeMap.brand || attributeMap['ブランド'];
    setBrandData(brandName.filter((i) => String(i).indexOf(brandValue) > -1));
    setCurrentIndex(0);
  };

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
            <div className="li-container" style={{ overflow: 'hidden', marginTop: 6 }}>
              {(id === '品牌' || id === 'brand' || id === 'ブランド') && rowStatus.filterShow && (
                <>
                  <div className="search-bar">
                    <Icon type="search" className="search-icon" onClick={() => searchBrand()} />
                    <Input
                      placeholder={intl
                        .get('mallf.common.productList.brand.filter.result')
                        .d('请搜索结果')}
                      style={{ width: 300, height: 28, paddingLeft: 34 }}
                      value={brandValue}
                      onChange={(e) => setBrandValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          searchBrand();
                        }
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    {brandList.map((i, k) => (
                      <span
                        key={i?.value || i}
                        className={`initals ${currentIndex === k ? 'active' : ''}`}
                        onClick={() => selectintial(i, k)}
                      >
                        {i?.meaning || i}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {getSubConditions(id, rowCodeItems)}
            </div>
          </ul>
        </td>
        <td className="last-td">
          {chooseMore ? (
            <>
              {moreBtn ? (
                <Button
                  onClick={() => {
                    setRowStatus({ ...rowStatus, moreBtn: !moreBtn, filterShow: true });
                  }}
                  icon="expand_more"
                  size="small"
                >
                  {intl.get('mallf.common.button.more').d('更多')}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setRowStatus({ ...rowStatus, moreBtn: !moreBtn, filterShow: false });
                    setBrandData(
                      attributeMap['品牌'] || attributeMap.brand || attributeMap['ブランド']
                    );
                    setCurrentIndex(0);
                  }}
                  icon="expand_less"
                  size="small"
                >
                  {intl.get('mallf.common.button.pickUp').d('收起')}
                </Button>
              )}
              {id !== 'catalogId' && (
                <>
                  <Button
                    onClick={() => {
                      setRowStatus({
                        ...rowStatus,
                        chooseMore: false,
                        moreBtn: false,
                        filterShow: true,
                      });
                    }}
                    icon="add"
                    size="small"
                  >
                    {intl.get('mallf.productList.model.common.multipleSelect').d('多选')}
                  </Button>
                </>
              )}
            </>
          ) : (
            <div id={`btnGroup-${id}`} className="brand-btnGroup">
              <Button
                size="small"
                style={{ marginTop: -12 }}
                onClick={() => {
                  setRowStatus({ ...rowStatus, chooseMore: true, filterShow: false });
                  setRowData({
                    selectItems: [],
                  });
                  setBrandData(
                    attributeMap['品牌'] || attributeMap.brand || attributeMap['ブランド']
                  );
                  setCurrentIndex(0);
                  setBrandValue('');
                }}
              >
                {intl.get('mallf.common.model.common.cancel').d('取消')}
              </Button>
              <Button
                size="small"
                style={{ marginTop: -12 }}
                disabled={!(selectItems.length > 0)}
                onClick={() => {
                  setRowStatus({ ...rowStatus, chooseMore: false, rowShow: false });
                  // const queryValues = selectItems.map(item => item.value);
                  let params = {};
                  if (id === 'sourceFrom') {
                    params = {
                      [`${id}`]: selectItems.map((s) => s.code || s.meaning || s),
                      page: 0,
                    };
                  } else {
                    params = {
                      attribute: {
                        ...attributeQuery,
                        [`${id}`]: selectItems.map((s) => s.code || s.meaning || s),
                      },
                      page: 0,
                    };
                  }
                  props.fetchProductList({ ...params, needContinue: false }, [], true);
                }}
              >
                {intl.get('mallf.common.model.button.confirm').d('确定')}
              </Button>
            </div>
          )}
        </td>
      </tr>
    </React.Fragment>
  );
}

export default SearchRow;
