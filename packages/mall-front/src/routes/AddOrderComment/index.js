import React, { useState, useEffect } from 'react';
import { Button, Input, Rate } from 'hzero-ui';
import qs from 'qs';
import uuid from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
import Swal from 'components/swal';
import BreadCrumbs from 'components/BreadCrumbs';
import Image from 'components/Image';
import { Upload, Icon, Modal } from 'choerodon-ui';
import { deleteUuidImage } from 'services/api';
import { getUserConfigInfo, convertImg, getOrganizationId, getHeader } from 'utils/utils';
import Loading from 'components/loading';
import * as HmallConfig from 'utils/api-config';
import { addOrderCommentService, getProductInfoService } from 'services/addOrderCommentService';
import intl from 'utils/intl';
import noComment from '../../assets/images/no-comment.png';

import style from './index.less';
import useSetState from '@/hooks/useState';

const { TextArea } = Input;

function AddOrderComment(props) {
  const [loading, setLoading] = useState(true);
  const [commentProductList, setCommentProductList] = useState([]);
  const [previewVisible, setPreviewVisiblet] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  // const [fileList, setFileList] = useState([]);
  const [fileObj, setFileObj] = useSetState({});

  // const [fixFoot, setFixFoot] = useState(true); // 发表按钮是否固定底部

  const { poLineId: initPolineId, productSource: newProductSource } = qs.parse(
    props.location.search.substr(1)
  );
  useEffect(() => {
    const params = { poLineId: initPolineId };
    getProductInfo(params);
  }, []);

  /**
   * 图片url处理
   * @param {String} code
   * @param {String} url
   */
  function HandleImgUrl(url) {
    const { productSource: code } = qs.parse(props.location.search.substr(1));
    return convertImg(url, 1, code);
  }

  /**
   * 获取单个子订单的所有商品信息
   * @param {Number} ecPoNum
   */
  function getProductInfo(params) {
    return getProductInfoService(params).then((res) => {
      const newCommentProductList = res.map((ele) => ({
        ...ele,
        imageUuid: uuid(),
        remark: '',
        // isImg: false,
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
    let { productSource } = qs.parse(props.location.search.substr(1));
    if (productSource !== 'CATA') {
      productSource = 'EC';
    }
    const { organizationId, purchaseType, companyId, ownerId } = getUserConfigInfo();
    const commentPropsLists = commentProductList.map((item) => {
      const {
        // isImg,
        id,
        score,
        remark,
        productId,
        imageUuid,
        poLineId,
        productName,
        poHeaderId,
        poSubHeaderId,
      } = item;
      return {
        // isImg,
        id,
        score,
        remark,
        ownerId,
        productId,
        companyId,
        imageUuid,
        poLineId,
        productName,
        poHeaderId,
        purchaseType,
        productSource,
        poSubHeaderId,
        tenantId: organizationId,
      };
    });
    const remarkFlag = commentPropsLists.map((postComment) => !!postComment.remark);
    const scoreFlag = commentPropsLists.map((postComment) => !!postComment.score);
    if ([...remarkFlag, ...scoreFlag].every((n) => n)) {
      setLoading(true);
      addOrderCommentService(commentPropsLists).then(() => {
        Swal(intl.get('mallf.addOrderComment.view.comment.publishSuccess').d('评论发表成功')).then(
          () => {
            getProductInfoService(initPolineId)
              .then((res) => {
                if (res.length === 0) {
                  props.history.push('/my-mall/my-order');
                } else {
                  const newCommentProductList = res.map((ele) => ({
                    ...ele,
                    imageUuid: uuid(),
                    remark: '',
                    // isImg: false,
                  }));
                  setCommentProductList(newCommentProductList);
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }
        );
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
  function textChange(e, index) {
    const newCommentProductList = commentProductList;
    newCommentProductList[index].remark = e.target.value.slice(0, 500);
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

  /**
   * 判断是否上传了图片
   * @param {Boolean} isImg
   * @param {Number} index
   */
  // function handleIsImg(isImg, index) {
  //   const newCommentProductList = commentProductList;
  //   newCommentProductList[index].isImg = isImg;
  //   setCommentProductList(newCommentProductList);
  // }

  const { ecCreateTime, ecPoSubNum } = commentProductList[0] || '';

  const uploadButton = (
    <div>
      <Icon type="add" />
      <div className="c7n-upload-text">
        {intl.get('mallf.addOrderComment.button.upload').d('上传')}
      </div>
    </div>
  );

  function handlePreview(file) {
    setPreviewVisiblet(true);
    setPreviewImage(file.url || file.thumbUrl);
  }

  const handleChange = ({ fileList: list }, id) => {
    let mergeList = [...list];
    mergeList = mergeList.filter((item) => /^image\/*/.test(item.type));
    // onFileChange(mergeList.filter(m => m.status === 'done').length);
    for (let i = 0; i < mergeList.length - 1; i++) {
      for (let j = i + 1; j < mergeList.length; j++) {
        if (mergeList[i].uid === mergeList[j].uid) {
          if (mergeList[i].status === 'done') {
            mergeList.splice(j, 1);
            j--;
          } else if (mergeList[j].status === 'done') {
            mergeList.splice(i, 1);
            i--;
          }
        }
      }
    }

    const newFileList = mergeList.map((item) => {
      const tmpFile = item;
      if (item.response && !item.response.failed) {
        tmpFile.url = item.response;
      }
      return tmpFile;
    });

    const tmpFileList = newFileList.filter((item) => item.status !== 'error' && item.status);
    setFileObj({ [`${id}-fileList`]: tmpFileList });
    // setFileList(tmpFileList);
  };

  const beforeUpload = (file, list, id) => {
    if (['image/tiff', 'image/tif'].includes(file.type)) {
      Swal(intl.get('mallf.common.not.support.tif').d('当前不支持tif格式'));
      return false;
    }
    if (list.length + fileObj[`${id}-fileList`]?.length > 9) {
      Swal(intl.get('mallf.common.max.9.uploadLength').d('最多上传9张图片'));
      return false;
    }
    if (/^image\/*/.test(file.type)) {
      const tmpList = [...list];
      tmpList.filter((item) => /^image\/*/.test(item.type));
      for (let i = 0; i < tmpList.length; i++) {
        if (file.uid === list[i].uid) {
          return true;
        }
      }
      file.status = 'error'; // eslint-disable-line
      return false;
    } else {
      file.status = 'error'; // eslint-disable-line
      return false;
    }
  };

  function handleRemove(file, uid) {
    let newFileList = [...fileObj[`${uid}-fileList`]];
    newFileList = newFileList.filter((item) => item.uid !== file.uid);
    setFileObj({ [`${uid}-fileList`]: newFileList });
    // setFileList(newFileList);
    deleteUuidImage(file.url, uid);
  }

  return (
    <React.Fragment>
      {loading ? (
        <Loading />
      ) : commentProductList.length > 0 ? (
        <div className={style['orderComment-container']}>
          <BreadCrumbs
            className="breadCrumbs"
            value={{
              pageTitle: {
                name: intl.get('mallf.addOrderComment.view.comment.myMall').d('商城订单管理'),
                path: '/my-mall/my-order',
              },
              childTitle1: intl.get('mallf.addOrderComment.view.comment.commodity').d('商品评价'),
            }}
          />
          <div className="orderComment">
            <div className="orderComment-top">
              <h1>{intl.get('mallf.addOrderComment.view.comment.commodity').d('商品评价')}</h1>
              <p>
                {newProductSource !== 'CATA' && (
                  <span>
                    {intl.get('mallf.addOrderComment.view.comment.childOrderNumber').d('子订单号')}
                    ：{ecPoSubNum}
                  </span>
                )}
                <span>
                  {intl.get('mallf.addOrderComment.view.createTime').d('生成时间')}：{ecCreateTime}
                </span>
              </p>
            </div>
            <div className="orderComment-content">
              <div className="order-lists">
                {commentProductList.map((item, index) => {
                  const remainNum = 500 - Number(commentProductList[index]?.remark.length);
                  return (
                    <div className="order-list">
                      <div className="order-info">
                        <div className="info-img">
                          <Image
                            value={HandleImgUrl(item.ecImagePath)}
                            alt={intl.get('mallf.addOrderComment.view.product').d('商品')}
                          />
                        </div>
                        <div className="info-name">{item.productName}</div>
                        <p>{item.ecAgreementPrice}</p>
                      </div>
                      <div className="order-comment">
                        <div className="goods-rate">
                          <p>{intl.get('mallf.addOrderComment.view.productLevel').d('商品评级')}</p>
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
                                {intl.get('mallf.addOrderComment.view.score').d('分')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="comment-content">
                          <p>
                            {intl.get('mallf.addOrderComment.view.comment.commodity').d('商品评价')}
                          </p>
                          <TextArea
                            value={commentProductList[index]?.remark}
                            placeholder={intl
                              .get('mallf.addOrderComment.view.comment.shareShoppingMood')
                              .d('分享购物心情~')}
                            style={{
                              width: '708px',
                              outline: 'none',
                              height: '138px',
                              maxHeight: '138px',
                            }}
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
                            <p>
                              {intl
                                .get('mallf.addOrderComment.view.comment.addPictures')
                                .d('添加图片')}
                            </p>
                            <div className="clearfix" style={{ width: 710 }}>
                              <Upload
                                action={`${
                                  HmallConfig.apiGateway
                                }/hfle/v1/${getOrganizationId()}/files/attachment/multipart`}
                                headers={getHeader({})}
                                listType="picture-card"
                                accept="image/*"
                                multiple
                                data={{
                                  bucketName: 'public-bucket',
                                  directory: 'mall-upload',
                                  attachmentUUID: item.imageUuid,
                                }}
                                fileList={fileObj[`${item.imageUuid}-fileList`] || []}
                                onPreview={handlePreview}
                                onChange={(o) => handleChange(o, item.imageUuid)}
                                beforeUpload={(f, l) => beforeUpload(f, l, item.imageUuid)}
                                onRemove={(file) => {
                                  handleRemove(file, item.imageUuid);
                                }}
                              >
                                {fileObj[`${item.imageUuid}-fileList`]?.length >= 9
                                  ? null
                                  : uploadButton}
                              </Upload>
                            </div>

                            <Modal
                              visible={previewVisible}
                              footer={null}
                              onCancel={() => {
                                setPreviewVisiblet(false);
                                setPreviewImage('');
                              }}
                            >
                              <img alt="" style={{ width: '100%' }} src={previewImage} />
                            </Modal>
                            {/* <ImageUpload
                              maxImgNum={8}
                              attachmentUUID={item.imageUuid}
                              index={index}
                              handleIsImg={handleIsImg}
                              organizationId={0}
                            /> */}
                            {/* <UploadList
                              showNumberInfo
                              maxImgNum={9}
                              attachmentUUID={item.imageUuid}
                            /> */}
                            {/* imgSetting={{
                              showPreview: false,
                              showDel: false,
                              showUploadBtn: false,
                              }
                              } */}
                          </div>
                          <div className="img-num-info">
                            {intl
                              .getHTML('mallf.common.addOrder.confirm.upload', {
                                value1: !fileObj[`${item.imageUuid}-fileList`]
                                  ? 0
                                  : fileObj[`${item.imageUuid}-fileList`].length,
                                value2:
                                  9 -
                                  (!fileObj[`${item.imageUuid}-fileList`]
                                    ? 0
                                    : fileObj[`${item.imageUuid}-fileList`].length),
                              })
                              .d(
                                <span>
                                  共
                                  <b>
                                    {!fileObj[`${item.imageUuid}-fileList`]
                                      ? 0
                                      : fileObj[`${item.imageUuid}-fileList`].length}
                                  </b>
                                  张，还能上传
                                  <b>
                                    {9 -
                                      (!fileObj[`${item.imageUuid}-fileList`]
                                        ? 0
                                        : fileObj[`${item.imageUuid}-fileList`].length)}
                                  </b>
                                  张
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="publish">
                <Button
                  type="primary"
                  style={{ width: '126px', height: '36px' }}
                  onClick={publishComment}
                >
                  {intl.get('mallf.addOrderComment.model.comment.publish').d('发表')}
                </Button>
              </div>
            </div>
          </div>
          {/* <div className="publish" style={{ width: footerWidth }}>
        <div className={fixFoot ? 'publish-fix' : 'pubulish-unFix'}>
          <Button type="primary">发表</Button>
        </div>
      </div> */}
        </div>
      ) : (
        <div className={style['no-comment']}>
          <Image value={noComment} />
        </div>
      )}
    </React.Fragment>
  );
}

export default formatterCollections({ code: 'mallf.addOrderComment' })(AddOrderComment);
