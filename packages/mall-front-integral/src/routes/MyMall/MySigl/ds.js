import intl from 'utils/intl';

import { siglService } from 'utils/api-config';
import { getUserConfigInfo } from 'utils/utils';

export default function ds({ pointsTypeId }) {
  const { userId, organizationId } = getUserConfigInfo();
  return {
    all: {
      autoQuery: !!pointsTypeId,
      fields: [
        {
          label: intl.get('mallf.mySigl.view.change.date').d('变动日期'),
          name: 'creationDate',
        },
        {
          label: intl.get('mallf.mySigl.view.change.type').d('变动类型'),
          name: 'operationTypeMeaning',
        },
        {
          label: intl.get('mallf.common.sigl.change.corename').d(`变动积分`),
          name: 'operationIntegralTotal',
          type: 'number',
        },
        {
          label: intl.get('mallf.mySigl.view.order.srmPoNum').d('商城订单号'),
          name: 'sourceCode',
        },
        {
          label: intl.get('hzero.common.button.remark').d('备注'),
          name: 'remarksMeaning',
        },
      ],
      transport: {
        read: () => {
          return {
            url: `/${siglService}/v1/${organizationId}/member-operations`,
            method: 'GET',
            data: {
              operationState: '',
              userId,
              pointsTypeId,
            },
          };
        },
      },
    },
    in: {
      autoQuery: !!pointsTypeId,
      fields: [
        {
          label: intl.get('mallf.mySigl.view.change.date').d('变动日期'),
          name: 'creationDate',
        },
        {
          label: intl.get('mallf.common.sigl.change.corename').d(`变动积分`),
          name: 'operationIntegralTotal',
          type: 'number',
        },
        {
          label: intl.get('hzero.common.button.remark').d('备注'),
          name: 'remarksMeaning',
        },
      ],
      transport: {
        read: () => {
          return {
            url: `/${siglService}/v1/${organizationId}/member-operations`,
            method: 'GET',
            data: {
              operationState: `'GRANT','DEDUCT'`,
              userId,
              pointsTypeId,
            },
          };
        },
      },
    },
    out: {
      autoQuery: !!pointsTypeId,
      fields: [
        {
          label: intl.get('mallf.mySigl.view.change.date').d('变动日期'),
          name: 'creationDate',
        },
        {
          label: intl.get('mallf.common.sigl.change.corename').d(`变动积分`),
          name: 'operationIntegralTotal',
          type: 'number',
        },
        {
          label: intl.get('mallf.mySigl.view.order.srmPoNum').d('商城订单号'),
          name: 'sourceCode',
        },
      ],
      transport: {
        read: () => {
          return {
            url: `/${siglService}/v1/${organizationId}/member-operations`,
            method: 'GET',
            data: {
              operationState: `'CONSUME','CANCEL'`,
              userId,
              pointsTypeId,
            },
          };
        },
      },
    },
  };
}
