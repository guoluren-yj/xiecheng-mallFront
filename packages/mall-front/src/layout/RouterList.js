import React from 'react';
import { Switch, Route, withRouter } from 'dva/router';
import { connect } from 'dva';
import PageNotFound from '@/routes/PageNotFound';
import { PermissionWrapper } from 'components/Permission';

@withRouter
@connect(({ global }) => ({ routerData: global.routerData }))
export default class RouterList extends React.Component {
  render() {
    const { routerData } = this.props;
    const paths = Object.keys(routerData);
    return (
      <Switch>
        {paths.map((path) => {
          const route = routerData[path] || {};
          const { path: routePath, exact, component: RouteComponent, permissionList } = route;
          return (
            <Route
              key={path}
              path={routePath}
              exact={exact}
              render={(props) => {
                return (
                  <PermissionWrapper permissionList={permissionList}>
                    <RouteComponent {...props} />
                  </PermissionWrapper>
                );
              }}
            />
          );
        })}
        {paths.length > 0 && <Route component={PageNotFound} />}
      </Switch>
    );
  }
}
