import React, { useMemo, useState, useEffect } from 'react';
import { DataSet, Icon, Dropdown } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';

import styles from './index.less';

const DropSelect = observer((props) => {
  const {
    name,
    dataSet,
    style,
    optionsData = [],
    placement,
    defaultText,
    onChange = (e) => e,
  } = props;

  const [val, setVal] = useState('');

  const emptyDataSet = useMemo(() => new DataSet({ paging: false }), []);

  useEffect(() => {
    if (optionsData && optionsData.length > 0) {
      emptyDataSet.loadData(optionsData);
    }
  }, [optionsData]);

  const isBindDs = name && dataSet;

  const getFieldProp = (propName) => {
    if (isBindDs && dataSet.getField(name)) {
      return dataSet.getField(name).get(propName);
    }
    return props[propName];
  };

  const options = getFieldProp('options') || emptyDataSet;
  const valueField = getFieldProp('valueField') || 'value';
  const textField = getFieldProp('textField') || 'meaning';
  const defaultValue = getFieldProp('defaultValue');

  const currentValue =
    isBindDs && dataSet.current ? dataSet.current.get(name) : props.value || val || defaultValue;

  const handleSelect = (item) => {
    const value = item.get(valueField);
    if (value === val) return;
    if (isBindDs && dataSet.current) {
      dataSet.current.set(name, value);
    }
    onChange(value, item.toData());
    setVal(value);
  };

  const getText = () => {
    const findItem = options.find((f) => f.get(valueField) === currentValue);
    if (findItem) {
      return findItem.get(textField);
    }
    return defaultText || currentValue;
  };

  const overlay =
    options.length > 1 ? (
      <div className={styles['c7n-drop-select-menu']}>
        {options.map((m) => (
          <div
            className={classNames({
              'c7n-drop-select-item': true,
              'c7n-drop-select-item-active': m.get(valueField) === currentValue,
            })}
            key={m.get(valueField)}
            onClick={() => handleSelect(m)}
          >
            {m.get(textField)}
          </div>
        ))}
      </div>
    ) : null;

  return (
    <Dropdown trigger="click" overlay={overlay} placement={placement}>
      <div className={styles['c7n-drop-select']} style={style}>
        <div className="c7n-drop-text">{getText() || '-'}</div>
        <Icon type="expand_more" r-if={options.length > 1} />
      </div>
    </Dropdown>
  );
});

export default DropSelect;
