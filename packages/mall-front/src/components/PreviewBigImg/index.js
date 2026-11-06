import React, { useState } from 'react';

import Image from 'components/Image';
import intl from 'utils/intl';

import './index.less';

function PreviewBigImg(props) {
  const { index = 0, imgList } = props;
  const [currentIndex, setCurrentIndex] = useState(index);

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function handleNext() {
    if (currentIndex < imgList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  return (
    <div className="preview-container">
      <p>
        共<span className="primary-color">{imgList.length}</span>张 当前第
        <span className="primary-color"> {currentIndex + 1}</span> 张
      </p>
      <div className="preview-modal-content">
        {currentIndex !== 0 && (
          <div className="content-btn content-prev" onClick={handlePrev}>
            &nbsp;
          </div>
        )}
        <div className="content-img">
          <Image
            value={
              imgList[currentIndex].url || imgList[currentIndex].fileUrl || imgList[currentIndex]
            }
            alt={
              imgList[currentIndex].fileName ||
              intl.get(`mallf.common.view.comment.img`).d('评论图片')
            }
          />
        </div>
        {currentIndex !== imgList.length - 1 && (
          <div className="content-btn content-next" onClick={handleNext}>
            &nbsp;
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewBigImg;
