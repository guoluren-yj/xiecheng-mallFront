import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  DataSet,
  Form,
  Rate,
  TextArea,
  Output,
  Attachment,
  message,
  Tooltip,
  Icon,
} from 'choerodon-ui/pro';
import uuidv4 from 'uuid/v4';
import { Observer } from 'mobx-react-lite';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { convertImg, numberRender } from 'utils/utils';
import { SupplierComponent } from 'utils/renderer';
import Image from 'components/Image';
import Loading from 'components/loading';
import {
  addOmsOrderCommentService,
  getOmsProductInfoService,
} from 'services/addOrderCommentService';
import style from './comment.less';

// 个性化单元编码
const codeMap = {
  base: 'MALL.COMMENTS.MATAIN_FORM',
  append: 'MALL.COMMENTS.APPEND_FORM',
  service: 'MALL.COMMENTS.SERVICE_FORM',
};

const unitCode = Object.values(codeMap);
const customizeUnitCode = unitCode.join(',');

// 评分字段
const RateField = (props) => {
  const { name, ...rateProps } = props;
  return (
    <Output
      name={name}
      renderer={({ value, record }) => {
        return (
          <div className="comment-rate">
            <Rate
              {...rateProps}
              allowHalf
              allowClear={false}
              value={value / 2}
              className="comment-rate-field"
              onChange={(val) => {
                if (record) {
                  record.set(name, val * 2);
                }
              }}
            />
            {!!value && (
              <span>{intl.get('mallf.myOrder.view.valueScore', { value }).d(`${value}分`)}</span>
            )}
          </div>
        );
      }}
    />
  );
};

// 文本域字段区分只读
function getTextAreaField(readOnly) {
  if (readOnly) {
    return {
      FormField: Output,
    };
  }
  return {
    FormField: TextArea,
    formFieldProps: { showLengthInfo: true, style: { width: 520 } },
  };
}

// 附件字段区分只读
function getAttachmentProps(readOnly) {
  return {
    max: 9,
    readOnly,
    labelLayout: 'float',
    downloadAll: false,
    accept: ['image/*'],
    listType: 'picture-card',
    bucketName: 'public-bucket',
    bucketDirectory: 'mall-front',
    className: readOnly ? 'comment-file-read' : '',
    help: readOnly
      ? ''
      : intl
          .get('mallf.common.view.attProps.helpAccept', {
            accept: 'PNG、JPG、JPEG',
          })
          .d(`支持PNG、JPG、JPEG格式`),
    label: readOnly
      ? intl.get('mallf.myOrder.view.picturePreview').d('图片预览')
      : intl.get('mallf.myOrder.view.comment.uploadPictures').d('上传图片'),
  };
}

// 根据标识弹窗不同特性
function getModalCharacter(product) {
  const { assessmentFlag } = product;
  const assessmentFlagMap = {
    1: {
      modalProps: {
        title: intl.get('mallf.common.view.goto.comment').d('晒单评价'),
      },
    },
    2: { modalProps: { title: intl.get('mallf.common.view.goto.addComment').d('追加评论') } },
    3: {
      modalProps: {
        title: intl.get('mallf.common.view.goto.commentView').d('查看评论'),
        okButton: false,
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        cancelProps: { color: 'primary' },
      },
    },
  };
  return assessmentFlagMap[assessmentFlag] || {};
}

