/* eslint-disable no-new */
import React, { useState, useEffect } from 'react';
import Swiper from 'swiper';
import { Player } from 'video-react';
import Image from 'components/Image';
import * as Hmall from 'utils/utils';
import { addCollect } from 'services/productDetailService';
import { deleteFavorite } from 'services/favoriteCommentService';

import ImageMagnifier from './Img';
import VideoPlayer from './Player';
import CollectAndCompare from './CollectAndCompare';
import styles from './index.less';
import 'video-react/dist/video-react.css';

export default function ProductImg(props) {
  const { userId, companyId } = Hmall.getUserConfigInfo();
  const {
    productImgList: imgList = [],
    imagePath,
    productData = {},
    sourceFrom,
    labelList = [],
  } = props;
  const { favoriteId, productId, agreementBusinessType } = productData;
  const productImgList = imgList.length === 0 && imagePath ? [{ imagePath }] : [...imgList];
  const firstImg = productImgList?.[0] || {};
  const [selectImgInfo, setSelectImg] = useState({
    imgType: firstImg.type,
    selectImg: firstImg.imagePath,
    largeImagePath: firstImg.largeImagePath || firstImg.imagePath,
  });
  const { imgType, selectImg, largeImagePath } = selectImgInfo;
  // const minImg = Hmall.convertImg(selectImg, 1, sourceFrom);
  // const maxImg = Hmall.convertImg(selectImg, 0, sourceFrom);
  const minImg = largeImagePath;
  const maxImg = largeImagePath;
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [finalPriceVisible, setFinalPriceVisible] = useState(false);
  const [isCollect, setIsCollect] = useState(favoriteId);
  const [collectLoading, setCollectLoading] = useState(false);

  useEffect(() => {
    new Swiper('#detail-images', {
      prevButton: '.detail-images-prev',
      nextButton: '.detail-images-next',
      slidesPerView: 4,
      slidesPerGroup: 4,
      width: 280,
      height: 54,
      spaceBetween: 0,
    });
  }, []);

  const showDetailImgs = () => {
    return Hmall.uniqBykey(productImgList, 'imagePath').map((item) => (
      <div
        onFocus
        className="swiper-slide"
        key={item.imagePath}
        onMouseOver={() => {
          setQuoteVisible(false);
          setFinalPriceVisible(false);
          setSelectImg({
            selectImg: item.imagePath,
            imgType: item.type,
            largeImagePath: item.largeImagePath || item.imagePath,
          });
        }}
      >
        {/* value={Hmall.convertImg(item.imagePath, 1, sourceFrom)} */}
        {item.type === 'VIDEO' ? (
          <div
            style={{ width: 54 }}
            className={selectImg === item.imagePath ? 'small-img small-img-box' : 'small-img '}
          >
            <Player muted src={item.imagePath} />
            <div className="disabled-video" />
          </div>
        ) : (
          <Image
            className={selectImg === item.imagePath ? 'small-img small-img-box' : 'small-img'}
            value={item.imagePath}
            width={54}
            height={54}
            // imgInfo={props} // 商品详情页-列表小图-暂时不用显示
          />
        )}
      </div>
    ));
  };

  function handleCollect(item) {
    if (collectLoading) return;
    const productSource = sourceFrom === 'CATA' ? 'CATA' : sourceFrom;
    if (isCollect) {
      setCollectLoading(true);
      // 取消收藏
      deleteFavorite({
        companyId,
        ecPlatform: sourceFrom,
        favoriteId: isCollect,
        ownerId: userId,
        // platformName: '上海净水服务公司',
        productId: item.ecProductId || item.productId,
        productSource,
        purchaseType: 'COMPANY',
        lockStatus: 1,
        saleEnable: 1,
        shelfFlag: 1,
        shelfStatus: 1,
        // showSupplierCompanyId: "__-rHF6jn-uVGZTUZLPZ8RqUw-__",
        tenantId: 1052,
      })
        .then(() => {
          setIsCollect(null);
        })
        .finally(() => {
          setCollectLoading(false);
        });
    } else {
      setCollectLoading(true);
      addCollect({ productSource, productId: item.ecProductId || item.productId })
        .then((res) => {
          setIsCollect(res?.[0]);
        })
        .finally(() => {
          setCollectLoading(false);
        });
    }
  }

  const priceCompareData = [...(Hmall.getStorage(`${userId}_price_compare`)?.data || [])];
  const hasCompare = priceCompareData?.some((p) => p?.productId === productId);
  return (
    <div className={styles['product-img-content']}>
      {!quoteVisible &&
        !finalPriceVisible &&
        (imgType === 'VIDEO' ? (
          <VideoPlayer imagePath={selectImg} imgInfo={props} />
        ) : (
          <ImageMagnifier
            productData={productData}
            minImg={minImg}
            maxImg={maxImg}
            labelList={labelList}
          />
        ))}
      <div className="detail-images-wrapper">
        <div className="detail-images-prev" />
        <div id="detail-images" className="swiper-container swiper">
          <div className="product-detail-imgs swiper-wrapper">{showDetailImgs()}</div>
        </div>
        <div className="detail-images-next" />
      </div>
      <CollectAndCompare
        setIsCollect={setIsCollect}
        isCollect={isCollect}
        handleCollect={handleCollect}
        productData={productData}
        setPriceCompareActiveKey={props.setPriceCompareActiveKey}
        hasCompare={hasCompare}
        updatePriceCompareList={props.updatePriceCompareList}
        agreementBusinessType={agreementBusinessType}
        labelLoading={props.labelLoading}
        labelList={props.labelList}
      />
    </div>
  );
}
