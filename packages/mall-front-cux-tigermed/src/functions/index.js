import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

function cuxAppendBtn({ manualFlag, noFetchFlag, headerDs, lineDs }) {
  if (!manualFlag || !noFetchFlag) {
    return null;
  }
  const handleUpdate = () => {
    const attributeDecimal5 = headerDs?.current?.get('attributeDecimal5');
    const attributeDecimal7 = headerDs?.current?.get('attributeDecimal7');
    const attributeDecimal6 = headerDs?.current?.get('attributeDecimal6');
    const attributeDecimal2 = headerDs?.current?.get('attributeDecimal2');
    if (attributeDecimal5 && attributeDecimal7 && attributeDecimal6 && headerDs?.current) {
      const attributeDecimal8 = math.toFixed(
        math.div(
          math.sum(attributeDecimal5, attributeDecimal7),
          math.sum(1, math.div(attributeDecimal6, 100))
        ),
        2
      );
      headerDs.current.set('attributeDecimal8', attributeDecimal8);
      if (
        attributeDecimal8 &&
        attributeDecimal2 &&
        headerDs?.current?.get('prTypeIdLov')?.prTypeCode === '2'
      ) {
        const attributeDecimal10 = math.toFixed(
          math.multipliedBy(math.div(attributeDecimal8, attributeDecimal2), math.minus(1, 0.134)),
          2
        );
        headerDs.current.set('attributeDecimal10', attributeDecimal10);
      }
    }
    lineDs.forEach((r) => {
      const attributeDecimal10 = headerDs?.current?.get('attributeDecimal10');
      if (attributeDecimal10) {
        r.set('taxIncludedPrice', attributeDecimal10);
      }
      const taxIncludedPrice = r.get('taxIncludedPrice');
      const attributeDecimal4 = r.get('attributeDecimal4') || 0;
      const quantity = r.get('quantity');
      if (taxIncludedPrice && quantity) {
        const attributeDecimal12 = math.toFixed(
          math.minus(math.multipliedBy(quantity, taxIncludedPrice), attributeDecimal4),
          2
        );
        r.set('attributeDecimal12', attributeDecimal12);
      }
    });
  };
  return (
    <Button funcType="flat" color="primary" onClick={() => handleUpdate()}>
      {intl.get(`mcux.common.tigermed.view.updateData`).d('数据更新')}
    </Button>
  );
}

async function beforeSaveFunc({
  params,
  handleManual,
  openCartFlag,
  setLoading,
  manualFlag,
  product,
  type,
}) {
  if (manualFlag || product.manualFlag) {
    try {
      setLoading(true);
      const newParams = {
        ...params,
        cartSource: 'MANUAL',
        openCartFlag,
      };
      const newData = await request(
        `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/JeNiazga0VmKibq41PaqB7Miasp85aD8g6PmUhlvkKckdM`,
        {
          method: 'POST',
          body: JSON.stringify(newParams),
        }
      );
      handleManual({ params: newData, type });
      return true;
    } catch (error) {
      setLoading(false);
    }
  }
  return false;
}

export { cuxAppendBtn, beforeSaveFunc };
