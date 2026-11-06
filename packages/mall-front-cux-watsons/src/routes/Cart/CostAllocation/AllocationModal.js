import React, { useEffect, useRef, useState } from 'react';
import { Icon } from 'hzero-ui';
import { Modal, Spin, Table as C7nTable, Tooltip, Icon as C7nIcon } from 'choerodon-ui';
import {
  DataSet,
  Form,
  Table,
  Button,
  NumberField,
  Select,
  Lov,
  TextField,
  Attachment,
} from 'choerodon-ui/pro';
import { sum, isEmpty, debounce } from 'lodash';
import intl from 'utils/intl';
import { imageAccept } from 'utils/constants';
import { numberRender, convertImg, getUserConfigInfo, openImport } from 'utils/utils';
// import HmallConfig from 'utils/api-config';
import Image from 'components/Image';
import AddressCascader from 'components/AddressCascader';
import { fetchCustom, fetchCustomData, deleteCustom } from 'services/cartService';
import { deliveryTypeDs, tableDs } from './tableDs';
import {
  saveCostService,
  // updateCartService,
  batchCreateCostService,
  getCostAllocationProject,
  // getCostAllocationSubCate,
  getCostAllocationWare,
  fetchAddress,
} from '../../../services/allocationService';
import style from './index.less';

const { Sidebar } = Modal;

