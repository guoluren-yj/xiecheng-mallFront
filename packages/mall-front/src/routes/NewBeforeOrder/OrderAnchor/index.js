import React, { useState, useEffect } from 'react';
import { Anchor } from 'choerodon-ui';
import Icon from 'components/Icons';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import style from './index.less';

const { Link } = Anchor;

export default function AnchorPro(props) {
  const { list = [] } = props;
  const [targetOffset, setTargetOffset] = useState();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  document.body.addEventListener('scroll', () => {
    const anchorActiveOffsetTop = document.getElementsByClassName('c7n-anchor-link-active')[0]
      ?.offsetTop;
    if (document.getElementsByClassName('anchor-body')?.[0]) {
      if (anchorActiveOffsetTop / 389 > 1) {
        document.getElementsByClassName('anchor-body')[0].scrollTop =
          math.floor(anchorActiveOffsetTop / 389) * 389;
      } else {
        document.getElementsByClassName('anchor-body')[0].scrollTop = 0;
      }
    }
  });

  useEffect(() => {
    window.addEventListener('resize', () => {
      setWindowWidth(window.innerWidth);
    });
    return () => {
      window.removeEventListener('resize', () => {
        setWindowWidth(window.innerWidth);
      });
    };
  }, []);

  useEffect(() => {
    setTargetOffset(window.innerHeight / 2 - 80);
  }, []);

  function handleTitle(item, index) {
    let className = '';
    let iconType = '';
    switch (item?.error) {
      case true:
        className = 'error';
        iconType = 'work_log_wrong';
        break;
      case false:
        className = 'success';
        iconType = 'work_log_right';
        break;
      default:
        iconType = 'work_empty';
        break;
    }
    return (
      <>
        <span>{index + 1}</span>
        <Icon type={iconType} className={className} />
      </>
    );
  }

  return (
    <div className={style['order-anchor']} style={{ left: (windowWidth - 1190 - 80 - 50) / 2 }}>
      <Anchor targetOffset={targetOffset} getContainer={() => document.querySelector('body')}>
        <div className="anchor-header">
          {intl
            .get('mallf.common.view.order.quantity', { value: list?.length })
            .d(`共${list?.length}单`)}
        </div>
        <div className="anchor-body">
          {list.map((m, index) => (
            <Link href={`#${index}`} title={handleTitle(m, index)} className="anchor-link" />
          ))}
        </div>
      </Anchor>
    </div>
  );
}
