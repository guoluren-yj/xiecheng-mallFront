import React, { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import qs from 'qs';
import { Spin, Icon, Checkbox, Table, Input, Tooltip } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import BreadCrumbs from 'components/BreadCrumbs';
import LabelPreview from 'components/LabelPreview';
import Image from 'components/Image';
import Link from 'components/Link';
import formatterCollections from 'utils/intl/formatterCollections';
import { getUserConfigInfo, numberRender, convertImg, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { accessIsLogin } from 'services/api';
import HmallConfig from 'utils/api-config';
import { getSourceKeyService, invoiceCheckService } from 'services/cartService';
import { getMemberDeductionService, getLovList } from '@/services/cartService';
import OverflowTip from 'components/OverflowTip';

// import EcInfo from './EcInfo';
import { SpanTitle } from 'mall-front/lib/utils/renderer';
import CuxFn from 'mall-front/lib/cuxTools/cuxFn';
import InternalPurchasInfo from './InternalPurchasInfo';
import TimeGoBack from './TimeGoBack';
import InvoiceModal from './InvoiceModal';
import SubmitBtn from './SubmitBtn';
import style from './index.less';
import { ecInvoiceData } from './mockData';
import TotalMount from './TotalMount';

function BeforeCompanyOrder(props) {
  const {
    location,
    location: { data: state },
  } = props;
  // const { pointName } = getUserConfigInfo();
  const [initInvoiceData, setInitInvoiceData] = useState({}); // 电商/内采发票信息值集
  const [orderData, setOrderData] = useState([]); // 所有的采购申请数据
  const [miniAmountFlag, setMiniAmountFlag] = useState(false); // 是否存在不满足最小下单金额的申请单
  // const [count, setCount] = useState(0); // 用于监听initInvoiceData更新同时render
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
  const [invoiceCheckData, setInvoiceCheckData] = useState([]); // 电商开户行信息
  const [submitLoading, setSubmitLoading] = useState(false);
  // const [remarkVisible, setRemarkVisible] = useState(false);
  const [currentProduct, setCurrentPrduct] = useState({});
  const [sourceKeyList, setSourceKeyList] = useState([]);

  const minHeight = window.innerHeight - 200;
  let allNum = 0; // 总数量
  // let allIntegral = 0; // 积分抵扣
  // let allRealPrice = 0; // 实付款
  const pointsTypes = {};
  orderData.forEach((data) => {
    allNum += data.count;
    switch (data.paymentType) {
      // 积分支付
      case 'POINTS_PAYMENT':
        // allIntegral += data.totalPointPrice || 0;
        pointsTypes[data.pointsTypeName] =
          (pointsTypes[data.pointsTypeName] || 0) + data.totalPointPrice;
        break;
      // 混合支付
      case 'HYBRID_PAYMENT':
        // allIntegral += data.totalHybridPoint || 0;
        // allRealPrice += data.totalHybridPrice || 0;
        pointsTypes[data.pointsTypeName] =
          (pointsTypes[data.pointsTypeName] || 0) + data.totalHybridPoint;
        break;
      // 现金支付
      case 'CASH_PAYMENT':
        // allRealPrice += data.price || 0;
        break;
      default:
        break;
    }
  });
  const { financialPrecision } = orderData?.[0]?.shoppingCartDTOList[0] || {};

  const clearAllData = () => {
    setOrderData([]);
  };

  useEffect(() => {
    accessIsLogin();
    window.scrollTo(0, 0);
    if (state && state.orderData) {
      state.orderData.forEach((item, index) => {
        if (
          item.shoppingCartDTOList[0].productSource !== 'CATA' &&
          !item.shoppingCartDTOList[0].qtHeaderNo
        ) {
          state.orderData[index] = {
            ...item,
            ecPlatform: item.shoppingCartDTOList[0].productSource,
            innerPaymentMethodCode: 'PERSONAL_PAYMENT',
            shoppingCartDTOList: item.shoppingCartDTOList.map((s) => ({
              ...s,
              neededDate: currentTime.current,
            })),
          };
        } else {
          state.orderData[index] = {
            ...item,
            innerPaymentMethodCode: 'PERSONAL_PAYMENT',
            shoppingCartDTOList: item.shoppingCartDTOList.map((s) => ({
              ...s,
              neededDate: currentTime.current,
            })),
          };
        }
      }); // 初始采购申请数据，请求电商值集以及增加初始需求日期
      const miniAmountList = state.orderData.filter((item) => item.minPurchaseFlag === 0); // 判断是否存在不满足最小下单金额的申请单
      setMiniAmountFlag(miniAmountList.length > 0);
      setOrderData(state.orderData);
    } else {
      clearAllData();
      props.history.push({
        pathname: `${HmallConfig.contextPath}/sigl/apply-result`,
        resultMsg: {},
      });
    }

    return () => {
      clearAllData();
      location.data = {};
    };
  }, []);

  useEffect(() => {
    getSourceKeyService().then((res) => {
      if (res.length > 0) {
        setSourceKeyList(res);
      }
    });
  }, [state]);

  useEffect(() => {
    if (sourceKeyList.length > 0) promisGetInnerInvoice();
  }, [sourceKeyList]);

  // 获取电商开票行信息(代理运营商)
  async function promisGetInnerInvoice() {
    const proxyCompanyList = new Set(
      orderData.map((n) => n.proxySupplierCompanyId).filter((n) => n)
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
      setInvoiceCheckData(newInnerCompanyInvoice);
    }
  }

  useEffect(() => {
    if (orderData.length > 0 && !isEmpty(initInvoiceData)) {
      const newOrderData = orderData.map((item) => {
        return initOrderDataInvoiceInfo(item, initInvoiceData.catainvoiceData || {});
      });
      setOrderData(newOrderData);
    }
  }, [invoiceCheckData, initInvoiceData]);

  useEffect(() => {
    const handleInvoiceData = (res) => {
      return {
        paymentMethod: res?.filter((i) => i.valueType === 'PAYMENT_METHOD'), // 支付方式
        paymentType: res?.filter((i) => i.valueType === 'PAYMENT_TYPE'), // 支付类型
        invoiceType: res?.filter((i) => i.valueType === 'INVOICE_TYPE'),
        invoiceMethod: res?.filter((i) => i.valueType === 'INVOICE_METHOD'),
        invoiceTitleType: res?.filter((i) => i.valueType === 'INVOICE_TITLE'),
        invoiceDetailType: res?.filter((i) => i.valueType === 'INVOICE_DETAIL'),
        freightType: res?.filter((i) => i.valueType === 'FREIGHT_TYPE'),
      };
    };
    const paramsMap = {
      'SMAL.CATA_INVOICE_METHOD': { valueType: 'INVOICE_METHOD' },
      'SMAL.INVOICE_TITLE': { valueType: 'INVOICE_TITLE' },
      'SMAL.INVOICE_TYPE': { valueType: 'INVOICE_TYPE' },
      'SMAL.INVOICE_CONTENT': { valueType: 'INVOICE_DETAIL' },
    };
    getLovList(paramsMap).then((res) => {
      if (res) {
        const newRes = CuxFn({
          name: 'sigl/BeforeOrder/mockData',
          value: { res, paramsMap },
        })(
          () =>
            Object.keys(res)?.reduce((p, c) => {
              const arr =
                res[c]?.map((r) => {
                  return {
                    valueType: paramsMap[c]?.valueType,
                    valueCode: r.value,
                    valueName: r.meaning,
                  };
                }) || [];
              return [...p, ...arr];
            }, []) || []
        )();
        setInitInvoiceData({
          ecinvoiceData: handleInvoiceData(ecInvoiceData),
          catainvoiceData: handleInvoiceData(
            newRes.filter(
              (n) => !(n.valueType === 'INVOICE_TYPE' && ['3', '4'].includes(n.valueCode))
            )
          ),
        });
      }
    });
  }, []);

  // 设置默认初始发票信息
  const initOrderDataInvoiceInfo = (item, invoiceData) => {
    const {
      invoiceType = [],
      paymentMethod = [],
      invoiceMethod = [],
      invoiceTitleType = [],
      invoiceDetailType = [],
    } = invoiceData;

    // 当开票方式无值时，默认设置为不开票
    if (!item.innerInvoiceMethodCode) {
      // eslint-disable-next-line no-param-reassign
      item.innerInvoiceMethodCode = '2';
    }

    // 支付方式
    const initPaymentMethodName =
      (paymentMethod.find((i) => i.valueCode === item.innerPaymentMethodCode) &&
        item.innerPaymentMethodName) ||
      '';
    const initPaymentMethodCode =
      (paymentMethod.find((i) => i.valueCode === item.innerPaymentMethodCode) &&
        item.innerPaymentMethodCode) ||
      undefined;
    // 开票方式
    const initInvoiceStatusName =
      invoiceMethod.find((i) => i.valueCode === item.innerInvoiceMethodCode)?.valueName || '';
    const initInvoiceMethodCode =
      (invoiceMethod.find((i) => i.valueCode === item.innerInvoiceMethodCode) &&
        item.innerInvoiceMethodCode) ||
      undefined;
    // 发票类型
    const initInvoiceTypeName =
      invoiceType.find((i) => i.valueCode === item.innerInvoiceTypeCode)?.valueName || '';
    const initInvoiceTypeCode =
      (invoiceType.find((i) => i.valueCode === item.innerInvoiceTypeCode) &&
        item.innerInvoiceTypeCode) ||
      undefined;
    // 发票抬头
    let initSelectInvoiceName =
      invoiceTitleType.find((i) => i.valueCode === item.innerInvoiceTitleTypeCode)?.valueName || '';
    let initInvoiceTitleTypeCode =
      (invoiceTitleType.find((i) => i.valueCode === item.innerInvoiceTitleTypeCode) &&
        item.innerInvoiceTitleTypeCode) ||
      undefined;
    // 开票明细
    let initInvoiceContentName =
      invoiceDetailType.find((i) => i.valueCode === item.innerInvoiceDetailTypeCode)?.valueName ||
      '';
    let initInvoiceDetailTypeCode =
      (invoiceDetailType.find((i) => i.valueCode === item.innerInvoiceDetailTypeCode) &&
        item.innerInvoiceDetailTypeCode) ||
      undefined;
    // 如果发票类型为增值税专用发票，则发票抬头不能为个人
    if (initInvoiceTypeCode === '2' && initInvoiceTitleTypeCode === '2') {
      initSelectInvoiceName = '';
      initInvoiceTitleTypeCode = undefined;
    }
    // 如果发票类型为增值税专用发票，则开票明细不能为大类
    if (initInvoiceTypeCode === '2' && initInvoiceDetailTypeCode === '100') {
      initInvoiceContentName = '';
      initInvoiceDetailTypeCode = undefined;
    }
    return {
      ...item,
      innerInvoiceTypeName: initInvoiceTypeName, // 发票类型
      innerInvoiceTypeCode: initInvoiceTypeCode,
      innerInvoiceStatusName: initInvoiceStatusName, // 开票方式
      innerInvoiceMethodCode: initInvoiceMethodCode,
      innerInvoiceContentName: initInvoiceContentName, // 开票明细
      innerInvoiceDetailTypeCode: initInvoiceDetailTypeCode,
      innerPaymentMethodName: initPaymentMethodName, // 支付方式
      innerPaymentMethodCode: initPaymentMethodCode,
      innerSelectInvoiceName: initSelectInvoiceName, // 发票抬头
    };
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

  const modalProps = {
    modalType,
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

  // 积分抵扣运费
  function handlePointDeduction(e, orderIndex) {
    const { checked } = e.target;
    const params = orderData.map((order, index) => {
      if (orderIndex === index) {
        return {
          ...order,
          freightDeductedFlag: checked ? 1 : 0,
        };
      }
      return order;
    });
    setSubmitLoading(true);
    getMemberDeductionService(params)
      .then((res) => {
        if (res) {
          setOrderData(res);
        }
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  }

  /**
   * 采购员&支付方式
   */
  const changePayAndPurchaseData = ({ index, type, val, typeField, typeFieldVal }) => {
    const newArr = [...orderData];
    newArr[index][type] = val;
    newArr[index][typeField] = typeFieldVal;
    setOrderData(newArr);
  };

  const editRemark = (orderIndex) => {
    const { productIndex, remark } = currentProduct;
    const newArr = [...orderData];
    newArr[orderIndex].shoppingCartDTOList[productIndex].remark = remark;
    setOrderData(newArr);
    setCurrentPrduct({});
  };

  const remarkChange = (e) => {
    const val = e.target.value;
    setCurrentPrduct({ ...currentProduct, remark: val });
  };

  const handleColumns = (orderIndex) => {
    return [
      {
        title: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
        dataIndex: 'product',
        key: 'product',
        width: 320,
        fixed: 'left',
        render: (v, product, productIndex) => {
          const { productLabelDTOList = [] } = product?.labels || {}; // 商品标签
          const showAttributeInfo = () => {
            const attributeStr = product.productAttributeDTOList
              .map(({ pValue, pName }) => `${pName}: ${pValue}`)
              .join(`;\xa0\xa0\xa0`);
            return (
              <p
                style={{
                  color: '#666666',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  maxWidth: 250,
                }}
                title={attributeStr}
              >
                {attributeStr}
              </p>
            );
          };
          const labelList =
            productLabelDTOList.length > 3 ? productLabelDTOList.slice(0, 3) : productLabelDTOList;
          const { remark, remarkVisible, productId } = currentProduct;
          const visible = remarkVisible && productId === product.productId;
          return (
            <>
              <div className="goods-img">
                <Link
                  disabled={product.qtHeaderNo}
                  to={`/sigl/product-detail?productId=${product.productId}&sourceFrom=${product.productSource}`}
                >
                  <Image
                    value={convertImg(product.imagePath, 1, product.productSource)}
                    width={41}
                    height={41}
                  />
                </Link>
              </div>
              <div className="goods-product-name text-overflow">
                <Link
                  title={product.productName}
                  className="goods-name"
                  disabled={product.qtHeaderNo}
                  to={`/sigl/product-detail?productId=${product.productId}&sourceFrom=${product.productSource}`}
                >
                  {product.productName}
                </Link>
                {product.productAttributeDTOList && showAttributeInfo()}
                <p className="goods-remark">
                  <span className="goods-remark-label">
                    {intl.get('mallf.common.view.remark.info').d('备注信息')}：
                  </span>
                  <span title={product.remark}>
                    {visible ? (
                      <Input
                        style={{ height: 28 }}
                        value={remark}
                        onChange={(e) => remarkChange(e)}
                        onBlur={() => {
                          setCurrentPrduct({ ...currentProduct, orderIndex, remarkVisible: false });
                          editRemark(orderIndex);
                        }}
                      />
                    ) : product.remark?.length > 10 ? (
                      `${product.remark.substring(0, 10)}...`
                    ) : (
                      product.remark
                    )}
                  </span>
                  <Icon
                    className="detail-info-update"
                    type={visible ? '' : 'mode_edit'}
                    onClick={() => {
                      setCurrentPrduct({ ...product, productIndex, remarkVisible: true });
                    }}
                  />
                </p>
                {!isEmpty(labelList) ||
                  (product.agreementBusinessType === 'POINTS' && (
                    <div className="product-label center-content">
                      {product.agreementBusinessType === 'POINTS' && (
                        <LabelPreview
                          cursor="grab"
                          code="E"
                          value={intl.get('mallf.common.view.sigl.product').d('积分商品')}
                        />
                      )}
                      {labelList.map((n) => (
                        <LabelPreview cursor="grab" code={n.labelColorCode} value={n.labelName} />
                      ))}
                    </div>
                  ))}
              </div>
            </>
          );
        },
      },
      {
        title: intl.get(`mallf.myMall.model.companyOrder.unitPrice`).d('单价'),
        dataIndex: 'latestPrice',
        key: 'latestPrice',
        width: 150,
        align: 'right',
        render: (_, product) => {
          let newPrice = 0;
          switch (orderData[orderIndex]?.paymentType) {
            case 'POINTS_PAYMENT':
              newPrice = product?.pointPrice;
              break;
            case 'HYBRID_PAYMENT':
              newPrice = product?.hybridPrice;
              break;
            case 'CASH_PAYMENT':
              newPrice = product?.latestPrice;
              break;
            default:
              break;
          }
          return (
            <div className="columns-item text-overflow" style={{ lineHeight: '20px', width: 150 }}>
              {orderData[orderIndex]?.paymentType === 'HYBRID_PAYMENT' && (
                <span>
                  <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                  {numberRender(product?.hybridPoint)}
                  <span style={{ fontSize: 16, margin: '0 2px', fontWeight: 600 }}>+</span>
                </span>
              )}
              <span>
                {orderData[orderIndex]?.paymentType === 'POINTS_PAYMENT' ? (
                  <Icon style={{ fontSize: 12, marginTop: -4 }} type="donut_small" />
                ) : (
                  product?.currencySymbol || ''
                )}
                <SpanTitle>{numberRender(newPrice)}</SpanTitle>
              </span>
              {product?.pointsTypeName && (
                <div style={{ color: '#999999' }}>{product?.pointsTypeName}</div>
              )}
            </div>
          );
        },
      },
      {
        title: intl.get(`mallf.myMall.model.companyOrder.count`).d('数量'),
        dataIndex: 'quantity',
        key: 'quantity',
        width: 120,
        render: (v, product) => {
          const { quantity } = product;
          return (
            <div className="columns-item" style={{ lineHeight: '24px' }}>
              <span>{quantity}</span>
            </div>
          );
        },
      },
      {
        title: intl.get('mallf.common.view.line.amount.price').d('行金额(含税)'),
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        width: 150,
        align: 'right',
        render: (_, product) => {
          let newTotalPrice = 0;
          switch (orderData[orderIndex]?.paymentType) {
            case 'POINTS_PAYMENT':
              newTotalPrice = product?.totalPointPrice;
              break;
            case 'HYBRID_PAYMENT':
              newTotalPrice = product?.totalHybridPrice;
              break;
            case 'CASH_PAYMENT':
              newTotalPrice = product?.totalPrice;
              break;
            default:
              break;
          }
          return (
            <div className="columns-item text-overflow" style={{ lineHeight: '20px', width: 150 }}>
              {orderData[orderIndex]?.paymentType === 'HYBRID_PAYMENT' && (
                <span>
                  <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                  {numberRender(product?.totalHybridPoint)}
                  <span style={{ fontSize: 16, margin: '0 2px', fontWeight: 600 }}>+</span>
                </span>
              )}
              <span>
                {orderData[orderIndex]?.paymentType === 'POINTS_PAYMENT' ? (
                  <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                ) : (
                  product?.currencySymbol || ''
                )}
                <SpanTitle>{numberRender(newTotalPrice)}</SpanTitle>
              </span>
            </div>
          );
        },
      },
    ];
  };

  const noNeedInvoiceData =
    initInvoiceData?.catainvoiceData?.invoiceMethod?.find((type) => {
      return type.valueCode === '2';
    }) || {};

  const orderDetail = () => {
    return (
      <div style={{ padding: 20 }}>
        <div className="product-info-title">
          {intl.get(`mallf.common.view.productInformation`).d('商品信息')}
        </div>
        {orderData.map((order, orderIndex) => {
          if (
            order?.paymentType === 'POINTS_PAYMENT' &&
            order.shoppingCartDTOList[0].productSource === 'CATA'
          ) {
            // eslint-disable-next-line no-param-reassign
            order.innerInvoiceMethodCode = '2';
            // eslint-disable-next-line no-param-reassign
            order.innerInvoiceStatusName = noNeedInvoiceData.valueName;
          }
          const ecInfoProps = {
            order,
            orderIndex,
            invoiceCheckData,
            invoiceData: initInvoiceData,
            openModal,
            changePayAndPurchaseData,
            form: props.form,
          };
          let newTotalPrice = 0;
          // const fujiafeiMoney=0;
          // const fujiafeiPoint=0;
          switch (order?.paymentType) {
            case 'HYBRID_PAYMENT':
              newTotalPrice = order?.totalProductHybridPrice;
              break;
            case 'POINTS_PAYMENT':
              newTotalPrice = order?.totalProductPointPrice;
              break;
            case 'CASH_PAYMENT':
              newTotalPrice = order?.totalProductPrice;
              break;
            default:
              break;
          }
          return (
            <div style={{ marginTop: '10px' }}>
              <div className="product-info-body">
                <div className="order-title">
                  {intl.get('mallf.myMall.model.companyOrder.purReqOrder').d('采购申请单')}
                  {orderIndex < 9 ? `0${orderIndex + 1}` : orderIndex + 1}
                  {order.minPurchaseFlag === 0 && (
                    <span style={{ color: 'red', fontSize: '12px', marginLeft: '20px' }}>
                      {intl
                        .get('mallf.companyOrder.model.companyOrder.unArrivedMinPurchaseAmount', {
                          value: `${order.minPurchaseAmount} ${order.shoppingCartDTOList[0].currencyCode}`,
                        })
                        .d(
                          `不满足最小成单金额 ${`${order.minPurchaseAmount} ${order.shoppingCartDTOList[0].currencyCode}`}，无法提交，商品将退回购物车！`
                        )}
                    </span>
                  )}
                </div>
                <div className="order-body">
                  <div className="order-product-price">
                    <div className="product-total price-item">
                      {intl.get('mallf.myMall.model.companyOrder.productTotal').d('商品合计')}
                    </div>
                    <div className="product-piece price-item">
                      <OverflowTip className="order-label">
                        {intl.get(`mallf.myMall.model.companyOrder.productPiece`).d('商品件数')}
                      </OverflowTip>
                      <span>{order?.count}</span>
                    </div>
                    <div className="produdt-price-total price-item">
                      <OverflowTip className="order-label">
                        {intl.get('mallf.common.view.productsPriceTotal').d('商品总金额(含税)')}
                      </OverflowTip>
                      <span className="price-integral text-overflow">
                        {order?.paymentType === 'HYBRID_PAYMENT' && (
                          <span>
                            <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                            {numberRender(order?.totalProductHybridPoint)}
                            <span style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}>
                              +
                            </span>
                          </span>
                        )}
                        <span>
                          {order?.paymentType === 'POINTS_PAYMENT' ? (
                            <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                          ) : (
                            currencySymbol || ''
                          )}
                          {numberRender(newTotalPrice)}
                        </span>
                      </span>
                    </div>
                    <div className="product-feight price-item">
                      <OverflowTip className="order-label">
                        {intl.get(`mallf.common.model.exMoney`).d('附加费(含税)')}
                      </OverflowTip>
                      <span>
                        {order?.paymentType === 'HYBRID_PAYMENT' &&
                        order.freightDeductedFlag === 1 ? (
                          <>
                            <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                            {numberRender(order?.otherPricePointTotal)}
                          </>
                        ) : (
                          <>
                            {order?.paymentType === 'POINTS_PAYMENT' ? (
                              <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                            ) : (
                              currencySymbol || ''
                            )}
                            <SpanTitle
                              className="text-overflow"
                              style={{
                                width: 90,
                                display: 'inline-block',
                                verticalAlign: 'bottom',
                              }}
                            >
                              {order?.paymentType === 'POINTS_PAYMENT'
                                ? numberRender(order?.otherPricePointTotal)
                                : numberRender(order.otherPriceTotal, financialPrecision, true)}
                            </SpanTitle>
                          </>
                        )}
                        <Tooltip
                          title={
                            <>
                              <p style={{ marginBottom: 5 }}>
                                {intl
                                  .get(`mallf.companyOrder.model.companyOrder.freight`)
                                  .d('运费(含税)')}
                                :
                                {order?.paymentType === 'HYBRID_PAYMENT' &&
                                order.freightDeductedFlag === 1 ? (
                                  <>
                                    <Icon
                                      style={{ fontSize: 12, marginTop: -3 }}
                                      type="donut_small"
                                    />
                                    {numberRender(order?.pointFreightPrice)}
                                  </>
                                ) : (
                                  <>
                                    {order?.paymentType === 'POINTS_PAYMENT' ? (
                                      <Icon
                                        style={{ fontSize: 12, marginTop: -3 }}
                                        type="donut_small"
                                      />
                                    ) : (
                                      currencySymbol || ''
                                    )}
                                    {order?.paymentType === 'POINTS_PAYMENT'
                                      ? numberRender(order?.pointFreightPrice)
                                      : numberRender(order?.freight)}
                                  </>
                                )}
                              </p>
                              <p r-if={order.installPrice}>
                                {intl.get(`mallf.common.model..anzhuang`).d('安装费(含税)')}:
                                {order?.paymentType === 'HYBRID_PAYMENT' &&
                                order.freightDeductedFlag === 1 ? (
                                  <>
                                    <Icon
                                      style={{ fontSize: 12, marginTop: -3 }}
                                      type="donut_small"
                                    />
                                    {numberRender(order?.pointInstallPrice)}
                                  </>
                                ) : (
                                  <>
                                    {order?.paymentType === 'POINTS_PAYMENT' ? (
                                      <Icon
                                        style={{ fontSize: 12, marginTop: -3 }}
                                        type="donut_small"
                                      />
                                    ) : (
                                      currencySymbol || ''
                                    )}
                                    {order?.paymentType === 'POINTS_PAYMENT'
                                      ? numberRender(order?.pointInstallPrice)
                                      : numberRender(order?.installPrice)}
                                  </>
                                )}
                              </p>
                            </>
                          }
                        >
                          <Icon
                            type="help"
                            style={{
                              fontSize: 14,
                              marginLeft: 6,
                              marginTop: -3,
                              color: 'rgba(0,0,0,0.50)',
                            }}
                          />
                        </Tooltip>
                      </span>
                    </div>
                    {order?.paymentType === 'HYBRID_PAYMENT' && (
                      <div className="price-item" style={{ display: 'flex' }}>
                        <OverflowTip className="order-label">
                          {intl.get('mallf.common.view.sigl.pointDeduction').d('积分抵扣')}
                        </OverflowTip>
                        <span>
                          <Spin size="small" spinning={submitLoading}>
                            <Checkbox
                              checked={!!order?.freightDeductedFlag}
                              onChange={(e) => handlePointDeduction(e, orderIndex)}
                            >
                              {intl
                                .get('mallf.common.view.sigl.pointDeductionOther')
                                .d('积分抵附加费')}
                            </Checkbox>
                          </Spin>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="order-product-list">
                    <div className="product-company">{order?.showSupplierName}</div>
                    <div className="product-table">
                      <Table
                        dataSource={order?.shoppingCartDTOList}
                        filterBar={false}
                        columns={handleColumns(orderIndex)}
                        pagination={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* {order.shoppingCartDTOList[0].productSource !== 'CATA' && <EcInfo {...ecInfoProps} />} */}
              {/* 纯积分且为目录化商品支付无需开票 */}
              {!(
                order?.paymentType === 'POINTS_PAYMENT' &&
                order.shoppingCartDTOList[0].productSource === 'CATA'
              ) && <InternalPurchasInfo {...ecInfoProps} />}
            </div>
          );
        })}
      </div>
    );
  };

  // 判断是否所有申请单都不满足最小下单金额
  const orderFlag =
    orderData.filter((item) => item.minPurchaseFlag === 0).length === orderData.length;
  const currencySymbol = orderData[0]?.shoppingCartDTOList[0]?.currencySymbol;

  // 返回购物车
  const handleGoBack = () => {
    const { cartIds = [] } = state || {};
    props.history.push({
      pathname: '/sigl/cart',
      query: qs.stringify(cartIds),
    });
  };

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
      <Spin spinning={false}>
        <div className={style['beforehead-order-page']} style={{ minHeight }}>
          <div className="beforehead-order-container container">
            <div className="beforehead-address-info">
              <div className="beforehead-address-info-title">
                {intl.get(`mallf.common.model.receive.info`).d('收货信息')}
              </div>
              <div className="beforehead-address-info-body">
                <Icon type="room" />
                <span style={{ paddingRight: 10 }}>{orderData[0]?.receiverContactName}</span>
                <span style={{ paddingRight: 10 }}>{orderData[0]?.receiverTelNum}</span>
                <span style={{ paddingRight: 5 }}>{orderData[0]?.address}</span>
                <span className="default-address-icon">
                  {intl.get(`mallf.myMall.model.address.setDefaulted`).d('默认')}
                </span>
              </div>
            </div>
            <div className="beforehead-order">{orderDetail()}</div>
            <div className="beforehead-order-bar">
              <TotalMount allNum={allNum} pointsTypes={pointsTypes} orderData={orderData} />
              <div className="beforehead-action">
                <div className="create-true-order">
                  <Spin spinning={submitLoading}>
                    <SubmitBtn
                      submitLoading={submitLoading}
                      history={props.history}
                      setOrderData={setOrderData}
                      orderData={orderData}
                      setSubmitLoading={setSubmitLoading}
                      miniAmountFlag={miniAmountFlag}
                      disabled={orderFlag}
                    />
                  </Spin>
                </div>
                <div className="back-cart-btn">
                  <a onClick={handleGoBack}>
                    {intl.get(`mallf.myMall.model.companyOrder.returnCart`).d('返回购物车')}
                    <TimeGoBack history={props.history} clearAllData={clearAllData} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
      <InvoiceModal {...modalProps} />
    </div>
  );
}

export default withRouter(
  formatterCollections({ code: ['mallf.companyOrder', 'mallf.applyRes'] })(BeforeCompanyOrder)
);
