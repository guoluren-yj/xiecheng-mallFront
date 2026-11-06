import React, { useState, useEffect } from 'react';
import { Modal, Upload } from 'hzero-ui';

import { searchUuidImage, deleteUuidImage } from 'services/api';
import intl from 'utils/intl';
import * as Hmall from 'utils/utils';
import * as HmallConfig from 'utils/api-config';
import swalAlert from 'components/swal';
import ImageWall from 'components/ImageWall';
import styles from './index.less';

export default function FileUploader(props) {
  const [imgList, setImgList] = useState([]);
  const { attachmentUuid, visible, toggleUploadModal, bucketName = 'public-bucket' } = props;
  const organizationId = Hmall.getOrganizationId();
  /**
   * imgList改变，将重新render外层img
   */
  useEffect(() => {
    const { renderPreviewList = e => e } = props;
    const tmpFileList = imgList.filter(item => item.status === 'done');
    renderPreviewList(tmpFileList);
  }, [imgList]);

  useEffect(() => {
    if (visible) {
      searchUuidImage(attachmentUuid).then((res = []) => {
        const newList = changeFileList(res);
        setImgList(newList);
      });
    }
  }, [visible]);

  /**
   *格式化已经上传的文件列表
   *
   * @param {*} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   * @memberof UploadModal
   */
  const changeFileList = response => {
    return response.map((res, index) => {
      return {
        uid: index + 1,
        name: res.fileName,
        status: 'done',
        url: res.fileUrl,
      };
    });
  };

  /**
   * 删除图片
   */
  const onRemove = file => {
    const newList = imgList.filter(item => item.uid !== file.uid);
    setImgList(newList);
    deleteUuidImage(file.url, attachmentUuid);
  };

  const beforeUpload = file => {
    if (file.size > 2 * 1024 * 1024) {
      swalAlert(intl.get(`mallf.saleAppli.view.imageOutOfSize`).d('图片大小超出尺寸'));
      return false;
    }
  };

  const onChange = ({ file, fileList }) => {
    let list = [...fileList];
    if (file.status === 'done') {
      const { response } = file;
      if (response && response.failed !== true) {
        list = fileList.map(f => {
          if (f.uid === file.uid && file.size < 2 * 1024 * 1024) {
            // eslint-disable-next-line
            f.url = f.response;
            // eslint-disable-next-line no-param-reassign
            f.thumbUrl = f.response;
          }
          return f;
        });
      } else {
        swalAlert(response.message);
      }
    } else if (file.status === 'error') {
      list = fileList.filter(f => {
        return f.status !== 'error';
      });
    }
    // 去重
    const mergeList = [...imgList, ...list];
    for (let i = 0; i < mergeList.length - 1; i++) {
      for (let j = i + 1; j < mergeList.length; j++) {
        if (mergeList[i].uid === mergeList[j].uid || mergeList[j].size > 2 * 1024 * 1024) {
          mergeList.splice(j, 1);
          j--;
        }
      }
    }
    const newList = mergeList.filter(item => item.size < 2 * 1024 * 1024 || !item.size);
    setImgList(newList);
  };

  return (
    <Modal
      destroyOnClose
      wrapClassName="hmall-content-Modal"
      width={936}
      title={intl.get(`mallf.saleAppli.view.informationUpload`).d('信息上传')}
      visible={visible}
      footer={null}
      onCancel={toggleUploadModal}
    >
      <div className="upload-container">
        <div className={styles['upload-content']}>
          <div className={styles['content-title']}>
            <Upload
              name="file"
              accept="image/*"
              data={{ bucketName, directory: 'mall-upload', attachmentUUID: attachmentUuid }}
              className={styles['choose-btn']}
              action={`${HmallConfig.apiGateway}/hfle/v1/${organizationId}/files/attachment/multipart`}
              multiple
              onChange={onChange}
              showUploadList={false}
              headers={Hmall.getHeader({})}
            >
              {intl.get(`mallf.saleAppli.view.selectUploadImage`).d('请选择上传图片')}
            </Upload>
            <span className={styles['upload-wainning']}>
              {intl
                .get(`mallf.saleAppli.view.imgRestriction`)
                .d('每张图片大小不超过2M，支持bmp,gif,jpg,png,jpeg格式文件')}
            </span>
          </div>
          <div className={styles['content-img-list']}>
            <ImageWall
              handleDel={onRemove}
              fileList={imgList}
              listStyle={{ width: 118, height: 118, margin: 8 }}
            >
              <div className={styles['choose-icon-container']}>
                <Upload
                  name="file"
                  accept="image/*"
                  data={{ bucketName, directory: 'mall-upload', attachmentUUID: attachmentUuid }}
                  action={`${HmallConfig.apiGateway}/hfle/v1/${organizationId}/files/attachment/multipart`}
                  multiple
                  headers={Hmall.getHeader({})}
                  fileList={imgList}
                  onChange={onChange}
                  onRemove={onRemove}
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                >
                  {/*
                      listType="picture-card"
                      showUploadList={{
                        showRemoveIcon: true,
                        showPreviewIcon: false,
                        showDownloadIcon: false,
                        removePopConfirmTitle: `${intl
                          .get(`mallf.saleAppli.view.saleAfterApplication.confirmDelete`)
                          .d('确定删除？')}`,
                      }} */}
                  <i className={styles['choose-icon']} />
                </Upload>
              </div>
            </ImageWall>
          </div>
        </div>
      </div>
    </Modal>
  );
}
