import React from 'react';
import PropTypes from 'prop-types';

export default class PermissionWrapper extends React.Component {
  // 获取传递的context
  static contextTypes = {
    permission: PropTypes.object,
  };

  state = {
    status: 0,
  };

  // 在 render 之前检查权限， permissionList
  // eslint-disable-next-line
  componentDidMount() {
    const { permissionList = [] } = this.props;
    if (permissionList !== undefined && Array.isArray(permissionList)) {
      this.check(this.props, this.context);
    }
  }

  /**
   * 调用 context 的 check
   * @param {object} props - 检查所需参数
   * @param {object} context - 上下文
   */
  check = (props, context) => {
    const { permissionList = [] } = props;
    if (context.permission) {
      context.permission.check({ permissionList }, this.handlePermission);
    }
  };

  handlePermission = (status) => {
    this.setState({
      status,
    });
  };

  render() {
    const { status } = this.state;

    // 鉴权通过后的处理
    if (status === 1) {
      return this.props.children;
      // 鉴权失败
    } else {
      return null;
    }
  }
}
