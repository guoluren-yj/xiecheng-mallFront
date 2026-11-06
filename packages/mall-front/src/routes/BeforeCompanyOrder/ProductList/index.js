/* eslint-disable no-param-reassign */
import React, { useState, useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { Icon } from 'hzero-ui';
import moment from 'moment';
import { Table, Icon as C7nIcon, Form } from 'choerodon-ui';
import { isEmpty, sum, isFunction, isNil } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';

import { SpanTitle } from 'utils/renderer';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT
import { updateCartService } from 'services/cartService';
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
import cuxComponent from 'cuxTools/cuxComponent';
import ReadProductList from '../ReadProductList';
import Remark from './Remark';
import headerDs from '../CustomizeModal/lineDs';
import getNeededDate from './NeedDate';
import getProductErrorTip from './ProductErrorTip';
import ProductListOperate from '../ProductListOperate';
import PreviewBtn from '../PreviewBtn';
import GiftItem from '../../Cart/GiftItem';

const FormItem = Form.Item;

function ProductList(props) {
  const ds = useMemo(() => new DataSet(headerDs()), []);
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
    products = [],
    orderData,
    budgetList,
    budgetSelectList,
    editBudget,
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
  } = props;
  const lineCode =
    orderData[orderIndex].shoppingCartDTOList[0].productSource === 'CATA'
      ? cataLineCode
      : eCLineCode;
  // const [remarkVisible, setRemarkVisible] = useState(false);
  const [currentProduct, setCurrentPrduct] = useState({});
  const [readVisible, setReadVisible] = useState(false);
  const [initCust, setInitCust] = useState(false);

  const fields = unitConfig[lineCode]?.fields;
  const remarkConfig = fields?.find((f) => f.fieldCode === 'remark') || {}; // 备注说明的个性化配置
  const neededDateConfig = fields?.find((f) => f.fieldCode === 'neededDate') || {};
  const hasLineCustFlag = fields?.some((p) => p.visible === 1);
  const hasEditCustomField = fields?.some((n) => n.editable === 1); // 有可编辑的个性化字段
  useMemo(() => {
    separateInitCustUnit({
      code: lineCode,
      type: 'cSupply',
      extraConfig: {
        dataSet: ds,
      },
    });
    setInitCust(true);
  }, []);

  useEffect(() => {
    if (initCust) {
      if (isFunction(neededDateConfig.defaultValue)) {
        order.shoppingCartDTOList.forEach((product) => {
          if (!product.DS) {
            product.DS = ds.create(product);
          }
          product.neededDate = neededDateConfig.defaultValue(product.DS?.id);
        });
      } else if (neededDateConfig.defaultValue) {
        order.shoppingCartDTOList.forEach((product) => {
          product.neededDate = neededDateConfig.defaultValue;
        });
      } else if (!hideFieldList.includes('DEMAND_DATE')) {
        order.shoppingCartDTOList.forEach((product) => {
          product.neededDate = !isNil(product.deliveryCycle)
            ? moment().add(product.deliveryCycle, 'days').format(DEFAULT_DATETIME_FORMAT)
            : null;
        });
      } else {
        // 隐藏了需求日期
        order.shoppingCartDTOList.forEach((product) => {
          product.neededDate = moment()
            .add(product.deliveryCycle || 1, 'days')
            .format(DEFAULT_DATETIME_FORMAT);
        });
      }
    }
  }, [neededDateConfig.defaultValue, initCust]);

  const orderRef = useRef();
  orderRef.current = orderData;

  const productListOperateProps = {
    budgetList,
    budgetSelectList,
    editBudget,
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

  // function handleChange(value, field) {
  //   setOrderData(data => {
  //     const newOrderData = [...data];
  //     newOrderData[orderIndex][field] = value;
  //     newOrderData[orderIndex].purchaseHeaderForm = props.form;
  //     return newOrderData;
  //   });
  // }

  const columns = [
    {
      title: intl.get(`mallf.companyOrder.view.productInformation`).d('商品信息'),
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
        const { remark, remarkVisible, productId } = currentProduct;
        const visible = remarkVisible && productId === product.productId;
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
                product={product}
                visible={visible}
                remark={remark}
                remarkChange={remarkChange}
                currentProduct={currentProduct}
                setCurrentPrduct={setCurrentPrduct}
                productIndex={productIndex}
                editRemark={editRemark}
                order={order}
                setOrderData={setOrderData}
                orderIndex={orderIndex}
              />
              {!isEmpty(labelList) ||
                (product.agreementBusinessType === 'POINTS' && (
                  <div className="product-label center-content">
                    {product.agreementBusinessType === 'POINTS' && (
                      <LabelPreview
                        cursor="grab"
                        code="E"
                        value={intl.get('mallf.companyOrder.view.sigl.product').d('积分商品')}
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
                    .get(`mallf.companyOrder.view.value.required`, {
                      value:
                        remarkConfig.fieldName ||
                        intl.get('mallf.companyOrder.view.remark.info').d('备注信息'),
                    })
                    .d(
                      `请填写${
                        remarkConfig.fieldName ||
                        intl.get('mallf.companyOrder.view.remark.info').d('备注信息')
                      }`
                    )}
                </span>
              </div>
            ) : (
              getProductErrorTip(product)
            )}
            <GiftItem giftData={product.productGiftDTO} quantity={product.quantity} />
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
    }),
    {
      title: intl.get(`mallf.companyOrder.model.companyOrder.unitPrice`).d('单价(含税)'),
      dataIndex: 'latestPrice',
      key: 'latestPrice',
      width: 110,
      align: 'right',
      render: (v, product) => {
        const { latestPrice, uomName, defaultPrecision, currencySymbol } = product;
        return (
          <>
            <div className="columns-item text-overflow" style={{ maxWidth: 170 }}>
              {currencySymbol || ''}
              <SpanTitle>{priceNumberRender(latestPrice, defaultPrecision)}</SpanTitle>
              {uomName ? `/${uomName}` : ''}
              <p>
                <SiglPrice style={{ marginTop: 6 }} pointPrice={product.pointPrice} />
              </p>
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
      title: intl.get(`mallf.companyOrder.model.companyOrder.count`).d('数量'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (v, product) => {
        const { quantity } = product;
        return <div className="columns-item">{quantity}</div>;
      },
    },
    {
      title: intl.get(`mallf.companyOrder.model.companyOrder.linetotal`).d('行金额(含税)'),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 100,
      align: 'right',
      render: (v, product) => {
        const { totalPrice, /* currencyCode, */ financialPrecision, currencySymbol } = product;
        return (
          <div className="columns-item product-price">
            <p
              className="text-overflow"
              style={{ maxWidth: 120 }}
              title={`${currencySymbol || ''}${numberRender(totalPrice, financialPrecision, true)}`}
            >
              {currencySymbol || ''}
              {numberRender(totalPrice, financialPrecision, true)}
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
      title: intl.get('mallf.companyOrder.renderer.action').d('操作'),
      dataIndex: 'other',
      key: 'other',
      width: 90,
      render: (v, product, index) => {
        return (
          <ProductListOperate
            initCust={initCust}
            hasLineCustFlag={hasLineCustFlag}
            hasEditCustomField={hasEditCustomField}
            setCtxParams={setCtxParams}
            order={order}
            product={product}
            index={index}
            {...productListOperateProps}
          />
        );
      },
    },
  ];

  const editRemark = () => {
    setSubmitLoading(true);
    const { DS, ...pro } = currentProduct;
    updateCartService(pro)
      .then((res) => {
        if (res) {
          const newOrderData = orderData;
          newOrderData[orderIndex].shoppingCartDTOList.forEach((p, index) => {
            if (p.productId === currentProduct.productId && index === currentProduct.productIndex) {
              p.remark = res.remark;
              p.productErrorFlag = false;
              if (p.DS) {
                p.DS.set('remark', res.remark);
              }
            }
          });
          setOrderData(newOrderData);
        }
      })
      .finally(() => {
        setSubmitLoading(false);
      });
    // setRemarkVisible(false);
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
  //       title={
  //         remarkConfig.fieldName || intl.get('mallf.companyOrder.view.product.remark').d('商品备注')
  //       }
  //       visible={remarkVisible}
  //       okText={intl.get(`mallf.companyOrder.model.confirm`).d('确认')}
  //       cancelText={intl.get(`mallf.companyOrder.button.cancel`).d('取消')}
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
        {intl.get(`mallf.companyOrder.view.productInformation`).d('商品信息')}
        <PreviewBtn
          remarkConfig={remarkConfig}
          neededDateConfig={neededDateConfig}
          hasLineCustFlag={hasLineCustFlag}
          setReadVisible={setReadVisible}
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
          readVisible={readVisible}
          setReadVisible={setReadVisible}
          eCLineCode={eCLineCode}
          cataLineCode={cataLineCode}
          unitConfig={unitConfig}
          cSupply={props.cSupply}
          orderData={orderData}
          budgetList={budgetList}
          budgetSelectList={budgetSelectList}
          editBudget={editBudget}
          orderIndex={orderIndex}
          setSubmitLoading={setSubmitLoading}
          setOrderData={setOrderData}
          minPurchaseFlag={minPurchaseFlag}
          applyExpedited={applyExpedited}
        />
      )}
    </div>
  );
}

export default Form.create({ fieldNameProp: null })(
  cuxComponent({ path: 'BeforeCompanyOrder/ProductList' })(ProductList)
);
