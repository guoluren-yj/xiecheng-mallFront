import React from 'react';
import { Icon } from 'choerodon-ui';
import classNames from 'classnames';
import styles from './index.less';

export default function Suffix({ toggleModal, handleClear, allowClear, inputValue, disabled }) {
  return (
    <div className={styles['lov-suffix']}>
      {allowClear && inputValue && (
        <Icon
          onClick={handleClear}
          className={classNames({
            'delete-icon': true,
            'hover-delete-icon': true,
          })}
          type="close"
        />
      )}
      <Icon
        onClick={() => {
          if (!disabled) {
            toggleModal();
          }
        }}
        className="search-icon"
        type="search"
      />
    </div>
  );
}
