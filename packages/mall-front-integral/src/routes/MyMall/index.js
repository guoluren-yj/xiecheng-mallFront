import React, { useEffect, Suspense } from 'react';
import { Icon } from 'choerodon-ui';
import { Route, NavLink } from 'react-router-dom';
import classnames from 'classnames';
import { connect } from 'dva';
import Loading from 'components/loading';
import { PermissionWrapper } from 'components/Permission';
import getMallRouter from './router';
import styles from './index.less';

const currentUrl = '/sigl/my-mall';

function MyMall(props) {
  const mallRouters = getMallRouter();
  const page = props.location.pathname.substr(14);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const { hideMenuList } = props;
  // let pageTitle = '';
  // let childTitle = '';
  const allRoutes = [...mallRouters.myMall.children, ...mallRouters.account.children];
  // Object.keys(mallRouters).forEach(key => {
  //   const index = mallRouters[key].children.findIndex(item => `/${page}` === item.path);
  //   if (index !== -1) {
  //     pageTitle = mallRouters[key].name;
  //     childTitle = mallRouters[key].children[index].name;
  //   }
  // });
  const needBg = ![`${currentUrl}/user-center`, `${currentUrl}/my-sigl`].includes(
    props.location.pathname
  );

  function getNavLink(item) {
    return (
      <li className="meun-item">
        <NavLink
          className="text-overflow"
          title={item.name}
          activeClassName="active"
          to={currentUrl + item.path}
        >
          {item.icon && <Icon type={item.icon} />} {item.name}
        </NavLink>
      </li>
    );
  }

  if (!hideMenuList) return <Loading />;
  return (
    <div>
      <div className={styles['my-mall-container']}>
        <div className={styles['mall-detail-list']}>
          <div>
            <div className={styles['mall-detail-sidenav']}>
              <ul>
                <li className={styles['detail-nav-title']}>
                  <span>{mallRouters.myMall.name}</span>
                </li>
                {mallRouters.myMall.children.map((item) => (
                  <PermissionWrapper permissionList={item.permissionList}>
                    {getNavLink(item)}
                  </PermissionWrapper>
                ))}
              </ul>
              <ul>
                <li className={styles['detail-nav-title']}>
                  <span>{mallRouters.account.name}</span>
                </li>
                {mallRouters.account.children.map((item) => (
                  <PermissionWrapper permissionList={item.permissionList}>
                    {getNavLink(item)}
                  </PermissionWrapper>
                ))}
              </ul>
            </div>
          </div>
          <div
            className={classnames({
              [styles['mall-detail-content']]: needBg,
              [styles['user-center']]: !needBg,
            })}
          >
            {allRoutes.map((item) => (
              <Suspense fallback={<Loading />}>
                <PermissionWrapper permissionList={item.permissionList}>
                  <Route
                    path={currentUrl + item.path}
                    render={(p) => {
                      const Com = item.component;
                      return <Com {...p} />;
                    }}
                  />
                </PermissionWrapper>
              </Suspense>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect(({ global }) => ({
  hideMenuList: global.hideMenuList,
  isMixTenant: global.isMixTenant,
}))(MyMall);
