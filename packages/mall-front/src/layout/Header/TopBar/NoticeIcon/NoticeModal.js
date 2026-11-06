import React, { useEffect, useState } from 'react';
import { Modal, Button, Spin, Icon } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { getPrimaryColor, getUserConfigInfo } from 'utils/utils';
import { timeZone2MomentUTC } from 'utils/constants';
import {
  queryNotices,
  // queryNoticesPreview,
  queryNoticesDetail,
  allRead,
  // deleteAll,
  deleteNoticeItem,
} from 'services/headerService';

import { openComfirmModal } from 'utils/modals';
import style from './index.less';

const { Sidebar } = Modal;
export default function NoticeModal(props) {
  const { visible, setVisible } = props;
  const [loading, setLoading] = useState(false);
  const [noticeList, setNoticeList] = useState([]);
  const [noticeDetail, setNoticeDetail] = useState({});
  const { userInfo } = getUserConfigInfo();
  const { timeZone } = userInfo;

  useEffect(() => {
    fetchNotice();
  }, [noticeDetail]);

  function handleTitle() {
    if (!isEmpty(noticeDetail)) {
      return (
        <>
          <Button
            onClick={() => setNoticeDetail({})}
            className="notice-button-back"
            icon="keyboard_backspace"
            shape="circle"
          />
          <span>{intl.get('mallf.common.view.notice.noticeDetail').d('通知详情')}</span>
        </>
      );
    } else {
      return intl.get('mallf.common.view.notice.noticeTitle').d('消息通知');
    }
  }

  function handleNoticeDetail(userMessageId) {
    setLoading(true);
    queryNoticesDetail({ userMessageId })
      .then((res) => {
        if (res) {
          setNoticeDetail(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function fetchNotice() {
    const params = {
      page: 0,
      size: 8,
      userMessageTypeCode: 'MSG',
    };
    setLoading(true);
    queryNotices(params)
      .then((res) => {
        setNoticeList(res?.content || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function hanldAllRead() {
    allRead({ readAll: 1 }).then(() => {
      fetchNotice();
    });
  }

  // function handleDeleteAll() {
  //   deleteAll().then(() => {
  //     fetchNotice();
  //   });
  // }

  // 站内信删除
  function handleDeleteItem(userMessageId) {
    // confirm({
    //   title: intl.get('mallf.common.view.confirmDelete').d('确定删除？'),
    //   // content: intl.get('mallf.common.view.confirmDelete').d('确定删除？'),
    //   onOk() {
    //     deleteNoticeItem({ userMessageIdList: userMessageId }).then(() => {
    //       fetchNotice();
    //     });
    //   },
    // });
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
      children: intl
        .get('mallf.common.view.messageNotification.confirmDelete')
        .d('确认删除该条消息通知吗？'),
      onOk() {
        deleteNoticeItem({ userMessageIdList: userMessageId }).then(() => {
          fetchNotice();
        });
      },
    });
  }

  window.openTab = () => {
    // 拦截不跳转
  };

  return (
    <Sidebar
      closable
      destroyOnClose
      width={380}
      wrapClassName={style['notice-modal']}
      title={handleTitle()}
      visible={visible}
      onCancel={() => setVisible(false)}
      footer={[
        <Button
          style={{
            width: 'auto',
            height: 32,
            fontWeight: 600,
            background: getPrimaryColor(),
            color: '#fff',
          }}
          key="back"
          onClick={() => setVisible(false)}
        >
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>,
      ]}
      // confirmLoading={budgetLoading}
      maskClosable={false}
    >
      <Spin spinning={loading}>
        {isEmpty(noticeDetail) ? (
          <div className="notice-content">
            {!isEmpty(noticeList) && (
              <div className="notice-header-button">
                <Button icon="all_read" onClick={() => hanldAllRead()}>
                  {intl.get('hzero.common.basicLayout.option.allRead').d('全部已读')}
                </Button>
                {/* <Button icon="delete_sweep" style={{ marginLeft: '10px' }} onClick={() => handleDeleteAll()}>
                  {intl.get('hzero.common.basicLayout.option.deleteAll').d('全部清除')}
                </Button> */}
              </div>
            )}
            {noticeList.map((notice) => {
              const {
                subject,
                creationDate,
                userMessageTypeMeaning,
                readFlag,
                userMessageId,
              } = notice;
              const utc =
                timeZone2MomentUTC[timeZone] || (timeZone2MomentUTC[timeZone] === 0 ? 0 : 8);
              return (
                <div className="notice-item">
                  <div className="notice-item-title">
                    <div
                      className={`notice-item-subject ${!readFlag ? 'notice-item-read' : ''}`}
                      onClick={() => handleNoticeDetail(userMessageId)}
                    >
                      {subject}
                    </div>
                    <div onClick={() => handleDeleteItem(userMessageId)}>
                      <Icon type="delete" style={{ fontSize: 14 }} />
                    </div>
                  </div>
                  <div className="notice-item-desc">
                    <div className="notice-item-type">{userMessageTypeMeaning}</div>
                    <div>{moment(`${creationDate}`).utcOffset(utc, true).fromNow()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="notice-detail">
            <div className="notice-detail-title">{noticeDetail?.subject}</div>
            <div className="notice-detail-time">{noticeDetail?.creationDate}</div>
            <div
              className="notice-detail-content"
              dangerouslySetInnerHTML={{ __html: noticeDetail?.content }}
            />
          </div>
        )}
      </Spin>
    </Sidebar>
  );
}
