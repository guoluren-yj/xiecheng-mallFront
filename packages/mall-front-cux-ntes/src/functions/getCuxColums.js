import React, { useMemo, useEffect } from 'react';
import { Modal, Button, Table, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default function getCuxColumns() {
  const ConfigList = ({ compatibleMachineValue }) => {
    const columns = useMemo(() => {
      return [
        {
          name: 'orderSeq',
          width: 80,
          header: intl.get(`mallf.common.view.orderSeq`).d('序号'),
        },
        {
          name: 'configTypeName',
          header: intl.get(`mallf.cart.view.machineModal.configType`).d('配置类型'),
        },
        {
          name: 'configCodeLov',
          header: intl.get(`mallf.common.view.machineModal.configName`).d('配置名称'),
        },
        {
          name: 'configCode',
          header: intl.get(`mallf.cart.view.machineModal.configCode`).d('配置编码'),
        },
        {
          name: 'quantity',
          header: intl.get(`mallf.common.view.productNum.order`).d('数量'),
        },
      ];
    }, []);
    const initDs = useMemo(() => {
      return new DataSet({
        selection: false,
        paging: false,
        fields: [
          {
            name: 'orderSeq',
          },
          {
            name: 'configTypeName',
          },
          {
            name: 'configCodeLov',
            type: 'object',
            lovCode: 'SCUX.NTES_SMDM_ITEM',
            computedProps: {
              lovPara: ({ record: currentRecord }) => {
                return {
                  attributeVarchar1: currentRecord.get('configTypeValue'),
                };
              },
            },
          },
          {
            name: 'configCode',
            bind: 'configCodeLov.itemId',
          },
          {
            name: 'configName',
            bind: 'configCodeLov.itemName',
          },
          {
            name: 'quantity',
            min: 0,
            dynamicProps: {
              required: ({ record: r }) => r.get('configCode'),
            },
          },
        ],
      });
    }, []);

    useEffect(() => {
      initDs.loadData(compatibleMachineValue);
    }, []);
    return <Table columns={columns} dataSet={initDs} />;
  };

  const openConfig = ({ compatibleMachineValue }) => {
    const modal = Modal.open({
      title: intl.get(`mallf.cart.view.button.jianrongjiConfig`).d('兼容机配置'),
      style: { width: 742 },
      children: <ConfigList compatibleMachineValue={compatibleMachineValue || []} />,
      drawer: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      onOk: () => modal.close(),
      footer: (okBtn) => [okBtn],
    });
  };
  return [
    {
      name: 'attributeLongtext7',
      renderer: ({ value }) => {
        return value ? (
          <Button
            onClick={() => openConfig({ compatibleMachineValue: JSON.parse(value || '[]') })}
            name="attributeLongtext7"
            funcType="link"
            color="primary"
          >
            {intl.get(`mallf.cart.view.button.jianrongjiConfig`).d('兼容机配置')}
          </Button>
        ) : (
          '-'
        );
      },
    },
  ];
}
