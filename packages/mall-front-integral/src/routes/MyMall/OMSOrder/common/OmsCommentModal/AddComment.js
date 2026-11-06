import React, { useState } from 'react';
import { Rate } from 'hzero-ui';
import { Input } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';
import Image from 'components/Image';
import ImageViewer from 'components/ImageViewer';
import intl from 'utils/intl';

const { TextArea } = Input;
function CommentDetail(props) {
  const { comments, textChange, assessmentFlag } = props;
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState({
    imgList: [],
    index: 0,
    type: 'first',
  });

  /**
   * 预览大图
   */
  const previewBigImg = (item, index, imgList, type) => {
    setVisible(true);
    setPreview({
      index,
      imgList,
      type,
    });
  };

  const {
    assessmentContent,
    assessmentImageUuid,
    appendContent,
    appendImageUuid,
    assessmentFileList,
    appendFileList,
    assessmentDate,
    appendDate,
    score,
    serviceScore,
    transportScore,
  } = comments[0] || {};
  const remainNum = 500 - Number((appendContent || '').length);
  return (
    <div className="comment-detail-right">
      <div className="comment-first">
        <div className="goods-rate">
          <div className="comment-detail-title">
            {intl.get('mallf.common.view.commodity.rating').d('商品评级')}
          </div>
          <div>
            <Rate className="rate-list" disabled allowHalf defaultValue={Math.round(score) / 2} />
            {score && (
              <span>
                {intl.get('mallf.common.view.valueScore', { value: score }).d(`${score}分`)}
              </span>
            )}
          </div>
        </div>
        <div className="comment-detail-top">
          <div className="info">
            <div className="comment-detail-title">
              {intl.get('mallf.common.view.product.comment').d('商品评价')}
            </div>
            <div className="comment-detail-describe">
              {assessmentContent ||
                `${intl
                  .get('mallf.commentDetail.view.comment.noTextEvaluation')
                  .d('暂无文字评价')}`}
            </div>
          </div>
        </div>
        {assessmentFileList && assessmentFileList.length > 0 && (
          <>
            <div className="comment-detail-bottom">
              <Attachment
                downloadAll={false}
                label={intl.get('mallf.myOrder.view.picturePreview').d('图片预览')}
                labelLayout="float"
                accept={['image/*']}
                listType="picture-card"
                max={9}
                value={assessmentImageUuid}
                bucketName="public-bucket"
                bucketDirectory="mall-front"
                onChange={(e) => e}
                readOnly
              />
            </div>
          </>
        )}
        <div className="comment-time">
          <div className="comment-detail-title">
            {intl.get('mallf.common.view.commentTime').d('评价时间')}
          </div>
          <div className="comment-detail-time">{assessmentDate}</div>
        </div>
      </div>
      <div className="order-comment add-comment">
        {assessmentFlag === 2 ? (
          <>
            <div className="comment-content">
              <TextArea
                label={intl.get('mallf.common.view.goto.addComment').d('追加评价')}
                value={appendContent}
                rows={2}
                onChange={(e) => textChange(e)}
              />
            </div>
            <div className="text-number">
              {intl
                .get('mallf.addOrderComment.view.comment.tips', {
                  value: remainNum > 0 ? remainNum : 0,
                })
                .d(`还可输入${remainNum > 0 ? remainNum : 0}字`)}
            </div>
            <div className="add-img">
              <div className="upload-img">
                <div className="clearfix">
                  <Attachment
                    label={intl.get('mallf.myOrder.view.comment.uploadPictures').d('上传图片')}
                    labelLayout="float"
                    accept={['image/*']}
                    listType="picture-card"
                    max={9}
                    value={appendImageUuid}
                    bucketName="public-bucket"
                    bucketDirectory="mall-front"
                    onChange={(e) => e}
                    help={intl
                      .get('mallf.common.view.attProps.helpAccept', {
                        accept: 'PNG、JPG、JPEG',
                      })
                      .d(`支持PNG、JPG、JPEG格式`)}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="comment-add">
            <div className="comment-detail-top">
              <div className="info">
                <div className="comment-detail-title">
                  {intl.get('mallf.common.view.goto.addComment').d('追加评价')}
                </div>
                <div className="comment-detail-describe">
                  {appendContent ||
                    `${intl
                      .get('mallf.commentDetail.view.comment.noTextEvaluation')
                      .d('暂无文字评价')}`}
                </div>
              </div>
            </div>
            {appendFileList && appendFileList.length > 0 && (
              <>
                <div className="comment-detail-bottom">
                  <div className="comment-detail-title">
                    {intl.get('mallf.common.view.picturePreview').d('图片预览')}
                  </div>
                  <ul>
                    {appendFileList.map((i, index, n) => (
                      <li className="comments-picture">
                        <Image value={i.fileUrl} width={53} height={53} />
                        <div className="img-modal">
                          <a
                            onClick={() => {
                              previewBigImg(i, index, n, 'add');
                            }}
                            className="modal-icon preview-btn"
                          >
                            &nbsp;
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            <div className="comment-time">
              <div className="comment-detail-title">
                {intl.get('mallf.common.view.addCommentTime').d('追加评价时间')}
              </div>
              <div className="comment-detail-time">{appendDate}</div>
            </div>
          </div>
        )}
      </div>
      {assessmentFlag === 3 && (
        <div className="comment-other">
          <div className="goods-rate">
            <div className="comment-detail-title">
              {intl.get('mallf.common.view.serviceQuality').d('服务质量')}
            </div>
            <div>
              <Rate
                className="rate-list"
                disabled
                allowHalf
                defaultValue={Math.round(serviceScore) / 2}
              />
              {!!serviceScore && (
                <span>
                  {intl
                    .get('mallf.common.view.valueScore', { value: serviceScore })
                    .d(`${serviceScore}分`)}
                </span>
              )}
            </div>
          </div>
          <div className="goods-rate">
            <div className="comment-detail-title">
              {intl.get('mallf.common.view.deliverySpeed').d('配送速度')}
            </div>
            <div>
              <Rate
                className="rate-list"
                disabled
                allowHalf
                defaultValue={Math.round(transportScore) / 2}
              />
              {!!transportScore && (
                <span>
                  {intl
                    .get('mallf.common.view.valueScore', { value: transportScore })
                    .d(`${transportScore}分`)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {visible && (
        <ImageViewer
          closeModal={() => {
            setVisible(false);
          }}
          imgList={preview.type === 'first' ? assessmentFileList : appendFileList}
          index={preview.index}
        />
      )}
    </div>
  );
}

export default CommentDetail;
