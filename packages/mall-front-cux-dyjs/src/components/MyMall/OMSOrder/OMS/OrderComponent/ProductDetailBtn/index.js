import React from 'react';
import { DataSet, Button, Modal, Table } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';


export default function Product(props) {
  const { data = {} } = props || {};

  return (
    <div>
      <Button
        style={{ backgroundColor: '#0037c8' }}
        onClick={() => {
          Modal.open({
            key: Modal.key(),
            style: { width: 1000 },
            children: (
              <Table
                dataSet={new DataSet(({
                  autoQuery: true,
                  fields: [
                    {
                      name: 'attributeLongtext1',
                      type: 'string',
                      label: intl.get('mallf.myOrder.model.associated.projectName').d('项目名称'),
                    },
                    {
                      name: 'deliveryDay',
                      type: 'number',
                      label: intl.get('mallf.myOrder.model.associated.deliveryDay').d('供货周期（天）'),
                    },
                    {
                      name: 'expectedArriveDate',
                      type: 'string',
                      label: intl.get('mallf.myOrder.model.associated.expectedArriveDate').d('预计到货日期'),
                    },
                  ],
                  transport: {
                    read: {
                      url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/CgOJRvnrCIibn6ThRhAxpYj0Diba9wsJaugbB1ZPicJVS8?orderEntryId=${data?.orderEntryId}&skuId=${data?.skuId}`,
                      method: 'GET',
                    },
                  },
                }))}
                columns={[
                  {
                    name: 'attributeLongtext1',
                  },
                  {
                    name: 'deliveryDay',
                  },
                  {
                    name: 'expectedArriveDate',
                  },
                ]}
              />
            ),
            okButton: false,
            onCancel: () => { },
          });
        }}
      >
        <div style={{ color: '#fff' }}>
          {intl.get('mallf.myOrder.model.associated.checkInfo').d('查看信息')}
        </div>
      </Button>
    </div>
  );
}
