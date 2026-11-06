import React from 'react';
import { Form, Lov, TextField, TextArea, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import { accept } from 'utils/constants';
import { OPENCART_REQ_HEADER_CODE } from 'utils/customizeCode';

function HeaderForm({ customizeForm, dataSet }) {
  const {
    custWebConfig: { purchasFileSize = 100 },
  } = getUserConfigInfo();
  return (
    <div className="open-cart-form">
      {customizeForm(
        { code: OPENCART_REQ_HEADER_CODE },
        <Form dataSet={dataSet} labelLayout="float" columns={3}>
          <Lov name="requestTypeLov" />
          <TextField name="createByName" />
          <Lov name="handleByLov" />
          <TextArea name="remark" rows={1} />
          <Attachment
            name="attachmentUuid"
            sortable
            accept={accept}
            bucketName="private-bucket"
            bucketDirectory="mall-front"
            viewMode="list"
            showValidation="newLine"
            fileSize={1024 * 1024 * purchasFileSize}
            help={intl
              .get('mallf.common.view.attProps.help', {
                accept,
                maxSize: `${purchasFileSize}M`,
              })
              .d(`支持${accept}格式，且不能大于${`${purchasFileSize}M`}`)}
          />
          <Attachment
            name="outerAttachmentUuid"
            sortable
            accept={accept}
            bucketName="private-bucket"
            bucketDirectory="mall-front"
            viewMode="list"
            showValidation="newLine"
            fileSize={1024 * 1024 * purchasFileSize}
            help={intl
              .get('mallf.common.view.attProps.help', {
                accept,
                maxSize: `${purchasFileSize}M`,
              })
              .d(`支持${accept}格式，且不能大于${`${purchasFileSize}M`}`)}
          />
        </Form>
      )}
    </div>
  );
}

export default HeaderForm;
