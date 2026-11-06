import React, { useState, useRef } from 'react';
import { Input, Select, Tooltip } from 'hzero-ui';

import intl from 'utils/intl';

import style from './index.less';

function MyMallSearch(props) {
  const {
    statusBtn = false,
    isOverLay = true,
    overLayS = 1000,
    defaultValue,
    defaultTime,
    defaultStatus,
    optionsType = [],
    optionsTime = [],
    optionsStatus = [],
    onOk = (e) => e,
  } = props;
  const [searchKey, setSearchKey] = useState(optionsType[0].value);
  const [queryData, setQueryData] = useState({ page: 0, size: 10 });
  const timer = useRef();

  function handleSearch(params) {
    clearTimeout(timer.current);
    onOk(params);
  }

  /**
   * 搜索条件的类别
   * @value {String} 条件的key值
   */
  function handleSearchField(value) {
    const { value: oldValue } = optionsType.find((n) => !!queryData[n.value]) || {};
    const newQueryData = queryData;
    delete newQueryData[oldValue];
    setQueryData(newQueryData);
    setSearchKey(value);
  }

  /**
   * 搜索条件的时间
   * @value {String} 时间
   */
  function handleTimeChange(time) {
    const query = {
      ...queryData,
      time,
    };
    setQueryData(query);
    handleSearch(query);
  }

  function handleStatusChange(prStatusCode) {
    const query = {
      ...queryData,
      prStatusCode,
    };
    setQueryData(query);
    handleSearch(query);
  }

  /**
   * 搜索的input框的值
   * @type {String} 搜索条件的类别
   */
  function handleInput(type, e) {
    const query = {
      ...queryData,
      [type]: e,
    };
    setQueryData(query);
    handleSearch(query);
  }

  function handleChange(e) {
    const query = {
      ...queryData,
      [searchKey]: e.target.value,
    };
    clearTimeout(timer.current);
    setQueryData(query);
    if (isOverLay) {
      timer.current = setTimeout(() => {
        onOk(query);
      }, overLayS);
    }
  }

  const selectBefore = (
    <Select
      defaultValue={optionsType.find((f) => f.default)?.value || optionsType[0].value}
      onChange={handleSearchField}
    >
      {optionsType.map((type) => (
        <Select.Option value={type.value}>
          <Tooltip placement="right" title={type.meaning}>
            {type.meaning}
          </Tooltip>
        </Select.Option>
      ))}
    </Select>
  );
  return (
    <div style={props.style} className={style.myMallSearch}>
      {optionsTime?.length > 0 && (
        <Select
          className="data-select"
          defaultValue={defaultTime || optionsTime?.[0]?.value}
          onChange={handleTimeChange}
        >
          {optionsTime.map((time) => {
            return <Select.Option value={time.value}>{time.meaning}</Select.Option>;
          })}
        </Select>
      )}
      {statusBtn && (
        <Select
          className="data-select"
          defaultValue={defaultStatus || optionsStatus[0].value}
          onChange={handleStatusChange}
        >
          {optionsStatus.map((time) => {
            return <Select.Option value={time.value}>{time.meaning}</Select.Option>;
          })}
        </Select>
      )}
      <div className="data-input">
        <Input.Search
          placeholder={intl.get('mallf.common.view.search.searchInfo').d('请输入搜索信息')}
          addonBefore={selectBefore}
          onChange={handleChange}
          defaultValue={defaultValue}
          onSearch={(value) => handleInput(searchKey, value)}
        />
      </div>
    </div>
  );
}

export default MyMallSearch;
