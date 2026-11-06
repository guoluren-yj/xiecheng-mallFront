import React, { useMemo } from 'react';
import { Form, Select, DataSet, Button, message } from 'choerodon-ui/pro';

import { addCollect } from 'services/productDetailService';
import intl from 'utils/intl';

export default function CollectPopOver({ collectList, product, setVisible, callBack }) {
  const initDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      forceValidate: true,
      fields: [
        {
          name: 'favoriteCategoryId',
          label: intl.get('mallf.common.view.favorite.groupName').d('分类名称'),
          defaultValue: collectList[0]?.categoryId,
        },
      ],
    });
  }, []);
  return (
    <div>
      <Form labelLayout="float" columns={1} dataSet={initDs}>
        <Select name="favoriteCategoryId">
          {collectList.map((group) => {
            return <Select.Option value={group.categoryId}>{group.categoryName}</Select.Option>;
          })}
        </Select>
      </Form>
      <div className="favorites-pop-over-footer">
        <Button
          color="primary"
          onClick={async () => {
            const res = await addCollect({
              productSource: product.sourceFromCode || product.sourceFrom,
              productId: product.productId || product.skuId,
              favoriteCategoryId: initDs.current.get('favoriteCategoryId'),
            });
            callBack(res);
            setVisible(false);
            message.success(
              intl.get('mallf.common.view.wish.addCollect').d('成功加入收藏'),
              undefined,
              undefined,
              'top'
            );
          }}
        >
          {intl.get('hzero.common.button.confrim').d('确定')}
        </Button>
        <Button onClick={() => setVisible(false)}>
          {intl.get('hzero.common.btn.cancel').d('取消')}
        </Button>
      </div>
    </div>
  );
}
