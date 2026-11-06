import React from 'react';
import PropTypes from 'prop-types';

export default class ChatProvider extends React.Component {
  // 向子组件传递context
  static childContextTypes = {
    chatInfo: PropTypes.object,
  };

  getChildContext() {
    return {
      chatInfo: this,
    };
  }

  // 服务类型
  chatType = null;

  // 窗口打开状态
  chatOpen = false;

  setChatType = (value) => {
    this.chatType = value;
  };

  setChatOpen = (value) => {
    this.chatOpen = value;
  };

  render() {
    return this.props.children;
  }
}
