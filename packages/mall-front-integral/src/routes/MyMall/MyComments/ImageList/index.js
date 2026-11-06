import React, { useEffect } from 'react';
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.min.css';
import intl from 'utils/intl';
import useState from 'hooks/useState';
import Image from 'components/Image';
import ImageViewer from 'components/ImageViewer';
// import PreviewBigImg from 'components/PreviewBigImg';
import Icons from 'components/Icons';
import styles from './index.less';

export default function ImageList(props) {
  const { productAssessmentId, imageDTO = [] } = props;
  // const needBtn = imageDTO?.length > 2;
  const needBtn = false;
  const [preview, setPreview] = useState({ visible: false, index: 0, fileList: [] });

  useEffect(() => {
    // eslint-disable-next-line no-new
    new Swiper(`#comment-${productAssessmentId}`, {
      prevButton: `.image-prev-${productAssessmentId}`,
      nextButton: `.image-next-${productAssessmentId}`,
      slidesPerView: 2,
      slidesPerGroup: 2,
      width: 222,
      direction: 'horizontal',
      spaceBetween: 10,
    });
  }, [productAssessmentId]);

  return (
    <div className={styles.content}>
      {needBtn && (
        <div className={`image-btn image-prev-${productAssessmentId}`}>
          <Icons size={14} type="left" />
        </div>
      )}
      <div
        style={!needBtn ? { marginLeft: 14 } : {}}
        id={`comment-${productAssessmentId}`}
        className="swiper-container comment-content"
      >
        <div className="swiper-wrapper">
          {imageDTO?.map((i, index) => (
            <div className="swiper-slide">
              <Image value={i.fileUrl} width={64} height={64} boxStyle={{ display: 'block' }} />
              <div className="cover">
                <p>
                  {index + 1} {intl.get('mallf.common.view.picture').d('图')}
                </p>
                <p
                  onClick={() => {
                    setPreview({ visible: true, index, fileList: imageDTO });
                  }}
                >
                  {intl.get('mallf.common.view.look.all').d('查看全部')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {needBtn && (
        <div className={`image-btn image-next-${productAssessmentId}`}>
          <Icons size={14} type="right" />
        </div>
      )}
      {preview.visible && (
        <ImageViewer
          closeModal={() => {
            setPreview({ visible: false });
          }}
          imgList={preview.fileList}
          index={preview.index}
        />
      )}
    </div>
  );
}
