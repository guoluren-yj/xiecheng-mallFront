/* eslint-disable no-param-reassign */
/**
 * BeforeCompanyOrder - 企业选买提交预采购申请
 * @date: 2019-10-15
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { Spin, Icon } from 'hzero-ui';
import uuid from 'uuid/v4';
import { isEmpty, uniqBy, uniq } from 'lodash';
import Loading from 'components/loading';
// import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import BreadCrumbs from 'components/BreadCrumbs';
import HmallConfig from 'utils/api-config';
import { getUserConfigInfo, timestampToTime, getOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { accessIsLogin } from 'services/api';
import {
  fetchBatchCodeService,
  fetchMethodAndtypeService,
  invoiceCheckService,
  getSourceKeyService,
  fetchDefaultAcAddress,
  isUseOms,
  fetchDefaultSetting,
  fetchCataClientValueList,
  relaseBudgetService,
} from 'services/cartService';
import useRequest from '@/hooks/useRequest';
import useAnchorScroll from '@/hooks/useAnchorScroll';

import CuxWrapper from '@/cuxTools/CuxWrapper';
import CuxFn from '@/cuxTools/cuxFn';
import Order from './Order';
import TimeGoBack from './TimeGoBack';
import SubmitBtn from './SubmitBtn';
import InvoiceModal from './InvoiceModal';
import style from './index.less';
import OrderAnchor from './OrderAnchor';
import TotalMount from './TotalMount';

const initInvoiceData = {}; // 电商/内采发票信息值集
function BeforeCompanyOrder(props) {
  const { budgetSwitch } = getUserConfigInfo();
  const {
    location: { data: state },
    isOMS,
  } = props;

  const [orderData, setOrderData] = useState([]); // 所有的采购申请数据
  const [preData, setPreData] = useState(state?.preData || []);
  const [miniAmountFlag, setMiniAmountFlag] = useState(false); // 是否存在不满足最小下单金额的申请单
  const [count, setCount] = useState(0); // 用于监听initInvoiceData更新同时render
  const currentTime = useRef(timestampToTime()); // 存取默认当前的日期时间
  const [modalIndex, setModalIndex] = useState(-1); // 发票信息弹框，为-1不显示，每次显示的数据为选中订单的索引
  const [modalType, setModalType] = useState('ec');
  const [initInvoiceInfo, setInitInvoiceInfo] = useState({
    invoiceTypeCode: '',
    invoiceTypeName: '',
    invoiceTitleTypeCode: '',
    selectInvoiceName: '',
    invoiceMethodCode: '',
    invoiceStatusName: '',
    invoiceDetailTypeCode: '',
    invoiceContentName: '',
  }); // 发票弹窗发票信息(电商/内采)默认值
  const [sourceKeyList, setSourceKeyList] = useState([]);
  const [invoiceCheckData, setInvoiceCheckData] = useState([]); // 电商开户行信息
  const [innerCompanyInvoice, setInnerCompanyInvoice] = useState([]); // 内采的开户行等信息
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchBatchCodesLoading, setFetchBatchCodesLoading] = useState(false);
  const [proxyAddress, setProxyAddress] = useState([]); // 采销一体默认收单地址
  const [innerProxyAddress, setInnerProxyAddress] = useState([]); // 内采默认收单地址
  // 商城是否整单配送值集
  const { resData: deliveryMethodList } = useRequest({
    url: `/hpfm/v1/${getOrganizationId()}/lovs/value`,
    query: { lovCode: 'SMCT_PRE_DELIVERY_METHOD' },
  });

  const { index: anchorIndex } = useAnchorScroll({
    container: document.querySelector('body'),
  });

  useEffect(() => {
    accessIsLogin();
    if (document.body.scrollTo) {
      document.body.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
    if (state && state.orderData) {
      // setPreData(state.preData);
      // const neededDateFlag = hideFieldList.includes('DEMAND_DATE'); // 根据业务规则是否隐藏需求日期
      state.orderData.forEach((item, index) => {
        // 头附件
        state.orderData[index].attachmentUuid = uuid();
        state.orderData[index].outerAttachmentUuid = uuid();
        // 为个性化头信息设置值
        state.orderData[index].companyLov = {
          companyId: item.companyId,
          companyName: item.companyName,
        };
        state.orderData[index].invOrganizationLov = {
          invOrganizationId: item.invOrganizationId,
          invOrganizationName: item.invOrganizationName,
        };
        state.orderData[index].ouLov = {
          // 业务实体
          ouId: item.ouId,
          ouName: item.ouName,
        };
        state.orderData[index].purchaseOrgLov = {
          // 采购组织
          purOrganizationId: item.purOrganizationId,
          purOrganizationName: item.purOrganizationName,
        };
        if (
          item.shoppingCartDTOList[0].productSource !== 'CATA'
          // !item.shoppingCartDTOList[0].qtHeaderNo
        ) {
          state.orderData[index] = {
            ...item,
            ecPlatform: item.shoppingCartDTOList[0].productSource,
          };
          // fetchBatchCodes(
          //   item.shoppingCartDTOList[0].productSource,
          //   item.shoppingCartDTOList[0].dataType,
          //   item.proxySupplierCompanyId || item.companyId
          // );
        }
      }); // 初始采购申请数据，请求电商值集以及增加初始需求日期
      handleFetchBatchCodes(state.orderData);
      changeOrderData(state.orderData);
      const miniAmountList = state.orderData.filter((item) => item.minPurchaseFlag === 0); // 判断是否存在不满足最小下单金额的申请单
      setMiniAmountFlag(miniAmountList.length > 0);
      CuxFn({
        name: 'NewBeforeOrder-fn-afterInitData',
        value: { setOrderData, orderData, stateOrderData: state.orderData },
      })(() => {})();
    } else {
      clearAllData();
      props.history.push({
        pathname: `${HmallConfig.contextPath}/apply-result`,
        resultMsg: {},
      });
    }

    return () => {
      clearAllData();
    };
  }, []);

  const changeOrderData = (data) => {
    setOrderData(data);
  };

  // 去重查询支付信息值集
  function handleFetchBatchCodes(orderDT) {
    const batchCodesKeys = orderDT.map((n) => {
      const { shoppingCartDTOList = [], proxySupplierCompanyId, companyId } = n || {};
      const { productSource, dataType } = shoppingCartDTOList[0] || {};
      return `${productSource}&&${dataType}&&${proxySupplierCompanyId || companyId}`;
    });
    const uniqueKeys = uniq(batchCodesKeys);
    uniqueKeys.forEach((key) => {
      const [productSource, dataType, compId] = key.split('&&');
      if (productSource === 'CATA') return;
      fetchBatchCodes(productSource, dataType, compId);
    });
  }

  useEffect(() => {
    // 内采支付信息值集
    fetchCataClientValueList().then((res) => {
      initInvoiceData.catainvoiceData = {
        paymentMethod: res?.filter((i) => i.valueType === 'PAYMENT_METHOD'), // 支付方式
        paymentType: res?.filter((i) => i.valueType === 'PAYMENT_TYPE'), // 支付类型
        invoiceType: res?.filter((i) => i.valueType === 'INVOICE_TYPE'),
        invoiceMethod: res?.filter((i) => i.valueType === 'INVOICE_METHOD'),
        invoiceTitleType: res?.filter((i) => i.valueType === 'INVOICE_TITLE'),
        invoiceDetailType: res?.filter((i) => i.valueType === 'INVOICE_DETAIL'),
        freightType: res?.filter((i) => i.valueType === 'FREIGHT_TYPE'),
      };
      setCount((c) => c + 1);
    });
  }, []);

  // 获取内采开票行信息
  useEffect(() => {
    getSourceKeyService().then((res) => {
      if (res) {
        setSourceKeyList(res);
      }
    });
  }, [state]);

  useEffect(() => {
    if (sourceKeyList.length > 0) {
      // const ecProxyCompanyList = new Set(
      //   orderData.map((n) => n.proxySupplierCompanyId).filter((n) => n)
      // );
      // 58二开
      const ecProxyCompanyList = CuxFn({
        name: 'NewBeforeOrder-fn-promisGetInvoice',
        value: { orderData },
      })(() => {
        return new Set(orderData.map((n) => n.proxySupplierCompanyId).filter((n) => n));
      })();
      const innerProxyCompanyList = new Set(orderData.map((n) => n.companyId).filter((n) => n));
      // 电商采销一体
      const param = {
        companyList: isEmpty(Array.from(ecProxyCompanyList))
          ? innerProxyCompanyList
          : ecProxyCompanyList,
        setInvoice: setInvoiceCheckData,
        setAddress: setProxyAddress,
        isFlag: !isEmpty(Array.from(ecProxyCompanyList)),
      };
      promisGetInvoice(param);
      // 目录化内采
      if (!isEmpty(Array.from(innerProxyCompanyList))) {
        const params = {
          companyList: innerProxyCompanyList,
          setInvoice: setInnerCompanyInvoice,
          setAddress: setInnerProxyAddress,
          isFlag: false,
        };
        promisGetInvoice(params);
      }
    }
  }, [sourceKeyList]);

  // 获取电商默认发票信息
  function getDefaultECInvoice(productSource, dataType, proxyCompanyId) {
    const { methodAndTypeList = [], defaultSetting } =
      initInvoiceData[`${productSource}${dataType || ''}${proxyCompanyId}invoiceData`] || {};
    const {
      invoiceMethod: defaultInvoiceMethod, // 默认开票方式
      invoiceType: defaultInvoiceType,
      invoiceMethodName: defaultInvoiceMethodName, // 默认开票类型
      invoiceTypeName: defaultInvoiceTypeName,
    } =
      methodAndTypeList?.find(
        (p) => p.invoiceMethodDefaultFlag === 1 && p.invoiceTypeDefaultFlag === 1
      ) || {};
    const { ecClientValueList = [] } =
      defaultSetting?.find(
        (n) => n.platformCode === productSource && n.ecClientValueList?.[0]?.dataType === dataType
      ) || {};
    const defaultPaymentMethod = ecClientValueList?.find((n) => n.valueType === 'PAYMENT_TYPE')
      ?.valueCode;
    const defaultPaymentMethodName = ecClientValueList?.find((n) => n.valueType === 'PAYMENT_TYPE')
      ?.valueName;
    const defaultFreightType = ecClientValueList?.find((n) => n.valueType === 'FREIGHT_TYPE')
      ?.valueCode;
    // const defaultFreightTypeName=ecClientValueList?.find(n => n.valueType === 'FREIGHT_TYPE')?.valueName;
    const defaultInvoiceTitle = ecClientValueList?.find((n) => n.valueType === 'INVOICE_TITLE')
      ?.valueCode;
    const defaultInvoiceTitleName = ecClientValueList?.find((n) => n.valueType === 'INVOICE_TITLE')
      ?.valueName;
    const defaultInvoiceDetail = ecClientValueList?.find((n) => n.valueType === 'INVOICE_DETAIL')
      ?.valueCode;
    const defaultInvoiceDetailName = ecClientValueList?.find(
      (n) => n.valueType === 'INVOICE_DETAIL'
    )?.valueName;

    return {
      defaultInvoiceMethod,
      defaultInvoiceType,
      defaultInvoiceMethodName,
      defaultInvoiceTypeName,
      defaultPaymentMethod,
      defaultPaymentMethodName,
      defaultInvoiceTitle,
      defaultInvoiceTitleName,
      defaultInvoiceDetail,
      defaultInvoiceDetailName,
      defaultFreightType,
    };
  }

  // 获取电商开票行信息(代理运营商)
  async function promisGetInvoice({ companyList, setInvoice, setAddress, isFlag }) {
    let newCompanyInvoice = [];
    let newProxyAddress = [];
    const fetchInnerCompanyInvoice = Array.from(companyList).map((proxyCompanyId) => {
      const { sourceKey } = sourceKeyList?.find((r) => r.companyId === proxyCompanyId) || {};
      return new Promise((resolve) => {
        if (sourceKey) {
          invoiceCheckService({ sourceKey }).then((res) =>
            resolve({
              ...res,
              sourceKey,
              defaultInvoiceHeader: res.invoiceHeader,
              proxySupplierCompanyId: proxyCompanyId,
            })
          );
        } else {
          resolve({});
        }
      });
    });
    newCompanyInvoice = await Promise.all(fetchInnerCompanyInvoice).then((r) => {
      return r;
    });
    const proxyAddressPromise = Array.from(companyList).map((proxyCompanyId) => {
      // 采销一体电商默认收单地址
      return new Promise((resolve) => {
        fetchDefaultAcAddress(proxyCompanyId, isFlag).then((res) =>
          resolve({
            ...res,
            proxySupplierCompanyId: proxyCompanyId,
          })
        );
      });
    });
    newProxyAddress = await Promise.all(proxyAddressPromise).then((r) => {
      return r;
    });
    setInvoice(newCompanyInvoice);
    CuxFn({
      // 永祥二开收单地址
      name: 'NewBeforeOrder-fn-clearInvoice',
      value: { setAddress, setOrderData },
    })(() => setAddress(newProxyAddress))();
  }

  // 内采支付信息默认赋值
  const initInnerInvoiceInfo = (item) => {
    // 内采无需开票
    if (
      item.shoppingCartDTOList[0].agreementType !== 'SALE' ||
      item.innerInvoiceMethodCode === '2'
    ) {
      return item;
    }
    const {
      // paymentMethod, // 支付方式
      invoiceType,
      invoiceMethod,
      invoiceTitleType,
      invoiceDetailType,
    } = catainvoiceData; // 内采支付信息
    const {
      // innerPaymentMethodName,
      // innerPaymentMethodCode,
      innerInvoiceTypeCode,
      innerInvoiceTypeName,
      innerInvoiceTitleTypeCode,
      innerSelectInvoiceName,
      innerInvoiceMethodCode,
      innerInvoiceStatusName,
      innerInvoiceDetailTypeCode,
      innerInvoiceContentName,
      innerCompanyInvoiceVO, // 内采开户行等信息
      innerFullInvoiceAddress,
      innerInvoiceAddressId,
    } = item;
    const newCompanyInvoiceVO =
      innerCompanyInvoice?.find((n) => n.proxySupplierCompanyId === item.companyId) || {};
    const addressInfo =
      innerProxyAddress?.find((n) => n.proxySupplierCompanyId === item.companyId) || {};
    // 内采支付信息默认值（如果没有缓存则取支付信息维护的默认值）
    return {
      // ...item,
      // innerPaymentMethodName: cataDefaultInvoiceInfo(
      //   paymentMethod,
      //   'valueName',
      //   innerPaymentMethodName
      // ),
      // innerPaymentMethodCode: cataDefaultInvoiceInfo(
      //   paymentMethod,
      //   'valueCode',
      //   innerPaymentMethodCode
      // ),
      innerInvoiceTypeCode: cataDefaultInvoiceInfo(invoiceType, 'valueCode', innerInvoiceTypeCode),
      innerInvoiceTypeName: cataDefaultInvoiceInfo(invoiceType, 'valueName', innerInvoiceTypeName),
      innerInvoiceTitleTypeCode: cataDefaultInvoiceInfo(
        invoiceTitleType,
        'valueCode',
        innerInvoiceTitleTypeCode
      ),
      innerSelectInvoiceName: cataDefaultInvoiceInfo(
        invoiceTitleType,
        'valueName',
        innerSelectInvoiceName
      ),
      innerInvoiceMethodCode: cataDefaultInvoiceInfo(
        invoiceMethod,
        'valueCode',
        innerInvoiceMethodCode
      ),
      innerInvoiceStatusName: cataDefaultInvoiceInfo(
        invoiceMethod,
        'valueName',
        innerInvoiceStatusName
      ),
      innerInvoiceDetailTypeCode: cataDefaultInvoiceInfo(
        invoiceDetailType,
        'valueCode',
        innerInvoiceDetailTypeCode
      ),
      innerInvoiceContentName: cataDefaultInvoiceInfo(
        invoiceDetailType,
        'valueName',
        innerInvoiceContentName
      ),
      innerCompanyInvoiceVO: isEmpty(innerCompanyInvoiceVO)
        ? newCompanyInvoiceVO
        : innerCompanyInvoiceVO,
      innerInvoiceAddressId: addressInfo.addressId || innerInvoiceAddressId,
      innerFullInvoiceAddress: addressInfo.fullAddress || innerFullInvoiceAddress,
    };
  };

  // 给电商增加默认发票开票信息
  useEffect(() => {
    if (orderData.length > 0) {
      const newOrderData = orderData.map((item) => {
        if (
          item.shoppingCartDTOList[0].productSource !== 'CATA'
          // !item.shoppingCartDTOList[0].qtHeaderNo
        ) {
          const {
            [`${item.shoppingCartDTOList[0].productSource}${
              item.shoppingCartDTOList[0].dataType || ''
            }${item.proxySupplierCompanyId || item.companyId}invoiceData`]: ecInfo = {},
          } = initInvoiceData;
          // 查询出电商发票信息后再赋值
          if (!isEmpty(ecInfo) && !isEmpty(invoiceCheckData)) {
            item = {
              ...item,
              ...initOrderDataInvoiceInfo(
                item,
                ecInfo,
                item.shoppingCartDTOList[0].productSource,
                item.shoppingCartDTOList[0].dataType
              ),
            };
          }
        }
        if (
          item.shoppingCartDTOList[0].agreementType === 'SALE' &&
          !isEmpty(innerProxyAddress) &&
          !isEmpty(innerCompanyInvoice)
        ) {
          return {
            ...item,
            ...initInnerInvoiceInfo(item),
          };
        }
        return item;
      });
      setOrderData(newOrderData);
    }
  }, [
    initInvoiceData,
    invoiceCheckData,
    count,
    proxyAddress,
    innerCompanyInvoice,
    innerProxyAddress,
  ]);

  useEffect(() => {
    if (orderData.length > 0 && !isEmpty(initInvoiceData)) {
      const newOrderData = orderData.map((item) => {
        const newOrder = item;
        const { defaultSetting, ...other } =
          initInvoiceData[
            `${item.productSource}${item.shoppingCartDTOList[0].dataType || ''}${
              item.proxySupplierCompanyId || item.companyId
            }invoiceData`
          ] || {};
        const { hideList = [], ecClientValueList = [] } =
          defaultSetting?.find(
            (n) => n.platformCode === item.shoppingCartDTOList[0].productSource
          ) || {};
        const {
          defaultInvoiceMethod,
          defaultInvoiceType,
          defaultInvoiceMethodName,
          defaultInvoiceTypeName,
        } = getDefaultECInvoice(
          item.shoppingCartDTOList[0].productSource,
          item.shoppingCartDTOList[0].dataType,
          item.proxySupplierCompanyId || item.companyId
        );
        // const {
        //   [`${item.shoppingCartDTOList[0].productSource}${
        //     item.shoppingCartDTOList[0].dataType || ''
        //   }invoiceData`]: invoices = {},
        // } = initInvoiceData;
        const { paymentMethod = [] } = other;
        const ecInvoiceFlag = hideList.includes('INVOICE_INFO');
        // const ecFrieghtFlag = hideList.includes('FRIEGHT_TYPE');
        const hidePaymentList = hideList.map((hide) => {
          let newHide = hide;
          switch (newHide) {
            case 'ACCOUNT':
              newHide = '1';
              return newHide;
            case 'DELIVERY':
              newHide = '2';
              return newHide;
            default:
              break;
          }
          return newHide;
        });
        const paymentMethodList = paymentMethod.filter(
          (n) => !hidePaymentList.includes(n.valueCode)
        );
        if (
          item.shoppingCartDTOList[0].productSource !== 'CATA' &&
          !item.shoppingCartDTOList[0].qtHeaderNo &&
          !isEmpty(other)
        ) {
          // 不展示发票
          if (ecInvoiceFlag) {
            newOrder.invoiceMethodCode = newOrder.invoiceMethodCode
              ? newOrder.invoiceMethodCode
              : // : ecClientValueList?.find(n => n.valueType === 'INVOICE_METHOD')?.valueCode; // 开票方式
                defaultInvoiceMethod;
            newOrder.invoiceTypeCode = newOrder.invoiceTypeCode
              ? newOrder.invoiceTypeCode
              : // : ecClientValueList?.find(n => n.valueType === 'INVOICE_TYPE')?.valueCode; // 发票类型
                defaultInvoiceType;
            newOrder.invoiceTitleTypeCode = newOrder.invoiceTitleTypeCode
              ? newOrder.invoiceTitleTypeCode
              : ecClientValueList?.find((n) => n.valueType === 'INVOICE_TITLE')?.valueCode; // 发票抬头
            newOrder.invoiceDetailTypeCode = newOrder.invoiceDetailTypeCode
              ? newOrder.invoiceDetailTypeCode
              : ecClientValueList?.find((n) => n.valueType === 'INVOICE_DETAIL')?.valueCode; // 发票明细

            newOrder.invoiceStatusName = newOrder.invoiceStatusName
              ? newOrder.invoiceStatusName
              : // : ecClientValueList?.find(n => n.valueType === 'INVOICE_METHOD')?.valueName;
                defaultInvoiceMethodName;
            newOrder.invoiceTypeName = newOrder.invoiceTypeName
              ? newOrder.invoiceTypeName
              : // : ecClientValueList?.find(n => n.valueType === 'INVOICE_TYPE')?.valueName;
                defaultInvoiceTypeName;
            newOrder.selectInvoiceName = newOrder.selectInvoiceName
              ? newOrder.selectInvoiceName
              : ecClientValueList?.find((n) => n.valueType === 'INVOICE_TITLE')?.valueName;
            newOrder.invoiceContentName = newOrder.invoiceContentName
              ? newOrder.invoiceContentName
              : ecClientValueList?.find((n) => n.valueType === 'INVOICE_DETAIL')?.valueName;
          }
          // 不展示支付方式
          if (isEmpty(paymentMethodList)) {
            newOrder.paymentMethodCode = newOrder.paymentMethodCode
              ? newOrder.paymentMethodCode
              : ecClientValueList?.find((n) => n.valueType === 'PAYMENT_TYPE')?.valueCode;
            newOrder.paymentMethodName = newOrder.paymentMethodName
              ? newOrder.paymentMethodName
              : ecClientValueList?.find((n) => n.valueType === 'PAYMENT_TYPE')?.valueName;
          }
        }
        return {
          ...newOrder,
          hideList,
        };
      });
      setOrderData(newOrderData);
    }
  }, [initInvoiceData, count]);

  /**
   * 查询支付信息值集
   * @param {String} productSource - 来源
   */
  const fetchBatchCodes = (productSource, dataType, proxyCompanyId) => {
    const params = {
      lovCode: 'SMAL.EC_CLIENT_VALUES',
      platformCode: productSource,
      dataType,
      companyId: proxyCompanyId,
    };
    const supplierCompanyIdList = state.orderData
      .filter((order) => {
        const { shoppingCartDTOList = [] } = order;
        const { productSource: pdts } = shoppingCartDTOList[0] || {};
        return pdts !== 'CATA';
      })
      .map((item) => {
        const { shoppingCartDTOList = [] } = item;
        const { supplierCompanyId } = shoppingCartDTOList[0] || {};
        return supplierCompanyId;
      });
    setFetchBatchCodesLoading(true);
    Promise.all([
      fetchBatchCodeService(params),
      fetchMethodAndtypeService(params),
      fetchDefaultSetting({
        supplierCompanyIdList: uniq(supplierCompanyIdList),
        companyId: proxyCompanyId,
      }),
    ])
      .then((result) => {
        const res = result[0];
        // 开票方式和发票类型组合
        const methodAndTypeList =
          result[1]?.content?.filter(
            (p) => p.invoiceTypeEnableFlag === 1 && p.invoiceMethodEnableFlag === 1
          ) || [];
        // 查询业务规则电商配置是否展示发票/运费/收单等（不展示则取默认值，但是手选值优先级大于默认值）
        const defaultSetting = result[2];
        // 电商编码/datatype/公司 匹配
        initInvoiceData[`${productSource}${dataType || ''}${proxyCompanyId}invoiceData`] = {
          paymentMethod: res.content?.filter((i) => i.valueType === 'PAYMENT_TYPE'),
          invoiceTitleType: res.content?.filter((i) => i.valueType === 'INVOICE_TITLE'),
          invoiceDetailType: res.content?.filter((i) => i.valueType === 'INVOICE_DETAIL'),
          freightType: res.content?.filter((i) => i.valueType === 'FREIGHT_TYPE'),
          methodAndTypeList,
          defaultSetting,
          invoiceMethod: uniqBy(methodAndTypeList, 'invoiceMethod').map((p) => ({
            valueCode: p.invoiceMethod,
            valueName: p.invoiceMethodName,
            valueType: 'INVOICE_METHOD',
          })),
          invoiceType: uniqBy(methodAndTypeList, 'invoiceType').map((p) => ({
            valueCode: p.invoiceType,
            valueName: p.invoiceTypeName,
            valueType: 'INVOICE_TYPE',
          })),
        };
        setCount((c) => c + 1);
      })
      .finally(() => {
        setFetchBatchCodesLoading(false);
      });
  };

  // 设置默认初始发票信息
  const initOrderDataInvoiceInfo = (item, invoiceData, productSource, dataType) => {
    const {
      invoiceType = [],
      paymentMethod = [],
      invoiceMethod = [],
      invoiceTitleType = [],
      invoiceDetailType = [],
    } = invoiceData;

    const {
      defaultInvoiceMethod,
      defaultInvoiceType,
      defaultInvoiceMethodName,
      defaultInvoiceTypeName,
      defaultPaymentMethod,
      defaultPaymentMethodName,
      defaultInvoiceTitle,
      defaultInvoiceTitleName,
      defaultInvoiceDetail,
      defaultInvoiceDetailName,
      defaultFreightType,
    } = getDefaultECInvoice(productSource, dataType, item.proxySupplierCompanyId || item.companyId);
    // 支付方式
    const initPaymentMethodName =
      (paymentMethod?.find((i) => i.valueCode === item.paymentMethodCode) &&
        item.paymentMethodName) ||
      '';
    const initPaymentMethodCode =
      (paymentMethod?.find((i) => i.valueCode === item.paymentMethodCode) &&
        item.paymentMethodCode) ||
      undefined;
    // 开票方式
    const initInvoiceStatusName =
      (invoiceMethod?.find((i) => i.valueCode === item.invoiceMethodCode) &&
        item.invoiceStatusName) ||
      '';
    const initInvoiceMethodCode =
      (invoiceMethod?.find((i) => i.valueCode === item.invoiceMethodCode) &&
        item.invoiceMethodCode) ||
      undefined;
    // 发票类型
    const initInvoiceTypeName =
      (invoiceType?.find((i) => i.valueCode === item.invoiceTypeCode) && item.invoiceTypeName) ||
      '';
    const initInvoiceTypeCode =
      (invoiceType?.find((i) => i.valueCode === item.invoiceTypeCode) && item.invoiceTypeCode) ||
      undefined;
    // 发票抬头
    let initSelectInvoiceName =
      (invoiceTitleType?.find((i) => i.valueCode === item.invoiceTitleTypeCode) &&
        item.selectInvoiceName) ||
      '';
    let initInvoiceTitleTypeCode =
      (invoiceTitleType?.find((i) => i.valueCode === item.invoiceTitleTypeCode) &&
        item.invoiceTitleTypeCode) ||
      undefined;
    // 开票明细
    let initInvoiceContentName =
      (invoiceDetailType?.find((i) => i.valueCode === item.invoiceDetailTypeCode) &&
        item.invoiceContentName) ||
      '';
    let initInvoiceDetailTypeCode =
      (invoiceDetailType?.find((i) => i.valueCode === item.invoiceDetailTypeCode) &&
        item.invoiceDetailTypeCode) ||
      undefined;
    // // 如果开票方式为随货开票（订单完成后开票）,则发票类型不能为增值税专用发票
    // if (initInvoiceMethodCode === '2' && initInvoiceTypeCode === '2') {
    //   initInvoiceTypeName = '';
    //   initInvoiceTypeCode = undefined;
    // }
    // 如果发票类型为增值税专用发票，则发票抬头不能为个人
    if (['2', '4'].includes(initInvoiceTypeCode) && initInvoiceTitleTypeCode === '2') {
      initSelectInvoiceName = '';
      initInvoiceTitleTypeCode = undefined;
    }
    // 如果发票类型为增值税专用发票，则开票明细不能为大类
    if (['2', '4'].includes(initInvoiceTypeCode) && initInvoiceDetailTypeCode === '100') {
      initInvoiceContentName = '';
      initInvoiceDetailTypeCode = undefined;
    }
    // const newCompanyInvoiceVO =
    //   (item?.proxySupplierCompanyId ? invoiceCheckData : innerCompanyInvoice)?.find(
    //     (n) => n.proxySupplierCompanyId === (item?.proxySupplierCompanyId || item.companyId)
    //   ) || {};

    const newCompanyInvoiceVO = CuxFn({
      name: 'NewBeforeOrder-fn-getInvoice',
      value: { item, invoiceCheckData, innerCompanyInvoice },
    })(() => {
      return (
        (item?.proxySupplierCompanyId ? invoiceCheckData : innerCompanyInvoice)?.find(
          (n) => n.proxySupplierCompanyId === (item?.proxySupplierCompanyId || item.companyId)
        ) || {}
      );
    })();
    const addressInfo =
      (item?.proxySupplierCompanyId ? proxyAddress : innerProxyAddress)?.find(
        (n) => n.proxySupplierCompanyId === (item?.proxySupplierCompanyId || item.companyId)
      ) || {};
    const [invoiceAddressId, fullInvoiceAddress] = CuxFn({
      name: 'NewBeforeOrder-fn-getInvoiceAddress',
      value: { addressInfo, item },
    })(() => {
      // 采销一体的电商收单地址没有缓存机制，标准的默认或缓存
      const addressId =
        addressInfo?.addressId || (item?.proxySupplierCompanyId ? '' : item.invoiceAddressId);
      const fullAddress =
        addressInfo?.fullAddress || (item?.proxySupplierCompanyId ? '' : item.fullInvoiceAddress);
      return [addressId, fullAddress];
    })();
    return {
      // ...item,
      invoiceTypeName: initInvoiceTypeName || defaultInvoiceTypeName, // 发票类型
      invoiceTypeCode: initInvoiceTypeCode || defaultInvoiceType,
      invoiceStatusName: initInvoiceStatusName || defaultInvoiceMethodName, // 开票方式
      invoiceMethodCode: initInvoiceMethodCode || defaultInvoiceMethod,
      invoiceContentName: initInvoiceContentName || defaultInvoiceDetailName, // 开票明细
      invoiceDetailTypeCode: initInvoiceDetailTypeCode || defaultInvoiceDetail,
      paymentMethodName: initPaymentMethodName || defaultPaymentMethodName, // 支付方式
      paymentMethodCode: initPaymentMethodCode || defaultPaymentMethod,
      selectInvoiceName: initSelectInvoiceName || defaultInvoiceTitleName, // 发票抬头
      invoiceTitleTypeCode: initInvoiceTitleTypeCode || defaultInvoiceTitle,
      companyInvoiceVO: isEmpty(newCompanyInvoiceVO) ? item.companyInvoiceVO : newCompanyInvoiceVO,
      invoiceAddressId,
      fullInvoiceAddress,
      freightType: item.freightType || defaultFreightType,
    };
  };

  const clearAllData = () => {
    setOrderData([]);
    if (window.budgetWarnModal) {
      window.budgetWarnModal.close();
    }
    // setProgressStep('0%');
    // setProgressVisible(false);
  };

  /**
   * 申请加急
   * @param {Object} e checkbox事件
   * @param {Number} id 订单商品id
   * @param {Number} orderIndex 订单索引
   * @param {Number} productIndex 商品索引
   */
  const applyExpedited = (checked, id, orderIndex, productIndex) => {
    const urgentFlag = checked ? 1 : 0;
    const newArr = [...orderData];
    newArr[orderIndex].shoppingCartDTOList.forEach((p, index) => {
      if (index === productIndex) {
        // eslint-disable-next-line no-param-reassign
        p.urgentFlag = urgentFlag;
        // eslint-disable-next-line no-param-reassign
        p.urgentDate = checked ? currentTime.current : null;
      }
    });
    const isAllChecked = newArr[orderIndex].shoppingCartDTOList.every(
      (item) => item.urgentFlag === 1
    );
    newArr[orderIndex].urgentFlag = isAllChecked ? 1 : 0;
    newArr[orderIndex].urgentDate = isAllChecked ? currentTime.current : null;
    setOrderData(newArr);
  };

  /**
   * 整单加急
   * @param {Object} e checkbox事件
   * @param {Number} orderIndex 订单索引
   */
  const orderExpedited = (e, orderIndex) => {
    const orderUrgentFlag = e.target.checked ? 1 : 0;
    const newArr = [...orderData];
    newArr[orderIndex].urgentFlag = orderUrgentFlag;
    newArr[orderIndex].urgentDate = e.target.checked ? currentTime.current : null;
    const newCartList = newArr[orderIndex].shoppingCartDTOList.map((item) => ({
      ...item,
      urgentFlag: orderUrgentFlag,
      urgentDate: e.target.checked ? currentTime.current : null,
    }));
    newArr[orderIndex].shoppingCartDTOList = newCartList;
    setOrderData(newArr);
  };

  // 需求日期
  const orderTime = (dateString, index) => {
    const newArr = [...orderData];
    newArr[index].neededDate = dateString;
    newArr[index].shoppingCartDTOList = newArr[index].shoppingCartDTOList.map((item) => {
      if (item.DS) {
        item.DS.set('neededDate', dateString);
      }
      return {
        ...item,
        neededDate: dateString,
      };
    });
    setOrderData(newArr);
  };

  // 处理订单编号
  const handleOrderNum = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  // 订单详情
  const orderDetail = () => {
    return orderData.map((order, orderIndex) => {
      const orderProps = {
        count,
        order,
        invoiceCheckData,
        initInvoiceData,
        openModal,
        orderTime,
        orderExpedited,
        handleOrderNum,
        orderIndex,
        isOMS,
        orderData,
        setSubmitLoading,
        setOrderData,
        changePayAndPurchaseData,
        applyExpedited,
        cacheKey: 'beforeCompanyOrder',
        isMain: orderIndex === 0,
        preOrder: preData?.[orderIndex],
        deliveryMethodList,
        anchorIndex,
      };
      return <Order {...orderProps} />;
    });
  };

  /**
   * 采购员&支付方式
   */
  const changePayAndPurchaseData = ({ index, type, val, typeField, typeFieldVal }) => {
    const newArr = [...orderData];
    newArr[index][type] = val;
    newArr[index][typeField] = typeFieldVal;
    if (newArr[index]?.DS?.current) {
      newArr[index].DS.current.set({
        [type]: val,
        [typeField]: typeFieldVal,
      });
    }
    setOrderData(newArr);
  };

  // 内采支付信息返回默认值
  function cataDefaultInvoiceInfo(params = [], field, type) {
    const { [field]: fieldValue = undefined } = params?.find((n) => n[field] === type) || {};
    const { [field]: fieldDefaultValue = undefined } =
      params?.find((n) => n.defaultValue === 1) || {};
    return fieldValue || fieldDefaultValue;
  }

  /**
   * 打开模态框
   * @param {Number} orderIndex 订单索引
   * @param type 电商/内采支付信息
   */
  const openModal = (orderIndex, type = 'ec') => {
    setModalIndex(orderIndex);
    setModalType(type);
    const isInner = type === 'cata' ? 'innerI' : 'i';
    const {
      [`${isInner}nvoiceTypeCode`]: invoiceTypeCode,
      [`${isInner}nvoiceTypeName`]: invoiceTypeName,
      [`${isInner}nvoiceTitleTypeCode`]: invoiceTitleTypeCode,
      [`${type === 'cata' ? 'innerS' : 's'}electInvoiceName`]: selectInvoiceName,
      [`${isInner}nvoiceMethodCode`]: invoiceMethodCode,
      [`${isInner}nvoiceStatusName`]: invoiceStatusName,
      [`${isInner}nvoiceDetailTypeCode`]: invoiceDetailTypeCode,
      [`${isInner}nvoiceContentName`]: invoiceContentName,
    } = orderData[orderIndex] || preData[orderIndex]?.orderInvoiceInfo || {};
    // 内采开票方式为无需开票不需要赋值
    if (type === 'cata' && invoiceMethodCode !== '2') {
      const { catainvoiceData } = initInvoiceData;
      const { invoiceType, invoiceMethod, invoiceTitleType, invoiceDetailType } =
        catainvoiceData || {};
      setInitInvoiceInfo({
        ...initInvoiceInfo,
        invoiceTypeCode: cataDefaultInvoiceInfo(invoiceType, 'valueCode', invoiceTypeCode),
        invoiceTypeName: cataDefaultInvoiceInfo(invoiceType, 'valueName', invoiceTypeName),
        invoiceTitleTypeCode: cataDefaultInvoiceInfo(
          invoiceTitleType,
          'valueCode',
          invoiceTitleTypeCode
        ),
        selectInvoiceName: cataDefaultInvoiceInfo(invoiceTitleType, 'valueName', selectInvoiceName),
        invoiceMethodCode: cataDefaultInvoiceInfo(invoiceMethod, 'valueCode', invoiceMethodCode),
        invoiceStatusName: cataDefaultInvoiceInfo(invoiceMethod, 'valueName', invoiceStatusName),
        invoiceDetailTypeCode: cataDefaultInvoiceInfo(
          invoiceDetailType,
          'valueCode',
          invoiceDetailTypeCode
        ),
        invoiceContentName: cataDefaultInvoiceInfo(
          invoiceDetailType,
          'valueName',
          invoiceContentName
        ),
      });
      return;
    }
    setInitInvoiceInfo({
      ...initInvoiceInfo,
      invoiceTypeCode,
      invoiceTypeName,
      invoiceTitleTypeCode,
      selectInvoiceName,
      invoiceMethodCode,
      invoiceStatusName,
      invoiceDetailTypeCode,
      invoiceContentName,
    });
  };

  /**
   * 保存该订单的发票信息
   * @param {Object} invInfo 修改后的发票信息
   */
  const hanleInvoiceInfoSave = (invInfo) => {
    const newArr = [...orderData];
    const isInner = modalType === 'cata' ? 'innerI' : 'i';
    const {
      invoiceTypeCode,
      invoiceTypeName,
      invoiceTitleTypeCode,
      selectInvoiceName,
      invoiceMethodCode,
      invoiceStatusName,
      invoiceDetailTypeCode,
      invoiceContentName,
      innerCompanyInvoiceVO,
    } = invInfo;
    const newCompanyInvoiceVO = modalType === 'cata' ? { innerCompanyInvoiceVO } : {};
    newArr[modalIndex] = {
      ...newArr[modalIndex],
      [`${isInner}nvoiceTypeCode`]: invoiceTypeCode,
      [`${isInner}nvoiceTypeName`]: invoiceTypeName,
      [`${isInner}nvoiceTitleTypeCode`]: invoiceTitleTypeCode,
      [`${modalType === 'cata' ? 'innerS' : 's'}electInvoiceName`]: selectInvoiceName,
      [`${isInner}nvoiceMethodCode`]: invoiceMethodCode,
      [`${isInner}nvoiceStatusName`]: invoiceStatusName,
      [`${isInner}nvoiceDetailTypeCode`]: invoiceDetailTypeCode,
      [`${isInner}nvoiceContentName`]: invoiceContentName,
      ...newCompanyInvoiceVO,
    };
    setOrderData(newArr);
    setModalIndex(-1);
  };

  // 返回购物车
  const handleGoBack = () => {
    // 释放预算
    if (budgetSwitch === '1') {
      let shopCartList = [];
      orderData.forEach((n) => {
        const { shoppingCartDTOList } = n;
        const deleteDsCartList = shoppingCartDTOList.map((m) => {
          const { DS, ...other } = m;
          return other;
        });
        shopCartList = [...shopCartList, ...deleteDsCartList];
      });
      relaseBudgetService(shopCartList);
    }
    const { cartList = [] } = state || {};
    props.history.push({
      pathname: '/cart',
      cartList,
    });
  };

  const minHeight = window.innerHeight - 200;

  const modalProps = {
    modalType,
    fetchBatchCodesLoading,
    initInvoiceInfo,
    order: orderData[modalIndex],
    invoiceData: initInvoiceData, // 发票信息值集
    invoiceCheckData:
      modalType === 'cata'
        ? orderData[modalIndex]?.innerCompanyInvoiceVO
        : orderData[modalIndex]?.companyInvoiceVO, // 开户行信息
    visible: modalIndex !== -1,
    productSource:
      orderData[modalIndex] && orderData[modalIndex].shoppingCartDTOList[0].productSource,
    onOk: hanleInvoiceInfoSave,
    onCancel: () => setModalIndex(-1),
  };

  const anchorProps = {
    list: orderData,
  };

  // 电商订单才根据运费类型过滤是否能下单
  const { catainvoiceData = {}, ...otherEcInvoiceData } = initInvoiceData;
  const createOrderFlag = Object.values(otherEcInvoiceData).every((n) => n.freightType?.length > 0);
  // 判断是否所有申请单都不满足最小下单金额
  const orderFlag =
    orderData.filter((item) => item.minPurchaseFlag === 0).length === orderData.length;

  return (
    <div>
      <BreadCrumbs
        className="breadCrumbs"
        value={{
          pageTitle: intl.get(`mallf.myMall.model.companyOrder.requestPurchase`).d('预采购申请'),
          rightBtn: (
            <>
              {orderData?.length > 1 && (
                <span
                  style={{
                    float: 'right',
                    lineHeight: '23px',
                    color: getUserConfigInfo().theme['warning-color'],
                  }}
                >
                  <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
                  {intl
                    .get('mallf.common.view.orderQuantityPrompt', { value: orderData?.length })
                    .d(`根据您的拆单规则，本次采购申请拆分为${orderData?.length}个采购申请单`)}
                </span>
              )}
            </>
          ),
        }}
      />
      <Spin spinning={submitLoading || fetchBatchCodesLoading}>
        <div className={style['beforehead-order-page']} style={{ minHeight }}>
          <div className="beforehead-order-container container">
            <CuxWrapper path="NewBeforeOrder/renderOrderDetail" value={{ orderData }} />
            <div className={`beforehead-order ${createOrderFlag ? '' : 'beforehead-order-ash'}`}>
              {orderDetail()}
            </div>
            <div className="beforehead-order-bar">
              <TotalMount orderData={orderData} />
              <div className="beforehead-action">
                <div
                  className={`create-true-order ${
                    createOrderFlag && !orderFlag ? '' : 'beforehead-action-disabled'
                  }`}
                >
                  <Spin spinning={Object.keys(invoiceCheckData).length === 0}>
                    <SubmitBtn
                      submitLoading={submitLoading || fetchBatchCodesLoading}
                      history={props.history}
                      setOrderData={setOrderData}
                      setPreData={setPreData}
                      orderData={orderData}
                      setSubmitLoading={setSubmitLoading}
                      isOMS={isOMS}
                      miniAmountFlag={miniAmountFlag}
                      disabled={!createOrderFlag || orderFlag}
                      preData={preData}
                      orderType={state?.orderType}
                    />
                  </Spin>
                </div>
                <div className="back-cart-btn">
                  <a
                    // to={state?.orderType === 'centralized' ? '/my-mall/centralize-list' : '/cart'}
                    onClick={() => handleGoBack()}
                  >
                    {state?.orderType === 'centralized'
                      ? intl
                          .get(`mallf.myMall.model.companyOrder.returnCentralized`)
                          .d('返回拼单列表')
                      : intl.get(`mallf.myMall.model.companyOrder.returnCart`).d('返回购物车')}
                    <TimeGoBack
                      orderType={state?.orderType}
                      history={props.history}
                      clearAllData={clearAllData}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
      {/* <Progress
           visible={progressVisible}
           title={intl.get(`mallf.myMall.model.companyOrder.submitting`).d('正在提交中...')}
           step={progressStep}
         /> */}
      <InvoiceModal {...modalProps} />
      {orderData.length > 1 && <OrderAnchor {...anchorProps} />}
    </div>
  );
}

const BeforeOrder = withRouter(BeforeCompanyOrder);

function app() {
  const [isOMS, setIsOMS] = useState(undefined);
  useEffect(() => {
    isUseOms().then((res) => setIsOMS(res));
  }, []);
  return <>{isOMS === undefined ? <Loading /> : <BeforeOrder isOMS={isOMS} />}</>;
}

export default app;
