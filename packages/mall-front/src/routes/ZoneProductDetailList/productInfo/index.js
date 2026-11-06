import React from 'react';
import { message } from 'choerodon-ui';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';

import defaultImg from '@/assets/images/no-product-img.svg';
import { getCurrentLanguage, getUserConfigInfo, getAttachmentUrl } from 'utils/utils';
import intl from 'utils/intl';

import { fetchAddWishService } from 'services/zoneProductService';
import styles from './index.less';

export default connect(({ global }) => ({
  showMiniCart: global.showMiniCart,
}))(
  withRouter(function ProductInfo(props) {
    const { userId, tenantId } = getUserConfigInfo();
    const { productData, fetchDetailInfo = (e) => e } = props;
    const {
      skuName,
      skuSubtitle,
      skuId,
      // supplierName,
      proposedPrice,
      companyInfosVO = {},
      wishSkuCheck,
      supplierId,
    } = productData;

    function addWish() {
      if (wishSkuCheck) return;
      fetchAddWishService([
        {
          tenantId,
          wisher: userId,
          skuId,
          supplierId,
        },
      ]).then(() => {
        fetchDetailInfo();
        message.success(
          intl.get('mallf.common.view.wish.addSuccess').d('成功加入心愿单'),
          undefined,
          undefined,
          'top'
        );
      });
    }

    return (
      <div className={styles['product-detail-content']}>
        <div className="product-title">
          <div style={{ flex: 1 }}>
            <p className="p-name" title={skuName}>
              {/* <span className="p-name-supplier">{supplierName}</span> */}
              {skuName}
            </p>
            {skuSubtitle && <p className="p-small-name">{skuSubtitle}</p>}
          </div>
        </div>
        <div className="info-content">
          <div className="p-item">
            <span
              title={intl.get('mallf.productDetail.view.line.price').d('参考价格')}
              className={classNames([
                'p-label',
                'text-overflow',
                { 'p-label-width': getCurrentLanguage() === 'zh_CN' },
              ])}
            >
              {intl.get('mallf.productDetail.view.line.price').d('参考价格')}
            </span>
            <span className={classNames(['p-info'])}>
              <div className="p-price">
                {/* <span className="currecy">¥</span> */}
                {proposedPrice}
              </div>
            </span>
          </div>
          {/* <div className="p-item">
            <span
              className={classNames([
                'p-label',
                { 'p-label-width': getCurrentLanguage() === 'zh_CN' },
              ])}
            >
              {intl.get('mallf.productDetail.view.uom').d('单位')}
            </span>
            <span className={classNames(['p-info'])}>个</span>
          </div> */}
        </div>
        <div className="supplier-info">
          <div className="supplier-info-header">
            {intl.get('mallf.productDetail.view.zhenxuan.supplier').d('甄选供应商')}
          </div>
          <div className="supplier-info-content">
            <div className="supplier-info-content-intro">
              <div className="supplier-logo">
                <img
                  src={
                    companyInfosVO?.logoUrl
                      ? getAttachmentUrl(companyInfosVO?.logoUrl, 'private-bucket')
                      : defaultImg
                  }
                  alt=""
                />
              </div>
              <div className="supplier-box">
                <div className="supplier-info-content-title">{companyInfosVO?.companyName}</div>
                <div className="supplier-info-content-line">
                  <div className="supplier-info-content-item" style={{ marginRight: 10 }}>
                    <div
                      className="line-label text-overflow"
                      title={intl.get('mallf.productDetail.view.type.supplier').d('行业类型')}
                    >
                      {intl.get('mallf.productDetail.view.type.supplier').d('行业类型')}
                    </div>
                    ：
                    <div
                      className="line-content text-overflow"
                      title={companyInfosVO?.industryList?.map((p) => p.industryName)?.join('、')}
                    >
                      {companyInfosVO?.industryList?.map((p) => p.industryName)?.join('、')}
                    </div>
                  </div>
                  <div className="supplier-info-content-item">
                    <div
                      className="line-label text-overflow"
                      title={intl.get('mallf.productDetail.view.catalog.supplier').d('主营品类')}
                    >
                      {intl.get('mallf.productDetail.view.catalog.supplier').d('主营品类')}
                    </div>
                    ：
                    <div
                      className="line-content text-overflow"
                      title={companyInfosVO?.industryCategoryList
                        ?.map((p) => p.categoryName)
                        ?.join('、')}
                    >
                      {companyInfosVO?.industryCategoryList?.map((p) => p.categoryName)?.join('、')}
                    </div>
                  </div>
                </div>
                <div className="supplier-info-content-line">
                  <div className="supplier-info-content-item">
                    <div
                      className="line-label text-overflow"
                      title={intl.get('mallf.productDetail.view.website.supplier').d('公司官网')}
                    >
                      {intl.get('mallf.productDetail.view.website.supplier').d('公司官网')}
                    </div>
                    ：
                    <div style={{ maxWidth: 390 }} className="line-content">
                      {companyInfosVO?.website || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="supplier-info-content-desc">
              <div className="desc-title">
                {intl.get('mallf.productDetail.view.desc.supplier').d('公司简介')}
              </div>
              <div className="desc-info">{companyInfosVO?.description || '-'}</div>
            </div>
          </div>
        </div>
        <div className="add-box">
          <div className={classNames(['add-btn', { checked: wishSkuCheck }])} onClick={addWish}>
            {wishSkuCheck
              ? intl.get('mallf.productDetail.view.addwished.list').d('已加入心愿单')
              : intl.get('mallf.common.view.want').d('我想要')}
          </div>
          <div className="add-desc">
            <span className="product-ad">{intl.get('mallf.common.view.ad').d('广告')}</span>
            {intl.get('mallf.productDetail.view.Contact.cooperation').d('请联系供应商合作吧～')}
          </div>
        </div>
      </div>
    );
  })
);
