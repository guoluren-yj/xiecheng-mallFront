import React from 'react';
import intl from 'utils/intl';

export default function Tag({
  color = '#ccc',
  text = intl.get('mallf.commonImport.view.tag').d('标签'),
  className = '',
  style = {},
}) {
  const styles = {
    paddingLeft: 2,
    paddingRight: 2,
    width: 60,
    height: 20,
    borderRadius: 2,
    borderStyle: 'solid',
    borderColor: color,
    borderWidth: 1,
    color,
    display: 'inline-block',
    textAlign: 'center',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    ...style,
  };
  return (
    <span className={`mall-tag ${className}`} style={styles} title={text}>
      {text}
    </span>
  );
}
