import React, { useMemo } from 'react';
import { withRouter } from 'react-router-dom';
import { Menu, Dropdown, Icon, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getOpenCartFlag } from 'utils/configUtils';
import { useModal } from 'components/Import';
import { PermissionButton } from 'components/Permission';
import cuxComonent from 'cuxTools/cuxComponent';
import { importManual, importReceive } from 'components/Permission/permissionCode';
import { prRequestJump, getUserConfigInfo } from 'utils/utils';
import { ShowAddPurchase } from 'utils/renderer';
import ProductAllocation from './ProductAllocationButton'; // 网易二开新建手工商品入口
import useDimensTemplates from '@/hooks/useDimensTemplates';
import style from './index.less';

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
  const [dimensTemplates, dimensLoading] = useDimensTemplates({ needLoadFlag: true });
  const { manualDimensionTemplate = {}, manualDimensionList = [] } = dimensTemplates || {};
  const renderAllocation = useMemo(() => {
    return (
      <ProductAllocation
        r-if={getOpenCartFlag() && !!manualRequestFlag && !dimensLoading}
        noFetchFlag
        defaultFlag
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
  }, [manualRequestFlag, dataSet, manualDimensionTemplate, manualDimensionList, dimensLoading]);
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
      <Menu.Item key="importCata" className="import-item">
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
            const modal = useModal().openModal(
              {
                businessObjectTemplateCode: 'SMCT.SHOPPING_CART',
                refreshButton: true,
                prefixPatch: '/smct',
                successCallBack: () => {
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
              },
              {
                onClose: () => {
                  props.history.push('/refresh');
                },
              }
            );
          }}
          className={style.permissionButtonStyle}
        >
          {intl.get('mallf.common.import.cataProducts').d('导入目录化商品')}
        </PermissionButton>
      </Menu.Item>
      <Menu.Item key="importEc" className="import-item">
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
            const modal = useModal().openModal(
              {
                businessObjectTemplateCode: 'SMCT.SHOPPING_CART',
                refreshButton: true,
                prefixPatch: '/smct',
                successCallBack: () => {
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
              },
              {
                onClose: () => {
                  props.history.push('/refresh');
                },
              }
            );
          }}
          className={style.permissionButtonStyle}
        >
          {intl.get('mallf.common.import.ecProducts').d('导入电商商品')}
        </PermissionButton>
      </Menu.Item>
      <Menu.Item
        r-if={getOpenCartFlag() && !!manualRequestFlag}
        key="importManual"
        className="import-item"
      >
        <PermissionButton
          permissionList={[importManual]}
          type="text"
          funcType="flat"
          onClick={() => {
            const modal = useModal().openModal({
              businessObjectTemplateCode: 'SMCT.MANUAL_SHOPPING_CART',
              refreshButton: true,
              prefixPatch: '/smct',
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
      <Menu.Item key="importReceive" className="import-item">
        <PermissionButton
          permissionList={[importReceive]}
          type="text"
          funcType="flat"
          onClick={() => {
            const modal = useModal().openModal({
              businessObjectTemplateCode: 'SMCT.SHOPPING_CART_RECEIVE',
              refreshButton: true,
              prefixPatch: '/smct',
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
          {intl.get('mallf.cart.model.import.receive.goods').d('导入领用商品')}
        </PermissionButton>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={menu} placement="bottomLeft">
      <Button
        type="c7n-pro"
        color="primary"
        icon="playlist_add"
        className={style.permissionButtonStyle}
      >
        <span className={style['header-new-btn']}>
          {intl.get('mallf.common.button.add').d('新建')}
        </span>
        <Icon className={style['header-new-btn-icon']} type="expand_more" />
      </Button>
    </Dropdown>
  );
}
export default cuxComonent({ path: 'routes/CartProCopy/ImportBtn' })(withRouter(ImportBtn));
