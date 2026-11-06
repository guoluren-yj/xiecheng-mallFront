/*
 * @Descripttion:
 * @Date: 2021-06-15 15:04:02
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, useEffect, useState } from 'react';
import { Modal, Button, Spin } from 'choerodon-ui/pro';
import { Tooltip } from 'hzero-ui';
// import JsWebScreenshot from 'screen-shot-hdpi';

import { isEmpty, omit } from 'lodash';

import request from 'utils/request';
import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
  getCurrentUser,
  getUserConfigInfo,
  fillUrlToken,
} from 'utils/utils';
import intl from 'utils/intl';
import MessageHandler from 'components/Message/message-handler';
import formatterCollections from 'utils/intl/formatterCollections';
import getBrowserInfo from 'utils/getBrowserInfo';
import webSocket from 'hzero-front/lib/utils/webSoket';
import { notification } from 'choerodon-ui';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { basePath as BASE_PATH, srmPath as SRM_PATH } from 'utils/api-config';
// import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { getBindSupplierUrl } from '../services/mobileConfig.js';

import wechatImg from '@/assets/images/icon_wechat.svg';
import iconDefault from '@/assets/images/icon_default.svg';
import iconSelect from '@/assets/images/icon_selected.svg';
import onlineServicesSvg from '@/assets/images/online_services.svg';
import onlineIssueSvg from '@/assets/images/online_issue.svg';
import purchaseHelperImg from '@/assets/images/right_now.svg';
import styles from './index.less';

const urlLoading = Symbol('url-loading');
const notificationKey = 'yqclound-new-message';
const JIKE_GET_MENU_STATUS = 'JIKE_GET_MENU_STATUS';
const SRM_PLATFORM = '/spfm';
@formatterCollections({ code: ['srm.helpRobot', 'hzero.common'] })
export default class OnlineTools extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.draggable = React.createRef();
    // this.botRef = React.createRef();
    // this.videoElem = React.createRef();
    this.robotMessageSendTime = undefined;
    this.initShowFlag = true;
    this.issueModal = null;
    this.state = {
      showExpandTools: true,
      timeoutId: null,
      msgCount: 0, // 燕千云消息数量
    };
    this.observerData = observable({
      dragFlag: props.dragFlag || false,
    });
  }

  componentWillMount() {
    window.addEventListener('message', this.closeIssueModal);
  }

  componentDidMount() {
    this.firstTimeout();
    // window.addEventListener('message', this.receiveRobotMessage);
    webSocket.addListener('hzero-offline-msg', this.handleRebotMsg);
  }

  componentWillUnmount() {
    const { timeoutId } = this.state;
    clearTimeout(timeoutId);
    // window.removeEventListener('message', this.receiveRobotMessage);
    webSocket.removeListener('hzero-offline-msg', this.handleRebotMsg);
    window.removeEventListener('message', this.closeIssueModal);
  }

  componentDidUpdate(prevProps) {
    // 启用燕千云客服时
    if (this.props.enabledFlag && this.props.enabledFlag !== prevProps.enabledFlag) {
      this.initMessage();
    }
    if (this.props.dragFlag !== this.observerData.dragFlag) {
      this.observerData.dragFlag = this.props.dragFlag;
    }
  }

  fetchMessageCount = async () => {
    const res = await request(`${SRM_PLATFORM}/v1/external/yqcloud/webhook/offline-message/status`);
    if (getResponse(res) && res && res.haveOfflineMessage) {
      return res.haveOfflineMessage;
    } else {
      return false;
    }
  };

  initMessage = async () => {
    const count = await this.fetchMessageCount();
    if (count) {
      this.setState({
        msgCount: count,
      });
      this.showNotifiction(count);
    }
  };

  handleRebotMsg = async (data) => {
    if (data && data.message) {
      const { message } = data;
      if (typeof message === 'string') {
        try {
          const { sendTime } = JSON.parse(message);
          if (!this.robotMessageSendTime || this.robotMessageSendTime < sendTime) {
            this.robotMessageSendTime = sendTime;
            const count = await this.fetchMessageCount();
            if (count) {
              this.setState({
                msgCount: count,
              });
              this.showNotifiction(count);
            }
          }
          // eslint-disable-next-line no-empty
        } catch {}
      }
    }
  };

  showNotifiction = (count) => {
    const [before = '', after = ''] = intl
      .get('srm.helpRobot.unread.message.count')
      .d('您有{count}条未读消息')
      .split('{count}');
    notification.close(notificationKey);
    notification.open({
      key: notificationKey,
      message: (
        <span style={{ fontSize: '14px', fontWeight: 600 }}>
          {intl.get('srm.helpRobot.view.title.onlineRobot').d('在线支持')}
          {intl.get('srm.helpRobot.message.notification').d('消息提醒')}
        </span>
      ),
      description: (
        <span className={styles['yqy-notification']} onClick={this.handleClose}>
          {before}&nbsp;{count}&nbsp;{after},
          {intl.get('srm.helpRobot.click.for.details').d('点击查看详情')}
        </span>
      ),
      btn: (
        <Button onClick={() => notification.close(notificationKey)}>
          {intl.get('hzero.common.button.shutDown').d('关闭')}
        </Button>
      ),
      duration: 0,
    });
  };

  handleClose = () => {
    window.focus();
    notification.close(notificationKey);
    this.openRobotChat();
  };

  firstTimeout = () => {
    const { controlFlag } = this.props;
    controlFlag();
    const timeoutId = setTimeout(() => {
      controlFlag();
    }, 3000);
    this.setState({
      timeoutId,
    });
  };

  // receiveRobotMessage = (event) => {
  //   const {
  //     data: { msg, data, type },
  //   } = event;
  //   if (type === 'bot-signal' && msg === 'close-botChat-cut') {
  //     // 这里对iframe进行隐藏，例如使用 display: none
  //     document.querySelector('.yqcloud-bot-modal').style.display = 'none';
  //   }
  //   if (type === 'bot-signal' && msg === 'dispatch-screenshot') {
  //     this.WebScreenshot();
  //   }
  // };

  // WebScreenshot = async () => {
  //   const videoNode = document.createElement('video');
  //   videoNode.autoplay = true;
  //   this.videoElem.current = videoNode;
  //   await this.screenShot();
  // };

  // screenShot = async () => {
  //   const result = await this.startCapture();
  //   const sourceLabel = result?.getTracks?.()?.[0]?.label;
  //   const isTabSource = sourceLabel?.startsWith('web-contents-media-stream');

  //   if (Array.prototype.toString.apply(result) === '[object MediaStream]') {
  //     const imgSrc = await this.drawImage();

  //     if (isTabSource) {
  //       await this.sleep(300);
  //     }

  //     const screenshotHandler = new JsWebScreenshot({
  //       enableWebRtc: false,
  //       showScreenData: true,
  //       level: 99999,
  //       imgSrc,
  //       completeCallback: this.completeCallback,
  //     });
  //     return true;
  //   } else {
  //     this.errHandler(result);
  //   }
  // };

  // drawImage = () => {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       const wrapperWidth = window.innerWidth;
  //       const wrapperHeight = window.innerHeight;
  //       const screenShortCanvas = document.createElement('canvas');
  //       const ctx = screenShortCanvas.getContext('2d');
  //       screenShortCanvas.width = wrapperWidth;
  //       screenShortCanvas.height = wrapperHeight;
  //       ctx.fillStyle = '#000';
  //       ctx.fillRect(0, 0, wrapperWidth, wrapperHeight);

  //       const natureWidth = this.videoElem.current.videoWidth;
  //       const natureHeight = this.videoElem.current.videoHeight;

  //       const [drawWidth, drawHeight, drawTop, drawLeft] = this.getImageActualSize({
  //         natureWidth,
  //         natureHeight,
  //         wrapperWidth,
  //         wrapperHeight,
  //       });

  //       ctx.drawImage(
  //         this.videoElem.current,
  //         0,
  //         0,
  //         natureWidth,
  //         natureHeight,
  //         drawLeft,
  //         drawTop,
  //         drawWidth,
  //         drawHeight
  //       );

  //       const img = screenShortCanvas.toDataURL('image/png');
  //       // 停止捕捉屏幕
  //       this.stopCapture();
  //       resolve(img);
  //     }, 500);
  //   });
  // };

  // startCapture = async () => {
  //   if (window.navigator?.mediaDevices?.getDisplayMedia === undefined) {
  //     return 'BrowserNotSupport';
  //   }

  //   try {
  //     const displayMediaOptions = {
  //       video: true,
  //       audio: false,
  //     };
  //     const captureStream = await window.navigator.mediaDevices.getDisplayMedia(
  //       displayMediaOptions
  //     );
  //     this.videoElem.current.srcObject = captureStream;
  //     return captureStream;
  //   } catch (err) {
  //     return `${err}`;
  //   }
  // };

  // stopCapture = (evt) => {
  //   const tracks = this.videoElem.current.srcObject.getTracks();

  //   tracks.forEach((track) => track.stop());
  //   this.videoElem.current.srcObject = null;
  //   this.videoElem.current = null;
  // };

  // completeCallback = (srcObj) => {
  //   try {
  //     //  --> 在这里恢复bot窗口
  //     document.querySelector('.yqcloud-bot-modal').style.display = 'block';
  //     const data = this.dataURItoBlob(srcObj);
  //     this.botRef.current.contentWindow.postMessage({ type: 'screenshot', msg: data }, '*');
  //   } catch (e) {
  //     throw new Error(e);
  //   }
  // };

  // 这里可根据需要自行设置多语言
  // errHandler = (result) => {
  //   if (result === 'BrowserNotSupport') {
  //     Modal.error(
  //       intl.get('srm.helpRobot.view.message.browserNotSupport').d('当前版本浏览器不支持该功能')
  //     );
  //   } else if (result === 'NotAllowedError: Permission denied') {
  //     // Chrome 中用户手动点了取消
  //   } else if (
  //     result ===
  //     'NotAllowedError: The request is not allowed by the user agent or the platform in the current context.'
  //   ) {
  //     // Firefox 中用户点了阻止
  //     Modal.error(
  //       intl
  //         .get('srm.helpRobot.view.message.grantSharedScreenPermission')
  //         .d('您已阻止此网站共享屏幕，请在浏览器设置中授予权限')
  //     );
  //   } else if (
  //     result === 'NotAllowedError: Permission denied by system' ||
  //     result === 'NotFoundError: The object can not be found here.'
  //   ) {
  //     const ua = navigator?.userAgent;
  //     if (ua && ua.indexOf('Macintosh') > -1) {
  //       Modal.error({
  //         title: intl.get('srm.helpRobot.view.message.openScreenshotPermission').d('打开截图权限'),
  //         children: intl
  //           .get('srm.helpRobot.view.message.systemPreferencesPermission')
  //           .d('请前往系统偏好设置>安全性与隐私>屏幕录制，勾选本浏览器'),
  //       });
  //     } else {
  //       Modal.error({
  //         title: intl.get('srm.helpRobot.view.message.openScreenshotPermission').d('打开截图权限'),
  //         children: intl
  //           .get('srm.helpRobot.view.message.systemSettingPermission')
  //           .d('请在系统设置中允许本浏览器使用录屏权限'),
  //       });
  //     }
  //   } else {
  //     // 留空
  //   }
  // };

  // dataURItoBlob = (dataURI) => {
  //   const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  //   const byteString = atob(dataURI.split(',')[1]);
  //   const arrayBuffer = new ArrayBuffer(byteString.length);
  //   const intArray = new Uint8Array(arrayBuffer);

  //   for (let i = 0; i < byteString.length; i++) {
  //     intArray[i] = byteString.charCodeAt(i);
  //   }
  //   return new Blob([intArray], { type: mimeString });
  // };

  // sleep = async (delay) => {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(resolve, delay);
  //   });
  // };

  // getImageActualSize = ({ natureWidth, natureHeight, wrapperWidth, wrapperHeight }) => {
  //   const wrapperRatio = wrapperWidth / wrapperHeight;
  //   const natureRatio = natureWidth / natureHeight;

  //   let drawWidth;
  //   let drawHeight;
  //   let drawTop = 0;
  //   let drawLeft = 0;

  //   if (wrapperRatio >= natureRatio) {
  //     drawHeight = wrapperHeight;
  //     drawWidth = wrapperHeight * natureRatio;
  //     drawLeft = (wrapperWidth - drawWidth) / 2;
  //   } else {
  //     drawWidth = wrapperWidth;
  //     drawHeight = wrapperWidth / natureRatio;
  //     drawTop = (wrapperHeight - drawHeight) / 2;
  //   }

  //   return [drawWidth, drawHeight, drawTop, drawLeft];
  // };

  expandTools = (value = undefined) => {
    const { showExpandTools } = this.state;
    const { controlFlag, partnerInfo, enabledCloopmFlag } = this.props;
    this.initShowFlag = false;
    this.setState({ showExpandTools: value === false ? false : !showExpandTools });
    if (!isEmpty(partnerInfo) || enabledCloopmFlag) {
      controlFlag();
    }
  };

  openWeChat = () => {
    const { partnerInfo, setWechatUrl, setSpinValue, handleOpenWechatModal } = this.props;
    setWechatUrl('', '', '');
    setSpinValue(true);
    handleOpenWechatModal(true);
    // 额度查询
    this.getQuota('spfm', partnerInfo[0].partnerCode, partnerInfo[0].serviceCode).then((res) => {
      const result = getResponse(res);
      setSpinValue(false);
      if (!isEmpty(result)) {
        if (result.success && result.code === '00000') {
          if (result.data) {
            setWechatUrl(result.data, '', result.code);
          } else {
            setWechatUrl('', result.msg ? result.msg : result.code, result.code);
          }
        }
        if (!result.success) {
          setWechatUrl('', result.msg ? result.msg : result.code, result.code);
        }
      }
    });
  };

  getQuota = (_, partnerCode, serviceCode) => {
    const params = {
      partnerCode,
      openServiceCode: serviceCode,
    };
    let query = filterNullValueObject(parseParameters(params));
    query = omit(query, ['page', 'size']);
    return request(
      `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/application-market-client/has-order-quota`,
      { query }
    );
  };

  clearMsgCount = () => {
    this.setState({ msgCount: 0 });
    request(`${SRM_PLATFORM}/v1/external/yqcloud/webhook/offline-message/close`).then((r) =>
      getResponse(r)
    );
  };

  openRobotChat = () => {
    this.expandTools(false);
    const user = getCurrentUser() || {};
    const { id, realName, loginName, tenantName, additionInfo, language, tenantNum } = user;
    const { organizationName } = additionInfo || {};
    const anonymousUserInfo = {
      company: tenantNum?.replace(/-/g, '_') ?? '',
      t_belong_tenant: organizationName, // 所属租户
      t_current_tenant: tenantName, // 当前租户
      t_website: window.location.href, // 登录网址
      t_web: getBrowserInfo().browser, // 当前浏览器
    };
    const userOptions = {
      anonymousUserName: realName,
      anonymousUserCode: loginName,
      anonymousUserInfo: JSON.stringify(anonymousUserInfo),
      updateFlag: true,
    };
    const urlParam = encodeURIComponent(JSON.stringify(userOptions));
    const yqyUrl = `${process.env.YQCLOUD_BOTPRESS_URL}?yqLanguage=${language}&userId=${id}&userOptions=${urlParam}`;
    let maxWidth = window.innerWidth - 250;
    if (document.querySelector('.hzero-common-layout-aside')) {
      maxWidth =
        window.innerWidth -
        document.querySelector('.hzero-common-layout-aside').getBoundingClientRect().width -
        10;
    }
    Modal.open({
      drawer: true,
      key: 'botModal',
      style: {
        width: '800px',
        maxWidth: `${maxWidth}px`,
      },
      className: 'yqcloud-bot-modal',
      ignoreDestroyAll: true,
      children: (
        <iframe
          src={yqyUrl}
          id="onlineService"
          name="onlineService"
          title="onlineService"
          width="100%"
          height="100%"
          frameBorder="none"
          style={{ border: 'none' }}
        />
      ),
      footer: (okBtn, cancelBtn) => <>{cancelBtn}</>,
      cancelText: intl.get('hzero.common.model.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
      onCancel: () => {
        this.clearMsgCount();
      },
      resizable: true,
      mask: false,
      destroyOnClose: true,
    });
  };

  // 在线提单入口
  renderIssueEnter = () => {
    return (
      <div
        className={styles['robot-icon']}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Tooltip placement="left" title={intl.get('srm.helpRobot.icon.onlineIssue').d('在线提单')}>
          <img
            src={onlineIssueSvg}
            alt="online-issue"
            width={30}
            height={30}
            onClick={this.openIssueModal}
          />
        </Tooltip>
      </div>
    );
  };

  loginYQY = () => {
    window.open(process.env.YQCLOUD_LOGIN_URL);
  };

  openIssueModal = () => {
    let maxWidth = window.innerWidth - 250;
    if (document.querySelector('.hzero-common-layout-aside')) {
      maxWidth =
        window.innerWidth -
        document.querySelector('.hzero-common-layout-aside').getBoundingClientRect().width -
        10;
    }
    const { yqyPassUrl } = this.props;
    this.issueModal = Modal.open({
      drawer: true,
      style: {
        width: '800px',
        maxWidth: `${maxWidth}px`,
      },
      className: styles['issue-modal'],
      children: (
        <iframe
          src={yqyPassUrl}
          id="onlineIssue"
          name="onlineIssue"
          title="onlineIssue"
          width="100%"
          height="100%"
          frameBorder="none"
          style={{ border: 'none' }}
        />
      ),
      footer: (okBtn, cancelBtn) => (
        <>
          {cancelBtn}
          <Button onClick={this.loginYQY}>
            {intl.get('srm.helpRobot.view.button.loginYQY').d('登录燕千云')}
          </Button>
        </>
      ),
      cancelText: intl.get('hzero.common.model.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
      resizable: true,
      mask: false,
    });
  };

  // 关闭燕千云提单modal
  closeIssueModal = (e) => {
    if (e.data === 'yq_close_modal' && this.issueModal) {
      this.issueModal.close();
    }
  };

  getMenuCardData = () => {
    let { pathname } = window.location;
    if (BASE_PATH) {
      pathname = pathname.replace(BASE_PATH, '/');
    }
    const { chatInfo } = this.context;
    const { loadedCardMap } = chatInfo || {};
    let cardData;
    if (loadedCardMap && loadedCardMap?.[pathname]) {
      cardData = loadedCardMap[pathname];
    }
    return cardData;
  };

  sendMenu = () => {
    const cardData = this.getMenuCardData();
    if (!cardData) {
      return;
    }
    // 先重置
    window.localStorage.setItem(JIKE_GET_MENU_STATUS, '');
    const handleGetMenu = () => {
      window.localStorage.setItem(JIKE_GET_MENU_STATUS, 'true');
      MessageHandler.cancel('GET_MENU', handleGetMenu);
    };
    MessageHandler.on('GET_MENU', handleGetMenu);
    let { pathname } = window.location;
    if (BASE_PATH) {
      pathname = pathname.replace(BASE_PATH, '/');
    }
    const { tabs } = window.dvaApp._store.getState().global;
    const currentMenu = tabs ? tabs.find((i) => i.path === pathname) : undefined;
    if (currentMenu) {
      currentMenu.title = intl.get(currentMenu.title) || currentMenu.title;
    }
    const content = { menu: currentMenu };
    content.data = cardData;
    if (content.data) {
      content.data = omit(content.data, ['requestBody']);
    }
    const timer = setInterval(() => {
      if (window.localStorage.getItem(JIKE_GET_MENU_STATUS) === 'true') {
        const { cardCode, cardType, serviceType, requestBody } = cardData;
        const params = {
          organizationId: getCurrentOrganizationId(),
          cardCode,
          cardType,
          serviceType,
        };
        getBindSupplierUrl(params, {
          action: 'AUTO',
          ...(typeof requestBody === 'function' ? requestBody() : requestBody),
        }).then((res) => {
          if (res) {
            content.cardMsg = {
              msgTitle: res.cardTitle,
              msgDesc: res.cardDesc,
              msgUrl: res.cardUrl,
              msgIcon: res.cardLogo,
              msgInfo: res,
              msgType: cardType || 'MSG',
            };
            MessageHandler.postMessage({ type: 'SEND_MENU', content }, '*');
          }
        });
        clearInterval(timer);
      }
    }, 100);
  };

  openPurchaseHelper = () => {
    this.sendMenu();
    const {
      updateIframeInstance,
      updateCtxChatOpen,
      cancelMsgNotice,
      showChatOnline,
      purchaseHelpServices,
    } = this.props;
    updateCtxChatOpen(true);
    const SimplePage = observer((_props) => {
      const { modal } = _props;
      const [url, setUrl] = useState(urlLoading);
      const loading = url === urlLoading;
      const {
        webConfig: { isSecondWebSite, srmUrl },
      } = getUserConfigInfo();
      const srmUrlSrc = `${
        isSecondWebSite ? `${srmUrl}/app` : SRM_PATH
      }/pub/smbl/chat-hub${fillUrlToken()}`;
      useEffect(() => {
        // 开通多个助手或者需要在线沟通, 打开即刻3.0壳子
        if (
          showChatOnline ||
          purchaseHelpServices.some(
            (key) => !['JIKE_NLP_ALI_V1', 'JIKE_NLP_WULAI_V1'].includes(key)
          )
        ) {
          modal.update({
            style: {
              width: '1000px',
              minWidth: '900px',
            },
          });
          setUrl('');
        } else {
          // 只开通问答助手
          request(
            `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/application-market-client/has-order-quota-purchase`
          ).then((res) => {
            if (getResponse(res)) {
              setUrl(res[0]?.url);
            }
          });
        }
        cancelMsgNotice();
      }, []);

      return (
        <Spin spinning={loading}>
          {this.observerData.dragFlag && (
            <div style={{ height: '100%', width: '100%', position: 'absolute' }} />
          )}
          {loading ? (
            <div style={{ height: '100%', width: '100%' }} />
          ) : url ? (
            <iframe
              src={url}
              ref={updateIframeInstance}
              id="purchaseHelper"
              title="purchaseHelper"
              width="100%"
              height="100%"
              frameBorder="none"
              style={{ border: 'none' }}
            />
          ) : (
            <div id="purchaseHelper" style={{ height: '100%' }}>
              <iframe
                src={srmUrlSrc}
                ref={updateIframeInstance}
                id="purchaseHelper"
                title="purchaseHelper"
                width="100%"
                height="100%"
                frameBorder="none"
                style={{ border: 'none' }}
              />
              {/* 商城非微前端无法内嵌，切换为iframe单点 */}
              {/* <EmbedPage contentStyle={{ height: '100%' }} href="/pub/smbl/chat-hub" /> */}
            </div>
          )}
        </Spin>
      );
    });

    const modal = Modal.open({
      drawer: true,
      style: {
        width: '742px',
      },
      className: styles['issue-modal'],
      children: <SimplePage />,
      footer: null,
      resizable: true,
      mask: false,
    });
    const closeCallback = () => {
      modal.close();
      MessageHandler.cancel('CLOSE_IFRAME', closeCallback);
    };
    MessageHandler.on('CLOSE_IFRAME', closeCallback);
  };

  render() {
    const { showExpandTools, msgCount } = this.state;
    const {
      robotInfo,
      partnerInfo,
      handleIconMouseDown,
      enabledFlag,
      enabledCloopmFlag,
      enabledPurHelper,
      purHelperIcon,
      whichMsg,
    } = this.props;
    let partnerCodeArr = [];
    let serviceCodes = [];
    if (partnerInfo && partnerInfo.length > 0) {
      partnerCodeArr = (partnerInfo[0].partnerCode || '').split(',');
      serviceCodes = (partnerInfo[0].serviceCode || '').split(',');
    }
    const hasPartner = ['DING_TALK', 'EN_WECHAT', 'WECHAT'].some((item) =>
      partnerCodeArr.includes(item)
    );
    const hasPurHelperMsg = whichMsg.has('default');
    const noticeClassName = hasPurHelperMsg ? styles.news : '';
    return (
      <div
        className={styles.content}
        ref={(el) => {
          this.draggable = el;
        }}
        onMouseDown={(e) => handleIconMouseDown(e, this.draggable)}
        // style={{ opacity: isMoving ? '0' : '' }}
      >
        <div
          className={styles['content-wrapper']}
          style={{ display: showExpandTools ? '' : 'none' }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          {!isEmpty(partnerInfo) &&
            hasPartner &&
            serviceCodes.includes('WECHAT_MERCHANT_ROBOT_V1') && (
              <div className={styles['wechat-icon']}>
                <Tooltip
                  placement="left"
                  title={intl.get('srm.helpRobot.view.title.IMCollaborationTool').d('IM协同工具')}
                >
                  <img
                    draggable="false"
                    src={wechatImg}
                    alt="wechat-img"
                    width={24}
                    height={24}
                    onClick={this.openWeChat}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    style={{ backgroundColor: '#fff', borderRadius: '50%' }}
                  />
                </Tooltip>
              </div>
            )}
          {enabledFlag && (
            <div
              className={styles['robot-icon']}
              style={{ display: robotInfo.robotDisplay, position: 'relative' }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              {msgCount ? (
                <span className={styles['sub-count']}>{msgCount > 99 ? '99+' : msgCount}</span>
              ) : (
                ''
              )}
              <Tooltip placement="left" title={robotInfo.title}>
                <img
                  draggable="false"
                  src={onlineServicesSvg}
                  alt="help-robot-img"
                  width={30}
                  height={30}
                  onClick={this.openRobotChat}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  className="help-robot-img"
                  style={{ boxShadow: 'none' }}
                />
              </Tooltip>
            </div>
          )}
          {enabledCloopmFlag && this.renderIssueEnter()}
          {enabledPurHelper && (
            <div className={styles['purchase-helper-wrapper']}>
              <div
                className={['purchase-helper', noticeClassName, noticeClassName ? styles.small : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {hasPurHelperMsg ? <span className={styles['red-dot']} /> : null}
                <Tooltip
                  placement="left"
                  title={intl.get('srm.helpRobot.view.title.purchaseHelper').d('即刻')}
                >
                  <img
                    draggable="false"
                    src={purHelperIcon || purchaseHelperImg}
                    alt="help-purchase-img"
                    width={30}
                    height={30}
                    style={{ objectFit: 'contain' }}
                    onClick={this.openPurchaseHelper}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          )}
        </div>
        <div className={[styles.entryIcon, noticeClassName].join(' ')}>
          <div className={styles.tools}>
            <img
              draggable="false"
              src={showExpandTools ? iconSelect : iconDefault}
              alt={showExpandTools ? 'select-icon-img' : 'default-icon-img'}
            />
            {msgCount > 0 || (enabledPurHelper && hasPurHelperMsg) ? (
              <span className={styles['red-dot']} />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
