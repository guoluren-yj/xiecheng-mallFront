import React, { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { Select } from 'choerodon-ui/pro';
import { getUserConfigInfo } from 'utils/utils';
import CuxFn from '@/cuxTools/cuxFn';

const { Option } = Select;

export default function SelectBox(props) {
  const [list, setList] = useState([]);

  const { handleChange, keywordStrategy, changeState = (e) => e } = props;
  const { productSearchTypeConfig = {} } = getUserConfigInfo();
  const {
    productSearchTypeConfigList = [],
    searchTypeFlag,
    typeList = [],
  } = productSearchTypeConfig;

  useEffect(() => {
    if (!isEmpty(typeList)) {
      getList();
    }
  }, [typeList]);

  useEffect(() => {
    if (!keywordStrategy) {
      changeState({
        keywordStrategy: list[0]?.searchType,
      });
    }
  }, [list]);

  function getList() {
    const defaultList = typeList?.map((p, i) => {
      return {
        orderSeq: i + 1,
        enabledFlag: 1,
        searchType: p.value,
        meaning: p.meaning,
      };
    });
    if (searchTypeFlag) {
      // 已存数据
      const currentList = productSearchTypeConfigList
        ?.map((p) => {
          return {
            ...p,
            meaning: typeList?.find((o) => o.value === p.searchType)?.meaning,
          };
        })
        .sort((a, b) => a.orderSeq - b.orderSeq);
      setList([...currentList]);
    } else {
      setList(defaultList);
    }
  }

  const cuxList = CuxFn({
    name: 'Header-fn-searchTypeList',
    value: {
      list,
    },
  })(() => list)();

  return (
    <Select
      onChange={handleChange}
      dropdownClassName="product-select-dropdown"
      className="select"
      allowClear="false"
      value={keywordStrategy}
    >
      {cuxList.map((p) => {
        return <Option value={p.searchType}>{p.meaning}</Option>;
      })}
    </Select>
  );
}
