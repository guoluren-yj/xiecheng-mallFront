import qs from 'querystring';
import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';

import { ShowAddPurchase } from 'utils/renderer';
import { getOpenCartFlag } from 'utils/configUtils';
import intl from 'utils/intl';
import { getUserConfigInfo, getStorage, setStorage } from 'utils/utils';
import { Tooltip } from 'hzero-ui';
import { Icon } from 'choerodon-ui/pro';
import Logo from './Logo/index';
import SearchBox from './SearchBox/index';
import MiniCart from './MiniCart/index';
import style from './index.less';

function Search(props) {
  const { userId } = getUserConfigInfo();
  const isShowMiniCart = !(window.location.pathname === '/cart');

  function onSearch(e, searchField = 'keyWord', keywordStrategy) {
    const { location, history } = props;
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
            />
          )}
          <ShowAddPurchase r-if={!getOpenCartFlag()}>
            <Tooltip
              title={intl.get('mallf.common.submit.purchase.application').d('手工提报采购申请')}
              placement="bottom"
            >
              <div className="pr-resquest-jump">
                <Icon type="work_log" />
              </div>
            </Tooltip>
          </ShowAddPurchase>
        </div>
      </div>
    </Fragment>
  );
}
export default withRouter(Search);
