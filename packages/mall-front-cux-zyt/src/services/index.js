import request from 'utils/request';

export function fetchRequestBudgetApi(body) {
  return request(
    '/marmot/v1/{organizationId}/marmot-api/wvfGtibOZXfZoqGWB62csDo8d8HGHfmsBZricOR30WvAc',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}

export function fetchOrderRequestBudgetApi(body) {
  return request(
    '/marmot/v1/{organizationId}/marmot-api/p1JiabF1tR6eIwqoZ2HIicy1ibRgLhSX9dDOg7a13T3R6w',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}

// 我的申请-审批记录-流程预测节点
export function fetchMyRequestApproveRecord(data) {
  return request(
    '/marmot/v1/{organizationId}/marmot-api/Dw3EJHIOLwy1VYAiar7tp6xDRHVs1rbfokhEmZBADY04',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export function fetchAddCart(data) {
  return request(
    '/marmot/v1/{organizationId}/marmot-api/6V2KOjN6CEVdIibRy1wKqcGjlXWYwNRnMHq2rzPwCib8g',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}
