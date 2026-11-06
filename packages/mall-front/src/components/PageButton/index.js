/**
 * PageButton - 分页
 * @date: 2019-09-10
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import qs from 'qs';

import Link from 'components/Link';
import intl from 'utils/intl';

import styles from './index.less';

export default function PageButton(props) {
  const {
    style,
    size,
    number,
    onForward,
    zeroStart,
    totalPages,
    totalElements,
    maxPage = 50,
    allPages = false,
  } = props;

  function goForward(params) {
    if (zeroStart) {
      onForward({
        ...params,
        page: params.page - 1,
      });
    } else {
      onForward(params);
    }
  }

  function items() {
    const itemList = [];
    let n = 1;
    const page = zeroStart ? number + 1 : number;
    const totalPage = !allPages && totalPages >= maxPage ? maxPage : totalPages;
    const totalElement = !allPages && totalPages >= maxPage * 20 ? maxPage * 20 : totalElements;
    // !window.location.href.match('bannerId') && totalPages >= 100 ? 100 : totalPages;
    itemList.push(
      <span key={n++} className="total-number">
        {intl
          .getHTML(`mallf.common.common.totalElement`, {
            value: totalElement,
          })
          .d(
            <span>
              共<b>{totalElement}</b>件商品
            </span>
          )}
      </span>
    );
    itemList.push(
      <span key={n++} className="total-page">
        <span className="number-highlight">{page}</span> / {totalPage}
      </span>
    );
    itemList.push(createAnchor('<', page - 1, page > 1, n++, 'prev'));
    itemList.push(createAnchor('>', page + 1, page < totalPage, n++, 'next'));

    return itemList;
  }

  function getNewPath(page) {
    if (location) {
      const { search, pathname } = location;
      const query = {
        ...qs.parse(search.substr(1)),
        page,
      };
      return `${pathname}?${qs.stringify(query)}`;
    } else {
      return '';
    }
  }

  function createAnchor(text, page, link, n, className) {
    const pageParams = {
      page,
      size,
    };
    const linkCompent = onForward ? (
      <a className={className} key={n} onClick={() => goForward(pageParams)}>
        <span>{text}</span>
      </a>
    ) : (
      <Link className={className} key={n} to={getNewPath(page)}>
        <span>{text}</span>
      </Link>
    );
    return link ? (
      linkCompent
    ) : (
      <a className={['link-disable', className].filter(e => e).join(' ')} key={n}>
        <span>{text}</span>
      </a>
    );
  }

  return totalPages ? (
    <nav className={styles['h-page-button']} style={style}>
      {items()}
    </nav>
  ) : null;
}
