import React, { FC, ReactElement } from 'react';
import { Tabs } from 'choerodon-ui';

import styles from './index.less';

const { TabPane } = Tabs;

interface IProps {
  tabList: any[]; // tab 列表
  currentTab: string; // 当前tab
  setCurrentTab: () => void; // 切换tab
  count?: any[]; //
  customizedCode: string;
}

const TabButtons: FC<IProps> = (props): ReactElement => {
  const { tabList, currentTab, setCurrentTab, count, customizedCode } = props;
  return (
    <Tabs
      keyboard={false}
      activeKey={currentTab}
      onChange={setCurrentTab}
      className={styles['tab-buttons-warapper']}
      customizable
      customizedCode={customizedCode}
    >
      {
        tabList?.map(tab => {
          return <TabPane tab={tab.label} key={tab.status} count={tab.count || count?.[tab.countName]} overflowCount={999} />;
        })
      }
    </Tabs>
  );
};
export default TabButtons;