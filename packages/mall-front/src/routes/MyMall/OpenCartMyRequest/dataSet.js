import { DataSet } from 'choerodon-ui/pro';
import { Message } from 'choerodon-ui';
import { observable } from 'mobx';
import qs from 'qs';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import { afterBuyAgain } from 'utils/addNewCart';
import { openComfirmModal } from 'utils/modals';
import {
  fetchMyRequestListService,
  cancelRequestService,
  cancelRequestLineService,
  withdrawRequestService,
  buyAgainService,
  fetchMyRequestCountService,
} from 'services/openCartMyRequestService';
import cuxOverwrite from '@/cuxTools/cuxOverwrite';

export default class RequestDataSet extends DataSet {
  @observable count = {}; // TAB总数

  @observable pagination = {}; // 分页

  @observable currentStatus = ''; // 当前tab状态

  @observable requestCode = ''; // 商城申请号查询

  constructor(props) {
    super(props);
    this.labelList = [
      {
        countName: 'ALL',
        label: intl.get('mallf.myRequest.view.order.allApplys').d('全部申请'),
        status: '',
      },
      {
        countName: 'SUBMITTED',
        label: intl.get('mallf.myRequest.view.order.shenpi').d('待审批'),
        status: 'SUBMITTED',
      },
      {
        countName: 'APPROVED',
        label: intl.get('mallf.myRequest.view.order.yishenpi').d('已审批'),
        status: 'APPROVED',
      },
      {
        countName: 'CONVERSION_COMPLETED',
        label: intl.get('mallf.myRequest.view.order.completed').d('已完成'),
        status: 'CONVERSION_COMPLETED',
      },
    ];
    this.onRadioChange = this.onRadioChange.bind(this);
  }

  // 总数查询
  async queryCount() {
    this.status = 'loading';
    const res = await fetchMyRequestCountService();
    if (res) {
      this.count = res;
    }
  }

  // 列表查询
  @cuxOverwrite({ name: 'OpenCartMyRequest/dataSet/queryData' })
  async queryData(params = {}) {
    const { userId } = getUserConfigInfo();
    this.status = 'loading';
    this.requestCode = params.requestCode || '';
    const { size, number } = this.pagination;
    const newPara = {
      userId,
      lineFlag: true,
      size,
      page: number,
      mallStatusGroupCode: this.currentStatus,
      ...params,
    };
    try {
      const res = await fetchMyRequestListService(newPara);
      if (res) {
        const { content, ...pagination } = res;
        this.loadData(content);
        this.pagination = pagination;
      }
    } finally {
      this.status = 'ready';
      document.querySelector('body').scrollTop = 0;
    }
  }

  // 取消申请|撤回申请
  async cancelRequest(params, type) {
    this.status = 'loading';
    try {
      const cancelApi =
        type === 'withdraw'
          ? withdrawRequestService
          : type === 'header'
          ? cancelRequestService
          : cancelRequestLineService;
      const res = await cancelApi(params);
      if (res) {
        this.queryData();
        Message.success(
          type === 'withdraw'
            ? intl.get('mallf.myRequest.view.withdrawRequestSuccess').d('操作成功，申请撤回中')
            : intl.get('mallf.myRequest.view.cancelRequestSuccess').d('操作成功，申请取消中')
        );
      }
    } catch {
      this.status = 'ready';
    }
  }

  // 再来一单
  async buyAgain(params) {
    const { companyId } = getUserConfigInfo();
    this.status = 'loading';
    const { mallRequestEntryViewVOList = [] } = params || {};
    const newParams = {
      requestEntryIds: mallRequestEntryViewVOList.map((item) => {
        return item.requestEntryId;
      }),
      purCompanyId: companyId,
    };
    try {
      const res = await buyAgainService(newParams);
      if (res) {
        afterBuyAgain(res, (result) => {
          const cartIdList = result.map((n) => n.cartId);
          getDvaApp()._history.push({
            pathname: '/cart',
            query: qs.stringify(cartIdList),
          });
        });
      }
    } finally {
      this.status = 'ready';
    }
  }

  // 切换TAB查询
  onRadioChange(mallStatusGroupCode) {
    this.currentStatus = mallStatusGroupCode;
    this.requestCode = '';
    this.queryData({
      page: 0,
      size: 10,
    });
  }

  // 取消申请｜撤回申请
  handleCancelRequest({ line = {}, children, item = {}, type }) {
    openComfirmModal({
      title:
        type === 'withdraw'
          ? intl.get('mallf.myRequest.view.edit.withdrawRequest').d('撤回申请')
          : intl.get('mallf.myRequest.view.edit.cancelRequest').d('取消申请'),
      border: false,
      children,
      onOk: () => {
        const cancelReason = document.getElementById('requestCancelReason').value;
        const { requestId, mallRequestEntryViewVOList, objectVersionNumber } = item || {};

        // 撤回申请
        if (type === 'withdraw') {
          this.cancelRequest(
            {
              ...(item || {}),
              withdrawReason: cancelReason,
            },
            type
          );
        } else if (type === 'header') {
          // 头取消
          this.cancelRequest(
            {
              requestId,
              objectVersionNumber,
              mallRequestEntryViewDTO: mallRequestEntryViewVOList,
              cancelReason,
            },
            type
          );
        } else {
          // 行取消
          this.cancelRequest(
            {
              requestId,
              mallRequestEntryViewDTOList: [
                {
                  ...line,
                  cancelReason,
                },
              ],
            },
            type
          );
        }
      },
    });
  }
}
