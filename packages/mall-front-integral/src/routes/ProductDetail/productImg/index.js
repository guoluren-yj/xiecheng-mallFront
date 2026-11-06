/* eslint-disable no-new */
import React, { useState, useEffect } from 'react';
import { Icon } from 'hzero-ui';
import Swiper from 'swiper';
import { Player } from 'video-react';
import Image from 'components/Image';
import * as Hmall from 'utils/utils';
import intl from 'utils/intl';
import { addCollect } from 'services/productDetailService';
import { deleteFavorite } from 'services/favoriteCommentService';
import { CollectPopOver } from 'utils/modals';
import ImageMagnifier from './Img';
import VideoPlayer from './Player';
// import ProductChart from './productChart';
// import FinalPriceChart from '../productInfo/finalPriceChart';

import styles from './index.less';
import 'video-react/dist/video-react.css';

export default function ProductImg(props) {
  const { userId, companyId } = Hmall.getUserConfigInfo();
  const { productImgList: imgList = [], productData = {}, sourceFrom } = props;
  const { favoriteId } = productData;
  const productImgList = imgList.map((m) => ({ ...m, imagePath: m.mediaPath }));
  const firstImg = productImgList?.[0] || {};
  const [selectImgInfo, setSelectImg] = useState({
    imgType: firstImg.mediaType,
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

  const primaryColor = Hmall.getPrimaryColor();
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
            imgType: item.mediaType,
            largeImagePath: item.largeImagePath || item.imagePath,
          });
        }}
      >
        {/* value={Hmall.convertImg(item.imagePath, 1, sourceFrom)} */}
        {+item.mediaType === 1 ? (
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
        productId: item.ecProductId || item.productId,
        productSource,
        purchaseType: 'COMPANY',
        lockStatus: 1,
        saleEnable: 1,
        shelfFlag: 1,
        shelfStatus: 1,
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
      addCollect({
        productSource,
        productId: item.ecProductId || item.skuId,
      })
        .then((res) => {
          setIsCollect(res?.[0]);
        })
        .finally(() => {
          setCollectLoading(false);
        });
    }
  }
  return (
    <div className={styles['product-img-content']}>
      {!quoteVisible &&
        !finalPriceVisible &&
        (+imgType === 1 ? (
          <VideoPlayer imagePath={selectImg} />
        ) : (
          <ImageMagnifier productData={productData} minImg={minImg} maxImg={maxImg} />
        ))}
      <div className="detail-images-wrapper">
        <div className="detail-images-prev" />
        <div id="detail-images" className="swiper-container swiper">
          <div className="product-detail-imgs swiper-wrapper">{showDetailImgs()}</div>
        </div>
        <div className="detail-images-next" />
      </div>
      {Hmall.getAccessToken() && (
        <div className="product-img-control">
          <span>
            {!isCollect ? (
              <CollectPopOver product={productData} callBack={(res) => setIsCollect(res?.[0])}>
                <span style={{ fontSize: 14, color: '#333' }}>
                  <Icon type="heart-o" style={{ color: '#333', paddingRight: 5 }} />
                  {intl.get(`mallf.common.model.collect`).d('收藏')}
                </span>
              </CollectPopOver>
            ) : (
              <span
                style={{ fontSize: 14, color: '#333' }}
                onClick={() => {
                  handleCollect(productData);
                }}
              >
                <Icon type="heart" style={{ paddingRight: 5, color: primaryColor }} />
                {intl.get(`mallf.common.model.collected`).d('已收藏')}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
