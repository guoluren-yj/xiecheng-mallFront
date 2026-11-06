import React, { useState, useEffect, memo } from 'react';
import { Icon } from 'choerodon-ui';
import qs from 'qs';
import ContentLoader from 'react-content-loader';

import Icons from 'components/Icons';
import intl from 'utils/intl';
import { getCookie, getUserConfigInfo, openPage } from 'utils/utils';
import { fetchNewCategoriesService } from 'services/headerService';
import Link from 'components/Link';
import CuxWrapper from '@/cuxTools/CuxWrapper';

// import initAllList from './unLoginMenu';
// import unLoginData from './unLoginData';
import style from './index.less';

const compare = (property) => (a, b) => {
  const value1 = a[property];
  const value2 = b[property];
  return value1 - value2;
};

function formatData(data) {
  if (data.flag) {
    const length = Math.max(
      data.items1.length,
      data.items2.length,
      data.items3.length
      // data.items4.length
    );
    const newData = [];
    for (let i = 0; i < length; i++) {
      const tmpArray = [];
      for (let j = 1; j <= 3; j++) {
        if (data[`items${j}`][i]) {
          tmpArray.push(data[`items${j}`][i]);
        }
      }
      newData.push(tmpArray);
    }
    return newData;
  } else {
    const newData = [];
    let length = 12;
    let tmpArray = [];
    const array = data?.items1;
    for (let i = 0; i < array.length; i++) {
      if (length >= array[i]?.catalogName?.length) {
        length = length - array[i].catalogName.length - 1;
        tmpArray.push(array[i]);
      } else {
        newData.push([].concat(tmpArray));
        length = 12;
        tmpArray = [];
        if (array[i].catalogName.length <= length) {
          i--;
        }
      }
    }
    newData.push(tmpArray);
    return newData;
  }
}

const MenuLoader = (props) => (
  <ContentLoader
    height={300}
    width={190}
    speed={1}
    primaryColor="#F8F8F8"
    secondaryColor="#F8F8F8"
    {...props}
  >
    <circle cx="20" cy="20" r="8" />
    <rect x="40" y="15" rx="5" ry="5" width="120" height="10" />
    <circle cx="20" cy="50" r="8" />
    <rect x="40" y="45" rx="5" ry="5" width="120" height="10" />
    <circle cx="20" cy="80" r="8" />
    <rect x="40" y="75" rx="5" ry="5" width="120" height="10" />
    <circle cx="20" cy="110" r="8" />
    <rect x="40" y="105" rx="5" ry="5" width="120" height="10" />
    <circle cx="20" cy="140" r="8" />
    <rect x="40" y="135" rx="5" ry="5" width="120" height="10" />
    <circle cx="20" cy="170" r="8" />
    <rect x="40" y="165" rx="5" ry="5" width="120" height="10" />
    <circle cx="20" cy="200" r="8" />
    <rect x="40" y="195" rx="5" ry="5" width="120" height="10" />
    <circle cx="20" cy="230" r="8" />
    <rect x="40" y="225" rx="5" ry="5" width="120" height="10" />
    <circle cx="20" cy="260" r="8" />
    <rect x="40" y="255" rx="5" ry="5" width="120" height="10" />
  </ContentLoader>
);

