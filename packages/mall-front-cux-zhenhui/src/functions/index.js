import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import { getOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import Swal from 'components/swal';

export async function openUrlModal({ params, setSubmitLoading, error }) {
  let modal;
  let preOrigin;
  let preTimeStamp;
  function handleMessage(e) {
    if (e.origin === 'https://stage.huilianyi.com') {
      preOrigin = e.origin;
      preTimeStamp = e.timeStamp;
    }
    if (
      preOrigin === 'https://stage.huilianyi.com' &&
      e.origin === 'https://zhenxuan.test.going-buy.com' &&
      preTimeStamp < e.timeStamp
    ) {
      modal.close();
      window.dvaApp._history.push('/my-mall/my-order');
    }
  }

  if (!isEmpty(error)) return;
  setSubmitLoading(true);
  try {
    const res = await request(
      `${HmallConfig.apiGateway}/${
        HmallConfig.newCartService
      }/v1/${getOrganizationId()}/carts/pre-order`,
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
    if (res) {
      modal = Modal.open({
        fullScreen: true, // 全屏
        closable: true,
        footer: false,
        children: (
          <iframe
            name="cuxIframe"
            style={{ border: 'none' }}
            width="100%"
            height="100%"
            title="zhenhui"
            src={res.url}
          />
        ),
        onClose: () => {
          window.removeEventListener('message', handleMessage);
        },
        onCancel: () => {
          Swal(
            intl
              .get(`mcux.common.view.cancel.order.warning`)
              .d('取消后将撤销采购申请并在购物车内清除此次采购商品，确认取消？'),
            true
          ).then(({ value }) => {
            if (value) {
              try {
                request(
                  `${
                    HmallConfig.apiGateway
                  }/smodr/v1/${getOrganizationId()}/orders/batch-order-cancel`,
                  {
                    method: 'POST',
                    body: JSON.stringify({ tenantId: getOrganizationId(), batchNum: res.batchNum }),
                  }
                ).then(() => {
                  modal.close();
                  window.dvaApp._history.push('/cart');
                });
              } catch {
                // nothing
              }
            }
          });
          return false;
        },
      });
      window.addEventListener('message', handleMessage);
    }
    return false;
  } catch {
    setSubmitLoading(false);
    Swal(intl.get(`mallf.companyOrder.model.companyOrder.createPurchaseErr`).d('生成采购申请失败'));
  }
}
