import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from 'hzero-ui';
import { Table, Popover, Modal, Input, Form, Icon as C7nIcon, Button } from 'choerodon-ui';
import { isEmpty, sum } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';

import Icons from 'components/Icons';
import { fetchCardInfo, updateCartService } from 'services/cartService';
import { convertImg, numberRender, getUserConfigInfo, getPrimaryColor } from 'utils/utils';
import intl from 'utils/intl';
import Image from 'components/Image';
import Link from 'components/Link';
import LabelPreview from 'components/LabelPreview';
import ReadProductList from 'mall-front/lib/routes/BeforeCompanyOrder/ReadProductList';
import headerDs from 'mall-front/lib/routes/BeforeCompanyOrder/CustomizeModal/lineDs';
import ProductListOperate from './ProductListOperate';

const { TextArea } = Input;

function ProductList(props) {
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
  const ds = useMemo(() => new DataSet(headerDs()), []);
  const { userId } = getUserConfigInfo();

  const [remarkVisible, setRemarkVisible] = useState(false);
  const [currentProduct, setCurrentPrduct] = useState({});
  const [readVisible, setReadVisible] = useState(false);

  useEffect(() => {
    let shoppingCartList = [];
    orderData.forEach((n) => {
      shoppingCartList = [...shoppingCartList, ...n.shoppingCartDTOList];
    });
    const cardFlag = shoppingCartList.some((n) => !!n.businessCardFlag);
    if (cardFlag) {
      fetchCardInfo(userId).then((res) => {
        if (res) {
          const newOrderData = [...orderData];
          newOrderData.forEach((o) => {
            o.shoppingCartDTOList.forEach((p, i) => {
              if (p.businessCardFlag) {
                // eslint-disable-next-line no-param-reassign
                o.shoppingCartDTOList[i] = { ...p, ...res };
              }
            });
          });
          setOrderData(newOrderData);
        }
      });
    }
  }, []);

  const hasLineCustFlag = unitConfig[lineCode]?.fields?.some((p) => p.visible === 1);
  if (hasLineCustFlag) {
    separateInitCustUnit({
      code: lineCode,
      type: 'cSupply',
      extraConfig: {
        dataSet: ds,
      },
    });
  }

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

  const columns = [
    {
      title: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
      dataIndex: 'product',
      key: 'product',
      width: 440,
      fixed: 'left',
      render: (v, product, productIndex) => {
        const { productLabelDTOList = [] } = product?.labels || {}; // 商品标签
        const labelList =
          productLabelDTOList.length > 3 ? productLabelDTOList.slice(0, 3) : productLabelDTOList;
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
              <p className="goods-remark">
                <span className="goods-remark-label">
                  {intl.get('mallf.common.view.remark.info').d('备注信息')}：
                </span>
                <Popover content={product.remark}>
                  <span>
                    {product.remark?.length > 15
                      ? `${product.remark.substring(0, 15)}...`
                      : product.remark}
                  </span>
                </Popover>
                <C7nIcon
                  className="detail-info-update"
                  type="mode_edit"
                  style={{ fontSize: 12, marginLeft: '4px', color: getPrimaryColor() }}
                  onClick={() => {
                    setRemarkVisible(true);
                    setCurrentPrduct({ ...product, productIndex });
                  }}
                />
              </p>
              {!isEmpty(labelList) && (
                <div className="product-label center-content">
                  {labelList.map((n) => (
                    <LabelPreview cursor="grab" code={n.labelColorCode} value={n.labelName} />
                  ))}
                </div>
              )}
            </div>
            {product.error && (
              <div className="product-line-warn" style={{ marginTop: '8px' }}>
                <span>
                  <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
                  {intl
                    .get('mallf.common.fill.info.warning')
                    .d('补充信息不通过，点击补充信息查看详情')}
                </span>
              </div>
            )}
          </>
        );
      },
    },
    {
      title: intl.get(`mallf.common.model.CMS.num`).d('CMS合同号'),
      dataIndex: 'cmsNumber',
      key: 'cmsNumber',
      width: 108,
      render: (v, product, index) => order.watsonsShoppingCartDTOList[index].cmsNumber,
    },
    {
      title: intl.get(`mallf.myMall.model.companyOrder.unitPrice`).d('单价'),
      dataIndex: 'latestPrice',
      key: 'latestPrice',
      width: 128,
      align: 'right',
      render: (v, product) => {
        const { latestPrice, uomName } = product;
        return (
          <div className="columns-item">
            {numberRender(latestPrice)}
            {uomName ? `/${uomName}` : ''}
          </div>
        );
      },
    },
    {
      title: '',
      dataIndex: 'none1',
      key: 'none1',
      width: 100,
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
        return <div className="columns-item">{quantity}</div>;
      },
    },
    {
      title: intl.get('mallf.common.view.line.amount.price').d('行金额(含税)'),
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      align: 'right',
      render: (v, product) => {
        const { totalPrice, currencyCode } = product;
        return (
          <div className="columns-item product-price">
            <p>{numberRender(totalPrice)}</p>
            <p>{currencyCode}</p>
          </div>
        );
      },
    },
    {
      title: '',
      dataIndex: 'none2',
      key: 'none2',
      width: 60,
      render: () => {
        return <></>;
      },
    },
    // ...customizeColumns(),
    {
      title: intl.get('hzero.common.action').d('操作'),
      dataIndex: 'other',
      key: 'other',
      width: 100,
      render: (v, product, index) => {
        return (
          <ProductListOperate
            hasLineCustFlag={hasLineCustFlag}
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
    updateCartService(currentProduct)
      .then((res) => {
        if (res) {
          const newOrderData = orderData;
          newOrderData[orderIndex].shoppingCartDTOList.forEach((p, index) => {
            if (p.productId === currentProduct.productId && index === currentProduct.productIndex) {
              // eslint-disable-next-line no-param-reassign
              p.remark = res.remark;
            }
          });
          setOrderData(newOrderData);
        }
      })
      .finally(() => {
        setSubmitLoading(false);
      });
    setRemarkVisible(false);
    setCurrentPrduct({});
  };

  const remarkChange = (e) => {
    const val = e.target.value;
    setCurrentPrduct({ ...currentProduct, remark: val });
  };

  const remarkEditModal = () => {
    return (
      <Modal
        destroyOnClose
        wrapClassName="hmall-content-Modal add-adrees-modal"
        width={400}
        title={intl.get('mallf.common.view.product.remark').d('商品备注')}
        visible={remarkVisible}
        okText={intl.get(`mallf.common.model.confirm`).d('确认')}
        cancelText={intl.get(`mallf.common.button.cancel`).d('取消')}
        onCancel={() => setRemarkVisible(false)}
        onOk={editRemark}
      >
        <TextArea value={currentProduct.remark} rows={3} onChange={(e) => remarkChange(e)} />
      </Modal>
    );
  };
  return (
    <div className="product-list BeforeCompanyOrder-ProductList">
      <p>
        {intl.get(`mallf.common.view.productInformation`).d('商品信息')}
        {hasLineCustFlag && (
          <span
            className="primary-color"
            onClick={() => {
              setReadVisible(true);
            }}
            style={{ float: 'right' }}
          >
            <Icons type="preview-24px" style={{ position: 'relative', top: 2 }} />
            <Button className="primary-color">
              {intl.get('mallf.common.model.preview').d('预览')}
            </Button>
          </span>
        )}
      </p>
      <Table
        dataSource={products}
        filterBar={false}
        columns={columns}
        pagination={false}
        scroll={{ x: sum(columns.map((n) => n.width)) }}
      />
      {remarkVisible && remarkEditModal()}
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

export default Form.create({ fieldNameProp: null })(ProductList);
