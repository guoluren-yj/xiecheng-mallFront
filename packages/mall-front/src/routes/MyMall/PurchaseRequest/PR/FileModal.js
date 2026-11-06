import React, { useState, useEffect } from 'react';
import { Spin, Modal } from 'hzero-ui';

import intl from 'utils/intl';
import { fetchAnnex } from 'services/purchaseRequestService';
import { getAttachmentUrl } from 'utils/utils';
import ImageViewer from 'components/ImageViewer';

import csv from '@/assets/images/file/csv.png';
import docx from '@/assets/images/file/docx.png';
import rar from '@/assets/images/file/rar.png';
import zip from '@/assets/images/file/zip.png';
import xls from '@/assets/images/file/xls.png';
import xlsx from '@/assets/images/file/xlsx.png';
import pdf from '@/assets/images/file/pdf.png';
import jpg from '@/assets/images/file/jpg.png';
import png from '@/assets/images/file/png.png';
import style from './file.less';

function FileModal(props) {
  const [loading, setLoading] = useState(false);
  const [viewImgVisible, setVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [index, setIndex] = useState(0);
  const [viewList, setViewList] = useState([]);
  const { visible, uuid, onClose = (e) => e } = props;

  useEffect(() => {
    setLoading(true);
    fetchAnnex(uuid)
      .then((res) => {
        const list = (res || []).map((item) => {
          const tmpUrl = getAttachmentUrl(item.fileUrl, 'private-bucket', 'sprm-pr');
          return {
            ...item,
            url: tmpUrl,
            name: item.fileName,
            response: item.fileUrl,
            size: item.fileSize,
            type: item.fileType,
          };
        });
        setFileList(list);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getIconByType = (name) => {
    const ext = name.split('.').pop();
    const typeIcon = [
      {
        ext: 'rar',
        icon: rar,
      },
      {
        ext: 'zip',
        icon: zip,
      },
      {
        ext: 'csv',
        icon: csv,
      },
      {
        ext: 'pdf',
        icon: pdf,
      },
      {
        ext: 'docx',
        icon: docx,
      },
      {
        ext: 'xls',
        icon: xls,
      },
      {
        ext: 'xlsx',
        icon: xlsx,
      },
      {
        ext: 'doc',
        icon: docx,
      },
      {
        ext: 'png',
        icon: png,
      },
      {
        ext: 'jpg',
        icon: jpg,
      },
      {
        ext: 'jpeg',
        icon: jpg,
      },
    ];
    const type = typeIcon.find((item) => item.ext === ext.toLocaleLowerCase());
    return <img className="img-style" alt="" src={type?.icon} style={{ width: 28, height: 30 }} />;
  };

  const handleViewImg = (fileUrl, i) => {
    setViewList([fileUrl]);
    setIndex(i);
    setVisible(true);
  };

  return (
    <Modal
      title={intl.get('mallf.myRequest.view.check.attachment').d('查看附件')}
      onCancel={onClose}
      footer={null}
      visible={visible}
      destroyOnClose
      width={784}
      wrapClassName={`hmall-content-Modal ${style['file-modal']}`}
    >
      <Spin spinning={loading}>
        <div className="file-list-wrapper">
          {fileList.map((f, i) => (
            <div className="file-line" key={f.url}>
              <div className="file-info">
                {getIconByType(f.name)}
                <span>{f.name}</span>
              </div>
              <div className="file-options">
                <a
                  disabled={!/^image\/*/.test(f.type)}
                  onClick={() => handleViewImg(f.url, i)}
                  className={`${!/^image\/*/.test(f.type) ? 'disable' : ''}`}
                >
                  {intl.get('hzero.common.button.see').d('预览')}
                </a>
                <a href={f.url}>{intl.get('hzero.common.button.download').d('下载')}</a>
              </div>
            </div>
          ))}
          {viewImgVisible && (
            <ImageViewer
              closeModal={() => {
                setVisible(false);
              }}
              imgList={viewList}
              index={index}
            />
          )}
        </div>
      </Spin>
    </Modal>
  );
}

export default FileModal;
