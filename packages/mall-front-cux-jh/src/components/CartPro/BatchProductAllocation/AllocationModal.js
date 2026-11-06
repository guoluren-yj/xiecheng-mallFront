/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Spin, Message, Icon, Anchor } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import {
  Table,
  Form,
  DataSet,
  TextField,
  NumberField,
  Select,
  Lov,
  Button,
  DatePicker,
  Switch,
  TextArea,
  Attachment,
} from 'choerodon-ui/pro';
import { accept } from 'utils/constants';
import { observer } from 'mobx-react-lite';
import Image from 'components/Image';
import uuid from 'uuid/v4';
import { SpanTitle } from 'utils/renderer';
import { getUserConfigInfo, getPrimaryColor, priceNumberRender, convertImg } from 'utils/utils';
import intl from 'utils/intl';
import { getHeaderFixedDimension } from 'utils/addNewCart';
import {
  fetchProductAllocationService,
  batchAllocationService,
  fetchBudgetRemainService,
  batchAllocationAddService,
} from 'services/newCartService';
import { math } from 'choerodon-ui/dataset';
import ChooseUnit from 'mall-front/lib/routes/CartProCopy/ProductAllocation/ChooseUnit';
import { formDs, tableDs, childTableDataset } from './dataSet';
import style from './index.less';

const { Sidebar } = Modal;
const { Link } = Anchor;
let headerDsObj = {};
let lineDsObj = {};
let childTableDsObj = {}; // 子购物车表格DS对象集合
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

function getHeaderDisplayDimension(dimensionList) {
  const headerList = dimensionList.filter(
    (n) =>
      n.dimension.dimensionType.startsWith('HEADER') &&
      n.dimension.displayFlag &&
      n.dimension.enabledFlag
  );
  const maxRow = Math.max.apply(
    null,
    headerList.map((header) => header?.dimension?.rowSeq)
  );
  let newHeaderList = [];
  for (let row = 1; row < maxRow + 1; row++) {
    const rowList = headerList
      .filter((header) => header?.dimension?.rowSeq === row)
      .sort((a, b) => {
        const value1 = a?.dimension?.colSeq;
        const value2 = b?.dimension?.colSeq;
        return value1 - value2;
      });
    newHeaderList = [...newHeaderList, ...rowList];
  }
  return newHeaderList;
}

