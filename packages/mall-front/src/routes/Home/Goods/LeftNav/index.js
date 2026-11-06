import React, { useEffect, useState, useMemo } from 'react';
import { getAccessToken, getCurrentLanguage } from 'utils/utils';
import Icons from 'components/Icons';
import useScroll from '@/hooks/useScroll';
import { math } from 'choerodon-ui/dataset';
import OverflowTip from 'components/OverflowTip';
import { Icon } from 'choerodon-ui/pro';
import styles from './index.less';

let _products = [];
// let clickId;
const barTop = {};
function LeftNav(props) {
  const { products, barProducts, customBarShow, isBarUpdateIds } = props;
  _products = products;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeBarId, setActiveBarId] = useState(products[0]?.customId);
  const [isNavTop, setIsNavTop] = useState(true);
  const [isNavBottom, setIsNavBottom] = useState(false);
  const { scrollTop } = useScroll();
  const showNavFlag = useMemo(
    () => scrollTop > 300 && windowWidth >= 1340 && products.length > 1 && getAccessToken(),
    [scrollTop, windowWidth, products]
  );
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWindowWidth(window.innerWidth);
    });
    document.body.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', () => {
        setWindowWidth(window.innerWidth);
      });
      document.body.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function calcNavOffset() {
    const element = document.getElementsByClassName('nav-bar-list')?.[0];
    if (element) {
      const isNavBottomFlag = element.scrollHeight - element.scrollTop === element.clientHeight;
      const isNavTopFlag = element.scrollTop === 0;
      setIsNavBottom(isNavBottomFlag);
      setIsNavTop(isNavTopFlag);
    }
  }

  function handleScroll() {
    if (_products.length > 0) {
      _products.forEach((p) => {
        barTop[p.customId] =
          document.getElementById(`customId${p.customId}`).offsetTop -
          document.documentElement.scrollTop;
      });
      Object.keys(barTop).forEach((key) => {
        const ele = document.getElementById(`customId${key}`);
        if (ele) {
          const rect = ele.getBoundingClientRect();
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          if (inView) {
            setActiveBarId(key);
          }
        }
      });
    }
  }

  function scrollNav(top) {
    const target = document.getElementsByClassName('nav-bar-list')?.[0];
    if (target) {
      target.scrollTo({
        top, // 滚动到顶部的位置
        behavior: 'smooth', // 平滑滚动
      });
    }
  }

  function scrollNavUp() {
    if (isNavTop) return;
    const target = document.getElementsByClassName('nav-bar-list')?.[0];
    if (target) {
      const { clientHeight, scrollTop: scrollTopA } = target;
      scrollNav(scrollTopA - clientHeight);
    }
  }
  function scrollNavDown() {
    if (isNavBottom) return;
    const target = document.getElementsByClassName('nav-bar-list')?.[0];
    if (target) {
      const { clientHeight, scrollTop: scrollTopA } = target || {};
      scrollNav(clientHeight + scrollTopA);
    }
  }

  function handleNavScroll() {
    const element = document.getElementsByClassName('nav-active')?.[0];
    const target = document.getElementsByClassName('nav-bar-list')?.[0];
    if (target && element) {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const containerTop = target.getBoundingClientRect().top;
      const containerBottom = containerTop + target.clientHeight;
      if (elementBottom <= containerTop) {
        // 上方隐藏
        scrollNavUp();
      } else if (elementTop >= containerBottom) {
        // 下方
        scrollNavDown();
      }
    }
  }

  useEffect(() => {
    handleNavScroll();
  }, [activeBarId]);

  useEffect(() => {
    calcNavOffset(); // 展示隐藏时都需要计算一下上下 不然会被回到顶部影响
    if (showUpDownFlag && document.getElementsByClassName('nav-bar-list')?.[0]) {
      document.getElementsByClassName('nav-bar-list')[0].addEventListener('scroll', calcNavOffset);
    }
    return () => {
      if (showUpDownFlag && document.getElementsByClassName('nav-bar-list')?.[0]) {
        document
          .getElementsByClassName('nav-bar-list')[0]
          .removeEventListener('scroll', calcNavOffset);
      }
    };
  }, [showNavFlag]);

  /**
   * 动画垂直滚动到页面指定位置
   * @param { Number } currentY 当前位置
   * @param { Number } targetY 目标位置
   */
  function scrollAnimation(currentY, targetY) {
    // 计算需要移动的距离
    const needScrollTop = targetY - currentY;
    let _currentY = currentY;
    setTimeout(() => {
      // 一次调用滑动帧数，每次调用会不一样
      const dist = math.ceil(needScrollTop / 5);
      _currentY += dist;
      if (document.body.scrollTo) {
        document.body.scrollTo(0, currentY);
      } else {
        window.scrollTo(0, currentY);
      }
      // 如果移动幅度小于十个像素，直接移动，否则递归调用，实现动画效果
      if (needScrollTop > 5 || needScrollTop < -5) {
        scrollAnimation(_currentY, targetY);
      } else if (document.body.scrollTo) {
        document.body.scrollTo(0, targetY);
      } else {
        window.scrollTo(0, targetY);
      }
    }, 1);
  }

  function jumptActiveBar(id) {
    if (activeBarId === id) return;
    let top;
    // clickId = id;
    const sTop =
      document.body.scrollTop ||
      document.documentElement.scrollTop ||
      document.querySelector('.gb-wrapper').scrollTop;
    if (sTop < 570) {
      top = document.getElementById(`customId${id}`).offsetTop - 250;
    } else {
      top = document.getElementById(`customId${id}`).offsetTop - 85;
    }
    // clickId = id;
    scrollAnimation(document.body.scrollY, top);
    // handleScroll();
    setTimeout(() => {
      // clickId = null;
      setActiveBarId(id);
    }, 50);
  }

  function renderBarName(name) {
    if (getCurrentLanguage() === 'en_US') {
      // 单独处理英文环境
      return (
        <p style={{ height: 40, lineHeight: '40px', fontSize: '12px', transform: 'scale(0.8)' }}>
          <OverflowTip>{name}</OverflowTip>
        </p>
      );
    }
    if (name.length >= 4 && name.length <= 5) {
      return (
        <>
          <p>{name.slice(0, 2)}</p>
          <p>{name.slice(2)}</p>
        </>
      );
    } else if (name.length > 5) {
      return (
        <>
          <p>{name.slice(0, 3)}</p>
          <p>{name.slice(3, 6)}</p>
        </>
      );
    } else {
      return <p style={{ height: 40, lineHeight: '40px' }}>{name}</p>;
    }
  }

  const newBarList = useMemo(() => {
    const newProducts = products.filter((n) => {
      const { products: prdt = [], update = false } =
        barProducts.find((f) => f.customId === n.customId) || {};
      return !(
        customBarShow === 'HIDE' &&
        (n.customType === 4
          ? (n.customTagLineList || []).length === 0
          : prdt.length === 0 && isBarUpdateIds.includes(n.customId) && !update)
      );
    });
    return newProducts;
  }, [products, barProducts, customBarShow]);

  const showUpDownFlag = useMemo(() => newBarList.length > 8, [newBarList]);

  return (
    <>
      {showNavFlag && (
        <ul className={styles['left-nav']} style={{ left: (windowWidth - 1190 - 80 - 50) / 2 }}>
          {showUpDownFlag && (
            <li
              className="nav-bar-scroll nav-bar-up"
              onClick={() => {
                scrollNavUp();
              }}
            >
              <Icon type="keyboard_arrow_up" style={{ color: isNavTop ? '#BEBEBE' : '' }} />
            </li>
          )}
          <div className="nav-bar-list">
            {newBarList.map((p) => {
              return (
                <li
                  onClick={() => {
                    jumptActiveBar(p.customId);
                  }}
                  className={
                    // eslint-disable-next-line eqeqeq
                    p.customId == activeBarId ? 'nav-active' : ''
                  }
                >
                  {renderBarName(p.simpleCustomName || p.customName)}
                </li>
              );
            })}
          </div>
          {showUpDownFlag && (
            <li
              className="nav-bar-scroll nav-bar-down"
              onClick={() => {
                scrollNavDown();
              }}
            >
              <Icon type="keyboard_arrow_down" style={{ color: isNavBottom ? '#BEBEBE' : '' }} />
            </li>
          )}
          <li
            onClick={() => {
              scrollAnimation(window.scrollY, 0);
            }}
            className="nav-top"
          >
            <Icons type="pull" style={{ color: '#fff', display: 'block', lineHeight: '18px' }} />
            TOP
          </li>
        </ul>
      )}
    </>
  );
}

export default LeftNav;
