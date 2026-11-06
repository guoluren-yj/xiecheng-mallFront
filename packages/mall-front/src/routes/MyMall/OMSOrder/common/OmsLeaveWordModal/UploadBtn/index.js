import React from 'react';
import { Button, Upload, Tooltip } from 'choerodon-ui';

import intl from 'utils/intl';
import swalAlert from 'components/swal';
import { getHeader, getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';

import styles from './index.less';

const extList = [
  '.rar',
  '.zip',
  '.doc',
  '.docx',
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.xls',
  '.xlsx',
  '.csv',
];
let uploadErr = false;

export default function UploadBtn(props) {
  const { maxSize = 5, uploadCallBack = (e) => e, setLoading = (e) => e } = props;
  const { organizationId } = getUserConfigInfo();

  const uploadErrMsg = ({ msg, resetUploadErr }) => {
    if (!uploadErr) {
      uploadErr = !uploadErr;
      swalAlert(msg);
    }
    if (resetUploadErr) {
      uploadErr = false;
    }
  };

  const getExt = (name) => {
    const attr = name.split('.');
    return `.${attr[attr.length - 1].toLocaleLowerCase()}`;
  };

  const beforeUpload = (file, list) => {
    const tmpList = [...list];
    const ext = getExt(file.name);
    const isLastFile = list[list.length - 1].uid === file.uid;
    if (!extList.includes(ext)) {
      uploadErrMsg({
        msg: intl.get('mallf.myOrder.validate.fileExtNotUpload').d('不支持上传该类型附件'),
        resetUploadErr: isLastFile,
      });
      return false;
    }
    if (file.name.includes('=') && /[\u4E00-\u9FA5]+/.test(file.name)) {
      uploadErrMsg({
        msg: intl
          .get('mallf.myOrder.validate.fileName.notChineseAndEqual')
          .d('文件名称不合法，中文与=不能同时存在'),
        resetUploadErr: isLastFile,
      });
      return false;
    }
    if (file.name.includes('%') || file.name.includes('+')) {
      uploadErrMsg({
        msg: intl
          .get('mallf.myOrder.validate.fileName.notPlusOrPercent')
          .d('文件名称不合法，文件名包含+或%'),
        resetUploadErr: isLastFile,
      });
      return false;
    }
    if (file.size > maxSize * 1024 * 1024) {
      uploadErrMsg({
        msg: intl
          .get('mallf.myOrder.validate.fileSizeOverValueM', { value: maxSize })
          .d(`文件大小超过${maxSize}M`),
        resetUploadErr: isLastFile,
      });
      return false;
    }
    return tmpList.some((t) => t.uid === file.uid);
  };

  const handleChange = ({ file, fileList }) => {
    const { status, error } = file || {};
    if (status === 'uploading') {
      setLoading(true);
    }
    if (status === 'done') {
      const fileInfo = fileList?.[0] || file;
      uploadCallBack(fileInfo);
      setLoading(false);
    }
    if (error) {
      swalAlert(intl.get('mallf.myOrder.view.uploadErr').d('上传出错'));
      setLoading(false);
    }
  };

  const uploadProps = {
    action: `${HmallConfig.apiGateway}/hfle/v1/${organizationId}/files/multipart`,
    // multiple: true,
    headers: getHeader({ method: 'POST', type: 'FORM', processData: false, dataType: 'text' }),
    name: 'file',
    accept: extList.join(','),
    showUploadList: false,
    data: {
      bucketName: 'private-bucket',
      directory: 'mall-front',
    },
    onChange: handleChange,
    beforeUpload: (file, list) => beforeUpload(file, list),
  };
  return (
    <Tooltip
      title={intl.get('mallf.myOrder.upload.tooltip').d('附件大小不能大于10M')}
      placement="top"
    >
      <div style={{ marginLeft: 'auto', marginRight: 10 }}>
        <Upload {...uploadProps}>
          <Button className={styles['upload-attachment-btn']}>
            {intl.get('mallf.myOrder.model.file.upload').d('附件上传')}
          </Button>
        </Upload>
      </div>
    </Tooltip>
  );
}
