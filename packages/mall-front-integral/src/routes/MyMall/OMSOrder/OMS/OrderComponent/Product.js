import React, { useMemo } from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import Link from 'components/Link';
import { convertImg, numberRender } from 'utils/utils';
import Image from 'components/Image';
import image from 'mall-front/lib/assets/images/shougongshenqing-product.png';
import { SpanTitle } from 'mall-front/lib/utils/renderer';
import { orderAssociatedDoc } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import ShowDoc from 'mall-front/lib/routes/MyMall/OMSOrder/common/ShowDoc';
import { getContextValue } from '../../common/Context';

export default function Product(props) {
  const { platformCode, style = {}, paymentModel } = props;
  const { setState, AssociatedDocV } = getContextValue();
  const product = props.product || {};
  const isMANUAL = useMemo(() => platformCode === 'MANUAL', [platformCode]);
  // 图片地址处理
  function HandleImgUrl(code, url) {
    return code === 'CATA' ? url : convertImg(url, 1, code);
  }

  const toggleModalAssociatedDoc = () => {
    setState({
      AssociatedDocV: !AssociatedDocV,
      currentProduct: product,
    });
  };

  return (
    <div className="product-info-info-left" style={style}>
      <li className="product-info-info">
        <div>
          <Link
            disabled={!!product.qtHeaderNo || isMANUAL}
            to={`/sigl/product-detail?productId=${product.skuId}&sourceFrom=${platformCode}`}
          >
            <Image
              value={isMANUAL ? image : HandleImgUrl(platformCode, product.primaryUrl)}
              width={40}
              height={40}
            />
          </Link>
        </div>
        <div className="productname">
          <Link
            className="product-name-label"
            title={product.skuName}
            disabled={!!product.qtHeaderNo || isMANUAL}
            to={`/sigl/product-detail?productId=${
              product.productId || product.skuId
            }&sourceFrom=${platformCode}`}
          >
            {/* {(product?.bNeedAnnex === 1 || product.bNeedGift === 1) && (
              <span className="product-label">
                {product?.bNeedAnnex === 1
                  ? intl.get(`mallf.common.view.common.annex`).d('附件')
                  : product.bNeedGift === 1
                  ? intl.get(`mallf.common.view.common.giveaway`).d('赠品')
                  : ''}
              </span>
            )} */}
            {product.skuName}
          </Link>
          <ShowDoc>
            <PermissionWrapper permissionList={[orderAssociatedDoc]}>
              <div
                className="primary-color"
                style={{ marginLeft: 10, marginTop: 6 }}
                onClick={() => toggleModalAssociatedDoc()}
              >
                {intl.get('mallf.common.view.associated.doc').d('关联单据')}
              </div>
            </PermissionWrapper>
          </ShowDoc>
        </div>
      </li>
      <li className="product-info-price text-overflow">
        {['HYBRID_PAYMENT', 'POINTS_PAYMENT'].includes(paymentModel) && (
          <span className="product-info-price-sigl">
            <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
            {numberRender(product?.pointPrice)}
            {['HYBRID_PAYMENT'].includes(paymentModel) && (
              <span style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}>+</span>
            )}
          </span>
        )}
        <SpanTitle>
          {['HYBRID_PAYMENT', 'CASH_PAYMENT'].includes(paymentModel) &&
            `${product?.currencySymbol || ''}${
              product?.orderPriceFinalVO?.finalUnitPriceMeaning ||
              product?.orderPriceFinalVO?.finalUnitPrice
            }${product.per > 1 ? `/${product.per}` : ''}`}
        </SpanTitle>
        {product.pointsTypeName && <div style={{ color: '#999999' }}>{product.pointsTypeName}</div>}
      </li>
      <li title={product.quantityMeaning} className="product-info-quantity text-overflow">
        ×{product.quantityMeaning}
        {product.customQuantity && product.customQuantity !== 1 && (
          <p style={{ marginTop: 6 }}>
            {product.packageQuantityMeaning}
            {intl.get(`mallf.cart.model.cart.pieces`).d('件')}
          </p>
        )}
      </li>
    </div>
  );
}
