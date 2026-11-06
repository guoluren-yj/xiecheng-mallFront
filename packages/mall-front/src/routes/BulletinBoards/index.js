import React, { useEffect } from 'react';
import { isEmpty } from 'lodash';
import qs from 'qs';

import BreadCrumbs from 'components/BreadCrumbs';
import Loading from 'components/loading';
import formatterCollections from 'utils/intl/formatterCollections';
import { getUserConfigInfo } from 'utils/utils';
import {
  fetchBulletinBoards,
  fetchBulletinBoardDeatil,
  noticeReadedService,
} from 'services/homeService';
import useSetState from '@/hooks/useState';
import intl from 'utils/intl';
import Pagination from 'components/Pagination';
import styles from './index.less';
import useScroll from '@/hooks/useScroll';

function BulletinBoards(props) {
  const { mallType, unitId } = getUserConfigInfo();
  const { bulletinId } = qs.parse(props.location.search.substr(1));

  const { scrollTop } = useScroll();

  const contentTop =
    document.getElementById('bulletin-boards-content-right')?.clientHeight +
    // eslint-disable-next-line radix
    parseInt(document.getElementById('bulletin-boards-content-right')?.style?.top);

  const [state, setState] = useSetState({
    loading: true,
    pagination: {},
    gonggaoList: [],
    currenBoard: {},
  });

  useEffect(async () => {
    if (bulletinId) {
      await noticeReadedService(bulletinId);
      fetchBulletinBoardDeatil(bulletinId).then((res) => {
        if (isEmpty(res)) {
          props.history.push(`${mallType === 'sigl' ? '/sigl' : '/'}`);
        } else {
          setState({ currenBoard: res });
        }
      });
    }
    fetchList();
  }, [bulletinId]);

  function fetchList(page = { page: 0, size: 5 }) {
    fetchBulletinBoards({
      unitId,
      bulletinAttribute: mallType === 'sigl' ? 1 : 0,
      shelfFlag: 1,
      enabledFlag: 1,
      ...page,
    })
      .then((res) => {
        const { content, ...pagination } = res || {};
        if (!bulletinId && isEmpty(state.currenBoard)) {
          setState({
            currenBoard: content[0],
            pagination,
            gonggaoList: content,
          });
        } else {
          setState({
            pagination,
            gonggaoList: content,
          });
        }
      })
      .finally(() => {
        setState({ loading: false });
      });
  }

  // 点击公告
  function handleNoticeClick(notice) {
    if (notice.unreadFlag) {
      noticeReadedService(notice.bulletinId);
    }
    setState({
      currenBoard: {
        ...notice,
        unreadFlag: 0,
      },
      gonggaoList: state.gonggaoList.map((item) => {
        if (item.bulletinId === notice.bulletinId) {
          return {
            ...item,
            unreadFlag: 0,
          };
        }
        return item;
      }),
    });
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }

  return (
    <div className={styles['boards-container']}>
      {state.loading ? (
        <Loading />
      ) : (
        <>
          <BreadCrumbs
            value={{
              pageTitle: intl.get('mallf.home.view.gonggao').d('公告'),
              childTitle1: state.currenBoard?.bulletinTitle,
            }}
          />
          <div className="boards-list container">
            <div className="content-left" id="bulletin-boards-content-left">
              <p className="content-title">{state.currenBoard.bulletinTitle}</p>
              <p className="content-create">
                {state.currenBoard.createByName} ·{' '}
                {state.currenBoard?.creationDate?.split(' ')?.[0]}
              </p>
              <div
                className="content-info"
                dangerouslySetInnerHTML={{ __html: state.currenBoard.bulletinContent }}
              />
            </div>
            <div
              id="bulletin-boards-content-right"
              className="content-right"
              style={
                document.getElementById('bulletin-boards-content-left')?.clientHeight < contentTop
                  ? { bottom: 0 }
                  : { top: scrollTop > 150 ? scrollTop - 110 : 0 }
              }
            >
              <p className="content-right-title">
                {intl.get('mallf.home.view.all.gonggao').d('全部公告')}
              </p>
              {state.gonggaoList.map((gonggao) => {
                return (
                  <div className="content-item">
                    <p
                      className="content-item-title text-overflow"
                      title={gonggao.bulletinTitle}
                      onClick={() => handleNoticeClick(gonggao)}
                    >
                      {!!gonggao.unreadFlag && <div className="unread-notice">NEW</div>}
                      {gonggao.bulletinTitle}
                    </p>
                    <div className="content-item-create">
                      {gonggao.createByName} · {gonggao?.creationDate?.split(' ')?.[0]}
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 20 }}>
                <Pagination zeroStart showQuickJumper onForward={fetchList} {...state.pagination} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default formatterCollections({ code: ['mallf.boards', 'mallf.home'] })(BulletinBoards);
