/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { TableProps } from 'choerodon-ui/pro/lib/table/Table';
import { Bind } from 'lodash-decorators';

import formatterCollections from 'utils/intl/formatterCollections';

import SearchBar from './SearchBar';
import { searchBarConfigProperties } from './util';

interface SearchBarTableProps extends TableProps {
  searchCode: string; // searchBar 编码
  cacheState?: boolean; // 是否缓存筛选器, 为true则开启缓存
  tableRef?: (elem: any) => any; // table ref
  searchBarRef?: (elem: any) => any; // searchBar ref
  searchBarConfig?: searchBarConfigProperties; // searchBar 自定义属性对象
  handleSearch?: (elem: any)=> void; // 搜索
  headerOther?: any;
}

@formatterCollections({ code: ['srm.filterBar'] })
export default class SearchBarTable extends Component<SearchBarTableProps, any> {
  @Bind()
  handleSearchBarRef(ref) {
    const { searchBarRef } = this.props;
    if (searchBarRef) {
      searchBarRef(ref);
    }
  }

  render() {
    const {
      searchBarConfig = {},
      searchCode,
      dataSet,
      cacheState,
      mode,
      handleSearch,
      headerOther,
    } = this.props;
    return (
      <SearchBar
        {...searchBarConfig}
        onRef={this.handleSearchBarRef}
        cacheState={cacheState}
        dataSet={dataSet ? [dataSet]: []}
        searchCode={searchCode}
        tableMode={mode}
        onQuery={handleSearch}
        headerOther={headerOther}
      />
    );
  }
}
