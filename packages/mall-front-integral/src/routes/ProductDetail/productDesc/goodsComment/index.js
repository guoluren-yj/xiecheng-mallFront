import React, { useState } from 'react';
import { Rate } from 'hzero-ui';

import intl from 'utils/intl';
import Image from 'components/Image';
import Pagination from 'components/Pagination';
import ImageViewer from 'components/ImageViewer';
import styles from './index.less';

export default function GoodsComment(props) {
  const { pagination, fetchComments, comments, isOMS } = props;
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
      const {
        [isOMS ? 'userImageUrl' : 'imageUrl']: imageUrl,
        [isOMS ? 'assessmentName' : 'realName']: realName,
        [isOMS ? 'assessmentContent' : 'remark']: remark,
        [isOMS ? 'appendContent' : 'appendRemark']: appendRemark,
        [isOMS ? 'assessmentDate' : 'assessTime']: assessTime,
        [isOMS ? 'appendDate' : 'appendAssessTime']: appendAssessTime,
        score,
        serviceScore,
        transportScore,
        [isOMS ? 'assessmentFileList' : 'imageDTO']: imageDTO,
        [isOMS ? 'appendFileList' : 'appendImageDTO']: appendImageDTO,
      } = item;
      return (
        <li className="comments-detail">
          <div className="comments-left">
            <Image className="comments-user-photo" value={imageUrl} width={44} height={44} />
            <p className="comments-user-name">{handleUserName(realName)}</p>
          </div>
          <div className="comments-right">
            <div>
              <span className="rate-label">
                {intl.get('mallf.common.view.productLevel').d('商品评级')}：
              </span>
              <Rate className="rate-list" allowHalf disabled defaultValue={Math.round(score) / 2} />
            </div>
            <div r-if={serviceScore}>
              <span className="rate-label">
                {intl.get('mallf.common.view.serviceQuality').d('服务质量')}：
              </span>
              <Rate
                className="rate-list"
                allowHalf
                disabled
                defaultValue={Math.round(serviceScore) / 2}
              />
            </div>
            <div r-if={transportScore}>
              <span className="rate-label">
                {intl.get('mallf.common.view.deliverySpeed').d('配送速度')}：
              </span>
              <Rate
                className="rate-list"
                allowHalf
                disabled
                defaultValue={Math.round(transportScore) / 2}
              />
            </div>
            <p className="comments-describe">
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
            {appendAssessTime && (
              <div className="product-comment-add">
                <p className="comments-describe">
                  <span>【{intl.get('mallf.common.view.goto.addComment').d('追加评价')}】</span>
                  {appendRemark ||
                    intl.get('mallf.productDetail.view.comment.noComment').d('暂无文字评价')}
                </p>
                {appendImageDTO && (
                  <ul>
                    {appendImageDTO.map((i, index, n) => (
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
                <p className="comments-time">{appendAssessTime}</p>
              </div>
            )}
          </div>
        </li>
      );
    });
  }

  const avgScore = isOMS ? comments[0]?.assessmentSummary?.score : comments[0]?.avgScore;
  const commentNumber = isOMS
    ? comments[0]?.assessmentSummary?.assessmentNumber
    : comments[0]?.commentNumber;

  return (
    <div className={styles['goods-comments']}>
      <div className="comments-content-box">
        <ul className="comments-content">{renderComments()}</ul>
        <div className="comments-rate">
          <div className="comments-rate-info">
            <p className="comments-rate-title">
              {intl.get('mallf.common.viiw.commentScore').d('好评率')}
            </p>
            <p className="comments-rate-num">
              {intl.get('mallf.common.view.total.count', { value: avgScore }).d(`${avgScore}分`)}
            </p>
            <Rate
              className="rate-list"
              allowHalf
              disabled
              defaultValue={Math.round(avgScore) / 2}
            />
            <p className="comments-rate-total">
              {intl
                .get('mallf.common.view.totalPerson.comment', { value: commentNumber })
                .d(`共${commentNumber}人评价`)}
            </p>
          </div>
          {/* <div className="comments-rate-goods">
            <Image
              className="comments-goods-photo"
              value={productImage.imagePath}
              width={80}
              height={80}
            />
            <p>{skuName}</p>
          </div> */}
        </div>
      </div>
      <Pagination
        style={{ width: '100%', marginTop: 24 }}
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
