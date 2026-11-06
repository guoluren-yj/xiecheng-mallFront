import { DataSet } from 'choerodon-ui/pro';
import { observable } from 'mobx';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import { fetchOmsInvoiceService } from 'services/myInvoiceService';

export default class InvoiceDataSet extends DataSet {
  @observable pagination: any = {};

  // 查询列表
  async queryData(params = {}) {
    this.status = DataSetStatus.loading;
    const { size, number } = this.pagination;
    this.queryParameter = params;
    const newPara = {
      lineFlag: true,
      size,
      page: number,
      ...params,
    };
    try {
      const res = await fetchOmsInvoiceService(newPara);
      if (res) {
        const { content, ...pagination } = res;
        this.loadData(content);
        this.pagination = pagination;
      }
    } finally {
      this.status = DataSetStatus.ready;
      (document.querySelector('body') as HTMLElement).scrollTop = 0;
    }
  }
}
