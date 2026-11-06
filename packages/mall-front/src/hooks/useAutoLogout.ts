import { useRef, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { openCountDownModal } from "utils/modals/index";
import { logout } from 'services/api';
import intl from 'utils/intl';
import webSocketManagener from 'hzero-front/lib/utils/webSoket';
import { getAccessToken } from 'hzero-front/lib/utils/utils';

interface Props {
  duration: number
}

enum Events {
  "mousemove", // 鼠标移动
  "mouseup", // 鼠标松开按键
  "keydown", // 松开按键
  "touchstart"
}

export default function useAutoLogout(props: Props) {
  const { duration } = props;
  const lastDuration = 30; // 触发倒计时 s

  const timerId = useRef<number | null>(null);
  const { AUTO_LOGOUT_METHOD } = (window as any).$$env;
  const isWebScoket = AUTO_LOGOUT_METHOD === 'server';

  const checkTimeStampAndRestart = (time:number): boolean  => { // 检查时间差距
    const timeStamp = window.localStorage.getItem('EVENT_LISTENER_STAMP');
    if (timeStamp) {
      const diff = Number(timeStamp) - Date.now() + time;
      if (diff > 0) {
        closeTimer()
        startTimer(diff);
        return true;
      }
    }
    return false;
  };

  const onLastTip = useCallback(()=>{
    openCountDownModal({
      modalConfig: {
        title: intl.get(`hzero.common.view.message.expired.title`).d('超时提醒'),
        okText: intl.get(`mallf.common.button.cancel`).d('取消'),
        cancelButton: false,
        style: { zIndex: 9999999 },
        onOk: () => {
          debounceRefresh();
        },
      },
      initialTime: lastDuration,
      render: (countdown)=>{
        return `${intl.get(`hzero.common.view.message.expired.before`).d('系统将在') }${countdown}s${ intl.get(`hzero.common.view.message.expired.after`).d('后自动退出')}`;
      },
      afterCountEnd: ()=>{
        if(!checkTimeStampAndRestart(lastDuration)){
          logout();
        }
      },
    });
  }, []);

  const startTimer = useCallback((time?: number)=>{ // 开启定时器
    if(!timerId.current){
      const newTime = time || (duration * 60 - lastDuration) * 1000
      window.localStorage.setItem('EVENT_LISTENER_STAMP', (Date.now() + newTime).toString());
      const timer = setTimeout(()=>{
        if (!checkTimeStampAndRestart(0)) { // 检查
          // 最后倒计时弹窗
          onLastTip();
          timerId.current = null;
        }
      }, newTime);
      timerId.current = timer as unknown as number;
    }
  }, []);

  const closeTimer = useCallback(()=>{ // 关闭定时器
    if(timerId.current){
      clearTimeout(timerId.current as unknown as number);
      timerId.current = null;
    }
  }, []);

  const refresh = ()=>{ // 关闭旧定时器 开启新定时器
    closeTimer();
    startTimer();
  };

  const handleMessage = (event:any) => {
    if (event.origin === window.location?.origin && event?.data === 'needLogout') { // 判断是否需要退出
      logout();
    }
  }

  const debounceRefresh = debounce(() => {
    // 发送token
    if(webSocketManagener.sendOnlyMessage && isWebScoket){
      const accessToken = getAccessToken();
      webSocketManagener.sendOnlyMessage(accessToken);
    } else {
      refresh();
    }
  }, 1000); // 多事件频率高，防抖一下

  // const websocketDebounce = debounce(refresh, 1000)

  useEffect(() => {
    // startTimer();
    if (webSocketManagener?.socketStatus !== 32 && isWebScoket) {
      webSocketManagener.initWebSocket();
    }

    // 添加监听，收到消息，刷新时间
    // if(webSocketManagener.addListener){
    //   webSocketManagener.addListener('LOGOUT', websocketDebounce);
    // }

    Object.values(Events).forEach((e)=>{
      document.addEventListener(e as string, debounceRefresh, false);
    });

    // 当其他页签手动退出时，当前页签也自动退出
    window.addEventListener("message", handleMessage);

    return () => {
      closeTimer();
      // if(webSocketManagener.removeListener){
      //   webSocketManagener.removeListener('LOGOUT', websocketDebounce)
      // }
      if (webSocketManagener?.destroyWebSocket && isWebScoket) {
        webSocketManagener.destroyWebSocket();
      }
      Object.values(Events).forEach((e)=>{
        document.removeEventListener(e as string, debounceRefresh, false);
      });
      window.removeEventListener("message", handleMessage)
    };
  }, [isWebScoket]);

  return null;
}
