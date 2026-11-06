import React, { useMemo } from 'react';
import { Tooltip } from 'choerodon-ui';

import intl from 'utils/intl';
import Link from 'components/Link';
import { SpanTitle } from 'utils/renderer';
import { convertImg, getPrimaryColor, getUserConfigInfo } from 'utils/utils';
import { getOpenCartFlag } from 'utils/configUtils';
import Image from 'components/Image';
import CuxWrapper from 'cuxTools/CuxWrapper';
import { getMamanualRequestImg } from 'components/MamanualRequestImg';
import DocFlow from 'components/DocFlow';
import ViewCompareList from 'components/ViewCompareList';
import { orderDocFlow, orderAssociatedDoc } from 'components/Permission/permissionCode';
import { PermissionWrapper, PermissionButton } from 'components/Permission';
import { getContextValue } from '../../common/Context';
import ShowDoc from '../../common/ShowDoc';
import CuxFn from '@/cuxTools/cuxFn';

export default function Product(props) {
  const {
    platformCode,
    style = {},
    currencySymbol,
    isReceive,
    dualFlag,
    product = {},
    orderEntryExtraList,
    item,
  } = props;
  const { setState, AssociatedDocV } = getContextValue();
  const {
    customUomFlag,
    packageQuantityMeaning,
    customUomName,
    customUomCode,
    quantityMeaning,
    uomName,
    uomCode,
    productCompareDTO,
    per, // 价格批量
    skuType,
  } = product || {};
  const isMANUAL = useMemo(() => platformCode === 'MANUAL', [platformCode]);
  const isGift = ['ATTACHMENT', 'GIFT'].includes(skuType);
  const { hideFieldList } = getUserConfigInfo();
  // 是否展示双单位
  const doubleUomFlag = useMemo(
    () => customUomFlag === 1 || (dualFlag === 1 && isMANUAL && customUomCode !== uomCode),
    [product, dualFlag, isMANUAL]
  );
  // 是否可点击跳转
  const disabledLinkFlag = CuxFn({
    name: 'OMSOrder-fn-disableLinkFlag',
    value: {
      product,
      item,
    },
  })(() => !!product.qtLineNo || isMANUAL || isGift)();
  // 图片地址处理
  function HandleImgUrl(code, url) {
    return code === 'CATA' ? url : convertImg(url, 1, code);
  }

  const toggleModalAssociatedDoc = () => {
    setState({
      AssociatedDocV: !AssociatedDocV,
      currentProduct: { ...product, isReceive },
    });
  };
  return (
    <div className="product-info-info-left" style={style}>
      <li className="product-info-info">
        <div>
          <div r-if={isMANUAL}>{getMamanualRequestImg({ width: '36px', height: '36px' })}</div>
          <Link
            r-if={!isMANUAL}
            disabled={disabledLinkFlag}
            to={`/product-detail?productId=${product.skuId}&sourceFrom=${platformCode}`}
          >
            <Image value={HandleImgUrl(platformCode, product.primaryUrl)} width={40} height={40} />
          </Link>
        </div>
        {/* 解决 title 在disabled下不触发 disabled属性重写了 */}
        <div className="productname" title={product.skuName}>
          <Link
            className="product-name-label"
            disabled={disabledLinkFlag}
            to={`/product-detail?productId=${
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
          <CuxWrapper
            path="OMS/OrderComponent/Product"
            value={{ data: product, orderEntryExtraList }}
          />
          <Tooltip
            r-if={skuType === 'GIFT'}
            title={intl.get('mallf.common.view.common.giveaway').d('赠品')}
          >
            <div className="gift-label">
              {intl.get('mallf.common.view.common.giveaway').d('赠品')}
            </div>
          </Tooltip>
          <Tooltip
            r-if={skuType === 'ATTACHMENT'}
            title={intl.get(`mallf.common.view.common.annex`).d('附件')}
          >
            <div className="gift-label">{intl.get(`mallf.common.view.common.annex`).d('附件')}</div>
          </Tooltip>

          <div r-if={!isGift}>
            <ShowDoc>
              <PermissionButton
                r-if={hideFieldList && !hideFieldList.includes('ASSOCIATED_RECEIPT')}
                permissionList={[orderAssociatedDoc]}
                funcType="link"
                color="primary"
                style={{
                  marginLeft: 10,
                }}
                onClick={() => toggleModalAssociatedDoc()}
              >
                {intl.get('mallf.myOrder.view.associated.doc').d('关联单据')}
              </PermissionButton>
            </ShowDoc>
            <ShowDoc type="displayDocFlow">
              <PermissionWrapper permissionList={[orderDocFlow]}>
                <span>
                  <DocFlow
                    r-if={
                      // 不是手工商品 或者 是申请链路的手工商品 则展示（根据是否开启申请链路判断）
                      (!isMANUAL || (isMANUAL && getOpenCartFlag())) &&
                      hideFieldList &&
                      !hideFieldList.includes('STREAMING_RECEIPT') &&
                      !isReceive
                    }
                    tableName="s2ful_order_entry"
                    tablePk={product.orderEntryId}
                    style={{
                      color: getPrimaryColor(),
                      display: 'inline-block',
                      marginLeft: 15,
                    }}
                    buttonType="button"
                  />
                </span>
              </PermissionWrapper>
            </ShowDoc>
            <CuxWrapper path="OMS/OrderComponent/Product/button" value={{ data: product }} />
          </div>
        </div>
      </li>
      <li
        className="product-info-price text-overflow"
        // title={
        //   product?.orderPriceFinalVO?.unitPriceMeaning || product?.orderPriceFinalVO?.unitPrice
        // }
      >
        <SpanTitle>
          {currencySymbol || ''}
          {product?.orderPriceFinalVO?.unitPriceMeaning || product?.orderPriceFinalVO?.unitPrice}
          {per > 1 ? `/${per}` : ''}
          {doubleUomFlag ? `/${uomName}` : ''}
        </SpanTitle>
        <ViewCompareList
          r-if={productCompareDTO && !['GIFT', 'ATTACHMENT', 'FREIGHT'].includes(skuType)}
          productCompare={productCompareDTO || {}}
        />
      </li>
      <li className="product-info-quantity text-overflow">
        <SpanTitle>
          ×{packageQuantityMeaning}
          {doubleUomFlag ? customUomName : ''}
        </SpanTitle>
        {doubleUomFlag && (
          <p style={{ marginTop: 6 }} className="text-overflow">
            <SpanTitle>
              {quantityMeaning}
              {uomName}
            </SpanTitle>
          </p>
        )}
      </li>
    </div>
  );
}
