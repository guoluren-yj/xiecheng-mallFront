/* eslint-disable no-unused-vars */
import React, { PureComponent } from 'react';
import { DataSet, Dropdown, Tooltip } from 'choerodon-ui/pro';
import { Icon, Menu } from 'choerodon-ui';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import SortDownIcon from '../../../assets/images/icon_sort_down.svg';
import SortUpIcon from '../../../assets/images/icon_sort_up.svg';
import { stylePrefix, filterProperties, fieldProperties, SortFieldName } from '../util';

interface ISortSelector {
  dataSet?: DataSet;
  filter: filterProperties; // 当前筛选器
  fields: fieldProperties[]; // 可排序的字段列表
  onRef: any;
}

export default class SortSelector extends PureComponent<ISortSelector, any> {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectorHidden: true,
      sortFlag: 'asc',
      sortFieldCode: null,
    };
  }

  componentDidMount() {
    const { fields = [], filter } = this.props;
    this.handleSortConfig(filter, fields);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.filter.filterCode &&
      nextProps.filter.filterCode !== this.props.filter.filterCode
    ) {
      const { fields = [], filter } = nextProps;
      this.handleSortConfig(filter, fields);
    }
  }

  @Bind()
  handleReset() {
    const { fields = [], filter } = this.props;
    this.handleSortConfig(filter, fields);
  }

  @Bind()
  handleSortConfig(filter, fields) {
    const { defaultSortedField, defaultSortedOrder = 'asc' } = filter;
    this.setState({
      sortFieldCode: fields.length > 0 ? defaultSortedField : undefined,
      sortFlag: defaultSortedField && fields.length > 0 ? defaultSortedOrder : undefined,
    });
  }

  @Bind()
  handleToogleSortFlag() {
    const { sortFlag } = this.state;
    const newSortFlag = sortFlag === 'asc' ? 'desc' : 'asc';
    this.setState({ sortFlag: newSortFlag });
    this.handleQuery('sortFlag', newSortFlag);
  }

  @Bind()
  handleQuery(key, value) {
    const { dataSet } = this.props;
    if (dataSet && dataSet.current) {
      const sortFieldValue = dataSet.current.get(SortFieldName) || '';
      let sortFieldCode = sortFieldValue.split(':')[0];
      let sortFlag = sortFieldValue.split(':')[1] || 'asc';
      if (key === 'sortFieldCode') {
        sortFieldCode = value;
      } else {
        sortFlag = value;
      }
      dataSet.current.set(SortFieldName, `${sortFieldCode}:${sortFlag}`);
    }
  }

  @Bind()
  handleSelectSortField({ key }) {
    this.setState({ selectorHidden: true, sortFieldCode: key });
    this.handleQuery('sortFieldCode', key);
  }

  @Bind()
  renderOverlayMenu() {
    const { fields = [] } = this.props;
    const { sortFieldCode } = this.state;
    return (
      <Menu
        onClick={this.handleSelectSortField}
        className={`${stylePrefix}-sort-menu`}
        defaultSelectedKeys={[sortFieldCode]}
      >
        {fields.map(item => (
          <Menu.Item key={item.name} className={`${stylePrefix}-sort-menu-item`}>
            {intl
              .get('srm.filterBar.view.label.orderByLabel', { name: item.label })
              .d(`按${item.label}`)}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  @Bind()
  handleClear(event) {
    event.stopPropagation();
    this.setState({
      selectorHidden: true,
      sortFieldCode: null,
    });
    const { dataSet } = this.props;
    if (dataSet && dataSet.current) {
      dataSet.current.set(SortFieldName, undefined);
    }
  }

  @Bind()
  handleChangeSelectorHidden(hidden) {
    this.setState({
      selectorHidden: hidden,
    });
  }

  render() {
    const { selectorHidden, sortFlag, sortFieldCode } = this.state;
    const { fields = [] } = this.props;
    const overlayMenu = this.renderOverlayMenu();
    const sortField =
      fields.length < 1 || !sortFieldCode
        ? {}
        : fields.find(item => item.name === sortFieldCode) || {};
    return (
      <span className={`${stylePrefix}-sort`}>
        <Dropdown
          hidden={selectorHidden}
          onHiddenChange={this.handleChangeSelectorHidden}
          overlay={overlayMenu}
          trigger={[Action.click]}
        >
          {!sortFieldCode ? (
            <span className={`${stylePrefix}-sort-placeholder`}>
              {intl.get('srm.filterBar.view.placeholder.selectOrderBy').d('选择排序字段')}
              <Icon type="expand_more" />
            </span>
          ) : (
            <span className={`${stylePrefix}-sort-control`}>
              {sortField.label
                ? intl
                    .get('srm.filterBar.view.label.orderByLabel', { name: sortField.label })
                    .d(`按${sortField.label}`)
                : ''}
              <Icon type="expand_more" className={`${stylePrefix}-sort-expand`} />
              <Icon
                type="close"
                className={`${stylePrefix}-sort-clear`}
                onClick={this.handleClear}
              />
            </span>
          )}
        </Dropdown>
        {sortFieldCode && (
          <Tooltip
            title={
              sortFlag === 'asc'
                ? intl.get('srm.filterBar.view.tooltip.asc').d('升序')
                : intl.get('srm.filterBar.view.tooltip.desc').d('降序')
            }
          >
            <img
              alt="orderBy"
              src={sortFlag === 'asc' ? SortUpIcon : SortDownIcon}
              onClick={this.handleToogleSortFlag}
              style={{ cursor: 'pointer' }}
            />
          </Tooltip>
        )}
      </span>
    );
  }
}
