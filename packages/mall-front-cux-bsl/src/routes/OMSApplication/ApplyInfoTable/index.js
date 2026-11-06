/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import uuid from 'uuid/v4';
import { sum } from 'lodash';
import { Table, NumberField, Lov, DatePicker, Modal } from 'choerodon-ui/pro';
import { Button, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import { precisionEditor } from 'utils/precision';
import C7NLov from 'components/NewLov';
import { getUserConfigInfo, priceNumberRender, getPrimaryColor } from 'utils/utils';
import { deleteOMSLines } from 'services/purchaseRequestService';
import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import useRequest from 'hooks/useRequest';
import UploadFile from 'components/CommonUpload';

export default function ApplyInfoTable(props) {
  const {
    ds: initDs,
    manualRequestId,
    fetchDetail,
    companyId,
    custTable,
    defaultPrecision,
  } = props;
  const { userId, organizationId } = getUserConfigInfo();
  const [visible, setVisible] = useState(false);
  const [uomPrecision, setUomPrecision] = useState(undefined);

  const toggleModal = () => {
    setVisible(!visible);
  };

  const { resData: belongTypeList } = useRequest({
    url: `${HmallConfig.apiGateway}/hpfm/v1/${organizationId}/lovs/value`,
    query: { lovCode: 'SMAL.ADDRESS_BELONG_TYPE_ONLYCOMPANY' },
  });

  const handleUomPrecision = (lovValue) => {
    const { uomPrecision: lovUomPrecision = 0 } = lovValue || {};
    setUomPrecision(lovUomPrecision);
  };

  const columns = [
    {
      name: 'entryCode',
      width: 50,
    },
    {
      name: 'goodsName',
      width: 80,
      editor: true,
    },
    {
      name: 'requestQuantity',
      width: 80,
      editor: (record) =>
        precisionEditor({
          name: 'requestQuantity',
          precision: uomPrecision || record.get('uomPrecision') || 0,
          record,
        }),
    },
    {
      name: 'itemCodeLov',
      width: 100,
      editor: () => (
        <Lov
          onChange={(data) => {
            const { itemName, itemCode, itemId, uomName, uomCode, uomId } = data || {};
            initDs.current.set('itemNameLov', { itemName, itemCode, itemId });
            initDs.current.set('uomName', uomName);
            initDs.current.set('uomId', uomId);
            initDs.current.set('uomCode', uomCode);
          }}
        />
      ),
    },
    {
      name: 'itemName',
      width: 100,
      editor: true,
    },
    {
      name: 'categoryLov',
      width: 100,
      editor: () => <Lov />,
    },
    {
      name: 'uomLov',
      width: 80,
      editor: () => <Lov onChange={(lovValue) => handleUomPrecision(lovValue)} />,
    },
    {
      name: 'needByDate',
      width: 120,
      editor: () => <DatePicker name="requestDate" />,
    },
    {
      name: 'predictUnitPrice',
      width: 100,
      editor: (record) =>
        precisionEditor({
          record,
          name: 'predictUnitPrice',
          precision: defaultPrecision || record.get('defaultPrecision'),
        }),
      renderer: ({ value }) => (value ? priceNumberRender(value, defaultPrecision) : null),
    },
    {
      name: 'predictEntryAmount',
      width: 100,
      editor: () => <NumberField min={0} />,
    },
    {
      name: 'addressLov',
      width: 240,
      editor: () => (
        <Lov
          onClick={() => {
            toggleModal();
          }}
        />
      ),
    },
    {
      name: 'remark',
      width: 100,
      editor: true,
    },
    {
      name: 'invOrganizationLov',
      width: 100,
      editor: () => <Lov />,
    },
    {
      name: 'attachmentUuid',
      width: 100,
      renderer: ({ record }) => {
        return (
          <a onClick={() => openModal(record)}>
            {intl.get('mallf.common.model.file.upload').d('附件上传')}
          </a>
        );
      },
    },
    {
      name: 'operate',
      width: 80,
      renderer: ({ record }) => {
        return (
          <a
            className="primary-color"
            onClick={() => {
              if (record.toData()._status) {
                record.status = 'add';
                initDs.remove(record);
              } else {
                deleteOMSLines([record.toData()]).then(() => {
                  fetchDetail();
                });
              }
            }}
          >
            {intl.get('hzero.common.status.delete').d('删除')}
          </a>
        );
      },
    },
  ];

  const openModal = (record) => {
    Modal.open({
      destroyOnClose: true,
      title: intl.get('mallf.common.model.file.upload').d('附件上传'),
      okFirst: false,
      closable: true,
      movable: false,
      mask: true,
      className: 'mall-upload-modal',
      children: (
        <UploadFile
          maxSize={20}
          bucketName="private-bucket"
          directory="mall-front"
          attachmentUuid={record.get('attachmentUuid')}
        />
      ),
    });
  };

  const deleteLines = () => {
    const delFetchData = initDs.selected.map((p) => p.toData()).filter((p) => !p._status);
    if (delFetchData.length === 0) {
      initDs.selected.forEach((r) => {
        r.status = 'add';
      });
      initDs.remove(initDs.selected);
    } else {
      deleteOMSLines(delFetchData, manualRequestId).then(() => {
        fetchDetail();
      });
    }
  };

  const DelButton = observer(({ dataSet }) => {
    return (
      <Button
        className="primary-color"
        disabled={dataSet.selected.length === 0}
        onClick={() => {
          deleteLines();
        }}
      >
        <Icon type="delete" />
        {intl.get('hzero.common.status.delete').d('删除')}
      </Button>
    );
  });

  const CopyButton = observer(({ dataSet }) => {
    const disabled = dataSet.selected.length === 0;
    return (
      <Button disabled={disabled} onClick={() => addLine({ copy: true })}>
        <Icon style={!disabled ? { color: getPrimaryColor() } : {}} type="baseline-file_copy" />
        <span className={`${!disabled ? 'primary-color' : ''}`}>
          {intl.get('mallf.common.button.copy.lineinfo').d('复制行信息')}
        </span>
      </Button>
    );
  });

  const addLine = ({ copy }) => {
    if (copy) {
      initDs.selected.forEach((r) => {
        const newData = r.toData();
        delete newData.objectVersionNumber;
        delete newData._token;
        delete newData.manualRequestEntryId;
        delete newData.manualRequestId;
        delete newData.predictEntryAmount;
        delete newData.predictEntryAmountMeaning;
        delete newData.lastUpdateDate;
        delete newData.lastUpdatedBy;
        initDs.create({
          ...newData,
          attachmentUuid: uuid(),
          entryCode: initDs?.toData().length + 1,
          _status: 'create',
        });
      });
    } else {
      initDs.create({
        attachmentUuid: uuid(),
        entryCode: initDs?.toData().length + 1,
        _status: 'create',
      });
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <p className="addPurchase-apply-title">
        <span>{intl.get(`mallf.purchaseDetail.view.myRequestInfo`).d('申请信息')}</span>
        <div style={{ float: 'right' }}>
          <CopyButton dataSet={initDs} />
          <DelButton dataSet={initDs} />
          {/* <Button className="primary-color" disabled={!manualRequestId} onClick={handleImport}>
            {intl.get(`mallf.common.button.import`).d('导入')}
          </Button>
          <Button className="primary-color" disabled={!manualRequestId} onClick={fetchDetail}>
            {intl.get(`hzero.common.button.refresh`).d('刷新')}
          </Button> */}
          <Button onClick={addLine} className="primary-color">
            <Icon type="playlist_add" />
            {intl.get('hzero.common.btn.add').d('新增')}
          </Button>
        </div>
      </p>
      <div style={{ marginBottom: 30 }}>
        {custTable(
          { code: 'MALL.APPLY.OMS.EDIT.APPLYINFO' },
          <Table
            dataSet={initDs}
            scroll={{ x: sum(columns.map((p) => p.width)) }}
            columns={columns}
          />
        )}
        <C7NLov
          modalVisible={{
            visible,
            toggleModal,
          }}
          columnsParams={{ belongTypeList }}
          columns="addressColumns"
          lovOptions={{ displayField: 'fullAddress', valueFeild: 'addressId' }}
          onOk={(_, data) => {
            initDs.current.set('addressLov', {
              addressId: data.addressId,
              address: data.fullAddress,
              regionId: data.regionId,
              mobilePhone: data.mobile,
              email: data.email,
              telphone: data.phone,
              contactName: data.contactName,
              belongType: data.belongType,
            });
          }}
          queryUrl={`${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/{organizationId}/addresss/list/choose?addressType=RECEIVER&enabledFlag=1&companyId=${companyId}&userId=${userId}`}
        />
      </div>
    </div>
  );
}
