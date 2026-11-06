import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';

export function getLovColumns(params = {}) {
  const { belongTypeList = [] } = params;
  return {
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
    purchaseOrgColumns: [
      {
        title: intl.get(`mallf.common.view.organization.code`).d('组织编码'),
        width: 200,
        dataIndex: 'organizationCode',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.organization.name`).d('组织名称'),
        width: 200,
        dataIndex: 'organizationName',
        isQuery: true,
      },
    ],
    addressColumns: [
      {
        title: intl.get(`mallf.common.model.type`).d('类型'),
        align: 'left',
        width: 40,
        dataIndex: 'belongTypeMeaning',
        queryDataIndex: 'belongType',
        isQuery: true,
        isSelect: true,
        queryData: belongTypeList,
      },
      {
        title: intl.get(`mallf.common.view.contact`).d('联系人'),
        align: 'left',
        width: 80,
        dataIndex: 'contactName',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.tel`).d('电话'),
        align: 'left',
        width: 100,
        dataIndex: 'mobilePlusTelCode',
      },
      {
        title: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
        align: 'left',
        width: 170,
        isQuery: true,
        dataIndex: 'fullAddress',
      },
      {
        title: intl.get(`mallf.common.model.inventoryOrg`).d('库存组织'),
        align: 'left',
        width: 120,
        // isQuery: true,
        dataIndex: 'invOrganizationName',
      },
      {
        title: intl.get(`mallf.common.model.wareHouse`).d('库房'),
        align: 'left',
        width: 110,
        dataIndex: 'inventoryName',
      },
      {
        title: intl.get(`mallf.common.view.email`).d('邮箱'),
        align: 'left',
        width: 100,
        dataIndex: 'email',
      },
      {
        title: intl.get(`mallf.common.view.zip`).d('邮编'),
        align: 'left',
        width: 100,
        dataIndex: 'zip',
      },
    ],
    companyColumns: [
      {
        title: intl.get(`mallf.header.model.header.companyCode`).d('公司编码'),
        width: 200,
        dataIndex: 'companyNum',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.header.view.company.name`).d('公司名称'),
        width: 200,
        dataIndex: 'companyName',
        isQuery: true,
      },
    ],
    invOrgColumns: [
      // 选择库存组织
      {
        title: intl.get(`mallf.common.view.organization.code`).d('组织编码'),
        width: 200,
        dataIndex: 'organizationCode',
        isQuery: true,
      },
      {
        title: intl.get(`mallf.common.view.organization.name`).d('组织名称'),
        width: 200,
        dataIndex: 'organizationName',
        isQuery: true,
      },
    ],
    itemColumns: [
      {
        title: intl.get('mallf.common.view.item.code').d('物料编码'),
        width: 200,
        dataIndex: 'itemCode',
        isQuery: true,
      },
      {
        title: intl.get('mallf.common.view.item.name').d('物料名称'),
        width: 200,
        dataIndex: 'itemName',
        isQuery: true,
      },
    ],
    uomColumns: [
      {
        title: intl.get('mallf.common.view.uom.code').d('单位编码'),
        width: 200,
        dataIndex: 'uomCode',
        isQuery: true,
      },
      {
        title: intl.get('mallf.common.view.uom.name').d('单位名称'),
        width: 200,
        dataIndex: 'uomName',
        isQuery: true,
      },
    ],
  };
}

// 电商平台名称
export function HmallOptions() {
  const { ecServiceList } = getUserConfigInfo();
  const ecPlatFrom = {
    JD: intl.get('mallf.common.view.common.JD').d('京东'),
    NJD: intl.get('mallf.common.view.common.NJD').d('新京东'),
    CG: intl.get('mallf.common.view.common.CG').d('晨光'),
    ZKH: intl.get('mallf.common.view.common.ZKH').d('震坤行'),
    CATA: intl.get('mallf.common.view.common.CATA').d('目录化'),
    DELI: intl.get('mallf.common.view.common.DELI').d('得力'),
  };
  ecServiceList.forEach((item) => {
    ecPlatFrom[item.ecPlatformCode] = item.ecPlatformName;
  });
  const options = {
    ecPlatFromName: {
      JD: intl.get('mallf.common.view.common.JDsupplier').d('京东供应'),
      CG: intl.get('mallf.common.view.common.CGsupplier').d('晨光供应'),
      ZKH: intl.get('mallf.common.view.common.ZKHsupplier').d('震坤行供应'),
      CATA: intl.get('mallf.common.view.common.CATAsupplier').d('目录化供应'),
      DELI: intl.get('mallf.common.view.common.DELIsupplier').d('得力供应'),
    },
    ecPlatFrom,
    serviceTypeMapping: {
      1: intl.get('mallf.common.view.common.sales.return').d('退货'),
      2: intl.get('mallf.common.view.common.exchange.goods').d('换货'),
      3: intl.get('mallf.common.view.common.maintain').d('维修'),
    },
    returnWareTypeMapping: {
      10: intl.get('mallf.common.view.common.self.distribution').d('自营配送'),
      20: intl.get('mallf.common.view.common.third.party').d('第三方配送'),
    },
    pickWareTypeMapping: {
      1: intl.get('mallf.common.view.common.doorTake').d('上门取件'),
      5: intl.get('mallf.common.view.common.doorChangeNew').d('上门换新取件'),
      7: intl.get('mallf.common.view.common.customerDelivery').d('客户送货'),
      8: intl.get('mallf.common.view.common.bigDoorTake').d('大家电上门取件'),
      9: intl.get('mallf.common.view.common.bigChangeNew').d('大家电换新取件'),
      2: intl.get('mallf.common.view.common.customerSend').d('客户发货'),
    },
    colorMapping: {
      primaryColor: '#3095F2',
      supColor: '#47B881',
      errColor: '#f53',
    },
  };
  return options;
}
