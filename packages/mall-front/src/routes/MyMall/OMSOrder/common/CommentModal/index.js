import React, { useState, useEffect } from 'react';
import { Rate } from 'hzero-ui';
import uuid from 'uuid/v4';

import { SupplierComponent } from 'utils/renderer';
import Swal from 'components/swal';
import Image from 'components/Image';
import { Input, Modal, Message, Button, Tooltip } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';
import { getUserConfigInfo, convertImg, getPrimaryColor } from 'utils/utils';
import Loading from 'components/loading';
import intl from 'utils/intl';
import {
  addOmsOrderCommentService,
  getOmsProductInfoService,
} from 'services/addOrderCommentService';
// import { fetchUomNameAndCode } from 'services/homeService';

import style from './index.less';
import AddComment from './AddComment';

const { Sidebar } = Modal;
const { TextArea } = Input;

export default function AddOrderComment(props) {
  const { commentVisible, setState, commentProduct, fetchOrderData = (e) => e } = props;
  console.log(commentProduct);
  const { organizationId, purchaseType, companyId, ownerId } = getUserConfigInfo();
  const [loading, setLoading] = useState(true);
  const [commentProductList, setCommentProductList] = useState([]);

  const {
    poLineId: initPolineId,
    productSource: newProductSource,
    waitAssessFlag,
    poNum,
    creationDate,
  } = commentProduct;
  useEffect(() => {
    const params = { poLineId: initPolineId, companyId };
    getProductInfo(params);
    // // 1晒图评价
    // if (waitAssessFlag === 1) getProductInfo(params);
    // // 2追加评价，3查看评价
    // if ([2, 3].includes(waitAssessFlag)) {
    //   productComment(params);
    // }
    // getUom();
  }, []);

  /**
   * 图片url处理
   * @param {String} code
   * @param {String} url
   */
  function HandleImgUrl(url) {
    return convertImg(url, 1, newProductSource);
  }

  /**
   * 获取单个子订单的所有商品信息
   * @param {Number} ecPoNum
   */
  function getProductInfo(params) {
    return getOmsProductInfoService(params).then((res) => {
      const newCommentProductList = res.map((ele) => ({
        ...ele,
        assessmentContent: ele.assessmentContent || '',
        assessmentImageUuid: ele.assessmentImageUuid || uuid(),
        appendImageUuid: ele.appendImageUuid || uuid(),
      }));
      setCommentProductList(newCommentProductList);
      setLoading(false);
    });
  }
  /**
   * 发表评论
   */
  function publishComment() {
    // 查看评价关闭弹窗
    if (waitAssessFlag === 3) {
      setState({ commentVisible: false });
      return;
    }
    let productSource = newProductSource;
    if (productSource !== 'CATA') {
      productSource = 'EC';
    }
    const commentPropsLists = commentProductList.map((item) => {
      return {
        // isImg,
        ...item,
        ownerId,
        companyId,
        purchaseType,
        productSource,
        tenantId: organizationId,
        orderCode: poNum,
        ecConsignmentCode: item?.ecPoSubNum,
      };
    });
    const remarkFlag = commentPropsLists.map((postComment) => {
      if (waitAssessFlag === 1) {
        return !!postComment.assessmentContent;
      }
      return !!(postComment.assessmentContent && postComment.appendContent);
    });
    const scoreFlag = commentPropsLists.map((postComment) => !!postComment.score);
    if ([...remarkFlag, ...scoreFlag].every((n) => n)) {
      setLoading(true);
      addOmsOrderCommentService({ ...commentPropsLists[0] }, waitAssessFlag)
        .then((res) => {
          if (res) {
            fetchOrderData();
            Message.success(
              intl.get('mallf.addOrderComment.view.comment.publishSuccess').d('评论发表成功')
            );
          }
        })
        .finally(() => {
          setState({ commentVisible: false });
          setLoading(false);
        });
    } else {
      const warnMessage =
        remarkFlag.includes(false) && scoreFlag.includes(false)
          ? intl.get('mallf.addOrderComment.please.fill.levelAndComment').d('请填写评级和评价')
          : remarkFlag.includes(false)
          ? intl.get('mallf.addOrderComment.please.fill.comment').d('请填写评价')
          : intl.get('mallf.addOrderComment.please.fill.level').d('请填写评级');
      Swal(warnMessage);
    }
  }

  /**
   * 商品的评价内容
   * @param {*} e
   * @param {*} item
   * @param {*} index
   */
  function textChange(e) {
    const newCommentProductList = commentProductList;
    newCommentProductList[0][
      waitAssessFlag === 1 ? 'assessmentContent' : 'appendContent'
    ] = e.target.value.slice(0, 500);
    setCommentProductList(newCommentProductList.slice());
  }

  /**
   * 评分
   */
  function rateChange(value, index) {
    const newCommentProductList = commentProductList;
    newCommentProductList[index].score = value * 2;
    setCommentProductList(newCommentProductList.slice());
  }

  const handleTitle = () => {
    let title;
    switch (waitAssessFlag) {
      case 1:
        title = intl.get('mallf.common.view.goto.comment').d('晒单评价');
        break;
      case 2:
        title = intl.get('mallf.common.view.goto.addComment').d('追加评论');
        break;
      case 3:
        title = intl.get('mallf.common.view.goto.commentView').d('查看评论');
        break;
      default:
        break;
    }
    return title;
  };

  const addCommentProps = {
    comments: commentProductList,
    waitAssessFlag,
    textChange,
  };

  const footerProps = {
    [waitAssessFlag === 3 && 'footer']: [
      <Button
        style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
        key="back"
        onClick={() => setState({ commentVisible: false })}
      >
        {intl.get('hzero.common.button.close').d('关闭')}
      </Button>,
    ],
  };
  return (
    <Sidebar
      title={handleTitle()}
      className={style['comment-modal']}
      visible={commentVisible}
      onOk={publishComment}
      onCancel={() => setState({ commentVisible: false })}
      cancelText={intl.get('hzero.common.status.cancel').d('取消')}
      width={1090}
      closable
      confirmLoading={loading}
      {...footerProps}
    >
      {loading ? (
        <Loading />
      ) : (
        commentProductList.length > 0 && (
          <div className="orderComment-container">
            <div className="orderComment">
              <div className="orderComment-top">
                <div className="comment-ponum">
                  <span>{intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号')}：</span>
                  <Tooltip placement="top" title={poNum}>
                    <span>{poNum}</span>
                  </Tooltip>
                </div>
                <SupplierComponent>
                  <div className="comment-supplier">
                    <span>{intl.get('mallf.myOrder.view.supplier').d('供应商')}：</span>
                    <Tooltip placement="top" title={commentProductList[0]?.supplierCompanyName}>
                      <span title={commentProductList[0]?.supplierCompanyName}>
                        {commentProductList[0]?.supplierCompanyName}
                      </span>
                    </Tooltip>
                  </div>
                </SupplierComponent>
                <div className="comment-time">
                  <span>{creationDate}</span>
                </div>
              </div>
              <div className="orderComment-content">
                <div className="order-lists">
                  {commentProductList.map((item, index) => {
                    const remainNum =
                      500 - Number(commentProductList[index]?.assessmentContent.length);
                    return (
                      <div className="order-list">
                        <div className="order-info">
                          <div className="info-img">
                            <Image
                              width={100}
                              height={100}
                              value={HandleImgUrl(item.ecImagePath)}
                              alt={intl.get('mallf.myOrder.view.product').d('商品')}
                            />
                          </div>
                          <div className="info-name">{item.skuName}</div>
                          <p className="price-color text-overflow">
                            {item?.currencySymbol || ''}
                            {item?.unitPriceMeaning || item.unitPrice}
                            {item?.uomName ? `/${item?.uomName}` : ''}
                          </p>
                        </div>
                        {[2, 3].includes(waitAssessFlag) ? (
                          <AddComment {...addCommentProps} />
                        ) : (
                          <div className="order-comment">
                            <div className="goods-rate">
                              <p>{intl.get('mallf.myOrder.view.productLevel').d('商品评级')}</p>
                              <div>
                                <Rate
                                  className="rate-list"
                                  onChange={(value) => rateChange(value, index)}
                                  allowHalf
                                  defaultValue={0}
                                />
                                {!!commentProductList[index].score && (
                                  <span>
                                    {commentProductList[index].score}
                                    {intl.get('mallf.myOrder.view.score').d('分')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="comment-content">
                              <TextArea
                                label={intl.get(`mallf.myOrder.view.myComment`).d('我的评价')}
                                value={commentProductList[index]?.assessmentContent}
                                rows={2}
                                onChange={(e) => textChange(e, index)}
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
                                  <div className="clearfix">
                                    <Attachment
                                      label={intl
                                        .get('mallf.myOrder.view.comment.uploadPictures')
                                        .d('上传图片')}
                                      labelLayout="float"
                                      accept={['image/*']}
                                      listType="picture-card"
                                      max={9}
                                      value={item.assessmentImageUuid}
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
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </Sidebar>
  );
}
