import React from 'react';
import { Modal, Icon } from 'choerodon-ui/pro';

import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import intl from 'utils/intl';
import { getUserConfigInfo, getResponse } from 'utils/utils';
import style from './index.less';

export async function submitValid({ params }) {
  const { orderExtraInfo } = params[0] || {};
  const { companyName, companyId, attributeVarchar18 } = orderExtraInfo || {};
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/2BtO66X9XxHpRyHAzFcqTia1iah2CoxABBZ3SzwGBaicDw?companyName=${companyName}&companyId=${companyId}&userId=${attributeVarchar18}`;
  const res = await request(url, {
    method: 'GET',
  });
  if (getResponse(res)) {
    if (res.checkFlag) return true;
    const modalRes = await new Promise(resolve => {
      Modal.open({
        className: style['modal-tips-name'],
        border: false,
        closable: false,
        children: (
          <>
            {intl
              .get('mallf.common.view.xtalpi.warnsing')
              .d(
                '本次下单的【公司名称】与【申请人】的所属公司不一致（申请人为实际需求/承担费用方），确认是否提交？'
              )}
          </>
        ),
        autoCenter: true,
        title: (
          <>
            <Icon type="error" style={{ color: '#FF9500' }} />
            {intl.get('mallf.common.view.change.warning').d('温馨提示')}
          </>
        ),
        onOk: () => resolve('true'),
        onCancel: () => resolve('false'),
      });
    });
    return modalRes === 'true';
  } else {
    return false;
  }
}
