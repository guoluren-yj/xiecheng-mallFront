import React, { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { smoothScrollTo } from 'utils/utils';
import Image from 'components/Image';
import PageFixed from 'components/PageFixed';
import useEventListener from 'hooks/useEventListener';
import styles from './index.less';

const ViewMore = (props) => {
  const [expand, setExpand] = useState(false);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const content = document.getElementById(`view-more-content-${props.id}`);
    if (content) {
      setTimeout(() => {
        setIsOver(content.scrollHeight > props.maxHeight);
      }, 100);
    }
  }, [props.children]);

  return (
    <div className={styles['view-more-container']}>
      <div
        className="view-more-wrapper"
        style={expand ? { height: 'auto' } : { maxHeight: props.maxHeight }}
      >
        <div className="view-more-content" id={`view-more-content-${props.id}`}>
          {props.children}
        </div>
      </div>
      <span className="view-more-btn" r-if={isOver} onClick={() => setExpand((flag) => !flag)}>
        {expand
          ? intl.get('mallf.common.button.stowMore').d('收起更多')
          : intl.get('mallf.common.button.viewMore').d('查看更多')}
        <Icon type={expand ? 'expand_less' : 'expand_more'} />
      </span>
    </div>
  );
};

const Anchor = (props) => {
  const { links = [] } = props;

  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    handleScroll();
  }, [links]);

  useEventListener(
    'scroll',
    (e) => {
      handleScroll(e);
    },
    window,
    true
  );

  function handleScroll() {
    const key = links.reduce((k, link) => {
      if (k) return k;
      const dom = document.getElementById(link.key);
      if (dom) {
        const rect = dom.getBoundingClientRect();
        if (rect.top + rect.height - 122 > 0) {
          return link.key;
        }
      }
      return '';
    }, '');
    setActiveKey(key);
  }

  function handleScrollTo(key) {
    const container = document.getElementById('product-detail-tabs');
    const anchorDom = document.getElementById(key);
    if (container && anchorDom) {
      const targetScrollTop = container.offsetTop + anchorDom.offsetTop - 122;
      smoothScrollTo(targetScrollTop);
    }
  }

  return (
    <div className="book-anchor-links">
      {links.map((m) => {
        return (
          <div
            key={m.key}
            r-title
            className={classNames([
              'book-anchor-link text-overflow',
              { 'book-anchor-link-active': m.key === activeKey },
            ])}
            onClick={() => handleScrollTo(m.key)}
          >
            {m.title}
          </div>
        );
      })}
    </div>
  );
};

export default function BookDetail(props) {
  const { bookAttrList, bookDetailList } = props;

  // 内容区域渲染数据
  const details = [];

  // 找到图片
  const imageInfo = bookDetailList?.find((f) => f.bookDetailKey === 'image');

  // 基本信息由属性加图片构成
  if (!isEmpty(bookAttrList) || imageInfo) {
    const imgList = imageInfo ? imageInfo?.bookDetailValue?.split(';') : [];
    details.push({
      title: intl.get('mallf.common.view.baseInfo').d('基本信息'),
      key: '_bookDetailBaseInfo',
      content: (
        <div className="book-base-info">
          <div className="book-base-attrs" r-if={!isEmpty(bookAttrList)}>
            {bookAttrList.map((m) => (
              <div className="base-attrs-item" key={m.bookAttrId}>
                <div className="base-attrs-item-label text-overflow" r-title>
                  {m.bookAttrNameMeaning}
                </div>
                <div className="base-attrs-item-content text-overflow" r-title>
                  {m.bookAttrValue || '-'}
                </div>
              </div>
            ))}
          </div>
          <div className="book-base-image" r-if={imageInfo}>
            {imgList.map((m) => (
              <div>
                <Image value={m} />
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  if (!isEmpty(bookDetailList)) {
    bookDetailList.forEach((f) => {
      if (f.bookDetailKey !== 'image') {
        details.push({
          title: f.bookDetailKeyMeaning,
          key: f.bookDetailKey,
          content: (
            <ViewMore maxHeight={308} id={f.bookDetailId}>
              {f.bookDetailValue}
            </ViewMore>
          ),
        });
      }
    });
  }

  return (
    <div className={styles['book-detail-wrapper']}>
      <div className="book-detail-content">
        {details.map((m) => {
          return (
            <div className="book-detail-area" key={m.key} id={m.key}>
              <div className="book-detail-area-title">{m.title}</div>
              <div className="book-detail-area-content">{m.content}</div>
            </div>
          );
        })}
      </div>
      <div className="book-detail-anchor">
        <div className="book-anchor-header text-overflow" r-title>
          {intl.get('mallf.common.view.title.quickEdit').d('快速定位')}
        </div>
        <Anchor links={details} />
      </div>
      <PageFixed fixId="product-detail-tabs" fixTop={122} zIndex={999}>
        <div className="book-detail-anchor book-detail-anchor-fixed">
          <div className="book-anchor-header text-overflow" r-title>
            {intl.get('mallf.common.view.title.quickEdit').d('快速定位')}
          </div>
          <Anchor links={details} />
        </div>
      </PageFixed>
    </div>
  );
}
