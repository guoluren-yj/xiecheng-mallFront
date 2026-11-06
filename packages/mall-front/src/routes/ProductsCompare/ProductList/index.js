import React, { useMemo, useEffect } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { Observer } from 'mobx-react';

import { getUserConfigInfo } from 'utils/utils';
import Image from 'components/Image';
import Link from 'components/Link';
import intl from 'utils/intl';
import CuxFn from '@/cuxTools/cuxFn';
import { getIsHideSupplierFlag } from 'utils/configUtils';
import { ShowManuallyCompare, validCompareLimit } from 'utils/renderer';
import { fetchIsSameSku } from 'services/productListService';
import styles from './index.less';

export default function Productlist(props) {
  const { primaryProduct = {}, onCompare = (e) => e, modal } = props;
  const data =
    props.data?.filter((p) => p.productId && primaryProduct.productId !== p.productId) || [];
  data.unshift(primaryProduct);
  const { regionId, defaultAddress, levelPath, hideFieldList } = getUserConfigInfo();
  const tableDs = useMemo(() => {
    const fields = [
      {
        name: 'lineNum',
        label: intl.get(`mallf.common.view.orderSeq`).d('序号'),
      },
      {
        name: 'productInfo',
        label: intl.get(`mallf.common.view.productInformation`).d('商品信息'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('mallf.common.view.supplier').d('供应商'),
      },
      {
        name: 'isSameProduct',
        label: intl.get('mallf.common.view.isSameProduct').d('是否同款推荐'),
      },
      {
        name: 'price',
        label: intl.get(`mallf.common.view.single.price`).d('单价'),
      },
      {
        name: 'operate',
        label: intl.get(`hzero.common.action`).d('操作'),
      },
    ].concat(
      ...CuxFn({
        name: 'ProductsCompare-fn-fieldsCux',
      })(() => [])()
    );
    return new DataSet({
      paging: false,
      selection: false,
      data: data.map((p, i) => ({ ...p, lineNum: i + 1 })),
      fields,
    });
  }, []);

  useEffect(() => {
    modal.update({
      footer: [
        <Observer>
          {() => {
            const compareList = tableDs ? tableDs.toData() : [];
            const msg = validCompareLimit(compareList);
            return (
              <>
                <ShowManuallyCompare
                  tooltip={msg}
                  style={{ display: 'inline-flex' }}
                  iconStyle={{ alignSelf: 'center' }}
                >
                  <Button
                    waitType="throttle"
                    wait={500}
                    loading={tableDs.getState('addPriceLoading')}
                    color="primary"
                    disabled={msg}
                    onClick={() => onCompare(tableDs)}
                  >
                    {intl.get('mallf.productsCompare.model.btn.createCompare').d('生成比价单')}
                  </Button>
                </ShowManuallyCompare>
              </>
            );
          }}
        </Observer>,
        <Button onClick={() => modal.close()} style={{ marginLeft: '8px' }}>
          {intl.get('hzero.common.btn.cancel').d('取消')}
        </Button>,
      ],
    });
    fetchIsSameSku({
      productId: primaryProduct.productId,
      regionId,
      addressId: defaultAddress.addressId,
      levelPath,
      checkSkuIds: data.map((p) => p.productId),
    }).then((res) => {
      if (!isEmpty(res)) {
        const newData = tableDs.toData().map((p) => {
          if (res?.checkSkuIds?.includes(p.productId)) {
            return { ...p, isSameProduct: 1 };
          } else {
            return p;
          }
        });
        tableDs.loadData(newData);
      }
    });
  }, []);

  const columns = [
    {
      name: 'lineNum',
      width: 50,
    },
    ...CuxFn({
      name: 'ProductsCompare-fn-columnsCux',
      value: {
        columns,
        hideFieldList,
      },
    })(() => [
      {
        name: 'productInfo',
        renderer: ({ record }) => {
          const linkProps = {
            disabled: !record.get('productId'),
            to: `/product-detail?productId=${record.get('productId')}&sourceFrom=${record.get(
              'sourceFrom'
            )}`,
          };
          return (
            <div className="product-info">
              <Link className="product-info-img" {...linkProps}>
                <Image value={record.get('imagePath')} width={40} height={40} />
              </Link>
              <a className="product-info-name" {...linkProps}>
                <p className="product-info-name" title={record.get('productName')}>
                  {record.get('productName')}
                </p>
              </a>
            </div>
          );
        },
      },
      !getIsHideSupplierFlag() && {
        name: 'supplierCompanyName',
        width: 220,
      },
      {
        name: 'isSameProduct',
        width: 140,
        renderer: ({ record, value }) => {
          return record.get('productId') === primaryProduct?.productId
            ? intl.get('mallf.common.view.masterProduct').d('主商品')
            : value
            ? intl.get('hzero.common.yes').d('是')
            : intl.get('hzero.common.no').d('否');
        },
      },
    ])(),
    {
      name: 'price',
      align: 'right',
      width: 120,
      renderer: ({ value, record }) => {
        return (
          <span className="price-color">
            {record.get('currencySymbol')}
            {record.get('priceMeaning') || value}
          </span>
        );
      },
    },
    {
      name: 'operate',
      width: 120,
      renderer: ({ record }) => {
        return (
          <Button
            color="primary"
            onClick={() => {
              // eslint-disable-next-line no-param-reassign
              record.status = 'add';
              tableDs.remove(record);
            }}
            disabled={record.get('productId') === primaryProduct?.productId || tableDs.length <= 2}
            funcType="link"
          >
            {intl.get(`mallf.common.view.cart.delete.product`).d('删除商品')}
          </Button>
        );
      },
    },
  ];

  return <Table className={styles.table} dataSet={tableDs} columns={columns} rowHeight={58} />;
}
