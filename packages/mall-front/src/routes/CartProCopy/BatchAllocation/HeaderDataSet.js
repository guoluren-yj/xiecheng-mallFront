/* eslint-disable no-param-reassign */
import { DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { toJS } from 'mobx';

import { getUserConfigInfo } from 'utils/utils';
import { getHeaderFixedDimension } from 'utils/addNewCart';
import intl from 'utils/intl';
import { openValidErrorModal } from 'utils/modals';
import swalAlert from 'components/swal';
import moment from 'moment';
import { statementToJs, innerFunctionMap } from 'srm-front-scuz/lib/utils/index';
import CuxFn from 'cuxTools/cuxFn';
import {
  batchAllocationAddService,
  saveBatchAllocationService,
  saveBatchManulAllocationService,
  batchManulAllocationAddService,
} from 'services/newCartService';
import {
  getDimensionCode,
  handleLovCascadeList,
  handleAssociatField,
} from '../ProductAllocation/func';
import {
  handleConditionExpression,
  evalConditionExpression,
  getFxFlag,
} from '../ProductAllocation/dataSet';

export default class HeaderDataSet extends DataSet {
  constructor(props, headerProps) {
    super(props);
    const { products, templateId } = headerProps || {};
    const {
      templateId: oldTemplateId,
      punchoutFlag,
      receiveFlag,
      templateUpdateFlag,
      centralizedFlag,
    } = products?.[0] || {};
    const { userId, unitId } = getUserConfigInfo();
    this.headerProps = headerProps;
    this.batchFetchParams = {
      templateId,
      ownerId: userId,
      unitId,
      punchoutFlag,
      receiveFlag,
      templateUpdateFlag,
      centralizedFlag,
    };
    this.oldTemplateId = oldTemplateId;
    this.priceFieldList = [
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
  }

  /**
   * 获取新增商品参数
   * @param {*} products 新增商品
   * @param {*} defaultFlag 是否默认新增，默认传右上角组织值，非默认传当前分配块头维度值
   * @returns { addInfoList }
   */
  // 获取商品维度参数
  getAddInfoListParams(products, defaultFlag) {
    const { dimensionList } = this.headerProps;
    const { organizationId } = getUserConfigInfo() || {};
    const addInfoList = products.map((p) => {
      const cartOrPrdtId = this.hasManulFlag ? 'cartId' : 'productId';
      const {
        customFlag,
        qtHeaderNo,
        qtLineNo,
        customizedProductLineList,
        totalQuantity,
        [cartOrPrdtId]: id,
        productName,
        centralizedTemplateId,
        cartId,
      } = p;
      p.goodsName = productName;
      let headerList = [];
      // 默认新增，取右上角组织值
      if (defaultFlag) {
        // 头维度
        const headerDimension =
          dimensionList.filter((n) =>
            ['HEADER_FIXED', 'HEADER_CUSTOMIZE'].includes(n.dimension.dimensionType)
          ) || [];
        const _HEADER_FIXED = getHeaderFixedDimension({
          product: { ...p, supplierCompanyId: this.hasManulFlag ? null : p.supplierCompanyId },
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
      } else {
        // 取当前分配块(addProductRecord)的头维度值
        const addProductRecord = this.getState('addProductRecord');
        const { headerList: list } = this.handleCartHeaderDTOList([addProductRecord])?.[0] || {};
        headerList = list.filter((n) => {
          const { dimensionType, productDimensionFlag, dimensionCode } = n || {};
          // 头固定维||价格维度||过滤供应商/库房维度
          return (
            (dimensionType === 'HEADER_FIXED' || productDimensionFlag === 1) &&
            !['supplierCompanyId', 'warehouseId'].includes(dimensionCode)
          );
        });
      }

      // 行维度
      const cartLineList = dimensionList.filter((n) => n.dimension.dimensionCode === 'quantity');
      // 手工行维度（手工商品额外参数）
      const manulLineList = [
        'goodsName',
        'taxIncludedPrice',
        'taxIncludedAmount',
        'uomPrecision',
      ].map((i) => {
        const { dimension = {} } = dimensionList.find((n) => n.dimension.dimensionCode === i) || {};
        return {
          ...dimension,
          tenantId: organizationId,
          headerNum: 1,
          lineNum: 1,
          value: p[i],
        };
      });
      return {
        cartId: centralizedTemplateId ? cartId : null, // 拼单批量需要传cartId和productId
        [cartOrPrdtId]: id,
        customFlag,
        qtHeaderNo,
        qtLineNo,
        centralizedTemplateId, // 拼单批量
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
                  ...(this.hasManulFlag ? manulLineList : []),
                ],
              };
            }),
          },
        ],
      };
    });
    return {
      addInfoList,
    };
  }

  // 配量分配查询
  async batchFetch(params = {}) {
    this.status = 'loading';
    let res = {};
    try {
      const param = {
        ...this.batchFetchParams,
        ...params,
      };
      res = this.hasManulFlag
        ? await batchManulAllocationAddService(param)
        : await batchAllocationAddService(param);
    } catch {
      this.status = 'ready';
    }
    if (params.defaultFlag) {
      this.defaultData = res.cartHeaderDTOList || [];
    }
    this.loadHeaderData(res.cartHeaderDTOList);
    this.status = 'ready';
  }

  // 维度组件赋值
  handleComponentValue({
    dimensionComList,
    dimensionData,
    dimensionCode,
    valueName,
    value,
    fxDisplayFlag,
    fxEditFlag,
    fxNecessaryFlag,
    fxBudgetFlag,
  }) {
    const { priceFieldList } = this;
    const { dimensionComponent = {}, dimension = {} } =
      dimensionComList.find((h) => h.dimension.dimensionCode === dimensionCode) || {};
    const { componentType, lovView, defaultValue, defaultValueMeaning } = dimensionComponent;
    const { editFlag } = dimension;
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
    } else if (priceFieldList.includes(dimensionCode) && !editFlag) {
      // 针对价格展示(如1,000)
      dimensionData[`${dimensionCode}RealValue`] = newValue;
      dimensionData[dimensionCode] = newName || newValue;
    } else {
      dimensionData[dimensionCode] = newValue;
    }
    dimensionData[`${dimensionCode}fxDisplayFlag`] = fxDisplayFlag;
    dimensionData[`${dimensionCode}fxEditFlag`] = fxEditFlag;
    dimensionData[`${dimensionCode}fxNecessaryFlag`] = fxNecessaryFlag;
    dimensionData[`${dimensionCode}fxBudgetFlag`] = fxBudgetFlag;
  }

  // 处理ds数据成接口需要的数据
  handleCartHeaderDTOList(records) {
    const { dimensionList } = this.headerProps;
    const { priceFieldList } = this;
    const newRecords = records || this.records || [];
    return newRecords.map((record) => {
      const headerDimension = dimensionList.filter(
        (n) => n.dimension.dimensionType.startsWith('HEADER') && n.dimension.enabledFlag
      );
      const lineDimension = dimensionList.filter(
        (n) => n.dimension.dimensionType.startsWith('LINE') && n.dimension.enabledFlag
      );
      // 转换组件值
      const switchComponentValue = ({
        currentRecord,
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
        // if (dimensionCode === 'supplierCompanyId') {
        //   return { value: supplierCompanyId };
        // }
        if (componentType === 'LOV') {
          const { displayField, valueField } = lovView || {};
          return {
            value: dimensionData?.[`${dimensionCode}Lov`]?.[valueField],
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
          };
        }
        if (componentType === 'SELECT') {
          const valueName = currentRecord.getField(dimensionCode).getText(val);
          return {
            value: val,
            valueName,
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
        return {
          ...h.dimension,
          ...switchComponentValue({
            currentRecord: record,
            dimensionComponent,
            dimensionData: record.toData(),
            dimensionCode,
            editFlag,
            displayFlag,
            fieldBinding,
          }),
        };
      });
      const newCartLineList = (record.lineDs.toData() || []).map((l, index) => {
        const { lineNum } = l;
        // const batchProductList = record.lineDs.get(index).childrenDs.toData();
        const batchProductList = CuxFn({
          name: 'BatchAllocation-fn-getBatchProductList',
          value: { data: record.lineDs.get(index) },
        })(() => record.lineDs.get(index).childrenDs.toData())();
        const newLineList = lineDimension.map((line) => {
          const {
            dimension: { dimensionCode, editFlag, displayFlag, fieldBinding },
            dimensionComponent,
          } = line;
          return {
            ...line.dimension,
            lineNum,
            ...switchComponentValue({
              currentRecord: record.lineDs.current,
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
          batchProductList,
          lineList: newLineList,
        };
      });
      return {
        cartHeaderValue: record.get('cartHeaderValue'),
        headerGroupKey: record.get('headerGroupKey'),
        headerList: newHeaderList,
        cartLineList: newCartLineList,
      };
    });
  }

  // 处理查询出来的数据能给ds加载
  handleFetchData(data = []) {
    const { dimensionList } = this.headerProps;
    const newData = data.map((n) => {
      const {
        headerList = [],
        cartLineList = [],
        headerIndex,
        headerNum,
        minPackageQuantity,
        minPurchaseQuantity,
        purchaseQuantityLimit,
        headerGroupKey,
        cartHeaderValue,
      } = n;
      const { totalCqNum } = cartLineList?.[0] || {}; // 定制品数量
      const headerData = { headerGroupKey, cartHeaderValue };
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
        this.handleComponentValue({
          dimensionComList: dimensionList.filter(
            (m) => m.dimension.dimensionType.startsWith('HEADER') && m.dimension.enabledFlag
          ),
          dimensionData: headerData,
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
        const { lineList, lineNum, batchProductList, lineGroupKey, cartLineValue } = line;
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
          this.handleComponentValue({
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
          cartLineValue,
          lineGroupKey,
          batchProductList,
          headerIndex,
          headerNum,
          lineNum,
          minPackageQuantity,
          minPurchaseQuantity,
          purchaseQuantityLimit,
          totalCqNum,
        };
      });
      return { ...headerData, lineData };
    });
    return newData;
  }

  // 加载头ds数据
  loadHeaderData(data) {
    const newData = this.handleFetchData(data);
    this.loadData(newData);
  }

  // 加载行ds数据
  loadLineData(record) {
    const { hasManulFlag } = this;
    const lineData = record.get('lineData');
    record.lineDs.loadData(toJS(lineData));
    record.lineDs.initChildrenDs(hasManulFlag);
  }

  // 新增大分配行
  addAllocation() {
    const createData = this.handleFetchData(this.defaultData);
    this.appendData(createData);
  }

  // 删除大分配行
  deleteAlloction(record) {
    this.remove(record, true);
  }

  // 复制大分配行
  copyAllocation(record) {
    const headerData = record.toData();
    const lineData = record.lineDs.map((line) => {
      const batchProductList = line.childrenDs.toData();
      return {
        ...line.toData(),
        batchProductList,
      };
    });
    this.appendData([{ ...headerData, lineData }]);
  }

  // 保存批量分配
  async saveBatchAlloction({ history }) {
    const cartHeaderDTOList = this.handleCartHeaderDTOList();
    const dsList = [this];
    this.records.forEach((record) => {
      dsList.push(record.lineDs);
      record.lineDs.records.forEach((line) => {
        // dsList.push(line.childrenDs);
        CuxFn({
          name: 'BatchAllocation-fn-handleDsList',
          value: { dsList, line },
        })(() => dsList.push(line.childrenDs))();
      });
    });
    const vaildDsList = dsList.map((ds) => {
      return ds.validate();
    });
    const validRes = await Promise.all(vaildDsList);
    console.log(validRes);
    // 校验必填
    if (validRes.some((n) => !n)) {
      openValidErrorModal({ dsList });
      return false;
    }
    this.status = 'loading';
    let checkExectFlag = true;
    const { companyId } = getUserConfigInfo();
    const param = {
      ...this.batchFetchParams,
      templateId: this.oldTemplateId,
      cartHeaderDTOList,
      companyId,
    };

    // const res = this.hasManulFlag
    //   ? await saveBatchManulAllocationService(param)
    //   : await saveBatchAllocationService(param);
    // if (res.success === 0) {
    //   swalAlert(res.message);
    // }
    // this.status = 'ready';

    // cuxSave 处理数据传给二开接口，直接进行保存+下一步
    await CuxFn({
      name: 'BatchAllocation-fn-handleSaveAllocationAndNext',
      value: { _this: this, param, saveBatchAllocationService, history },
    })(async () => {
      try {
        const res = this.hasManulFlag
          ? await saveBatchManulAllocationService(param)
          : await saveBatchAllocationService(param);
        if (res.success === 0) {
          swalAlert(res.message);
        }
        this.status = 'ready';
      } catch (err) {
        this.status = 'ready';
        checkExectFlag = false;
        return false;
      } finally {
        if (checkExectFlag) {
          this.headerProps.fetchProduct();
        }
      }
    })();
  }

  update({ record, name, value, oldValue }) {
    const { dimensionList } = this.headerProps;
    const { lineDs } = record;
    const { dimension = {}, dimensionComponent = {}, dimensionFieldRelationList = [] } =
      dimensionList.find((n) => name === getDimensionCode(n)) || {};

    // 值集入参改变清空值集
    if (!name.includes('fx')) {
      // 值集参数关联的字段集合
      const cascadeList = handleLovCascadeList({
        dimension,
        dimensionComponent,
        value,
        oldValue,
        dimensionList,
        name,
      });
      cascadeList.forEach((c) => {
        // 头关联头
        if (c.dimension.dimensionType.startsWith('HEAD')) {
          record.set(`${c.dimension?.dimensionCode}Lov`, null);
        } else {
          lineDs.forEach((lineReocrd) => {
            lineReocrd.set(`${c.dimension?.dimensionCode}Lov`, null);
          });
        }
      });
    }

    // 动态默认值
    dimensionList
      .filter(
        (n) =>
          n.defaultCondition ||
          n.formulaConditionFx ||
          (n.formulaCondition && name === 'conditionExpressionFlag')
      ) // defaultCondition固定fx默认值 formulaConditionFx公式fx默认值
      .forEach((field) => {
        const {
          defaultCondition,
          formulaConditionFx,
          formulaCondition: fieldFormulaCondition,
        } = field;
        const {
          conditionHeader = {},
          conditionLineList = [],
          dimDefaultConditionList,
          dimFormulaConditionList,
        } =
          defaultCondition ||
          formulaConditionFx ||
          (name === 'conditionExpressionFlag' ? fieldFormulaCondition : null) ||
          {};
        const dimConditionList = dimDefaultConditionList || dimFormulaConditionList || [];
        const {
          dimension: { dimensionType, dimensionCode: code },
          dimensionComponent: {
            componentType: type,
            lovView = {},
            defaultValue,
            defaultValueMeaning,
            defaultType,
          },
        } = dimensionList.find((n) => conditionHeader.dimensionId === n.dimension.dimensionId) || {
          dimension: {},
          dimensionComponent: {},
        };
        const { valueField, displayField } = lovView || {};
        const conditionExpressionObj = handleConditionExpression({
          record,
          dimensionList,
          conditionLineList,
        });
        // 表达式是否包含改动的字段
        const includesExpressFieldFlag = conditionLineList.map(
          (n) =>
            // 过滤fx更新，避免污染
            (!name.includes('fx') && dimension.dimensionCode === n.dimensionCode) ||
            name === 'conditionExpressionFlag'
        );
        if (includesExpressFieldFlag.every((n) => !n) && name !== 'conditionExpressionFlag') return;
        const newDimDefaultConditionList = dimConditionList.map((dimDefault) => {
          const { conditionExpression } = dimDefault;
          return evalConditionExpression({
            conditionExpression,
            conditionLineList,
            conditionExpressionObj,
          });
        });
        // 找出第一个符合条件的表达式
        const firstIndex = newDimDefaultConditionList.findIndex((n) => !!n);
        const getDimensionCodeFromId = (dimId) => {
          const {
            dimension: { dimensionCode: dimCode, dimensionType: dimType },
          } = dimensionList.find((n) => dimId === n.dimension.dimensionId) || {
            dimension: {},
          };
          return {
            dimensionCode: dimCode,
            dimensionType: dimType,
          };
        };
        const getDimValue = (targetObj) => {
          if (isEmpty(targetObj)) {
            return {};
          }
          const { formulaCondition } = targetObj;
          const resultObj = Object.assign({}, targetObj);
          if (formulaCondition) {
            const {
              conditionHeader: formulConditionHeader,
              conditionLineList: formulaConditionLineList = [],
            } = formulaCondition || {};
            // 组合成个性化字符串
            let defStr = formulaConditionLineList
              .map((l) =>
                l.targetType === 'FIXED'
                  ? `DEF ${l.paramCode} SPEC DATE ${l.targetValue};`
                  : `DEF ${l.paramCode} UNIT ${
                      getDimensionCodeFromId(l.targetDimensionId).dimensionType?.startsWith('LINE')
                        ? 'LINE'
                        : 'HEAD'
                    } ${getDimensionCodeFromId(l.targetDimensionId).dimensionCode};`
              )
              .join('');
            defStr += `RES ${formulConditionHeader.conditionExpression};`;
            const cacheData = {
              HEAD: {
                getValue: (valueCode) => record.get(valueCode)?.toString(),
              },
              LINE: {
                getValue: (valueCode, rawKey) => lineDs.get(rawKey).get(valueCode)?.toString(),
              },
            };
            try {
              // 调用公式计算并设置值
              // eslint-disable-next-line no-new-func
              resultObj.value = new Function(
                'cache, innerFunctionMap, moment',
                statementToJs(defStr).join('\r\n')
              )(cacheData, innerFunctionMap, moment);
            } catch (error) {
              resultObj.value = null;
            }
          }
          return resultObj;
        };
        const { value: fxDefaValue, valueName: fxDefaValueName } = getDimValue(
          dimConditionList?.[firstIndex]
        );
        let newValue;
        let newCode;
        let componentDefaultValue = defaultValue;
        // 判断公式默认值
        if (defaultType === 'FORMULA') {
          const { value: formulaValue } = getDimValue({ formulaCondition: fieldFormulaCondition });
          componentDefaultValue = formulaValue;
        }
        // fx默认值优先级 > 默认值
        switch (type) {
          case 'LOV':
            newCode = `${code}Lov`;
            newValue =
              firstIndex >= 0 || componentDefaultValue
                ? {
                    [valueField]: fxDefaValue || componentDefaultValue,
                    [displayField]: fxDefaValueName || defaultValueMeaning,
                  }
                : null;
            break;
          default:
            newCode = code;
            newValue =
              firstIndex >= 0 || componentDefaultValue
                ? fxDefaValue || componentDefaultValue
                : null;
            break;
        }
        const getNewValue = (index = 0) =>
          typeof newValue === 'function' ? newValue(index) : newValue;
        if (dimensionType.startsWith('LINE')) {
          if (name === 'conditionExpressionFlag') {
            // 新建行只需给新建的赋值、
            const maxKey = lineDs.length - 1;
            lineDs.get(maxKey).set(`${code}fxDefaultValue`, getNewValue(maxKey));
            lineDs.get(maxKey).set(newCode, getNewValue(maxKey));
          } else {
            lineDs.forEach((r, i) => {
              r.set(`${code}fxDefaultValue`, getNewValue(i));
              r.set(newCode, getNewValue(i));
            });
          }
        } else {
          record.set(newCode, getNewValue());
        }
      });

    // 值集关联字段
    if (name.includes('Lov') && !isEmpty(dimensionFieldRelationList)) {
      handleAssociatField({
        currentDimensiontype: dimension.dimensionType,
        dimensionList,
        record,
        dimensionFieldRelationList,
        currentData: value,
        lineDs,
      });
    }

    // 公司带出业务实体库存组织
    if (name === 'companyIdLov') {
      const { ouId, ouName, organizationId, organizationName, addressId, fullAddress } =
        value || {};
      record.set(
        'addressIdLov',
        addressId
          ? {
              ...value,
              addressId,
              fullAddress,
            }
          : null
      );
      record.set(
        'ouIdLov',
        ouId
          ? {
              ...value,
              ouId,
              ouName,
              organizationId,
              organizationName,
            }
          : null
      );
    }
    // 业务实体带出库存组织
    if (name === 'ouIdLov') {
      const { organizationId } = value || {};
      record.set('invOrganizationIdLov', organizationId ? value : null);
    }

    dimensionList
      .filter((n) => n.conditionList)
      .forEach((field) => {
        const { conditionList } = field;
        conditionList.forEach((condition) => {
          const { conditionHeader, conditionLineList } = condition;
          const { conditionType, conditionExpression } = conditionHeader;
          const {
            dimension: { dimensionType, dimensionCode: code },
            dimensionComponent: { componentType },
          } = dimensionList.find(
            (n) => conditionHeader.dimensionId === n.dimension.dimensionId
          ) || {
            dimension: {},
            dimensionComponent: {},
          };
          let propsName;
          switch (conditionType) {
            // 必输
            case 'NECESSARY':
              propsName = 'fxNecessaryFlag';
              break;
            // 编辑
            case 'EDIT':
              propsName = 'fxEditFlag';
              break;
            // 展示
            case 'DISPLAY':
              propsName = 'fxDisplayFlag';
              break;
            case 'BUDGET':
              propsName = 'fxBudgetFlag';
              break;
            default:
              break;
          }
          if (!propsName) return;
          const flag = getFxFlag({
            conditionLineList,
            dimensionList,
            conditionExpression,
            record,
          });
          const fieldCode = `${code}${componentType === 'LOV' ? 'Lov' : ''}`;
          if (dimensionType.startsWith('LINE')) {
            if (propsName === 'fxDisplayFlag' && lineDs.getField(fieldCode)) {
              lineDs.getField(fieldCode).set('visibled', flag);
            }
            lineDs.forEach((r) => {
              const lineFlag = getFxFlag({
                conditionLineList,
                dimensionList,
                conditionExpression,
                headerRecord: record,
                lineRecord: r,
              });
              r.set(`${code}${propsName}`, lineFlag ? 1 : 0);
            });
          } else {
            if (propsName === 'fxDisplayFlag' && record.getField(fieldCode)) {
              record.getField(fieldCode).set('visibled', flag);
            }
            record.set(`${code}${propsName}`, flag ? 1 : 0);
          }
        });
      });

    CuxFn({
      name: 'BatchAllocation-fn-update',
      // value: { record, name, value, dimensionList },
      value: { record, name, value, dimensionList, oldValue, dimension, dimensionComponent },
    })();
  }
}
