import React, { useRef, useState, Fragment } from 'react';
import { Row, Col } from 'hzero-ui';
import { Tooltip, Rate, Icon } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import * as Hmall from 'utils/utils';
import HmallConfig from 'utils/api-config';
import Link from 'components/Link';
import Image from 'components/Image';
import Loading from 'components/loading';
import SearchBar from 'components/SearchBar';
import Pagination from 'components/Pagination';
import ExportExcel from 'components/ExportExcel';
import { fetchAllComments } from 'services/favoriteCommentService';
import openComment from '@/routes/MyMall/OMSOrder/common/OmsCommentModal/openComment';
import { SupplierComponent } from 'utils/renderer';
import styles from './index.less';
import ImageList from './ImageList';

function MyComments() {
  const { userId, organizationId } = Hmall.getUserConfigInfo();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [queryData, setQueryData] = useState({
    page: 0,
    size: 10,
    ownerId: userId,
    purchaseType: Hmall.getUserConfigInfo().purchaseType?.toUpperCase(),
  });
  const [haveSkuTypeFlag, setHaveSkuTypeFlag] = useState(true);
  const customizeUnitCode = 'MALL.COMMENTS.LIST.SEARCH_BAR_MEMBER';
  const searchBarRef = useRef();

  /**
   * 查询我的所有评价
   * @param {Object} params - 查询条件
   */
  function queryAllComments(params = {}) {
    const queryParams = {
      isOMS: true,
      customizeUnitCode,
      ...(Hmall.filterNullValueObject(searchBarRef.current?.getQueryParameter()) || {}),
      ...params,
      size: params.size || 10,
    };
    setHaveSkuTypeFlag(true);
    // 判断是否存在商品来源
    if (!queryParams.skuType) {
      setHaveSkuTypeFlag(false);
      return false;
    }
    setQueryData(queryParams);
    setLoading(true);
    fetchAllComments({ ...queryParams, channel: 'PERSONAL' })
      .then((res) => {
        const { content: comment = [], ...paging } = res;
        setComments(comment);
        setPagination(paging);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  /**
   * 加载评价列表
   */
  function renderAllComments() {
    return comments.map((item) => {
      const {
        skuId: productId,
        assessmentImageUuid: imageUuid,
        assessmentContent: remark,
        cecFromCode: ecPlatform,
        skuImage: ecImagePath,
        skuName: productName,
        assessmentDate: assessTime,
        score,
        unitPrice: ecAgreementPrice,
        unitPriceMeaning,
        assessmentFileList: imageDTO,
        supplierCompanyName,
        orderCode: poNum,
        paymentModel,
        pointPrice,
        currencySymbol,
      } = item;
      const imagePath = Hmall.convertImg(ecImagePath, 1, ecPlatform);
      return (
        <div className="my-table-line">
          <Link to={`/sigl/product-detail?productId=${productId}&sourceFrom=${ecPlatform}`}>
            <Image value={imagePath} width={64} height={64} />
          </Link>
          <div>
            <Link to={`/sigl/product-detail?productId=${productId}&sourceFrom=${ecPlatform}`}>
              <div className="product-name" title={productName}>
                <span style={{ verticalAlign: 'top' }}>{productName}</span>
              </div>
            </Link>
            <div>
              <SupplierComponent>
                {supplierCompanyName && (
                  <Tooltip
                    title={`${intl
                      .get('mallf.common.view.supplier')
                      .d('供应商')}：${supplierCompanyName}`}
                    placement="top"
                  >
                    <span className="source-from text-overflow">{supplierCompanyName}</span>
                  </Tooltip>
                )}
              </SupplierComponent>
              {poNum && (
                <Tooltip title={poNum} placement="top">
                  <span className="source-from text-overflow po-num">{poNum}</span>
                </Tooltip>
              )}
            </div>
            <div className="product-price">
              {paymentModel === 'POINTS_PAYMENT' && (
                <Icon style={{ fontSize: 12, marginTop: -3 }} type="donut_small" />
              )}
              {paymentModel === 'POINTS_PAYMENT'
                ? pointPrice
                : `${currencySymbol || ''}${unitPriceMeaning || ecAgreementPrice}`}
              {item.uomName ? `/${item.uomName}` : ''}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="comment-first">
              <span className="assess-time">
                <p className="avgScore">
                  <Rate
                    className="rate-list"
                    disabled
                    allowHalf
                    defaultValue={Math.round(score) / 2}
                  />
                  <span className="assessTime">{assessTime}</span>
                </p>
                <Tooltip title={remark?.length <= 55 ? '' : remark} placement="top">
                  <p className="remark">{remark}</p>
                </Tooltip>
              </span>
              <ImageList productAssessmentId={imageUuid} imageDTO={imageDTO} />
              <Button
                funcType="link"
                color="primary"
                onClick={() => {
                  openComment({
                    product: { ...item, assessmentFlag: 3, waitAssessFlag: 3, poNum },
                  });
                }}
                style={{
                  position: 'relative',
                  top: -10,
                }}
              >
                {intl.get('hzero.common.button.details').d('查看详情')}
              </Button>
            </div>
          </div>
        </div>
      );
    });
  }

  return (
    <div className={styles['my-comments-container']}>
      <div className="my-comments-header">
        <Row>
          <Col span={12} style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '32px' }}>
            {intl.get('mallf.common.view.myComments').d('我的评价')}
          </Col>
        </Row>
        <div>
          <SearchBar
            searchBarRef={(ref) => {
              searchBarRef.current = ref;
            }}
            handleSearch={({ params }) =>
              queryAllComments({
                page: 0,
                ...params,
              })
            }
            searchCode={customizeUnitCode}
            headerOther={
              <ExportExcel
                requestUrl={`/${HmallConfig.productService}/v1/${organizationId}/assessments/assessment-list-export`}
                buttonText={intl.get('mallf.common.view.commentExport').d('导出评论')}
                queryParams={{
                  skuName: queryData.skuName,
                  time: queryData.time,
                  skuType: queryData.skuType,
                  queryFlag: 0,
                  channel: 'PERSONAL',
                }}
                pagination={pagination}
              />
            }
          />
          <div r-if={!haveSkuTypeFlag} className="my-comments-header-tip">
            {intl.get('mallf.myComments.view.comments.selectSkuType').d('请选择商品来源')}
          </div>
        </div>
      </div>
      <div className="comments-list-info">
        {loading ? (
          <Loading />
        ) : comments.length > 0 ? (
          <Fragment>
            <div className="my-comments-table">
              <ul className="my-table-header">
                <li>{intl.get('mallf.myMall.view.comments.productDetail').d('商品详情')}</li>
                <li>{intl.get('mallf.myMall.view.order.productReview').d('商品评价')}</li>
                <li>{intl.get('mallf.common.view.picturePreview').d('图片预览')}</li>
                <li>{intl.get('hzero.common.action').d('操作')}</li>
              </ul>
              {renderAllComments()}
            </div>
            <Pagination
              style={{ width: '100%', marginTop: 24 }}
              zeroStart
              showSizeChanger
              showQuickJumper
              {...pagination}
              onForward={queryAllComments}
            />
          </Fragment>
        ) : (
          <div className="empty-product">
            <div className="info">
              {intl.get('mallf.myMall.view.comments.noComments').d('暂无评价')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default formatterCollections({
  code: ['mallf.myComments', 'mallf.myOrder', 'mallf.addOrderComment'],
})(MyComments);
