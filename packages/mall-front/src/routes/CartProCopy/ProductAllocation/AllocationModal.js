/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Spin, Message } from 'choerodon-ui';
import { isEmpty, max, maxBy } from 'lodash';
import { DataSet, Button } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';

import { getOpenCartFlag } from 'utils/configUtils';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import { getUserConfigInfo, getPrimaryColor } from 'utils/utils';
import { openGoToLowestSkuModal, openValidErrorModal } from 'utils/modals';
import intl from 'utils/intl';
import { getHeaderFixedDimension, addNewCareParams, getCartParams } from 'utils/addNewCart';
import Swal from 'components/swal';
import {
  fetchProductAllocationService,
  addNewCartService,
  newBuyNowService,
  allocationDeleteService,
  fetchBudgetRemainService,
  manualAddCartService,
  openCartBuyNowService,
  fetchDefAlloctionValueService,
} from 'services/newCartService';
import { useModal } from 'components/Import';
import cuxComponent from 'cuxTools/cuxComponent';
import { formDs, tableDs } from './dataSet';
import style from './index.less';
import CuxFn from '@/cuxTools/cuxFn';
import AllocationAnchor from './AllocationAnchor';
import AllocationItem from './AllocationItem';
import { footerRender } from './renderUtils';
import { getHeaderDisplayDimension, getLineDisplayDimension } from '../ProductAllocation/func';
import useAnchorScroll from '@/hooks/useAnchorScroll';
import AllocationItemSkeleton from './AllocationItemSkeleton';

const { Sidebar } = Modal;
let headerDsObj = {};
let lineDsObj = {};
let initialSpecialObj = {};
const priceFieldList = [
  'taxIncludedPrice',
  'taxIncludedAmount',
  'taxExcludedPrice',
  'taxExcludedAmount',
  'taxAmount',
  'originalTaxPrice',
  'originalTaxIncludedPrice',
  'originalTaxIncludedAmount',
  'originalTaxExcludedPrice',
  'originalTaxExcludedAmount',
  'originalTaxAmount',
];

