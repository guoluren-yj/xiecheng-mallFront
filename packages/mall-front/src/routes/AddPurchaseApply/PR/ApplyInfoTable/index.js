import React, { useEffect, useMemo } from 'react';
import uuid from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Table, NumberField, Lov, DatePicker, Attachment, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { accept } from 'utils/constants';
import { PermissionButton } from 'components/Permission';
import {
  importPurchaseApplyLine,
  importPurchaseApplyLineNew,
} from 'components/Permission/permissionCode';
import { useModal } from 'components/Import';
import { deleteReqProductInfo } from 'services/purchaseRequestService';
import intl from 'utils/intl';
import request from 'utils/request';
import { openImport, getUserConfigInfo, getOrganizationId, getPrimaryColor } from 'utils/utils';
import ds from './ds';

function ApplyInfoTable(props) {
  const initDs = useMemo(() => new DataSet(ds()), []);
  const {
    invoiceOrgId: invOrganizationId,
    invoiceOrgName: invOrganizationName,
    custWebConfig: { manualFileSize = 100 },
  } = getUserConfigInfo();
  const { onDsRef, tableInitData, prHeaderId, getLineData, custTable, headerDs } = props;
  useEffect(() => {
    onDsRef(initDs);
  }, []);

  const getCatagory = (itemId) => {
    request(`/smdm/v1/${getOrganizationId()}/item-categories/lov`, {
      query: {
        lovCode: 'SMDM.TREE_ITEM_CATEGORY',
        enabledFlag: 1,
        tenantId: getOrganizationId(),
        itemId,
      },
    }).then((catagory) => {
      if (catagory?.content?.[0]) {
        initDs.current.set('categoryLov', catagory?.content?.[0]);
      }
    });
  };

  const columns = [
    {
      width: 150,
      name: 'productName',
      editor: true,
    },
    {
      width: 150,
      name: 'quantity',
      align: 'left',
      editor: () => (
        <NumberField
          placeholder={intl.get('mallf.purchaseDetail.please.enter.int').d('请输入整数')}
          step={1}
          min={1}
        />
      ),
    },
    {
      width: 150,
      name: 'itemLov',
      editor: () => (
        <Lov
          onChange={(data) => {
            const { uomName, uomId, itemId } = data || {};
            initDs.current.set('uomName', uomName);
            initDs.current.set('uomId', uomId);
            getCatagory(itemId);
          }}
        />
      ),
    },
    {
      width: 150,
      name: 'itemName',
      editor: true,
    },
    {
      width: 150,
      name: 'uomLov',
      editor: () => <Lov />,
    },
    {
      width: 150,
      name: 'invOrganizationLov',
      editor: () => <Lov />,
    },
    {
      width: 150,
      name: 'categoryLov',
      editor: () => <Lov />,
    },

    {
      width: 150,
      name: 'costLov',
      editor: () => <Lov />,
    },
    {
      width: 150,
      name: 'wbsCodeLov',
      editor: () => <Lov />,
    },
    {
      width: 150,
      name: 'neededDate',
      editor: () => <DatePicker name="requestDate" />,
    },
    {
      width: 150,
      name: 'attachmentUuid',
      renderer: ({ record }) => {
        if (!record.get('attachmentUuid')) {
          record.init('attachmentUuid', uuid());
        }
        const maxSize = `${manualFileSize}M`;
        const attProps = {
          name: 'attachmentUuid',
          sortable: true,
          bucketName: 'private-bucket',
          bucketDirectory: 'mall-front',
          viewMode: 'popup',
          value: record.get('attachmentUuid'),
          label: intl.get('mallf.addPurchase.view.line.attachment').d('申请行附件'),
          onChange: () => {},
          style: { paddingLeft: 0 },
          funcType: 'link',
          accept,
          help: intl
            .get('mallf.common.view.attProps.help', { accept, maxSize })
            .d(`支持${accept.join(',')}格式，且不能大于${maxSize}`),
          fileSize: 1024 * 1024 * manualFileSize,
        };
        return <Attachment {...attProps} />;
      },
    },
  ];

  const deleteLines = () => {
    const delFetchData = initDs.selected.map((p) => p.toData()).filter((p) => !p._status);
    if (delFetchData.length === 0) {
      initDs.remove(initDs.selected);
    } else {
      deleteReqProductInfo(delFetchData, prHeaderId).then(() => {
        getLineData(false);
      });
    }
  };

  const DelButton = observer(({ dataSet }) => {
    const disabled = dataSet.selected.length === 0;
    return (
      <Button
        funcType="flat"
        color="primary"
        icon="delete"
        disabled={disabled}
        onClick={() => {
          deleteLines();
        }}
        style={disabled ? {} : { color: getPrimaryColor() }}
      >
        {intl.get('mallf.addPurchase.status.delete').d('删除')}
      </Button>
    );
  });

  const CopyButton = observer(({ dataSet }) => {
    const disabled = dataSet.selected.length === 0;
    return (
      <Button
        funcType="flat"
        color="primary"
        disabled={disabled}
        icon="baseline-file_copy"
        style={disabled ? {} : { color: getPrimaryColor() }}
        onClick={() => addLine({ copy: true })}
      >
        {intl.get('mallf.addPurchase.button.copy.lineinfo').d('复制行信息')}
      </Button>
    );
  });

  const addLine = ({ copy }) => {
    const {
      organizationName,
      organizationId,
      companyName,
      companyId,
      ouId,
      ouName,
    } = tableInitData;
    if (copy) {
      initDs.selected.forEach((r) => {
        const newData = r.toData();
        delete newData.objectVersionNumber;
        delete newData._token;
        delete newData.prLineId;
        delete newData.requestedBy;

        delete newData.createdBy;
        delete newData.creationDate;
        delete newData.headerSyncStatus;
        delete newData.headerSyncStatusMeaning;
        delete newData.creatorName;
        delete newData.lastUpdatedBy;

        initDs.create({
          ...newData,
          attachmentUuid: uuid(),
          displayLineNum: initDs?.toData().length + 1,
          _status: 'create',
        });
      });
    } else {
      initDs.create({
        attachmentUuid: uuid(),
        invOrganizationId: organizationId,
        invOrganizationName: organizationName,
        companyName,
        companyId,
        ouId,
        ouName,
        _status: 'create',
      });
    }
  };

  const handleImport = () => {
    // const { companyId, ouId } = tableInitData;
    openImport({
      code: 'SMAL.MANUAL_PURCHASE_REQUEST',
      importType: 'excel',
      action: intl.get('mallf.purchaseDetail.application.line.import').d('申请行导入'),
      args: JSON.stringify({
        prHeaderId,
        invOrganizationId,
        invOrganizationName,
        companyId: headerDs?.current?.get('companyId'),
        ouId: headerDs?.current?.get('companyId'),
      }),
    });
  };

  return (
    <div>
      <p className="addPurchase-apply-title">
        <span>{intl.get(`mallf.purchaseDetail.view.myRequestInfo`).d('申请信息')}</span>
        <div style={{ float: 'right' }}>
          <CopyButton dataSet={initDs} />
          <Button
            icon="playlist_add"
            funcType="flat"
            color="primary"
            onClick={addLine}
            style={{ color: getPrimaryColor() }}
          >
            {intl.get('hzero.common.btn.add').d('新增')}
          </Button>
          <DelButton dataSet={initDs} />
          <PermissionButton
            type="c7n-pro"
            icon="archive"
            funcType="flat"
            color="primary"
            style={!prHeaderId ? {} : { color: getPrimaryColor() }}
            disabled={!prHeaderId}
            onClick={handleImport}
            permissionList={[importPurchaseApplyLine]}
          >
            {intl.get(`mallf.addPurchase.button.import`).d('导入')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            color="primary"
            funcType="flat"
            icon="archive"
            disabled={!prHeaderId}
            permissionList={[importPurchaseApplyLineNew]}
            onClick={() => {
              useModal().openModal({
                businessObjectTemplateCode: 'SMAL.MANUAL_PURCHASE_REQUEST',
                refreshButton: true,
                prefixPatch: '/smal',
                successCallBack: () => getLineData(false),
                args: {
                  prHeaderId,
                  invOrganizationId,
                  invOrganizationName,
                  companyId: headerDs?.current?.get('companyId'),
                  ouId: headerDs?.current?.get('companyId'),
                },
              });
            }}
          >
            {intl.get(`mallf.common.button.import.new`).d('(新)导入')}
          </PermissionButton>
          <Button
            icon="refresh"
            funcType="flat"
            color="primary"
            disabled={!prHeaderId}
            onClick={() => getLineData(false)}
          >
            {intl.get(`mallf.addPurchase.button.refresh`).d('刷新')}
          </Button>
        </div>
      </p>
      <div style={{ marginBottom: 30 }}>
        {custTable(
          { code: 'MALL.APPLY.EDIT.APPLYINFO.TABLE' },
          <Table dataSet={initDs} columns={columns} />
        )}
      </div>
    </div>
  );
}

export default formatterCollections({ code: 'mallf.addPurchase' })(ApplyInfoTable);
