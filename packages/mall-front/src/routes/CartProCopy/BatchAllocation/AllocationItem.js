/* eslint-disable no-param-reassign */
import React, { useMemo, useCallback } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';
import {
  getHeaderDisplayDimension,
  getLineDisplayDimension,
  getHeaderEnabledDimension,
} from '../ProductAllocation/func';
import ProductListModal from './ProductListModal';
import { headerFormRender, lineTableRender } from './componentRender';

function AllocationItem(props) {
  const { dimensionList, index, alloctionDs, headerDs, products = [] } = props;
  const { templateId } = products?.[0] || {};
  const [headerDisplayDimension, lineDisplayDimension] = useMemo(() => {
    const header = getHeaderDisplayDimension(dimensionList).filter(
      (n) => +n.dimension.batchFlag === 1 || isNil(n.dimension.batchFlag)
    );
    const line = getLineDisplayDimension(dimensionList).filter(
      (n) => +n.dimension.batchFlag === 1 || isNil(n.dimension.batchFlag)
    );
    return [header, line];
  }, [dimensionList]);

  const headerEnabledDimension = getHeaderEnabledDimension(dimensionList);

  const openProductListModal = useCallback(() => {
    alloctionDs.setState('addProductRecord', headerDs);
    Modal.open({
      key: 'productList',
      drawer: true,
      title: intl.get('mallf.common.view.productList.title').d('选择商品'),
      children: <ProductListModal templateId={templateId} alloctionDs={alloctionDs} />,
      style: { width: 380 },
    });
  }, [headerDs, alloctionDs, templateId]);

  const allocationItemRender = useMemo(
    () => (
      <>
        <Observer>
          {() => (
            <>
              <div className="item-title">
                <div className="item-title-left">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </div>
                <div className="item-title-right">
                  <Button
                    r-if={alloctionDs.length > 1}
                    icon="delete"
                    funcType="flat"
                    color="primary"
                    onClick={() => alloctionDs.deleteAlloction(headerDs)}
                  >
                    {intl.get('hzero.common.btn.delete').d('删除')}
                  </Button>
                  <Button
                    r-if={!alloctionDs.hasManulFlag && !alloctionDs.isSharedOrderFlag}
                    icon="baseline-file_copy"
                    funcType="flat"
                    color="primary"
                    onClick={() => alloctionDs.copyAllocation(headerDs)}
                  >
                    {intl.get('mallf.common.view.copy').d('复制')}
                  </Button>
                </div>
              </div>
              <div className="item-header">
                {headerFormRender({ headerDisplayDimension, headerEnabledDimension, headerDs })}
              </div>
              <div className="item-line">
                {lineTableRender({
                  lineDisplayDimension,
                  headerDs,
                  alloctionDs,
                  openProductListModal,
                })}
              </div>
            </>
          )}
        </Observer>
      </>
    ),
    [
      index,
      alloctionDs,
      headerDs,
      headerDisplayDimension,
      lineDisplayDimension,
      openProductListModal,
    ]
  );

  return (
    <div id={index} className="aollocation-item">
      {allocationItemRender}
    </div>
  );
}

export default AllocationItem;
