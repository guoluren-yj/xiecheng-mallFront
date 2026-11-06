import { Message } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import {
  cancelCentralizeService,
  rejectCentralizeService,
  submitCentralizeService,
  updateCentralizeAddress,
  fetchCartConfig,
} from 'services/newCartService';
import CartDataSet from './CartDataSet';
import { checkRecordSame, recordsFilter, cartToJSONData, getSortCartList } from './func';
import HmallConfig from 'utils/api-config';
import { getOrganizationId, getUserConfigInfo, getPrecision, calcValidatePack } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';
import { getDimensionTemplateDTO } from './loadCartData';
import CuxFn from '@/cuxTools/cuxFn';

// 报错数据置顶
function sortCart(dataSet, respList) {
  dataSet.cartData.forEach((product) => {
    const errorProduct = respList.find((p) => dataSet.isEqualCart(product, p));
    if (errorProduct) {
      Object.assign(product, {
        errorCode: errorProduct.errorCode,
        errorMessage: errorProduct.errorMessage,
      });
    }
  });
  if (dataSet.getState('checkCartChoosed') === 1) {
    const checkData = dataSet.cartData.filter((n) =>
      (dataSet.toData() || []).some((m) => dataSet.isEqualCart(m, n))
    );
    dataSet.loadCartData(checkData, {
      needCheck: true,
    });
  } else {
    // 回填购物车顶部商品
    const errList = dataSet.cartData.filter((p) =>
      respList.some((r) => dataSet.isEqualCart(p, r) && r.errorMessage)
    );
    const newCartList = getSortCartList(dataSet.cartData, errList, dataSet.isEqualCart);
    dataSet.loadCartData(newCartList, { needCheck: true });
  }
}

export default class BasketDataSet extends CartDataSet {
  constructor(dataSetProps, cartDataSetProps) {
    super(dataSetProps, cartDataSetProps);
    this.basketType = cartDataSetProps.basketType;
  }

  getValidateType() {
    const result = {
      currencyCode: intl
        .get(`mallf.common.view.porduct.chooseSameCurrency`)
        .d('只能选择相同币种的商品！'),
    };
    if (this.basketType === 'order') {
      result.centralizedTemplateId = intl
        .get(`mallf.common.view.porduct.chooseSameCentralize`)
        .d('请选择相同活动的商品!');
    }
    return result;
  }

  isEqualCart(prev, next) {
    return checkRecordSame(prev, next, 'cartId,centralizedHeaderNum,centralizedLineNum');
  }

  changeParams(params = {}) {
    return { ...params, centralizedUserType: this.basketType === 'demander' ? 0 : 1 };
  }

  // 取消拼单
  async cancelCentralizedSku(records) {
    const dataSet = this;
    dataSet.status = 'loading';
    const params = records.map((m) => ({ relationId: m.get('centralizedRelationId') }));
    try {
      const res = await cancelCentralizeService(params);
      if (res) {
        this.queryCartData();
      }
    } catch {
      dataSet.status = 'ready';
    }
  }

  // 驳回拼单
  async returnCentralizedSku(record, remark) {
    const dataSet = this;
    dataSet.status = 'loading';
    const params = record
      .get('cartDTOList')
      ?.map((m) => ({ relationId: m.centralizedRelationId, remark }));
    try {
      const res = await rejectCentralizeService(params);
      if (res) {
        this.queryCartData();
      }
    } catch {
      dataSet.status = 'ready';
    }
  }

  // 提需人提交拼单
  async submitCentralizedSku() {
    const dataSet = this;
    dataSet.status = 'loading';
    const params = dataSet.getCheckedCartData(
      cartToJSONData(dataSet.selected.map((m) => m.toData()))
    );
    try {
      const cuxFlag = await CuxFn({
        name: 'cart-pro-submit-fn-cuxFlag',
        value: {
          params,
          dataSet,
        },
      })();
      if (cuxFlag === false) return;
      const res = await submitCentralizeService(params);
      if (res) {
        const hasError = res.some((e) => e.noErrorFlag === 0);
        if (!hasError) {
          const successMessage = CuxFn({
            name: 'cart-pro-submit-fn-submitCentralizedMessage',
          })(() =>
            intl.get(`mallf.cart.view.success.submitCentralize`).d('成功加入下单人拼单篮')
          )();
          Message.success(successMessage);
          const cartConfig = await fetchCartConfig();
          if (cartConfig) {
            dataSet.setCartConfig(cartConfig);
          }
          this.queryCartData();
        } else {
          sortCart(dataSet, res);
          dataSet.status = 'ready';
        }
      }
    } catch {
      dataSet.status = 'ready';
    }
  }

  // 下单人修改地址
  updatePoAddress = async (addressId) => {
    const dataSet = this;
    const records = this.updatePoRecords;
    const params = {
      addressId,
      cartList: recordsFilter(
        records,
        () => true,
        (m) => ({
          cartId: m.cartId,
          centralizedHeaderNum: m.centralizedHeaderNum,
          centralizedLineNum: m.centralizedLineNum,
          dimensionTemplateDTO: m.dimensionTemplateDTO,
        })
      ),
    };
    try {
      dataSet.status = 'loading';
      const res = await updateCentralizeAddress(params);
      if (res) {
        this.errMsgData = res.filter((f) => f.noErrorFlag === 0);
        if (this.errMsgData.length < res.length) {
          const successMsg =
            this.errMsgData.length < 1
              ? intl.get(`mallf.cart.view.success.update`).d('修改成功')
              : intl.get(`mallf.cart.view.success.partUpdate`).d('部分修改成功');
          Message.success(successMsg);
        }

        // 可能会存在部分修改成功部分失败（记录错误信息，在查询后组合）
        this.queryCartData();
      }
    } catch {
      dataSet.status = 'ready';
    }
  };

