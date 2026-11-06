import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import HmallConfig from 'utils/api-config';

// 售后记录tableDs
const tableDs = () => {
  return {
    selection: false,
    fields: [
      {
        name: 'afterSaleCode',
        label: intl.get('mallf.myMall.view.saleDetail.afterSalesNum').d('售后申请单号'),
      },
      {
        name: 'quantity',
        label: intl.get('mallf.myMall.view.saleDetail.afterSalesQuantity').d('售后数量'),
      },
      {
        name: 'afterSaleTypeMeaning',
        label: intl.get('mallf.myMall.view.saleDetail.serviceType').d('服务类型'),
      },
      {
        name: 'creationDate',
        label: intl.get('mallf.myMall.view.saleDetail.applicationTime').d('申请时间'),
      },
      {
        name: 'afterSaleStatusMeaning',
        label: intl.get('mallf.mySaleAfter.view.status').d('状态'),
      },
      {
        name: 'remark',
        label: intl.get('mallf.mySaleAfter.view.explain').d('说明'),
      },
      {
        name: 'operate',
        label: intl.get('mallf.mySaleAfter.view.operation').d('操作'),
      },
    ],
    events: {},
    transport: {
      read: ({ data }) => {
        return {
          url: `${HmallConfig.apiGateway}/${
            HmallConfig.omsServiceName
          }/v1/${getCurrentOrganizationId()}/aftersales/get-sale-record`,
          method: 'GET',
          data: data.params,
        };
      },
    },
  };
};

export { tableDs };
