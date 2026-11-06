import React, { useState } from 'react';
import { Rate } from 'hzero-ui';

import intl from 'utils/intl';
import Image from 'components/Image';
import Pagination from 'components/Pagination';
import ImageViewer from 'components/ImageViewer';
import { math } from 'choerodon-ui/dataset';
import styles from './index.less';

export default function GoodsComment(props) {
  const { skuName, productImage, pagination, fetchComments, comments } = props;
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState({
    imgList: [],
    index: 0,
  });

  function handleUserName(userName) {
    const reg = /^(.).+(.)$/g;
    return userName.replace(reg, '$1***$2');
  }

  /**
   * 预览大图
   */
  function previewBigImg(item, index, n) {
    setVisible(true);
    setPreview({
      imgList: n,
      index,
    });
  }

  /**
   * 渲染评论数据
   */
  function renderComments() {
    return comments.map((item) => {
      const { imageUrl, realName, remark, assessTime, imageDTO, score } = item;
      return (
        <li className="comments-detail">
          <div className="comments-left">
            <Image className="comments-user-photo" value={imageUrl} width={44} height={44} />
            <p className="comments-user-name">{handleUserName(realName)}</p>
          </div>
          <div className="comments-right">
            <Rate className="rate-list" allowHalf disabled defaultValue={math.round(score) / 2} />
            <p className="comments-describe" style={remark ? { color: '#666' } : { color: '#999' }}>
              {remark || intl.get('mallf.productDetail.view.comment.noComment').d('暂无文字评价')}
            </p>
            {imageDTO && (
              <ul>
                {imageDTO.map((i, index, n) => (
                  <li className="comments-picture">
                    <Image value={i.fileUrl} width={67} height={67} />
                    <div className="img-modal">
                      <a
                        onClick={() => {
                          previewBigImg(i, index, n);
                        }}
                        className="modal-icon preview-btn"
                      >
                        &nbsp;
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="comments-time">{assessTime}</p>
          </div>
        </li>
      );
    });
  }

  return (
    <div style={{ minHeight: 486, padding: '0 30px' }} className={styles['goods-comments']}>
      <div className="comments-rate">
        <div className="comments-rate-info">
          <p className="comments-rate-total">
            {intl
              .get('mallf.productDetail.view.totalPerson.comment', {
                value: comments[0]?.commentNumber,
              })
              .d(`共${comments[0]?.commentNumber}人评价`)}
          </p>
          <p className="comments-rate-num">
            {intl
              .get('mallf.productDetail.view.total.count', { value: comments[0]?.avgScore })
              .d(`${comments[0]?.avgScore}分`)}
          </p>
          <Rate
            className="rate-list"
            allowHalf
            disabled
            defaultValue={math.round(comments[0]?.avgScore) / 2}
          />
        </div>
        <div className="comments-rate-goods">
          <Image
            className="comments-goods-photo"
            value={productImage.imagePath}
            width={80}
            height={80}
          />
          <p>{skuName}</p>
        </div>
      </div>
      <ul className="comments-content">{renderComments()}</ul>
      <Pagination
        style={{ width: '100%', marginTop: 15 }}
        zeroStart
        showQuickJumper
        {...pagination}
        onForward={fetchComments}
      />
      {visible && (
        <ImageViewer
          closeModal={() => {
            setVisible(false);
          }}
          imgList={preview.imgList}
          index={preview.index}
        />
      )}
    </div>
  );
}
