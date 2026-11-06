import React from 'react';
import { DataSet, Lov, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import Swal from 'components/swal';
import moment from 'moment';
import intl from 'utils/intl';
import LovModal from 'mall-front/lib/components/NewLov/LovModal';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import notification from 'utils/notification';
import { requestTypeDS } from './store/ds';

const RenderRequestTypeLov = observer(({ dataSet }) => {
  const lovDs = new DataSet(requestTypeDS());
  return (
    <Lov
      dataSet={lovDs}
      name="requestType"
      onChange={async (data) => {
        dataSet.setCartParams({ prTypeId: data?.prTypeId });
        dataSet.queryCartData();
      }}
      style={{ marginRight: 12 }}
      placeholder="请选择采购申请类型"
    />
  );
});

export function cartAppendHeader({ dataSet, tabKey }) {
  return [1, 2].includes(tabKey) && <RenderRequestTypeLov dataSet={dataSet} />;
}

export function setCuxHeaderList({ headerList, product }) {
  return headerList.map((item) => {
    if (item.dimensionCode === 'prTypeId') {
      // 加购设置申请类型值
      return {
        ...item,
        value: product?._cuxPrTypeId,
        valueName: product?._cuxPrTypeName,
      };
    }
    return item;
  });
}

export async function beforeHandleSubmit({ openOrderInfo, handleSubmit, formDs }) {
  const { orderLineList = [] } = openOrderInfo;
  const validateStockPriceFlag = await validateStockPrice(formDs, openOrderInfo);
  if (!validateStockPriceFlag) {
    return false;
  }
  const tipProducts = [];
  orderLineList.forEach((order) => {
    if (
      order.lineValueList?.some(
        (line) => line?.dimensionCode === 'attributeVarchar26' && line?.value === '1'
      )
    ) {
      tipProducts.push(order.productNum);
    }
  });
  if (tipProducts.length > 0) {
    Swal(
      `${tipProducts.map((p) => `商品${p}`).join(',')}需要预付款，请下单后提交预付款申请！`
    ).then((res) => {
      if (res.value) {
        handleSubmit();
      }
    });
  } else {
    handleSubmit();
  }
}

export function setAlllocationFieldProps({ item, product, fieldType }) {
  const { manualFlag } = product || {};
  const { dimensionCode } = item?.dimension || {};
  if (dimensionCode === 'neededDate' && manualFlag && fieldType === 'header') {
    return {
      min: () => moment().add(1, 'days').format('YYYY-MM-DD'),
    };
  }
  return {};
}

export function beforeAddNewCart({ params }) {
  return new Promise((resolve) => {
    let modal;
    const queryParams = {
      tenantId: getCurrentOrganizationId,
    };
    const toggleModal = () => {
      if (modal) {
        modal.close();
        resolve(false); // 点击取消
      }
    };
    const handleLovOk = (data) => {
      resolve({
        ...params,
        cartHeaderDTOList: [
          {
            ...params.cartHeaderDTOList[0],
            headerList: params.cartHeaderDTOList[0].headerList.map((item) => {
              if (item.dimensionCode === 'prTypeId') {
                return {
                  ...item,
                  value: data?.prTypeId,
                  valueName: data?.prTypeName,
                };
              }
              return item;
            }),
          },
        ],
      });
    };
    modal = Modal.open({
      destroyOnClose: true,
      mask: true,
      closable: true,
      drawer: true,
      okText: intl.get(`mallf.common.button.addCart`).d('加入购物车'),
      children: (
        <LovModal
          originTenantId={getCurrentOrganizationId()}
          title={intl.get(`mallf.common.view.prType`).d('采购申请类型')}
          queryParams={queryParams}
          handleLovOk={handleLovOk}
          toggleModal={toggleModal}
          lovCode="SPUC.PR_DEMAND_TYPE"
        />
      ),
    });
  });
}

async function validateStockPrice(formDs, openOrderInfo) {
  const formData = formDs.current.toData();
  const params = {
    ...openOrderInfo,
    ...formData,
  };
  const result = await request(
    `${
      HmallConfig.apiGateway
    }/marmot/v1/${getCurrentOrganizationId()}/marmot-api/9czpSkPZ7YjW4vOVotPjg1WxnmsoiaZ6FLa23SPEeXCsgrxgAxCToNFWt6cCibWKv8`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
  let validateStockPriceFlag = false;
  if (getResponse(result)) {
    // 接口调用成功，返回的金额字段都需要回写到对应字段上
    const {
      errorFlag,
      errorMsg,
      attributeDecimal15,
      attributeDecimal16,
      attributeDecimal17,
    } = result;

    if (+errorFlag === 0) {
      validateStockPriceFlag = true;
    } else if (errorMsg) {
      notification.error({ errorMsg });
    }
    formDs.current.set('attributeDecimal15', attributeDecimal15);
    formDs.current.set('attributeDecimal16', attributeDecimal16);
    formDs.current.set('attributeDecimal17', attributeDecimal17);
  }
  return validateStockPriceFlag;
}

export function getTransportScoreDisabled() {
  return true; // 服务评分只读
}