function AllocationModal(props) {
  const {
    visible,
    setVisible,
    product = {},
    dimensTemplates,
    noFetchFlag, // 打开弹出不调查询
    callBack,
    showBuyNow, // 立即购买
    readOnly = false,
    noAction = false, // 不可操作
    noCreate = false, // 不可新建行
    title,
    searchUuid = null,
    defaultFlag, // 是否查询默认值
    centralizedUserType,
    singleLineFlag,
  } = props;
  const {
    templateId,
    productId,
    itemCode,
    itemId,
    itemCategoryId,
    currencyCode,
    cartId,
    sourceFrom = 'CATA',
    supplierCompanyId,
    // unitId,
    customFlag,
    shipperFlag,
    punchoutFlag,
    qtHeaderNo,
    qtLineNo,
    stockNumber,
    onCataStock,
    receiveFlag, // 领用商品标识
    saleAgreementId, // 领用协议id，库房查询参数
    manualFlag, // 手工申请
    templateUpdateFlag, // 模板已更新
    linkType,
    centralizedHeaderNum,
    centralizedLineNum,
    totalQuantity,
    centralizedFlag,
  } = product;
  const { userId, organizationId, companyId, unitId } = getUserConfigInfo();
  const { dimensionList = [], dimensionTemplate } = dimensTemplates;
  // 头展示维度
  const headerDisplayDimension = useMemo(() => getHeaderDisplayDimension(dimensionList), [
    dimensionList,
  ]);
  // 行展示维度
  const lineDisplayDimension = useMemo(() => getLineDisplayDimension(dimensionList), [
    dimensionList,
  ]);
  // 头启用字段
  const headerEnabledDimension = dimensionList.filter(
    (n) => n.dimension.dimensionType.startsWith('HEADER') && n.dimension.enabledFlag
  );
  // 行启用
  const lineEnabledDimension = dimensionList.filter(
    (n) => n.dimension.dimensionType.startsWith('LINE') && n.dimension.enabledFlag
  );
  // 无自定义维度/有拆单维度/电商商品/手工申请，不可手动新增行
  const noCreateFlag =
    lineDisplayDimension.some((n) => n.dimension?.splitFlag === 1) ||
    lineDisplayDimension.every((n) => n.dimension.dimensionType === 'LINE_FIXED') ||
    sourceFrom !== 'CATA' ||
    !!manualFlag ||
    noCreate;

  const [allocationData, setAllocationData] = useState([]);
  const [customizedProductLineList, setCustomizedProductLineList] = useState();
  const [loading, setLoading] = useState(false);
  const [actionFlag, setActionFlag] = useState(false); // 是否编辑状态
  const [defaultData, setDefaultData] = useState({});
  // 分配所在位置
  const locationFrom = useMemo(() => {
    const { pathname } = window.location || {};
    return pathname === '/cart' && 'CART';
  }, [window.location]);

  const { index: anchorIndex } = useAnchorScroll({
    container: document.querySelector('.c7n-modal-body'),
  });

  useEffect(() => {
    // 商详立即购买分配信息
    if (showBuyNow) {
      setfetchData({ cartHeaderDTOList: props.allocationData });
      return;
    }
    // 商详加入购物车分配信息
    if (defaultFlag) {
      fetchDefAlloctionValue();
      return;
    }
    if (noFetchFlag) {
      const { currentAddress, currentWarehouse } = props;
      const _HEADER_FIXED = getHeaderFixedDimension({
        currentAddress,
        currentWarehouse,
        product,
      });
      // 头固定列
      const headerDimension =
        dimensionList.filter(
          (n) =>
            ['HEADER_FIXED', 'HEADER_CUSTOMIZE'].includes(n.dimension.dimensionType) ||
            n.dimension.dimensionCode === 'currencyCode'
        ) || [];
      // 头维度
      let headerList = headerDimension.map((n) => {
        return {
          ...n.dimension,
          headerIndex: 1,
          tenantId: organizationId,
          ..._HEADER_FIXED[n.dimension.dimensionCode],
        };
      });
      headerList = CuxFn({
        name: 'productDetail-fn-cuxHeaderList',
        value: {
          dimensionList,
          headerList,
          organizationId,
          product,
        },
      })(() => headerList)();
      // 行维度
      const cartLineList = dimensionList.filter((n) => n.dimension.dimensionCode === 'quantity');
      const {
        minPackageQuantity,
        minPurchaseQuantity,
        purchaseQuantityLimit,
        uomPrecision,
      } = product;
      const cartHeaderDTOList = [
        {
          headerIndex: 1,
          headerList,
          minPackageQuantity,
          minPurchaseQuantity,
          purchaseQuantityLimit,
          cartLineList: cartLineList.map((n) => {
            return {
              lineNum: 1,
              lineList: [
                {
                  ...n.dimension,
                  tenantId: organizationId,
                  headerIndex: 1,
                  lineNum: 1,
                  value: product.quantity,
                },
                {
                  dimensionCode: 'uomPrecision',
                  tenantId: organizationId,
                  headerIndex: 1,
                  lineNum: 1,
                  value: uomPrecision,
                },
              ],
            };
          }),
        },
      ];
      setfetchData({ cartHeaderDTOList });
    } else {
      // 购物车查询分配信息
      fetchProductAllocation();
    }
  }, [props.allocationData]);

  useEffect(() => {
    if (isEmpty(defaultData) && !defaultFlag) {
      getDefAlloctionValue().then((res) => {
        if (res) {
          const cartHeaderDTO = res.cartHeaderDTOList?.[0] || {};
          const { headerData, lineData } = handleCartHeaderDTO(cartHeaderDTO);
          const defData = {
            headerData,
            lineData,
            cartHeaderDTOList: res.cartHeaderDTOList,
          };
          setDefaultData(defData);
        }
      });
    }
  }, [defaultFlag]);

  function handleCartHeaderDTO(cartHeaderDTO) {
    const {
      headerList = [],
      cartLineList = [],
      headerIndex,
      headerNum,
      minPackageQuantity,
      minPurchaseQuantity,
      purchaseQuantityLimit,
    } = cartHeaderDTO || {};
    const { totalCqNum } = cartLineList?.[0] || {}; // 定制品数量
    const headerData = [{ headerIndex }];
    // 维度组件赋值
    const handleComponentValue = ({
      dimensionComList,
      dimensionData,
      dimensionCode,
      valueName,
      value,
      fxDisplayFlag,
      fxEditFlag,
      fxNecessaryFlag,
      fxBudgetFlag,
      initialSpecialValue, // 特殊默认值
      initialSpecialValueMeaning,
    }) => {
      const { dimensionComponent = {}, dimension = {} } =
        dimensionComList.find((h) => h.dimension.dimensionCode === dimensionCode) || {};
      const {
        componentType,
        lovView,
        defaultValue,
        defaultValueMeaning,
        // defaultType,
      } = dimensionComponent;
      const { dimensionType, editFlag } = dimension;
      // let componentDefaultValue = defaultValue;
      // // 判断公式默认值
      // if (defaultType === 'FORMULA' && isEmpty(defaultValue)) {
      //   const { value: formulaValue } = getDimValue(
      //     { formulaCondition },
      //     {
      //       record: { get: (valueCode) => dimensionData[valueCode] },
      //       lineDs: { get: () => ({ get: (valueCode) => dimensionData[valueCode] }) },
      //       dimensionList,
      //     }
      //   );
      //   const newFormulaValue = formulaValue(0);
      //   componentDefaultValue = newFormulaValue;
      // }
      const newValue = value || defaultValue;
      const newName = valueName || defaultValueMeaning;
      if (dimensionCode === 'unitId') {
        dimensionData.unitIdLov = newValue
          ? {
              unitName: newName,
              unitId: newValue,
            }
          : null;
        dimensionData.unitId = newValue || null;
        dimensionData.unitName = newName || null;
      } else if (componentType === 'LOV') {
        const { displayField, valueField } = lovView || {};
        dimensionData[`${dimensionCode}Lov`] = newValue
          ? {
              [displayField]: newName,
              [valueField]: newValue,
            }
          : null;
        dimensionData[dimensionCode] = newValue;
        initialSpecialObj[`${dimensionType}_${dimensionCode}`] = initialSpecialValue
          ? {
              [valueField]: initialSpecialValue,
              [displayField]: initialSpecialValueMeaning,
            }
          : null;
      } else if (priceFieldList.includes(dimensionCode) && !editFlag) {
        // 针对价格展示(如1,000)
        dimensionData[`${dimensionCode}RealValue`] = newValue;
        dimensionData[dimensionCode] = newName || newValue;
        initialSpecialObj[`${dimensionType}_${dimensionCode}`] = initialSpecialValue;
      } else {
        dimensionData[dimensionCode] = newValue;
        initialSpecialObj[`${dimensionType}_${dimensionCode}`] = initialSpecialValue;
      }
      dimensionData[`${dimensionCode}fxDisplayFlag`] = fxDisplayFlag;
      dimensionData[`${dimensionCode}fxEditFlag`] = fxEditFlag;
      dimensionData[`${dimensionCode}fxNecessaryFlag`] = fxNecessaryFlag;
      dimensionData[`${dimensionCode}fxBudgetFlag`] = fxBudgetFlag;
    };
    // 头数据值
    headerList.forEach((haeder) => {
      const {
        dimensionCode,
        value,
        valueName,
        fxDisplayFlag,
        fxEditFlag,
        fxNecessaryFlag,
        initialSpecialValue, // 特殊默认值
        initialSpecialValueMeaning,
      } = haeder;
      handleComponentValue({
        dimensionComList: dimensionList.filter(
          (m) => m.dimension.dimensionType.startsWith('HEADER') && m.dimension.enabledFlag
        ),
        dimensionData: headerData[0],
        dimensionCode,
        valueName,
        value,
        fxDisplayFlag,
        fxEditFlag,
        fxNecessaryFlag,
        initialSpecialValue,
        initialSpecialValueMeaning,
      });
    });
    // 行数据值
    const lineData = cartLineList.map((line) => {
      const { lineList, lineNum } = line;
      const lineFieldObj = {};
      lineList.forEach((haeder) => {
        const {
          dimensionCode,
          value,
          valueName,
          fxDisplayFlag,
          fxEditFlag,
          fxNecessaryFlag,
          fxBudgetFlag,
          initialSpecialValue, // 特殊默认值
          initialSpecialValueMeaning,
        } = haeder;
        handleComponentValue({
          dimensionComList: dimensionList.filter(
            (m) => m.dimension.dimensionType.startsWith('LINE') && m.dimension.enabledFlag
          ),
          dimensionData: lineFieldObj,
          dimensionCode,
          valueName,
          value,
          fxDisplayFlag,
          fxEditFlag,
          fxNecessaryFlag,
          fxBudgetFlag,
          initialSpecialValue, // 特殊默认值
          initialSpecialValueMeaning,
        });
      });
      return {
        ...lineFieldObj,
        headerIndex,
        headerNum,
        lineNum,
        minPackageQuantity,
        minPurchaseQuantity,
        purchaseQuantityLimit,
        totalCqNum,
        totalQuantity,
      };
    });
    return { headerData, lineData };
  }

  // 构造分配ds数据
  function setfetchData(res, actionType) {
    if (res) {
      const { cartHeaderDTOList } = res;
      cartHeaderDTOList.forEach((n) => {
        const { purchaseQuantityLimit, _status, dataFrom } = n;
        // 非复制分配行不需要重复处理
        if (actionType === 'copy' && dataFrom !== 'copy') return;
        const { headerData, lineData } = handleCartHeaderDTO(n) || {};
        headerDsObj[n.headerIndex] = new DataSet(
          formDs({
            fieldList: headerEnabledDimension,
            product,
            dimensionList,
            lineDsObj,
            initialSpecialObj,
            fetchBudgetRemain: (num) => fetchBudgetRemain(res.cartHeaderDTOList, num),
          })
        );
        lineDsObj[n.headerIndex] = new DataSet(
          tableDs({
            multipleFlag: manualFlag && noFetchFlag,
            product,
            fieldList: lineEnabledDimension,
            purchaseQuantityLimit: showBuyNow && onCataStock ? stockNumber : purchaseQuantityLimit,
            dimensionList,
            headerDs: headerDsObj[n.headerIndex],
            initialSpecialObj,
            fetchBudgetRemain: (num) => fetchBudgetRemain(res.cartHeaderDTOList, num),
          })
        );
        // 商详加入购物车
        // if (noFetchFlag) {
        //   headerDsObj[n.headerIndex].create(headerData[0]);
        //   lineDsObj[n.headerIndex].create(lineData[0]);
        // } else {
        headerDsObj[n.headerIndex].loadData(headerData);
        lineDsObj[n.headerIndex].loadData(lineData);
        // }
        if (_status === 'add') {
          headerDsObj[n.headerIndex].forEach((r) => {
            r.status = 'add';
          });
          lineDsObj[n.headerIndex].forEach((r) => {
            r.status = 'add';
          });
        }
        // 复制通过update更新fx
        // if (noFetchFlag) {
        //   headerDsObj[headerIndex].current.set({
        //     updateFx: 1,
        //   });
        // }
      });
      setAllocationData(res.cartHeaderDTOList);
    }
  }

  // 获取默认分配值
  async function getDefAlloctionValue() {
    return new Promise((resolve) => {
      const { defaultAddress, addressInfo } = getUserConfigInfo();
      const { currentAddress, currentWarehouse } = props;
      const address = isEmpty(currentAddress || defaultAddress)
        ? { regionId: addressInfo?.cityId }
        : currentAddress || defaultAddress;
      const params = addNewCareParams({
        product,
        dimensTemplates,
        currentAddress: address,
        currentWarehouse,
        supplierCompanyId,
        tmpQuantity: product.quantity || 1,
        openCartFlag: getOpenCartFlag(linkType) ? 1 : 0,
      });
      if (isEmpty(params)) {
        // 没有模版返回的空 关闭弹窗
        setVisible(false);
        return false;
      }
      // 商品分配值查询
      fetchDefAlloctionValueService(params).then((res) => {
        resolve(res);
      });
    });
  }

  // 分配默认值查询
  async function fetchDefAlloctionValue() {
    if (!isEmpty(dimensTemplates)) {
      setLoading(true);
      let defData = {};
      try {
        defData = await getDefAlloctionValue();
      } catch {
        setLoading(false);
      }
      const { headerData, lineData } = handleCartHeaderDTO(defData.cartHeaderDTOList[0]);
      setfetchData(defData);
      setDefaultData({
        headerData,
        lineData,
        cartHeaderDTOList: defData.cartHeaderDTOList,
      });
      setCustomizedProductLineList(defData?.customizedProductLineList);
      setLoading(false);
    }
  }

  // 费用分配查询
  function fetchProductAllocation() {
    if (!isEmpty(dimensTemplates)) {
      setLoading(true);
      // 商品分配值查询
      fetchProductAllocationService({
        productId,
        currencyCode,
        cartId,
        unitId: product.unitId,
        templateId,
        customFlag,
        shipperFlag,
        companyId,
        punchoutFlag,
        receiveFlag,
        itemId,
        itemCategoryId,
        manualFlag,
        linkType,
        openCartFlag: getOpenCartFlag(linkType) ? 1 : 0,
        centralizedUserType,
        centralizedHeaderNum,
        centralizedLineNum,
        centralizedFlag,
      })
        .then((res) => {
          setfetchData(res, 'query');
          setCustomizedProductLineList(res?.customizedProductLineList);
        })
        .catch(() => setVisible(false))
        .finally(() => {
          setLoading(false);
        });
    }
  }

  // 新建商品分配行
  async function handleCreateAllocation() {
    const keys = Object.keys(headerDsObj).map((n) => Number(n) || 0);
    const headerIndex = (max(keys) || 0) + 1;
    headerDsObj[headerIndex] = new DataSet(
      formDs({
        fieldList: headerEnabledDimension,
        product,
        dimensionList,
        lineDsObj,
        initialSpecialObj,
        fetchBudgetRemain: (num) =>
          fetchBudgetRemain([...allocationData, { headerIndex, _status: 'add' }], num),
      })
    );
    lineDsObj[headerIndex] = new DataSet(
      tableDs({
        fieldList: lineEnabledDimension,
        product,
        multipleFlag: manualFlag && noFetchFlag,
        dimensionList,
        headerDs: headerDsObj[headerIndex],
        initialSpecialObj,
        fetchBudgetRemain: (num) =>
          fetchBudgetRemain([...allocationData, { headerIndex, _status: 'add' }], num),
      })
    );
    let defData = defaultData || {};
    if (isEmpty(defaultData)) {
      setLoading(true);
      try {
        const res = await getDefAlloctionValue();
        const cartHeaderDTO = { ...(res.cartHeaderDTOList?.[0] || {}), headerIndex };
        const { headerData, lineData } = handleCartHeaderDTO(cartHeaderDTO);
        defData = {
          headerData,
          lineData,
          cartHeaderDTOList: res.cartHeaderDTOList,
        };
        setDefaultData(defData);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    const { headerData, lineData, cartHeaderDTOList } = defData || {};
    if (headerDsObj[headerIndex] && lineDsObj[headerIndex]) {
      headerDsObj[headerIndex].loadData(headerData.map((n) => ({ ...n, headerIndex })));
      lineDsObj[headerIndex].loadData(lineData.map((n) => ({ ...n, headerIndex })));
      setAllocationData([
        ...allocationData,
        { ...cartHeaderDTOList[0], headerIndex, _status: 'add' },
      ]);
    }
  }

  // 预算余额查询
  function fetchBudgetRemain(data, headerIndex) {
    if (punchoutFlag) return;
    const cartHeaderDTOList = handleCartHeaderDTOList(
      data.filter((n) => n.headerIndex === headerIndex)
    );
    const { priceHiddenFlag } = product || {};
    const params = {
      templateId,
      unitId: product.unitId,
      cartId,
      supplierCompanyId,
      productId,
      productSource: sourceFrom,
      tenantId: organizationId,
      ownerId: userId,
      currencyCode,
      customizedProductLineList,
      cartHeaderDTOList,
      itemId,
      itemCategoryId,
      linkType,
      priceHiddenFlag,
    };
    fetchBudgetRemainService(params).then((res) => {
      if (res) {
        (lineDsObj[headerIndex] || []).forEach((record, index) => {
          const { value } =
            res.cartHeaderDTOList?.[0]?.cartLineList[index]?.lineList?.find(
              (l) => l.dimensionCode === 'budgetBalance'
            ) || {};
          record.set('budgetBalance', value);
        });
      }
    });
  }

  // 新建表格行
  const handleCreate = useCallback(
    (headerIndex) => {
      const lineData = lineDsObj[headerIndex].toData();
      const { lineNum } = maxBy(lineData, 'lineNum');
      const defaultLineData = defaultData.lineData?.[0] || {};
      lineDsObj[headerIndex].create(
        { ...defaultLineData, headerIndex, lineNum: lineNum + 1, _status: 'add' },
        lineData.length
      );
    },
    [defaultData]
  );

  // 复制手工申请表格行
  function handleCopy(headerIndex) {
    const lineData = lineDsObj[headerIndex].toData();
    const { lineNum } = maxBy(lineData, 'lineNum');
    const copyData = lineDsObj[headerIndex].selected.map((r, index) => ({
      ...r.toData(),
      _status: 'add',
      lineNum: lineNum + index,
    }));
    lineDsObj[headerIndex].appendData(copyData);
  }

  // 删除
  function handleDelete(params) {
    const { _status } = allocationData.find((n) => n.headerIndex === params.headerIndex) || {};
    Modal.confirm({
      title: intl.get('mallf.common.view.confirmDelete').d('确定删除？'),
      onOk() {
        if (_status === 'add') {
          const newData = allocationData.filter((n) => n.headerIndex !== params.headerIndex);
          delete headerDsObj[params.headerIndex];
          delete lineDsObj[params.headerIndex];
          setAllocationData(newData);
          Message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
        } else {
          setLoading(true);
          allocationDeleteService({ ...params, templateUpdateFlag })
            .then(() => {
              Message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
              setActionFlag(true);
              fetchProductAllocation();
            })
            .finally(() => {
              setLoading(false);
            });
        }
      },
    });
  }

  // 处理需要保存的分配数据
  function handleCartHeaderDTOList(data) {
    return data.map((allocation) => {
      const { headerList = [], cartLineList = [], headerIndex, headerNum } = allocation;
      const headerData = headerDsObj[headerIndex].toData();
      const lineData = lineDsObj[headerIndex].toData();
      const headerDimension = dimensionList.filter(
        (n) => n.dimension.dimensionType.startsWith('HEADER') && n.dimension.enabledFlag
      );
      const lineDimension = dimensionList.filter(
        (n) => n.dimension.dimensionType.startsWith('LINE') && n.dimension.enabledFlag
      );
      // 维度组件赋值
      const handleComponentValue = ({
        ds,
        dimensionComponent,
        dimensionData,
        dimensionCode,
        editFlag,
      }) => {
        const { componentType, lovView } = dimensionComponent;
        if (dimensionCode === 'unitId') {
          return {
            value: dimensionData[dimensionCode],
            valueName: dimensionData.unitName,
          };
        }
        if (
          dimensionCode === 'supplierCompanyId' &&
          dimensionTemplate.templateStyle !== 'OPENCART'
        ) {
          return { value: supplierCompanyId };
        }
        if (componentType === 'LOV') {
          const { displayField, valueField } = lovView || {};
          return {
            value: dimensionData?.[`${dimensionCode}Lov`]?.[valueField],
            valueName: dimensionData?.[`${dimensionCode}Lov`]?.[displayField],
            fxBudgetFlag: dimensionData?.[`${dimensionCode}fxBudgetFlag`],
          };
        }
        const val = dimensionData[dimensionCode];
        if (componentType === 'SWITCH') {
          return {
            value: val,
            valueName:
              val === '1'
                ? intl.get('hzero.common.status.yes').d('是')
                : intl.get('hzero.common.status.no').d('否'),
            fxBudgetFlag: dimensionData?.[`${dimensionCode}fxBudgetFlag`],
          };
        }
        if (componentType === 'SELECT') {
          const valueName = ds.current.getField(dimensionCode).getText(val);
          return {
            value: val,
            valueName,
            fxBudgetFlag: dimensionData?.[`${dimensionCode}fxBudgetFlag`],
          };
        }
        return {
          value:
            priceFieldList.includes(dimensionCode) && !editFlag
              ? dimensionData[`${dimensionCode}RealValue`]
              : dimensionData[dimensionCode],
        };
      };
      const newHeaderList = headerDimension.map((h) => {
        const {
          dimension: { dimensionCode, editFlag, displayFlag, fieldBinding },
          dimensionComponent,
        } = h;
        const { dimValueId, objectVersionNumber } =
          headerList.find((n) => n.dimensionCode === dimensionCode) || {};
        return {
          ...h.dimension,
          dimValueId: showBuyNow ? null : dimValueId,
          objectVersionNumber: showBuyNow ? null : objectVersionNumber,
          headerIndex,
          headerNum,
          cartId,
          tenantId: organizationId,
          ...handleComponentValue({
            ds: headerDsObj[headerIndex],
            dimensionComponent,
            dimensionData: headerData[0],
            dimensionCode,
            editFlag,
            displayFlag,
            fieldBinding,
          }),
        };
      });
      const newCartLineList = lineData.map((l) => {
        const { lineNum } = l;
        const { lineList = [] } = cartLineList.find((c) => c.lineNum === lineNum) || {};
        const newLineList = lineDimension.map((line) => {
          const {
            dimension: { dimensionCode, editFlag, displayFlag, fieldBinding },
            dimensionComponent,
          } = line;
          const { dimValueId, objectVersionNumber } =
            lineList.find((n) => n.dimensionCode === dimensionCode) || {};
          return {
            ...line.dimension,
            headerIndex,
            headerNum,
            lineNum,
            cartId,
            dimValueId: showBuyNow ? null : dimValueId,
            objectVersionNumber: showBuyNow ? null : objectVersionNumber,
            tenantId: organizationId,
            ...handleComponentValue({
              ds: lineDsObj[headerIndex],
              dimensionComponent,
              dimensionData: l,
              dimensionCode,
              editFlag,
              displayFlag,
              fieldBinding,
            }),
          };
        });
        return {
          ...l,
          lineList: newLineList,
        };
      });
      return {
        ...allocation,
        headerIndex,
        headerNum,
        headerList: newHeaderList,
        cartLineList: newCartLineList,
      };
    });
  }

  // 立即购买
  function handleNewBuyNow(params) {
    if (getOpenCartFlag(linkType)) {
      openCartBuyNowService(params)
        .then((res) => {
          if (res) {
            const successCallBack = (resp) => {
              if (resp.success) {
                props.history.push({
                  pathname: '/req-open-cart',
                  orderData: {
                    ...resp,
                    emptyCheckedFlag: 1,
                  },
                });
              } else {
                const { errorMessage } = resp.cartList?.[0] || {};
                CuxFn({
                  name: 'NewProdutDetail-fn-buyNowErrorBack',
                  value: { res: resp },
                })(() => Swal(errorMessage))();
              }
            };

            const result = openGoToLowestSkuModal({
              res,
              onOk: () => {
                params.confirmFlag = 1;
                setLoading(true);
                openCartBuyNowService(params).then((resp) => {
                  if (resp) {
                    successCallBack(resp);
                  }
                });
              },
            });

            if (result === 'NoRule') {
              successCallBack(res);
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }
    newBuyNowService(params)
      .then((res) => {
        if (res) {
          const successJump = (resp) => {
            if (resp) {
              if (resp?.success === 1) {
                const orderData = resp.orderList.map((order) => {
                  const {
                    orderInfo,
                    orderLineList,
                    orderPriceInfo,
                    orderInvoiceInfo,
                    orderExtraInfo,
                  } = order;
                  const shoppingCartDTOList = orderLineList.map((line) => {
                    const { orderLinePrice, orderLineValue, orderLineProduct } = line;
                    const { skuSrmInfo, productAttributeDTOList } = orderLineProduct || {};
                    return {
                      ...orderLineValue,
                      ...(skuSrmInfo || {}),
                      ...orderLinePrice,
                      productAttributeDTOList,
                      // dataType: orderLineValue?.dataType,
                      // quantity: orderLineValue?.quantity,
                      // remark: orderLineValue.remark,
                    };
                  });
                  return {
                    ...(orderExtraInfo || {}),
                    ...orderInfo,
                    ...orderPriceInfo,
                    ...orderInvoiceInfo,
                    shoppingCartDTOList,
                  };
                });
                handleClose();
                const gotoBuyNow = CuxFn({
                  name: 'AllocationModal-fn-gotoNewBuyNow',
                  value: {
                    resp,
                    history: props.history,
                    orderData,
                  },
                })(() => {
                  props.history.push({
                    pathname: '/before-order',
                    data: { orderData, preData: resp.orderList },
                  });
                });

                gotoBuyNow();
              } else {
                const { errorMessage, noErrorFlag, errorCode } = resp.cartList?.[0] || {};
                // 立即购买必填为空，前端提示
                // errorCode=LOWEST_PRICE的时候不弹默认的窗口
                if (noErrorFlag === 0 && errorCode !== 'LOWEST_PRICE') {
                  Swal(errorMessage);
                }
              }
            }
          };
          const result = openGoToLowestSkuModal({
            res,
            onOk: () => {
              params.confirmFlag = 1;
              setLoading(true);
              newBuyNowService(params)
                .then((resp) => {
                  successJump(resp);
                })
                .finally(() => {
                  setLoading(false);
                });
            },
          });
          if (result === 'NoRule') {
            successJump(res);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // 保存接口成功回调
  const successCallBack = (flag, typeValue, resp) => {
    if (flag || typeValue === 'close') {
      handleClose();
      callBack();
      return;
    }
    setActionFlag(true);
    if (!resp?.cartHeaderDTOList.some((p) => p.success === 0)) {
      Message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
    }
    fetchProductAllocation();
  };

  // 手工申请加购
  function handleManual({ params, type }) {
    manualAddCartService(params)
      .then((res) => {
        if (res) {
          if (locationFrom !== 'CART') {
            Message.config({
              top: 100,
              bottom: 100,
              duration: 2.5,
            });
            Message.success(
              <span style={{ fontWeight: 600 }}>
                <span>{intl.get('mallf.common.view.successAddOpenCart').d('成功加入购物车')}</span>
                <span
                  style={{ color: getPrimaryColor(), paddingLeft: 10, cursor: 'pointer' }}
                  onClick={() => {
                    props.history.push('/cart');
                  }}
                >
                  {intl.get('mallf.common.model.goOpenCart').d('去购物车')}
                </span>
              </span>,
              undefined,
              undefined,
              'top'
            );
            handleClose();
            return;
          }
          successCallBack(noFetchFlag, type, res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // 手工申请提交
  function handleSubmit(params) {
    openCartBuyNowService(params)
      .then((res) => {
        if (res.success) {
          handleClose();
          props.history.push({
            pathname: '/req-open-cart',
            orderData: {
              ...res,
              emptyCheckedFlag: 1,
            },
          });
        } else {
          const { errorMessage } = res.cartList?.[0] || {};
          Swal(errorMessage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // 保存
  async function handleSave(type) {
    const dsList = [];
    allocationData.forEach((n) => {
      dsList.push(headerDsObj[n.headerIndex], lineDsObj[n.headerIndex]);
    });
    const vaildDsList = dsList.map((ds) => {
      // 更新ds状态为update(不然默认数据不会校验)
      ds.forEach((record) => (record.status = 'update'));
      return ds.validate();
    });
    const validRes = await Promise.all(vaildDsList);
    console.log(validRes);
    // 校验必填
    if (validRes.some((n) => !n)) {
      openValidErrorModal({ dsList });
      return;
    }
    const cartHeaderDTOList = handleCartHeaderDTOList(allocationData);
    let params = getCartParams(
      {
        templateId: templateId || dimensionTemplate.templateId,
        unitId: product.unitId || unitId,
        cartId,
        supplierCompanyId,
        productId,
        itemCode,
        productSource: manualFlag ? 'MANUAL' : sourceFrom,
        tenantId: organizationId,
        ownerId: userId,
        customizedProductLineList: noFetchFlag
          ? product.customizedProductLineList
          : customizedProductLineList,
        cartHeaderDTOList,
        punchoutFlag,
        qtHeaderNo,
        qtLineNo,
        companyId,
        receiveFlag,
        manualFlag,
        saleAgreementId,
        searchUuid,
        templateUpdateFlag,
        centralizedUserType,
      },
      { price: product.sellPrice, labelList: product.labelList }
    );
    const openCartFlag = getOpenCartFlag(linkType) ? 1 : 0;
    const beforeSaveParams = await CuxFn({
      name: 'AllocationModal-fn-beforeSaveParamsFunc',
      value: { params },
    })(() => {
      return {};
    })();
    params = { ...params, ...beforeSaveParams };
    const beforeSaveFlag = await CuxFn({
      name: 'AllocationModal-fn-beforeSaveFunc',
      value: { params, handleManual, openCartFlag, setLoading, manualFlag, product, type },
    })(() => false)();
    if (beforeSaveFlag) {
      return;
    }
    setLoading(true);
    if (type === 'submit') {
      handleSubmit(params);
      return;
    }
    if (type === 'buyNow') {
      handleNewBuyNow(params);
      return;
    }
    if (manualFlag || product.manualFlag) {
      const newParams = {
        ...params,
        cartSource: 'MANUAL',
        openCartFlag,
      };
      handleManual({ params: newParams, type });
      return;
    }
    addNewCartService(params)
      .then((res) => {
        if (res) {
          // 商详加购强弱管控
          const result = openGoToLowestSkuModal({
            res,
            params,
            onOk: () => {
              setLoading(true);
              params.confirmFlag = 1;
              addNewCartService(params).then((resp) => {
                if (resp) {
                  setLoading(false);
                  handleClose();
                  callBack();
                  successCallBack(noFetchFlag, type, resp);
                }
              });
            },
          });
          // 无管控
          if (result === 'NoRule') {
            successCallBack(noFetchFlag, type, res);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // 关闭弹窗
  function handleClose() {
    if (actionFlag) {
      callBack();
    }
    headerDsObj = {};
    lineDsObj = {};
    initialSpecialObj = {};
    setVisible(false);
  }

  // 复制费用分配
  function handleCopyAllocation(allocation) {
    const { purchaseQuantityLimit, headerIndex } = allocation;
    const keys = Object.keys(headerDsObj).map((n) => Number(n) || 0);
    const copyHeaderIndex = (max(keys) || 0) + 1;
    const { headerList, cartLineList } = handleCartHeaderDTOList([allocation])[0];
    const newHeaderList = headerList.map((head) => {
      const {
        cartId: id,
        dimValueId,
        objectVersionNumber,
        creationDate,
        createdBy,
        lastUpdateDate,
        lastUpdatedBy,
        ...other
      } = head;
      return other;
    });
    const newCartLineList = cartLineList.map((line) => {
      const newLineList = line.lineList.map((l) => {
        const {
          cartId: id,
          dimValueId,
          objectVersionNumber,
          creationDate,
          createdBy,
          lastUpdateDate,
          lastUpdatedBy,
          ...other
        } = l;
        return other;
      });
      return {
        ...line,
        lineList: newLineList,
      };
    });
    const newAllocationData = [
      ...allocationData,
      {
        ...allocation,
        headerList: newHeaderList,
        cartLineList: newCartLineList,
        headerIndex: copyHeaderIndex,
        _status: 'add',
        dataFrom: 'copy',
      },
    ];
    headerDsObj[copyHeaderIndex] = new DataSet(
      formDs({
        fieldList: headerEnabledDimension,
        product,
        dimensionList,
        lineDsObj,
        initialSpecialObj,
        fetchBudgetRemain: (num) => fetchBudgetRemain(newAllocationData, num),
      })
    );
    lineDsObj[copyHeaderIndex] = new DataSet(
      tableDs({
        multipleFlag: manualFlag && noFetchFlag,
        product,
        fieldList: lineEnabledDimension,
        purchaseQuantityLimit: showBuyNow && onCataStock ? stockNumber : purchaseQuantityLimit,
        dimensionList,
        headerDs: headerDsObj[copyHeaderIndex],
        initialSpecialObj,
        fetchBudgetRemain: (num) => fetchBudgetRemain(newAllocationData, num),
      })
    );
    const handleCopyData = (data) => {
      return data.map((n) => ({ ...n, headerIndex: copyHeaderIndex }));
    };
    headerDsObj[copyHeaderIndex].loadData(handleCopyData(headerDsObj[headerIndex].toData()));
    lineDsObj[copyHeaderIndex].loadData(handleCopyData(lineDsObj[headerIndex].toData()));
    setAllocationData(newAllocationData);
  }

  // 大分配行
  const AllocationItemRender = useMemo(() => {
    return allocationData.map((allocation, index) => {
      const allocationProps = {
        allocation,
        index,
        allocationData,
        lineDsObj,
        readOnly,
        showBuyNow,
        manualFlag,
        noCreateFlag,
        noFetchFlag,
        noAction,
        headerDsObj,
        headerDisplayDimension,
        headerEnabledDimension,
        lineDisplayDimension,
        product,
        templateId: templateId || dimensionTemplate.templateId,
        singleLineFlag,
        handleCreate,
        handleCopy,
        handleDelete,
        handleCopyAllocation,
      };
      return Math.abs(index - anchorIndex) <= 5 ? (
        <AllocationItem {...allocationProps} />
      ) : (
        <AllocationItemSkeleton index={index} />
      );
    });
  }, [allocationData, anchorIndex, defaultData]);

  // 立即购买/punchout商品/只读状态没有按钮
  function AllocationButtonRender() {
    return (
      !showBuyNow &&
      !punchoutFlag &&
      !noAction && (
        <>
          <Button
            icon="add"
            funcType="flat"
            color="primary"
            onClick={() => handleCreateAllocation()}
            style={{ marginBottom: 20, fontSize: 14 }}
          >
            {intl.get('mallf.common.button.add').d('新建')}
          </Button>
          {!noFetchFlag && !receiveFlag && (
            <PermissionButton
              type="c7n-pro"
              className="header-btn-import"
              funcType="flat"
              color="primary"
              icon="unarchive"
              style={{ marginBottom: 20, fontSize: 14 }}
              permissionList={[
                {
                  code: `mall.cart.productallocation.button.import-new`,
                  type: 'button',
                  meaning: '购物车-商品分配信息导入',
                },
              ]}
              onClick={() => {
                const modal = useModal().openModal({
                  businessObjectTemplateCode: 'SMCT.SHOPPING_CART_ALLOT',
                  refreshButton: true,
                  prefixPatch: '/smct',
                  successCallBack: () => {
                    fetchProductAllocation();
                    setActionFlag(true);
                    modal.close();
                  },
                  args: {
                    cartId,
                    templateId,
                    tenantId: organizationId,
                    companyId,
                    userId,
                  },
                });
              }}
            >
              {intl.get('hzero.common.button.import').d('导入')}
            </PermissionButton>
          )}
        </>
      )
    );
  }

  return (
    <Sidebar
      closable
      destroyOnClose
      width={1090}
      wrapClassName={style['allocation-modal']}
      title={<span title={title}>{title}</span>}
      visible={visible}
      onCancel={() => handleClose()}
      confirmLoading={loading}
      maskClosable={false}
      footer={footerRender({
        noFetchFlag,
        showBuyNow,
        manualFlag,
        templateUpdateFlag,
        loading,
        readOnly,
        locationFrom,
        handleSave,
        handleClose,
      })}
    >
      <Spin spinning={loading}>
        {!singleLineFlag && <AllocationAnchor allocationData={allocationData} />}
        {!isEmpty(allocationData) && (
          <div
            className={classnames({
              'body-allocation': true,
              'body-allocation-showBuyNow': showBuyNow,
              'body-allocation-singleLine': singleLineFlag,
            })}
          >
            {AllocationItemRender}
            {AllocationButtonRender()}
          </div>
        )}
      </Spin>
    </Sidebar>
  );
}

export default cuxComponent({ path: 'ProductAllocation/AllocationModal' })(
  withRouter(AllocationModal)
);
