import qs from 'querystring';
import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Icon } from 'choerodon-ui/pro';

import { ShowAddPurchase } from 'utils/renderer';
import { getOpenCartFlag } from 'utils/configUtils';
import intl from 'utils/intl';
import { getUserConfigInfo, getStorage, setStorage, prRequestJump } from 'utils/utils';
import CuxFn from 'cuxTools/cuxFn';
import { Tooltip } from 'hzero-ui';
import Logo from './Logo/index';
import SearchBox from './SearchBox/index';
import MiniCart from './MiniCart/index';
import style from './index.less';

let debounce;
let count = 0;
function Search(props) {
  const { userId } = getUserConfigInfo();
  const isShowMiniCart = !(window.location.pathname === '/cart');
  function onSearch(e, searchField = 'keyWord', keywordStrategy) {
    count++;
    const historyList =
      (!userId ? getStorage(`history_search`) : getStorage(`${userId}_history_search`)) || [];
    const filterHistoryList = historyList.filter((item) => item !== e);
    const newList = [e, ...filterHistoryList.slice(0, 9)];
    if (!userId) {
      setStorage(`history_search`, newList);
    } else {
      setStorage(`${userId}_history_search`, newList);
    }
    const searchParams = {
      [`${searchField}`]: e,
      keywordStrategy,
    };
    if (count === 1) {
      handlePush(searchParams);
    }
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      if (count > 1) {
        handlePush(searchParams);
      }
      count = 0;
    }, window.timeOut || 500); // TODO 可以在控制台自己调整防抖时间，默认500毫秒
  }

  function handlePush(searchParams) {
    const { location, history } = props;
    if (location.pathname === `/product-list`) {
      history.push(`${location.pathname}?${qs.stringify(searchParams)}`);
      history.push('/refresh');
    } else {
      history.push({
        pathname: `/product-list`,
        search: `?${qs.stringify(searchParams)}`,
      });
    }
  }

  return (
    <Fragment>
      <div className={style['search-wrapper']} id="header-content">
        <div className="header-left">
          <Logo href="/" />
        </div>
        <div className="header-right">
          <SearchBox id="search-box" className="searchBox" isShowList onSearch={onSearch} />
          {isShowMiniCart && (
            <MiniCart
              time={new Date().getTime()}
              finish={props.finish}
              className="miniCart"
              total={props.total}
              isNewCart={props.isNewCart}
            />
          )}
          <ShowAddPurchase r-if={!getOpenCartFlag()}>
            <Tooltip
              title={intl.get('mallf.common.submit.purchase.application').d('手工提报采购申请')}
              placement="bottom"
            >
              <div className="pr-resquest-jump" onClick={prRequestJump}>
                <Icon type="work_log" />
              </div>
            </Tooltip>
          </ShowAddPurchase>
          {CuxFn({
            name: 'HeaderSearch-fn-renderManualButton',
            value: {
              isShowMiniCart,
            },
          })(() => {})()}
        </div>
      </div>
    </Fragment>
  );
}
export default withRouter(Search);