function AllocationModal(props) {
  const { costVisible, setCostVisible, productList, batchFlag, saveCallBack } = props;
  const [state, setState] = useState({
    tableLoading: false,
    deliveryType:
      productList[0].sourceFrom !== 'CATA'
        ? 'DIRECT_DELIVERY'
        : productList[0].deliveryType || productList[0].allocationInfoList?.[0]?.deliveryType || '',
    deptSize: 5,
    storeSize: 5,
    okRef: 0,
    oldAllocationNum: 0,
  });
  const { tableLoading, deliveryType, okRef, oldAllocationNum } = state;
  const deliveryDs = useRef(new DataSet(deliveryTypeDs(deliveryType))).current;
  const costTableDs = useRef(
    new DataSet(
      tableDs({ productList, batchFlag, saveCallBack, handleDalete, handleFetchCustomData })
    )
  ).current;
  const cartNum = productList[0].quantity;
  const allocationNum = sum(costTableDs.toData().map((n) => n.quantity));
  const { organizationId } = getUserConfigInfo();
  const [customItemList, setCustomItemList] = useState([]); // 定制品列维度
  const [customizedProductLineList, setCustomizedProductLineList] = useState([]); // 定制品行数据

  useEffect(() => {
    handleTableData();
  }, []);

  useEffect(() => {
    // 定制品
    if (productList[0]?.customFlag === 1) {
      let newTableData = [];
      // 预算/定制品数据整合到dsData
      newTableData = costTableDs.toData().map((n) => {
        const record = n;
        const customLineData =
          customizedProductLineList.find((m) => m.relationId === record.allocationId) || {};
        if (!isEmpty(customLineData.customizedProductValueList)) {
          customLineData.customizedProductValueList.forEach((c) => {
            if (c.componentType === 'LOV') {
              const { lovView = {} } =
                customItemList?.find((m) => m.detailId === c.cpDetailId) || {};
              const { displayField, valueField } = lovView;
              record[`${c.cpDetailId}Lov`] = {
                [displayField]: c.cpValueName,
                [valueField]: c.cpValue,
              };
              record[`${c.cpDetailId}Name`] = c.cpValueName; // 值集绑定name值
            }
            if (c.componentType === 'SELECT') {
              record[`${c.cpDetailId}Name`] = c.cpValueName;
            }
            record[`${c.cpDetailId}`] = c.cpValue;
          });
        }
        return {
          ...record,
          ...customLineData,
          customItemList,
        };
      });
      costTableDs.loadData(newTableData, costTableDs.totalCount);
    }
  }, [customItemList, customizedProductLineList]);

  // 处理table数据
  function handleTableData() {
    if (!batchFlag) {
      const { cartId, productId, customFlag } = productList[0];
      costTableDs.setQueryParameter('cartId', cartId);
      costTableDs.query().then((res) => {
        if (res) {
          const { deliveryType: type } = costTableDs.toData()[0] || {};
          setState({
            ...state,
            deliveryType: type || deliveryType,
            oldAllocationNum: sum(costTableDs.toData().map((n) => n.quantity)),
          });
          deliveryDs.create({ deliveryType: type || deliveryType });
          deliveryDs.forEach((record) => {
            const { meaning } = record
              .getField('deliveryType')
              .getLookupData(record.get('deliveryType'));
            record.set('deliveryTypeMeaning', meaning);
          });
          // 定制品商品
          if (customFlag === 1) {
            handleFetchCustom(productId); // 定制品属性维度查询
            handleFetchCustomData(res?.content); // 定制品数据查询
          }
        }
      });
    } else {
      deliveryDs.create({});
      // 物料送货方式为直送的时候批量维护默认新建一行
      if (deliveryType === 'DIRECT_DELIVERY' && isEmpty(costTableDs.toData())) {
        handleCreate();
      }
    }
  }

  // 定制品维度查询
  function handleFetchCustom(productId) {
    setState({
      ...state,
      tableLoading: true,
    });
    fetchCustom(productId)
      .then((res) => {
        if (res) {
          let newCustomItemList = [];
          res.forEach((n) => {
            const { pricingFlag, shipper, shipperFlag, shipperId, shipperCode } = n;
            const newCustomDetailList = n.customDetailList.map((m) => ({
              ...m,
              pricingFlag,
              shipper,
              shipperFlag,
              shipperId,
              shipperCode,
            }));
            newCustomItemList = [...newCustomItemList, ...newCustomDetailList];
          });
          newCustomItemList.forEach((m) => {
            const {
              componentType,
              componentName,
              detailId,
              requiredFlag,
              lovCode,
              lovView = {},
            } = m;
            let componentProps = {};
            switch (componentType) {
              case 'UPLOAD':
              case 'IMAGE':
                componentProps = {
                  required: !!requiredFlag,
                  type: 'attachment',
                  bucketName: 'private-bucket',
                  bucketDirectory: 'mall-front',
                };
                break;
              case 'INPUT_NUMBER':
                componentProps = {
                  min: 0,
                  max: 999999999,
                  step: 1,
                  type: 'number',
                  required: !!requiredFlag,
                };
                break;
              case 'SELECT':
                componentProps = {
                  lookupCode: lovCode,
                  required: !!requiredFlag,
                };
                costTableDs.addField(`${detailId}Name`); // 值集name字段
                break;
              case 'LOV':
                componentProps = {
                  lovCode,
                  type: 'object',
                  required: !!requiredFlag,
                };
                costTableDs.addField(`${detailId}`, {
                  bind: `${detailId}Lov.${lovView.valueField}`,
                });
                costTableDs.addField(`${detailId}Name`, {
                  bind: `${detailId}Lov.${lovView.displayField}`,
                });
                break;
              default:
                componentProps = { required: !!requiredFlag };
            }
            costTableDs.addField(componentType === 'LOV' ? `${detailId}Lov` : `${detailId}`, {
              label: componentName,
              ...componentProps,
            });
          });
          setCustomItemList(newCustomItemList);
        }
      })
      .finally(() => {
        setState({
          ...state,
          tableLoading: false,
        });
      });
  }

  // 定制品数据查询
  function handleFetchCustomData(allocationInfoList) {
    fetchCustomData({ ...productList[0], allocationInfoList }).then((res) => {
      if (res) setCustomizedProductLineList(res);
    });
  }

  // 新建
  const handleCreate = () => {
    if (batchFlag) {
      const productTotalAmount = sum(productList.map((n) => n.totalPrice));
      costTableDs.create({ batchFlag: true, percent: 100, productTotalAmount }, 0);
    } else {
      const { latestPrice } = productList[0];
      costTableDs.create({ price: latestPrice, customItemList }, 0);
      handleCostAllocationProject();
    }
  };

  // 导入
  const handleImport = () => {
    const { cartId, itemId, itemCategoryId, latestPrice } = productList[0];
    openImport({
      code: 'SCUX.WATSONS.ALLOCATION_ONE',
      importType: 'excel',
      action: intl.get('mallf.common.button.importCostAllocation').d('导入费用分配行'),
      args: JSON.stringify({
        cartId,
        itemId,
        itemCategoryId,
        deliveryType,
        price: latestPrice,
      }),
    });
  };

  // 刷新防抖
  const handleRefresh = debounce(() => {
    costTableDs.loadData([]);
    handleTableData();
  }, 500);

  // 查询费用项目
  const handleCostAllocationProject = () => {
    const params = {
      lovCode: 'SCUX.WATSONS.ALLOCATION_PROJECT',
      itemCategoryId: productList[0].itemCategoryId,
      itemId: productList[0].itemId,
      page: 0,
      size: 10,
    };
    getCostAllocationProject(params).then((res) => {
      // 只有一条自动带出
      if (res.length === 1) {
        const { projectCostId, projectCostCode, projectCostName } = res[0];
        if (costTableDs.get(0)) {
          costTableDs.get(0).set('costProjectLov', {
            projectCostId,
            projectCostCode,
            projectCostName,
          });
        }
      }
    });
  };

  // 查询费用项目子分类
  // const handleCostAllocationSubCate = (projectCostId, record) => {
  //   const param = {
  //     lovCode: 'SUCX.WATSONS_PROJECT_COST_SUBCATEGORY_PLAT',
  //     projectCostId,
  //     tenantId: organizationId,
  //     page: 0,
  //     size: 10,
  //   };
  //   // 改变费用项目清空子分类
  //   record.set('costSubcategoryLov', null);
  //   getCostAllocationSubCate(param).then((resp) => {
  //     // 默认必填
  //     record.set('subCateRequired', true);
  //     // 没有值子分类非必填
  //     if (isEmpty(resp.content)) {
  //       record.set('subCateRequired', false);
  //     }
  //     // 只有一条默认赋值
  //     if (resp.content.length === 1) {
  //       const { projectCostSubcategoryCode, projectCostSubcategoryName } = resp.content[0];
  //       record.set('costSubcategoryLov', {
  //         projectCostSubcategoryCode,
  //         projectCostSubcategoryName,
  //       });
  //     }
  //   });
  // };

  // 送货方式回调
  const handleDelivery = (value) => {
    if (isEmpty(costTableDs.toData()) && batchFlag) {
      handleCreate();
    } else {
      costTableDs.forEach((record) => {
        record.set('receiveWarehouseCode', null);
        record.set('receiveWarehouseId', null);
        record.set('receiveWarehouseName', null);
      });
    }
    setState({
      ...state,
      deliveryType: value,
    });
  };

  // 费用承担写字楼/店铺/仓库回调
  const handleCostShopChange = (record, item) => {
    record.set('ceIdLov', null);
    if (!item) {
      record.set('costDepartmentLov', null);
      record.set('receiveWarehouseId', null);
      record.set('receiveWarehouseCode', null);
      record.set('receiveWarehouseName', null);
      record.set('lastRegionId', null);
      record.set('addressRegion', null);
      record.set('fullAddress', null);
      return false;
    }
    // 费用承担中心改为写字楼清空费用部门
    if (record.data.oldCostShopType !== item.type && ['Dept', 'WH'].includes(item.type)) {
      record.set('costDepartmentLov', null);
    }
    // 店铺带出费用部门
    if (['Store'].includes(record.get('costShopType')) && item) {
      const code = record.get('costShopType') === 'Store' ? '00' : '07'; // 00店铺，07仓库
      // const { unitId, unitCode, unitName } = record.getField('costDepartment').getLookupData(code);
      const { unitId, unitCode, unitName } = costTableDs
        .getField('costDepartment')
        .getLookupData(code, record);
      record.set('costDepartmentLov', {
        unitId,
        unitCode,
        unitName,
      });
    }
    // 送货方式为直送,根据【费用承担写字楼/店铺/仓库】带出地址
    if (deliveryType === 'DIRECT_DELIVERY' && item) {
      const { organizationId: id, organizationCode } = item;
      fetchAddress({
        watsonsOrganizationId: id,
        watsonsOrganizationCode: organizationCode,
        tenantId: organizationId,
      }).then((resp) => {
        const { addressRegion, address, regionId } = resp?.[0] || {};
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
    // 送货方式为仓转店且为店铺时自动带出仓转店
    if (deliveryType === 'WAREHOUSE_SHOP' && record.get('costShopType') === 'Store') {
      const params = {
        storeId: record.get('costShopCode'),
        tenantId: organizationId,
        page: 0,
        size: 10,
      };
      // 查询仓转店
      getCostAllocationWare(params).then((res) => {
        const { inventoryCode, inventoryName } = res?.content?.[0] || {};
        if (isEmpty(res?.content)) {
          record.set('lastRegionId', null);
          record.set('addressRegion', null);
          record.set('fullAddress', null);
        }
        record.set('receiveWarehouseCode', inventoryCode);
        record.set('receiveWarehouseName', inventoryName);
      });
    }
    record.set('oldCostShopType', item.type);
  };

  /**
   * 选择地址
   * @param {*} idList 地区id
   * @param {*} nameList 地区name
   * @param {*} isLeaf 是否最后一级
   */
  function onAddressChange(idList, nameList, isLeaf, record) {
    record.set('isLeaf', isLeaf);
    record.set('lastRegionId', idList.pop()); // 最后一级地址
    record.set('addressRegion', nameList.join(''));
  }

  // 处理定制品数据
  function handleCustomizedProductLineList() {
    const { shipper = null, shipperFlag = 0, shipperId, shipperCode } =
      customItemList.find((n) => n.pricingFlag === 1) || {};
    return costTableDs.toData().map((item) => {
      const { allocationId, quantity: cpQuantity } = item;
      const { productId: skuId, companyId, cartId, latestPrice } = productList[0] || {};
      return {
        ...item,
        shipper,
        shipperFlag,
        shipperId,
        shipperCode,
        allocationId,
        skuId,
        companyId,
        cartId,
        latestPrice,
        cpQuantity,
        customizedProductValueList: customItemList.map((n) => {
          const customItem =
            (item.customizedProductValueList || []).find((c) => c.cpDetailId === n.detailId) || {};
          return {
            ...n,
            ...customItem,
            cpGroupId: n.groupId,
            cpDetailId: n.detailId,
            cpValue: item[`${n.detailId}`],
            cpValueName: item[`${n.detailId}Name`], // 值集/lov需要name展示
          };
        }),
      };
    });
  }

  // 保存
  const handleOK = async () => {
    const deliveryTypeFlag = await deliveryDs.validate();
    // eslint-disable-next-line
    costTableDs.forEach((record) => (record.status = 'update'));
    const tableFlag = await costTableDs.validate();
    if (tableFlag && deliveryTypeFlag) {
      if (batchFlag) {
        setState({
          ...state,
          tableLoading: true,
        });
        const params = {
          watsonsShoppingCartList: productList,
          allocationInfoList: costTableDs.toData().map((m) => ({
            ...m,
            ...deliveryDs.toData()[0],
          })),
        };
        batchCreateCostService(params)
          .then((res) => {
            if (res) {
              saveCallBack(res?.watsonsShoppingCartList, 'batch');
              setCostVisible(false);
            }
          })
          .finally(() => {
            setState({
              ...state,
              tableLoading: false,
            });
          });
      } else {
        const newAllocationNum = sum(costTableDs.toData().map((n) => n.quantity));
        if (
          (newAllocationNum !== oldAllocationNum || okRef === 0) &&
          newAllocationNum !== cartNum
        ) {
          setState({
            ...state,
            okRef: 1,
            oldAllocationNum: newAllocationNum,
            tableLoading: false,
          });
          return false;
        }
        setState({
          ...state,
          tableLoading: true,
        });
        // 定制品行数据
        const newCustomizedProductLineList = handleCustomizedProductLineList();
        const params = {
          ...productList[0],
          success: 1,
          allocationInfoList: costTableDs.toData().map((m, index) => {
            const newItem = {
              ...m,
              ...deliveryDs.toData()[0],
              cartId: productList[0]?.cartId,
              price: productList[0]?.latestPrice,
            };
            if (productList[0]?.customFlag === 1) {
              return {
                ...newItem,
                customizedProductLine: newCustomizedProductLineList[index],
              };
            }
            return newItem;
          }),
          customizedProductLineList:
            productList[0]?.customFlag === 1 ? newCustomizedProductLineList : [],
        };
        saveCostService(params).then((res) => {
          if (res) {
            saveCallBack(res);
            setCostVisible(false);
            // 保存定制品
            // if (productList[0]?.customFlag) {
            //   // 需要绑定allocationId
            //   const param = res.allocationInfoList.map((n) => {
            //     return {
            //       allocationId: n.allocationId,
            //       ...n.customizedProductLine,
            //       skuId: productList[0]?.productId,
            //     };
            //   });
            //   saveCustom(param);
            // }
            // updateCartService(res)
            //   .then((resp) => {
            //     saveCallBack(resp);
            //   })
            //   .finally(() => {
            //     setCostVisible(false);
            //   });
          }
        });
      }
    }
  };

  // 定制品删除
  async function handleDalete(record, product) {
    setState({
      ...state,
      tableLoading: true,
    });
    await deleteCustom(record);
    const customData = await fetchCustomData(productList[0]);
    setCustomizedProductLineList(customData);
    saveCallBack({
      ...product,
      customizedProductLineList: customData,
    });
    setState({
      ...state,
      tableLoading: false,
    });
  }

  const numberColumns = batchFlag
    ? {
        name: 'percent',
        width: 90,
        tooltip: 'overflow',
        editor: () => <NumberField step={0.01} min={0} clearButton={false} />,
      }
    : {
        name: 'quantity',
        width: 80,
        tooltip: 'overflow',
        editor: () => true,
      };

  const columns = [
    {
      name: 'orderSeq',
      width: 50,
      renderer: ({ record }) => record.index + 1,
    },
    {
      name: 'costShop',
      width: 130,
      tooltip: 'overflow',
      editor: (record) => {
        return <Lov noCache onChange={(item) => handleCostShopChange(record, item)} />;
      },
    },
    {
      name: 'costDepartmentLov',
      width: 100,
      tooltip: 'overflow',
      editor: () => {
        return <Lov noCache />;
      },
    },
    numberColumns,
    !productList[0].customFlag && {
      name: 'totalAmount',
      width: 130,
      tooltip: 'overflow',
    },
    {
      name: 'addressRegion',
      width: 140,
      tooltip: 'none',
      className: 'address-region',
      renderer: ({ record }) => {
        return (
          <AddressCascader
            label=""
            tooltip={record.get('addressRegion')}
            displayValue={record.get('addressRegion')}
            onChange={(idList, nameList, isLeaf) =>
              onAddressChange(idList, nameList, isLeaf, record)
            }
          />
        );
      },
    },
    {
      name: 'fullAddress',
      width: 140,
      tooltip: 'overflow',
      editor: () => true,
    },
    !!productList[0].showCeFlag && {
      name: 'ceIdLov',
      width: 140,
      tooltip: 'overflow',
      editor: () => true,
    },
    {
      name: 'receiveWarehouseName',
      width: 100,
      tooltip: 'overflow',
      editor: (record) => {
        return deliveryType === 'WAREHOUSE_SHOP' && record.get('costShopType') === 'Store' ? (
          <TextField disabled />
        ) : (
          <Select disabled={deliveryType === 'DIRECT_DELIVERY'} clearButton={false} />
        );
      },
    },
    !batchFlag && {
      name: 'costProjectLov',
      width: 80,
      tooltip: 'overflow',
      editor: (record) => {
        return (
          <Lov
            noCache
            onChange={(item) => {
              if (!item) {
                record.set('costSubcategoryLov', null);
                return false;
              }
              // handleCostAllocationSubCate(item.projectCostId, record);
            }}
          />
        );
      },
    },
    // !batchFlag && {
    //   name: 'costSubcategoryLov',
    //   width: 110,
    //   tooltip: 'overflow',
    //   editor: () => {
    //     return <Lov noCache />;
    //   },
    // },
  ];
  if (productList[0]?.customFlag === 1) {
    customItemList.forEach((n) => {
      const { componentType, detailId, componentName, remark } = n;
      switch (componentType) {
        case 'UPLOAD':
          columns.push({
            name: `${detailId}`,
            width: 130,
            header: () => (
              <>
                <span>{componentName}</span>
                {remark && (
                  <Tooltip title={remark}>
                    <C7nIcon type="help" style={{ color: '#999999', paddingLeft: '5px' }} />
                  </Tooltip>
                )}
              </>
            ),
            editor: () => {
              const attProps = {
                viewMode: 'popup',
              };
              return <Attachment {...attProps} />;
            },
          });
          break;
        case 'IMAGE':
          columns.push({
            name: `${detailId}`,
            width: 130,
            header: () => (
              <>
                <span>{componentName}</span>
                {remark && (
                  <Tooltip title={remark}>
                    <C7nIcon type="help" style={{ color: '#999999', paddingLeft: '5px' }} />
                  </Tooltip>
                )}
              </>
            ),
            editor: () => {
              const attProps = {
                viewMode: 'popup',
                accept: imageAccept,
              };
              return <Attachment {...attProps} />;
            },
          });
          break;
        default:
          columns.push({
            name: `${n.detailId}`,
            width: 120,
            header: () => (
              <>
                <span>{componentName}</span>
                {remark && (
                  <Tooltip title={remark}>
                    <C7nIcon type="help" style={{ color: '#999999', paddingLeft: '5px' }} />
                  </Tooltip>
                )}
              </>
            ),
            editor: () => true,
          });
          break;
      }
    });
    columns.push(
      {
        name: 'cpAmount',
        width: 120,
        renderer: ({ record }) => numberRender(record.get('cpAmount')),
      },
      {
        name: 'option',
        width: 60,
        renderer: ({ record }) =>
          record.status === 'add' ? (
            <a onClick={() => costTableDs.remove(record)}>
              {intl.get('hzero.common.btn.cancel').d('取消')}
            </a>
          ) : (
            <a onClick={() => costTableDs.delete([record])}>
              {intl.get('hzero.common.btn.delete').d('删除')}
            </a>
          ),
      }
    );
  }

  const expandedRowRender = ({ record }) => {
    const percentNum = (record.get('percent') || 100) / 100;
    const expandColumns = [
      {
        title: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
        dataIndex: 'product',
        key: 'product',
        width: 278,
        render: (v, product) => {
          return (
            <div className="product-info">
              <div className="goods-img">
                <Image
                  value={convertImg(product.imagePath, 1, product.productSource)}
                  width={41}
                  height={41}
                />
              </div>
              <div className="goods-product-name text-overflow">
                <div title={product.productName} className="goods-name">
                  {product.productName}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: intl.get(`mallf.myMall.model.companyOrder.unitPrice`).d('单价'),
        dataIndex: 'latestPrice',
        key: 'latestPrice',
        width: 150,
        align: 'right',
        render: (v, product) => {
          const { latestPrice, uomName } = product;
          return (
            <div className="columns-item">
              {numberRender(latestPrice)}
              {uomName ? `/${uomName}` : ''}
            </div>
          );
        },
      },
      {
        title: intl.get(`mallf.myMall.model.companyOrder.count`).d('数量'),
        dataIndex: 'quantity',
        key: 'quantity',
        width: 150,
        render: (v, product) => {
          const { quantity, uomPrecision } = product;
          return (
            <div className="columns-item">
              {numberRender(quantity * percentNum, uomPrecision, true)}
            </div>
          );
        },
      },
      {
        title: intl.get(`mallf.common.view.all.money`).d('金额'),
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        render: (v, product) => {
          const { totalPrice, currencyCode, financialPrecision } = product;
          return (
            <div className="columns-item product-price">
              <p>{numberRender(totalPrice * percentNum, financialPrecision, true)}</p>
              <p>{currencyCode}</p>
            </div>
          );
        },
      },
    ];
    return (
      <C7nTable
        columns={expandColumns}
        filterBar={false}
        dataSource={productList}
        pagination={false}
      />
    );
  };

  const addButton = (
    <Button icon="add" key="add" disabled={!deliveryType} onClick={() => handleCreate()}>
      {intl.get('mallf.common.button.addCostAllocation').d('新建费用分配行')}
    </Button>
  );
  const importButton = (
    <Button icon="archive" key="add" onClick={() => handleImport()}>
      {intl.get('mallf.common.button.importCostAllocation').d('导入费用分配行')}
    </Button>
  );
  const refreshButton = (
    <Button icon="refresh" key="add" onClick={() => handleRefresh()}>
      {intl.get(`hzero.common.button.refresh`).d('刷新')}
    </Button>
  );
  const buttons = batchFlag ? [addButton] : [addButton, 'delete', importButton, refreshButton];
  return (
    <Sidebar
      closable
      destroyOnClose
      className={style['cost-allocation-modal']}
      title={intl.get('mallf.common.view.costAllocation').d('费用分配')}
      visible={costVisible}
      okText={intl.get(`mallf.common.model.confirm`).d('确认')}
      cancelText={intl.get(`mallf.common.button.cancel`).d('取消')}
      onCancel={() => setCostVisible(false)}
      onOk={handleOK}
      confirmLoading={tableLoading}
      maskClosable={false}
    >
      <Spin spinning={tableLoading}>
        {batchFlag && (
          <div className="allocation-warn">
            <Icon type="error" size={13} style={{ marginRight: '6px' }} />
            {intl
              .get('mallf.common.view.allocationWarn')
              .d('批量分配操作会对所有勾选商品进行同样的分配方式，将覆盖原有的信息，请谨慎操作')}
          </div>
        )}
        <Form dataSet={deliveryDs} labelLayout="float" columns={3}>
          <Select
            onChange={handleDelivery}
            name="deliveryType"
            disabled={productList[0].sourceFrom !== 'CATA' || !!productList[0].deliveryType}
          />
        </Form>
        <Table
          dataSet={costTableDs}
          columns={columns}
          buttons={buttons}
          expandedRowRenderer={batchFlag && expandedRowRender}
        />
      </Spin>
      {allocationNum !== cartNum && okRef !== 0 && (
        <div className="allocation-confirm">
          <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
          {intl.get('mallf.common.view.allocationTotal').d('费用分配总数量')}
          {allocationNum > cartNum ? '>' : '<'}
          {intl.get('mallf.common.view.cartNum').d('购物车数量')},
          {allocationNum > cartNum
            ? intl.get('mallf.common.view.numberOver').d('数量多')
            : intl.get('mallf.common.view.numberLess').d('数量少')}
          <span className="allocation-confirm-num">{Math.abs(cartNum - allocationNum)}</span>,
          {intl
            .get('mallf.common.view.allocationNumConfirm')
            .d(
              '如需要进行差异调整，请继续进行费用分配后再点击【确认】按钮，如不进行差异调整可直接点击【确认】按钮'
            )}
        </div>
      )}
    </Sidebar>
  );
}

export default AllocationModal;
