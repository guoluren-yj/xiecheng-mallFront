import React from 'react';

import intl from 'utils/intl';
import { getUserConfigInfo, openImport } from 'utils/utils';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import { useModal } from 'components/Import';
import SwalAlert from 'components/swal';
import { fetchStock } from '../services/cartService';

function ImportBtn(props) {
  const {
    companyId,
    organizationId,
    userId: ownerId,
    invoiceOrgId: invOrganizationId,
    purchaseOrgId: purOrganizationId,
    purchaseType,
    levelPath,
    ouId,
    unitId,
  } = getUserConfigInfo();

  return (
    <>
      <div style={{ color: '#fa6400', float: 'left' }}>
        请勾选数据点击【获取库存】按钮查询实时库存后，参考库存进行采买
      </div>
      <PermissionButton
        type="c7n-pro"
        style={{
          float: 'right',
          position: 'relative',
          top: -5,
        }}
        color="primary"
        funcType="flat"
        onClick={async () => {
          const { initData, setInitData } = props || {};
          const selected = initData.initProducts.filter((p) => p.checked);
          if (selected.length < 1) {
            SwalAlert(intl.get(`mallf.common.model.selectOneMsg`).d('请至少选择一条数据'));
            return false;
          }
          const result = await fetchStock(selected);
          if (result) {
            SwalAlert(intl.get('mallf.common.view.set.success').d('操作成功'));
            setInitData({
              ...initData,
              initProducts: initData.initProducts.map((p) => {
                const find = result.find((r) => r.cartId === p.cartId);
                if (find) {
                  return {
                    ...p,
                    attributeDecimal13: find.attributeDecimal13,
                    attributeDecimal12: find.attributeDecimal12,
                    errorMessage: find.errorMessage,
                  };
                }
                return p;
              }),
            });
          }
        }}
      >
        获取实时库存
      </PermissionButton>
      <PermissionButton
        type="c7n-pro"
        style={{
          float: 'right',
          position: 'relative',
          top: -5,
        }}
        color="primary"
        icon="archive"
        funcType="flat"
        permissionList={[
          {
            code: `mall.cart.button.import`,
            type: 'button',
            meaning: '购物车-导入',
          },
        ]}
        onClick={() => {
          openImport({
            code: 'SMAL.SHOPPING_CART',
            importType: 'excel',
            action: intl.get('mallf.cart.model.cart.import').d('购物车导入'),
            args: JSON.stringify({
              companyId,
              tenantId: organizationId,
              ownerId,
              invOrganizationId,
              purOrganizationId,
              purchaseType,
              levelPath,
            }),
          });
        }}
      >
        {intl.get('mallf.cart.model.cart.import').d('购物车导入')}
      </PermissionButton>
      <PermissionButton
        type="c7n-pro"
        style={{
          float: 'right',
          position: 'relative',
          top: -5,
        }}
        color="primary"
        icon="archive"
        funcType="flat"
        permissionList={[
          {
            code: `mall.cart.button.import-new`,
            type: 'button',
            meaning: '购物车-(新)导入',
          },
        ]}
        onClick={() => {
          useModal().openModal({
            businessObjectTemplateCode: 'SMAL.SHOPPING_CART',
            refreshButton: true,
            prefixPatch: '/smal',
            successCallBack: () => props.history.push('/refresh'),
            args: {
              companyId,
              tenantId: organizationId,
              ownerId,
              invOrganizationId,
              purOrganizationId,
              purchaseType,
              levelPath,
              ouId,
              unitId,
            },
          });
        }}
      >
        {intl.get('mallf.cart.model.import.new').d('(新)购物车导入')}
      </PermissionButton>
    </>
  );
}

export default ImportBtn;
