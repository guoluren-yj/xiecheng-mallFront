/* eslint-disable no-new */
import React, { useEffect, useState, useMemo } from 'react';
import { Tabs } from 'choerodon-ui';
import Swiper from 'swiper';

import Link from 'components/Link';
import intl from 'utils/intl';
import Image from 'components/Image';
import Icons from 'components/Icons';
import * as Hmall from 'utils/utils';
// import { fetchSimilarProduct } from 'services/productDetailService';
import style from './index.less';

export default function SimilarProduct(props) {
  const symbol = '';
  const { productId, handleAddCompare, compareData } = props;
  // eslint-disable-next-line no-unused-vars
  const [product, setProduct] = useState({
    content: [],
    isParity: false,
  });
  // const { levelPath, userId } = Hmall.getUserConfigInfo();
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    new Swiper(`#product-1`, {
      prevButton: '.similar-prev',
      nextButton: '.similar-next',
      slidesPerView: 6,
      slidesPerGroup: 6,
      width: 1032,
      direction: 'horizontal',
      spaceBetween: 30,
    });
  }, [product.content]);

  function fetchProduct() {
    // const { second } = Hmall.getStorage(`${userId}_region`) || {};
    // const regionId =
    //   second?.shi || JSON.parse(localStorage.getItem(`${userId}_defaultAddressId`))?.[1];
    // fetchSimilarProduct({ skuId: productId, levelPath, regionId }).then(res => {
    //   if (res?.length > 0) {
    //     setProduct({
    //       content: res?.slice(0, 10),
    //       isParity: true,
    //     });
    //   }
    // });
  }

  const showSimilar = useMemo(() => {
    const { content } = product;
    return content.map((imgObj) => {
      return (
        <div className="swiper-slide">
          <div className="similar-card">
            <div className="similar-card-img">
              <Link
                to={`/product-detail?productId=${imgObj.skuId}&sourceFrom=${imgObj.sourceFrom}`}
              >
                <Image value={imgObj.primaryImage} width={100} height={100} />
              </Link>
              <div
                className="add-compare"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleAddCompare(true, [
                    {
                      productId: imgObj.skuId,
                      productName: imgObj.skuName,
                      price: imgObj.agreementPrice || imgObj.price,
                      imagePath: imgObj.primaryImage,
                      sourceFrom: imgObj.sourceFrom,
                      type: 3,
                      deleteFlag: 0,
                    },
                  ]);
                }}
              >
                {intl.get(`mallf.productDetail.model.addCompar`).d('加入比价')}
              </div>
            </div>
            <Link to={`/product-detail?productId=${imgObj.skuId}&sourceFrom=${imgObj.sourceFrom}`}>
              <div className="card-name text-overflow">{imgObj.skuName}</div>
            </Link>
            <div className="card-price">
              {symbol}
              {Hmall.numberRender(
                imgObj.agreementPrice !== 0 ? imgObj.agreementPrice || imgObj.price : 0
              )}
            </div>
          </div>
        </div>
      );
    });
  }, [product, compareData]);

  const displayFlag = product.isParity && product.content.length;

  return (
    <div className={style[displayFlag ? 'productSimilar-parent' : 'productSimilar-none']}>
      <Tabs>
        {/* {sameProduct.length > 0 && (
          <Tabs.TabPane key={1} tab="同款商品">
            {sameProduct.length > 0 ? (
              <div className={style['product-similar-content']}>
                <div className="similar-prev">
                  <Icons type="left" style={{ fontSize: '24px' }} />
                </div>
                <div className="product-similar-display">
                  <div id="product-1" className="swiper-container product-similar">
                    <div className="swiper-wrapper">{showSame}</div>
                  </div>
                </div>
                <div className="similar-next">
                  <Icons type="right" style={{ fontSize: '24px' }} />
                </div>
              </div>
            ) : (
              <div className="no-data">
                <div className="no-params" />
                <p>{intl.get(`mallf.common.view.noData`).d('暂无数据')}</p>
              </div>
            )}
          </Tabs.TabPane>
        )} */}
        <Tabs.TabPane
          key={1}
          tab={intl.get(`mallf.productDetail.model.similarProduct`).d('同类商品')}
        >
          {product.content.length > 0 ? (
            <div className={style['product-similar-content']}>
              <div className="similar-prev">
                <Icons type="left" style={{ fontSize: '24px' }} />
              </div>
              <div className="product-similar-display">
                <div id="product-1" className="swiper-container product-similar">
                  <div className="swiper-wrapper">{showSimilar}</div>
                </div>
              </div>
              <div className="similar-next">
                <Icons type="right" style={{ fontSize: '24px' }} />
              </div>
            </div>
          ) : (
            <div className="no-data">
              <div className="no-params" />
              <p>{intl.get(`mallf.common.view.noData`).d('暂无数据')}</p>
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
