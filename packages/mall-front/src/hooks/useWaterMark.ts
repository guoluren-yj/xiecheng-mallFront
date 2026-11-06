import { useState, useEffect, useMemo } from 'react';
// import ResizeObserver from 'resize-observer-polyfill';

import { watermark, cacWaterMark } from 'utils/watermark';
import { getCurrentUser } from 'utils/utils';

type WaterMarkProps = {
  container: Element,
}

type ConfigType = {
  [name: string]: number,
}

export default function useWaterMark(props: WaterMarkProps) {
  const { realName, loginName, waterMarkFlag } = getCurrentUser();
  const [observerFlag, setObserverFlag] = useState(true);

  const { container } = props;

  const maskContainer = useMemo(() => {
    if(container) {
      const dom = document.createElement('div');
      dom.className = 'mask_container';
      dom.style.width = `${window.innerWidth}px`;
      dom.style.height = `${window.innerHeight}px`;
      dom.style.position = 'fixed';
      container.appendChild(dom);
      return dom;
    }
  }, [container]);

  function initWaterMark() {
    if(maskContainer) {
      const oldWater = container.querySelectorAll('.mask_mark');
      const config: ConfigType = cacWaterMark(maskContainer);
      const newMaskNums = config.watermark_cols * config.watermark_rows;
      if (newMaskNums === oldWater.length) {
        return;
      }
      if (oldWater.length > 0) {
        oldWater.forEach((node) => {
          maskContainer.removeChild(node);
        });
      }
      if (waterMarkFlag) {
        watermark(`${loginName}-${realName}-${new Date().toLocaleDateString()}`, config, maskContainer);
        setObserverFlag(!observerFlag);
      }
    }
  }

  useEffect(() => {
    if(container) {
      initWaterMark();
      if(!maskContainer) return;
      const resizeObs = new MutationObserver(() => {
        resizeObs.disconnect();
        maskContainer.innerHTML = '';
        initWaterMark();
      });
      resizeObs.observe(maskContainer, {
        childList: true, // 子节点增删改
        attributes: true, // 自身属性变化
        characterData: true, // 自身文本内容变化
        subtree: true, // 适用容器内所有节点
      });
    }
  }, [container, maskContainer, observerFlag, loginName, waterMarkFlag]);
}

