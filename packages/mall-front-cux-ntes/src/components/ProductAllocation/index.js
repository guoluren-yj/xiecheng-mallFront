import React from 'react';
// import intl from 'utils/intl';
import ProductAllocationButton from 'mall-front/lib/routes/CartProCopy/ProductAllocation';
import myStyle from './index.less';

function ProductAllocation(props) {
  const { product = {} } = props || {};
  const title = (
    <div className={myStyle['title-wrapper']} title={props.title}>
      {props.title || product.productName}
      {/* <p r-title>
        {intl
          .get('mallf.common.view.notSupportedForOverseasTip.title')
          .d(
            '海外采购暂不支持手工添加采购申请，请在采购商城挑选需要采购的商品，若采购商城未找到您需要商品可在商务采购部popo服务号（CPC-official）进行反馈。'
          )}
      </p> */}
    </div>
  );
  const newProps = { ...props, title };
  return <ProductAllocationButton {...newProps} />;
}

export default ProductAllocation;
