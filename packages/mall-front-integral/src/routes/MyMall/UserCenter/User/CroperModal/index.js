import React, { useRef, useEffect } from 'react';
import { Modal } from 'hzero-ui';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Upload, Icon } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
// import uuid from 'uuid/v4';

import intl from 'utils/intl';
import useState from 'hooks/useState';
import { fetchEnabledFile, uploadAvatar } from 'services/api';
// import * as HmallConfig from 'utils/api-config';
import { awaitWrap, getOrganizationId, isJSON, getPrimaryColor } from 'utils/utils';
import Swal from 'components/swal';

import styles from './index.less';

const { Dragger } = Upload;
const STORAGE_UNIT = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 2014 * 1024 };
// const attachmentUuid = uuid();
export default function Demo(props) {
  const {
    bucketName = 'public-bucket',
    fn = (e) => e,
    width = 1,
    height = 1,
    callback = (e) => e, // 上传的回调
  } = props;
  const cropper = useRef();
  const [state, setState] = useState({
    visible: false,
    file: {},
    fileList: [],
    imgFormData: {},
    limitData: {}, // 上传限制查询
    saveLoading: false,
  });

  useEffect(() => {
    fn({
      toggle: () => setState((prev) => ({ visible: !prev.visible })),
    });
    fetchLimitData();
  }, []);

  async function fetchLimitData() {
    const [err, data] = await awaitWrap(
      fetchEnabledFile({
        tenantId: getOrganizationId(),
        bucketName,
        directory: 'hiam02',
      })
    );
    if (!err) setState({ limitData: data });
  }

  function beforeUpload(file) {
    const message = validateUploadParams(file);
    if (message) {
      Swal(message);
      setState({
        fileList: [],
        file: {},
        imgFormData: {},
      });
    } else {
      setState({
        fileList: [...state.fileList, file],
        file,
        imgFormData: file,
      });
    }
    return false;
  }

  /**
   * 选择图片后，将图片转换为base64格式预览
   * @param {object} info 文件数据对象，包含file，fileList
   */
  function handleImgChange(info) {
    if (info.file instanceof File) {
      const message = validateUploadParams(info.file);
      const reader = new FileReader();
      reader.readAsDataURL(info.file);
      reader.onload = () => {
        setState({
          uploadImgPreviewUrl: message ? null : reader.result,
          uploadImgName: message ? null : info.file.name,
        });
      };
    }
  }

  /**
   * 校验上传参数
   * 使用时: 如果Boolean(返回的数据), 则不做限制
   */
  function validateUploadParams(f1) {
    const { file: f2, limitData } = state;
    const file = f1 || f2;
    const { fileFormat, storageSize, storageUnit } = limitData;
    if (!fileFormat && !storageSize) {
      // 如果没有查询到桶配置, 那么就不做限制;
      return;
    }

    let flag = true;
    let message;
    if (fileFormat) {
      const fileType = fileFormat.split(',').map((item) => `image/${item}`);
      if (fileType.indexOf() > -1) {
        fileType.push('image/jpeg');
      }
      flag = fileType.indexOf(file.type) > -1;
      message = flag ? '' : intl.get('mallf.common.view.message.fileTypeError').d('文件类型不支持');
    }

    if (storageSize && flag) {
      // 表示文件大小上限，单位：KB
      const fileSize = STORAGE_UNIT[storageUnit] * storageSize;
      flag = fileSize > file.size;
      message = flag
        ? ''
        : intl
            .get('hzero.common.upload.error.size.custom', {
              fileSize: `${storageSize}${storageUnit}`,
            })
            .d(`上传文件大小不能超过: ${storageSize}${storageUnit}`);
    }
    return message;
  }

  /**
   * 保存
   */
  async function onOk() {
    const message = validateUploadParams();
    if (message) {
      Swal(message);
      return;
    }
    setState({
      saveLoading: true,
    });
    const [err, data] = await awaitWrap(
      uploadAvatar({
        organizationId: getOrganizationId(),
        image: state.imgFormData,
        uploadImgName: state.uploadImgName,
        bucketName,
        directory: 'hiam02',
      })
    );
    if (!err) {
      callback(data);
      onCancel();
    } else if (isJSON(data) && JSON.parse(data).failed) {
      Swal(JSON.parse(data).message);
    }
    setState({
      saveLoading: false,
    });
  }

  function handleAvatarCrop() {
    const imgCanvas = cropper.current.getCroppedCanvas({
      width: 256,
      height: 256,
      imageSmoothingQuality: 'high',
    });
    // IE toBlob兼容方案，手动实现toBlob，兼容IE10及以上
    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value(cb, type, quality) {
          // atob将编码为base64后的图片数据解码为二进制数据
          const binStr = atob(this.toDataURL(type, quality).split(',')[1]);
          const len = binStr.length;
          // 使用二进制数组存放数据
          const arr = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            // 将指定位置的数据设置为Unicode编码，存放在二进制数组中
            arr[i] = binStr.charCodeAt(i);
          }
          // 最后返回Blob类型的数据
          cb(new Blob([arr], { type: type || 'image/png' }));
        },
      });
    }
    imgCanvas.toBlob((blob) => {
      setState({ imgFormData: blob });
    });
  }

  function onCancel() {
    setState({
      visible: false,
      fileList: [],
      file: {},
    });
  }

  return (
    <Modal
      destroyOnClose
      width={700}
      visible={state.visible}
      wrapClassName="avatar-uploader-Modal"
      title={intl.get(`mallf.myMall.model.userCenter.updateHead`).d('修改头像')}
      onCancel={onCancel}
      onOk={onOk}
      className={styles.uploadHeadshotModal}
      footer={
        state.fileList.length === 0
          ? [
            <Button key="back" onClick={onCancel}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>,
            ]
          : [
            <Button key="back" onClick={onCancel}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>,
            <Button
              color="primary"
              key="submit"
              type="primary"
              onClick={onOk}
              loading={state.saveLoading}
            >
              {intl.get('mallf.userCenter.button.save').d('保存')}
            </Button>,
            ]
      }
    >
      {state.fileList.length === 0 ? (
        <div
          style={{
            width: 400,
            height: 200,
            marginLeft: '50%',
            transform: 'translateX(-50%)',
            marginTop: 53,
          }}
        >
          <Dragger
            className={styles['avatar-uploader']}
            name="file"
            accept="image/*"
            beforeUpload={(file) => beforeUpload(file)}
            onChange={(info) => handleImgChange(info)}
            fileList={state.fileList}
          >
            <p className="c7n-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="c7n-upload-text">
              {intl
                .get('mallf.userCenter.view.message.uploadTips')
                .d('点击或将图片拖到此区域上传图片')}
            </p>
            {
              <p className="c7n-upload-hint">
                {state.limitData.fileFormat && (
                  <span>
                    {intl
                      .get('mallf.common.view.value.uploadtype', {
                        value: state.limitData.fileFormat,
                      })
                      .d(`图片支持${state.limitData.fileFormat}格式`)}
                  </span>
                )}
                {state.limitData.storageSize && (
                  <span>
                    {intl
                      .get('mallf.common.view.notOver.valueSize', {
                        value: `${state.limitData.storageSize}${state.limitData.storageUnit}`,
                      })
                      .d(`不能大于${state.limitData.storageSize}${state.limitData.storageUnit}`)}
                  </span>
                )}
              </p>
            }
          </Dragger>
        </div>
      ) : (
        <div className={styles['cropper-box']}>
          <div style={{ display: 'inline-block' }}>
            <Cropper
              preview=".img-preview"
              ref={cropper}
              src={state.uploadImgPreviewUrl}
              style={{ height: 225, width: 420 }}
              aspectRatio={width / height}
              guides={false}
              crop={handleAvatarCrop}
            />
          </div>
          <div className={styles['yulan-box']}>
            <p>{intl.get('mallf.common.view.userImage.preview').d('头像预览')}</p>
            <div className="img-preview" style={{ width: 80, height: 80 }} />
            <p>80 x 80</p>
            <div className="img-preview" style={{ width: 40, height: 40, marginLeft: 20 }} />
            <p>40 x 40</p>
          </div>
          <div>
            <span style={{ color: '#333' }}>
              {intl
                .get('mallf.common.view.changeyourImage')
                .d('您可以在此裁剪、旋转图片，然后点击“保存”完成头像的修改')}
            </span>
            <Upload
              name="file"
              accept="image/*"
              beforeUpload={(file) => beforeUpload(file)}
              onChange={(info) => handleImgChange(info)}
              showUploadList={false}
            >
              <Button funcType="flat" style={{ marginLeft: 8 }}>
                <Icon style={{ color: getPrimaryColor() }} type="file_upload" />{' '}
                <span style={{ color: getPrimaryColor(), fontSize: 13 }}>
                  {intl.get('mallf.userCenter.view.option.selectPic').d('重新上传')}
                </span>
              </Button>
            </Upload>
          </div>
        </div>
      )}
    </Modal>
  );
}
