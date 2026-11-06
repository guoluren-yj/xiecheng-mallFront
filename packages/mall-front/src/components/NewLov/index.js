import React, { useEffect, useRef } from 'react';
import { Input, Tooltip } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import Suffix from './Suffix';
import LovModal from './LovModal';
import useSetState from '@/hooks/useState';

function NewLov(props) {
  const {
    disabled, // 禁用
    lovOptions = {}, // codeLov 可以不用传，urlLov则必传
    label, // label标签（*）
    placeholder, // placeholder
    code, // lovc
    columns, // 表头
    queryUrl, // 查询url
    textValue = '',
    onOk = (e) => e,
    onClear = (e) => e,
    onClick = (e) => e,
    inputStyle = {}, // 输入框的样式
    buttonStyle = {}, // 按钮的样式
    queryParams = {}, // 查询参数
    title = '',
    columnsParams = {}, // 查询有下拉的值集
    allowClear = true, // 允许清空
    originTenantId,
    className = '',
    modalVisible = {}, // 是否只展示modal
    tooltip,
  } = props;
  const modal = useRef();
  const [state, setState] = useSetState({ visible: false, inputValue: textValue, lovValue: '' });
  const toggleModal = () => {
    if (disabled) return;
    setState({ visible: !state.visible });
    // 模态框
    if (modalVisible.toggleModal) {
      modalVisible.toggleModal();
    }
  };

  useEffect(() => {
    if (state.visible) {
      modal.current = Modal.open({
        destroyOnClose: true,
        mask: true,
        title,
        closable: true,
        drawer: true,
        children: (
          <LovModal
            modal={modal.current}
            originTenantId={originTenantId}
            title={title}
            queryParams={queryParams}
            queryUrl={queryUrl}
            handleLovOk={handleLovOk}
            toggleModal={toggleModal}
            visible={state.visible}
            columns={columns}
            lovCode={code}
            columnsParams={columnsParams}
          />
        ),
      });
    } else if (modal.current) {
      modal.current.close();
    }
  }, [state.visible]);

  useEffect(() => {
    setState({ inputValue: textValue });
  }, [textValue]);

  useEffect(() => {
    if (!isEmpty(modalVisible)) {
      setState({ visible: modalVisible.visible });
    }
  }, [modalVisible]);

  const handleLovOk = (data, config = {}) => {
    const newConfig = { ...config, ...lovOptions };
    const inputValue = data[newConfig.displayField];
    const lovValue = data[newConfig.valueField];
    setState({
      inputValue,
      lovValue,
    });
    toggleModal();
    onOk(lovValue, data);
  };

  const handleClear = () => {
    setState({
      inputValue: '',
      lovValue: '',
    });
    onClear();
    onOk(null, {});
  };

  return (
    <>
      {isEmpty(modalVisible) && (
        <>
          {props.children ? (
            <div
              onClick={toggleModal}
              className={className}
              style={{ ...buttonStyle, cursor: 'pointer' }}
            >
              {props.children}
            </div>
          ) : (
            <Tooltip title={tooltip || state.inputValue}>
              <Input
                className={className}
                style={inputStyle}
                disabled={disabled}
                value={state.inputValue}
                readOnly
                label={label}
                placeholder={placeholder}
                onFocus={() => {
                  if (!disabled) {
                    toggleModal();
                  }
                }}
                onClick={onClick}
                suffix={Suffix({
                  disabled,
                  toggleModal,
                  handleClear,
                  allowClear,
                  inputValue: state.inputValue,
                })}
              />
            </Tooltip>
          )}
        </>
      )}
    </>
  );
}

export default NewLov;
