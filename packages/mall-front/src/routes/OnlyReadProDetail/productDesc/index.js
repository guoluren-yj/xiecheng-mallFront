import React, { useState, useEffect } from 'react';
import { Tabs } from 'choerodon-ui';
// import MiniCart from 'components/page/header/search/MiniCart';
// import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';
import { fetchComments } from 'services/productDetailService';
// import { getCartCountService } from 'services/headerService';
import GoodsComment from './goodsComment';

import styles from './index.less';

// let header;
// let topHeight = 0;

export default function ProductDesc(props) {
  // const { userId } = getUserConfigInfo();
  const {
    productId,
    // cartLoading,
    // stockEnough,
    productData: {
      skuName,
      productImageList = [],
      introduction = '',
      productSkuAttrDTOS = [],
      // packingList,
      // returnDuration = '',
      // changeDuration = '',
      // qualityDuration = '',
      // instruction = '',
      // changeSpecial = 0,
      // afsSpecial = 0,
      // returnSpecial = 0,
    },
  } = props;
  const cssurl = introduction?.match(/cssurl='(\S*)'>/)?.[1];
  const [cssData, setCssData] = useState('');
  useEffect(() => {
    if (cssurl) {
      fetch(`${window.location.protocol}${cssurl}`)
        .then((res) => res.text())
        .then((res) => setCssData(res));
    }
  }, [cssurl]);
  // const [activeDetailPanel, setActiveDetailPanel] = useState(1);
  const [comments, setComments] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [pagination, setPagination] = useState();

  useEffect(() => {
    getComments();
  }, []);

  function getComments(page = { page: 0, size: 21 }) {
    fetchComments(productId, page).then((res) => {
      const { content: commentsData = [], ...paginationData } = res;
      setComments(commentsData);
      setPagination(paginationData);
    });
  }

  function getAttrs() {
    let tmpObj = {};
    productSkuAttrDTOS.forEach((item) => {
      if (item.attrCode) {
        if (tmpObj[item.attrCode]) {
          tmpObj[item.attrCode].push(item.description);
        } else {
          tmpObj = {
            ...tmpObj,
            [item.attrCode]: [item.description],
          };
        }
      } else {
        tmpObj = {
          ...tmpObj,
          [item.attrName]: [item.description],
        };
      }
    });
    return productSkuAttrDTOS.map((item) => {
      let description;
      if (tmpObj[item.attrCode || item.attrName]) {
        description = tmpObj[item.attrCode || item.attrName].join(',');
        delete tmpObj[item.attrCode || item.attrName];
      }
      const { attrName } = item;
      if (description) {
        switch (item.attrCode) {
          case '000000000007': {
            let tmpArray = description ? description.split(',') : [];
            tmpArray = tmpArray.map((tmp) => `${tmp}mm`);
            return (
              <div className="des-row des-row-attr">
                <span span={3} className="des-title">
                  {attrName}:{' '}
                </span>
                <span span={21} className="des-content" title={tmpArray.join('*')}>
                  {tmpArray.join('*')}
                </span>
              </div>
            );
          }
          case '000000000006': {
            return (
              <div className="des-row des-row-attr">
                <span span={3} className="des-title">
                  {attrName}:{' '}
                </span>
                <span span={21} className="des-content" title={description.replace(',', '')}>
                  {description.replace(',', '')}
                </span>
              </div>
            );
          }
          default:
            return (
              <div className="des-row des-row-attr">
                <span span={3} className="des-title">
                  {attrName}:{' '}
                </span>
                <span span={21} className="des-content" title={description}>
                  {description}
                </span>
              </div>
            );
        }
      } else {
        return null;
      }
    });
  }

  return (
    <div className={styles['product-desc-content']}>
      <div className="p-container container">
        <Tabs defaultActiveKey={1}>
          <Tabs.TabPane
            key={1}
            tab={intl.get(`mallf.productDetail.model.productDesc`).d('商品介绍')}
          >
            {introduction === null || introduction === undefined || introduction === '' ? (
              <div className="no-params">
                <p>{intl.get(`mallf.productDetail.view.noData`).d('暂无数据')}</p>
              </div>
            ) : (
              <>
                <div
                  style={{ minHeight: 360, overflow: 'hidden', textAlign: 'center' }}
                  dangerouslySetInnerHTML={{
                    __html: cssurl ? `<style>${cssData}</style><br>${introduction}` : introduction,
                  }}
                />
              </>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane
            key={2}
            tab={intl.get(`mallf.productDetail.model.specifications`).d('规格参数')}
          >
            {productSkuAttrDTOS?.length > 0 ? (
              <div style={{ minHeight: 360, padding: '0 15px' }} className="parameters-box">
                {getAttrs()}
              </div>
            ) : (
              <div className="no-params">
                <p>{intl.get(`mallf.productDetail.view.noData`).d('暂无数据')}</p>
              </div>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane
            key={3}
            tab={intl.get(`mallf.productDetail.model.productComment`).d('商品评价')}
          >
            {comments.length > 0 ? (
              <GoodsComment
                skuName={skuName}
                productImage={productImageList?.length > 0 && productImageList[0]}
                comments={comments}
                pagination={pagination}
                fetchComments={getComments}
              />
            ) : (
              <div className="no-params">
                <p>{intl.get(`mallf.productDetail.view.noData`).d('暂无数据')}</p>
              </div>
            )}
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
}
