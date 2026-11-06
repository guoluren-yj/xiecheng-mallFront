import React, { useEffect } from 'react';
import { Button } from 'choerodon-ui';
import uuid from 'uuid/v4';
import { withRouter } from 'react-router-dom';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';

import Loading from 'components/loading';
import NewMyMallSearch from 'components/NewMyMallSearch';
import Pagination from 'components/Pagination';
import Tags from 'components/Tag';
import { getUserConfigInfo, prRequestJump } from 'utils/utils';
import useSetState from '@/hooks/useState';
import useLoading from '@/hooks/useLoading';
import intl from 'utils/intl';
import { fetchPurchaseList } from 'services/purchaseRequestService';

import Detail from './Detail';
import FileModal from './FileModal';
import style from './index.less';

function PurchaseRequest(props) {
  const { addressCode } = getUserConfigInfo();
  const {
    history: {
      location: { manualParams = {} },
    },
  } = props;
  const [state, setState] = useSetState({
    prStatus: [
      {
        value: 'PENDING',
        meaning: intl.get('mallf.myRequest.status.new').d('新建'),
      },
      {
        value: 'SUBMITTED',
        meaning: intl.get('mallf.myRequest.status.submitted').d('已提交'),
      },
      {
        value: 'APPROVED',
        meaning: intl.get('mallf.myRequest.status.approved').d('已审批'),
      },
      {
        value: 'REJECTED',
        meaning: intl.get('mallf.myRequest.status.rejected').d('审批拒绝'),
      },
    ],
    list: [],
    pagination: {},
    params: {
      page: manualParams?.page || 0,
      size: 10,
    },
    attachmentUuid: uuid(),
    visible: false,
    detailVisible: false,
    currentPrHeaderId: '',
  });
  const [loadings, toggleLoading] = useLoading();

  const { list, pagination, params } = state;

  useEffect(() => {
    window.scrollTo(0, 0);
    // fetchList(manualParams);
  }, []);

  /**
   * 查询全部采购申请列表
   * @param {*} params
   */
  const fetchList = (query = {}) => {
    const queryParams = {
      ...params,
      ...query,
    };
    // setState({ params: queryParams });
    toggleLoading('loading');
    fetchPurchaseList(queryParams)
      .then((res) => {
        const { content, ...paginations } = res;
        setState({
          list: content || [],
          pagination: paginations,
          params: query,
        });
      })
      .finally(() => {
        toggleLoading('loading');
      });
  };

  // const handleViewFile = fileUuid => {
  //   setState({ visible: true, attachmentUuid: fileUuid });
  // };

  const handleCloseFile = () => {
    setState({ visible: false, attachmentUuid: uuid() });
  };

  const status = (prStatusCode) => {
    let subStatus;
    switch (prStatusCode) {
      case 'CANCELLED':
      case 'CLOSED':
        subStatus = 'cancel';
        break;
      case 'APPROVED':
        subStatus = 'success';
        break;
      case 'REJECTED':
        subStatus = 'failed';
        break;
      case 'PENDING':
        subStatus = 'new';
        break;
      default:
        subStatus = 'info';
        break;
    }
    return subStatus;
  };

  const infoMapper = () => {
    const baseInfo = [
      {
        label: intl.get(`mallf.myRequest.view.company.name`).d('公司名称'),
        key: 'companyName',
      },
      // {
      //   label: intl.get('mallf.myRequest.view.projectName').d('项目名称'),
      //   key: 'companyName',
      //   show: line.prTypeCode === 'MATERIALS' ? 'not' : '',
      // },
      {
        label: intl.get('mallf.myRequest.model.application.type').d('申请类型'),
        key: 'prTypeName',
      },
      {
        label: intl.get('mallf.myRequest.model.application.person').d('申请人'),
        key: 'createByName',
      },
      // {
      //   label: intl.get(`mallf.myRequest.view.need.date`).d('需求日期'),
      //   key: 'neededDate',
      //   show: line.prTypeCode === 'MATERIALS' ? 'not' : '',
      //   content: (_, record) => {
      //     const { prLineVOList = [] } = record;
      //     const result = prLineVOList?.[0] || {};
      //     return result.neededDate && result.neededDate.split(' ')[0];
      //   },
      // },
      // {
      //   label: intl.get('mallf.myRequest.model.application.date').d('申请日期'),
      //   key: 'companyName',
      //   content: (_, record) => record.requestDate && record.requestDate.split(' ')[0],
      // },
    ];
    return {
      // headerInfo,
      baseInfo: baseInfo.filter((f) => f.show !== 'not'),
    };
  };

  const renderListTable = () => {
    return (
      <div className="manual-request-container">
        {list.map((item) => (
          <div className="manual-request-list" key={item.prHeaderId}>
            <div className="manual-list-header">
              <div className="header-left-info">
                <p>
                  <span className="info-label">
                    {intl.get('mallf.myRequest.view.mallRequset.number').d('商城申请号')}
                  </span>
                  ：
                  <span
                    onClick={() => {
                      setState({
                        detailVisible: true,
                        currentOrder: item,
                      });
                      // props.history.push({
                      //   pathname: `/purchase-detail`,
                      //   search: `?prHeaderId=${item.prHeaderId}`,
                      //   state: { ...params, manualNum: item.purchaseHeaderNum },
                      // });
                    }}
                    className="info-content"
                  >
                    {item.purchaseHeaderNum}
                  </span>
                </p>
                <p>
                  <span className="info-label">
                    {intl.get('mallf.myRequest.model.purchaseApplicationNum').d('采购申请号')}
                  </span>
                  ：<span className="info-content">{item.displayPrNum || '-'}</span>
                </p>
              </div>
              <div className="header-requestDate">
                <span>{item.creationDate?.split(' ')[0]}</span>
              </div>
            </div>
            <div className="manual-list-info">
              <div className="manual-body-left">
                {infoMapper(item).baseInfo.map((data) => {
                  const content = data.content
                    ? data.content(item[data.key], item)
                    : item[data.key];
                  return (
                    <div className="manual-grid">
                      <span className="manual-grid-label">{data.label}</span>：
                      <span className="manual-grid-content">{content}</span>
                    </div>
                  );
                })}
              </div>
              <div className="manual-body-status">
                <a>
                  <Tags
                    style={{ display: 'inline-block' }}
                    type={status(
                      item.cancelStatusCode === 'CANCELLED'
                        ? item.cancelStatusCode
                        : item.prStatusCode
                    )}
                  >
                    {item.cancelStatusCode === 'CANCELLED'
                      ? item.cancelStatusMeaning
                      : item.prStatusMeaning}
                  </Tags>
                </a>
              </div>
              <div className="manual-body-option">
                {item.prStatusCode === 'PENDING' && (
                  <a
                    onClick={() => {
                      props.history.push({
                        pathname: `/add-purchase`,
                        search: `?prHeaderId=${item.prHeaderId}`,
                        state: { ...params, manualNum: item.purchaseHeaderNum },
                      });
                    }}
                  >
                    {intl.get('mallf.myRequest.view.edit.apply').d('编辑申请')}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const searchProps = {
    onSearch: (param) => {
      fetchList({
        purchaseHeaderNum: null,
        displayPrNum: null,
        prStatusCode: null,
        time: null,
        page: 0,
        ...param,
      });
    },
    configs: [
      {
        defaultFlag: true,
        fieldName: intl.get('mallf.myRequest.model.myAppplicationNum').d('我的申请号'),
        fieldCode: 'purchaseHeaderNum',
        defaultValue: manualParams?.purchaseHeaderNum,
      },
      {
        fieldName: intl.get('mallf.myRequest.model.purchase.purchaseApplyNum').d('采购申请号'),
        fieldCode: 'displayPrNum',
        defaultValue: manualParams?.displayPrNum,
      },
      {
        fieldName: intl.get('hzero.common.status').d('状态'),
        fieldCode: 'prStatusCode',
        fieldType: 'Select',
        defaultValue: manualParams?.prStatusCode || '',
        filedContent: [
          {
            value: '',
            meaning: intl.get('mallf.myRequest.model.search.all').d('全部'),
          },
          ...state.prStatus,
        ],
      },
      {
        fieldName: intl.get('mallf.common.view.message.timeRange').d('时间范围'),
        fieldCode: 'time',
        fieldType: 'Select',
        defaultValue: manualParams?.time || '',
        filedContent: [
          {
            value: '',
            meaning: intl.get('mallf.myRequest.model.search.all').d('全部'),
          },
          {
            value: 'threeMonth',
            meaning: intl.get('mallf.myRequest.model.search.threeMonths').d('三个月'),
          },
          {
            value: 'oneMonth',
            meaning: intl.get('mallf.myRequest.model.search.oneMonth').d('一个月'),
          },
          {
            value: 'oneWeek',
            meaning: intl.get('mallf.myRequest.model.search.oneWeek').d('一周'),
          },
        ],
      },
    ],
  };
  return (
    <div className={style['purchase-req']}>
      {/* <div className="pur-req-title ">
        {intl.get(`mallf.myRequest.model.purchaseRequest.title`).d('手工申请管理')}
      </div> */}
      <div className="pur-req-header">
        <div className="pur-req-opt">
          <NewMyMallSearch {...searchProps} />
        </div>
        <Button
          className="new-req-btn"
          icon="playlist_add"
          onClick={() => {
            if (addressCode === 'PURCHASE_MANUALLY') props.history.push('/add-purchase');
            else prRequestJump();
          }}
        >
          {intl.get('mallf.myRequest.button.add').d('新建')}
        </Button>
      </div>
      {loadings.loading ? (
        <Loading />
      ) : list.length > 0 ? (
        <div className="pur-req-list">
          {renderListTable()}
          <Pagination
            showSizeChanger
            showQuickJumper
            {...pagination}
            onForward={fetchList}
            allPages
          />
        </div>
      ) : (
        <div className="empty-purchase-list">
          <div className="info">
            {intl.get('mallf.myRequest.view.order.noManualApplication').d('暂无申请')}
          </div>
        </div>
      )}
      {state.visible && (
        <FileModal onClose={handleCloseFile} visible={state.visible} uuid={state.attachmentUuid} />
      )}
      {state.detailVisible && (
        <Detail
          status={status}
          custTable={props.customizeTable}
          custForm={props.customizeForm}
          c7n={props.c7n}
          h0={props.h0}
          currentOrder={state.currentOrder}
          visible={state.detailVisible}
          toggleModal={() => {
            setState({ detailVisible: !state.detailVisible });
          }}
        />
      )}
    </div>
  );
}

export default withRouter(
  c7nCustomize({
    unitCode: ['MALL.APPLY.EDIT.BASICINFO', 'MALL.APPLY.EDIT.APPLYINFO.TABLE'],
  })(PurchaseRequest)
);
