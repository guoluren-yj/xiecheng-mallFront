import React, { useState, useEffect } from 'react';
import styles from './index.less';

function Tags(props) {
  const { type } = props;
  const [tagClassName, setTagClassName] = useState('info');

  useEffect(() => {
    let className;
    switch (type) {
      case 'info':
        className = 'tag-info';
        break;
      case 'cancel':
        className = 'tag-cancel';
        break;
      case 'failed':
        className = 'tag-failed';
        break;
      case 'new':
        className = 'tag-new';
        break;
      default:
        className = 'tag-success';
        break;
    }
    setTagClassName(className);
  }, [type]);
  return (
    <div {...props} className={`${styles[tagClassName]} ${styles.tag}`}>
      {props.children}
    </div>
  );
}

export default Tags;
