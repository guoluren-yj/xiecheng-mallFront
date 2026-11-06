import React, { useEffect, useMemo } from 'react';
import { isArray } from 'lodash';
import { connect } from 'dva';
import { Input, Form } from 'hzero-ui';
import { Icon } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import qs from 'qs';

import intl from 'utils/intl';
import { getStorage, removeStorage, getUserConfigInfo, setStorage } from 'utils/utils';
import { fetchSuggestWord } from 'services/headerService';
import useSetState from '@/hooks/useState';
import style from './index.less';
import SelectBox from './SelectBox';
import CuxWrapper from '@/cuxTools/CuxWrapper';

function SearchBox(props) {
  const {
    onSearch,
    location: { search: searchParams },
  } = props;
  const { userId } = getUserConfigInfo();
  const { keyword = '', keywordStrategy: defaultKey } = qs.parse(searchParams.substr(1));
  useEffect(() => {
    setState({
      val: keyword,
    });
  }, [keyword]);
  let historyList =
    (!userId ? getStorage(`history_search`) : getStorage(`${userId}_history_search`)) || [];
  const [state, setState] = useSetState({
    val: keyword,
    placeholder: '',
    hotWord: [],
    currentHotWord: [],
    suggestWord: [],
    keywordStrategy: defaultKey || null,
  });
  const { val, placeholder, hotWord, suggestWord, keywordStrategy } = state;

  const placeholderMapping = useMemo(() => {
    return {
      COMPLAX: intl
        .get(`mallf.header.model.header.COMPLAX`)
        .d('请输入商品编码、名称、第三方编码进行搜索'),
      SUPPLIER: intl.get(`mallf.header.model.header.SUPPLIER`).d('请输入供应商名称、编码进行搜索'),
      ITEM_CODE: intl.get(`mallf.header.model.header.ITEM_CODE`).d('请输入物料名称、编码进行搜索'),
    };
  }, []);

  useEffect(() => {
    setState({
      placeholder:
        placeholderMapping[keywordStrategy] ||
        intl.get(`mallf.header.model.header.headerKeyWordSearch`).d('请输入关键字进行搜索'),
    });
  }, [keywordStrategy]);

  useEffect(() => {
    setState({ hotWord: props.hotWord || [] });
  }, [props.hotWord]);

  useEffect(() => {
    if (val !== '') {
      fetchSuggestWord({ keyword: val, keywordStrategy }).then((res) => {
        if (res) {
          const { keyword: suggest = [] } = res;
          setState({ suggestWord: suggest });
        }
      });
    }
  }, [val]);

  function handleChange(value) {
    setState({ keywordStrategy: value });
  }

  function search() {
    if (!val && val === '') {
      // setState({
      //   placeholder: intl.get(`mallf.header.model.header.inputKeywords`).d('请输入关键字'),
      // });
    } else {
      onSearch(val?.replace(/(^\s*)|(\s*$)/g, ''), 'keyword', state.keywordStrategy);
    }
  }

  function renderHotWord() {
    return hotWord.map((item) => (
      <div
        className="word-block"
        onClick={() => {
          setState({ keywordStrategy: 'COMPLAX' });
          onSearch(item, 'keyword', 'COMPLAX');
        }}
        title={item}
      >
        {item}
      </div>
    ));
  }

  function handleClearHistory(word) {
    const sessionHisList = isArray(getStorage(`${userId}_history_search`))
      ? getStorage(`${userId}_history_search`)
      : [];
    if (!userId) {
      removeStorage('history_search');
    } else if (word) {
      setStorage(
        `${userId}_history_search`,
        sessionHisList.filter((w) => w !== word)
      );
    } else {
      removeStorage(`${userId}_history_search`);
    }
    setState({ val: '' });
    historyList = word ? sessionHisList.filter((w) => w !== word) : [];
  }

  function renderSuggest() {
    const showList = val === '' ? historyList : suggestWord;
    return (
      showList.length > 0 && (
        <ul className="search-popup">
          {val === '' && (
            <li className="history-show">
              <span>{intl.get(`mallf.header.model.latestSearch`).d('最近搜索')}</span>
              <Icon type="delete" style={{ fontSize: 12 }} onClick={() => handleClearHistory()} />
            </li>
          )}
          {showList.map((item) => (
            <li
              className="one-history"
              onClick={() => onSearch(item, 'keyword', state.keywordStrategy)}
            >
              <a>{item}</a>
              {val === '' && (
                <Icon
                  type="delete"
                  style={{ fontSize: 12 }}
                  onClick={(e) => {
                    handleClearHistory(item);
                    e.stopPropagation();
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )
    );
  }

  return (
    <div className={style['search-box']}>
      <div className="input-wrapper">
        <div className="choose-name">
          <SelectBox
            changeState={setState}
            handleChange={handleChange}
            keywordStrategy={keywordStrategy}
          />
        </div>
        <Input
          autoComplete="off"
          placeholder={placeholder}
          value={val}
          onChange={(e) => {
            setState({ val: e.target.value });
          }}
          onSearch={search}
          onPressEnter={search}
        />
        {renderSuggest()}
      </div>
      <button type="button" onClick={search}>
        {intl.get('mallf.header.model.header.search').d('搜索')}
      </button>
      <CuxWrapper path="layout/header/hotWord" value={{ hotWord }}>
        <div id="hot-word" className="hot-word">
          {!window.location.pathname.includes('/my-mall/') && (
            <>
              <span className="word-block-title">
                {intl.get('mallf.header.model.header.headerKeyWordTitle').d('热门搜索')}:
              </span>{' '}
              {userId && renderHotWord()}
            </>
          )}
        </div>
      </CuxWrapper>
    </div>
  );
}

export default connect(({ global }) => ({
  hotWord: global.hotWord,
}))(withRouter(Form.create({ fieldNameProp: null })(SearchBox)));
