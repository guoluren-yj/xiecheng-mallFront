import React from 'react';
import intl from 'utils/intl';
import './header.less';

export default function Product(props) {
  console.log('props', props);
  return (
    <div className="hspharm_productList_header">
      <span className="hspharmTable_span" style={{ width: '200px' }}>
        {intl.get('mallf.productList.view.common.CATA.spmc').d('商品名称')}
      </span>
      <span className="hspharmTable_span" style={{ width: '97px' }}>
        {intl.get('mallf.productList.view.common.CATA.description').d('品牌')}
      </span>
      <span className="hspharmTable_span" style={{ width: '110px' }}>
        {intl.get('mallf.productList.view.common.CATA.hh').d('货号')}
      </span>
      <span className="hspharmTable_span" style={{ width: '106px' }}>
        {intl.get('mallf.productList.view.common.CATA.bzgg').d('包装规格')}
      </span>
      <span className="hspharmTable_span" style={{ width: '62px' }}>
        {intl.get('mallf.productList.view.common.CATA.cd').d('纯度')}
      </span>
      <span className="hspharmTable_span" style={{ width: '120px' }}>
        {intl.get('mallf.productList.view.common.CATA.hq').d('货期')}
      </span>
      <span className="hspharmTable_span" style={{ width: '100px' }}>
        {intl.get('mallf.productList.view.common.CATA.kc').d('库存')}
      </span>
      <span className="hspharmTable_span" style={{ width: '145px' }}>
        {intl.get('mallf.productList.view.common.CATA.dj').d('单价(元)')}
      </span>
      <span className="hspharmTable_span" style={{ width: '60px' }}>
        {intl.get('mallf.productList.view.common.CATA.jc').d('加车')}
      </span>
      <span className="hspharmTable_span">
        {intl.get('mallf.productList.view.common.CATA.scdb').d('收藏/对比')}
      </span>
    </div>
  );
}
