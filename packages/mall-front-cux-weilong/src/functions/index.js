import React from 'react';
import intl from 'utils/intl';
import { getUserConfigInfo, getResponse, getCurrentOrganizationId } from 'utils/utils';
import Swal from 'components/swal';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import { DataSet, Modal, Icon, Table } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

export function confirmSwal({ orderData, submitOrderList }) {
  const flag = orderData.some((order) =>
    order.shoppingCartDTOList.some(
      (product) => product.productSource !== 'CATA' && !product.qtHeaderNo && !product.itemCode
    )
  );
  if (flag) {
    Swal(
      intl.get(`mallf.companyOrder.view.confirmItemCode`).d('未填写物料信息，请确认后提交申请！'),
      true,
      intl.get('mallf.common.button.back').d('返回')
    );
  } else {
    Swal(
      intl
        .get(`mallf.companyOrder.model.companyOrder.confirmCreatePurchase`)
        .d('确定生成采购申请！'),
      true
    ).then((result) => {
      if (result.value) submitOrderList();
    });
  }
}

export function submitValid({ params }) {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/1Jyp8Tv9giaZreib9CbboRga4icRHH459sfwibxnQ3aqYLo`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 提交采购申请二开逻辑
export async function submitCuxValidate(props) {
  const { orderData, confirmCreatePurchaseMsg, submitOrderList } = props;
  const arr =
    orderData?.map(({ shoppingCartDTOList = [], invOrganizationId, productNum }) => ({
      cartId: isEmpty(shoppingCartDTOList) ? null : shoppingCartDTOList[0]?.cartId,
      itemId: isEmpty(shoppingCartDTOList) ? null : shoppingCartDTOList[0]?.itemId,
      productNum: productNum || shoppingCartDTOList[0]?.productNum,
      invOrganizationId,
    })) || [];
  const dataDs = new DataSet({
    paging: false,
    selection: false,
    fields: [
      {
        name: 'productNum',
        label: '商品编码',
      },
      {
        name: 'itemCode',
        label: '物料编码',
      },
      {
        name: 'itemName',
        label: '物料名称',
      },
    ],
  });
  const cuxRes = await request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/1Jyp8Tv9giaZreib9CbboRgQib1MUYrGbWiaibPxpybSKMQk`,
    {
      method: 'POST',
      body: JSON.stringify(arr),
    }
  );
  if (getResponse(cuxRes)) {
    if (!isEmpty(cuxRes)) {
      dataDs.loadData(cuxRes);
      Modal.open({
        closable: true,
        okButton: false,
        style: { width: '742px' },
        title: (() => {
          return (
            <>
              <Icon type="error" style={{ color: '#FF9500' }} />
              {intl.get('mallf.common.view.change.warning').d('温馨提示')}
            </>
          );
        })(),
        children: (
          <div>
            <div>以下物料属于“寄售/安全库存”物料，行政统一请购，请直接提领料单领用！</div>
            <Table
              dataSet={dataDs}
              columns={[
                {
                  name: 'productNum',
                },
                {
                  name: 'itemCode',
                },
                {
                  name: 'itemName',
                },
              ]}
            />
          </div>
        ),
      });
    } else {
      Swal(
        confirmCreatePurchaseMsg({
          message: intl
            .get(`mallf.companyOrder.model.companyOrder.confirmCreatePurchase`)
            .d('确定生成采购申请！'),
        }),
        true
      ).then((result) => {
        if (result.value) submitOrderList();
      });
    }
  }
}

export async function getCuxValidate(props) {
  const { res, successCallback } = props;
  const arr1 =
    res?.cartList?.map(({ cartId, itemId, productNum }) => ({ cartId, itemId, productNum })) || [];
  const arr2 = res?.orderList?.map((item) => {
    return {
      ...item?.orderInfo,
    };
  });
  const data = arr1.map((item) => {
    return {
      ...item,
      invOrganizationId: arr2[0]?.invOrganizationId || null,
    };
  });
  const dataDs = new DataSet({
    paging: false,
    selection: false,
    fields: [
      {
        name: 'productNum',
        label: '商品编码',
      },
      {
        name: 'itemCode',
        label: '物料编码',
      },
      {
        name: 'itemName',
        label: '物料名称',
      },
    ],
  });
  const cuxRes = await request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/1Jyp8Tv9giaZreib9CbboRgQib1MUYrGbWiaibPxpybSKMQk`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  if (getResponse(cuxRes)) {
    if (!isEmpty(cuxRes)) {
      dataDs.loadData(cuxRes);
      Modal.open({
        closable: true,
        okButton: false,
        style: { width: '742px' },
        title: (() => {
          return (
            <>
              <Icon type="error" style={{ color: '#FF9500' }} />
              {intl.get('mallf.common.view.change.warning').d('温馨提示')}
            </>
          );
        })(),
        children: (
          <div>
            <div>以下物料属于“寄售/安全库存”物料，行政统一请购，请直接提领料单领用！</div>
            <Table
              dataSet={dataDs}
              columns={[
                {
                  name: 'productNum',
                },
                {
                  name: 'itemCode',
                },
                {
                  name: 'itemName',
                },
              ]}
            />
          </div>
        ),
      });
    } else {
      successCallback(res);
    }
  }
}
