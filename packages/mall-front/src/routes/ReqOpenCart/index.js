import React, { useMemo, useEffect, useState } from 'react';
import { Table, DataSet, Attachment, Spin, Modal } from 'choerodon-ui/pro';
import { isEmpty, compose } from 'lodash';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';

import uuid from 'uuid/v4';
import CuxFn from 'cuxTools/cuxFn';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import Swal from 'components/swal';
import BreadCrumbs from 'components/BreadCrumbs';
import ViewCompareList from 'components/ViewCompareList';
import { reqOpenCartSubmitService, fetchOpenCartPostageInfo } from 'services/newCartService';
import {
  numberRender,
  getPriceColor,
  getUserConfigInfo,
  getStorage,
  setStorage,
  getOrganizationId,
} from 'utils/utils';
import { getViewTypeStorageKey } from 'utils/configUtils';
import { OPENCART_REQ_HEADER_CODE } from 'utils/customizeCode';

import { skuInfoRenderer } from '../CartProCopy/renderer';
import style from './index.less';
import HeaderForm from './HeaderForm';
import TotalMount from './TotalMount';
import ReqFooter from './ReqFooter';

function ReqOpenCart(props) {
  const {
    location: { orderData },
    customizeForm,
    custLoading,
  } = props;
  const { openOrderInfo = {}, cartList, emptyCheckedFlag } = orderData || {};
  const {
    orderLineList = [],
    orderPriceInfo = {},
    currencySymbol,
    cartColumnDTOS = [],
    ...others
  } = openOrderInfo;
  const { realName } = getUserConfigInfo();
  const storageKey = getViewTypeStorageKey();
  const [cartViewType, setCartViewType] = useState(getStorage(storageKey) || 1);
  const [loading, setLoading] = useState(false);
  const [postage, setPostage] = useState({
    pending: false,
    data: {},
  });
  const hasGiftFlag = useMemo(() => orderLineList.some((n) => !isEmpty(n.productGiftDTOList)), [
    orderLineList,
  ]);

  useEffect(() => {
    if (isEmpty(orderData)) {
      props.history.push('/cart');
    }
  }, [orderData]);

  const formDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      forceValidate: true,
      fields: [
        {
          name: 'requestTypeLov',
          label: intl.get('mallf.reqOpenCart.model.requestType').d('申请类型'),
          type: 'object',
          valueField: 'value',
          textField: 'meaning',
          lovCode: 'S2FUL.MALL_REQUEST_TYPE',
          lovPara: {
            tenantId: getOrganizationId(),
          },
        },
        {
          name: 'prTypeCode',
          bind: 'requestTypeLov.value',
        },
        {
          name: 'prTypeName',
          bind: 'requestTypeLov.meaning',
        },
        {
          name: 'createByName',
          label: intl.get('mallf.reqOpenCart.model.requestBy').d('创建人'),
          disabled: true,
        },
        {
          name: 'handleByLov',
          type: 'object',
          label: intl.get('mallf.reqOpenCart.model.handleBy').d('受理人'),
          lovCode: 'SPUC.EMPLOYEE',
          // valueField: 'employeeId',
          // textField: 'name',
        },
        {
          name: 'handleUserId',
          bind: 'handleByLov.id',
        },
        {
          name: 'handleUserName',
          bind: 'handleByLov.realName',
        },
        {
          name: 'handleLoginName',
          bind: 'handleByLov.loginName',
        },
        {
          name: 'remark',
          label: intl.get('mallf.reqOpenCart.model.remark').d('申请说明'),
        },
        {
          name: 'outerAttachmentUuid',
          label: intl.get('mallf.common.view.outterAttachment').d('外部附件'),
          type: 'attachment',
          transformResponse: (val) => val || uuid(),
        },
        {
          name: 'attachmentUuid',
          label: intl.get('mallf.common.view.innerAttachment').d('内部附件'),
          type: 'attachment',
          transformResponse: (val) => val || uuid(),
        },
      ],
    });
  }, []);

  const tableDs = useMemo(() => {
    return new DataSet({
      primaryKey: 'lineSeq',
      autoQuery: false,
      paging: false,
      selection: false,
    });
  }, []);

  // 有二开逻辑
  CuxFn({
    name: 'ReqOpenCart-fn-initDs',
    value: { formDs, orderData },
  })();

  useEffect(() => {
    if (!isEmpty(orderLineList)) {
      const tableData = orderLineList.map((order) => {
        const { headerValueList = [], lineValueList = [], goodsName, productName } = order;
        const headerValue = handleFieldValue({ list: headerValueList, type: 'HEADER' });
        const lineValue = handleFieldValue({ list: lineValueList, type: 'LINE' });
        return {
          invalidFlag: 1,
          ...order,
          ...headerValue,
          ...lineValue,
          productName: goodsName || productName,
        };
      });
      formDs.loadData([
        {
          ...others,
          createByName: realName,
        },
      ]);
      tableDs.loadData(tableData);
      fetchPostage();
    }
  }, [orderLineList]);

  // 明细列
  const detailColumns = useMemo(() => {
    const columns = cartColumnDTOS.map((item) => {
      const { code, name, type } = item;
      const headerOrLine = type.includes('HEADER') ? 'HEADER' : 'LINE';
      const columnName = `${headerOrLine}${code}`;
      switch (code) {
        case 'taxIncludedPrice':
          return {
            name: 'taxIncludedPrice',
            header: cartColumnDTOS.find((p) => p.code === 'taxIncludedPrice')?.name,
            width: 160,
            align: 'right',
            renderer: ({ record }) => {
              const price = numberRender(record.get('taxIncludedPrice'));
              return (
                <div className="text-overflow" style={{ lineHeight: '18px' }}>
                  <div>
                    {`${currencySymbol}${price}${
                      record.get('uomName') ? `/${record.get('uomName')}` : ''
                    }`}
                  </div>
                  <ViewCompareList
                    r-if={record.get('productCompare')}
                    productCompare={record.get('productCompare') || {}}
                  />
                </div>
              );
            },
          };
        case 'quantity':
          return {
            name: 'quantity',
            header: cartColumnDTOS.find((p) => p.code === 'quantity')?.name,
            width: 160,
            renderer: ({ record }) => {
              return (
                <div className="text-overflow" style={{ lineHeight: '18px' }}>
                  {numberRender(record.get('quantity'))}
                </div>
              );
            },
          };
        case 'taxIncludedAmount':
          return {
            name: 'taxIncludedAmount',
            header: cartColumnDTOS.find((p) => p.code === 'taxIncludedAmount')?.name,
            width: 160,
            align: 'right',
            renderer: ({ record }) => {
              const { taxIncludedAmount, taxIncludedAmountMeaning } = record.get([
                'taxIncludedAmount',
                'taxIncludedAmountMeaning',
              ]);
              const price = taxIncludedAmountMeaning || taxIncludedAmount;
              return (
                <div
                  className="text-overflow"
                  style={{ color: getPriceColor(), lineHeight: '18px' }}
                >
                  {`${currencySymbol}${price}`}
                </div>
              );
            },
          };
        default:
          return {
            name: columnName,
            header: name,
            width: 180,
            renderer: ({ text, record }) => {
              const valueList =
                record.get(type.includes('HEADER') ? 'headerValueList' : 'lineValueList') || [];
              const { componentType } = valueList.find((n) => n.dimensionCode === code) || {};
              return componentType === 'UPLOAD' ? (
                <Attachment
                  name={columnName}
                  sortable
                  bucketName="private-bucket"
                  bucketDirectory="mall-front"
                  viewMode="popup"
                  funcType="link"
                  value={record.get(columnName)}
                  readOnly
                />
              ) : (
                <div className="text-overflow" style={{ lineHeight: '18px' }}>
                  {text || '-'}
                </div>
              );
            },
          };
      }
    });
    return columns || [];
  }, [openOrderInfo]);

  // 转换字段数据
  function handleFieldValue({ list = [], type }) {
    const valueObj = {};
    list.forEach((item) => {
      const { value, valueName, dimensionCode } = item;
      valueObj[`${type}${dimensionCode}`] = valueName || value;
    });
    return valueObj;
  }

  // 切换视图
  function changeViewType(type) {
    setCartViewType(type);
    setStorage(storageKey, type);
  }

  // 返回购物车
  async function handleBackCart() {
    const cuxflag = await CuxFn({
      name: 'ReqOpenCart-fn-beforeBackCart',
      value: { cartList, emptyCheckedFlag },
    })();
    if (cuxflag === false) return;
    props.history.push({
      pathname: '/cart',
      cartList: emptyCheckedFlag ? [] : cartList,
    });
  }

  // 查询运费
  async function fetchPostage() {
    const formData = formDs.current.toData();
    const params = {
      ...openOrderInfo,
      orderLineList: orderLineList?.map((m) => ({
        ...m,
        lineValueList: null,
        headerValueList: null,
      })),
      ...formData,
    };
    delete params.cartColumnDTOS;
    delete params.cartDTOList;
    try {
      setPostage((prev) => ({ ...prev, pending: true }));
      const res = await fetchOpenCartPostageInfo(params);
      if (res) {
        setPostage((prev) => ({ ...prev, data: res }));
      }
    } finally {
      setPostage((prev) => ({ ...prev, pending: false }));
    }
  }

  function submit() {
    if (hasGiftFlag) {
      Swal(
        intl
          .get(`mallf.companyOrder.model.GiftOrAttchment.numberMsg`)
          .d('所有赠品/附件按实际收到的数量为准。')
      ).then((res) => {
        if (res.value) {
          budgetValidateBeforeSubmit();
        }
      });
    } else {
      budgetValidateBeforeSubmit();
    }
  }

  async function budgetValidateBeforeSubmit() {
    const flag = await formDs.validate(); //  先校验字段在校验预算
    if (!flag) return;
    const data = openOrderInfo.orderLineList
      .map((n, index) => ({ ...n, orderSeq: index + 1 }))
      .filter((n) => n.budgetWarningFlag === 1);
    if (data && data.length > 0) {
      const ds = new DataSet({
        data,
        selection: false,
        paging: false,
        fields: [
          {
            name: 'orderSeq',
            label: intl.get(`mallf.common.view.lineSeq`).d('行号'),
          },
          {
            name: 'budgetWarningMsg',
            label: intl.get('mallf.common.view.warningMsg').d('提示'),
          },
        ],
      });
      const columns = [
        {
          name: 'orderSeq',
          width: 80,
        },
        {
          name: 'budgetWarningMsg',
        },
      ];
      Modal.open({
        title: intl.get('mallf.companyOrder.view.title.budgetWarning').d('预算校验提示'),
        destroyOnClose: true,
        mask: true,
        closable: true,
        style: { width: 560 },
        children: (
          <>
            <div style={{ marginBottom: 10, marginTop: -5 }}>
              {intl
                .get('mallf.companyOrder.view.title.budgetConfirm')
                .d('以下商品预算超量或超预警线，请确认是否继续提交')}
            </div>
            <Table dataSet={ds} columns={columns} style={{ maxHeight: 210 }} />
          </>
        ),
        onOk: () => {
          beforeHandleSubmit();
        },
      });
    } else {
      beforeHandleSubmit();
    }
  }

  function beforeHandleSubmit() {
    CuxFn({
      name: 'ReqOpenCart-fn-beforeHandleSubmit',
      value: {
        openOrderInfo,
        formDs,
        setLoading,
        history: props.history,
        handleSubmit,
      },
    })(() => {
      handleSubmit();
    })();
  }

  // 提交 TODO
  async function handleSubmit() {
    const formData = formDs.current.toData();
    const params = {
      ...openOrderInfo,
      orderLineList: orderLineList?.map((m) => ({
        ...m,
        address: {
          ...m.address,
          receiveChannel: 1, // 收货渠道 先默认mobile 可选项 2 email 1 mobile 邮箱 手机
        },
        lineValueList: null,
        headerValueList: null,
      })),
      ...formData,
    };
    delete params.cartColumnDTOS;
    delete params.cartDTOList;
    setLoading(true);
    reqOpenCartSubmitService(params)
      .then((res) => {
        if (res) {
          props.history.push('/req-open-cart/result');
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }

  const getColumns = useMemo(() => {
    // 简单视图列
    const simpleColumns =
      detailColumns.filter((col) =>
        ['taxIncludedPrice', 'quantity', 'taxIncludedAmount'].includes(col.name)
      ) || [];
    const simpleOrDeatilCol = cartViewType === 1 ? simpleColumns : detailColumns;
    const cuxColumns = CuxFn({ name: 'ReqOpenCart-fn-getColumns', value: { simpleOrDeatilCol } })(
      () => simpleOrDeatilCol
    )();
    return [
      {
        name: 'lineSeq',
        header: intl.get(`mallf.common.view.lineSeq`).d('行号'),
        width: 72,
        lock: 'left',
        renderer: ({ record }) => <div className="line-seq">{record.index + 1}</div>,
      },
      {
        name: 'skuInfo',
        header: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
        width: 360,
        tooltip: 'none',
        lock: 'left',
        renderer: ({ record, dataSet }) => (
          <div className="sku-info">
            {skuInfoRenderer({
              record,
              dataSet,
              showCustomFlag: false,
              imageWidth: 41,
              imageHeight: 41,
              labelShowFlag: false,
            })}
          </div>
        ),
      },
      ...cuxColumns,
    ];
  }, [cartViewType, detailColumns]);
  return (
    <Spin spinning={custLoading}>
      <div className={style['req-open-cart']}>
        <BreadCrumbs
          className="breadCrumbs"
          value={{
            pageTitle: intl.get(`mallf.reqOpenCart.view.requestPurchase`).d('预采购申请'),
          }}
        />
        <div className="req-wrapper">
          <div className="req-title">
            {intl.get('mallf.reqOpenCart.view.title').d('请确认申请信息')}
          </div>
          <HeaderForm dataSet={formDs} customizeForm={customizeForm} />
          <div className="cart-pro-header-left" r-if={[1, 2].includes(cartViewType)}>
            <div
              className={classNames(['cart-pro-type-item', { active: cartViewType === 1 }])}
              onClick={() => changeViewType(1)}
            >
              {intl.get('mallf.common.cart.viewType1').d('简易视图')}
            </div>
            <div
              className={classNames(['cart-pro-type-item', { active: cartViewType === 2 }])}
              onClick={() => changeViewType(2)}
            >
              {intl.get('mallf.common.cart.viewType2').d('明细视图')}
            </div>
          </div>
          <Table
            virtualCell
            dataSet={tableDs}
            columns={getColumns}
            rowHeight="auto"
            className="req-table"
            customizedCode={
              cartViewType === 1 ? 'MALL.OPENCART.REQ.TABLE' : 'MALL.OPENCART.REQ.DETAIL.TABLE'
            }
            style={{ maxHeight: 1343 }}
          />
          <TotalMount
            order={{ ...orderPriceInfo, currencySymbol, orderLineList }}
            postage={postage}
          />
          <ReqFooter loading={loading} handleSubmit={submit} handleBackCart={handleBackCart} />
        </div>
      </div>
    </Spin>
  );
}

export default compose(
  withRouter,
  c7nCustomize({ unitCode: [OPENCART_REQ_HEADER_CODE] }),
  formatterCollections({ code: ['mallf.reqOpenCart', 'mallf.companyOrder', 'mallf.cart'] })
)(ReqOpenCart);
