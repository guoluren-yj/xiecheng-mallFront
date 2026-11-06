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
import qs from 'qs';
import { Spin } from 'hzero-ui';
import { isEmpty, uniqBy, uniq } from 'lodash';
import Loading from 'components/loading';
// import Icons from 'components/Icons';
import formatterCollections from 'utils/intl/formatterCollections';
import BreadCrumbs from 'components/BreadCrumbs';
import HmallConfig from 'utils/api-config';
import { getUserConfigInfo, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { accessIsLogin, batchGetCodes } from 'services/api';
import {
  fetchBatchCodeService,
  fetchMethodAndtypeService,
  invoiceCheckService,
  getSourceKeyService,
  fetchDefaultAcAddress,
  updateBudget,
  isUseOms,
  fetchDefaultSetting,
  fetchCataClientValueList,
  relaseBudgetService,
} from 'services/cartService';
import { fetchBudgetLov } from 'services/productDetailService';
// import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import { Header, ECLine, CATALine, OMSHeader, OMSECLine, OMSCATALine } from 'utils/customizeCode';

import Order from './Order';
import TimeGoBack from './TimeGoBack';
import style from './index.less';
import CuxFn from '@/cuxTools/cuxFn';
import OrderAnchor from './OrderAnchor';
import InvoiceModal from './InvoiceModal';
import SubmitBtn from './SubmitBtn';
import BreadCrumbsRightBtn from './BreadCrumbsRightBtn';
import TotalMount from './TotalMount';

const initInvoiceData = {}; // 电商/内采发票信息值集
function BeforeCompanyOrder(props) {
  const { companyId, budgetSwitch } = getUserConfigInfo();
  const {
    location: { data: state },
    headerCode,
    eCLineCode,
    cataLineCode,
    isOMS,
  } = props;

  const [orderData, setOrderData] = useState([]); // 所有的采购申请数据
  const [miniAmountFlag, setMiniAmountFlag] = useState(false); // 是否存在不满足最小下单金额的申请单
  // const [progressStep, setProgressStep] = useState('0%'); // 提交申请进度
  // const [progressVisible, setProgressVisible] = useState(false); // 进度条的显示
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
  const [innerCompanyInvoice, setInnerCompanyInvoice] = useState({}); // 内采的开户行等信息
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchBatchCodesLoading, setFetchBatchCodesLoading] = useState(false);
  const [defaultAcAddress, setDefaultAcAddress] = useState({});
  const [proxyAddress, setProxyAddress] = useState([]); // 采销一体默认收单地址
  const [budgetList, setBudgetList] = useState([]); // 预算集合
  const [budgetSelectList, setBudgetSelectList] = useState([]);
  const [defaultSetting, setDefaultSetting] = useState(undefined);

  // useEffect(() => {
  //   // 查询sprm old flag
  //   fetchSprmNewFlag().then((flag) => {
  //     getDvaApp()._store.dispatch({
  //       type: 'global/update',
  //       payload: {
  //         sprmOldLinkFlag: !isEmpty(flag),
  //       },
  //     });
  //   });
  // }, []);

  useEffect(() => {
    accessIsLogin();
    window.scrollTo(0, 0);
    if (state && state.orderData) {
      // const neededDateFlag = hideFieldList.includes('DEMAND_DATE'); // 根据业务规则是否隐藏需求日期
      state.orderData.forEach((item, index) => {
        // 为个性化头信息设置值
        state.orderData[index].companyLov = {
          companyId: item.shoppingCartDTOList[0]?.companyId,
        };
        state.orderData[index].invOrganizationLov = {
          invOrganizationId: item.shoppingCartDTOList[0]?.invOrganizationId,
          invOrganizationName: item.organizationName,
        };
        state.orderData[index].ouLov = {
          // 业务实体
          ouId: item.shoppingCartDTOList[0]?.ouId,
          ouName: item.ouName,
        };
        state.orderData[index].purchaseOrgLov = {
          // 采购组织
          purOrganizationId: item.shoppingCartDTOList[0]?.purOrganizationId,
          purOrganizationName: item.purOrganizationName,
        };
        if (
          item.shoppingCartDTOList[0].productSource !== 'CATA' &&
          !item.shoppingCartDTOList[0].qtHeaderNo
        ) {
          state.orderData[index] = {
            ...item,
            ecPlatform: item.shoppingCartDTOList[0].productSource,
          };
          fetchBatchCodes(
            item.shoppingCartDTOList[0].productSource,
            item.shoppingCartDTOList[0].dataType,
            item.shoppingCartDTOList[0]?.proxySupplierCompanyId ||
              item.shoppingCartDTOList[0]?.companyId
          );
        }
      }); // 初始采购申请数据，请求电商值集以及增加初始需求日期
      changeOrderData(state.orderData);
      const miniAmountList = state.orderData.filter((item) => item.minPurchaseFlag === 0); // 判断是否存在不满足最小下单金额的申请单
      setMiniAmountFlag(miniAmountList.length > 0);
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

  useEffect(() => {
    CuxFn({
      name: 'BeforeCompanyOrder-fn-init',
      value: { setOrderData, data: state?.orderData },
    })();
  }, []);

  const changeOrderData = CuxFn({
    name: 'BeforeCompanyOrder-fn-changeOrderData',
    value: { setOrderData, data: state?.orderData },
  })((data) => {
    setOrderData(data);
  });

  useEffect(() => {
    fetchDefaultAcAddress().then((res) => {
      setDefaultAcAddress(res || {});
    });
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
    CuxFn({
      name: 'BeforeCompanyOrder-fn-promisGetInvoice',
      value: { orderData: state?.orderData, setSourceKeyList, setInvoiceCheckData, setCount },
    })(() => {
      getSourceKeyService().then((res) => {
        if (res) {
          setSourceKeyList(res);
          const { sourceKey } = res.find((r) => r.companyId === companyId) || {};
          if (sourceKey !== undefined) {
            invoiceCheckService({ sourceKey }).then((result) => {
              // setInvoiceCheckData(result);
              setInnerCompanyInvoice(result);
              // setCount((c) => c + 1);
            });
          }
        }
      });
    })();
  }, [state]);

  useEffect(() => {
    if (sourceKeyList.length > 0 && orderData.length > 0) promisGetInnerInvoice();
  }, [sourceKeyList, orderData.length]);

  function getDefaultECInvoice(platformCode, dataType) {
    const { methodAndTypeList = [] } =
      initInvoiceData[`${platformCode}${dataType || ''}invoiceData`] || {};
    const {
      invoiceMethod: defaultInvoiceMethod, // 默认开票方式
      invoiceType: defaultInvoiceType,
      invoiceMethodName: defaultInvoiceMethodName, // 默认开票类型
      invoiceTypeName: defaultInvoiceTypeName,
    } =
      methodAndTypeList.find(
        (p) => p.invoiceMethodDefaultFlag === 1 && p.invoiceTypeDefaultFlag === 1
      ) || {};
    const { ecClientValueList = [] } =
      (defaultSetting || []).find(
        (n) => n.platformCode === platformCode && n.ecClientValueList?.[0]?.dataType === +dataType
      ) || {};
    const defaultPaymentMethod = ecClientValueList.find((n) => n.valueType === 'PAYMENT_TYPE')
      ?.valueCode;
    const defaultPaymentMethodName = ecClientValueList.find((n) => n.valueType === 'PAYMENT_TYPE')
      ?.valueName;
    const defaultFreightType = ecClientValueList.find((n) => n.valueType === 'FREIGHT_TYPE')
      ?.valueCode;
    // const defaultFreightTypeName=ecClientValueList.find(n => n.valueType === 'FREIGHT_TYPE')?.valueName;
    const defaultInvoiceTitle = ecClientValueList.find((n) => n.valueType === 'INVOICE_TITLE')
      ?.valueCode;
    const defaultInvoiceTitleName = ecClientValueList.find((n) => n.valueType === 'INVOICE_TITLE')
      ?.valueName;
    const defaultInvoiceDetail = ecClientValueList.find((n) => n.valueType === 'INVOICE_DETAIL')
      ?.valueCode;
    const defaultInvoiceDetailName = ecClientValueList.find((n) => n.valueType === 'INVOICE_DETAIL')
      ?.valueName;

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
  async function promisGetInnerInvoice() {
    const proxyCompanyList = new Set(
      orderData.map((n) => n.proxySupplierCompanyId || companyId).filter((n) => n)
    );
    if (!isEmpty(Array.from(proxyCompanyList))) {
      const fetchInnerCompanyInvoice = Array.from(proxyCompanyList).map((proxyCompanyId) => {
        const { sourceKey } = sourceKeyList.find((r) => r.companyId === proxyCompanyId) || {};
        return new Promise((resolve) => {
          invoiceCheckService({ sourceKey }).then((res) =>
            resolve({
              ...res,
              defaultInvoiceHeader: res.invoiceHeader,
              proxySupplierCompanyId: proxyCompanyId,
            })
          );
        });
      });
      const newInnerCompanyInvoice = await Promise.all(fetchInnerCompanyInvoice).then((r) => {
        return r;
      });
      const proxyAddressPromise = Array.from(proxyCompanyList).map((proxyCompanyId) => {
        // 采销一体电商默认收单地址
        return new Promise((resolve) => {
          fetchDefaultAcAddress(proxyCompanyId, true).then((res) =>
            resolve({
              ...res,
              proxySupplierCompanyId: proxyCompanyId,
            })
          );
        });
      });
      const newProxyAddress = await Promise.all(proxyAddressPromise).then((r) => {
        return r;
      });
      setInvoiceCheckData(newInnerCompanyInvoice);
      setProxyAddress(newProxyAddress);
    }
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
      innerInvoiceFullAddress,
      innerInvoiceAddressId,
    } = item;
    // 内采支付信息默认值（如果没有缓存则取支付信息维护的默认值）
    return {
      ...item,
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
        ? innerCompanyInvoice
        : innerCompanyInvoiceVO,
      innerInvoiceAddressId: defaultAcAddress.addressId || innerInvoiceAddressId,
      innerInvoiceFullAddress: defaultAcAddress.fullAddress || innerInvoiceFullAddress,
    };
  };

  // 给电商增加默认发票开票信息
  useEffect(() => {
    if (orderData.length > 0) {
      const newOrderData = orderData.map((item) => {
        if (
          item.shoppingCartDTOList[0].productSource !== 'CATA' &&
          !item.shoppingCartDTOList[0].qtHeaderNo
        ) {
          const {
            [`${item.shoppingCartDTOList[0].productSource}${
              item.shoppingCartDTOList[0].dataType || ''
            }invoiceData`]: ecInfo = {},
          } = initInvoiceData;
          // 查询出电商发票信息后再赋值
          if (!isEmpty(ecInfo) && !isEmpty(invoiceCheckData)) {
            return initOrderDataInvoiceInfo(
              item,
              ecInfo,
              item.shoppingCartDTOList[0].productSource,
              item.shoppingCartDTOList[0].dataType
            );
          }
        }
        return item;
      });
      setOrderData(newOrderData);
    }
  }, [initInvoiceData, invoiceCheckData, count, proxyAddress]);

  // 给内采增加默认发票开票信息
  useEffect(() => {
    if (orderData.length > 0) {
      const newOrderData = orderData.map((item) => {
        if (item.shoppingCartDTOList[0].agreementType === 'SALE') {
          return CuxFn({
            name: 'BeforeCompanyOrder-fn-initInnerInvoiceInfo',
            value: { item },
          })(() => initInnerInvoiceInfo(item))();
        }
        return item;
      });
      setOrderData(newOrderData);
    }
  }, [innerCompanyInvoice, defaultAcAddress]);

  useEffect(() => {
    if (orderData.length > 0) {
      const newOrderData = orderData.map((item) => {
        const newOrder = item;
        const { hideList, ecClientValueList = [] } =
          (defaultSetting || []).find(
            (n) => n.platformCode === item.shoppingCartDTOList[0].productSource
          ) || {};
        const {
          defaultInvoiceMethod,
          defaultInvoiceType,
          defaultInvoiceMethodName,
          defaultInvoiceTypeName,
        } = getDefaultECInvoice(
          item.shoppingCartDTOList[0].productSource,
          item.shoppingCartDTOList[0].dataType
        );
        const {
          [`${item.shoppingCartDTOList[0].productSource}${
            item.shoppingCartDTOList[0].dataType || ''
          }invoiceData`]: invoices = {},
        } = initInvoiceData;
        const { paymentMethod = [] } = invoices;
        const ecInvoiceFlag = (hideList || []).includes('INVOICE_INFO');
        // const ecFrieghtFlag = hideList.includes('FRIEGHT_TYPE');
        const hidePaymentList = (hideList || []).map((hide) => {
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
          !isEmpty(invoices)
        ) {
          // 不展示发票
          if (ecInvoiceFlag) {
            newOrder.invoiceMethodCode = newOrder.invoiceMethodCode
              ? newOrder.invoiceMethodCode
              : // : ecClientValueList.find(n => n.valueType === 'INVOICE_METHOD')?.valueCode; // 开票方式
                defaultInvoiceMethod;
            newOrder.invoiceTypeCode = newOrder.invoiceTypeCode
              ? newOrder.invoiceTypeCode
              : // : ecClientValueList.find(n => n.valueType === 'INVOICE_TYPE')?.valueCode; // 发票类型
                defaultInvoiceType;
            newOrder.invoiceTitleTypeCode = newOrder.invoiceTitleTypeCode
              ? newOrder.invoiceTitleTypeCode
              : ecClientValueList.find((n) => n.valueType === 'INVOICE_TITLE')?.valueCode; // 发票抬头
            newOrder.invoiceDetailTypeCode = newOrder.invoiceDetailTypeCode
              ? newOrder.invoiceDetailTypeCode
              : ecClientValueList.find((n) => n.valueType === 'INVOICE_DETAIL')?.valueCode; // 发票明细

            newOrder.invoiceStatusName = newOrder.invoiceStatusName
              ? newOrder.invoiceStatusName
              : // : ecClientValueList.find(n => n.valueType === 'INVOICE_METHOD')?.valueName;
                defaultInvoiceMethodName;
            newOrder.invoiceTypeName = newOrder.invoiceTypeName
              ? newOrder.invoiceTypeName
              : // : ecClientValueList.find(n => n.valueType === 'INVOICE_TYPE')?.valueName;
                defaultInvoiceTypeName;
            newOrder.selectInvoiceName = newOrder.selectInvoiceName
              ? newOrder.selectInvoiceName
              : ecClientValueList.find((n) => n.valueType === 'INVOICE_TITLE')?.valueName;
            newOrder.invoiceContentName = newOrder.invoiceContentName
              ? newOrder.invoiceContentName
              : ecClientValueList.find((n) => n.valueType === 'INVOICE_DETAIL')?.valueName;
          }
          // 不展示支付方式
          if (isEmpty(paymentMethodList)) {
            newOrder.paymentMethodCode = newOrder.paymentMethodCode
              ? newOrder.paymentMethodCode
              : ecClientValueList.find((n) => n.valueType === 'PAYMENT_TYPE')?.valueCode;
            newOrder.paymentMethodName = newOrder.paymentMethodName
              ? newOrder.paymentMethodName
              : ecClientValueList.find((n) => n.valueType === 'PAYMENT_TYPE')?.valueName;
          }
          // 收单地址隐藏
          if (!newOrder.invoiceAddressId) {
            newOrder.invoiceAddressId = defaultAcAddress.addressId;
            newOrder.invoiceFullAddress = defaultAcAddress.fullAddress;
          }
        }
        return {
          ...newOrder,
          hideList,
          // invoiceAddressId: defaultAcAddress.addressId,
          // invoiceFullAddress: defaultAcAddress.fullAddress,
        };
      });
      setOrderData(newOrderData);
    }
  }, [defaultSetting, defaultAcAddress, initInvoiceData]);

  useEffect(() => {
    if (state?.orderData) {
      const supplierCompanyIdList = state.orderData
        .filter((order) => {
          const { shoppingCartDTOList = [] } = order;
          const { productSource } = shoppingCartDTOList[0] || {};
          return productSource !== 'CATA';
        })
        .map((item) => {
          const { shoppingCartDTOList = [] } = item;
          const { supplierCompanyId } = shoppingCartDTOList[0] || {};
          return supplierCompanyId;
        });
      // 查询业务规则电商配置是否展示发票/运费/收单等（不展示则取默认值，但是手选值优先级大于默认值）
      fetchDefaultSetting({
        supplierCompanyIdList: uniq(supplierCompanyIdList),
        companyId,
      }).then((res) => {
        if (res) {
          setDefaultSetting(res);
        }
      });
    }
  }, []);

  /**
   * 查询支付信息值集
   * @param {String} platformCode - 来源
   */
  const fetchBatchCodes = (platformCode, dataType, proxyCompanyId) => {
    const params = {
      lovCode: 'SMAL.EC_CLIENT_VALUES',
      platformCode,
      dataType,
      companyId: proxyCompanyId,
    };
    setFetchBatchCodesLoading(true);
    Promise.all([fetchBatchCodeService(params), fetchMethodAndtypeService(params)])
      .then((result) => {
        const res = result[0];
        const methodAndTypeList =
          result[1]?.content?.filter(
            (p) => p.invoiceTypeEnableFlag === 1 && p.invoiceMethodEnableFlag === 1
          ) || [];
        initInvoiceData[`${platformCode}${dataType || ''}invoiceData`] = {
          paymentMethod: res.content?.filter((i) => i.valueType === 'PAYMENT_TYPE'),
          // invoiceType: res.content?.filter(i => i.valueType === 'INVOICE_TYPE'),
          // invoiceMethod: res.content?.filter(i => i.valueType === 'INVOICE_METHOD'),
          invoiceTitleType: res.content?.filter((i) => i.valueType === 'INVOICE_TITLE'),
          invoiceDetailType: res.content?.filter((i) => i.valueType === 'INVOICE_DETAIL'),
          freightType: res.content?.filter((i) => i.valueType === 'FREIGHT_TYPE'),
          methodAndTypeList,
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
  const initOrderDataInvoiceInfo = (item, invoiceData, platformCode, dataType) => {
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
    } = getDefaultECInvoice(platformCode, dataType);

    // 支付方式
    const initPaymentMethodName =
      (paymentMethod.find((i) => i.valueCode === item.paymentMethodCode) &&
        item.paymentMethodName) ||
      '';
    const initPaymentMethodCode =
      (paymentMethod.find((i) => i.valueCode === item.paymentMethodCode) &&
        item.paymentMethodCode) ||
      undefined;
    // 开票方式
    const initInvoiceStatusName =
      (invoiceMethod.find((i) => i.valueCode === item.invoiceMethodCode) &&
        item.invoiceStatusName) ||
      '';
    const initInvoiceMethodCode =
      (invoiceMethod.find((i) => i.valueCode === item.invoiceMethodCode) &&
        item.invoiceMethodCode) ||
      undefined;
    // 发票类型
    const initInvoiceTypeName =
      (invoiceType.find((i) => i.valueCode === item.invoiceTypeCode) && item.invoiceTypeName) || '';
    const initInvoiceTypeCode =
      (invoiceType.find((i) => i.valueCode === item.invoiceTypeCode) && item.invoiceTypeCode) ||
      undefined;
    // 发票抬头
    let initSelectInvoiceName =
      (invoiceTitleType.find((i) => i.valueCode === item.invoiceTitleTypeCode) &&
        item.selectInvoiceName) ||
      '';
    let initInvoiceTitleTypeCode =
      (invoiceTitleType.find((i) => i.valueCode === item.invoiceTitleTypeCode) &&
        item.invoiceTitleTypeCode) ||
      undefined;
    // 开票明细
    let initInvoiceContentName =
      (invoiceDetailType.find((i) => i.valueCode === item.invoiceDetailTypeCode) &&
        item.invoiceContentName) ||
      '';
    let initInvoiceDetailTypeCode =
      (invoiceDetailType.find((i) => i.valueCode === item.invoiceDetailTypeCode) &&
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
    const newCompanyInvoiceVO = CuxFn({
      name: 'BeforeCompanyOrder-fn-invoiceCheckData',
      value: { order: item, invoiceCheckData },
    })(
      () =>
        invoiceCheckData?.find(
          (n) => n.proxySupplierCompanyId === (item?.proxySupplierCompanyId || companyId)
        ) || {}
    )();
    const addressInfo = proxyAddress?.find(
      (n) => n.proxySupplierCompanyId === (item?.proxySupplierCompanyId || companyId)
    );
    return {
      ...item,
      // ...initInnerInvoiceInfo(item),
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
      invoiceAddressId:
        addressInfo?.addressId || (item?.proxySupplierCompanyId ? '' : item.invoiceAddressId), // 采销一体的电商收单地址没有缓存机制，标准的默认或缓存
      invoiceFullAddress:
        addressInfo?.fullAddress || (item?.proxySupplierCompanyId ? '' : item.invoiceFullAddress),
      freightType: item.freightType || defaultFreightType,
    };
  };

  const clearAllData = () => {
    setOrderData([]);
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

  // 预算值集查询
  useEffect(() => {
    if (budgetSwitch === '1') {
      fetchBudgetLov().then((res) => {
        if (res) {
          setBudgetList(res);
          let selectLovCodeObj = {};
          res
            .filter((item) => item.componentType === 'SELECT')
            .forEach((n) => {
              const { lovCode } = n;
              selectLovCodeObj = { ...selectLovCodeObj, [lovCode]: lovCode };
            });
          if (!isEmpty(selectLovCodeObj)) {
            batchGetCodes(selectLovCodeObj).then((resp) => {
              if (resp) {
                setBudgetSelectList(resp);
              }
            });
          }
        }
      });
    }
  }, [budgetSwitch]);

  // 编辑预算
  function editBudget(params, index) {
    updateBudget(params).then((res) => {
      if (res) {
        const newOrderData = orderData;
        const newList = newOrderData[index].shoppingCartDTOList.map((n) => {
          let k = n;
          res.forEach((m) => {
            if (n.cartId === m.cartId) {
              k = m;
            }
          });
          return k;
        });
        newOrderData[index].shoppingCartDTOList = newList;
        setOrderData(newOrderData);
      }
    });
  }

  // 预算校验
  // const checkBudget = () => {
  //   setSubmitLoading(true);
  //   let newShoppingCartsList = [];
  //   orderData.forEach(n => {
  //     newShoppingCartsList = [...newShoppingCartsList, ...n.shoppingCartDTOList];
  //   });
  //   return new Promise(resolve => {
  //     budgetCheck(newShoppingCartsList)
  //       .then(res => {
  //         if (res) {
  //           const newOrderData = orderData;
  //           newOrderData.forEach((order, orderInx) => {
  //             order.shoppingCartDTOList.forEach((shopCart, shopCartInx) => {
  //               const filterCart = res.filter(n => {
  //                 if (n.budgetInfoList[0]?.budgetId) {
  //                   return n.budgetInfoList[0]?.budgetId === shopCart.budgetInfoList[0]?.budgetId;
  //                 } else {
  //                   return n.cartId === shopCart.cartId;
  //                 }
  //               });
  //               if (filterCart.length > 0) {
  //                 newOrderData[orderInx].shoppingCartDTOList[shopCartInx] =
  //                   filterCart && filterCart[0];
  //               }
  //             });
  //           });
  //           setOrderData(newOrderData);
  //           resolve(res);
  //         }
  //       })
  //       .finally(() => {
  //         setSubmitLoading(false);
  //       });
  //   });
  // };

  // // 预算退回购物车
  // function budgetBackShopCart(backCartProduct) {
  //   let newShoppingCartsList = [];
  //   orderData.forEach(n => {
  //     newShoppingCartsList = [...newShoppingCartsList, ...n.shoppingCartDTOList];
  //   });
  //   const filterProduct = newShoppingCartsList.filter(n => n.cartId !== backCartProduct.cartId);
  //   if(filterProduct.length === 0) {
  //     props.history.push('/cart');
  //   } else {
  //     preReqOrderService(filterProduct).then(res => {
  //       if (res) {
  //         if (!res.failed) {
  //           setOrderData(res);
  //         } else {
  //           Swal.fire(res.message);
  //         }
  //       } else {
  //         Swal.fire(intl.get(`mallf.cart.view.order.failCreate`).d('生成订单失败'));
  //       }
  //     });
  //   }
  // }

  // 订单详情
  const orderDetail = () => {
    return orderData.map((order, orderIndex) => {
      const { minPurchaseFlag = 1, minPurchaseAmount, shoppingCartDTOList = [] } = order;
      const orderProps = {
        defaultSetting,
        count,
        order,
        invoiceCheckData,
        initInvoiceData,
        openModal,
        orderTime,
        orderExpedited,
        minPurchaseFlag,
        handleOrderNum,
        orderIndex,
        minPurchaseAmount,
        shoppingCartDTOList,
        headerCode,
        eCLineCode,
        cataLineCode,
        orderData,
        budgetList,
        editBudget,
        budgetSelectList,
        setSubmitLoading,
        setOrderData,
        changePayAndPurchaseData,
        applyExpedited,
        cacheKey: 'beforeCompanyOrder',
        isMain: orderIndex === 0,
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
    const { [field]: fieldValue = undefined } = params.find((n) => n[field] === type) || {};
    const { [field]: fieldDefaultValue = undefined } =
      params.find((n) => n.defaultValue === 1) || {};
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
    } = orderData[orderIndex];
    // 内采开票方式为无需开票不需要赋值
    if (type === 'cata' && invoiceMethodCode !== '2') {
      const { catainvoiceData } = initInvoiceData;
      const { invoiceType, invoiceMethod, invoiceTitleType, invoiceDetailType } = catainvoiceData;
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
    const { cartIds = [] } = state || {};
    props.history.push({
      pathname: '/cart',
      query: qs.stringify(cartIds),
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
    platformCode:
      orderData[modalIndex] && orderData[modalIndex].shoppingCartDTOList[0].productSource,
    onOk: hanleInvoiceInfoSave,
    onCancel: () => setModalIndex(-1),
    setInvoiceCheckData,
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
          pageTitle: intl
            .get(`mallf.companyOrder.model.companyOrder.requestPurchase`)
            .d('预采购申请'),
          rightBtn: <BreadCrumbsRightBtn orderData={orderData} />,
        }}
      />
      <Spin spinning={submitLoading || fetchBatchCodesLoading}>
        <div className={style['beforehead-order-page']} style={{ minHeight }}>
          <div className="beforehead-order-container container">
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
                      orderData={orderData}
                      setSubmitLoading={setSubmitLoading}
                      headerCode={headerCode}
                      eCLineCode={eCLineCode}
                      cataLineCode={cataLineCode}
                      isOMS={isOMS}
                      miniAmountFlag={miniAmountFlag}
                      disabled={!createOrderFlag || orderFlag}
                    />
                  </Spin>
                </div>
                <div className="back-cart-btn">
                  <a onClick={() => handleGoBack()}>
                    {intl.get(`mallf.companyOrder.model.companyOrder.returnCart`).d('返回购物车')}
                    <TimeGoBack history={props.history} clearAllData={clearAllData} />
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
  return (
    <>
      {isOMS === undefined ? (
        <Loading />
      ) : (
        <>
          {isOMS ? (
            <BeforeOrder
              headerCode={OMSHeader}
              eCLineCode={OMSECLine}
              cataLineCode={OMSCATALine}
              isOMS={isOMS}
            />
          ) : (
            <BeforeOrder
              headerCode={Header}
              eCLineCode={ECLine}
              cataLineCode={CATALine}
              isOMS={isOMS}
            />
          )}
        </>
      )}
    </>
  );
}

export default formatterCollections({ code: ['mallf.companyOrder', 'mallf.applyRes'] })(app);
