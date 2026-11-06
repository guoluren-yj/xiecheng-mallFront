import React, { useEffect } from 'react';
import { Row, Upload, Button, Icon, Modal } from 'choerodon-ui';

import intl from 'utils/intl';
import swalAlert from 'components/swal';
import { getOrganizationId, getHeader, getAttachmentUrl } from 'utils/utils';
import { deleteUuidImage } from 'services/api';
import AttachmentItem from 'components/AttachmentItem';
import HmallConfig from 'utils/api-config';
import useSetState from '@/hooks/useState';
import { fetchFileList } from '@/hooks/useGetFileList';

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

export default function UploadFile(props) {
  const { attachmentUuid, bucketName, directory, maxSize, onChange, uploadText } = props;
  const [state, setState] = useSetState({
    fileList: [],
    previewVisiblet: '',
    previewImage: '',
  });
  const { previewImage, previewVisiblet, fileList } = state;
  const organizationId = getOrganizationId();

  useEffect(() => {
    if (attachmentUuid) {
      fetchFileList({
        attachmentUuid,
        bucketName,
      }).then((list) => {
        setState({
          fileList: list.map((item, index) => {
            return {
              name: item.fileName,
              response: item.fileUrl,
              size: item.fileSize,
              type: item.fileType,
              uid: `${(index + 1) * -1}`,
              url: item.fileUrl,
              downloadUrl: getAttachmentUrl(item.fileUrl, bucketName),
            };
          }),
        });
      });
    }
  }, [attachmentUuid]);

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
        msg: intl.get('mallf.common.validate.fileExtNotUpload').d('不支持上传该类型附件'),
        resetUploadErr: isLastFile,
      });
      return false;
    }
    if (file.name.includes('=') && /[\u4E00-\u9FA5]+/.test(file.name)) {
      uploadErrMsg({
        msg: intl
          .get('mallf.common.validate.fileName.notChineseAndEqual')
          .d('文件名称不合法，中文与=不能同时存在'),
        resetUploadErr: isLastFile,
      });
      return false;
    }
    if (file.name.includes('%') || file.name.includes('+')) {
      uploadErrMsg({
        msg: intl
          .get('mallf.common.validate.fileName.notPlusOrPercent')
          .d('文件名称不合法，文件名包含+或%'),
        resetUploadErr: isLastFile,
      });
      return false;
    }
    if (file.size > maxSize * 1024 * 1024) {
      uploadErrMsg({
        msg: intl
          .get('mallf.common.validate.fileSizeOverValueM', { value: maxSize })
          .d(`文件大小超过${maxSize}M`),
        resetUploadErr: isLastFile,
      });
      return false;
    }
    if (state.fileList.length + tmpList.length > 9) {
      uploadErrMsg({
        msg: intl.get('mallf.common.validate.fileCountMax').d('附件上传数量已至上限'),
        resetUploadErr: isLastFile,
      });
      return false;
    }
    return tmpList.some((t) => t.uid === file.uid);
  };

  const handleChange = ({ fileList: list }) => {
    const mergeList = [...list];
    for (let i = 0; i < mergeList.length - 1; i++) {
      for (let j = i + 1; j < mergeList.length; j++) {
        if (mergeList[i].uid === mergeList[j].uid) {
          if (mergeList[i].status === 'done') {
            mergeList.splice(j, 1);
            j--;
          } else if (mergeList[j].status === 'done') {
            mergeList.splice(i, 1);
            i--;
          }
        }
      }
    }
    const filterFailList = mergeList.filter((f) => !f?.response?.failed);
    const failList = mergeList.filter((f) => f?.response?.failed);

    if (failList.length > 0) {
      swalAlert(failList[0].message);
    }

    const newFileList = filterFailList.map((item) => {
      const tmpFile = item;
      // if(item)
      if (item.response && !item.response.failed) {
        tmpFile.url = item.response;
      }
      return tmpFile;
    });

    const tmpFileList = newFileList.filter((item) => item.status !== 'error' && item.status);
    if (typeof onChange === 'function') {
      onChange(tmpFileList); // 上传回调
    }
    setState({
      fileList: tmpFileList,
    });
  };

  const handleRemove = (file, uid) => {
    let newFileList = [...state.fileList];
    newFileList = newFileList.filter((item) => item.uid !== file.uid);
    setState({
      fileList: newFileList,
    });
    deleteUuidImage(file.url, uid, bucketName);
    onChange(newFileList);
  };

  const uploadProps = {
    action: `${HmallConfig.apiGateway}/hfle/v1/${organizationId}/files/attachment/multipart`,
    multiple: true,
    headers: getHeader({}),
    name: 'file',
    accept: extList.join(','),
    showUploadList: false,
    data: {
      bucketName,
      attachmentUUID: attachmentUuid,
      directory: 'mall-front',
    },
    onChange: handleChange,
    beforeUpload: (file, list) => beforeUpload(file, list),
    onPreview: (file) => {
      if (/^image\/*/.test(file.type)) {
        setState({
          previewVisiblet: true,
          previewImage: file.url || file.thumbUrl,
        });
      } else {
        swalAlert(intl.get('mallf.common.file.notSupport.preview').d('文件暂不支持预览'));
        return false;
      }
    },
    onRemove: (file) => {
      handleRemove(file, attachmentUuid);
    },
  };

  return (
    <>
      <Row>
        <Upload {...uploadProps} fileList={fileList}>
          <Button style={{ color: '#333' }}>
            <Icon type="file_upload" />{' '}
            {uploadText || intl.get('mallf.common.model.file.upload').d('附件上传')}
          </Button>
        </Upload>
        <AttachmentItem
          attachmentUuid={attachmentUuid}
          handleRemove={handleRemove}
          attachmentList={fileList}
          bucketName="private-bucket"
        />
        <div style={{ marginTop: 16 }}>
          {intl
            .get('mallf.common.model.value.requirementsForUploadingFiles', {
              value: maxSize,
              type: extList.join(' '),
            })
            .d(`文件大小${maxSize}M以内，支持扩展名：${extList.join(' ')}`)}
        </div>
      </Row>
      <Modal
        visible={previewVisiblet}
        footer={null}
        onCancel={() => {
          setState({
            previewVisiblet: false,
            previewImage: '',
          });
        }}
      >
        <img
          alt=""
          style={{ width: '100%' }}
          src={getAttachmentUrl(previewImage, bucketName, directory)}
        />
      </Modal>
    </>
  );
}
