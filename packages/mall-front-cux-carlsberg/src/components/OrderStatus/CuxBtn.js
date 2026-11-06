import React, { useCallback, useEffect } from 'react';
import { Button } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getResponse, getUserConfigInfo } from 'utils/utils';
import request from 'utils/request';
import notification from 'utils/notification';
import HmallConfig from 'utils/api-config';

import intl from 'utils/intl';

export default function CuxBtn(props) {
  const { product, item, poLineList, fetchOrderData } = props
  const {attributeVarchar21, srmOrderId} = product;
  useEffect(()=>{
    console.log(product, `attributeVarchar21: ${attributeVarchar21}`);
  }, [])

  const reExecute = useCallback(async ()=>{
    const { organizationId } = getUserConfigInfo();
    console.log('reExecute-----------------');
    const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/Vib07uTVQIeliabcuKModyxuvShH9LeDSvgXZBWB8HONo`;
    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify(product),
    })
    if(getResponse(res)){
      notification.success({});
      fetchOrderData();
    }
  })

  return (
    attributeVarchar21 && attributeVarchar21 === 'Y' ? <Button 
      funcType="flat"
      className="primary-link"
      style={{ marginTop: '8px', color: 'red' }}
      onClick={()=>reExecute()}
      color="red"
    >
      <span style={{color: 'red'}}>{intl.get(`mallf.myOrder.view.button.reExecute`).d('重新执行')}</span>
    </Button> : <></>
  );
}
