import React, { useState, useEffect } from 'react';
import { Button, Checkbox, Tabs } from 'hzero-ui';
import { withRouter, Link } from 'react-router-dom';

import Image from 'components/Image';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import * as Hmall from 'utils/utils';
import styles from './index.less';

// const TabPane = Tabs.TabPane;

function PriceCompare(props) {
  const symbol = '';
  const { updatePriceCompareList } = props;
  const { userId } = Hmall.getUserConfigInfo();
  const productArray = Hmall.getStorage(`${userId}_price_compare`).data || [];
  const [left, setLeft] = useState(0);
  function priceCompareItem() {
    return productArray.map((item) => (
      <div className="priceCompare-item">
        <Link to={`/product-detail?productId=${item.productId}&sourceFrom=${item.sourceFrom}`}>
          <div className="priceCompare-image">
            <Image value={item.imagePath} width={80} height={80} />
          </div>
          <div className="priceCompare-detail">
            <div className="priceCompare-name" style={{ color: '#333' }}>
              {item.productName}
            </div>
            <div className="priceCompare-price">
              {symbol}
              {Hmall.numberRender(item.price)}
              <span
                style={{ float: 'right', marginRight: '14px', color: '#999', fontSize: '12px' }}
                onClick={(e) => {
                  updatePriceCompareList('delete', item);
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {intl.get('mallf.common.button.delete').d('删除')}
              </span>
            </div>
          </div>
        </Link>
        <Checkbox />
      </div>
    ));
  }
  function setDefaultCompareItem() {
    const defaultCompareList = [];
    for (let i = 0; i < 4 - productArray.length; i++) {
      defaultCompareList.push(
        <div className="priceCompare-item" style={{ display: 'flex' }}>
          <div className="priceCompare-image" style={{ lineHeight: '80px' }}>
            {i + productArray.length + 1}
          </div>
          <div className="priceCompare-detail">
            <div className="priceCompare-name">
              {intl
                .get('mallf.productDetail.view.compare.addProduct')
                .d('您还可以继续添加商品来对比')}
            </div>
            <div className="priceCompare-price" />
          </div>
        </div>
      );
    }
    return defaultCompareList;
  }

  useEffect(() => {
    if (productArray.length === 4) setLeft(0);
  }, [productArray.length]);

  function onChange(flag) {
    if (flag) {
      const arr = Hmall.getStorage(`${userId}_price_compare`).data || [];
      const ll = (arr.length - 4) * 265;
      if (Math.abs(left) < ll) setLeft(left - 265);
    } else if (!flag && left < 0) {
      setLeft(left + 265);
    }
  }
  return (
    <div id="priceCompare-content" className={styles['priceCompare-content']}>
      {/* {warning && (
        <div className="priceCompare-warning">
          对比栏已满，您可以删除不需要的栏内商品再继续添加哦！
        </div>
      )} */}
      <Tabs type="card">
        <Tabs.TabPane tab="Tab Title 1" key="1">
          <div className="priceCompare-items">
            <div className="product-content">
              <div
                style={{
                  maxWidth: '1060px',
                  position: 'relative',
                  left: `${left}px`,
                  transition: 'left 0.3s',
                  whiteSpace: 'nowrap',
                }}
              >
                {priceCompareItem()}
              </div>
              <div
                className={`product-prev product-change ${left !== 0 ? 'change-btn' : ''} `}
                style={{
                  display: productArray.length <= 4 ? 'none' : '',
                }}
                onClick={() => onChange(false)}
              >
                <Icons type="left" />
              </div>
              <div
                className={`product-next product-change ${
                  Math.abs(left) < (productArray.length - 4) * 265 ? 'change-btn' : ''
                }`}
                onClick={() => onChange(true)}
                style={{
                  display: productArray.length <= 4 ? 'none' : '',
                }}
              >
                <Icons type="right" />
              </div>
            </div>
            {setDefaultCompareItem()}
            <div className="priceCompare-item-btns">
              <Button
                onClick={() => Hmall.openPage('/products-compare')}
                disabled={productArray.length < 2}
                className={productArray.length > 1 ? 'to-compare' : ''}
              >
                {intl.get('mallf.common.model.btn.compare').d('对比')}
              </Button>
              <div onClick={() => updatePriceCompareList('deleteAll')}>
                {intl.get('mallf.productDetail.model.clearCompare').d('清空对比栏')}
              </div>
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Tab Title 2" key="2"></Tabs.TabPane>
      </Tabs>
      {/* <div className="priceCompare-title">
        <span style={{marginRight: '15px'}}>商品比价</span>
        <span>比价单</span>
        <span
          style={{ float: 'right', cursor: 'pointer', color: '#666' }}
          onClick={() => {
            Hmall.setStorage('priceCompareVisible', false);
            updatePriceCompareList('close');
          }}
        >
          隐藏
        </span>
      </div> */}
    </div>
  );
}

export default withRouter(PriceCompare);
