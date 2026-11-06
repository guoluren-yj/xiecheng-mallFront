import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { fetchOuterLinkApi } from '../services/index.js';

export default function ListHeaderAppendBtn(props) {
  const { product } = props || {};
  const { attributeVarchar37: applyId } = product || {};
  const handleJumpOuter = async () => {
    const params = {
      billType: 20,
      applyId,
    };
    const res = await fetchOuterLinkApi(params);
    if (res) {
      window.open(res.emsLoginUrl, '_blank');
    }
    return true;
  };
  return applyId ? (
    <Button
      funcType="flat"
      color="primary"
      style={{ height: '20px', margin: '8px auto', display: 'block' }}
      className="option-btn"
      onClick={handleJumpOuter}
    >
      费用申请单
    </Button>
  ) : null;
}
