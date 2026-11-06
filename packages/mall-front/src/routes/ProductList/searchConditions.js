import React from 'react';
import intl from 'utils/intl';
import Icons from 'components/Icons';

const promptKey = 'mallf.productList';
function SearchConditions(props) {
  const { attributeQuery = {}, fetchProductList, attributeMapWithCode, fetchParams } = props;

  // const handleCancelCondition = (attributeId, sourceData, removeValue) => {
  //   const selectValues = sourceData.filter(item => item !== removeValue);
  //   let queryValues;
  //   if (selectValues.length > 0) {
  //     queryValues = selectValues.map(item => item);
  //   }
  //   fetchProductList({
  //     [attributeId]: queryValues,
  //   });
  // };

  const queryKeys = Object.keys(attributeQuery);
  const allQuery = [];
  queryKeys.forEach((keys) => {
    attributeQuery[keys].forEach((val) => {
      allQuery.push({
        keys,
        val: attributeMapWithCode[keys]?.find((a) => (a.code || a.meaning) === val)?.meaning,
        code: attributeMapWithCode[keys]?.find((a) => (a.code || a.meaning) === val)?.code,
      });
    });
  });

  const handleDelSel = (item) => {
    const searchAttr = {};
    if (attributeQuery?.[item.keys]?.filter((o) => o !== (item.code || item.val)).length > 0) {
      searchAttr[item.keys] = attributeQuery?.[item.keys]?.filter(
        (o) => o !== (item.code || item.val)
      );
    } else {
      delete attributeQuery[item.keys];
    }
    const params = {
      page: 0,
      attribute: {
        ...attributeQuery,
        ...searchAttr,
      },
    };
    fetchProductList(params);
  };

  return (
    <>
      <tr id="chooseTr" className="chooseTr">
        <td
          className="tab-th"
          title={intl.get(`${promptKey}.view.productList.youHaveChosen`).d('您已选择')}
        >
          {intl.get(`${promptKey}.view.productList.youHaveChosen`).d('您已选择')}
        </td>
        <td colSpan={2}>
          <ul id="chooseList">
            {allQuery
              .filter((n) => !!n.val)
              .map((item) => (
                <li className="choose-li" id={`${item.keys}-${item.val}`}>
                  {item.val}
                  <Icons size={12} type="close" onClick={() => handleDelSel(item)} />
                </li>
              ))}
            {queryKeys.length > 0 && (
              <li>
                <span
                  className="clean-all"
                  onClick={() => fetchProductList({ ...fetchParams, page: 0 }, queryKeys)}
                >
                  {intl.get(`${promptKey}.model.productList.clearSelection`).d('清空选择')}
                </span>
              </li>
            )}
          </ul>
          {/* {queryKeys.length > 0 ? (
            <span className="clean-all" onClick={() => fetchProductList({ page: 0 }, queryKeys)}>
              {intl.get(`${promptKey}.model.productList.clearSelection`).d('清空选择')}
            </span>
          ) : (
            <span style={{ color: '#989898', marginLeft: 6, fontSize: 12 }}>
              {intl
                .get(`${promptKey}.model.productList.emptyFilterCondition`)
                .d('当前筛选条件为空')}{' '}
              : )
            </span>
          )} */}
          {queryKeys.length <= 0 && (
            <span style={{ color: 'rgba(0,0,0, 0.45)', marginLeft: 6, fontSize: 12 }}>
              {intl
                .get(`${promptKey}.model.productList.emptyFilterCondition`)
                .d('当前筛选条件为空')}{' '}
              : )
            </span>
          )}
        </td>
      </tr>
    </>
  );
}
export default SearchConditions;
