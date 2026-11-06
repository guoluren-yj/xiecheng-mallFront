/**
 * PrivacyPolicies.js
 * 隐私政策条款
 * @date: 2021-11-03
 * @author: YP <peng.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Modal, Button, CheckBox, DataSet } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { getUserConfigDTO } from 'utils/configUtils';
import intl from 'utils/intl';
import { logout } from 'services/api';
import { isNil } from 'lodash';
import TimerButton from './TimerButton';
import SurveySvg from './SurveySvg';
import {
  fetchUserStatusService,
  getQuestionnaireService,
  getPrivacyHeadInfoService,
  getPrivacyInfoService,
  changeUserStatusService,
} from '@/services/layoutService';
import styles from './index.less';

const modalKey = Modal.key();

function PrivacyPolicies() {
  const modalRef = useRef(); // 保存当前的modal

  const [privacyPoliciesModalFlag, handleFlag] = useState(false); // 控制展示modal
  const [privacyPoliciesContent, setPrivacyPoliciesContent] = useState({}); // 展示内容
  const { bizErrorFlag } = getUserConfigDTO() || {};

  useEffect(() => {
    setTimeout(() => {
      fetchUserStatusService().then((res) => {
        if (getResponse(res)) {
          const list = [];
          // 隐私协议弹框 优先级 > 问卷弹框
          if (+res.userPrivacyTermAgreedVersion === 0) {
            list.push({
              fetchConfig: getPrivacyPoliciesContent,
              fetchSuccess: (info) => {
                setPrivacyPoliciesContent(info);
                handleFlag(true);
              },
            });
          }

          if (!isNil(res.purchaserUserSurveyFilledCode)) {
            list.push({
              fetchConfig: getQuestionnaireService,
              fetchSuccess: (resp) => {
                if (getResponse(resp)) {
                  // 一致说明已填写当前问卷，无需再弹，否则弹出填写提醒
                  // 阻塞性弹窗优先级更高bizErrorFlag
                  if (resp.code !== res.purchaserUserSurveyFilledCode && bizErrorFlag !== 1) {
                    openQustionModal(resp, res);
                  }
                }
              },
            });
          }

          if (list.length > 0) {
            Promise.all(list.map((m) => m.fetchConfig())).then((configs) => {
              configs.forEach((f, ind) => {
                list[ind].fetchSuccess(f);
              });
            });
          }
        }
      });
    }, 1000);
    return () => {
      handleFlag(false);
      changeZIndex(false);
    };
  }, []);

  /**
   * 获取隐私描述内容
   * @returns Object 内容数据
   */
  const getPrivacyPoliciesContent = async () => {
    const headerInfo = await getPrivacyHeadInfoService();
    const detailInfo = await getPrivacyInfoService();
    return {
      header: headerInfo.text,
      detail: detailInfo.text,
    };
  };

  /**
   * 点击同意，改变用户的状态
   */
  const changeUserStatus = () => {
    changeUserStatusService({
      statusCode: 'userPrivacyTermAgreedVersion',
      fromValue: 0,
      toValue: 1,
    }).then((res) => {
      if (getResponse(res)) {
        handleFlag(false);
        modalRef.current.close();
        changeZIndex(false);
      }
    });
  };

  const finishUserSurvey = useCallback(
    (originValue, newValue, modal = {}) => {
      const forceFinish = ds.current.get('forceFinish');
      if (forceFinish) {
        return changeUserStatusService({
          statusCode: 'purchaserUserSurveyFilledCode',
          fromValue: originValue,
          toValue: newValue,
        })
          .then((res) => {
            if (getResponse(res)) {
              return true;
            }
            return false;
          })
          .finally(() => {
            modal.close();
            changeZIndex(false);
          });
      } else {
        modal.close();
        changeZIndex(false);
      }
    },
    [ds]
  );

  /**
   * 改变c7n-pro-modal-container的z-index 让弹框在最上层
   * @param {Boolean} flag 改变状态标记
   */
  const changeZIndex = (flag) => {
    const c7nModalContainer = document.querySelector('.c7n-pro-modal-container');
    if (c7nModalContainer) {
      c7nModalContainer.style.zIndex = flag ? 1100000 : 1001;
    }
  };

  /**
   * 弹框
   * @returns void
   */
  const openModal = () => {
    modalRef.current = Modal.open({
      key: modalKey,
      title: (
        <div className="privacy-policies-title">
          <div className="title">
            {intl.get('mallf.common.view.modal.title').d('甄采云隐私政策声明')}
          </div>
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: privacyPoliciesContent.header }}
          />
        </div>
      ),
      className: styles.privacyPolicies,
      closable: false,
      keyboardClosable: false,
      children: (
        <div
          className="privacy-policies-content"
          dangerouslySetInnerHTML={{ __html: privacyPoliciesContent.detail }}
        />
      ),
      footer: [
        <TimerButton onClick={changeUserStatus} />,
        <Button onClick={logout}>
          {intl.get('mallf.common.view.button.disagree').d('不同意')}
        </Button>,
      ],
      movable: false,
      style: {
        width: 800,
        zIndex: 1100000,
      },
    });
  };

  // 勾选 不再提示
  const ds = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [{ name: 'forceFinish', type: 'boolean', defaultValue: false }],
    });
  }, []);

  const Content = () => {
    return (
      <div className="content-wrapper">
        <div className="svg-wrapper">
          <SurveySvg />
        </div>
        <h2>
          {intl.get('mallf.common.title.survey.invitationText').d('甄云SRM 2022年满意度调研问卷')}
        </h2>
        <div className="content-text">
          <div>
            <p style={{ marginBottom: 10 }}>
              {intl
                .get('mallf.common.text.survey.contentTextParagraph1')
                .d('各位新老客户，感谢您又一年的信任和陪伴！')}
            </p>
            <p style={{ marginBottom: 10 }}>
              {intl
                .get('mallf.common.text.survey.contentTextParagraph2')
                .d(
                  '这一年，甄云的客户都在各领域引领和创造着未来，对于甄云来说，能够在这过程中帮助大家打造更智能的供应链体系是我们的愿景,长久地陪伴并持续给大家带来价值是我们的初心。我们时刻提醒自己守护住这份愿景和初心，也很感激，在这过程中我们的员工始终坚定不移地解决问题，我们的客户始终坚定不移地包容和支持。'
                )}
            </p>
            <p>
              {intl
                .get('mallf.common.text.survey.contentTextParagraph3')
                .d(
                  '但我们深知，甄云的产品和服务仍有许多不足之处，所以今年，我们再一次发起用户满意度调研，期望得到大家新的反馈和建议，也期望检验我们一年来的改进工作是否切实地改善了用户的痛点。'
                )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const openQustionModal = (resp, res) => {
    const modal = Modal.open({
      className: styles['questionnaire-survey'],
      border: false,
      okButton: false,
      cancelButton: false,
      drawerBorder: false,
      autoCenter: true,
      children: <Content />,
      footer: [
        <CheckBox dataSet={ds} name="forceFinish" style={{ marginRight: 15 }}>
          {intl.get('mallf.common.view.noMoreTips').d('不再提示')}
        </CheckBox>,
        <Button
          key="temporarilyNotAttend"
          onClick={() => finishUserSurvey(res.purchaserUserSurveyFilledCode, resp.code, modal)}
        >
          {intl.get('mallf.common.view.temporarilyNotAttend').d('暂不参加')}
        </Button>,
        <Button
          color="primary"
          key="acceptInvitation"
          onClick={() => {
            Modal.open({
              title: intl.get('mallf.common.view.title.survey').d('问卷调查'),
              closable: true,
              keyboardClosable: false,
              fullScreen: true,
              bodyStyle: {
                padding: '5px 24px',
              },
              children: (
                <iframe
                  src={resp.link}
                  title="survey"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                  }}
                />
              ),
              onOk: () => finishUserSurvey(res.purchaserUserSurveyFilledCode, resp.code, modal),
              onClose: () => finishUserSurvey(res.purchaserUserSurveyFilledCode, resp.code, modal),
              okText: intl.get('hzero.common.button.close').d('关闭'),
              cancelButton: false,
              movable: false,
              style: {
                width: '100%',
              },
            });
          }}
        >
          {intl.get('mallf.common.view.acceptInvitation').d('接受邀请')}
        </Button>,
      ],
    });
  };

  /**
   * 弹框
   * @returns void
   */
  const showPrivacyPoliciesModal = () => {
    changeZIndex(true);
    setTimeout(() => {
      openModal();
    }, 300);
    return <div />;
  };
  return privacyPoliciesModalFlag && showPrivacyPoliciesModal();
}

export default PrivacyPolicies;
