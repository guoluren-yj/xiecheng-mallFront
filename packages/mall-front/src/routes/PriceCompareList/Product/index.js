import React, { useMemo, useRef, useState } from 'react';
import { DataSet, Table, Select, Tooltip } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import Image from 'components/Image';
import Link from 'components/Link';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import { getOrganizationId } from 'utils/utils';
import { getIsHideSupplierFlag, getDimensionValueMap } from 'utils/configUtils';
import CuxFn from '@/cuxTools/cuxFn';
import { fetchIsSameSku } from 'services/productListService';

import styles from './index.less';

// productId
// regionId
// addressId
// levelPath
export default function Productlist(props) {
  const first = useRef(true);
  const organizationId = getOrganizationId();
  const { productId, hideFieldList, setChartDTO, autoFlag } = props;
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState('ASC');

  /**
   * 执行排序逻辑
   * @param {string} targetSortField - 排序字段：price-单价，skuPrice-折算单价
   * @param {string} targetSortType - 排序方向：ASC-升序，DESC-降序
   */
  function doSort(targetSortField, targetSortType) {
    if (!targetSortType) return;
    const sortedData = tableDs.toData().sort((a, b) => {
      const aValue = targetSortField === 'price' ? a.price : a.skuPrice;
      const bValue = targetSortField === 'price' ? b.price : b.skuPrice;
      return targetSortType === 'DESC' ? bValue - aValue : aValue - bValue;
    });
    tableDs.loadData(sortedData);
  }

  /**
   * 切换排序方向（升序 <-> 降序）
   */
  function handleSort() {
    const newSortType = sortType === 'DESC' ? 'ASC' : 'DESC';
    setSortType(newSortType);
    doSort(sortField, newSortType);
  }

  /**
   * 切换排序字段，保持当前排序方向不变
   * @param {string} value - 排序字段：price-单价，skuPrice-折算单价
   */
  function handleSortFieldChange(value) {
    setSortField(value);
    doSort(value, sortType);
  }

  const tableDs = useMemo(() => {
    return new DataSet({
      autoQuery: true,
      paging: false,
      selection: false,
      fields: [
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
          name: 'showSupplierName',
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
          name: 'skuPrice',
          label: intl.get(`mallf.common.view.skuPrice`).d('折算单价'),
        },
        {
          name: 'recommendReason',
          label: intl.get(`mallf.common.view.recommendReason`).d('推荐理由'),
        },
        {
          name: 'similarity',
          label: intl.get(`mallf.common.view.similarity`).d('相似度'),
        },
      ]
        .filter((p) => !!p)
        .concat(
          ...CuxFn({
            name: 'ProductsCompare-fn-fieldsCux',
          })(() => [])()
        ),
      transport: {
        read({ dataSet }) {
          // eslint-disable-next-line no-shadow
          const { hideFieldList, ...data } = props;
          const dimensionValueMap = getDimensionValueMap();
          return {
            url: `/${HmallConfig.serviceName}/v1/${organizationId}/product-compares/${productId}`,
            method: 'POST',
            data: {
              dimensionValueMap,
              ...data,
            },
            transformResponse: (res) => {
              try {
                const { companyId, chartDTO } = JSON.parse(res) || {};
                let list = JSON.parse(res).productCompareAssignList;
                list = [
                  ...list.filter((p) => String(p.productId) === String(productId)),
                  ...list.filter((p) => String(p.productId) !== String(productId)),
                ];
                dataSet.setState('companyId', companyId);
                setChartDTO(chartDTO);
                return list?.map((p) => ({
                  ...p,
                  // lineNum: i + 1,
                }));
              } catch {
                return [];
              }
            },
          };
        },
      },
      events: {
        load: ({ dataSet }) => {
          if (first.current) {
            const list = dataSet.toData();
            const companyId = dataSet.getState('companyId');
            fetchIsSameSku({ ...props, checkSkuIds: list.map((p) => p.productId), companyId }).then(
              (res) => {
                if (!isEmpty(res)) {
                  const newData = [...list].map((p) => {
                    if (res?.checkSkuIds?.includes(p.productId)) {
                      return { ...p, isSameProduct: 1 };
                    } else {
                      return p;
                    }
                  });
                  first.current = false;
                  tableDs.loadData(newData);
                }
              }
            );
          }
        },
      },
    });
  }, []);

  const columns = [
    {
      name: 'lineNum',
      width: 100,
      renderer: ({ record }) => record.index + 1,
    },
    ...CuxFn({
      name: 'ProductsCompare-fn-columnsCux',
      value: { productId, hideFieldList },
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
              <Tooltip title={record.get('productName')}>
                <Link className="product-info-name" {...linkProps}>
                  <p className="product-info-name">{record.get('productName')}</p>
                </Link>
              </Tooltip>
            </div>
          );
        },
      },
      +autoFlag === 2 && {
        name: 'similarity',
        width: 120,
      },
      !getIsHideSupplierFlag()
        ? {
            name: 'showSupplierName',
            width: 260,
          }
        : null,
      {
        name: 'isSameProduct',
        width: 100,
        renderer: ({ record, value }) => {
          return String(record.get('productId')) === String(productId)
            ? intl.get('mallf.common.view.masterProduct').d('主商品')
            : value
            ? intl.get('hzero.common.yes').d('是')
            : intl.get('hzero.common.no').d('否');
        },
      },
    ])(),
    +autoFlag === 2 && {
      name: 'recommendReason',
      width: 160,
    },
    {
      name: 'price',
      align: 'right',
      width: 120,
      renderer: ({ value, record }) => {
        return (
          <span className="price-color">
            <span className="currencySymbol">{record.get('currencySymbol')}</span>
            {value}
          </span>
        );
      },
    },
    +autoFlag === 2 && {
      name: 'skuPrice',
      align: 'right',
      width: 120,
      renderer: ({ value, record }) => {
        return (
          <span className="price-color">
            <span className="currencySymbol">{record.get('currencySymbol')}</span>
            {value}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <div className={styles['compare-title']}>
        <div style={{ flex: 1 }}>
          {intl.get('mallf.common.view.priceCompareList').d('比价商品列表')}
        </div>
        {+autoFlag === 2 && (
          <div className="compare-sort-wrapper">
            <Select
              value={sortField}
              placeholder={intl.get('mallf.common.view.selectOrderBy').d('选择排序字段')}
              onChange={(value) => {
                handleSortFieldChange(value);
              }}
              clearButton={false}
              className="compare-sort-select"
            >
              <Select.Option value="price">
                {intl.get(`mallf.common.view.sortPrice`).d('按单价')}
              </Select.Option>
              <Select.Option value="skuPrice">
                {intl.get(`mallf.common.view.sortSkuPrice`).d('按折算单价')}
              </Select.Option>
            </Select>
            <span
              className="compare-sort"
              onClick={() => handleSort()}
              style={{ cursor: 'pointer' }}
            >
              {!sortType ? (
                <span>
                  <Icons type="icon-sort_list" />
                </span>
              ) : (
                <span>
                  <Icons
                    type={sortType === 'DESC' ? 'icon-descending_left' : 'icon-ascending_left'}
                  />
                  <Icons
                    className="sort-right"
                    type={sortType === 'DESC' ? 'icon-descending_right' : 'icon-ascending_right'}
                  />
                </span>
              )}
            </span>
          </div>
        )}
      </div>
      <Table className={styles.table} dataSet={tableDs} columns={columns} rowHeight={58} />
    </>
  );
}
