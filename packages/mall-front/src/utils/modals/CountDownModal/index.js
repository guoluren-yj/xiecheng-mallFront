import React, { useState, useEffect } from 'react';
import { isFunction } from 'lodash';

export default function CountDownModal(props) {
  const { modal, initialTime, render, afterCountEnd } = props || {};
  const [countdown, setCountdown] = useState(initialTime); // 倒计时

  useEffect(() => {
    // 倒计时
    if (countdown > 0) {
      const countdownClock = setInterval(() => {
        setCountdown((counts) => counts - 1);
      }, 1000);
      return () => {
        clearInterval(countdownClock);
      };
    } else {
      modal.close();
      if (isFunction(afterCountEnd)) {
        afterCountEnd();
      }
    }
  }, [countdown]);

  return <>{isFunction(render) ? render(countdown) : countdown}</>;
}
