import { Modal } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import React from 'react';
import FeedbackModal from '../components/ProductDetail/FeedbackModal';

export default function cuxTabTitle(props) {
  const { product, productData, productId } = props;
  console.log(product, productData, productId, 'productData');
  function openModal() {
    Modal.open({
      destroyOnClose: true,
      okFirst: true,
      // 当状态为
      children: <FeedbackModal product={product} productData={productData} productId={productId} />,
    });
  }

  return (
    <span>
      {/* similarDisplayFlag && isIntelligentComparisonFlag */}
      <Icon
        type="help"
        onClick={() => {
          openModal();
        }}
      />
      {intl.get(`mallf.productDetail.model.sameProduct`).d('同款商品')}
    </span>
  );
}