  errMsgData;

  // 对与queryCartData方法查出来的数据做出一些处理
  interceptCartData = (data) => {
    if (!isEmpty(this.errMsgData)) {
      const lastErrs = this.errMsgData;
      this.errMsgData = [];
      return data.map((m) => {
        const err = lastErrs.find((f) => this.isEqualCart(m, f));
        if (err) {
          return { ...m, ...err };
        }
        return m;
      });
    }
    return data;
  };
}

export const BasketDetailDs = (modal, outerProduct) => ({
  primaryKey: '',
  cacheSelection: true,
  pageSize: 20,
  selection: 'multiple',
  dataToJSON: 'dirty',
  fields: [
    {
      name: 'centralizedUserName',
      type: 'string',
    },
    {
      name: 'errorMessage',
      label: intl.get('mallf.common.view.prompt').d('提示'),
      type: 'string',
    },
    {
      name: 'totalQuantity',
      type: 'bigNumber',
      required: true,
      nonStrictStep: true,
      min: 0,
      computedProps: {
        precision: ({ record }) => record.get('uomPrecision'),
        step: ({ record }) => record.get('minPackageQuantity') || 1,
        max: ({ record }) => record.get('purchaseQuantityLimit'),
      },
      validator: (val, name, record) => {
        const minPackageQuantity = record.get('minPackageQuantity');
        const precision = record.get('uomPrecision');
        const defaultUomPrec = precision ? getPrecision(precision) : 1;
        // 开发购物车按行数量
        const totalQuantity = record.get('totalQuantity') || val;
        if (!val) {
          return intl.get('mallf.common.view.quantityNull').d('请输入数量');
        }
        if (
          val &&
          totalQuantity &&
          calcValidatePack(defaultUomPrec, minPackageQuantity) &&
          !math.eq(math.mod(totalQuantity, minPackageQuantity || 1), 0)
        ) {
          return `${intl
            .get('mallf.common.view.errorMinPackageQuantity')
            .d('最小包装量为')}${minPackageQuantity}`;
        }
        return undefined;
      },
    },
    {
      name: 'HEADER_addressId',
      type: 'object',
      required: true,
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read({ data }) {
      const { unitId, unitCode, unitName, companyId, userId: ownerId } = getUserConfigInfo();
      return {
        url: `${HmallConfig.apiGateway}/${
          HmallConfig.newCartService
        }/v1/${getOrganizationId()}/open-cart`,
        method: 'GET',
        data: {
          ...data,
          ownerId,
          unitId,
          unitCode,
          unitName,
          companyId,
          centralizedUserType: 1,
          openCartFlag: 1,
        },
        transformResponse: (res) => {
          if (res) {
            const resp = JSON.parse(res);
            const { templateResultDTOList, content } = resp || {};
            // 不是提需人搜索为空 则关闭弹窗
            if (!data.centralizedUserName && (!content || content?.length < 1)) {
              modal.close();
              return [];
            }
            // 处理数据
            return content?.reduce((list, cartItem) => {
              // 处理下一步商品行报错填入
              const errorProduct = outerProduct?.cartDTOList?.find(
                (o) => o.cartId === cartItem.cartId && o.errorMessage
              );
              let newList = [...list];
              newList = [
                ...newList,
                ...(cartItem.cartColumnValueList?.map((dimVal) => {
                  // 分配头
                  const headerNum = dimVal.headerNum || 1;
                  // 分配行
                  const lineNum = dimVal.lineNum || 1;

                  const newItem = {
                    ...cartItem,
                    errorMessage: errorProduct?.errorMessage || cartItem?.errorMessag,
                    headerNum,
                    lineNum,
                    currentDimValue: dimVal,
                    cartColumnValueList: null,
                    dimensionTemplateDTO: getDimensionTemplateDTO(templateResultDTOList, cartItem),
                  };

                  dimVal.cartDimValueList.forEach((field) => {
                    if (field.dimensionCode === 'quantity') {
                      newItem.totalQuantity = field.valueName || field.value;
                    }
                    if (field.dimensionCode === 'taxIncludedAmount') {
                      newItem.total = field.valueName || field.value;
                      newItem.taxIncludedAmount = field.value;
                    }
                    if (field.dimensionCode === 'unitPrice') {
                      newItem.unitPrice = field.valueName || field.value;
                    }
                    newItem[`${field.dimensionType}_${field.dimensionCode}`] =
                      field.valueName || field.value;
                    newItem[`${field.dimensionType}_${field.dimensionCode}_value`] = field.value;
                  });
                  // 申请链路
                  if (cartItem.linkType === 'REQUEST') {
                    newItem.totalCqNum = dimVal.totalCqNum; // 定制品数量
                  }
                  return newItem;
                }) || []),
              ];
              return newList;
            }, []);
          }
        },
      };
    },
  },
});
