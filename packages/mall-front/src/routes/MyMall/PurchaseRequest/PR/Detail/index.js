import React, { useEffect, useMemo } from 'react';
import { Modal, Button, Spin } from 'choerodon-ui';

import { getPrimaryColor } from 'utils/utils';
import intl from 'utils/intl';
import useSetState from '@/hooks/useState';
import { fetchDetailList, fetchProductInfo } from 'services/purchaseRequestService';
import styles from './index.less';
import BaseInfo from './BaseInfo';
import ApplyTable from './ApplyTable';

const { Sidebar } = Modal;

export default function Detail(props) {
  const { visible, toggleModal, currentOrder, status, custForm, custTable } = props;
  const { prHeaderId } = currentOrder;
  const [state, setState] = useSetState({
    spinning: false,
    header: {},
    lineInfo: [],
  });

  useEffect(() => {
    if (prHeaderId) {
      fetchHeader();
      getLineData();
    }
  }, [prHeaderId]);

  const { spinning, header, lineInfo } = state;
  const summarize = useMemo(() => Object.assign({}, currentOrder, header), [header, currentOrder]);

  // 查询头信息
  const fetchHeader = () => {
    setState({ spinning: true });
    fetchDetailList(prHeaderId)
      .then((res) => {
        if (res) {
          setState({
            header: { ...res, requestDate: res.requestDate?.split(' ')[0] },
          });
          getLineData();
        }
      })
      .catch(() => {
        setState({ spinning: false });
      });
  };

  // 查询行信息
  const getLineData = () => {
    setState({ spinning: true });
    fetchProductInfo({ prHeaderId })
      .then((res) => {
        setState({
          lineInfo: res.map((p) => ({ ...p, neededDate: p.neededDate.split(' ')[0] })),
        });
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
        <Button
          style={{ width: 58, height: 32, background: getPrimaryColor(), color: '#fff' }}
          key="back"
          onClick={toggleModal}
        >
          {intl.get('mallf.myRequest.button.close').d('关闭')}
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
