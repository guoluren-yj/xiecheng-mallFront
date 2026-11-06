import React, { useEffect } from 'react';
import { Modal, Spin, Collapse } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import Pagination from 'components/Pagination';
import {
  fetchomsAssociated,
  fetchomsSourceed,
  fetchomsProtocoled,
} from 'services/purchaseRequestService';
import style from './index.less';
import Header from './Header';
import Order from './Order';
import useSetState from '@/hooks/useState';

const { Sidebar } = Modal;
const { Panel } = Collapse;
export default function AssociatedDoc(props) {
  const { visible, toggleModal, currentOrder = {} } = props;
  const { manualRequestId } = currentOrder;

  const [state, setState] = useSetState({
    associatedData: [],
    sourcceedData: [],
    protocoledData: [],
    spinning: false,
    activeKeys: ['1'],
    pagination: {},
  });
  const { activeKeys, spinning, pagination, associatedData, sourcceedData, protocoledData } = state;

  function fetchData(params = { page: 0, size: 10 }) {
    setState({ spinning: true });
    fetchomsAssociated({ manualRequestId, ...params, ...pagination })
      .then((res) => {
        if (res) {
          const { content, ...paginations } = res;
          setState({ associatedData: content, pagination: paginations });
        }
      })
      .finally(() => {
        setState({ spinning: false });
      });
    Promise.all([
      fetchomsSourceed({ manualRequestId }),
      fetchomsProtocoled({ manualRequestId }),
    ]).then((res) => {
      setState({
        sourcceedData: res[0].map((n) => ({ ...n, type: 'source' })),
        protocoledData: res[1].map((n) => ({ ...n, type: 'protocol' })),
      });
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  function callback(keys) {
    setState({ activeKeys: keys });
  }

  const headerPanel = (item) => {
    return (
      <ul className="apply-header">
        <li>
          <span className="header-label">
            {item.type === 'source'
              ? intl.get('mallf.myRequest.view.order.sourceNum').d('寻源单号')
              : intl.get('mallf.myRequest.view.order.protocolNum').d('协议单号')}
            ：
          </span>
          <span className="header-content">{item.executionDocNum}</span>
        </li>
        <li>{item.executeDate}</li>
      </ul>
    );
  };

  const productItem = (item) => {
    const { list } = item;
    return list.map((n) => {
      const { goodsName, executeQuantity } = n;
      return (
        <div className="source-content">
          <div className="goods-name">{goodsName}</div>
          <div className="goods-quantity">x {executeQuantity}</div>
        </div>
      );
    });
  };

  return (
    <>
      <Sidebar
        title={intl.get('mallf.myRequest.view.associated.doc').d('关联单据')}
        className={style.content}
        visible={visible}
        onCancel={toggleModal}
        width={1190}
        footer={[
          <Button key="back" onClick={toggleModal} color="primary">
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
        closable
      >
        <Spin spinning={spinning}>
          {associatedData.length > 0 && (
            <>
              <span className="request-type">
                {intl.get('mallf.myRequest.view.ordered').d('已转订单')}
              </span>
              {activeKeys.filter((n) => n.includes('associated')).length === 0 ? (
                <Button
                  color="primary"
                  icon="baseline-arrow_right"
                  funcType="flat"
                  style={{ marginBottom: 15, marginLeft: 10 }}
                  onClick={() => {
                    setState({
                      activeKeys: associatedData.map((_, index) => `associated${index}`),
                    });
                  }}
                >
                  {intl.get('mallf.myRequest.view.catalog.pickUp').d('全部展开')}
                </Button>
              ) : (
                <Button
                  color="primary"
                  icon="baseline-arrow_drop_down"
                  funcType="flat"
                  style={{ marginBottom: 15, marginLeft: 10 }}
                  onClick={() => {
                    setState({ activeKeys: activeKeys.filter((k) => !k.includes('associated')) });
                  }}
                >
                  {intl.get('mallf.myRequest.view.catalog.pickupall').d('全部收起')}
                </Button>
              )}
              <Collapse activeKey={activeKeys} onChange={callback}>
                {associatedData?.map((item, index) => {
                  return (
                    <Panel
                      header={<Header item={item} />}
                      key={`associated${index}`}
                      style={{ marginBottom: 10 }}
                    >
                      <Order item={item} />
                    </Panel>
                  );
                })}
              </Collapse>
            </>
          )}
          {sourcceedData.length > 0 && (
            <>
              <span className="request-type">
                {intl.get('mallf.myRequest.view.sourced').d('已转寻源')}
              </span>
              {activeKeys.filter((n) => n.includes('sourcceed')).length === 0 ? (
                <Button
                  color="primary"
                  icon="baseline-arrow_right"
                  funcType="flat"
                  style={{ marginBottom: 15, marginLeft: 10 }}
                  onClick={() => {
                    setState({ activeKeys: sourcceedData.map((_, index) => `sourcceed${index}`) });
                  }}
                >
                  {intl.get('mallf.myRequest.view.catalog.pickUp').d('全部展开')}
                </Button>
              ) : (
                <Button
                  color="primary"
                  icon="baseline-arrow_drop_down"
                  funcType="flat"
                  style={{ marginBottom: 15, marginLeft: 10 }}
                  onClick={() => {
                    setState({ activeKeys: activeKeys.filter((k) => !k.includes('sourcceed')) });
                  }}
                >
                  {intl.get('mallf.myRequest.view.catalog.pickupall').d('全部收起')}
                </Button>
              )}
              <Collapse activeKey={activeKeys} onChange={callback}>
                {sourcceedData?.map((item, index) => {
                  return (
                    <Panel
                      header={headerPanel(item)}
                      key={`sourcceed${index}`}
                      style={{ marginBottom: 10 }}
                    >
                      {productItem(item)}
                    </Panel>
                  );
                })}
              </Collapse>
            </>
          )}
          {protocoledData.length > 0 && (
            <>
              <span className="request-type">
                {intl.get('mallf.myRequest.view.protocoled').d('已转协议')}
              </span>
              {activeKeys.filter((n) => n.includes('protocoled')).length === 0 ? (
                <Button
                  color="primary"
                  icon="baseline-arrow_right"
                  funcType="flat"
                  style={{ marginBottom: 15, marginLeft: 10 }}
                  onClick={() => {
                    setState({
                      activeKeys: protocoledData.map((_, index) => `protocoled${index}`),
                    });
                  }}
                >
                  {intl.get('mallf.myRequest.view.catalog.pickUp').d('全部展开')}
                </Button>
              ) : (
                <Button
                  color="primary"
                  icon="baseline-arrow_drop_down"
                  funcType="flat"
                  style={{ marginBottom: 15, marginLeft: 10 }}
                  onClick={() => {
                    setState({ activeKeys: activeKeys.filter((k) => !k.includes('protocoled')) });
                  }}
                >
                  {intl.get('mallf.myRequest.view.catalog.pickupall').d('全部收起')}
                </Button>
              )}
              <Collapse activeKey={activeKeys} onChange={callback}>
                {protocoledData?.map((item, index) => {
                  return (
                    <Panel
                      header={headerPanel(item)}
                      key={`protocoled${index}`}
                      style={{ marginBottom: 10 }}
                    >
                      {productItem(item)}
                    </Panel>
                  );
                })}
              </Collapse>
            </>
          )}
          <div style={{ width: '100%', marginTop: 15 }}>
            <Pagination
              showSizeChanger
              zeroStart
              showQuickJumper
              {...pagination}
              onForward={fetchData}
            />
          </div>
        </Spin>
      </Sidebar>
    </>
  );
}
