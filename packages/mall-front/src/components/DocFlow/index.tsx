/* eslint-disable react/jsx-filename-extension */
/**
 * DocFlow
 * 单据流组件
 * @date: 2021-09-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Button, Modal, Tabs } from 'choerodon-ui/pro';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import FlowChart from './FlowChart';

import DocRelation from './DocRelation';
import './index.less';

const { TabPane } = Tabs;
interface DocFlowProps {
  tableName: string; //
  tablePk: string;
  buttonType?: string;
  buttonText?: string;
  style?: any;
}

const ButtonType = {
  button: 'button',
  aTag: 'aTag',
};

function DocFlow(props: DocFlowProps) {
  const { tableName, tablePk, style = {}, buttonType = ButtonType.button, buttonText = intl.get('component.docFlow.view.button.defaultBtnDesc').d('单据流') } = props;
  const currentOrganizationId = getCurrentOrganizationId();
  const currentUserId = getCurrentUserId();

  const openDocFlowModal = () => {
    Modal.open({
      title: intl.get('component.docFlow.view.title.modal').d('单据全流程追踪'),
      drawer: true,
      okCancel: false,
      closable: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      style: {
        width: 1200,
      },
      className: 'docFlow-modal-wrapper',
      children: (
        <Tabs defaultActiveKey="1" className='docFlow-modal-wrapper-tabs'>
          <TabPane tab={intl.get('component.docFlow.view.button.defaultBtnDesc').d('单据流')} key="1">
            <FlowChart
              tableName={tableName}
              tablePk={tablePk}
              currentOrganizationId={currentOrganizationId}
              currentUserId={currentUserId}
            />
          </TabPane>
          <TabPane tab={intl.get('mallf.common.view.associated.doc').d('关联单据')} key="2">
            <div className="content-list">
              <DocRelation
                tableName={tableName}
                tablePk={tablePk}
                currentOrganizationId={currentOrganizationId}
              />
            </div>
          </TabPane>
        </Tabs>
      ),
    });
  };

  return (
    <div className="doc-flow" style={style}>
      {buttonType === ButtonType.button ? (
        <Button
          funcType={FuncType.link}
          color={ButtonColor.primary}
          icon='timeline'
          onClick={openDocFlowModal}
        >
          {buttonText}
        </Button>
      ) : (
        <a onClick={openDocFlowModal}>{buttonText}</a>
      )
      }
    </div>
  );
}

export default formatterCollections({ code: ['component.docFlow', 'hzero.hzeroUI'] })(DocFlow);
