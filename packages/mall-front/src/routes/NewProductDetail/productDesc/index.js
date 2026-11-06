import React, { useState, useEffect, useMemo } from 'react';
import { Tabs } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { fetchComments } from 'services/productDetailService';
import CuxFn from '@/cuxTools/cuxFn';
import { getUserConfigInfo } from 'utils/utils';
import PageFixed from 'components/PageFixed';
import { myComments } from 'components/Permission/permissionCode';
import { PermissionWrapper } from 'components/Permission';
import { connect } from 'dva';
import GoodsComment from './goodsComment';
import BookDetail from './BookDetail';
import styles from './index.less';

function ProductDesc(props) {
  const {
    productId,
    productData: {
      skuName,
      introduction = '',
      productSkuAttrDTOS = [],
      receiveFlag,
      classifyCode,
      bookAttrList,
      bookDetailList,
    },
    permissionRef,
    allPermissions = new Map(),
  } = props;
  const { hideMenuList } = getUserConfigInfo();
  const cssurl = introduction?.match(/cssurl='(\S*)'>/)?.[1];
  const [cssData, setCssData] = useState('');
  const [tabKey, setTabKey] = useState('introductions');
  const iframeDom = document.getElementById('product-detail-desc-iframe');
  useEffect(() => {
    if (cssurl) {
      fetch(`${window.location.protocol}${cssurl}`)
        .then((res) => res.text())
        .then((res) => setCssData(res));
    }
  }, [cssurl]);

  function changeIframeHeight() {
    if (!iframeDom) return;
    const iframeWin = iframeDom?.contentWindow || iframeDom?.contentDocument?.parentWindow;
    iframeDom.height =
      (iframeWin?.document?.documentElement?.scrollHeight ||
        iframeWin?.document?.body?.scrollHeight) + 100;
  }

  useEffect(() => {
    if (iframeDom) {
      // 初始化给个第一屏高度
      changeIframeHeight();
      // 等iframe加载完成后再重新设置高度
      iframeDom.onload = () => {
        changeIframeHeight();
      };
    }
  }, [!!iframeDom]);

  // const [activeDetailPanel, setActiveDetailPanel] = useState(1);
  const [comments, setComments] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [pagination, setPagination] = useState();

  const isOMS = true;

  useEffect(() => {
    if (isOMS !== undefined) getComments();
  }, [isOMS]);

  function getComments(page = { page: 0, size: 21 }) {
    fetchComments(
      { [isOMS ? 'skuId' : 'productId']: productId, channel: 'ENTERPRISE' },
      page,
      isOMS
    ).then((res) => {
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
    const newSkuAttrDTOS = CuxFn({
      name: 'productDesc-fn-productSkuAttrDTOS',
      value: {
        productSkuAttrDTOS,
      },
    })(() => productSkuAttrDTOS)();
    return newSkuAttrDTOS.map((item) => {
      let description;
      if (tmpObj[item.attrCode || item.attrName]) {
        description = tmpObj[item.attrCode || item.attrName].join(',');
        delete tmpObj[item.attrCode || item.attrName];
      }
      const { attrName } = item;
      const cuxClassName = CuxFn({
        name: 'productDesc-fn-className',
        value: {
          item,
        },
      })(() => '')();
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
              <div className={`des-row des-row-attr ${cuxClassName}`}>
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

  const tabs = useMemo(() => {
    // 图书类展示
    const isShowBook =
      classifyCode === 'BOOK' && (!isEmpty(bookAttrList) || !isEmpty(bookDetailList));
    return [
      {
        tabKey: 'introductions',
        tabTitle: intl.get(`mallf.productDetail.model.productDesc`).d('商品介绍'),
        tabContent: isShowBook ? (
          <BookDetail bookAttrList={bookAttrList} bookDetailList={bookDetailList} />
        ) : introduction === null || introduction === undefined || introduction === '' ? (
          <div className="no-params">
            <p>{intl.get(`mallf.productDetail.view.noData`).d('暂无数据')}</p>
          </div>
        ) : (
          <div className="product-detail-desc">
            <iframe
              title="product-detail-desc"
              id="product-detail-desc-iframe"
              name="product-detail-desc-iframe"
              frameBorder="none"
              width="100%"
              style={{ border: 'none' }}
              srcDoc={`<style>${
                cssData || 'img{max-width: 100%; height:auto; }'
              }</style>${introduction}`}
            />
          </div>
        ),
      },
      {
        tabKey: 'specs',
        tabTitle: intl.get(`mallf.productDetail.model.specifications`).d('规格参数'),
        tabContent:
          productSkuAttrDTOS?.length > 0 ? (
            <div style={{ minHeight: 360, padding: '0 15px' }} className="parameters-box">
              {getAttrs()}
            </div>
          ) : (
            <div className="no-params">
              <p>{intl.get(`mallf.productDetail.view.noData`).d('暂无数据')}</p>
            </div>
          ),
      },
      {
        tabKey: 'comments',
        tabTitle: intl.get(`mallf.productDetail.model.productComment`).d('商品评价'),
        hidden:
          !(receiveFlag !== 1 && hideMenuList && !hideMenuList.includes('MY_EVALUATION')) ||
          allPermissions.get(myComments.code) !== 1,
        tabContent:
          comments?.length > 0 ? (
            <GoodsComment
              isOMS={isOMS}
              skuName={skuName}
              // productImage={productImageList.length > 0 && productImageList[0]}
              comments={comments}
              pagination={pagination}
              fetchComments={getComments}
            />
          ) : (
            <div className="no-params">
              <p>{intl.get(`mallf.productDetail.view.noData`).d('暂无数据')}</p>
            </div>
          ),
      },
    ].filter((f) => !f.hidden);
  }, [
    classifyCode,
    bookAttrList,
    bookDetailList,
    introduction,
    cssData,
    productSkuAttrDTOS,
    receiveFlag,
    hideMenuList,
    comments,
    isOMS,
    skuName,
    pagination,
    getComments,
    allPermissions,
    permissionRef,
  ]);

  const tabsProps = {
    activeKey: tabKey,
    onChange: (k) => setTabKey(k),
    style: { width: '100%' },
  };

  return (
    <div className={styles['product-desc-content']}>
      <div className="p-container container" id="product-detail-tabs">
        <Tabs {...tabsProps}>
          {tabs.map((m) => (
            <Tabs.TabPane key={m.tabKey} tab={m.tabTitle}>
              {m.tabContent}
            </Tabs.TabPane>
          ))}
        </Tabs>
        <PermissionWrapper permissionList={[myComments]}>
          <span style={{ display: 'none' }} />
        </PermissionWrapper>
      </div>
      <PageFixed
        fixId="product-detail-tabs"
        fixTop={81}
        zIndex={999}
        bgColor="#fff"
        style={{ width: 1192 }}
      >
        <Tabs {...tabsProps} className="product-detail-tabs-fixed">
          {tabs.map((m) => (
            <Tabs.TabPane key={m.tabKey} tab={m.tabTitle} />
          ))}
        </Tabs>
      </PageFixed>
    </div>
  );
}

export default connect(({ global }) => ({
  allPermissions: global.allPermissions,
  permissionRef: global.permissionRef,
}))(ProductDesc);
