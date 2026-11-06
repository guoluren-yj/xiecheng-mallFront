import React from 'react';
import intl from 'utils/intl';
import Link from 'components/Link';
import { openPage } from 'utils/utils';

function GoToLowestSkuModal(props) {
  const { modal, res, onOk, weakFlag, strongFlag } = props;
  const showSameSkuflag = res?.cheapestSkuId
    ? !!res?.cheapestSkuId
    : !!res?.cartList?.[0].cheapestSkuId;
  const { cheapestSkuId, cheapestSkuName, cheapestSourceForm } = res?.cheapestSkuId
    ? res
    : res?.cartList?.[0];

  modal.handleOk(() => {
    if (weakFlag) {
      onOk();
    } else if (showSameSkuflag && strongFlag) {
      openPage(`/product-detail?productId=${cheapestSkuId}&sourceFrom=${cheapestSourceForm}`);
    }
  });

  return (
    <div>
      {strongFlag ? (
        <span
          onClick={() => {
            openPage(`/product-detail?productId=${cheapestSkuId}&sourceFrom=${cheapestSourceForm}`);
            modal.close();
          }}
          className="lowest-modal-info"
        >
          {intl
            .getHTML('mallf.common.productDetail.view.strongLowsetPriceFlag', {
              value: cheapestSkuName,
            })
            .d(
              <span>
                此商品非最低价商品，请选择同款最低价
                <b>{cheapestSkuName}</b>
                购买
              </span>
            )}
        </span>
      ) : (
        <span>
          {intl.get('mallf.common.view.hasLowerPricePdt').d('存在比该商品更低价格的商品(')}
          <b>
            <Link
              to={`/product-detail?productId=${cheapestSkuId}&sourceFrom=${cheapestSourceForm}`}
            >
              {cheapestSkuName}
            </Link>
          </b>
          {intl.get('mallf.common.view.isNextCartBuy').d(')，是否继续加购/下单')}
        </span>
      )}
    </div>
  );
}

export default GoToLowestSkuModal;
