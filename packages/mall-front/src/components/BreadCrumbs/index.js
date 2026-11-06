import React, { useLayoutEffect } from 'react';
import { isEmpty } from 'lodash';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import qs from 'qs';
import { Breadcrumb, Icon } from 'choerodon-ui';
import { Dropdown } from 'choerodon-ui/pro';

import intl from 'utils/intl';
// import * as HmallConfig from 'utils/api-config';
import style from './index.less';
import Link from '../Link';
import { getHomePath, goHomePath } from '@/utils/utils';

function BreadCrumbs(props) {
  const {
    pageTitle,
    rightBtn = '',
    catalogItems = [],
    childTitle1,
    childTitle2,
    dynamicItems = [],
    componentsRender = () => {},
  } = props.value;

  useLayoutEffect(() => {
    if (document.body.scrollTo) {
      document.body.scrollTo(0, 0);
    } else if (window.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, []);

  function getCatalogItems() {
    const levelMenu = JSON.parse(sessionStorage.getItem('levelMenu')) || {
      level1: [],
      level2: [],
      level3: [],
    };
    return catalogItems?.map((catalog, i) => {
      const { categoryId, categoryName, catalogId, catalogName, catalogLevel } = catalog;
      const params = {
        catalogId: catalogId || categoryId,
        catalogName: catalogName || categoryName,
        catalogLevel,
      };
      const tmpData =
        levelMenu?.[`level${catalogLevel}`]?.filter((l) => {
          if (catalogLevel === 1) {
            return true;
          }
          return l.parentCatalogId === catalogItems[catalogLevel - 2]?.catalogId;
        }) || [];
      return {
        itemProps: {
          menuList: tmpData.map((t) => ({
            listChildren: () => {
              return (
                <span title={t.catalogName}>
                  <Link to={`${getHomePath()}product-list?${qs.stringify(t)}`}>
                    {t.catalogName}
                  </Link>
                </span>
              );
            },
          })),
        },
        child: (
          <Link
            to={`${getHomePath()}product-list?${qs.stringify(params)}`}
            className={`${catalogItems.length === i + 1 ? 'last-catalog' : ''}`}
          >
            {catalog.catalogName}
            <Icon r-if={!isEmpty(tmpData)} type="expand_more" />
          </Link>
        ),
      };
    });
  }

  const breadCrumbItems = [
    {
      child: (
        <Link to={goHomePath()} style={{ verticalAlign: 'top' }}>
          {intl.get('mallf.common.view.homePage').d('首页')}
        </Link>
      ),
    },
    ...getCatalogItems(),
    {
      hidden: typeof pageTitle !== 'string',
      child: (
        <span r-title style={{ color: '999', marginLeft: 5 }}>
          {pageTitle}
        </span>
      ),
    },
    {
      hidden: !(typeof pageTitle === 'object' && pageTitle.path),
      itemProps: { href: pageTitle?.path },
      child: <span r-title>{pageTitle?.name}</span>,
    },
    {
      hidden: !childTitle1,
      child: (
        <span
          r-title
          style={{
            color: childTitle2 ? '#999' : '#191919',
            marginLeft: 5,
          }}
        >
          {childTitle1}
        </span>
      ),
    },
    {
      hidden: !childTitle2,
      child: (
        <span r-title style={{ color: '#191919', marginLeft: 5 }}>
          {childTitle2}
        </span>
      ),
    },
    ...dynamicItems,
  ];

  const showItems = breadCrumbItems.filter((f) => !f.hidden);

  const tmpItems =
    showItems.length <= 4
      ? showItems
      : [
          showItems[0],
          showItems[1],
          {
            child: (
              <Dropdown
                overlay={() => (
                  <div className={style['more-breadcrumbs']}>
                    <Breadcrumb>
                      {showItems.slice(2, showItems.length - 1).map((m) => (
                        <Breadcrumb.Item {...(m.itemProps || {})}>{m.child}</Breadcrumb.Item>
                      ))}
                    </Breadcrumb>
                  </div>
                )}
                placement="bottomLeft"
              >
                <Icon type="more_horiz" style={{ fontSize: '16px' }} />
              </Dropdown>
            ),
          },
          showItems[showItems.length - 1],
        ];

  return (
    <div
      className={classNames({
        [style['breadcrumbs-wrapper']]: true,
      })}
    >
      <div className="h-breadcrumbs container">
        <Breadcrumb>
          {tmpItems.map((m) => (
            <Breadcrumb.Item {...(m.itemProps || {})}>{m.child}</Breadcrumb.Item>
          ))}
        </Breadcrumb>
        {rightBtn && <span style={{ fontSize: 14 }}>{rightBtn}</span>}
        {componentsRender && componentsRender()}
      </div>
    </div>
  );
}
export default withRouter(BreadCrumbs);