function AllocationModal(props) {
  const { visible, setVisible, products, dimensTemplates, fetchProduct, noAction = false } = props;
  const {
    templateId,
    productSource,
    currencySymbol,
    currencyCode,
    cartId,
    customFlag,
    qtHeaderNo,
    qtLineNo,
    receiveFlag,
    punchoutFlag,
    templateUpdateFlag,
  } = products?.[0];
  const { userId, companyId, organizationId, userConfig } = getUserConfigInfo() || {};
  const { unitId } = userConfig || {};
  const { dimensionList = [], dimensionTemplate = {} } = dimensTemplates;
  // 头展示维度
  const headerDisplayDimension = getHeaderDisplayDimension(dimensionList);
  // 行展示维度
  const lineDisplayDimension = dimensionList.filter(
    (n) =>
      n.dimension.dimensionType.startsWith('LINE') &&
      n.dimension.displayFlag &&
      n.dimension.enabledFlag
  );
  // 无自定义维度/有拆单维度/电商商品，不可手动新增行
  const noCreateFlag =
    lineDisplayDimension.some((n) => n.dimension?.splitFlag === 1) ||
    lineDisplayDimension.every((n) => n.dimension.dimensionType === 'LINE_FIXED') ||
    productSource !== 'CATA';

  const [allocationData, setAllocationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [defaultData, setDefaultData] = useState({});

  useEffect(() => {
    if (punchoutFlag) {
      fetchProductAllocation();
    } else {
      fetchDefault();
    }
  }, []);

  async function fetchDefault() {
    setLoading(true);
    const addInfoList = products.map((p) => {
      const {
        customFlag: c,
        qtHeaderNo: h,
        qtLineNo: l,
        customizedProductLineList,
        totalQuantity,
        productId,
        productName,
      } = p;

      p.goodsName = productName;
      let headerList = [];
      // 头维度
      const headerDimension =
        dimensionList.filter((n) =>
          ['HEADER_FIXED', 'HEADER_CUSTOMIZE'].includes(n.dimension.dimensionType)
        ) || [];
      const _HEADER_FIXED = getHeaderFixedDimension({
        product: p,
      });
      // 头维度数据
      headerList = headerDimension.map((n) => {
        return {
          ...n.dimension,
          headerNum: 1,
          tenantId: organizationId,
          ..._HEADER_FIXED[n.dimension.dimensionCode],
        };
      });
      // 行维度
      const cartLineList = dimensionList.filter((n) => n.dimension.dimensionCode === 'quantity');
      return {
        productId,
        customFlag: c,
        qtHeaderNo: h,
        qtLineNo: l,
        customizedProductLineList,
        cartHeaderDTOList: [
          {
            headerList,
            cartLineList: cartLineList.map((n) => {
              return {
                lineNum: 1,
                lineList: [
                  {
                    ...n.dimension,
                    tenantId: organizationId,
                    headerNum: 1,
                    lineNum: 1,
                    value: totalQuantity || 1,
                  },
                ],
              };
            }),
          },
        ],
      };
    });
    const params = {
      addInfoList,
      templateId,
      ownerId: userId,
      unitId,
      punchoutFlag,
      receiveFlag,
      templateUpdateFlag,
    };
    batchAllocationAddService(params)
      .then((res) => {
        if (res) {
          const newRes = {
            ...res,
            cartHeaderDTOList: res.cartHeaderDTOList.map((n) => ({
              ...n,
              headerIndex: n.headerIndex || n.headerNum,
            })),
          };
          const { headerData, lineData } = handleCartHeaderDTO(newRes.cartHeaderDTOList[0]);
          setfetchData(newRes);
          setDefaultData({
            headerData,
            lineData,
            cartHeaderDTOList: newRes.cartHeaderDTOList,
          });
        }
      })
      .catch(() => setVisible(false))
      .finally(() => {
        setLoading(false);
      });
  }

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
      const { componentType, lovView, defaultValue, defaultValueMeaning } = dimensionComponent;
      const { dimensionType, editFlag } = dimension;
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
      };
    });
    return { headerData, lineData };
  }

  // 费用分配查询
  function fetchProductAllocation() {
    if (!isEmpty(dimensTemplates)) {
      setLoading(true);
      // 商品分配值查询
      fetchProductAllocationService({
        companyId,
        currencyCode,
        cartId,
        customFlag,
        templateId,
        punchoutFlag,
        receiveFlag,
        productId: products?.[0].productId,
        unitId: products?.[0].unitId,
      })
        .then((res) => {
          setfetchData(res);
        })
        .catch(() => setVisible(false))
        .finally(() => {
          setLoading(false);
        });
    }
  }

  function setfetchData(res) {
    if (res) {
      const { cartHeaderDTOList } = res;
      cartHeaderDTOList.forEach((n) => {
        const {
          cartLineList = [],
          headerNum: headerIndex,
          minPackageQuantity,
          minPurchaseQuantity,
          purchaseQuantityLimit,
        } = n;
        const { value: uomPrecision } =
          cartLineList?.[0]?.lineList.find((h) => h.dimensionCode === 'uomPrecision') || {};
        const { headerData } = handleCartHeaderDTO(n) || {};
        headerDsObj[headerIndex] = new DataSet(
          formDs({
            fieldList: headerDisplayDimension,
            bindFieldList: dimensionList.filter(
              (f) =>
                f.dimension.dimensionType.startsWith('HEADER') &&
                !f.dimension.displayFlag &&
                f.dimension.fieldBinding &&
                f.dimension.enabledFlag
            ),
            dimensionList,
            lineDsObj,
            initialSpecialObj,
            fetchBudgetRemain: (num) => fetchBudgetRemain(res.cartHeaderDTOList, num),
          })
        );
        lineDsObj[headerIndex] = new DataSet(
          tableDs({
            fieldList: lineDisplayDimension,
            bindFieldList: dimensionList.filter(
              (f) =>
                f.dimension.dimensionType.startsWith('LINE') &&
                !f.dimension.displayFlag &&
                f.dimension.fieldBinding &&
                f.dimension.enabledFlag
            ),
            minPackageQuantity,
            minPurchaseQuantity,
            purchaseQuantityLimit,
            uomPrecision,
            dimensionList,
            headerDs: headerDsObj[headerIndex],
            initialSpecialObj,
            fetchBudgetRemain: (num) => fetchBudgetRemain(res.cartHeaderDTOList, num),
          })
        );
        headerDsObj[headerIndex].loadData(headerData);
        handleCreate(headerIndex);
      });
      setAllocationData(res.cartHeaderDTOList);
    }
  }

  // 可编辑组件
  function getComponent(type, extra) {
    let Component = null;
    switch (type) {
      case 'INPUT':
        Component = (prop) => {
          return <TextField {...prop} />;
        };
        break;
      case 'INPUT_NUMBER':
        Component = (prop) => <NumberField {...prop} />;
        break;
      case 'SELECT':
        Component = (prop) => <Select {...prop} />;
        break;
      case 'LOV':
        Component = (prop) => <Lov noCache {...prop} />;
        break;
      case 'DATE_PICKER':
        Component = (prop) => <DatePicker {...prop} />;
        break;
      case 'SWITCH':
        Component = (prop) => (
          <>
            <span>{prop.label}</span>
            <Switch {...prop} style={{ width: 50 }} />
          </>
        );
        break;
      case 'TEXT_AREA':
        Component = (prop) => <TextArea {...prop} rows={1} resize="both" />;
        break;
      case 'UPLOAD':
        Component = (prop) => {
          const maxSize = '5M';
          const attProps = {
            sortable: true,
            bucketName: 'private-bucket',
            bucketDirectory: 'mall-front',
            viewMode: 'list',
            style: { paddingLeft: 0 },
            accept,
            help: intl
              .get('mallf.common.view.attProps.help', { accept, maxSize })
              .d(`支持${accept.join(',')}格式，且不能大于${maxSize}`),
            fileSize: 1024 * 1024 * 5,
            showValidation: 'newLine',
            ...prop,
          };
          return (
            <>
              <Attachment {...attProps} />
            </>
          );
        };
        break;
      default:
        Component = (prop) => <TextField {...prop} />;
    }
    return (options) => Component(options, extra);
  }

  const getColumns = ({ ds }) => {
    const lineColumns = lineDisplayDimension.map((item) => {
      const { dimension, dimensionComponent } = item;
      const { dimensionCode, editFlag, width } = dimension;
      const { componentType } = dimensionComponent;
      const {
        [`${dimensionCode}fxDisplayFlag`]: fxDisplayFlag,
        [`${dimensionCode}fxEditFlag`]: fxEditFlag,
      } = ds?.data?.[0]?.data || {};
      const newEditFlag = [1, 0].includes(fxEditFlag) ? !!fxEditFlag : !!editFlag;
      if (fxDisplayFlag === 0) {
        return null;
      }
      if (['quantity', 'taxIncludedAmount'].includes(dimensionCode)) {
        return null;
      }
      if (componentType === 'SWITCH') {
        return {
          name: dimensionCode,
          width: width || 120,
          editor: () => {
            return newEditFlag && <Switch />;
          },
        };
      }
      if (componentType === 'TEXT_AREA') {
        return {
          name: dimensionCode,
          width: width || 120,
          editor: () => {
            return newEditFlag && <TextArea rows={1} />;
          },
        };
      }
      return {
        name: componentType === 'LOV' ? `${dimensionCode}Lov` : dimensionCode,
        width: width || 120,
        editor: () => {
          return newEditFlag;
        },
      };
    });
    const columns = [
      {
        name: 'orderSeq',
        width: 60,
        renderer: ({ record }) => record.index + 1,
      },
      ...lineColumns,
      {
        name: 'action',
        width: 100,
        renderer: ({ record }) => {
          const { _status, headerIndex, uuId } = record.data;
          return (
            _status === 'add' && (
              <a
                disabled={noCreateFlag || lineDsObj[headerIndex].data.length === 1}
                onClick={() => {
                  lineDsObj[headerIndex].remove(record);
                  delete childTableDsObj[uuId];
                }}
              >
                {intl.get('hzero.common.btn.cancel').d('取消')}
              </a>
            )
          );
        },
      },
    ];
    return columns.filter((n) => !!n);
  };

  // 新建商品分配行
  function handleCreateAllocation() {
    const { headerData } = defaultData;
    const headerIndex = allocationData.length + 1;
    headerDsObj[headerIndex] = new DataSet(
      formDs({
        fieldList: headerDisplayDimension,
        dimensionList,
        lineDsObj,
        bindFieldList: dimensionList.filter(
          (f) =>
            f.dimension.dimensionType.startsWith('HEADER') &&
            !f.dimension.displayFlag &&
            f.dimension.fieldBinding &&
            f.dimension.enabledFlag
        ),
        fetchBudgetRemain: (num) =>
          fetchBudgetRemain([...allocationData, { headerIndex, _status: 'add' }], num),
      })
    );
    lineDsObj[headerIndex] = new DataSet(
      tableDs({
        fieldList: lineDisplayDimension,
        dimensionList,
        headerDs: headerDsObj[headerIndex],
        bindFieldList: dimensionList.filter(
          (f) =>
            f.dimension.dimensionType.startsWith('LINE') &&
            !f.dimension.displayFlag &&
            f.dimension.fieldBinding &&
            f.dimension.enabledFlag
        ),
        fetchBudgetRemain: (num) =>
          fetchBudgetRemain([...allocationData, { headerIndex, _status: 'add' }], num),
      })
    );
    if (headerDsObj[headerIndex]) {
      headerDsObj[headerIndex].loadData(headerData.map((n) => ({ ...n, headerIndex })));
    }
    handleCreate(headerIndex);
    setAllocationData([...allocationData, { headerIndex, _status: 'add' }]);
  }

  function handleHeaderDTOList(data) {
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
        displayFlag,
        fieldBinding,
      }) => {
        const { componentType, lovView } = dimensionComponent;
        if (dimensionCode === 'unitId') {
          return {
            value: dimensionData[dimensionCode],
            valueName: dimensionData.unitName,
          };
        }
        if (dimensionCode === 'taxIncludedAmount') {
          return {
            value: 1,
          };
        }
        if (dimensionCode === 'quantity') {
          return {
            value: 1,
          };
        }
        if (componentType === 'LOV') {
          const { displayField, valueField } = lovView || {};
          return {
            value: dimensionData?.[`${dimensionCode}Lov`]?.[valueField],
            valueName: dimensionData?.[`${dimensionCode}Lov`]?.[displayField],
            fxBudgetFlag: dimensionData?.[`${dimensionCode}fxBudgetFlag`],
          };
        }
        const val =
          editFlag || !displayFlag || fieldBinding
            ? dimensionData[dimensionCode]
            : dimensionData[`${dimensionCode}RealValue`];
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
          value: val,
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
          dimValueId,
          objectVersionNumber,
          headerIndex,
          headerNum,
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
            dimValueId,
            objectVersionNumber,
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

  // 预算余额查询
  function fetchBudgetRemain(data, headerIndex) {
    if (punchoutFlag) return;
    const cartHeaderDTOList = handleHeaderDTOList(
      data.filter((n) => n.headerIndex === headerIndex)
    );
    const params = {
      templateId,
      unitId,
      tenantId: organizationId,
      ownerId: userId,
      currencyCode,
      cartHeaderDTOList,
    };
    fetchBudgetRemainService(params).then((res) => {
      if (res && res.cartHeaderDTOList[0]) {
        (lineDsObj[headerIndex] || []).forEach((record, index) => {
          const { value } =
            res.cartHeaderDTOList[0].cartLineList[index].lineList.find(
              (l) => l.dimensionCode === 'budgetBalance'
            ) || {};
          record.set('budgetBalance', value);
        });
      }
    });
  }

  // 新建表格行
  function handleCreate(headerIndex) {
    const lineData = lineDsObj[headerIndex].toData();
    const uuId = uuid();
    childTableDsObj[uuId] = new DataSet(childTableDataset(products));
    childTableDsObj[uuId].loadData(
      products.map((n) => ({
        ...n,
        uuId,
        quantity: n.totalQuantity,
      }))
    );
    lineDsObj[headerIndex].create(
      {
        ...(defaultData.lineData || {}),
        headerIndex,
        lineNum: lineData.length + 1,
        _status: 'add',
        uuId,
        expand: true,
      },
      lineData.length
    );
    headerDsObj[headerIndex].current.set({
      ouIdfxDisplayFlag: 1,
    });
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
        }
      },
    });
  }

  // 保存
  async function handleSave() {
    const vaildDsList = [
      ...Object.values(headerDsObj),
      ...Object.values(lineDsObj),
      ...Object.values(childTableDsObj),
    ].map((ds) => {
      // 更新ds状态为update(不然默认数据不会校验)
      ds.forEach((record) => (record.status = 'update'));
      return ds.validate();
    });
    const validRes = await Promise.all(vaildDsList);
    console.log(validRes);
    // 校验必填
    if (validRes.some((n) => !n)) return;

    const handleCartHeaderDTOList = (productId) => {
      return allocationData.map((allocation) => {
        const { headerList = [], cartLineList = [], headerIndex } = allocation;
        const headerData = headerDsObj[headerIndex].toData();

        const lineData = lineDsObj[headerIndex].toData();
        const headerDimension = dimensionList.filter(
          (n) => n.dimension.dimensionType.startsWith('HEADER') && n.dimension.enabledFlag
        );
        const lineDimension = dimensionList.filter(
          (n) => n.dimension.dimensionType.startsWith('LINE') && n.dimension.enabledFlag
        );
        // 维度组件赋值
        const handleComponentValue = ({ ds, dimensionComponent, dimensionData, dimensionCode }) => {
          const { componentType, lovView } = dimensionComponent;
          if (dimensionCode === 'unitId') {
            return {
              value: dimensionData[dimensionCode],
              valueName: dimensionData.unitName,
            };
          }
          if (dimensionCode === 'quantity') {
            const {
              data: { quantity },
            } = childTableDsObj[dimensionData.uuId].data.find(
              (n) => n.data.productId === productId
            ) || { data: {} };
            return { value: quantity };
          }
          if (componentType === 'LOV') {
            const { displayField, valueField } = lovView || {};
            return {
              value:
                dimensionData?.[`${dimensionCode}Lov`]?.[valueField] ||
                dimensionData?.[dimensionCode],
              valueName: dimensionData?.[`${dimensionCode}Lov`]?.[displayField],
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
              fxBudgetFlag: dimensionData[`${dimensionCode}fxBudgetFlag`],
            };
          }
          if (componentType === 'SELECT') {
            const valueName = ds.current.getField(dimensionCode).getText(val);
            return {
              value: val,
              valueName,
              fxBudgetFlag: dimensionData[`${dimensionCode}fxBudgetFlag`],
            };
          }
          return {
            value: val,
          };
        };
        const newHeaderList = headerDimension.map((h) => {
          const {
            dimension: { dimensionCode, editFlag, displayFlag },
            dimensionComponent,
          } = h;
          const { componentType } = dimensionComponent || {};
          const { dimValueId, objectVersionNumber } =
            headerList.find((n) => n.dimensionCode === dimensionCode) || {};
          return {
            ...h.dimension,
            componentType,
            dimValueId: punchoutFlag ? null : dimValueId,
            objectVersionNumber,
            headerIndex,
            tenantId: organizationId,
            ...handleComponentValue({
              ds: headerDsObj[headerIndex],
              dimensionComponent,
              dimensionData: headerData[0],
              dimensionCode,
              editFlag,
              displayFlag,
            }),
          };
        });
        const newCartLineList = lineData.map((l) => {
          const { lineNum } = l;
          const { lineList = [] } = cartLineList.find((c) => c.lineNum === lineNum) || {};
          const newLineList = lineDimension.map((line) => {
            const {
              dimension: { dimensionCode, editFlag, displayFlag },
              dimensionComponent,
            } = line;
            const { componentType } = dimensionComponent || {};
            const { dimValueId, objectVersionNumber } =
              lineList.find((n) => n.dimensionCode === dimensionCode) || {};
            return {
              ...line.dimension,
              componentType,
              headerIndex,
              lineNum,
              dimValueId: punchoutFlag ? null : dimValueId,
              objectVersionNumber,
              tenantId: organizationId,
              ...handleComponentValue({
                ds: lineDsObj[headerIndex],
                dimensionComponent,
                dimensionData: l,
                dimensionCode,
                editFlag,
                displayFlag,
              }),
            };
          });
          return {
            ...l,
            lineList: newLineList,
          };
        });
        return {
          headerList: newHeaderList,
          cartLineList: newCartLineList,
        };
      });
    };

    const allocationProductList = products.map((product) => {
      const { productId } = product;
      return {
        ...product,
        cartHeaderDTOList: handleCartHeaderDTOList(productId),
      };
    });
    const params = {
      templateId,
      unitId,
      tenantId: organizationId,
      ownerId: userId,
      receiveFlag,
      punchoutFlag,
      qtHeaderNo,
      companyId,
      allocationProductList,
    };
    setLoading(true);
    batchAllocationService(params)
      .then((res) => {
        if (res) {
          Message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
          setVisible(false);
          fetchProduct();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // 关闭弹窗
  function handleClose() {
    headerDsObj = {};
    lineDsObj = {};
    childTableDsObj = {};
    initialSpecialObj = {};
    setVisible(false);
  }

  // 费用分配组
  function allocationItemRender(allocation, index) {
    const { headerIndex, _status, success, errorMsg } = allocation;
    const noDeleteFlag = allocationData.filter((n) => n._status !== 'add')?.length === 1;
    // 新建表格行
    const AddButton = (
      <Button
        funcType="flat"
        icon="playlist_add"
        size="small"
        onClick={() => handleCreate(headerIndex)}
        style={{ color: getPrimaryColor() }}
      >
        {intl.get(`mallf.common.button.addLine`).d('新建行')}
      </Button>
    );
    const expandedRowRender = ({ record: partentRecord }, uuId) => {
      const childColumns = [
        {
          name: 'productInfo',
          width: 290,
          className: 'product-info',
          renderer: ({ record }) => {
            const { productName, imagePath } = record.data;
            return (
              <div className="product-info">
                <div className="goods-img">
                  <Image
                    value={convertImg(imagePath, 1, record.get('productSource'))}
                    width={41}
                    height={41}
                  />
                </div>
                <div className="goods-product-name text-overflow">
                  <div title={productName} className="goods-name">
                    {productName}
                  </div>
                </div>
              </div>
            );
          },
        },
        {
          name: 'taxIncludedPrice',
          width: 150,
          align: 'right',
          renderer: ({ record }) => {
            const { taxIncludedPrice, uomName, taxIncludedPriceMeaning } = record.toData();
            return (
              <>
                {currencySymbol || ''}
                {taxIncludedPriceMeaning || taxIncludedPrice}
                {uomName ? `/${uomName}` : ''}
              </>
            );
          },
        },
        {
          name: 'quantity',
          width: 180,
          editor: () => !qtLineNo,
        },
        {
          name: 'totalPrice',
          width: 150,
          align: 'right',
          renderer: ({ record }) => {
            const { taxIncludedPrice, quantity, financialPrecision } = record.toData();
            return (
              <p
                className="price-color text-overflow"
                style={{ maxWidth: 300, textAlign: 'right', margin: 0 }}
              >
                {currencySymbol}
                <SpanTitle>
                  {priceNumberRender(
                    math.multipliedBy(taxIncludedPrice, quantity),
                    financialPrecision
                  )}
                </SpanTitle>
              </p>
            );
          },
        },
      ];
      return (
        <Table
          parityRow={false}
          dataSet={
            isEmpty(partentRecord)
              ? childTableDsObj[uuId]
              : childTableDsObj[partentRecord.get('uuId') || Object.keys(childTableDsObj)[0]]
          }
          columns={childColumns}
        />
      );
    };
    const HeaderForm = observer(({ ds }) => {
      return (
        <Form dataSet={ds} labelLayout="float" columns={3}>
          {headerDisplayDimension.map((header) => {
            const { dimension, dimensionComponent } = header;
            const { dimensionCode, dimensionName, editFlag } = dimension;
            const { componentType } = dimensionComponent;
            // let onChangeProps = {};
            const fxDisplayFlag = ds?.current.data[`${dimensionCode}fxDisplayFlag`];
            if (fxDisplayFlag === 0) {
              return null;
            }
            // if (dimensionCode === 'addressId') {
            //   onChangeProps = {
            //     onChange: (record) => handleAddressChange(record, headerIndex),
            //   };
            // }
            if (dimensionCode === 'unitId') {
              return (
                <ChooseUnit
                  headerDimension={headerDisplayDimension}
                  dimension={dimension}
                  dataSet={headerDsObj[headerIndex]}
                />
              );
            } else {
              return (
                <div className="header-component">
                  {getComponent(componentType)({
                    name: componentType === 'LOV' ? `${dimensionCode}Lov` : `${dimensionCode}`,
                    label: dimensionName,
                    type: componentType,
                    disabled: !editFlag,
                    // ...onChangeProps,
                    style: {
                      width: '100%',
                    },
                  })}
                </div>
              );
            }
          })}
        </Form>
      );
    });
    const LineTable = observer(({ ds }) => {
      return (
        <Table
          parityRow={false}
          dataSet={ds}
          columns={getColumns({ ds })}
          buttons={noCreateFlag ? [] : [AddButton]}
          expandedRowRenderer={expandedRowRender}
          customizedCode="MALL.NEWCART.BATCH.ALLOCATION.TABLE"
        />
      );
    });
    return (
      <div
        id={index}
        className={`aollocation-item ${success === 0 ? 'aollocation-item-error' : ''}`}
      >
        <div className="item-title">
          <div className="item-title-left">
            {success === 0 ? errorMsg : <>{index + 1 < 10 ? `0${index + 1}` : index + 1}</>}
          </div>
          <div className="item-title-right">
            {/* 仅有一条时不允许删除 */}
            {((noDeleteFlag && _status === 'add') || !noDeleteFlag) && !noAction && (
              <Button
                icon="delete"
                funcType="flat"
                color="primary"
                onClick={() => handleDelete({ deleteType: 'head', headerIndex })}
              >
                {intl.get('hzero.common.btn.delete').d('删除')}
              </Button>
            )}
          </div>
        </div>
        <div className="item-header">
          <HeaderForm ds={headerDsObj[headerIndex]} />
        </div>
        <div className="item-line">
          <LineTable ds={lineDsObj[headerIndex]} />
        </div>
      </div>
    );
  }

  function footerRender() {
    return [
      <Button style={{ height: 32 }} loading={loading} onClick={() => handleSave()} color="primary">
        {intl.get('mallf.common.button.save').d('保存')}
      </Button>,
      <Button style={{ height: 32 }} onClick={() => handleClose()}>
        {intl.get('hzero.common.button.close').d('关闭')}
      </Button>,
    ];
  }

  const allocationItem = useMemo(() => {
    return allocationData.map((allocation, index) => {
      return allocationItemRender(allocation, index);
    });
  }, [allocationData]);

  return (
    <Sidebar
      closable
      destroyOnClose
      wrapClassName={style['allocation-modal']}
      title={dimensionTemplate?.templateName}
      visible={visible}
      onCancel={() => handleClose()}
      confirmLoading={loading}
      maskClosable={false}
      footer={footerRender()}
      width={1090}
    >
      <Spin spinning={loading}>
        <div className="header-product-name">
          <div style={{ flex: 1 }}>
            <div className="batch-warn">
              <Icon type="error" size={13} style={{ marginRight: '6px' }} />
              {intl
                .get('mallf.common.view.allocationBatchWarn')
                .d('当前批量操作将会覆盖以下商品原有的分配信息，请谨慎操作。')}
            </div>
            {!isEmpty(allocationData) && (
              <div className="allocation-anchor">
                <Anchor
                  targetOffset={window.innerHeight / 2 - 100}
                  getContainer={() => document.querySelector('.c7n-modal-body')}
                >
                  {allocationData.map((allocation, index) => {
                    return (
                      <Link
                        className="anchor-item"
                        title={`${index + 1 < 10 ? `0${index + 1}` : index + 1}`}
                        href={`#${index}`}
                      />
                    );
                  })}
                </Anchor>
              </div>
            )}
          </div>
        </div>
        <div className={`body-allocation ${isEmpty(allocationData) ? 'header-no-anchor' : ''}`}>
          {allocationItem}
          {!noAction && !punchoutFlag && (
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
            </>
          )}
        </div>
      </Spin>
    </Sidebar>
  );
}

export default AllocationModal;