// 评价组件
const ProductComment = c7nCustomize({ unitCode })((props) => {
  const { modal, product, successCallback, customizeForm } = props;
  const [loading, setLoading] = useState(true);
  const [commentData, setCommentData] = useState([]);

  const {
    productSource,
    creationDate,
    orderEntryId,
    assessmentFlag,
    consignmentEntryId,
    pointsTypeName,
  } = product;

  const commentDataSet = useMemo(
    () =>
      new DataSet({
        paging: false,
        fields: [
          {
            name: 'score',
            defaultValue: 10,
            label: intl.get('mallf.myOrder.view.productLevel').d('商品评级'),
          },
          {
            name: 'assessmentContent',
            label:
              assessmentFlag === 1
                ? intl.get('mallf.myOrder.view.comment.myCommodity').d('我的评价')
                : intl.get('mallf.myOrder.view.product.comment').d('商品评价'),
            maxLength: 500,
          },
          {
            name: 'assessmentDate',
            label: intl.get('mallf.myOrder.view.commentTime').d('评价时间'),
          },
          {
            name: 'assessmentImageUuid',
            label: intl.get('mallf.myOrder.view.comment.uploadPictures').d('上传图片'),
          },
          {
            name: 'appendContent',
            label: intl.get('mallf.myOrder.view.goto.addComment').d('追加评价'),
            required: assessmentFlag === 2,
            maxLength: 500,
          },
          {
            name: 'appendDate',
            label: intl.get('mallf.myOrder.view.addCommentTime').d('追加评价时间'),
          },
          {
            name: 'appendImageUuid',
            label: intl.get('mallf.myOrder.view.comment.uploadPictures').d('上传图片'),
          },
          {
            name: 'serviceScore',
            defaultValue: 10,
            label: intl.get('mallf.myOrder.view.serviceQuality').d('服务质量'),
          },
          {
            name: 'transportScore',
            defaultValue: 10,
            label: intl.get('mallf.myOrder.view.deliverySpeed').d('配送速度'),
          },
        ],
      }),
    []
  );

  useEffect(() => {
    modal.handleOk(() => handleOk());
    fetchData();
  }, []);

  /**
   * 图片url处理
   * @param {String} code
   * @param {String} url
   */
  function HandleImgUrl(url) {
    return convertImg(url, 1, productSource);
  }

  /**
   * 获取单个子订单的所有商品信息
   * @param {Number} ecPoNum
   */
  async function fetchData() {
    const res = await getOmsProductInfoService(
      { orderEntryId, consignmentEntryId, channel: 'PERSONAL' },
      { customizeUnitCode }
    );
    if (res) {
      const newCommentData = res.map((m) => {
        const commentItem = {
          ...m,
          uomName: m.uomName || '',
          assessmentContent: m.assessmentContent || '',
          assessmentImageUuid: m.assessmentImageUuid || uuidv4(),
          appendImageUuid: m.appendImageUuid || uuidv4(),
        };
        commentDataSet.create(commentItem);
        return commentItem;
      });

      setCommentData(newCommentData);
      setLoading(false);
    }
  }

  // 确认方法
  async function handleOk() {
    const flag = await commentDataSet.validate();
    if (flag) {
      const data = commentDataSet.toJSONData();
      const params = { ...product, ...data[0], channel: 'PERSONAL' };
      try {
        setLoading(true);
        const res = await addOmsOrderCommentService(params, assessmentFlag, {
          customizeUnitCode,
        });
        if (res) {
          successCallback();
          message.success(intl.get('mallf.myOrder.view.comment.publishSuccess').d('评论发表成功'));
          return true;
        }
      } finally {
        setLoading(false);
      }
    }
    return false;
  }

  // 渲染右侧评价详情区域
  function rendererCommentArea(record) {
    const { appendContent, appendFileList, assessmentFileList } = record.get([
      'appendContent',
      'appendFileList',
      'assessmentFileList',
    ]);
    const isFirst = assessmentFlag === 1;
    const isAppend = assessmentFlag === 2;
    const readOnly = assessmentFlag === 3;
    const areas = [
      {
        code: codeMap.base,
        readOnly: isAppend || readOnly,
        fields: [
          {
            name: 'score',
            FormField: RateField,
            formFieldProps: { disabled: isAppend || readOnly },
          },
          {
            name: 'assessmentContent',
            ...getTextAreaField(isAppend || readOnly),
          },
          {
            name: 'assessmentImageUuid',
            FormField: Attachment,
            formFieldProps: getAttachmentProps(isAppend || readOnly),
            show: isFirst || (assessmentFileList && assessmentFileList.length > 0),
          },
          {
            name: 'assessmentDate',
            FormField: Output,
            show: isAppend || readOnly,
          },
        ],
      },
      {
        code: codeMap.append,
        readOnly,
        show: isAppend || (readOnly && !!appendContent),
        fields: [
          {
            name: 'appendContent',
            ...getTextAreaField(readOnly),
          },
          {
            name: 'appendImageUuid',
            FormField: Attachment,
            formFieldProps: getAttachmentProps(readOnly),
            show: isAppend || (appendFileList && appendFileList.length > 0),
          },
          {
            name: 'appendDate',
            FormField: Output,
            show: readOnly,
          },
        ],
      },
      {
        code: codeMap.service,
        readOnly,
        show: !isAppend,
        fields: [
          {
            name: 'serviceScore',
            FormField: RateField,
            formFieldProps: { disabled: readOnly },
          },
          {
            name: 'transportScore',
            FormField: RateField,
            formFieldProps: { disabled: readOnly },
          },
        ],
      },
    ];
    return areas.map((m) => {
      const fields = m.fields.filter((field) => field.show !== false);
      const areaStyle = m.readOnly ? {} : { padding: 20 };
      return (
        <div className="comment-detail-area" r-if={m.show !== false} style={areaStyle}>
          {customizeForm(
            {
              code: m.code,
              readOnly: m.readOnly,
            },
            <Form
              record={record}
              dataSet={commentDataSet}
              useColon={false}
              labelAlign="left"
              labelLayout={m.readOnly ? 'horizontal' : 'float'}
            >
              {fields.map((field) => {
                const { name, FormField, formFieldProps = {} } = field;
                return <FormField name={name} {...formFieldProps} />;
              })}
            </Form>
          )}
        </div>
      );
    });
  }

  return (
    <div className={style['comment-wrapper']}>
      {loading ? (
        <Loading />
      ) : (
        commentData.length > 0 && (
          <div className="comment-container">
            <div className="comment-header">
              <div className="comment-po-num">
                <span>{intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号')}：</span>
                <Tooltip placement="top" title={commentData[0]?.orderCode}>
                  <span>{commentData[0]?.orderCode}</span>
                </Tooltip>
              </div>
              <SupplierComponent>
                <div className="comment-supplier">
                  <span>{intl.get('mallf.myOrder.view.supplier').d('供应商')}：</span>
                  <Tooltip placement="top" title={commentData[0]?.supplierCompanyName}>
                    <span title={commentData[0]?.supplierCompanyName}>
                      {commentData[0]?.supplierCompanyName}
                    </span>
                  </Tooltip>
                </div>
              </SupplierComponent>
              <div className="comment-time">
                <span>{creationDate}</span>
              </div>
            </div>
            <Observer>
              {() => (
                <div className="comment-content">
                  {commentDataSet.map((record) => {
                    const { skuName, primaryUrl } = record.get(['skuName', 'primaryUrl']);
                    return (
                      <div className="comment-item">
                        <div className="comment-sku">
                          <div className="comment-sku-img">
                            <Image
                              width={100}
                              height={100}
                              value={HandleImgUrl(primaryUrl)}
                              alt={intl.get('mallf.myOrder.view.product').d('商品')}
                            />
                          </div>
                          <div className="comment-sku-name">{skuName}</div>
                          <p>
                            {['HYBRID_PAYMENT', 'POINTS_PAYMENT'].includes(
                              product.paymentModel
                            ) && (
                              <span className="product-info-price-sigl">
                                <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
                                {numberRender(product?.pointPrice)}
                                {['HYBRID_PAYMENT'].includes(product.paymentModel) && (
                                  <span style={{ fontSize: 16, margin: '0 5px', fontWeight: 600 }}>
                                    +
                                  </span>
                                )}
                              </span>
                            )}
                            {['HYBRID_PAYMENT', 'CASH_PAYMENT'].includes(product.paymentModel) &&
                              `${product?.currencySymbol || ''}${
                                product?.orderPriceFinalVO?.finalUnitPriceMeaning ||
                                product?.orderPriceFinalVO?.finalUnitPrice ||
                                product?.unitPriceMeaning ||
                                product?.unitPrice
                              }`}
                            {product.uomName && (
                              <span style={{ fontSize: 12 }}>/{product.uomName}</span>
                            )}
                          </p>
                          {pointsTypeName && (
                            <div style={{ color: '#999999' }}>{pointsTypeName}</div>
                          )}
                        </div>
                        <div className="comment-detail">{rendererCommentArea(record)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Observer>
          </div>
        )
      )}
    </div>
  );
});

/**
 * 打开评价弹窗
 * @param {readOnly} 只读｜可编辑
 * @param {product} 评价商品
 */
export default function openComment({ product, successCallback = (e) => e }) {
  const { modalProps = {} } = getModalCharacter(product);
  return Modal.open({
    ...modalProps,
    drawer: true,
    style: { width: 1090 },
    children: <ProductComment product={product} successCallback={successCallback} />,
  });
}