function Assort(props) {
  const {
    userId,
    webConfig: { catalogType },
    mallType,
  } = getUserConfigInfo();
  const isLoginIn = !!userId;
  let ecPlatform = getCookie('ecPlatform');
  const activemenu = getCookie('activeMenu');
  const { isHome, finish } = props;
  const [loading, setLoading] = useState(false);
  const [bottom, setBottom] = useState(true);
  const [categoryData, setCategoryData] = useState({
    items1: [],
    items2: [],
    items3: [],
    // items4: [],
    flag: false,
  });
  // const [activeMenu, setActiveMenu] = useState(
  //   isLoginIn ? activemenu || (ecPlatform !== 'ALL' ? 'ecCatalogList' : 'allList') : 'ecCatalogList'
  // );
  const [sourceFrom, setSourceFrom] = useState(() => {
    if (isLoginIn) {
      if (activemenu === 'allList') {
        return 'ALL';
      } else if (activemenu === 'catalogueList') {
        return 'CATA';
      } else if (activemenu === 'ecCatalogList') {
        return 'EC';
      } else {
        return '';
      }
    } else {
      return ecPlatform || '';
    }
  });
  const [menuStyle, setMenuStyle] = useState({});

  useEffect(() => {
    if (props.sourceFrom === 'ALL') {
      if (activemenu === 'allList') {
        setSourceFrom('ALL');
      } else if (activemenu === 'catalogueList') {
        setSourceFrom('CATA');
      } else if (activemenu === 'ecCatalogList') {
        setSourceFrom('EC');
      } else {
        setSourceFrom('');
      }
    } else {
      setSourceFrom(props.sourceFrom);
    }
  }, [props.sourceFrom]);

  useEffect(() => {
    if (isLoginIn && finish) {
      fetchCategories();
    }
    const newMenuStyle = {
      width: 810,
      left: 190,
    };
    setMenuStyle(newMenuStyle);
  }, [finish]);

  function navListScroll() {
    // 意思就是内容总体的高度 - 滚动条的偏移值  === 元素的高度(包含内边)但不包含外边距，边框，以及滚动条
    if (Math.abs(this.clientHeight - (this.scrollHeight - this.scrollTop)) < 3) {
      setBottom(true);
    } else {
      setBottom(false);
    }
  }

  useEffect(() => {
    document.querySelector('.nav-list').addEventListener('scroll', navListScroll);
    return () => {
      document.querySelector('.nav-list').removeEventListener('scroll', navListScroll);
    };
  }, []);

  function fetchCategories() {
    if (ecPlatform === 'ALL' || ecPlatform === 'NONE') {
      ecPlatform = undefined;
    }
    setLoading(true);
    fetchNewCategoriesService({ channel: mallType === 'sigl' ? 'PERSONAL' : 'ENTERPRISE' })
      .then((res) => {
        ['items1', 'items2', 'items3'].forEach((p) => {
          const noRowList = (res[p] || []).filter((r) => !r.catalogRow && r.catalogRow !== 0);
          res[p].sort(compare('catalogRow'));
          const current = res[p];
          const newCurrent = [];
          const max = current[current.length - 1] && current[current.length - 1].catalogRow;
          if (max || max === 0) {
            for (let i = 0; i < max + 1; i++) {
              newCurrent[i] = current.find((c) => c.catalogRow === i) || {
                catalogId: '',
                catalogName: '',
                catalogRow: i,
              };
            }
          }
          res[p] = [
            ...newCurrent,
            ...noRowList.map((i, index) => ({ ...i, catalogRow: max + index })),
          ];
        });
        // res.flag = !!(res?.items2.length > 0 || res?.items3.length > 0 || res?.items4.length > 0);
        res.flag = true;
        let emptyArr = [];
        formatData(res).forEach((a) => {
          emptyArr = [...emptyArr, ...a];
        });
        const levelMenu = getLevelMenu(emptyArr.filter((c) => !!c.catalogName));
        sessionStorage.setItem('levelMenu', JSON.stringify(levelMenu));
        setCategoryData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function getLevelMenu(list) {
    const levelMenu = {
      level1: [],
      level2: [],
      level3: [],
    };

    function process(_list) {
      const { children, catalogLevel, catalogName, catalogId, parentCatalogId } = _list;
      levelMenu[`level${catalogLevel}`].push({
        catalogId,
        catalogName,
        catalogLevel,
        parentCatalogId,
      });
      if (children) {
        children.map((cata) => process(cata));
      }
    }

    list.forEach((item) => process(item));
    return levelMenu;
  }

  function getCategoryItems(item) {
    // 查找三级目录
    return item.map((i) => {
      const { platformCatalogId, catalogId: comCatalogId, catalogName, catalogLevel } = i;
      const catalogId = platformCatalogId || comCatalogId;
      const queryParams = {
        catalogId,
        catalogName,
        sourceFrom: sourceFrom || ecPlatform,
        catalogLevel,
      };
      return (
        <li key={catalogId}>
          <Link
            to={`${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify(queryParams)}`}
          >
            {catalogName}
          </Link>
        </li>
      );
    });
  }

  function getSubCategories(item) {
    // 查找子类别
    return item.map((i) => {
      const { platformCatalogId, catalogId: comCatalogId, catalogName, children, catalogLevel } = i;
      const catalogId = platformCatalogId || comCatalogId;
      const queryParams = {
        catalogId,
        catalogName,
        sourceFrom: sourceFrom || ecPlatform,
        catalogLevel,
      };
      return (
        <CuxWrapper
          path="layout/Header/MenuBar/getSubCategories"
          value={{ catalog: i, mallType, queryParams, children, getCategoryItems }}
        >
          <li key={catalogId}>
            <div className="sub-category-item" title={catalogName}>
              <Link
                to={`${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify(
                  queryParams
                )}`}
              >
                {catalogName}
              </Link>
            </div>
            {children && !!children.length && (
              <ul className="category-items">{getCategoryItems(children)}</ul>
            )}
          </li>
        </CuxWrapper>
      );
    });
  }

  function newCategory(list) {
    if (list && list.length > 0) {
      // eslint-disable-next-line no-param-reassign
      list = list.filter((arr) => arr.length > 0 && arr.some((c) => !!c.catalogName));
      return list.map((items) => {
        let newItems = JSON.parse(JSON.stringify(items.filter((p) => !!p.catalogName)));
        if (newItems[0]?.catalogName?.length + newItems[1]?.catalogName?.length > 12) {
          // eslint-disable-next-line no-param-reassign
          newItems[1].catalogName = newItems[1].catalogName.slice(
            0,
            12 - newItems[0].catalogName.length
          );
        }
        if (newItems[0]?.catalogName?.length > 12 && !!newItems[1]?.catalogName) {
          // eslint-disable-next-line no-param-reassign
          newItems = [newItems[0]];
          // eslint-disable-next-line no-param-reassign
          newItems[0] = {
            ...newItems[0],
            catalogName: `${newItems[0]?.catalogName?.slice(0, 10)}...`,
          };
        }
        const { mallIcon = 'beach_access-o' } =
          newItems.find((n) => n.catalogName && n.mallIcon) || {};
        return (
          <li>
            <div className="li-bottom">
              {catalogType === 1 && (
                <Icon style={{ fontSize: '12px', marginRight: '5px' }} type={mallIcon} />
              )}
              {newItems?.map((item, itemIndex) => {
                const {
                  platformCatalogId,
                  catalogId: comCatalogId,
                  catalogName,
                  catalogLevel,
                } = item;
                const catalogId = platformCatalogId || comCatalogId;
                const queryParams = {
                  catalogId,
                  catalogName,
                  sourceFrom: sourceFrom || ecPlatform,
                  catalogLevel,
                };
                return (
                  item.catalogName && (
                    <>
                      <span
                        className="menu-level1"
                        onClick={() => {
                          openPage(
                            `${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify(
                              queryParams
                            )}`
                          );
                        }}
                      >
                        {item.catalogName}
                      </span>
                      {itemIndex < newItems.length - 1 && <span className="menu-level1-flag" />}
                    </>
                  )
                );
              })}
            </div>
            <ul className="children" style={{ ...menuStyle }}>
              {items
                ?.filter((p) => !!p)
                ?.map((item) => {
                  return (
                    item.catalogName && (
                      <>
                        <p
                          className="first-title"
                          onClick={() => {
                            openPage(
                              `${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify({
                                catalogId: item.catalogId,
                                catalogName: item.catalogName,
                                sourceFrom: sourceFrom || ecPlatform,
                                catalogLevel: item.catalogLevel,
                              })}`
                            );
                          }}
                        >
                          {item.catalogName}
                        </p>
                        {getSubCategories(item.children)}
                      </>
                    )
                  );
                })}
            </ul>
          </li>
        );
      });
    }
  }

  return (
    <div className={style['h-nav-bar']}>
      <a className="all-category">
        {intl.get(`mallf.header.view.allCategories`).d('全部商品分类')}
      </a>
      <div className="nav-list-wrapper">
        <div className={`nav-fixed${isHome ? ' nav-fixed-home' : ''}`}>
          <div className="nav-list-container">
            <ul className="nav-list">
              {loading ? <MenuLoader /> : newCategory(formatData(categoryData))}
            </ul>
            {!bottom && (
              <div className="bottom-fix">
                <Icons style={{ color: '#999' }} size={12} type="icon_double_down" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Assort);
