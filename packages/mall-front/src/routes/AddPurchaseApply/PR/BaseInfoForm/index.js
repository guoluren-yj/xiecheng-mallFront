import React, { useEffect, useState, useMemo } from 'react';
import {
  Form,
  Select,
  TextField,
  DatePicker,
  Lov,
  DataSet,
  TextArea,
  Attachment,
} from 'choerodon-ui/pro';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import NewLov from 'components/NewLov';
import HmallConfig from 'utils/api-config';
import ds from './ds';
import { accept } from 'utils/constants';
import useRequest from '@/hooks/useRequest';

export default function BaseInfoForm(props) {
  const initDs = useMemo(() => new DataSet(ds()), []);
  const { onDsRef, setTableInitData, custForm } = props;
  const [visible, setVisible] = useState(false);
  const { companyId, userId, organizationId } = getUserConfigInfo();
  const { resData: belongTypeList } = useRequest({
    url: `${HmallConfig.apiGateway}/hpfm/v1/${organizationId}/lovs/value`,
    query: { lovCode: 'SMAL.ADDRESS_BELONG_TYPE_ONLYCOMPANY' },
  });

  const toggleModal = () => {
    setVisible(!visible);
  };

  const {
    custWebConfig: { manualFileSize = 100 },
  } = getUserConfigInfo();

  useEffect(() => {
    onDsRef(initDs);
  }, []);
  const maxSize = `${manualFileSize}M`;
  const attProps = {
    newLine: true,
    name: 'attachmentUuid',
    sortable: true,
    bucketName: 'private-bucket',
    bucketDirectory: 'mall-front',
    viewMode: 'list',
    attachmentUUID: initDs.current?.get('attachmentUuid') || uuidv4(),
    value: initDs.current?.get('attachmentUuid'),
    onChange: () => {},
    style: { paddingLeft: 0 },
    accept,
    help: intl
      .get('mallf.common.view.attProps.help', { accept, maxSize })
      .d(`支持${accept.join(',')}格式，且不能大于${maxSize}`),
    fileSize: 1024 * 1024 * manualFileSize,
  };
  // const formData = initDs.current ? initDs.current.toData() : {};
  return (
    <div style={{ marginBottom: 10 }}>
      <p className="addPurchase-apply-title">
        {intl.get(`mallf.purchaseDetail.view.baseInfo`).d('基本信息')}
      </p>
      {custForm(
        { code: 'MALL.APPLY.EDIT.BASICINFO' },
        <Form dataSet={initDs} labelLayout="float" columns={3}>
          <Select name="manualRequestTypeSelect" clearButton={false} />
          <Lov
            name="companyLov"
            clearButton={false}
            onChange={() => {
              initDs.current.set('ouId', null);
              initDs.current.set('ouName', null);
              initDs.current.set('purchaseOrgId', null);
              initDs.current.set('purchaseOrgName', null);
            }}
          />
          <Lov
            name="ouLov"
            onChange={(data) => {
              const { ouId } = data || {};
              setTableInitData(ouId);
              initDs.current.set('purchaseOrgId', null);
              initDs.current.set('purchaseOrgName', null);
            }}
          />
          <Lov
            name="purchaseOrgLov"
            onChange={() => {
              initDs.current.set('purchaseAgentName', null);
              initDs.current.set('purchaseAgentId', null);
            }}
          />
          <Lov name="purchaseAgentLov" />
          <DatePicker name="requestDate" />
          <TextField name="prRequestedName" />
          <Lov
            name="addressLov"
            onClick={() => {
              toggleModal();
            }}
          />

          <TextArea name="remark" newLine colSpan={2} />
          <Attachment {...attProps} />
        </Form>
      )}
      <NewLov
        modalVisible={{
          visible,
          toggleModal,
        }}
        columnsParams={{ belongTypeList }}
        columns="addressColumns"
        lovOptions={{ displayField: 'fullAddress', valueFeild: 'addressId' }}
        onOk={(value, data) => {
          initDs.current.set('addressLov', {
            addressId: data.addressId,
            address: data.fullAddress,
            regionId: data.regionId,
          });
        }}
        queryUrl={`${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/{organizationId}/addresss/list/choose?addressType=RECEIVER&enabledFlag=1&companyId=${companyId}&userId=${userId}`}
      />
    </div>
  );
}
