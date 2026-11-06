import React, { useState, useEffect } from 'react';
import { Rate } from 'hzero-ui';
import uuid from 'uuid/v4';

import formatterCollections from 'utils/intl/formatterCollections';
import Swal from 'components/swal';
import Image from 'components/Image';
import { Input, Icon, Modal, Message, Button, Tooltip } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';
import { getUserConfigInfo, convertImg, getPrimaryColor, numberRender } from 'utils/utils';
import Loading from 'components/loading';
import {
  addOmsOrderCommentService,
  getOmsProductInfoService,
} from 'services/addOrderCommentService';
import intl from 'utils/intl';
import { SupplierComponent } from 'utils/renderer';
import style from './index.less';
import AddComment from './AddComment';

const { Sidebar } = Modal;
const { TextArea } = Input;

function AddOrderComment(props) {
  const { commentVisible, setState, commentProduct, fetchOrderData } = props;
  const [loading, setLoading] = useState(true);
  const [commentProductList, setCommentProductList] = useState([]);
  const {
    productSource: newProductSource,
    assessmentFlag,
    creationDate,
    orderEntryId,
    consignmentEntryId,
    pointsTypeName,
  } = commentProduct;
  useEffect(() => {
    const params = { orderEntryId, consignmentEntryId, channel: 'PERSONAL' };
    getProductInfo(params);
    // // 1晒图评价
    // if (assessmentFlag === 1) getProductInfo(params);
    // // 2追加评价，3查看评价
    // if ([2, 3].includes(assessmentFlag)) {
    //   productComment(params);
    // }
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
   * 监听滚动事件
   */
  // function handleScroll(e){
  //   const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  //   const scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
  //   const {clientHeight} = document.documentElement;
  //   const bottom = scrollHeight - scrollTop - clientHeight;
  //   if (bottom >= 90) {
  //     setFixFoot(true);
  //   } else if (bottom < 90) {
  //     setFixFoot(false);
  //   }
  // };

  /**
   * 发表评论
   */
  function publishComment() {
    // 查看评价关闭弹窗
    if (assessmentFlag === 3) {
      setState({ commentVisible: false });
      return;
    }
    let productSource = newProductSource;
    if (productSource !== 'CATA') {
      productSource = 'EC';
    }
    const { organizationId, purchaseType, companyId, ownerId } = getUserConfigInfo();
    const commentPropsLists = commentProductList.map((item) => {
      return {
        // isImg,
        ...item,
        ownerId,
        companyId,
        purchaseType,
        productSource,
        tenantId: organizationId,
      };
    });
    const params = { ...commentProduct, ...commentProductList[0], channel: 'PERSONAL' };
    const remarkFlag = commentPropsLists.map((postComment) => {
      if (assessmentFlag === 1) {
        return !!postComment.assessmentContent;
      }
      return !!(postComment.assessmentImageUuid && postComment.appendContent);
    });
    const scoreFlag = commentPropsLists.map((postComment) => !!postComment.score);
    if ([...remarkFlag, ...scoreFlag].every((n) => n)) {
      setLoading(true);
      addOmsOrderCommentService(params, assessmentFlag)
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
      assessmentFlag === 1 ? 'assessmentContent' : 'appendContent'
    ] = e.target.value.slice(0, 500);
    setCommentProductList(newCommentProductList.slice());
  }

  /**
   * 评分
   */
  function rateChange(value, index, field) {
    const newCommentProductList = commentProductList;
    newCommentProductList[index][field] = value * 2;
    setCommentProductList(newCommentProductList.slice());
  }

  const handleTitle = () => {
    let title;
    switch (assessmentFlag) {
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
    assessmentFlag,
    textChange,
  };

  const footerProps = {
    [assessmentFlag === 3 && 'footer']: [
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
      okText={intl.get('mallf.myMall.model.account.confirm').d('确认')}
    >
      {loading ? (
        <Loading />
      ) : (
        commentProductList.length > 0 && (
          <div className="orderComment-container">
            <div className="orderComment">
              <div className="orderComment-top">
                <div className="comment-ponum">
                  <span>{intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号')}：</span>
                  <Tooltip placement="top" title={commentProductList[0]?.orderCode}>
                    <span>{commentProductList[0]?.orderCode}</span>
                  </Tooltip>
                </div>
                <SupplierComponent>
                  <div className="comment-supplier">
                    <span>{intl.get('mallf.common.view.supplier').d('供应商')}：</span>
                    <Tooltip placement="top" title={commentProductList[0]?.orderCode}>
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
                              value={HandleImgUrl(item.primaryUrl)}
                              alt={intl.get('mallf.common.view.product').d('商品')}
                            />
                          </div>
                          <div className="info-name">{item.skuName}</div>
                          <p>
                            {['HYBRID_PAYMENT', 'POINTS_PAYMENT'].includes(
                              commentProduct.paymentModel
                            ) && (
                              <span className="product-info-price-sigl">
                                <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                                {numberRender(commentProduct?.pointPrice)}
                                {['HYBRID_PAYMENT'].includes(commentProduct.paymentModel) && (
                                  <span style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}>
                                    +
                                  </span>
                                )}
                              </span>
                            )}
                            {['HYBRID_PAYMENT', 'CASH_PAYMENT'].includes(
                              commentProduct.paymentModel
                            ) &&
                              `${commentProduct?.currencySymbol || ''}${
                                commentProduct?.orderPriceFinalVO?.finalUnitPriceMeaning ||
                                commentProduct?.orderPriceFinalVO?.finalUnitPrice ||
                                commentProduct?.unitPriceMeaning ||
                                commentProduct?.unitPrice
                              }`}
                            {commentProduct.uomName && (
                              <span style={{ fontSize: 12 }}>/{commentProduct.uomName}</span>
                            )}
                            {/* {item?.unitPriceMeaning || item.unitPrice}
                            {uom && <span style={{ fontSize: 12 }}>/{uom}</span>} */}
                          </p>
                          {pointsTypeName && (
                            <div style={{ color: '#999999' }}>{pointsTypeName}</div>
                          )}
                        </div>
                        {[2, 3].includes(assessmentFlag) ? (
                          <AddComment {...addCommentProps} />
                        ) : (
                          <div className="order-comment">
                            <div style={{ padding: '20px' }}>
                              <div className="goods-rate">
                                <p className="font-weight">
                                  {intl.get('mallf.common.view.productLevel').d('商品评级')}
                                </p>
                                <div className="goods-rate-content">
                                  <Rate
                                    className="rate-list"
                                    onChange={(value) => rateChange(value, index, 'score')}
                                    allowHalf
                                    defaultValue={0}
                                  />
                                  {!!commentProductList[index].score && (
                                    <span>
                                      {commentProductList[index].score}
                                      {intl.get('mallf.common.view.score').d('分')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="comment-content">
                                <TextArea
                                  label={intl
                                    .get('mallf.addOrderComment.view.comment.myCommodity')
                                    .d('我的评价')}
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
                            <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
                              <div className="goods-rate">
                                <p className="font-weight">
                                  {intl.get('mallf.common.view.serviceQuality').d('服务质量')}
                                </p>
                                <div className="goods-rate-content">
                                  <Rate
                                    className="rate-list"
                                    onChange={(value) => rateChange(value, index, 'serviceScore')}
                                    allowHalf
                                    defaultValue={0}
                                  />
                                  {!!commentProductList[index].serviceScore && (
                                    <span>
                                      {commentProductList[index].serviceScore}
                                      {intl.get('mallf.common.view.score').d('分')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="goods-rate">
                                <p className="font-weight">
                                  {intl.get('mallf.common.view.deliverySpeed').d('配送速度')}
                                </p>
                                <div className="goods-rate-content">
                                  <Rate
                                    className="rate-list"
                                    onChange={(value) => rateChange(value, index, 'transportScore')}
                                    allowHalf
                                    defaultValue={0}
                                  />
                                  {!!commentProductList[index].transportScore && (
                                    <span>
                                      {commentProductList[index].transportScore}
                                      {intl.get('mallf.common.view.score').d('分')}
                                    </span>
                                  )}
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

export default formatterCollections({ code: 'mallf.addOrderComment' })(AddOrderComment);
