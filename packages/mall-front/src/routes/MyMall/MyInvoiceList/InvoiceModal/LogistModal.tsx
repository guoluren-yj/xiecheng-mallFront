import React, { useMemo } from 'react';
import { isEmpty } from 'lodash';
import { Timeline } from 'choerodon-ui';
import { Spin, DataSet, Form, Output } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';
import classnames from 'classnames';

import intl from 'utils/intl';
import HmallConfig from 'utils/api-config';
import { getOrganizationId } from 'utils/utils';
import Image from 'components/Image';
import nodata from '../../../../assets/images/illu_address_nodata_default.svg';

import './index.less';

const LogistModal: React.FC<{consignmentCode: string}> = ({consignmentCode}) => {
  const dataSet = useMemo(() => new DataSet({
    autoQuery: true,
    fields: [
      {
        name: 'logisticsNo',
        label: intl.get('mallf.myInvoice.view.courier.number').d('快递单号'),
      },
      {
        name: 'logisticsCompany',
        label: intl.get('mallf.common.view.logistics.company').d('物流公司'),
      },
    ],
    transport: {
      read: () => {
        const queryUrl = `${HmallConfig.apiGateway}/${HmallConfig.omsServiceName}/v1/${getOrganizationId()}/invoices/consignment-info`;
        return {
          url: queryUrl,
          method: 'GET',
          data: {
            consignmentCode,
          },
        };
      },
    },
  }), []);

  return (
    <Observer>
      {() => (
        <Spin dataSet={dataSet}>
          <p className="content-box-title">
            {intl.get('hzero.common.view.baseInfo').d('基本信息')}
          </p>
          <Form
            dataSet={dataSet}
            columns={2}
            className="c7n-pro-vertical-form-display"
            style={{marginBottom: 25}}
          >
            <Output name="logisticsNo" />
            <Output name='logisticsCompany' />
          </Form>
          <p className="content-box-title">
            {intl.get('mallf.myInvoice.view.logistInfo').d('物流信息')}
          </p>
          <div className='invoice-detail-logistics-info'>
            <Timeline r-if={!isEmpty(dataSet?.current?.get('invoiceTrack'))}>
              {dataSet?.current?.get('invoiceTrack')?.map((li: any, key: number) => {
                return (
                  <div className="time-line">
                    <span className="logistics-time">
                      {li.operateTime}
                    </span>
                    <Timeline.Item
                      className={classnames(
                        'logistics-desc',
                        { 'c7n-timeline-item-last': key + 1 === dataSet?.current?.get('invoiceTrack')?.length },
                      )}
                    >
                      {li.content}
                    </Timeline.Item>
                  </div>
                );
              })}
            </Timeline>
            <div className='no-data' r-if={isEmpty(dataSet?.current?.get('invoiceTrack'))}>
              <Image src={nodata} imgStyle={{width: 250, height: 200}} />
              <p>{intl.get(`mallf.common.view.noData`).d('暂无数据')}</p>
            </div>
          </div>
        </Spin>
      )}
    </Observer>
  );
};

export default LogistModal;
