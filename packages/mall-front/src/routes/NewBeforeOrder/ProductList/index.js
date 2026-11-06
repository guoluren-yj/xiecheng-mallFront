/* eslint-disable no-param-reassign */
import React, { useState, useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { Icon } from 'hzero-ui';
import { Table, Icon as C7nIcon, Form } from 'choerodon-ui';
import { isEmpty, sum, isFunction, isNil } from 'lodash';
import moment from 'moment';
import { DataSet } from 'choerodon-ui/pro';

import { SpanTitle } from 'utils/renderer';
import customizes from 'cuxTools/customizes';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT
import {
  convertImg,
  priceNumberRender,
  numberRender,
  getPrimaryColor,
  getUserConfigInfo,
} from 'utils/utils';
import intl from 'utils/intl';
import Image from 'components/Image';
import Link from 'components/Link';
import LabelPreview, { SiglPrice } from 'components/LabelPreview';
import CustomInfo from 'components/CustomInfo';
import ViewCompareList from 'components/ViewCompareList';
// import { RECEIVE_LINE_CODE } from 'utils/customizeCode';
import ReadProductList from '../ReadProductList';
// import ProductListOperate from '../ProductListOperate';
import PreviewBtn from '../PreviewBtn';
import lineDs from '../CustomizeModal/lineDs';
import Remark from './Remark';
import ProductListOperate from '../ProductListOperate';
import getNeededDate from './NeedDate';
import GiftItem from '../../CartProCopy/GiftItem';

const FormItem = Form.Item;

function ProductList(props) {
  const ds = useMemo(() => new DataSet(lineDs()), []);
  const { hideFieldList = [] } = getUserConfigInfo();
  useLayoutEffect(() => {
    setOrderData((data) => {
      const newOrderData = [...data];
      newOrderData[orderIndex].productListForm = props.form;
      return newOrderData;
    });
  }, []);
  const {
    order,
    preOrder,
    products = [],
    orderData,
    orderIndex,
    setSubmitLoading,
    setOrderData,
    minPurchaseFlag = 1,
    applyExpedited,
    unitConfig,
    eCLineCode,
    cataLineCode,
    cSupply,
    setCtxParams,
    separateInitCustUnit,
    isReceive,
    lineCode,
  } = props;

  // const [remarkVisible, setRemarkVisible] = useState(false);
  const [currentProduct, setCurrentPrduct] = useState({});
  const [readVisible, setReadVisible] = useState(false);

  const fields = unitConfig[lineCode]?.fields;
  const remarkConfig = fields?.find((f) => f.fieldCode === 'remark') || {}; // 备注说明的个性化配置
  const neededDateConfig = fields?.find((f) => f.fieldCode === 'neededDate') || {};
  const hasLineCustFlag = fields?.some((p) => p.visible === 1);
  const hasEditCustomField = fields?.some((n) => n.editable === 1); // 有可编辑的个性化字段
  useMemo(() => {
    const changeList = customizes[lineCode] || {};
    products.forEach((product) => {
      const p = product;
      product.DS = ds.create(p);
    });
    separateInitCustUnit({
      code: lineCode,
      type: 'cSupply',
      extraConfig: {
        dataSet: ds,
        changeList,
        changeParams: { dataSet: ds },
      },
    });
  }, []);

  useEffect(() => {
    if (isFunction(neededDateConfig.defaultValue)) {
      order.shoppingCartDTOList.forEach((product) => {
        if (!product.DS) {
          product.DS = ds.create(product);
        }
        if (!product.neededDate) {
          product.neededDate = neededDateConfig.defaultValue(product.DS?.id);
        }
      });
    } else if (neededDateConfig.defaultValue) {
      order.shoppingCartDTOList.forEach((product) => {
        if (!product.neededDate) {
          product.neededDate = neededDateConfig.defaultValue;
        }
      });
    } else if (!hideFieldList.includes('DEMAND_DATE')) {
      order.shoppingCartDTOList.forEach((product) => {
        if (!product.neededDate) {
          product.neededDate = !isNil(product.deliveryCycle)
            ? moment().add(product.deliveryCycle, 'days').format(DEFAULT_DATETIME_FORMAT)
            : null;
        }
      });
    } else {
      // 隐藏了需求日期
      order.shoppingCartDTOList.forEach((product) => {
        if (!product.neededDate) {
          product.neededDate = moment()
            .add(product.deliveryCycle || 1, 'days')
            .format(DEFAULT_DATETIME_FORMAT);
        }
      });
    }
  }, [neededDateConfig.defaultValue]);

  const orderRef = useRef();
  orderRef.current = orderData;

  const productListOperateProps = {
    orderIndex,
    products,
    minPurchaseFlag,
    applyExpedited,
    unitConfig,
    lineCode,
    setOrderData,
    orderData,
    cSupply,
    dataSet: ds,
  };

  const headerCustomizedList = useMemo(
    () => preOrder?.orderLineList?.[0]?.orderLineValue?.headerCustomizedList || [],
    [preOrder?.orderLineList?.[0]]
  );
  const lineCustomizedList = useMemo(
    () => preOrder?.orderLineList?.[0]?.orderLineValue?.lineCustomizedList || [],
    [preOrder?.orderLineList?.[0]]
  );

  const columns = [
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
        // 定制品
        const customProps = {
          product,
          openMoadlIcon: (
            <C7nIcon
              className="detail-info-update"
              type="find_in_page"
              style={{ fontSize: 14, marginLeft: '4px', color: getPrimaryColor() }}
            />
          ),
          disabled: true,
        };
        if (remarkConfig.required === 1) products[productIndex].productRemarkFlag = 1;
        const { remark, remarkVisible, productIndex: index } = currentProduct;
        const visible = remarkVisible && index === productIndex;
        return (
          <>
            <div className="goods-img">
              <Link
                disabled={product.qtHeaderNo}
                to={`/product-detail?productId=${product.productId}&sourceFrom=${product.productSource}`}
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
                to={`/product-detail?productId=${product.productId}&sourceFrom=${product.productSource}`}
              >
                {product.productName}
              </Link>
              {product.customFlag === 1 && <CustomInfo {...customProps} />}
              {product.productAttributeDTOList && showAttributeInfo()}
              <Remark
                remarkConfig={remarkConfig}
                visible={visible}
                product={product}
                remark={remark}
                remarkChange={remarkChange}
                setCurrentPrduct={setCurrentPrduct}
                currentProduct={currentProduct}
                editRemark={editRemark}
                productIndex={productIndex}
              />
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
            {product.productErrorFlag ? (
              <div className="product-line-warn" style={{ marginTop: '8px' }}>
                <span>
                  <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
                  {intl
                    .get(`mallf.common.view.value.required`, {
                      value:
                        remarkConfig.fieldName ||
                        intl.get('mallf.common.view.remark.info').d('备注信息'),
                    })
                    .d(
                      `请填写${
                        remarkConfig.fieldName ||
                        intl.get('mallf.common.view.remark.info').d('备注信息')
                      }`
                    )}
                </span>
              </div>
            ) : (
              product.error && (
                <div className="product-line-warn" style={{ marginTop: '8px' }}>
                  <span>
                    <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
                    {intl
                      .get('mallf.common.fill.info.warning')
                      .d('补充信息不通过，点击补充信息查看详情')}
                  </span>
                </div>
              )
            )}
            <GiftItem giftData={product} />
          </>
        );
      },
    },
    ...getNeededDate({
      order,
      FormItem,
      form: props.form,
      setOrderData,
      orderIndex,
      products,
      orderData,
      fields,
      neededDateConfig,
      // lineCustomizedList, // 不能传，此行数据仅为第一条
      orderLineList: preOrder?.orderLineList,
      headerCustomizedList,
      dataSet: ds,
      isReceive,
    }),
    {
      title: intl.get(`mallf.companyOrder.model.companyOrder.unitPrice`).d('单价(含税)'),
      dataIndex: 'latestPrice',
      key: 'latestPrice',
      width: 110,
      align: 'right',
      render: (v, product) => {
        const {
          taxIncludedPrice,
          uomName,
          defaultPrecision,
          currencySymbol,
          productCompare,
        } = product;
        return (
          <>
            <div className="columns-item text-overflow" style={{ maxWidth: 170 }}>
              <SpanTitle style={{ display: 'block' }}>
                {currencySymbol || ''}
                {priceNumberRender(taxIncludedPrice, defaultPrecision)}
                {uomName ? `/${uomName}` : ''}
              </SpanTitle>
              <ViewCompareList r-if={productCompare} productCompare={productCompare} />
            </div>
          </>
        );
      },
    },
    {
      title: '',
      dataIndex: 'none1',
      key: 'none1',
      width: 30,
      render: () => {
        return <></>;
      },
    },
    {
      title: intl.get(`mallf.myMall.model.companyOrder.count`).d('数量'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (v, product) => {
        const { quantity } = product;
        return (
          <div className="columns-item text-overflow" title={quantity} style={{ maxWidth: 100 }}>
            {quantity}
          </div>
        );
      },
    },
    {
      title: intl.get(`mallf.companyOrder.model.companyOrder.linetotal`).d('行金额(含税)'),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 132,
      align: 'right',
      render: (v, product) => {
        const { taxIncludedAmount, financialPrecision, currencySymbol } = product;
        return (
          <div className="columns-item product-price">
            <p
              className="text-overflow"
              style={{ maxWidth: 120 }}
              title={`${currencySymbol || ''}${numberRender(
                taxIncludedAmount,
                financialPrecision,
                true
              )}`}
            >
              {currencySymbol || ''}
              {numberRender(taxIncludedAmount, financialPrecision, true)}
              {/* {currencyName} */}
            </p>
            <div>
              <SiglPrice style={{ marginTop: 6 }} pointPrice={product.totalPointPrice} />
            </div>
          </div>
        );
      },
    },
    {
      title: '',
      dataIndex: 'none2',
      key: 'none2',
      width: 30,
      render: () => {
        return <></>;
      },
    },
    {
      title: intl.get('hzero.common.action').d('操作'),
      dataIndex: 'other',
      key: 'other',
      width: 90,
      render: (v, product, index) => {
        return (
          <ProductListOperate
            preProduct={preOrder?.orderLineList?.[index]}
            hasLineCustFlag={hasLineCustFlag}
            hasEditCustomField={hasEditCustomField}
            setCtxParams={setCtxParams}
            order={order}
            product={product}
            index={index}
            isReceive={isReceive}
            {...productListOperateProps}
          />
        );
      },
    },
  ];

  const editRemark = () => {
    const newOrderData = orderData;
    newOrderData[orderIndex].shoppingCartDTOList.forEach((p, index) => {
      if (p.productId === currentProduct.productId && index === currentProduct.productIndex) {
        p.remark = currentProduct.remark;
        p.productErrorFlag = false;
        if (p.DS) {
          p.DS.set('remark', currentProduct.remark);
        }
      }
    });
    setOrderData(newOrderData);
    setCurrentPrduct({});
  };

  const remarkChange = (e) => {
    const val = e.target.value;
    setCurrentPrduct({ ...currentProduct, remark: val });
  };

  // const remarkEditModal = () => {
  //   return (
  //     <Modal
  //       destroyOnClose
  //       wrapClassName="hmall-content-Modal add-adrees-modal"
  //       width={400}
  //       title={remarkConfig.fieldName || intl.get('mallf.common.view.product.remark').d('商品备注')}
  //       visible={remarkVisible}
  //       okText={intl.get(`mallf.common.model.confirm`).d('确认')}
  //       cancelText={intl.get(`mallf.common.button.cancel`).d('取消')}
  //       onCancel={() => setRemarkVisible(false)}
  //       onOk={editRemark}
  //     >
  //       <TextArea value={currentProduct.remark} rows={3} onChange={(e) => remarkChange(e)} />
  //     </Modal>
  //   );
  // };
  return (
    <div className="product-list BeforeCompanyOrder-ProductList">
      <p>
        {intl.get(`mallf.common.view.productInformation`).d('商品信息')}
        <PreviewBtn
          remarkConfig={remarkConfig}
          neededDateConfig={neededDateConfig}
          hasLineCustFlag={hasLineCustFlag}
          setReadVisible={setReadVisible}
          headerCustomizedList={headerCustomizedList}
          lineCustomizedList={lineCustomizedList}
        />
      </p>
      <Form>
        <Table
          dataSource={products}
          filterBar={false}
          columns={columns}
          pagination={false}
          scroll={{ x: sum(columns.map((n) => n.width)) }}
        />
      </Form>
      {/* {remarkVisible && remarkEditModal()} */}
      {readVisible && (
        <ReadProductList
          products={products}
          preProducts={preOrder?.orderLineList}
          readVisible={readVisible}
          setReadVisible={setReadVisible}
          eCLineCode={eCLineCode}
          cataLineCode={cataLineCode}
          unitConfig={unitConfig}
          cSupply={props.cSupply}
          orderData={orderData}
          orderIndex={orderIndex}
          setSubmitLoading={setSubmitLoading}
          setOrderData={setOrderData}
          minPurchaseFlag={minPurchaseFlag}
          applyExpedited={applyExpedited}
          isReceive={isReceive}
        />
      )}
    </div>
  );
}

export default Form.create({ fieldNameProp: null })(ProductList);
