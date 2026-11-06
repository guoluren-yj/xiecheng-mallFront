import React from 'react';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';
import { Modal, Table, DataSet } from 'choerodon-ui/pro';

export function cuxFetchPriceChange({ type, skuCode, skuType, skuId }) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/sagm/v1/${organizationId}/price-changes/${skuType}/price-history/${skuId}`;
  const url2 = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/xDOvb7T4XbmHgyBa6saLLRqjYG7oAye5u2LKcHk2xebwwUMWRPTefHg71scXzDgo`;
  return type === 1
    ? request(url, {
        method: 'GET',
      })
    : request(url2, {
        method: 'POST',
        body: JSON.stringify({ skuCode }),
      });
}

export async function initBeforeOrderData({ stateOrderData, setOrderData }) {
  if (stateOrderData) {
    const companyIds = [...new Set(stateOrderData.map((item) => item.companyId))];
    const { organizationId } = getUserConfigInfo();
    const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/fklJR9GIcJrtMlib9xnia5ibOHmWaVpJibR72cWTaialibVmc`;
    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify({ companyIds }),
    });
    if (res) {
      const newOrderData = stateOrderData.map((item) => {
        const XXYTCompanyPayInfo = res.filter((i) => i.companyId === item.companyId);
        return {
          ...item,
          XXYTCompanyPayInfo,
        };
      });
      setOrderData(newOrderData);
    }
  }
}
export function setNewProductData({ setProductData }) {
  if (setProductData) {
    setProductData((data) => {
      return { ...data, cuxShowHistoryPrice: 1 };
    });
  }
}

export async function submitValid({ params, setSubmitLoading }) {
  try {
    const { organizationId } = getUserConfigInfo();
    let budgetInfo;
    if (
      params.some(
        (n) =>
          n?.orderInfo?.productSource === 'CATA' && n?.orderInvoiceInfo?.paymentMethodCode === '4'
      )
    ) {
      const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/N5yPQQJFPAYMkQSJedbn6vYYV2FaXljRPM8goibfGh90`;
      setSubmitLoading(true);
      budgetInfo = await request(url, { method: 'post', body: JSON.stringify(params) });
      setSubmitLoading(false);
    }
    const budgetData =
      budgetInfo
        ?.map((item, index) => ({
          ...item,
          orderSeq: index + 1,
          checkMoneyMessage: item?.orderInfo?.checkMoneyMessgae,
        }))
        ?.filter((item) => item?.orderInfo?.checkMoneyFlag) || [];
    if (budgetInfo && budgetData && budgetData.length > 0) {
      const ds = new DataSet({
        data: budgetData,
        selection: false,
        paging: false,
        fields: [
          {
            name: 'orderSeq',
            label: intl.get('mallf.common.view.berforeOrderIndex').d('采购申请号'),
          },
          {
            name: 'checkMoneyMessage',
            label: intl.get('mallf.common.view.warningMsg').d('提示'),
          },
        ],
      });
      const columns = [
        {
          name: 'orderSeq',
          width: 100,
        },
        {
          width: 200,
          name: 'checkMoneyMessage',
        },
      ];
      Modal.open({
        title: intl.get('mallf.companyOrder.view.title.budgetWarning').d('预算校验提示'),
        destroyOnClose: true,
        mask: true,
        closable: true,
        cancelButton: false,
        style: { width: 560 },
        children: <Table dataSet={ds} columns={columns} style={{ maxHeight: 210 }} />,
      });
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
}
