import React, { useEffect, useState } from 'react';
import qs from 'qs';
import { Rate } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import Link from 'components/Link';
import Image from 'components/Image';
import Loading from 'components/loading';
import BreadCrumbs from 'components/BreadCrumbs';
import ImageViewer from 'components/ImageViewer';
import intl from 'utils/intl';
import * as Hmall from 'utils/utils';
import { fetchSingleComment } from 'services/favoriteCommentService';
import { math } from 'choerodon-ui/dataset';
import styles from './index.less';

function CommentDetail(props) {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const productAssessmentId = qs.parse(props.location.search.substr(1));
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState({
    imgList: [],
    index: 0,
  });
  useEffect(() => {
    setLoading(true);
    fetchSingleComment(productAssessmentId)
      .then((res) => {
        setComments(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * 预览大图
   */
  const previewBigImg = (item, index, imgList) => {
    setVisible(true);
    setPreview({
      index,
      imgList,
    });
  };

  const {
    remark,
    productId,
    imageDTO,
    ecPlatform,
    assessTime,
    productName,
    ecImagePath,
    // cataImagePath,
    // productSource,
    ecAgreementPrice,
    // cataAgreementPrice,
    score,
  } = comments;
  const imagePath = Hmall.convertImg(ecImagePath, 1, ecPlatform);
  return (
    <div className={styles['comments-container']}>
      <BreadCrumbs
        className="breadCrumbs"
        value={{
          pageTitle: {
            name: intl.get('mallf.commentDetail.view.myComments').d('我的评价'),
            path: '/my-mall/my-comments',
          },
          childTitle1: intl.get('mallf.commentDetail.view.comment.detail').d('评价详情'),
        }}
      />
      <div className="comment-detail-header">
        <div>{intl.get('mallf.commentDetail.view.comment.detail').d('评价详情')}</div>
        <div>
          {intl
            .get('mallf.commentDetail.view.comment.shareShoppingMood')
            .d('快乐的你分享完美的使用心得')}
          ~
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="comment-content">
          {/* <ul className="comment-order-top">
            <li>
              {ecPoNum
                ? `${intl
                    .get('mallf.common.view.common.E-commerceParentOrder')
                    .d('电商父订单')}：${ecPoNum}`
                : `${intl
                    .get('mallf.common.view.common.E-commerceSub-order')
                    .d('电商子订单')}：${ecPoSubNum}`}
            </li>
            <li>
              {intl.get('mallf.comment.view.comment.orderTime').d('订单时间')}：{ecCreateTime}
            </li>
          </ul> */}
          <div className="comment-detail-container">
            <div className="comment-detail-left">
              <Link to={`/product-detail?productId=${productId}&sourceFrom=${ecPlatform}`}>
                <Image value={imagePath} width={130} height={130} />
              </Link>
              <Link to={`/product-detail?productId=${productId}&sourceFrom=${ecPlatform}`}>
                <div className="product-name" title={productName}>
                  {productName}
                </div>
              </Link>
              <div className="product-price">{Hmall.numberRender(ecAgreementPrice)}</div>
            </div>
            <div className="comment-detail-right">
              <div className="goods-rate">
                <p>{intl.get('mallf.commentDetail.view.commodity.rating').d('商品评级')}</p>
                <div>
                  <Rate
                    className="rate-list"
                    disabled
                    allowHalf
                    defaultValue={math.round(score) / 2}
                  />
                  {score && (
                    <span>
                      {intl
                        .get('mallf.commentDetail.view.valueScore', { value: score })
                        .d(`${score}分`)}
                    </span>
                  )}
                </div>
              </div>
              <div className="comment-detail-top">
                <div className="info">
                  <div className="comment-detail-title">
                    {intl.get('mallf.commentDetail.view.comment.commodity').d('商品评价')}
                  </div>
                  <div className="comment-detail-describe">
                    {remark ||
                      `${intl
                        .get('mallf.commentDetail.view.comment.noTextEvaluation')
                        .d('暂无文字评价')}`}
                  </div>
                </div>
              </div>
              {imageDTO && imageDTO.length > 0 && (
                <>
                  <div className="comment-detail-bottom">
                    <div className="comment-detail-title">
                      {intl.get('mallf.commentDetail.view.picturePreview').d('图片预览')}
                    </div>
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
                  </div>
                  <div className="comment-detail-time">{assessTime}</div>
                </>
              )}
              {visible && (
                <ImageViewer
                  closeModal={() => {
                    setVisible(false);
                  }}
                  iimgList={imageDTO}
                  index={preview.index}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default formatterCollections({ code: ['mallf.commentDetail'] })(CommentDetail);
