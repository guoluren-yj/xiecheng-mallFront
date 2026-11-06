import React, { useEffect, useState } from 'react';
import { Modal, Button, Spin, Tooltip, Icon } from 'choerodon-ui';
import moment from 'moment';
import { isEmpty } from 'lodash';

import Icons from 'components/Icons';
import Image from 'components/Image';
import { getAttachmentUrl } from 'utils/utils';
import intl from 'utils/intl';
import { DEFAULT_TIME_FORMAT } from 'utils/constants';
import ImageViewer from 'components/ImageViewer';
import { fetchOMSLeaveWordService, sendOMSLeaveWordService } from 'services/orderCenterService';
import styles from './index.less';
import UploadBtn from './UploadBtn';

const { Sidebar } = Modal;
export default function LeaveWordModal(props) {
  const { leaveWordVisible, setState, srmOrderId, order } = props;
  const [previewVisible, setPreviewVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sendMessage, setSendMessage] = useState('');
  const [leaveWordList, setLeaveWordList] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  useEffect(() => {
    fetchLeaveWord();
  }, []);

  const fetchLeaveWord = () => {
    setFetchLoading(true);
    fetchOMSLeaveWordService({
      srmOrderId,
      page: -1,
      purchaseCompanyId: order?.proxySupplierCompanyId,
    })
      .then((res) => {
        if (res) {
          setLeaveWordList(res.content || []);
        }
      })
      .finally(() => {
        setFetchLoading(false);
      });
  };

  useEffect(() => {
    if (document.getElementById('leave-word--scroll-body')) {
      document.getElementById('leave-word-content').scrollTop = document.getElementById(
        'leave-word--scroll-body'
      ).offsetHeight;
    }
  }, [leaveWordList]);

  const handleSend = () => {
    if (isEmpty(sendMessage.trim())) return false;
    setSendLoading(true);
    const params = {
      message: sendMessage,
      poHeaderId: srmOrderId,
    };
    sendOMSLeaveWordService(params)
      .then((res) => {
        if (res) {
          setSendMessage('');
          fetchLeaveWord();
        }
      })
      .finally(() => {
        setSendLoading(false);
      });
  };

  const uploadCallBack = ({ response, name }) => {
    const params = {
      message: name,
      poHeaderId: srmOrderId,
      attachmentUrl: response,
      attachmentName: name,
    };
    setSendLoading(true);
    sendOMSLeaveWordService(params)
      .then((res) => {
        if (res) {
          fetchLeaveWord();
        }
      })
      .finally(() => {
        setSendLoading(false);
      });
  };
  const renderWord = () => {
    return leaveWordList.map((word) => {
      const {
        createdByName,
        creationDate,
        message,
        userCampCode,
        attachmentUrl,
        attachmentName,
      } = word;
      const isImg = /.(png|jpg|jpeg|gif)$/g.test(attachmentUrl);
      const previewUrl = attachmentUrl ? getAttachmentUrl(attachmentUrl, 'private-bucket') : null;
      return (
        <div className="word-body">
          <div
            className={`word-title ${userCampCode === 'PURCHASER' ? 'purchaser-word-title' : ''}`}
          >
            <span className="word-title-name">{createdByName}</span>
            <Tooltip title={creationDate}>
              <span className="word-title-time">
                {moment(creationDate).format(DEFAULT_TIME_FORMAT)}
              </span>
            </Tooltip>
          </div>
          <div
            className={`word-message ${userCampCode === 'PURCHASER' ? 'purchaser-message' : ''}`}
          >
            {!attachmentUrl && message ? (
              <p>{message}</p>
            ) : (
              <>
                {attachmentUrl && (
                  <>
                    {isImg ? (
                      <>
                        <Image
                          onClick={() => {
                            const imgList = leaveWordList
                              .filter((p) => /.(png|jpg|jpeg|gif)$/g.test(p.attachmentUrl))
                              .map((p) => ({
                                attachmentUrl: p.attachmentUrl,
                                fileUrl: getAttachmentUrl(p.attachmentUrl, 'private-bucket'),
                              }));
                            setPreviewVisible(true);
                            setFileList(imgList);
                            setCurrentIndex(
                              imgList.map((p) => p.attachmentUrl).indexOf(attachmentUrl)
                            );
                          }}
                          height={80}
                          value={previewUrl}
                        />
                      </>
                    ) : (
                      <>
                        <a href={previewUrl}>
                          <Icon
                            type="attach_file"
                            style={{ marginRight: 2, verticalAlign: 'bottom' }}
                          />
                          <span
                            className="text-overflow"
                            style={{ maxWidth: 260, verticalAlign: 'middle' }}
                          >
                            {attachmentName || attachmentUrl}
                          </span>
                          <Icons
                            className="arrow_circle_down"
                            type="arrow_circle_down"
                            style={{ marginLeft: 12, verticalAlign: 'bottom' }}
                          />
                        </a>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      );
    });
  };
  return (
    <Sidebar
      title={intl.get('mallf.common.view.supplierLeaveWord').d('供应商留言')}
      className={styles['leave-word-modal']}
      visible={leaveWordVisible}
      onCancel={() => setState({ leaveWordVisible: false })}
      width={380}
      closable
      maskClosable={false}
      footer={[
        <UploadBtn
          maxSize={10}
          setLoading={(e) => {
            setFetchLoading(e);
          }}
          uploadCallBack={uploadCallBack}
        />,
        <Button
          loading={sendLoading}
          className="leave-word-send"
          key="back"
          onClick={() => handleSend()}
        >
          {intl.get('mallf.common.view.button.send').d('发送')}
        </Button>,
      ]}
    >
      <Spin spinning={fetchLoading}>
        <div className="leave-word-body">
          <div className="leave-word-content" id="leave-word-content">
            <div id="leave-word--scroll-body">
              <div id="leave-word--scroll-body">{renderWord()}</div>
            </div>
          </div>
          <div className="leave-word-wrapper">
            <textarea
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target?.value)}
              className="leave-word-input"
              placeholder={intl.get('mallf.common.view.inputWord').d('请输入文字')}
            />
          </div>
        </div>
      </Spin>
      {previewVisible && (
        <ImageViewer
          closeModal={() => {
            setPreviewVisible(false);
          }}
          imgList={fileList}
          index={currentIndex}
        />
      )}
    </Sidebar>
  );
}
