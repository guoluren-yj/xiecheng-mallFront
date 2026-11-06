import React, { useMemo } from 'react';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import { useModal } from 'components/Import';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import { Menu, Dropdown, Icon } from 'choerodon-ui/pro';
import { getOpenCartFlag } from 'utils/configUtils';
import { prRequestJump, getUserConfigInfo } from 'utils/utils';
import { ShowAddPurchase } from 'utils/renderer';
import useDimensTemplates from 'hooks/useDimensTemplates';
import ProductAllocation from 'mall-front/lib/routes/CartProCopy/ProductAllocationButton'; // 网易二开新建手工商品入口
import style from './importBtn.less';

function ImportBtn(props) {
  const { dataSet } = props || {};
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
    manualRequestFlag,
  } = getUserConfigInfo();
  const { manualDimensionTemplate = {}, manualDimensionList = [] } = useDimensTemplates();
  const renderAllocation = useMemo(() => {
    return (
      <ProductAllocation
        r-if={getOpenCartFlag() && !!manualRequestFlag}
        noFetchFlag
        product={{ manualFlag: 1 }}
        title={intl.get('mallf.cart.view.openCartApplication').d('新建手工商品')}
        dimensionTemplates={{
          dimensionTemplate: manualDimensionTemplate,
          dimensionList: manualDimensionList,
        }}
        callBack={() => dataSet.queryCartData()}
      >
        <PermissionButton funcType="flat" type="text" className="cart-new-application">
          {intl.get('mallf.cart.view.openCartApplication').d('新建手工商品')}
        </PermissionButton>
      </ProductAllocation>
    );
  }, [manualRequestFlag, dataSet, manualDimensionTemplate, manualDimensionList]);
  const menu = (
    <Menu selectable={false}>
      <Menu.Item key="" className="import-item">
        <ShowAddPurchase>
          <PermissionButton
            r-if={!getOpenCartFlag()}
            funcType="flat"
            type="text"
            onClick={() => prRequestJump()}
          >
            {intl.get('mallf.cart.view.manualCreateApply').d('手工提报采购申请')}
          </PermissionButton>
          {renderAllocation}
        </ShowAddPurchase>
      </Menu.Item>
      <Menu.Item key="importCata">
        <PermissionButton
          permissionList={[
            {
              code: `mall.cart.button.import-new`,
              type: 'button',
              meaning: '购物车-(新)导入',
            },
          ]}
          type="text"
          funcType="flat"
          onClick={() => {
            const modal = useModal().openModal({
              businessObjectTemplateCode: 'SMCT.SHOPPING_CART',
              refreshButton: true,
              prefixPatch: '/smct',
              action: '导入目录商品',
              successCallBack: () => {
                props.history.push('/refresh');
                modal.close();
              },
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
          {intl.get('mallf.cart.model.import.catalog.goods').d('导入目录商品')}
        </PermissionButton>
      </Menu.Item>
      <Menu.Item key="importManual">
        <PermissionButton
          type="text"
          funcType="flat"
          onClick={() => {
            const modal = useModal().openModal({
              businessObjectTemplateCode: 'SMCT.SHOPPING_CART_MANUAL',
              refreshButton: true,
              prefixPatch: '/smct',
              action: '导入手工商品',
              successCallBack: () => {
                props.history.push('/refresh');
                modal.close();
              },
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
          {intl.get('mallf.cart.model.import.manual.goods').d('导入手工商品')}
        </PermissionButton>
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      <Dropdown overlay={menu} placement="bottomLeft">
        <PermissionButton
          type="c7n-pro"
          color="primary"
          icon="playlist_add"
          className={style.permissionButtonStyle}
        >
          <span className={style['header-new-btn']}>
            {intl.get('mallf.common.button.add').d('新建')}
          </span>
          <Icon className={style['header-new-btn-icon']} type="expand_more" />
        </PermissionButton>
      </Dropdown>
    </>
  );
}
export default withRouter(ImportBtn);
