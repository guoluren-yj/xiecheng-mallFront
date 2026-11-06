import React from 'react';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import { getUserConfigInfo, openImport } from 'utils/utils';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import { useModal } from 'components/Import';
import cuxComonent from 'cuxTools/cuxComponent';

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

export default cuxComonent({ path: 'routes/Cart/ImportBtn' })(withRouter(ImportBtn));
