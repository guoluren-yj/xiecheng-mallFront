import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';

const tableDataSet = (props) => ({
  selection: false,
  pageSize: 11,
  fields: [
    {
      name: 'contactName',
      label: intl.get(`mallf.addressManage.view.contact`).d('联系人'),
    },
    {
      name: 'mobile',
      label: intl.get(`mallf.addressManage.view.phone`).d('手机'),
    },
    {
      name: 'email',
      label: intl.get(`mallf.addressManage.view.email`).d('邮箱'),
    },
    {
      name: 'regionNameList',
      label: intl.get(`mallf.addressManage.model.regionNameList`).d('地址区域'),
    },
    {
      name: 'address',
      label: intl.get(`mallf.addressManage.model.addressDetail`).d('详细地址'),
    },
    {
      name: 'belongTypeMeaning',
      label: intl.get(`mallf.addressManage.model.type`).d('类型'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'uniqueCode',
      label: intl.get('mallf.addressManage.model.addressCode').d('地址编码'),
    },
  ],
  events: {
    load: () => {
      document.querySelector('body').scrollTop = 0;
    },
  },
  transport: {
    read({ data }) {
      return {
        url: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${props.organizationId}/addresss/invoice-list/choose`,
        method: 'GET',
        data: data.params,
      };
    },
    destroy: ({ data }) => ({
      url: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${props.organizationId}/addresss/delete-personal-address`,
      method: 'POST',
      data: data[0],
    }),
  },
});

export { tableDataSet };
