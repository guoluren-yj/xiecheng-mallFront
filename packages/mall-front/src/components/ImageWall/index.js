import React, { useState } from 'react';

import Link from 'components/Link';
import ImageViewer from 'components/ImageViewer';
import Icons from 'components/Icons';
import Image from 'components/Image';
import intl from 'utils/intl';
import loadingPng from '../../assets/images/upload-img-loading.gif';
import './index.less';

export default function ImageWall(props) {
  const { showPreview = true, listStyle = {}, handleDel, showName } = props;
  const fileList = props.fileList || [];
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState({
    fileList: [],
    index: 0,
  });

  const handlePreview = (file) => {
    const newFileList = fileList.filter((item) => /^image\/*/.test(item.type));
    const index = newFileList.indexOf(file);
    setVisible(true);
    setPreview({
      fileList: newFileList,
      index,
    });
  };

  const setImage = (file) => {
    const showDel = handleDel !== undefined;
    return (
      <>
        {file.status === 'uploading' ? (
          <div className="img-card">
            <img
              className="img-style"
              alt={intl.get('mallf.common.view.uploading').d('上传中')}
              src={loadingPng}
            />
          </div>
        ) : (
          <div className="img-card">
            {showDel && <div className="img-del-btn" onClick={() => handleDel(file)} />}
            {/^image\/*/.test(file.type) ? (
              <>
                {showPreview && (
                  <>
                    <div className="img-hover-mask">
                      <div className="img-view-btn" onClick={() => handlePreview(file)} />
                    </div>
                  </>
                )}
                <Image className="img-style" value={file.url} />
              </>
            ) : (
              <div className="file-style">
                <Icons type="attachment" size="50" />
              </div>
            )}
          </div>
        )}
        {showName && (
          <div
            style={{
              wordBreak: 'break-all',
              overflow: 'hidden',
              fontSize: 14,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            <Link to={file.url} title={file.name}>
              {file.name}
            </Link>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="img-list-wrapper">
      {fileList.map((file) => (
        <div className="img-item" style={listStyle}>
          {setImage(file)}
        </div>
      ))}
      {props.children}
      {visible && (
        <ImageViewer
          closeModal={() => {
            setVisible(false);
          }}
          imgList={preview.fileList}
          index={preview.index}
        />
      )}
    </div>
  );
}
