import React from 'react';
import { Icon, Button } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import { withRouter } from 'react-router-dom';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import style from './index.less';

function OpenCartResult(props = {}) {
  return (
    <div className={style['request-result']}>
      <div className="request-result-wrapper">
        <Icon className="success-icon" type="check_circle" />
        <div className="success-title">
          {intl.get('mallf.applyRes.view.submit.success').d('提交成功')}
        </div>
        <p className="success-content">
          {intl
            .get(`mallf.applyRes.view.toMyRequest.Message`)
            .d('您的申请已成功提交，可在 我的申请 中查看或提交')}
        </p>
        <div>
          <Button
            color="primary"
            onClick={() => {
              props.history.push('/my-mall/my-request');
            }}
          >
            {intl.get('mallf.applyRes.model.applyRes.goRequest').d('前往我的申请')}
          </Button>
          <Button
            onClick={() => {
              props.history.push('/');
            }}
          >
            {intl.get('mallf.applyRes.model.goBack.homePage').d('返回商城首页')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default compose(
  withRouter,
  formatterCollections({ code: 'mallf.applyRes' })
)(OpenCartResult);
