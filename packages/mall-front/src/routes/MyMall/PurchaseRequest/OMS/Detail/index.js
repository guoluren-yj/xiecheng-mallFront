import React, { useEffect, useMemo } from 'react';
import { Modal, Spin } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import { OMS_PURCHASE_APPLY_HEADER, OMS_PURCHASE_APPLY_LINE } from 'utils/customizeCode';
import intl from 'utils/intl';
import useSetState from '@/hooks/useState';
import { fetchOMSApplyDetail } from 'services/purchaseRequestService';
import styles from './index.less';
import BaseInfo from './BaseInfo';
import ApplyTable from './ApplyTable';

const { Sidebar } = Modal;

export default function Detail(props) {
  const { visible, toggleModal, currentOrder, status, custForm, custTable } = props;
  const { manualRequestId } = currentOrder;
  const [state, setState] = useSetState({
    spinning: false,
    header: {},
    lineInfo: [],
  });

  const { spinning, header, lineInfo } = state;
  const summarize = useMemo(() => Object.assign({}, currentOrder, header), [header, currentOrder]);
  useEffect(() => {
    if (manualRequestId && visible) {
      fetchDetail();
    }
  }, [manualRequestId, visible]);

  // 查询头信息
  const fetchDetail = () => {
    setState({ spinning: true });
    fetchOMSApplyDetail({
      manualRequestId,
      customizeUnitCode: `${OMS_PURCHASE_APPLY_HEADER},${OMS_PURCHASE_APPLY_LINE}`,
    })
      .then((res) => {
        if (res) {
          const { manualRequestEntryList, ...headerInfo } = res;
          setState({
            header: {
              ...headerInfo,
              manualRequestTypeSelect: {
                value: headerInfo.manualRequestTypeId,
                meaning: headerInfo.manualRequestTypeName,
                prTypeCode: headerInfo.manualRequestTypeCode,
              },
            },
            lineInfo: manualRequestEntryList,
          });
        }
      })
      .finally(() => {
        setState({ spinning: false });
      });
  };

  return (
    <Sidebar
      title={intl.get('mallf.myRequest.view.apply.information').d('查看申请详情')}
      className={styles.content}
      visible={visible}
      width={1090}
      onCancel={toggleModal}
      footer={[
        <Button key="back" onClick={toggleModal} color="primary">
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>,
      ]}
      closable
    >
      <Spin spinning={spinning}>
        <div className="content-box" style={{ marginBottom: 25 }}>
          <p className="content-box-title">
            {intl.get(`mallf.myRequest.view.baseInfo`).d('基本信息')}
          </p>
          <BaseInfo custForm={custForm} dataSource={summarize} status={status} />
        </div>
        <div className="content-box">
          <p className="content-box-title">
            {intl.get(`mallf.myRequest.view.myRequestInfo`).d('申请信息')}
          </p>
          <div className="content-box-table">
            <ApplyTable dataSource={lineInfo} custTable={custTable} />
          </div>
        </div>
      </Spin>
    </Sidebar>
  );
}
