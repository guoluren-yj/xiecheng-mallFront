import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { TextArea, Attachment, Button, DataSet, Lov } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getResponse,
  getCurrentUser,
} from 'utils/utils';
import request from 'utils/request';
import noCommentSvg from '@/assets/images/no_comment.svg';
import ApprovalComment from '../ApprovalComment';
import styles from './index.less';

const PRIVATE_BUCKET = 'private-bucket';
const HZERO_HWFP = '/hwfp';

function ApprovalReply({ commentId, processInstanceId, taskId }) {
  const listRef = useRef();
  const currentEmployeeCode = useMemo(() => {
    const { additionInfo } = getCurrentUser() || {};
    const { employeeCode } = additionInfo || {};
    return employeeCode;
  }, []);

  const [state, setState] = useState({
    data: [],
    replyComment: undefined,
    replyCommentId: undefined,
  });

  const formDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'remindEmployeeNumber',
          type: 'object',
          multiple: true,
          lovCode: 'HWFP.EMPLOYEE',
          lovPara: {
            tenantId: getCurrentOrganizationId(),
            enabledFlag: 1,
          },
        },
        {
          name: 'comment',
        },
        {
          name: 'attachmentUuid',
          type: 'attachment',
          bucketName: PRIVATE_BUCKET,
        },
      ],
    });
  }, []);

  useEffect(() => {
    fetchList(true);
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scroll(0, listRef.current.scrollHeight);
    }
  }, [state.data]);

  const fetchList = (initFlag) => {
    const params = {};
    if (Array.isArray(processInstanceId)) {
      params.procInstIdList = processInstanceId;
    } else {
      params.procInstId = processInstanceId;
    }
    const isReply = !isNil(commentId);
    request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/process-comment-records/proc-list`, {
      method: 'POST',
      body: JSON.stringify(params),
    }).then((res) => {
      if (getResponse(res) && res && res.length) {
        // const commentRecord = res;
        const data = [];
        res.forEach((r) => {
          const _parent = {
            ...r,
            assignee: r.assignee || r.employeeNum,
            assigneeName: r.assigneeName || r.employeeName,
          };
          data.push(_parent);
          if (r.commentRecordList && r.commentRecordList.length > 0) {
            const replyRecords = r.commentRecordList.map((item) => ({
              ...item,
              assignee: item.assignee || item.employeeNum,
              assigneeName: item.assigneeName || item.employeeName,
              _parent,
            }));
            data.push(...replyRecords);
          }
        });
        let replyComment;
        let replyCommentId;
        if (initFlag && isReply) {
          // eslint-disable-next-line prefer-destructuring
          replyComment = data.find((i) => i.id === commentId);
          if (replyComment) {
            const { assignee, assigneeName, employeeNum, employeeName, id } = replyComment;
            replyComment = {
              ...replyComment,
              assignee: assignee || employeeNum,
              assigneeName: assigneeName || employeeName,
            };
            replyCommentId = id;
          }
        }
        // 时间倒序
        data.sort((a, b) => (a.creationDate > b.creationDate ? 1 : -1));
        setState((preState) => ({
          ...preState,
          data,
          replyComment,
          replyCommentId,
        }));
      }
    });
  };

  const handleReply = useCallback(
    (commentItem) => {
      setState((preState) => ({
        ...preState,
        replyComment: state.replyComment ? undefined : commentItem,
        replyCommentId: state.replyComment ? undefined : commentItem ? commentItem.id : undefined,
      }));
      if (formDs.current) {
        formDs.current.set('remindEmployeeNumber', undefined);
      }
    },
    [state.replyComment, formDs]
  );

  const handleSend = useCallback(async () => {
    if (!formDs.current) {
      return;
    }
    const flag = await formDs.current.validate();
    if (!flag) {
      return;
    }
    const { remindEmployeeNumber, comment, attachmentUuid } = formDs.current.get([
      'remindEmployeeNumber',
      'comment',
      'attachmentUuid',
    ]);
    if (!comment) {
      notification.warning({
        message: intl.get('hwfp.common.view.message.commentRequired').d('请输入评论内容！'),
      });
      return;
    }
    if (comment.length > 3500) {
      notification.warning({
        message: intl.get('hwfp.common.view.message.commentTooLong').d('评论内容太长了！'),
      });
      return;
    }
    let employeeNumber;
    const isReply = !!state.replyComment;
    if (isReply) {
      employeeNumber = state.replyComment.assignee;
    } else {
      employeeNumber =
        remindEmployeeNumber && remindEmployeeNumber.length > 0
          ? remindEmployeeNumber.map((r) => r.employeeNum).join(',')
          : undefined;
    }
    const submitData = filterNullValueObject({
      remindEmployeeNumber: employeeNumber,
      comment,
      attachmentUuid,
      taskId,
      procInstId: Array.isArray(processInstanceId) ? processInstanceId[0] : processInstanceId,
    });
    if (isReply) {
      submitData.relId = state.replyComment ? state.replyComment.id : commentId;
    }
    const res = await request(
      `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/process-comment-records/${
        isReply ? 'reply-comment' : 'start-comment'
      }`,
      {
        method: 'POST',
        body: JSON.stringify(submitData),
      }
    );
    if (getResponse(res)) {
      notification.success();
      fetchList();
      formDs.current.set('remindEmployeeNumber', undefined);
      formDs.current.set('comment', undefined);
      formDs.current.set('attachmentUuid', undefined);
    }
  }, [taskId, processInstanceId, commentId, formDs, state.replyComment]);

  const renderCommentItem = useCallback(
    (commentItem) => {
      const {
        id,
        assignee,
        assigneeName,
        commentRemindEmpNameList,
        comment,
        creationDate,
        endTime,
        attachmentUuid,
        commentReplyFlag,
        _parent,
      } = commentItem;
      const self = assignee === currentEmployeeCode;
      return (
        <div key={id} id={`comment-item-${id}`} className={styles['comment-item']}>
          <div
            className={classnames(styles['comment-item-name'], {
              [styles['align-left']]: !self,
              [styles['align-right']]: self,
            })}
          >
            {assigneeName || assignee}
          </div>
          <div
            className={classnames(styles['comment-item-content'], {
              [styles['left-content']]: !self,
              [styles['right-content']]: self,
            })}
          >
            <div
              className={classnames(styles['comment-item-content-arrow'], {
                [styles['arrow-left']]: !self,
                [styles['arrow-right']]: self,
              })}
            />
            <div className={styles['comment-item-content-header']}>
              {_parent
                ? intl.get('hwfp.common.view.label.reply').d('回复')
                : intl.get('hwfp.common.view.label.remind').d('提醒')}
              ：
              {commentRemindEmpNameList && commentRemindEmpNameList.length > 0
                ? commentRemindEmpNameList.map((nameItem, nameItemIndex) => (
                    <span style={{ color: '#1770E6' }}>
                      @{nameItem}
                      {nameItemIndex !== commentRemindEmpNameList.length - 1 ? '、' : null}
                    </span>
                  ))
                : null}
              {!self && commentReplyFlag === 1 && (
                <Button
                  icon={state.replyCommentId === id ? 'close' : 'message-o'}
                  funcType="link"
                  className={styles['comment-item-content-header-extra']}
                  onClick={() => handleReply(commentItem)}
                >
                  {state.replyCommentId === id
                    ? intl.get('hwfp.common.view.button.cancelReply').d('取消回复')
                    : intl.get('hwfp.common.view.button.reply').d('回复')}
                </Button>
              )}
            </div>
            <div className={styles['comment-item-content-main']}>
              <ApprovalComment data={comment} />
            </div>
            <div className={styles['comment-item-content-footer']}>
              {attachmentUuid && (
                <Attachment
                  labelLayout="float"
                  bucketName={PRIVATE_BUCKET}
                  viewMode="popup"
                  icon="attach_file"
                  className={styles['comment-item-content-attachment']}
                  value={attachmentUuid}
                  readOnly
                />
              )}
              <span className={styles['comment-item-content-date']}>{endTime || creationDate}</span>
            </div>
          </div>
          {_parent && (
            <div
              className={classnames(styles['comment-item-footer'], {
                [styles['align-left']]: !self,
                [styles['align-right']]: self,
              })}
            >
              {_parent.assigneeName}：{_parent.comment}
            </div>
          )}
        </div>
      );
    },
    [state.replyComment, state.replyCommentId, currentEmployeeCode, handleReply]
  );

  const renderCommentList = useMemo(() => {
    if (!state.data || !state.data.length) {
      return (
        <div className={styles['empty-comment']}>
          <div className={styles['empty-comment-pic']}>
            <img alt="" src={noCommentSvg} />
          </div>
          <div className={styles['empty-comment-word']}>
            {intl.get('hwfp.common.view.message.emptyComment').d('暂无评论')}
          </div>
        </div>
      );
    }
    return state.data.map(renderCommentItem);
  }, [state.data, renderCommentItem]);

  const handleLocate = useCallback(() => {
    const el = document.querySelector(`#comment-item-${state.replyCommentId}`);
    if (el) {
      el.scrollIntoView();
    }
  }, [state.replyCommentId]);

  return (
    <div className={styles['comment-container']}>
      <div className={styles['comment-list']} ref={listRef}>
        {renderCommentList}
      </div>
      {state.replyComment ? (
        <div className={styles['comment-ref']} onClick={handleLocate}>
          {intl.get('hwfp.common.view.label.reply').d('回复')}@{state.replyComment.assigneeName}：
          {state.replyComment.comment}
          <Icon
            type="close"
            className={styles['comment-ref-close']}
            onClick={() => handleReply(undefined, undefined)}
          />
        </div>
      ) : (
        <div className={styles['comment-notifier']}>
          <Lov
            dataSet={formDs}
            name="remindEmployeeNumber"
            placeholder={intl.get('hwfp.common.view.placeholder.addReminder').d('添加提醒人')}
          />
        </div>
      )}
      <div className={styles['comment-editor']}>
        <TextArea
          dataSet={formDs}
          name="comment"
          border={false}
          placeholder={intl.get('hwfp.common.view.placeholder.commentContent').d('评论内容')}
        />
        <div className={styles['editor-btn']}>
          <Attachment
            dataSet={formDs}
            name="attachmentUuid"
            labelLayout="float"
            viewMode="popup"
            icon="attach_file"
          >
            {intl.get('hwfp.common.view.label.attachment').d('附件')}
          </Attachment>
          <Button
            funcType="flat"
            icon="send"
            style={{ marginLeft: 0, marginRight: '8px' }}
            onClick={handleSend}
            color="primary"
          >
            {intl.get('hwfp.common.button.send').d('发送')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ApprovalReply;
