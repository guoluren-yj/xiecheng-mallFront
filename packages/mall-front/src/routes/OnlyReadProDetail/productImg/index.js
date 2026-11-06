/* eslint-disable no-new */
import React, { useState, useEffect } from 'react';
import Swiper from 'swiper';
import { Player } from 'video-react';
import Image from 'components/Image';
import * as Hmall from 'utils/utils';

import ImageMagnifier from './Img';
import VideoPlayer from './Player';
// import ProductChart from './productChart';
// import FinalPriceChart from '../productInfo/finalPriceChart';

import styles from './index.less';
import 'video-react/dist/video-react.css';

export default function ProductImg(props) {
  // const { userId } = Hmall.getUserConfigInfo();
  const { productImgList: imgList = [], imagePath } = props;
  const productImgList = imgList.length === 0 && imagePath ? [{ imagePath }] : [...imgList];
  const [selectImgInfo, setSelectImg] = useState({
    imgType: 'FILE',
    selectImg: imagePath || (productImgList[0] && productImgList[0].imagePath),
  });
  const { imgType, selectImg } = selectImgInfo;
  // const minImg = Hmall.convertImg(selectImg, 1, sourceFrom);
  // const maxImg = Hmall.convertImg(selectImg, 0, sourceFrom);
  const minImg = selectImg;
  const maxImg = selectImg;
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [finalPriceVisible, setFinalPriceVisible] = useState(false);

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
    return Hmall.uniqBykey(productImgList, 'imagePath').map(item => (
      <div
        onFocus
        className="swiper-slide"
        key={item.imagePath}
        onMouseOver={() => {
          setQuoteVisible(false);
          setFinalPriceVisible(false);
          setSelectImg({ selectImg: item.imagePath, imgType: item.type });
        }}
      >
        {/* value={Hmall.convertImg(item.imagePath, 1, sourceFrom)} */}
        {item.type === 'VIDEO' ? (
          <div className={selectImg === item.imagePath ? 'small-img small-img-box' : 'small-img '}>
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

  return (
    <div className={styles['product-img-content']}>
      {!quoteVisible &&
        !finalPriceVisible &&
        (imgType === 'VIDEO' ? (
          <VideoPlayer imagePath={selectImg} />
        ) : (
          <ImageMagnifier minImg={minImg} maxImg={maxImg} />
        ))}
      <div className="detail-images-wrapper">
        <div className="detail-images-prev" />
        <div id="detail-images" className="swiper-container swiper">
          <div className="product-detail-imgs swiper-wrapper">{showDetailImgs()}</div>
        </div>
        <div className="detail-images-next" />
      </div>
    </div>
  );
}
