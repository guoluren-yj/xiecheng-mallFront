/**
 * ChooseUnit
 * 采买组织选择组件
 * @date: 2022-8-10
 * @author: tuo <peng.yang05@going-link.com>
 */
import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react';
import classNames from 'classnames';
import { Popover } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { connect } from 'dva';

import UnitForm from './UnitForm';
import SingleLov from './SingleLov';
import styles from './index.less';
import { fromType, IDimensionData } from './typings';

interface Iprops {
  children: ReactNode & { props?: any };
  from?: fromType; // 顶部还是banner
  unitDimensionData: IDimensionData;
}

const ChooseUnit: FC<Iprops> = (props) => {
  const { children, from, unitDimensionData } = props;
  const { currentList = [] } = unitDimensionData || {};

  const [visible, setVisible] = useState<boolean>(false);

  const toggleView = useCallback(() => {
    setVisible(v => !v);
  }, [visible]);

  useEffect(() => {
    if (!isEmpty(children?.props)) {
      children.props.onClick = () => {
        setVisible(true);
      };
    }
  }, []);
  if (currentList.length === 1) return <SingleLov from={from} />;
  if (currentList.length > 1) {
    return (
      <Popover
        overlayClassName={styles['unit-container']}
        content={
          <UnitForm r-if={visible} toggleView={toggleView} />
        }
        placement="top"
        visible={visible}
        trigger='click'
      >
        {children}
      </Popover>
    );
  }
  return (
    <span
      className={classNames(['home-purchase-unit-lov', {
        [styles['unit-siggle-lov']]: from === fromType.top,
      }, { 'user-panel-info': from === fromType.top }])}
    >
      {children}
    </span>
  );
};

export default connect(({ global }) => ({
  unitDimensionData: global.unitDimensionData,
}))(ChooseUnit);
