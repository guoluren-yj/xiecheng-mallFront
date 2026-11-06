import React, { useEffect } from 'react';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';

import styles from './index.less';

export default function ProductDesc(props) {
  const {
    productData: { skuDetail: introduction = '', attributes: productSkuAttrDTOS = [] },
  } = props;

  function changeIframeHeight() {
    const iframe = document.getElementById('product-detail-desc-iframe');
    if (!iframe) return;
    const iframeWin = iframe?.contentWindow || iframe?.contentDocument?.parentWindow;
    iframe.height =
      (iframeWin?.document?.documentElement?.scrollHeight ||
        iframeWin?.document?.body?.scrollHeight) + 100;
  }

  useEffect(() => {
    changeIframeHeight();
    if (document.getElementById('product-detail-desc-iframe')) {
      setTimeout(changeIframeHeight, 100);
    }
  }, [!!document.getElementById('product-detail-desc-iframe')]);

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
      return (
        <div className="des-row des-row-attr">
          <span span={3} className="des-title">
            {item?.attrName}:{' '}
          </span>
          <span span={21} className="des-content" title={item?.attrValue}>
            {item?.attrValue}
          </span>
        </div>
      );
    });
  }

  return (
    <div className={styles['product-desc-content']}>
      <div className="p-container container">
        <Tabs defaultActiveKey={1} style={{ width: '100%' }}>
          <Tabs.TabPane
            key={1}
            tab={intl.get(`mallf.productDetail.model.productDesc`).d('商品介绍')}
          >
            {introduction === null || introduction === undefined || introduction === '' ? (
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
                  srcDoc={`<style>${'img{max-width: 100%; height:auto; }'}</style>${introduction}`}
                />
              </div>
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
        </Tabs>
      </div>
    </div>
  );
}
