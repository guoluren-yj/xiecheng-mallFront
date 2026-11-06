import React, { useState, useMemo } from 'react';
import { Tooltip } from 'choerodon-ui';
// import { Menu } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import AllocationModal from './AllocationModal';
import styles from './index.less';

function ProductAllocation(props) {
  const { products = [], fetchProduct } = props;
  const [visible, setVisible] = useState(false);
  const sameTemplateFlag = useMemo(() => {
    const list = new Set(
      products.map((n) => {
        if (n.receiveFlag === 1) {
          // 领用商品相同协议和模板
          return `${n.saleAgreementId}${n.templateId}`;
        } else if (n.punchoutFlag === 1) {
          // punchout商品相同报价单
          return n.qtHeaderNo;
        }
        return n.templateId;
      })
    );
    return Array.from(list).length === 1;
  }, [products]);

  // 是否有punchout商品
  const hasPunchoutFlag = products.some((n) => n.punchoutFlag);

  const allocationModalProps = {
    visible,
    setVisible,
    products,
    fetchProduct,
    dimensTemplates: products?.[0]?.dimensionTemplateDTO,
  };

  return (
    <>
      <div className={styles['allocation-item']}>
        {isEmpty(products) || !sameTemplateFlag ? (
          <Tooltip
            title={
              !isEmpty(products) &&
              (hasPunchoutFlag
                ? intl
                    .get('mallf.cart.view.batchAllocation.noBatchPunchout')
                    .d('批量punchout只能选择相同报价单的商品')
                : products?.[0]?.receiveFlag === 1
                ? intl
                    .get('mallf.cart.view.batchFenpei.receiveWarning')
                    .d('批量领用只能选择相同模板和库房的商品')
                : intl.get('mallf.cart.view.batchFenpei.warning').d('批量只能选择相同模板的商品'))
            }
          >
            <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              {intl.get('mallf.common.view.batchAllocation').d('批量分配')}
            </span>
          </Tooltip>
        ) : (
          <a
            onClick={() => {
              setVisible(true);
            }}
            className="primary-color"
          >
            {intl.get('mallf.common.view.batchAllocation').d('批量分配')}
          </a>
        )}
      </div>
      {visible && <AllocationModal {...allocationModalProps} />}
    </>
  );
}

function BatchAllocationButton({ getCheckedProduct, fetchProduct }) {
  const BatchProductAllocationRender = useMemo(() => {
    return (
      // <Menu>
      //   <Menu.Item>
      <ProductAllocation
        products={getCheckedProduct.filter((n) => !!n.invalidFlag)}
        fetchProduct={fetchProduct}
      />
      //   </Menu.Item>
      // </Menu>
    );
  }, [getCheckedProduct.length]);
  return BatchProductAllocationRender;
}

export default BatchAllocationButton;
