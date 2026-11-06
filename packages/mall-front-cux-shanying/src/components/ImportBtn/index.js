import React from 'react';

import intl from 'utils/intl';
import { getUserConfigInfo, openImport, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import { useModal } from 'components/Import';
import { DataSet, Table, Modal, Button } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import request from 'utils/request';
import { withRouter } from 'react-router-dom';

import styles from './index.less';

function ImportBtn(props) {
  const { initData } = props;
  const { selectedCount } = initData;
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
    hideFieldList = [],
  } = getUserConfigInfo();

  const handleModalOpen = () => {
    const ds = new DataSet({
      autoQuery: true,
      selection: 'single',
      queryFields: [
        {
          name: 'projectNum',
          label: '立项单号',
          type: 'string',
        },
        {
          name: 'projectName',
          label: '立项项目名称',
          type: 'string',
        },
      ],
      fields: [
        {
          name: 'projectNum',
          label: '立项单号',
          type: 'string',
        },
        {
          name: 'projectName',
          label: '立项项目名称',
          type: 'string',
        },
        {
          name: 'companyCode',
          label: '公司代码',
          type: 'string',
        },
        {
          name: 'innerOrderCode',
          label: '内部订单号',
          type: 'string',
        },
        {
          name: 'innerOrderName',
          label: '内部订单描述',
          type: 'string',
        },
        {
          name: 'accountCode',
          label: '科目编码',
          type: 'string',
        },
        {
          name: 'accountName',
          label: '科目描述',
          type: 'string',
        },
      ],
      transport: {
        read: () => {
          return {
            url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ljV6cC0Rx5cFZntGQCISNhzQpw46iabyQeepwps3QlOoTiahDph05Jw6ZvrFaHxk0u`,
            method: 'POST',
          };
        },
      },
    });
    const columns = [
      {
        name: 'projectNum',
      },
      {
        name: 'projectName',
      },
      {
        name: 'companyCode',
      },
      {
        name: 'innerOrderCode',
      },
      {
        name: 'innerOrderName',
      },
    ];
    Modal.open({
      destroyOnClose: true,
      mask: true,
      title: intl.get(`mallf.common.model.shanying.projectInfo`).d('立项信息'),
      style: { width: 800 },
      children: <Table dataSet={ds} columns={columns} />,
      onOk: async () => {
        if (ds.selected.length === 0) {
          notification.warning({
            message: intl
              .get('mallf.common.view.message.shanying.projectRequired')
              .d('请选择立项项目！'),
          });
          return false;
        }
        const selectProject = ds.selected.map(item => item.toData())[0];
        const cartId = initData.initProducts.filter(p => p.checked).map(item => item.cartId);
        const res = await request(
          `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/5OGwonN479KjSibozZ1nlBhgeqtIRd6PoLVpyJxl4zicg4wRxIqIhkV6hsZXGtsKq7`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...selectProject,
              cartId,
            }),
          }
        );
        if (getResponse(res)) {
          notification.success();
          props.history.push('/refresh');
          return true;
        } else {
          return false;
        }
      },
    });
  };

  return (
    <>
      {!hideFieldList.includes('SHOPPINGCART_IMPORT') && (
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
      )}
      {!hideFieldList.includes('SHOPPINGCART_IMPORT') && (
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
      )}
      <Button
        className={styles.isProjectClass}
        onClick={() => handleModalOpen()}
        disabled={selectedCount === 0}
        // funcType="flat"
        color="primary"
      >
        {intl.get('mallf.cart.model.cart.shanying.isProjectClass').d('是否项目类')}
      </Button>
    </>
  );
}
export default withRouter(ImportBtn);
