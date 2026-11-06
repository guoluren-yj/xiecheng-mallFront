import React, { useState, useEffect } from 'react';
import { Button, Message } from 'choerodon-ui/pro';
import { postCaptchaService } from 'services/userInfoService';

let timer;
function ValidateButton(props) {
  const { userInfo, callback = (e) => e } = props;
  const field = 'phone';
  const [seconds, setSeconds] = useState(60);
  const [postCaptchaLoading, setPostCaptchaLoading] = useState(false); // 按钮加载效果
  const [startCountDown, setStartCountDown] = useState(false);

  // 发送验证码
  function postCaptcha() {
    setPostCaptchaLoading(true);
    postCaptchaService({
      field,
      account: userInfo.phone,
      businessScope: 'UPDATE_PASSWORD',
    })
      .then((res) => {
        if (res) {
          // 成功发送请求
          Message.success(res.message);
          callback(res.captchaKey);
          // 不成功则不进行倒计时
          countDown();
          setStartCountDown(true);
        }
      })
      .finally(() => {
        setPostCaptchaLoading(false);
      });
  }

  // 开始倒计时
  function countDown() {
    setSeconds(60);
    timer = setInterval(() => {
      setSeconds((second) => second - 1);
    }, 1000);
  }

  useEffect(() => {
    if (seconds <= 0) {
      clearInterval(timer);
      setStartCountDown(false);
    }
  }, [seconds]);

  return (
    <Button
      onClick={postCaptcha}
      disabled={startCountDown}
      loading={postCaptchaLoading}
      style={
        startCountDown ? { width: 100, backgroundColor: '#f5f5f5', color: '#999' } : { width: 100 }
      }
    >
      {startCountDown ? `${seconds}秒` : `发送验证码`}
    </Button>
  );
}
export default ValidateButton;
