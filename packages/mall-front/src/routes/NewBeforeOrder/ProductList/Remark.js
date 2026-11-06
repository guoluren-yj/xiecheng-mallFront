import React from 'react';
import { Input, Icon as C7nIcon } from 'choerodon-ui';

import cuxComponent from 'cuxTools/cuxComponent';
import intl from 'utils/intl';

function Remark({
  remarkConfig,
  visible,
  product,
  remark,
  remarkChange,
  setCurrentPrduct,
  currentProduct,
  editRemark,
  productIndex,
}) {
  return (
    <>
      {remarkConfig.visible !== 0 && (
        <p className="goods-remark">
          {remarkConfig.required === 1 && <span className="goods-remark-required">*</span>}
          <span className="goods-remark-label">
            {remarkConfig.fieldName || intl.get('mallf.common.view.remark.info').d('备注信息')}：
          </span>
          <span title={product.remark}>
            {visible ? (
              <Input
                style={{ height: 28 }}
                value={remark}
                onChange={(e) => remarkChange(e)}
                onBlur={() => {
                  setCurrentPrduct({ ...currentProduct, remarkVisible: false });
                  editRemark();
                }}
              />
            ) : product.remark?.length > 10 ? (
              `${product.remark.substring(0, 10)}...`
            ) : (
              product.remark
            )}
          </span>
          {remarkConfig.editable !== 0 && (
            <C7nIcon
              className="detail-info-update"
              type={visible ? '' : 'mode_edit'}
              onClick={() => {
                setCurrentPrduct({ ...product, productIndex, remarkVisible: true });
              }}
            />
          )}
        </p>
      )}
    </>
  );
}

export default cuxComponent({ path: 'NewBeforeOrder/ProductList/Remark' })(Remark);
