import React, { useMemo, useEffect, useRef } from 'react';
import qs from 'qs';
import { debounce } from 'lodash';
import { Icon, Spin } from 'choerodon-ui';
import { Button, TextField } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import Loading from 'components/loading';
import Pagination from 'components/Pagination';
import intl from 'utils/intl';
import { getUserConfigInfo, prRequestJump } from 'utils/utils';
import TabButtons from 'components/TabButtons';
import { fetchOMSApplyCentent, fetchOMSApplyStatusCount } from 'services/purchaseRequestService';
import { OMS_PURCHASE_APPLY_HEADER, OMS_PURCHASE_APPLY_LINE } from 'utils/customizeCode';
import styles from './index.less';
import useSetState from '@/hooks/useState';
import useLoading from '@/hooks/useLoading';
import ApplyList from './ApplyList';

function OMS(props) {
  const { addressCode } = getUserConfigInfo();
  const { mallManualRequestStatus } = qs.parse(location.search.substr(1));
  const [state, setState] = useSetState({
    list: [],
    pagination: {},
    count: {},
    currentStatus: mallManualRequestStatus || '',
    manualRequestNum: '',
    updateInput: true,
  });
  const { count, currentStatus, manualRequestNum, pagination, list } = state;
  const [loadings, toggleLoading] = useLoading({ loading: false, spinning: false });

  useEffect(() => {
    toggleLoading({ loading: true });
  }, []);

  useEffect(() => {
    fetchOrderData();
  }, [manualRequestNum, currentStatus]);

  useEffect(() => {
    fetchCountData();
  }, []);

  /**
   * 查询全部订单列表
   * @param {Array} 传入参数
   */
  let pollCount = useRef().current;
  const fetchOrderData = (
    params = {
      page: 0,
      size: 10,
    },
    pollFlag
  ) => {
    const queryParams = {
      manualRequestStatus: currentStatus,
      manualRequestNum,
      ...params,
    };
    if (!pollFlag) toggleLoading({ spinning: true });
    setState({
      updateInput: true,
    });
    fetchOMSApplyCentent(queryParams)
      .then((res) => {
        if (res) {
          const { content = [], ...paginations } = res;
          const { number, size } = paginations;
          // 取消中状态需要轮询
          const cancelingData = content.filter((n) => n.mallManualRequestStatus === 'CANCELLING');
          if (cancelingData.length > 0) {
            if (!pollCount) pollCount = 0;
            // 最多轮询10次
            if (pollCount < 10) {
              setTimeout(() => {
                pollCount += 1;
                fetchOrderData({ page: number, size }, 'polling');
              }, 1000);
            }
          }
          if (!pollCount || cancelingData.length === 0) {
            setState({
              list: content || [],
              pagination: paginations,
            });
          }
        }
      })
      .finally(() => {
        toggleLoading({ loading: false, spinning: false });
        setState({ searchVisible: false });
        document.querySelector('body').scrollTop = 0;
      });
  };

  const fetchCountData = () => {
    fetchOMSApplyStatusCount().then((res) => {
      if (res) {
        setState({ count: res });
      }
    });
  };

  const labelList = [
    {
      countName: 'TOTAL',
      label: intl.get('mallf.myRequest.view.order.allApplys').d('全部申请'),
      status: '',
    },
    {
      countName: 'TO_BE_APPROVE',
      label: intl.get('mallf.myRequest.view.order.shenpi').d('待审批'),
      status: 'TO_BE_APPROVE',
    },
    {
      countName: 'APPROVED',
      label: intl.get('mallf.myRequest.view.order.yishenpi').d('已审批'),
      status: 'APPROVED',
    },
  ];

  const handleChangeVal = debounce((value) => {
    setState({ manualRequestNum: value });
  }, 500);

  const onRadioChange = (e) => {
    setState({ currentStatus: e, manualRequestNum: '', updateInput: false });
  };
  const prefix = useMemo(() => (
    <Icon
      onClick={() => {
        fetchOrderData();
      }}
      style={{ marginLeft: 10, cursor: 'pointer' }}
      type="search"
    />
  ));

  return (
    <div className={styles['oms-apply-record']}>
      <Spin spinning={loadings.spinning}>
        <TabButtons
          tabList={labelList}
          currentTab={currentStatus}
          setCurrentTab={onRadioChange}
          count={count}
          customizedCode="MALL-OMS-PURCHASEAPPLY-LIST-TAB"
        />
        <div className="header-btn-search">
          <Button
            funcType="flat"
            className="new-req-btn"
            icon="playlist_add"
            color="primary"
            onClick={() => {
              if (addressCode === 'PURCHASE_MANUALLY') props.history.push('/add-purchase');
              else prRequestJump();
            }}
          >
            {intl.get('mallf.myRequest.button.add.apply').d('新建申请')}
          </Button>
          {state.updateInput && (
            <TextField
              id="purchaseRequest-search-input"
              placeholder={intl
                .get('mallf.myRequest.view.search.mallApplyNum')
                .d('请输入商城申请号')}
              style={{ width: 250, height: 32 }}
              prefix={prefix}
              clearButton
              onChange={(value) => {
                handleChangeVal(value);
              }}
            />
          )}
        </div>
        {loadings.loading ? (
          <Loading />
        ) : (
          <div className="apply-list">
            {list?.length > 0 ? (
              <>
                {list.map((item) => {
                  return (
                    <ApplyList
                      custTable={props.customizeTable}
                      custForm={props.customizeForm}
                      currentStatus={currentStatus}
                      fetchOrderData={fetchOrderData}
                      item={item}
                      pagination={pagination}
                      toggleLoading={toggleLoading}
                    />
                  );
                })}
              </>
            ) : (
              <div className="empty-purchase-list">
                <div className="info">
                  {intl.get('mallf.myRequest.view.order.noManualApplication').d('暂无申请')}
                </div>
              </div>
            )}
          </div>
        )}

        <Pagination
          showSizeChanger
          style={{ width: '100%', marginTop: 15 }}
          zeroStart
          showQuickJumper
          {...pagination}
          onForward={fetchOrderData}
        />
      </Spin>
    </div>
  );
}

export default withRouter(
  c7nCustomize({
    unitCode: [
      OMS_PURCHASE_APPLY_HEADER,
      OMS_PURCHASE_APPLY_LINE,
      'MALL.APPLY.OMS.EDIT.OMS.BASICINFO.DETAIL',
    ],
  })(OMS)
);
