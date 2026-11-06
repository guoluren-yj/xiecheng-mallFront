import React, { useEffect, useState, Fragment } from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';
import formatterCollections from 'utils/intl/formatterCollections';
import * as Hmall from 'utils/utils';
import useProductCardConfig from 'hooks/useProductCardConfig';
import { getCentralizedInfo } from 'services/productDetailService';
import styles from './index.less';
import ProductCard from '@/components/ProductCard';

function ViewHistory() {
  const { userId: strorageName, purchaseType } = Hmall.getUserConfigInfo();
  const [productList, setProductList] = useState([]);
  const [centralizeList, setCentralizeList] = useState([]); // 拼单模板信息
  const productCardConfig = useProductCardConfig();
  useEffect(() => {
    getProductList();
  }, productList);

  /**
   * 获取浏览记录商品
   */
  function getProductList() {
    const list = Hmall.getStorage(`${strorageName}_${purchaseType}_product_histroy`) || {};
    const nowDate = new Date().getTime();
    const productLists = [];
    const products = [];
    for (const key in list) {
      if (
        key &&
        list[key].length > 0 &&
        nowDate - list[key][list[key].length - 1].saveTime < 30 * 24 * 60 * 60 * 1000
      ) {
        productLists.unshift({
          [key]: list[key],
        });
        products.push(...list[key]);
      } else if (list[key].length) {
        delete list[key];
        Hmall.setStorage(`${strorageName}_${purchaseType}_product_histroy`, list);
      }
    }
    setProductList(productLists);
    getSkuCentralizeTemplate(products);
  }

  // 获取拼单
  function getSkuCentralizeTemplate(products) {
    if (products && products.length > 0) {
      const params = products.map((n) => ({
        productId: n.productId,
      }));
      getCentralizedInfo(params).then((res) => {
        if (res) {
          setCentralizeList(res);
        }
      });
    }
  }

  /**
   * 删除某一天浏览记录
   * @param {String} date - 日期
   */
  function deleteDateProduct(date) {
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
      children: intl
        .get('mallf.viewHistory.view.viewHistory.confirmDayRecord')
        .d('确认删除浏览记录？'),
      onOk() {
        const list = Hmall.getStorage(`${strorageName}_${purchaseType}_product_histroy`);
        delete list[date];
        Hmall.setStorage(`${strorageName}_${purchaseType}_product_histroy`, list);
        getProductList();
      },
    });
  }

  /**
   * 删除所有浏览记录
   */
  function deleteAllProduct() {
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
      children: intl
        .get('mallf.myMall.view.viewHistory.confirmAllRecord')
        .d('确认清空所有浏览记录？'),
      onOk() {
        Hmall.setStorage(`${strorageName}_${purchaseType}_product_histroy`, {});
        getProductList();
      },
    });
  }

  /**
   * 加载浏览记录列表
   * @param {String} item - 浏览商品
   */
  function getInfo(item) {
    const date = Object.keys(item)[0];
    const list = item[date] || [];
    return list.map((product) => {
      // 拼单活动
      const { templateName } =
        centralizeList?.find((n) => n.productId === product.productId && !product.receiveFlag) ||
        {};
      const templateTag = templateName ? { tagName: templateName, tagFlag: 1, tagStyle: 2 } : {};
      return (
        <ProductCard
          productCardConfig={[
            {
              elementType: 'SUPPLIER',
              row: 1,
              column: 1,
              enabledFlag: productCardConfig?.find((p) => p.elementType === 'SUPPLIER')
                ?.enabledFlag,
              rowLength: 1,
            },
          ]}
          product={{
            ...product,
            skuName: product.productName,
            sourceFromCode: product.platform,
            sellPrice: product.price,
            supplierCompanyName: product.platformName,
          }}
          {...templateTag}
          wraperClass="product-wrap"
        />
      );
    });
  }

  const nowDate = Hmall.timestampToTime(true);
  return (
    <div
      className={styles['history-container']}
      style={{ minHeight: `${window.innerHeight - 310}px` }}
    >
      <p className="history-container-title">
        <span className="container-title">
          {intl.get('mallf.viewHistory.view.history.viewHistory').d('浏览记录')}
        </span>
        {productList.length > 0 && (
          <Button
            color="primary"
            funcType="flat"
            icon="delete_sweep-o"
            onClick={() => deleteAllProduct()}
            style={{ maxWidth: 126, float: 'right' }}
          >
            {intl.get('mallf.viewHistory.view.history.clearRecord').d('清空记录')}
          </Button>
        )}
      </p>

      {productList.length > 0 ? (
        <div>
          {productList.map((item) => {
            const date = Object.keys(item)[0];
            if (item[date].length === 0) {
              return null;
            }
            return (
              <Fragment>
                <div className="history-content">
                  <div className="history-header">
                    <div className="history-header-time">
                      <span className="history-header-time-today">
                        {date === nowDate
                          ? `${intl.get('mallf.viewHistory.view.history.today').d('今天')}`
                          : ''}
                      </span>
                      {date}
                      <a
                        className="history-header-time-delete"
                        onClick={() => deleteDateProduct(date)}
                      >
                        {intl.get('mallf.viewHistory.button.delete').d('删除')}
                      </a>
                    </div>
                    {/* <Divider className="history-header-divider" /> */}
                  </div>
                  <div className="history-list-info">{getInfo(item)}</div>
                </div>
              </Fragment>
            );
          })}
          <p className="footer-info">
            {intl
              .get('mallf.viewHistory.view.history.atTheEnd')
              .d('已到最后，只保存近一个月的浏览记录')}
          </p>
        </div>
      ) : (
        <div className="empty-product">
          <div className="info">
            {intl.get('mallf.viewHistory.view.history.noHistory').d('暂无浏览记录')}
          </div>
        </div>
      )}
    </div>
  );
}

export default formatterCollections({ code: ['mallf.viewHistory'] })(ViewHistory);
