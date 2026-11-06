import React, { useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import Swiper from 'swiper';
import { Icon } from 'choerodon-ui/pro';
import { priceNumberRender } from 'utils/utils';
import Icons from 'components/Icons';
import style from './index.less';

let swiper;
export default function RangePrice(props) {
  const {
    currentPrice,
    productLadderPrices,
    setQuantity,
    quantity,
    defaultPrecision,
    uomName,
    paymentType,
    setCurrentPointPrice,
    currencySymbol,
  } = props;
  /** 新增的多语言 */
  const pieces = intl.get(`mallf.productDetail.model.pieces`).d('件');

  useEffect(() => {
    swiper = new Swiper('#range-price', {
      prevButton: '.price-prev',
      nextButton: '.price-next',
      slidesPerView: 3,
      slidesPerGroup: 3,
      width: 490,
      height: 75,
      spaceBetween: 22,
      simulateTouch: false,
    });

    return () => {
      swiper.destroy();
    };
  }, [productLadderPrices, productLadderPrices.length]);

  const showDetailImgs = useMemo(() => {
    return productLadderPrices.map((item) => {
      const { ladderFrom, ladderTo, salePrice: taxPrice, pointPrice } = item;
      return (
        <div
          className={`swiper-slide ${taxPrice === currentPrice ? 'price-selected' : ''}`}
          onClick={() => {
            setQuantity(ladderFrom);
            if (paymentType === 'POINTS_PAYMENT') {
              setCurrentPointPrice(pointPrice);
            }
          }}
        >
          <div className="price">
            {paymentType === 'POINTS_PAYMENT' ? (
              <>
                <Icon style={{ fontSize: 12 }} type="donut_small" />
                {pointPrice}
              </>
            ) : (
              <>
                <span style={{ fontSize: 12 }}>{currencySymbol}</span>
                {priceNumberRender(taxPrice, defaultPrecision)}
              </>
            )}
            {uomName && <span style={{ fontSize: 12 }}>/{uomName}</span>}
          </div>
          <div className="number">
            {ladderFrom
              ? ladderTo
                ? `${ladderFrom}-${ladderTo}${pieces}`
                : `>=${ladderFrom}`
              : `<=${ladderTo}`}
          </div>
        </div>
      );
    });
  });

  useEffect(() => {
    productLadderPrices.forEach((item, index) => {
      const { ladderFrom, ladderTo } = item;
      if (!ladderTo ? quantity >= ladderFrom : quantity >= ladderFrom && quantity < ladderTo) {
        if (swiper) {
          swiper.slideTo(index);
        }
      }
    });
  }, [quantity, productLadderPrices, productLadderPrices.length]);

  return (
    <div className={style['range-price-content']}>
      <div
        className="range-price-type p-label"
        title={intl.get(`mallf.productDetail.model.ladderPrice`).d('阶梯价格')}
      >
        {/* 新增的多语言 */}
        {intl.get(`mallf.productDetail.model.ladderPrice`).d('阶梯价格')}
        {/* <p>{intl.get('mallf.productDetail.tax.included').d('(含税)')}</p> */}
      </div>
      <div className="range-price-display">
        <div
          className="price-prev"
          style={{ top: productLadderPrices.some((val) => val.pointPrice) ? 24 : 12 }}
        >
          {productLadderPrices.length > 3 ? <Icons className="prev-icon" type="left" /> : ''}
        </div>
        <div id="range-price" className="swiper-container swiper">
          <div className="swiper-wrapper">{showDetailImgs}</div>
        </div>
        <div
          className="price-next"
          style={{ top: productLadderPrices.some((val) => val.pointPrice) ? 24 : 12 }}
        >
          {productLadderPrices.length > 3 ? <Icons className="next-icon" type="right" /> : ''}
        </div>
      </div>
    </div>
  );
}
