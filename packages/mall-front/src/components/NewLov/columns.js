import intl from 'utils/intl';

export default function columns(params = {}) {
  const { belongTypeList = [] } = params;
  return {
    companyColumns: [
      {
        title: intl.get(`mallf.common.model.header.companyCode`).d('公司编码'),
        width: 200,
        dataIndex: 'companyNum',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.company.name`).d('公司名称'),
        width: 200,
        dataIndex: 'companyName',
        isQuery: true,
      },
    ],
    ouColumns: [
      {
        title: intl.get(`mallf.common.view.organization.code`).d('组织编码'),
        width: 200,
        dataIndex: 'ouCode',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.organization.name`).d('组织名称'),
        width: 200,
        dataIndex: 'ouName',
        isQuery: true,
      },
    ],
    acAddressColumns: [
      // 收单地址
      {
        title: intl.get(`mallf.common.view.contact`).d('联系人'),
        align: 'left',
        width: 100,
        dataIndex: 'contactName',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.tel`).d('电话'),
        align: 'left',
        width: 120,
        dataIndex: 'mobilePlusTelCode',
      },
      {
        title: intl.get(`mallf.common.view.email`).d('邮箱'),
        align: 'left',
        width: 200,
        dataIndex: 'email',
      },
      {
        title: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
        align: 'left',
        width: 240,
        isQuery: true,
        dataIndex: 'fullAddress',
      },
    ],
    // 地址
    addressColumns: [
      {
        title: intl.get(`mallf.common.model.type`).d('类型'),
        align: 'left',
        width: 100,
        dataIndex: 'belongTypeMeaning',
        queryDataIndex: 'belongType',
        isQuery: true,
        isSelect: true,
        queryData: belongTypeList,
      },
      {
        title: intl.get(`mallf.common.view.contact`).d('联系人'),
        align: 'left',
        width: 100,
        dataIndex: 'contactName',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.tel`).d('电话'),
        align: 'left',
        width: 120,
        dataIndex: 'mobilePlusTelCode',
      },
      {
        title: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
        align: 'left',
        width: 240,
        isQuery: true,
        dataIndex: 'fullAddress',
      },
      {
        title: intl.get(`mallf.common.model.inventoryOrg`).d('库存组织'),
        align: 'left',
        width: 180,
        isQuery: true,
        dataIndex: 'invOrganizationName',
      },
      {
        title: intl.get(`mallf.common.model.wareHouse`).d('库房'),
        align: 'left',
        width: 180,
        dataIndex: 'inventoryName',
      },
      {
        title: intl.get(`mallf.common.view.email`).d('邮箱'),
        align: 'left',
        width: 200,
        dataIndex: 'email',
      },
      {
        title: intl.get(`mallf.common.view.zip`).d('邮编'),
        align: 'left',
        width: 200,
        dataIndex: 'zip',
      },
      {
        title: intl.get(`mallf.common.model.remark`).d('备注'),
        align: 'left',
        width: 200,
        dataIndex: 'remark',
        isQuery: true,
      },
    ],
    siglAddressColumns: [
      {
        title: intl.get(`mallf.common.view.contact`).d('联系人'),
        align: 'left',
        width: 100,
        dataIndex: 'contactName',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.tel`).d('电话'),
        align: 'left',
        width: 120,
        dataIndex: 'mobilePlusTelCode',
      },
      {
        title: intl.get(`mallf.common.view.email`).d('邮箱'),
        align: 'left',
        width: 200,
        dataIndex: 'email',
      },
      {
        title: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
        align: 'left',
        width: 240,
        isQuery: true,
        dataIndex: 'fullAddress',
      },
      {
        title: intl.get(`mallf.common.model.remark`).d('备注'),
        align: 'left',
        width: 200,
        dataIndex: 'remark',
        isQuery: true,
      },
    ],
  };
}
