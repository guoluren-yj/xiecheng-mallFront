import React, { useState, useEffect, useRef } from 'react';
import { getEncodeFileUrl } from 'utils/utils';
import CuxFn from '@/cuxTools/cuxFn';
import defaultImg from '@/assets/images/no-product-img.svg';
import styles from './index.less';

export default function Image(props) {
  const {
    boxId,
    style = {},
    className = '',
    wrapperClassName = '',
    width,
    height,
    value,
    id = '',
    alt = '',
    title = '',
    boxStyle = {},
    imgStyle = {},
    imgInfo,
    ...OtherProps
  } = props;
  style.width = width;
  style.height = height;

  const [src, setSrc] = useState();
  const [errorNum, setErrorNum] = useState(1);

  useEffect(() => {
    if (value) {
      setSrc(`${value}`);
    } else {
      setSrc(defaultImg);
    }
  }, [value]);

  const boxRef = useRef();
  const imgRef = useRef();

  style.Width = 'auto';
  style.Height = 'auto';

  if (imgRef.current?.width > imgRef.current?.height) {
    style.maxWidth = width;
    style.minWidth = width;
  } else if (imgRef.current?.width < imgRef.current?.height) {
    style.minHeight = height;
    style.maxHeight = height;
  } else if (width > height) {
    style.Height = height;
  } else {
    style.Width = width;
  }

  const valueIsHtml =
    value && /<[a-z]+\d?(\s+[\w-]+=("[^"]*"|'[^']*'))*\s*\/?>|&#?\w+;/i.test(value);

  // 图片加载失败处理
  const handleImgUrlError = () => {
    const index = src.indexOf('@');
    if ((index === -1 && !src.includes('isrm')) || errorNum > 1) {
      setSrc(defaultImg);
    } else if (errorNum === 1) {
      // 第一次报错
      setSrc(getEncodeFileUrl(src));
    }
    setErrorNum((pre) => pre + 1);
  };

  return (
    <div
      ref={boxRef}
      id={boxId}
      style={{
        background: '#fff',
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...boxStyle,
      }}
      className={wrapperClassName}
    >
      <div style={{ position: 'relative' }}>
        {valueIsHtml ? (
          <div
            className={styles['img-html-wrapper']}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: value }}
            style={{ width, height, overflow: 'hidden' }}
          />
        ) : (
          <img
            ref={imgRef}
            src={src}
            id={id}
            style={{
              maxWidth: style.width,
              maxHeight: style.height,
              minWidth: style.minWidth,
              minHeight: style.minHeight,
              width: style.Width,
              height: style.Height,
              display: 'inline-block',
              ...imgStyle,
            }}
            alt={alt}
            title={title}
            className={`imagePath ${className}`}
            onError={() => handleImgUrlError()}
            {...OtherProps}
          />
        )}
        {CuxFn({
          name: 'Image-fn-renderTag',
          value: { imgInfo },
        })(function () {})()}
      </div>
    </div>
  );
}
