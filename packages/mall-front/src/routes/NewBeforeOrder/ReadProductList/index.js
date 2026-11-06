import React, { useRef, useMemo } from 'react';
import { Icon } from 'hzero-ui';
import { Table, Modal, Form, Button, Popover, Switch, Checkbox } from 'choerodon-ui';
import { isEmpty, sum } from 'lodash';

import { SpanTitle } from 'utils/renderer';
import { convertImg, numberRender, getPrimaryColor, priceNumberRender } from 'utils/utils';
import intl from 'utils/intl';
import Image from 'components/Image';
import Link from 'components/Link';
import LabelPreview from 'components/LabelPreview';
import styles from './index.less';
import PersonInfo from '@/routes/BeforeCompanyOrder/PersonInfo';

const { Sidebar } = Modal;

function ReadProductList(props) {
  const {
    orderData,
    orderIndex,
    setReadVisible,
    readVisible,
    eCLineCode,
    cataLineCode,
    unitConfig,
    remarkConfig,
    preProducts = [],
    isReceive,
  } = props;

  const exatData = preProducts?.map((pro) => {
    return [
      ...pro?.orderLineValue?.headerCustomizedList,
      ...pro?.orderLineValue?.lineCustomizedList,
    ]?.map((p) => {
      return {
        [p.dimensionId]: p.valueName || p.value,
      };
    });
  });

  const products = orderData[orderIndex].shoppingCartDTOList.map((p, i) => {
    return { ...p.DS.toData(), remark: p.remark, ...(Object.assign({}, ...exatData?.[i]) || {}) };
  });

  const custCloumns = useMemo(() => {
    const custCode = products?.[0].productSource === 'CATA' ? cataLineCode : eCLineCode;
    const { fields = [] } = unitConfig[custCode] || {};
    return isReceive
      ? []
      : fields
          .filter((p) => p.visible === 1)
          .map((p) => {
            switch (p.fieldType) {
              case 'UPLOAD':
              case 'EMPTY':
              case 'LINK':
              case 'TL_EDITOR':
                return null;
              case 'LOV':
              case 'SELECT':
                return {
                  title: p.fieldName,
                  dataIndex: p.fieldCode?.replace('Lov', 'Meaning').replace('Select', 'Meaning'),
                  width: 150,
                };
              case 'SWITCH':
                return {
                  title: p.fieldName,
                  dataIndex: p.fieldCode,
                  width: 150,
                  render: (v, record) => {
                    return (
                      <Switch defaultValue={p.defaultValue === '1'} checked={record[p.fieldCode]} />
                    );
                  },
                };
              case 'CHECKBOX':
                return {
                  title: p.fieldName,
                  dataIndex: p.fieldCode,
                  width: 150,
                  render: (v, record) => {
                    return (
                      <Checkbox
                        defaultValue={p.defaultValue === '1'}
                        checked={record[p.fieldCode]}
                      />
                    );
                  },
                };
              default:
                return {
                  title: p.fieldName,
                  dataIndex: p.fieldCode,
                  width: 150,
                  render: (value) => {
                    return <div>{value}</div>;
                  },
                };
            }
          })
          .filter((p) => !!p);
  }, [unitConfig, products]);

  const allocationInfoCloumns = useMemo(() => {
    const data = preProducts?.[0] || {};
    const { headerCustomizedList = [], lineCustomizedList = [] } = data.orderLineValue || {};
    const list = [
      ...headerCustomizedList?.filter((f) => f.displayFlag === 1 && f.mappingHeadFlag !== 1),
      ...lineCustomizedList?.filter((f) => f.displayFlag === 1),
    ];
    return list
      ?.filter((n) => n.componentType !== 'UPLOAD')
      ?.map((field) => ({
        width: 150,
        dataIndex: `${field?.dimensionId}`,
        key: `${field?.dimensionId}`,
        title: field?.dimensionName,
        render: (value) => {
          return <div>{value}</div>;
        },
      }));
  }, []);

  const orderRef = useRef();
  orderRef.current = orderData;

  const columns = [
    {
      title: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
      dataIndex: 'product',
      key: 'product',
      width: 440,
      fixed: 'left',
      render: (v, product) => {
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
            <div style={{ display: 'inline-block' }}>
              <div className="goods-product-name">
                <Link
                  title={product.productName}
                  className="goods-name"
                  disabled={product.qtHeaderNo}
                  to={`/product-detail?productId=${product.productId}&sourceFrom=${product.productSource}`}
                >
                  {product.productName}
                </Link>
              </div>
              {!isEmpty(labelList) && (
                <div className="product-label center-content" style={{ paddingLeft: 10 }}>
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
      title: products.find((p) => !!p.businessCardFlag)
        ? intl.get(`mallf.myMall.model..info`).d('人员信息')
        : '',
      dataIndex: 'name',
      key: 'personInfo',
      width: 68,
      render: (v, product) => {
        return (
          <div className="columns-item">
            <PersonInfo product={product} cardInfo={product} />
          </div>
        );
      },
    },
    {
      title: intl.get(`mallf.companyOrder.model.companyOrder.unitPrice`).d('单价(含税)'),
      dataIndex: 'taxIncludedPrice',
      key: 'taxIncludedPrice',
      width: 130,
      align: 'right',
      render: (v, product) => {
        const { taxIncludedPrice, uomName, defaultPrecision, currencySymbol } = product;
        return (
          <>
            <div className="text-overflow">
              <SpanTitle>
                {currencySymbol || ''}
                {priceNumberRender(taxIncludedPrice, defaultPrecision)}
                {uomName ? `/${uomName}` : ''}
              </SpanTitle>
            </div>
          </>
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
        return <div>{quantity}</div>;
      },
    },
    {
      title: intl.get('mallf.common.view.line.amount.price').d('行金额(含税)'),
      dataIndex: 'taxIncludedAmount',
      key: 'taxIncludedAmount',
      width: 120,
      align: 'right',
      render: (v, product) => {
        const { taxIncludedAmount, financialPrecision, currencySymbol } = product;
        return (
          <div className="product-price">
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
          </div>
        );
      },
    },
    {
      title: remarkConfig?.fieldName || intl.get('mallf.common.view.remark.info').d('备注信息'),
      dataIndex: 'remark',
      key: 'remark',
      align: 'left',
      width: 150,
      render: (val) => {
        return (
          <Popover content={val}>
            <span>{val?.length > 15 ? `${val.substring(0, 15)}...` : val}</span>
          </Popover>
        );
      },
    },
    ...custCloumns,
    ...allocationInfoCloumns,
  ];

  return (
    <div className="product-list BeforeCompanyOrder-ProductList">
      <Sidebar
        title={intl.get('mallf.common.view.fill.preProInfo').d('预览商品信息')}
        className={styles.content}
        visible={readVisible}
        onCancel={() => setReadVisible(false)}
        width={1190}
        footer={
          <Button
            className="footer-btn-cancel"
            style={{ background: getPrimaryColor(), color: '#fff' }}
            key="back"
            onClick={() => {
              setReadVisible(false);
            }}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        }
      >
        <Table
          dataSource={products}
          filterBar={false}
          columns={columns}
          pagination={false}
          scroll={{ x: sum(columns.map((n) => n.width)) }}
        />
      </Sidebar>
    </div>
  );
}

export default Form.create({ fieldNameProp: null })(ReadProductList);
