import React, { useState } from 'react';
import { Upload } from 'hzero-ui';
import uuid from 'uuid/v4';

import { deleteUuidImage } from 'services/api';
import * as HmallConfig from 'utils/api-config';
import { getOrganizationId, getHeader } from 'utils/utils';

import ImageWall from 'components/ImageWall';

export default function UploadList(props) {
  const { maxImgNum = 9999999999, attachmentUUID = uuid(), uploadConfig, style } = props;
  const [imageList, setImageList] = useState([]);

  const handleChange = ({ fileList }) => {
    let mergeList = [...fileList];
    mergeList = mergeList.filter((item) => /^image\/*/.test(item.type));
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

    const newFileList = mergeList.map((item) => {
      const tmpFile = item;
      if (item.response && !item.response.failed) {
        tmpFile.url = item.response;
      }
      return tmpFile;
    });

    const tmpFileList = newFileList.filter((item) => item.status !== 'error' && item.status);

    setImageList(tmpFileList);
  };

  const defaultHandleDel = (file) => {
    let newFileList = [...imageList];
    newFileList = newFileList.filter((item) => item.uid !== file.uid);
    setImageList(newFileList);
    deleteUuidImage(file.url, attachmentUUID);
  };

  const beforeUpload = (file, fileList) => {
    const count = maxImgNum - imageList.length;
    if (/^image\/*/.test(file.type)) {
      const tmpList = [...fileList];
      tmpList.filter((item) => /^image\/*/.test(item.type));
      if (tmpList.length > count) {
        tmpList.splice(count, tmpList.length - count);
      }
      for (let i = 0; i < tmpList.length; i++) {
        if (file.uid === fileList[i].uid) {
          return true;
        }
      }
      file.status = 'error'; // eslint-disable-line
      return false;
    } else {
      file.status = 'error'; // eslint-disable-line
      return false;
    }
  };

  const uploadProps = {
    action: `${HmallConfig.apiGateway}/hfle/v1/${getOrganizationId()}/files/attachment/multipart`,
    onChange: handleChange,
    multiple: true,
    headers: getHeader({}),
    name: 'file',
    accept: 'image/*',
    showUploadList: false,
    data: { bucketName: 'public-bucket', directory: 'mall-upload', attachmentUUID },
    ...uploadConfig,
    beforeUpload,
  };

  return (
    <ImageWall listStyle={style} handleDel={defaultHandleDel} fileList={imageList}>
      <div className="img-item">
        <Upload {...uploadProps} fileList={imageList}>
          {imageList.length < maxImgNum && <div className="upload-btn" style={style} />}
        </Upload>
      </div>
    </ImageWall>
  );
}
