import intl from 'utils/intl';
import { getUserConfigInfo, getPrecision, numberRender } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import { updateCartService, fetchAddress } from '../../../services/allocationService';

const { organizationId } = getUserConfigInfo();

const deliveryTypeDs = (defaultValue) => ({
  autoCreate: false,
  fields: [
    {
      name: 'deliveryType',
      label: intl.get(`mallf.common.view.delivery`).d('送货方式'),
      lookupCode: 'SCUX.WATSONS.DELIVERY_METHOD',
      textField: 'meaning',
      valueField: 'value',
      defaultValue,
      required: true,
    },
    {
      name: 'deliveryTypeMeaning',
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'deliveryType') {
        const { meaning } = record.getField(name).getLookupData(value);
        record.set('deliveryTypeMeaning', meaning);
      }
    },
  },
});

const tableDs = (props) => {
  const { productList, saveCallBack, batchFlag, handleDalete, handleFetchCustomData } = props;
  const {
    minPurchaseQuantity = 1,
    minPackageQuantity = 1,
    uomPrecision = 0,
    latestPrice = 1,
    financialPrecision,
    customFlag,
  } = batchFlag ? {} : productList[0];
  const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
  return {
    primaryKey: 'orderSeq',
    autoQuery: false,
    modifiedCheck: false,
    selection: batchFlag ? false : 'multiple',
    fields: [
      {
        label: intl.get(`mallf.common.view.orderSeq`).d('序号'),
        name: 'orderSeq',
      },
      {
        name: 'batchFlag',
      },
      {
        name: 'costShopLov',
        lookupCode: 'SCUX.WATSONS.COST_SHOP',
        valueField: 'organizationCode',
      },
      {
        label: intl.get(`mallf.common.view.shopWarehouse`).d('写字楼/店铺/仓库'),
        name: 'costShop',
        type: 'object',
        valueField: 'organizationCode',
        textField: 'organizationName',
        lovCode: 'SCUX.WATSONS.COST_SHOP_VIEW',
        required: true,
        transformResponse: (_, record) => {
          const { costShopId, costShopCode, costShopName } = record;
          return costShopCode
            ? {
                organizationId: costShopId,
                organizationCode: costShopCode,
                organizationName: costShopName,
              }
            : null;
        },
      },
      {
        name: 'costShopId',
        bind: 'costShop.organizationId',
      },
      {
        name: 'costShopCode',
        bind: 'costShop.organizationCode',
      },
      {
        name: 'costShopName',
        bind: 'costShop.organizationName',
      },
      {
        name: 'costShopType',
        bind: 'costShop.type',
      },
      {
        name: 'oldCostShopType',
      },
      {
        name: 'costDepartment',
        lookupCode: 'SCUX.WATSONS.COST_DEPARTMENT',
        valueField: 'unitCode',
      },
      {
        label: intl.get('mallf.common.view.feild.bumen').d('部门'),
        name: 'costDepartmentLov',
        type: 'object',
        valueField: 'unitCode',
        textField: 'unitName',
        lovCode: 'SCUX.WATSONS.COST_DEPARTMENT_V',
        required: true,
        dynamicProps({ record }) {
          return {
            disabled: !record.get('costShopId') || ['Store'].includes(record.get('costShopType')), // 费用承担中心为店铺/仓库自动带出部门，部门不可编辑
            lovPara: {
              costShopId: record.get('costShopId'),
            },
          };
        },
        transformResponse: (_, record) => {
          const { costDepartmentId, costDepartmentCode, costDepartmentName } = record;
          return costDepartmentId
            ? {
                unitId: costDepartmentId,
                unitCode: costDepartmentCode,
                unitName: costDepartmentName,
              }
            : null;
        },
      },
      {
        name: 'costDepartmentId',
        bind: 'costDepartmentLov.unitId',
      },
      {
        name: 'costDepartmentCode',
        bind: 'costDepartmentLov.unitCode',
      },
      {
        name: 'costDepartmentName',
        bind: 'costDepartmentLov.unitName',
      },
      {
        label: intl.get(`mallf.common.view.receiveWarehouse`).d('仓转店收货仓'),
        name: 'receiveWarehouseName',
        valueField: 'organizationName',
        lookupCode: 'SCUX.WATSONS.WAREHOUSE_TO_SHOP',
        dynamicProps({ record }) {
          const { deliveryType } = record.data;
          return {
            // 送货方式为直送/送货方式为仓转店且费用承担中心为店铺
            disabled:
              deliveryType === 'DIRECT_DELIVERY' ||
              (deliveryType === 'WAREHOUSE_SHOP' && record.get('costShopType') === 'Store'),
          };
        },
      },
      {
        name: 'receiveWarehouseId',
      },
      {
        name: 'receiveWarehouseCode',
      },
      {
        name: 'quantity',
        label: intl.get(`mallf.common.view.productNum.order`).d('数量'),
        type: 'number',
        step: getPrecision(uomPrecision) || minPackageQuantity,
        min: minPurchaseQuantity || defaultValue,
        max: Math.floor(999999999 / latestPrice),
        required: !batchFlag,
        validator: (val) => {
          if (val && !uomPrecision && val % (minPackageQuantity || 1) !== 0) {
            return `${intl
              .get('mallf.common.view.errorMinPackageQuantity')
              .d('最小包装量为')}${minPackageQuantity}`;
          }
          if (!val && !batchFlag) {
            return intl.get('mallf.common.view.quantityNull').d('请输入数量');
          }
        },
        dynamicProps({ record }) {
          return {
            required: !record.get('batchFlag'),
          };
        },
      },
      {
        label: intl.get(`mallf.common.view.percent`).d('百分比(%)'),
        name: 'percent',
        dynamicProps({ record }) {
          return {
            required: record.get('batchFlag'),
          };
        },
      },
      {
        name: 'price',
      },
      {
        label: intl.get('mallf.common.view.totalAmount').d('总金额'),
        name: 'totalAmount',
      },
      {
        name: 'productTotalAmount',
      },
      {
        name: 'costProjectLov',
        label: intl.get('mallf.common.view.costProject').d('费用项目'),
        type: 'object',
        valueField: 'projectCostCode',
        textField: 'projectCostName',
        lovCode: 'SCUX.WATSONS.ALLOCATION_PRO_V',
        required: !batchFlag,
        lovPara: {
          itemCategoryId: productList[0].itemCategoryId,
          itemId: productList[0].itemId,
        },
        transformResponse: (_, record) => {
          const { projectCostId, projectCostCode, projectCostName } = record;
          return projectCostId
            ? {
                projectCostId,
                projectCostCode,
                projectCostName,
              }
            : null;
        },
      },
      {
        name: 'projectCostId',
        bind: 'costProjectLov.projectCostId',
      },
      {
        name: 'projectCostCode',
        bind: 'costProjectLov.projectCostCode',
      },
      {
        name: 'projectCostName',
        bind: 'costProjectLov.projectCostName',
      },
      // {
      //   name: 'costSubcategoryLov',
      //   label: intl.get('mallf.common.view.costProjectCategory1').d('费用项目子分类'),
      //   type: 'object',
      //   valueField: 'projectCostSubcategoryCode',
      //   textField: 'projectCostSubcategoryName',
      //   lovCode: 'SCUX.WATSONS.ALLOCATION_SUB_V',
      //   required: !batchFlag,
      //   dynamicProps({ record }) {
      //     return {
      //       required: record.get('subCateRequired'),
      //       disabled: !record.get('projectCostId') || !record.get('subCateRequired'),
      //       lovPara: {
      //         projectCostId: record.get('projectCostId'),
      //         tenantId: organizationId,
      //       },
      //     };
      //   },
      //   transformResponse: (_, record) => {
      //     const { projectCostSubcategoryCode, projectCostSubcategoryName } = record;
      //     return projectCostSubcategoryCode
      //       ? {
      //           projectCostSubcategoryCode,
      //           projectCostSubcategoryName,
      //         }
      //       : null;
      //   },
      // },
      // {
      //   name: 'projectCostSubcategoryCode',
      //   bind: 'costSubcategoryLov.projectCostSubcategoryCode',
      // },
      // {
      //   name: 'projectCostSubcategoryName',
      //   bind: 'costSubcategoryLov.projectCostSubcategoryName',
      // },
      // {
      //   name: 'subCateRequired', // 费用子分类必填标识
      // },
      {
        name: 'isLeaf', // 地区完整标识
      },
      {
        name: 'lastRegionId', // 最后一级地区id
      },
      {
        name: 'addressRegion',
        label: intl.get(`mallf.common.model.addressArea`).d('地址区域'),
        validator: (value, name, record) => {
          return record.get('isLeaf')
            ? true
            : intl.get('mallf.common.view.errorAddress').d('地区不完整');
        },
      },
      {
        name: 'fullAddress',
        required: true,
        label: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
      },
      {
        name: 'ceIdLov',
        label: 'CE号',
        type: 'object',
        textField: 'ceView',
        valueField: 'ceId',
        lovCode: 'SCUX.WATSONS.CE_BASIC_VIEW',
        computedProps: {
          disabled: ({ record }) => {
            return !record.get('costShopCode');
          },
          lovPara: ({ record }) => {
            return {
              storeNo: record.get('costShopCode'),
            };
          },
        },
        transformResponse: (_, record) => {
          const { ceId, ceNumber, ceDetail, ceDiscription } = record;
          return ceNumber
            ? {
                ceView: `${ceNumber}(${ceDetail})`,
                ceId,
                ceDiscription,
              }
            : null;
        },
      },
      {
        name: 'ceId',
        bind: 'ceIdLov.ceId',
      },
      {
        name: 'ceNumber',
        bind: 'ceIdLov.ceNumber',
      },
      {
        name: 'ceDiscription',
        bind: 'ceIdLov.description',
      },
      {
        name: 'ceDetail',
        bind: 'ceIdLov.itemName',
      },
      {
        name: 'pmNo',
        bind: 'ceIdLov.pmNo',
      },
      {
        name: 'cpAmount',
        label: intl.get(`mallf.common.view.all.money`).d('金额'),
      },
      {
        name: 'option',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          const { type } = record.getField('costShopLov').getLookupData(record.data.costShopCode);
          const current = record;
          if (record.get('projectCostSubcategoryCode')) {
            current.data.subCateRequired = true;
          }
          if (record.get('addressRegion')) {
            record.set('isLeaf', true);
          }
          current.data.costShopType = type;
          current.data.oldCostShopType = type;
          record.set('costShopType', type);
        });
      },
      update({ record, name, value }) {
        if (name === 'receiveWarehouseName') {
          const { organizationId: id, organizationCode } = record
            .getField(name)
            .getLookupData(value);
          if (id && organizationCode) {
            record.set('receiveWarehouseId', id);
            record.set('receiveWarehouseCode', organizationCode);
          }
          if (record.get('receiveWarehouseName')) {
            const params = {
              watsonsOrganizationId: record.get('receiveWarehouseId'),
              watsonsOrganizationCode: record.get('receiveWarehouseCode'),
              tenantId: organizationId,
            };
            // 送货方式为仓转店，根据【仓转店收货仓】自动带出收货地址
            fetchAddress(params).then((res) => {
              const { addressRegion, address, regionId } = res?.[0] || {};
              record.set('lastRegionId', regionId);
              record.set('addressRegion', addressRegion);
              record.set('fullAddress', address);
              if (addressRegion) {
                record.set('isLeaf', true);
              } else {
                record.set('isLeaf', false);
              }
            });
          }
        }
        if (name === 'quantity') {
          record.set(
            'totalAmount',
            numberRender(record.get('price') * value, financialPrecision, true)
          );
        }
        if (name === 'percent') {
          record.set(
            'totalAmount',
            numberRender((record.get('productTotalAmount') * value) / 100, financialPrecision, true)
          );
        }
        // 定制品值集lov绑定name值
        const reoordData = record.toData();
        const { componentType, detailId } =
          reoordData.customItemList?.find((n) => n.detailId === name) || {};
        if (componentType === 'SELECT') {
          const { meaning } = record.getField(name).getLookupData(value);
          record.set(`${detailId}Name`, meaning);
        }
      },
    },
    transport: {
      read({ data }) {
        return {
          url: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cost-allocation-infos`,
          method: 'GET',
          data,
          transformResponse: (res) => {
            if (res) {
              const resp = JSON.parse(res);
              // 定制品商品
              if (customFlag === 1) {
                handleFetchCustomData(resp.content); // 定制品数据查询
              }
              return resp;
            }
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/cost-allocation-infos`,
          method: 'DELETE',
          data: {
            ...productList[0],
            allocationInfoList: data,
          },
          transformResponse: (res) => {
            if (res) {
              updateCartService(JSON.parse(res)).then((resp) => {
                if (resp) {
                  if (productList[0]?.customFlag === 1) {
                    handleDalete(data, resp);
                  } else {
                    saveCallBack(resp);
                  }
                }
              });
            }
          },
        };
      },
    },
  };
};

export { deliveryTypeDs, tableDs };
