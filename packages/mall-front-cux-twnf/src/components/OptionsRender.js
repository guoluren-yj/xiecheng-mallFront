import React from 'react';
import { Lov, DataSet } from 'choerodon-ui/pro';
import styles from 'mall-front/lib/routes/CartProCopy/renderer.less';
import ProductAllocation from 'mall-front/lib/routes/CartProCopy/ProductAllocationButton';
import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import notification from 'utils/notification';
import HmallConfig from 'utils/api-config';
import { requestTypeDS } from '../functions/store/ds';

export default function optionsRender({ record, dataSet }) {
  const qtHeaderNo = +record.get('qtHeaderNo');
  const invalidFlag = record.get('invalidFlag');
  const manualFlag = +record.get('manualFlag');
  const templateUpdateFlag = record.get('templateUpdateFlag');
  const lovDs = new DataSet(requestTypeDS({ data: [record.toData()] }));
  const handleChangeType = async (value) => {
    if (value) {
      const data = {
        cartId: record.get('cartId'),
        ...(value || {}),
      };
      const result = await request(
        `${
          HmallConfig.apiGateway
        }/marmot/v1/${getCurrentOrganizationId()}/marmot-api/X4hRcEbWwCNfHDiaEk4zCoeRvnjWNiakhobfcZSnjV7Vg`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      if (getResponse(result)) {
        notification.success();
        dataSet.queryCartData();
      }
    }
  };
  return (
    <div className={styles['sku-options-wrapper']}>
      <a
        r-if={!!invalidFlag && !qtHeaderNo && !manualFlag}
        className="option-btn"
        onClick={() => dataSet.collectCartSku({ record })}
      >
        {intl.get(`mallf.cart.view.add.favorites`).d('加入收藏')}
      </a>
      <a
        className="option-btn"
        onClick={() => {
          openComfirmModal({
            title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
            border: false,
            children: (
              <span>
                {intl.get(`mallf.cart.model.confirm.deleteProduct`).d('确认删除该商品？')}
              </span>
            ),
            onOk: () => {
              dataSet.deleteCartRecords([record], true);
            },
          });
        }}
      >
        {intl.get(`mallf.cart.view.cart.delete.product`).d('删除商品')}
      </a>
      {!!invalidFlag && (
        <ProductAllocation
          callBack={() =>
            templateUpdateFlag ? dataSet.queryCartData() : dataSet.fetchSingleCart(record)
          }
          product={record.toJSONData()}
          noAction={record.get('manualFlag') || record.get('templateUpdateFlag')}
        />
      )}
      {!!invalidFlag && (
        <div className="option-btn">
          <Lov
            dataSet={lovDs}
            name="requestType"
            mode="button"
            funcType="link"
            color="primary"
            clearButton={false}
            onChange={handleChangeType}
            placeholder={intl.get(`mallf.common.view.prType`).d('采购申请类型')}
          />
        </div>
      )}
    </div>
  );
}
