import React, { useMemo } from 'react';
import { Tooltip, Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import CuxFn from '@/cuxTools/cuxFn';
import intl from 'utils/intl';
import BatchAllocationModal from './BatchAllocationModal';

function BatchAllocation(props) {
  const { products, fetchProduct, handleNext, history, batchAllocationCount } = props;
  const sameTemplateFlag = useMemo(() => {
    const list = new Set(
      products.map((n) => {
        if (n.punchoutFlag === 1) {
          // punchout商品相同报价单
          return n.qtHeaderNo;
        }
        return n.templateId;
      })
    );
    return list.size === 1;
  }, [products]);

  // 是否有punchout商品
  const hasPunchoutFlag = useMemo(() => products.some((n) => n.punchoutFlag), [products]);
  // punch out非同一报价单
  const punchoutNoQtHeaderFlag = useMemo(
    () => !isEmpty(products) && products.every((n) => n.punchoutFlag) && !sameTemplateFlag,
    [products, sameTemplateFlag]
  );
  // 是否有手工商品
  const hasManulFlag = useMemo(() => products.some((n) => n.manualFlag), [products]);
  // 是否拼单商品且状态为已加入拼单和拼单待审批
  const isSharedOrderStatusFlag = useMemo(
    () => products.some((n) => n.centralizedFlag && ['SUBMITTED'].includes(n.centralizedStatus)),
    [products]
  );
  // 是否拼单商品
  const isSharedOrderFlag = useMemo(() => products.some((n) => n.centralizedFlag), [products]);

  const modalProps = useMemo(() => {
    return {
      products,
      fetchProduct,
      hasPunchoutFlag,
      hasManulFlag,
      isSharedOrderFlag,
      dimensTemplates: products?.[0]?.dimensionTemplateDTO,
      history,
    };
  }, [products, fetchProduct, hasPunchoutFlag, hasManulFlag]);

  function openBatchAllocationModal() {
    const flag = CuxFn({
      name: 'BatchAllocation-fn-beforeBatchAllocation',
      value: { handleNext, products },
    })(() => {
      return true;
    })();
    if (!flag) return;
    Modal.open({
      key: 'batchAllocation',
      drawer: true,
      title: intl.get('mallf.common.view.batchAllocation').d('批量分配'),
      children: <BatchAllocationModal {...modalProps} />,
      style: { width: 1090 },
      okText: intl.get('mallf.common.button.save').d('保存'),
      bodyStyle: { padding: 0, backgroundColor: '#F7F7F7' },
    });
  }

  const title = useMemo(() => {
    const titleMap = new Map([
      [
        !isEmpty(products) && !sameTemplateFlag,
        intl.get('mallf.cart.view.batchFenpei.warning').d('批量只能选择相同模板的商品'),
      ],
      [
        punchoutNoQtHeaderFlag,
        intl
          .get('mallf.cart.view.batchAllocation.noBatchPunchout')
          .d('批量punchout只能选择相同报价单的商品'),
      ],
      [
        hasPunchoutFlag && !sameTemplateFlag,
        intl
          .get('mallf.cart.view.batchAllocation.samePunchout')
          .d('批量punchout只能选择相同来源的商品'),
      ],
      [
        isSharedOrderStatusFlag,
        intl.get('mallf.cart.view.batchAllocation.statusWarning').d('当前状态无法批量分配'),
      ],
      // batchAllocationCount: common-config接口返回的批量分配数量限制，为空则不限制
      [
        batchAllocationCount && products.length > batchAllocationCount,
        intl
          .get('mallf.cart.view.batchAllocation.limitWarning', { count: batchAllocationCount })
          .d(`仅支持${batchAllocationCount}个商品内进行批量分配，请重新勾选`),
      ],
    ]);
    CuxFn({
      name: 'BatchAllocation-fn-handleTitleMap',
      value: { titleMap, products },
    })();
    return titleMap.get(true);
  }, [punchoutNoQtHeaderFlag, hasPunchoutFlag, sameTemplateFlag, products, batchAllocationCount]);

  return (
    <>
      <div>
        {isEmpty(products) || title ? (
          <Tooltip title={title}>
            <span style={{ color: '#999999', cursor: 'not-allowed' }}>
              {intl.get('mallf.common.view.batchAllocation').d('批量分配')}
            </span>
          </Tooltip>
        ) : (
          <a
            // funcType="link"
            // style={{
            //   display: 'flex',
            //   lineHeight: '30px',
            //   width: '100%',
            //   height: '30px',
            // }}
            onClick={() => {
              openBatchAllocationModal();
            }}
          >
            {intl.get('mallf.common.view.batchAllocation').d('批量分配')}
          </a>
        )}
      </div>
    </>
  );
}

export default BatchAllocation;
