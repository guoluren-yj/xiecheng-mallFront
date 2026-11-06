import React from 'react';
import { isEmpty } from 'lodash';

import Image from 'components/Image';
import Link from 'components/Link';
import intl from 'utils/intl';
import { getIsHideSupplierFlag } from 'utils/configUtils';

export const remarkRequireCux = ({ config, order }) => {
  const remarkRequired = order.shoppingCartDTOList.some((n) => !isEmpty(n.productCompareList));
  // eslint-disable-next-line no-param-reassign
  order.remarkRequired = remarkRequired ? 1 : config.required;
};

export const fieldsCux = () => {
  return [
    {
      name: 'deliveryCycle',
      label: '供货周期',
    },
    {
      name: 'brand',
      label: '品牌',
    },
  ];
};

export const columnsCux = ({ productId }) => {
  return [
    {
      name: 'productInfo',
      width: 300,
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
            <Link className="product-info-name" {...linkProps}>
              <p className="product-info-name" title={record.get('productName')}>
                {record.get('productName')}
              </p>
            </Link>
          </div>
        );
      },
    },
    !getIsHideSupplierFlag() && {
      name: 'supplierCompanyName',
      width: 220,
      renderer: ({ record }) => record.get('showSupplierName') || record.get('supplierCompanyName'),
    },
    {
      name: 'isSameProduct',
      width: 120,
      renderer: ({ record, value }) => {
        return String(record.get('productId')) === String(productId)
          ? intl.get('mallf.common.view.masterProduct').d('主商品')
          : value
          ? intl.get('hzero.common.yes').d('是')
          : intl.get('hzero.common.no').d('否');
      },
    },
    {
      name: 'deliveryCycle',
      width: 120,
    },
    {
      name: 'brand',
      width: 120,
      renderer: ({ record }) => {
        return (
          record.get('brand') ||
          record.get('productSkuAttrDTOS')?.find((n) => n.attrCode === '000000000001')?.description
        );
      },
    },
  ];
};
