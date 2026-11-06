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
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import uuidv4 from 'uuid/v4';
import { Observer } from 'mobx-react-lite';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getUserConfigInfo, convertImg } from 'utils/utils';
import { SupplierComponent, SpanTitle } from 'utils/renderer';
import Image from 'components/Image';
import Loading from 'components/loading';
import { getOmsProductInfoService } from 'services/addOrderCommentService';
import style from 'mall-front/lib/routes/MyMall/OMSOrder/common/OmsCommentModal/comment.less';
import classNames from 'classnames';
import SwalAlert from 'components/swal';
import styles from './comments.less';

import { addOmsOrderBatchCommentService } from '../services/index.js';

// 个性化单元编码
const codeMap = {
  base: '', // 二开评级不读个性化，多表单fx联动存在问题
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
      className="comment-rate-output"
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

// 评价组件
const ProductComment = c7nCustomize({ unitCode })((props) => {
  const { modal, order, successCallback, customizeForm } = props;
  const { companyId } = getUserConfigInfo();
  const [loading, setLoading] = useState(true);
  const [commentData, setCommentData] = useState([]);
  const assessmentFlag = 1;
  const { cecFromCode: productSource, creationDate } = order;

  const commentDataSet = useMemo(
    () =>
      new DataSet({
        paging: false,
        fields: [
          {
            name: 'score',
            label: intl.get('mallf.myOrder.view.productLevel').d('商品评级'),
            type: 'number',
            required: true,
            min: 1,
          },
          {
            name: 'assessmentContent',
            label: intl.get('mallf.myOrder.view.comment.myCommodity').d('我的评价'),
            maxLength: 500,
            dynamicProps: {
              required: ({ record }) => record.get('score') < 6, // 评分小于6分时，必填
            },
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
            label: intl.get('mallf.myOrder.view.serviceQuality').d('服务质量'),
          },
          {
            name: 'transportScore',
            label: intl.get('mallf.myOrder.view.deliverySpeed').d('配送速度'),
          },
        ],
      }),
    []
  );

  const serviceDataSet = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'serviceScore',
            label: intl.get('mallf.myOrder.view.serviceQuality').d('服务质量'),
            type: 'number',
            required: true,
            min: 1,
          },
          {
            name: 'transportScore',
            label: intl.get('mallf.myOrder.view.deliverySpeed').d('配送速度'),
            type: 'number',
            required: true,
            min: 1,
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
   * 获取子订单的所有商品信息
   * @param {Number} ecPoNum
   */
  async function fetchData() {
    const res = await getOmsProductInfoService(
      { orderEntryIds: order.map((p) => p.orderEntryId), companyId },
      { customizeUnitCode }
    );
    if (res) {
      const newCommentData = res.map((m) => {
        const commentItem = {
          ...(order.find((o) => o.orderEntryId === m.orderEntryId) || {}),
          ...m,
          uomName: m.uomName || '',
          assessmentContent: m.assessmentContent || '',
          assessmentImageUuid: m.assessmentImageUuid || uuidv4(),
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
    const serviceFlag = await serviceDataSet?.current?.validate(); // 先校验提示头
    if (!serviceFlag) {
      return false;
    }
    if (commentDataSet.some((r) => r.dirty)) {
      let flag = true;
      for await (const r of commentDataSet.records || []) {
        // 必须维护一条 提交的需要校验
        if (r.dirty && !(await r.validate())) {
          flag = false;
          break;
        }
      }
      if (flag) {
        const serviceData = serviceDataSet.current?.toData() || {};
        const data = commentDataSet.reduce((pre, r) => {
          if (r.dirty) {
            return [
              ...pre,
              {
                ...r.toData(),
                ...serviceData, // 合并服务评价到商品上
              },
            ];
          }
          return pre;
        }, []);
        try {
          setLoading(true);
          const res = await addOmsOrderBatchCommentService(data, 1, {
            customizeUnitCode,
          });
          if (res) {
            successCallback();
            message.success(
              intl.get('mallf.myOrder.view.comment.publishSuccess').d('评论发表成功')
            );
            return true;
          }
        } finally {
          setLoading(false);
        }
      }
    } else {
      SwalAlert('请至少填写一个商品的评价');
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

  function rendererServiceArea() {
    const fields = [
      {
        name: 'serviceScore',
        FormField: RateField,
      },
      {
        name: 'transportScore',
        FormField: RateField,
      },
    ];
    return (
      <div className="comment-detail-area" style={{ padding: 20 }}>
        {customizeForm(
          {
            code: codeMap.service,
          },
          <Form dataSet={serviceDataSet} useColon={false} labelAlign="left" labelLayout="float">
            {fields.map((field) => {
              const { name, FormField, formFieldProps = {} } = field;
              return <FormField name={name} {...formFieldProps} />;
            })}
          </Form>
        )}
      </div>
    );
  }

  return (
    <div className={classNames(style['comment-wrapper'], styles['comments-wrapper'])}>
      {loading ? (
        <Loading />
      ) : (
        commentData.length > 0 && (
          <>
            <Alert
              message="请至少填写一个商品的评价"
              type="warning"
              iconType="error"
              banner
              showIcon
              closable
              className="comment-alert"
            />
            <div className="comment-scroll">
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
                      <div className="comment-item">
                        <div className="comment-sku">物流服务评价</div>
                        <div className="comment-detail">{rendererServiceArea()}</div>
                      </div>
                      {commentDataSet.map((record) => {
                        const {
                          skuName,
                          uomName,
                          unitPrice,
                          primaryUrl,
                          currencySymbol,
                          unitPriceMeaning,
                          per,
                        } = record.get([
                          'skuName',
                          'uomName',
                          'unitPrice',
                          'primaryUrl',
                          'currencySymbol',
                          'unitPriceMeaning',
                          'per',
                        ]);
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
                              <p className="price-color text-overflow">
                                <SpanTitle>
                                  {currencySymbol || ''}
                                  {unitPriceMeaning || unitPrice}
                                  {uomName ? `/${per > 1 ? per : ''}${uomName}` : ''}
                                </SpanTitle>
                              </p>
                            </div>
                            <div className="comment-detail">{rendererCommentArea(record)}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Observer>
              </div>
            </div>
          </>
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
export default function openComment({ order, successCallback = (e) => e }) {
  return Modal.open({
    title: '合并评价',
    drawer: true,
    style: { width: 1090 },
    bodyStyle: { padding: 0 },
    children: <ProductComment order={order} successCallback={successCallback} />,
  });
}
