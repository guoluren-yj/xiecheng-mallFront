import React from 'react';

import intl from 'utils/intl';
import Link from 'components/Link';
import { convertImg } from 'utils/utils';
import Image from 'components/Image';
import { orderAssociatedDoc } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import { getContextValue } from '../../common/Context';

export default function Product(props) {
  const { platformCode, style = {} } = props;
  const { setState, AcceptRecordV } = getContextValue();
  const product = props.product || {};

  // 图片地址处理
  function HandleImgUrl(code, url) {
    return code === 'CATA' ? url : convertImg(url, 1, code);
  }

  const toggleModalAssociatedDoc = () => {
    setState({
      AcceptRecordV: !AcceptRecordV,
      currentProduct: product,
    });
  };

  return (
    <div className="product-info-info-left" style={style}>
      <li className="product-info-info">
        <div>
          <Link
            disabled={!!product.qtHeaderNo}
            to={`/product-detail?productId=${product.productId}&sourceFrom=${platformCode}`}
          >
            <Image value={HandleImgUrl(platformCode, product.imagePath)} width={40} height={40} />
          </Link>
        </div>
        <div className="productname">
          <Link
            className="product-name-label"
            title={product.productName}
            disabled={!!product.qtHeaderNo}
            to={`/product-detail?productId=${product.productId}&sourceFrom=${platformCode}`}
          >
            {product.productName}
          </Link>
          <PermissionWrapper permissionList={[orderAssociatedDoc]}>
            <div
              className="primary-color"
              style={{ marginLeft: 10, marginTop: 6 }}
              onClick={() => toggleModalAssociatedDoc()}
            >
              {intl.get('mallf.myOrder.view.associated.doc').d('关联单据')}
            </div>
          </PermissionWrapper>
        </div>
      </li>
      <li className="product-info-price">
        {product?.currencySymbol || ''}
        {product.actualPriceMeaning || product.actualPrice}
      </li>
      <li className="product-info-quantity">×{product.quantity}</li>
    </div>
  );
}
