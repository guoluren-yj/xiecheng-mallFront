import React, { useEffect } from 'react';
import { Icon, Tooltip } from 'choerodon-ui';
import { Spin } from 'hzero-ui';

import ImageViewer from 'components/ImageViewer';
import { getAttachmentUrl } from 'utils/utils';
import intl from 'utils/intl';
import styles from './index.less';
import useSetState from '@/hooks/useState';
import { fetchFileList } from '@/hooks/useGetFileList';

export default function AttachmentItem(props) {
  const {
    handleRemove, // 删除事件
    itemStyle, // item的样式
    style = {},
    attachmentUuid, // uuid
    bucketName = 'public-bucket', // 桶名 必传
    attachmentList, // 手动传入list
    disabled,
  } = props;
  const [state, setState] = useSetState({
    attachmentList: [],
    previewVisible: false,
    previewImage: '',
  });
  useEffect(() => {
    if (attachmentList) {
      setState({ attachmentList });
    } else if (attachmentUuid) {
      fetchFileList({
        attachmentUuid,
        bucketName,
      }).then((list) => {
        setState({
          attachmentList: list.map((item, index) => {
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
  }, [attachmentUuid, attachmentList]);

  return (
    <div style={style}>
      {state.attachmentList.map((file) => {
        const isImg = /^image\/*/.test(file.type);
        const previewUrl =
          file.downloadUrl || getAttachmentUrl(file.fileUrl || file.url, bucketName);
        const hasUrl = Boolean(file.downloadUrl || file.fileUrl || file.url);
        return (
          <div className={styles['attachment-item']} style={itemStyle}>
            {file.response ? (
              <>
                {isImg && (
                  <>
                    {hasUrl && (
                      <Tooltip
                        placement="top"
                        title={intl.get('hzero.common.button.see').d('预览')}
                      >
                        <a
                          onClick={() => {
                            setState({
                              previewVisible: true,
                              previewImage: previewUrl,
                            });
                          }}
                        >
                          <Icon type="zoom_in" />
                        </a>
                      </Tooltip>
                    )}
                  </>
                )}
                <>
                  {hasUrl && (
                    <Tooltip
                      placement="top"
                      title={intl.get('hzero.common.button.download').d('下载')}
                    >
                      <a href={previewUrl}>
                        <Icon type="get_app" />
                      </a>
                    </Tooltip>
                  )}
                </>
                {hasUrl && (
                  <span>
                    <a href={previewUrl} title={file.name || file.fileName}>
                      {(file.name || file.fileName)?.length > 22
                        ? `${(file.name || file.fileName).slice(0, 22)}...`
                        : file.name || file.fileName}
                    </a>
                  </span>
                )}
                {handleRemove && attachmentUuid && !disabled && (
                  <Icon
                    type="close"
                    className="delete-icon"
                    onClick={() => handleRemove(file, attachmentUuid)}
                  />
                )}
              </>
            ) : (
              <Spin spinning />
            )}
          </div>
        );
      })}
      {state.previewVisible && (
        <ImageViewer
          closeModal={() => {
            setState({ previewVisible: false });
          }}
          imgList={[{ fileUrl: state.previewImage }]}
          index={0}
        />
      )}
    </div>
  );
}
