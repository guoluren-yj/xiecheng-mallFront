import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TextField, Menu, Dropdown } from 'choerodon-ui/pro';
import { Icon, Popover } from 'choerodon-ui';

import useUpdateEffect from 'hooks/useUpdateEffect';
import intl from 'utils/intl';
import { isNil } from 'lodash';

import NewMyMallSearchLess from './index.less';

const NewMyMallSearch = forwardRef((props, ref) => {
  const { configs = [], onSearch = (e) => e, autoQuery = true } = props;
  const defaultSearchConfig = configs?.find((c) => !!c.defaultFlag) || {};
  const otherSerachConfigs = configs?.filter((c) => !c.defaultFlag);
  const [searchObj, setSearchObj] = useState({});

  useImperativeHandle(ref, () => ({
    getQueryParameter,
  }));

  // 设置默认值
  useEffect(() => {
    checkArray();
    configs.forEach((config) => {
      const { defaultValue, fieldType, fieldCode, filedContent = [], lovInfo = {} } = config;
      const { valueField = 'value' } = lovInfo;
      const defaultValueObj = filedContent.find((c) => c?.[valueField] === defaultValue) || {};
      if (!isNil(defaultValue)) {
        switch (fieldType) {
          case 'Select':
            handleChangeLovObj(defaultValueObj, fieldCode);
            handleChangeObj(defaultValue, fieldCode);
            break;
          default:
            handleChangeObj(defaultValue, fieldCode);
            break;
        }
      }
    });
  }, []);

  // 监听变化 来触发外部的搜索 是否初始化后自动查询
  (autoQuery ? useEffect : useUpdateEffect)(() => {
    const params = getQueryParameter();
    onSearch(params);
  }, [searchObj]);

  function getQueryParameter() {
    checkArray();
    return configs.reduce((pre, cur) => {
      // 过滤出需要的字段
      const { fieldCode } = cur;
      const target = searchObj?.[fieldCode];
      if (!isNil(target)) {
        return { ...pre, [fieldCode]: target };
      }
      return pre;
    }, {});
  }

  function checkArray() {
    if (!Array.isArray(configs)) {
      throw new Error('configs is not array');
    }
  }

  function handleChangeObj(value, fieldCode) {
    setSearchObj((prev) => ({
      ...prev,
      [fieldCode]: value,
    }));
  }

  function handleChangeLovObj(target, fieldCode) {
    setSearchObj((prev) => ({
      ...prev,
      [`${fieldCode}Lov`]: target,
    }));
  }

  // 根据类型 来清空对应数据
  function handleClearValue(e, config) {
    e.stopPropagation();
    const { fieldCode, fieldType } = config;
    switch (fieldType) {
      case 'Select':
        handleChangeLovObj({}, fieldCode);
        handleChangeObj(null, fieldCode);
        break;
      default:
        handleChangeObj(null, fieldCode);
        break;
    }
  }

  function handleMenuClick({ key }, config) {
    const { filedContent = [], lovInfo = {}, fieldCode } = config;
    const { valueField = 'value' } = lovInfo;
    const target = filedContent[key] || {};
    handleChangeLovObj(target, fieldCode);
    handleChangeObj(target[valueField], fieldCode);
  }

  const renderPopContent = (config, fieldValue) => {
    const { fieldName } = config;
    return (
      <span className="popover-field">
        <span className="popover-field-label">{fieldName}</span>
        {fieldValue && (
          <>
            <span className="popover-field-value-render">{fieldValue}</span>
            {!config.notDeleteFlag ? (
              <Icon
                type="close"
                onClick={(e) => handleClearValue(e, config)}
                className="popover-field-value-clear"
              />
            ) : null}
          </>
        )}
        <Icon
          type="expand_more"
          className={[
            'popover-field-value-expand',
            {
              'popover-field-icon-hover': fieldValue && !config.notDeleteFlag,
            },
          ]}
        />
      </span>
    );
  };

  const TextSearch = (config) => {
    const popverContent = (
      <TextField
        value={searchObj[config.fieldCode]}
        maxTagCount={3}
        maxTagTextLength={120}
        placeholder={intl
          .get('mallf.common.view.search.pleaseInput', { value: '' })
          .d(`请输入${''}`)}
        autoFocus
        clearButton
        onChange={(value) => handleChangeObj(value, config.fieldCode)}
      />
    );
    const fieldValue = searchObj[config.fieldCode];
    return (
      <Popover
        placement="bottomLeft"
        trigger="click"
        content={popverContent}
        overlayClassName={NewMyMallSearchLess['mymall-search-popover-content']}
      >
        {renderPopContent(config, fieldValue)}
      </Popover>
    );
  };

  const SelectSearch = (config) => {
    const { filedContent = [], lovInfo = {}, fieldCode } = config;
    const { displayField = 'meaning' } = lovInfo;
    const fieldValue = searchObj?.[`${fieldCode}Lov`]?.[displayField];
    const menu = (
      <Menu onClick={(e) => handleMenuClick(e, config)}>
        {filedContent?.map((li, key) => {
          return <Menu.Item key={key}>{li[displayField]}</Menu.Item>;
        })}
      </Menu>
    );
    return (
      <Dropdown overlay={menu} trigger={['click']}>
        {renderPopContent(config, fieldValue)}
      </Dropdown>
    );
  };

  const renderOther = () => {
    return otherSerachConfigs.map((config) => {
      switch (config.fieldType) {
        case 'Select':
          return SelectSearch(config);
        default:
          return TextSearch(config);
      }
    });
  };

  return (
    <div style={props.style} className={NewMyMallSearchLess.myMallSearch}>
      {defaultSearchConfig && (
        <div className="data-input">
          <TextField
            name={defaultSearchConfig.fieldName || ''}
            required={defaultSearchConfig.required || false}
            clearButton
            placeholder={
              defaultSearchConfig.placeholder ||
              intl
                .get('mallf.common.view.search.pleaseInput', {
                  value: defaultSearchConfig.fieldName || '',
                })
                .d(`请输入${defaultSearchConfig.fieldName || ''}`)
            }
            prefix={<Icon type="search" />}
            onChange={(value) => handleChangeObj(value, defaultSearchConfig.fieldCode)}
          />
        </div>
      )}
      {otherSerachConfigs.length && renderOther()}
    </div>
  );
});

export default NewMyMallSearch;
