import { useState, useEffect } from 'react';
import { searchUuidImage } from 'services/api';

const fileObj = {
  name: '',
  percent: 100,
  response: '',
  size: '',
  status: 'done',
  type: '',
  uid: -1,
  url: '',
};

export function fetchFileList({ attachmentUuid, bucketName = 'public-bucket' }) {
  return searchUuidImage(attachmentUuid, bucketName);
}

export default function useGetFileList({ attachmentUuid, bucketName = 'public-bucket' }) {
  const [fileList, setFileList] = useState([]);
  useEffect(() => {
    searchUuidImage(attachmentUuid, bucketName).then(res => {
      if (res) {
        setFileList({
          fileList: res.map((item, index) => {
            return {
              ...fileObj,
              name: item.fileName,
              response: item.fileUrl,
              size: item.fileSize,
              type: item.fileType,
              uid: `${(index + 1) * -1}`,
              url: item.fileUrl,
            };
          }),
        });
      }
    });
  }, []);

  return { fileList };
}
