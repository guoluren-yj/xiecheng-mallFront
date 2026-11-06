import React, { useEffect } from 'react';
import { Input, Form } from 'hzero-ui';
import { withRouter } from 'react-router-dom';
import qs from 'qs';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import { fetchHotWord, fetchSuggestWord } from 'services/headerService';
import useSetState from '@/hooks/useState';

import style from './index.less';

// let timer;
function SearchBox(props) {
  const {
    onSearch,
    location: { search: searchParams },
  } = props;
  const { userId } = getUserConfigInfo();
  const { keyword = '' } = qs.parse(searchParams.substr(1));
  const [state, setState] = useSetState({
    val: keyword,
    placeholder: '',
    hotWord: [],
    currentHotWord: [],
    suggestWord: [],
    keywordStrategy: 'COMPLAX',
  });
  const { val, placeholder, hotWord, keywordStrategy } = state;
  // const [val, setVal] = useState(keyWord);
  // const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    if (userId) {
      setState({ val: keyword });
      setTimeout(() => {
        fetchHotWord({ keyword }).then((res) => {
          if (res) {
            setState({ hotWord: res });
          }
        });
      }, 1000);
    }
  }, [keyword]);

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
  // useEffect(() => {
  //   startInterval();
  //   return () => {
  //     pauseInterval();
  //   };
  // }, [hotWord]);

  // function startInterval() {
  //   if (hotWord.length > 7) {
  //     let start = 7;
  //     timer = setInterval(() => {
  //       const end = start + 7;
  //       const arr = hotWord.slice(start, end);
  //       const nextArr = hotWord.slice(end, end + 7);
  //       if (nextArr.length === 0) {
  //         setState({ currentHotWord: arr });
  //         start = 0;
  //       } else {
  //         setState({ currentHotWord: arr });
  //         start += 7;
  //       }
  //     }, 7000);
  //   }
  // }

  // function pauseInterval() {
  //   clearInterval(timer);
  // }

  function search() {
    if (!val && val === '') {
      setState({
        placeholder: intl.get(`mallf.header.model.header.inputKeywords`).d('请输入关键字'),
      });
    } else {
      onSearch(val?.replace(/(^\s*)|(\s*$)/g, ''), 'keyword', state.keywordStrategy);
    }
  }

  function renderHotWord() {
    return hotWord.map((item) => (
      <div key={item} className="word-block" title={item}>
        {item}
      </div>
    ));
  }

  // function handleClearHistory(word) {
  //   if (!userId) {
  //     removeStorage('history_search');
  //   } else if (word) {
  //     setStorage(
  //       `${userId}_history_search`,
  //       getStorage(`${userId}_history_search`).filter((w) => w !== word)
  //     );
  //   } else {
  //     removeStorage(`${userId}_history_search`);
  //   }
  //   setState({ val: '' });
  //   historyList = word ? getStorage(`${userId}_history_search`).filter((w) => w !== word) : [];
  // }

  // function renderSuggest() {
  //   const showList = val === '' ? historyList : suggestWord;
  //   return (
  //     showList.length > 0 && (
  //       <ul className="search-popup">
  //         {val === '' && (
  //           <li className="history-show">
  //             <span>{intl.get(`mallf.header.model.latestSearch`).d('最近搜索')}</span>
  //             <Icon type="delete" size={12} onClick={() => handleClearHistory()} />
  //           </li>
  //         )}
  //         {showList.map((item) => (
  //           <li
  //             className="one-history"
  //             onClick={() => onSearch(item, 'keyword', state.keywordStrategy)}
  //             key={item}
  //           >
  //             <a>{item}</a>
  //             {val === '' && (
  //               <Icon
  //                 type="delete"
  //                 size={12}
  //                 onClick={(e) => {
  //                   handleClearHistory(item);
  //                   e.stopPropagation();
  //                 }}
  //               />
  //             )}
  //           </li>
  //         ))}
  //       </ul>
  //     )
  //   );
  // }

  return (
    <div className={style['search-box']}>
      <div className="input-wrapper">
        <Input
          autoComplete="off"
          placeholder={
            placeholder ||
            intl.get(`mallf.header.model.header.headerKeyWordSearch`).d('请输入关键字进行搜索')
          }
          value={val}
          onChange={(e) => {
            setState({ val: e.target.value });
          }}
          onSearch={search}
          onPressEnter={search}
        />
        {/* {renderSuggest()} */}
      </div>
      <button type="button" onClick={search}>
        {intl.get('mallf.header.model.header.search').d('搜索')}
      </button>
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
    </div>
  );
}

export default withRouter(Form.create({ fieldNameProp: null })(SearchBox));
