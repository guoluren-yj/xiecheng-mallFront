import React, { useMemo, useEffect, useState } from 'react';
import { Modal, Button, Table, DataSet, NumberField, Spin, Lov } from 'choerodon-ui/pro';
import styles from 'mall-front/lib/routes/CartProCopy/renderer.less';
import intl from 'utils/intl';
import SwalAlert from 'components/swal';
import ProductAllocation from './ProductAllocation';
import { fetchConfigList, fetchHandleSave } from '../services';

const ConfigList = ({ record, dataSet, modal }) => {
  const [saveLoading, setSaveLoading] = useState(false);

  const compatibleMachine = useMemo(() => {
    const currentData = record.toData();
    const currentDimValue =
      currentData.currentDimValue || currentData.cartColumnValueList?.[0] || {};
    return (
      currentDimValue.cartDimValueList?.find((p) => p.dimensionCode === 'compatibleMachine') || {}
    );
  }, []);

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
        editor: () => <Lov />,
      },
      {
        name: 'configCode',
        header: intl.get(`mallf.cart.view.machineModal.configCode`).d('配置编码'),
      },
      {
        name: 'quantity',
        editor: (r) => (r.get('configCode') ? <NumberField /> : null),
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
          bind: 'configCodeLov.itemCode',
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
      events: {
        update({ name, value, record: re }) {
          if (name === 'configCodeLov' && !value) {
            re.set('quantity', null);
          }
        },
      },
    });
  }, []);

  modal.handleOk(() => {
    return handleSave({ close: false });
  });

  async function handleSave({ close }) {
    const flag = await initDs?.validate();
    if (!flag) return false;
    const data = initDs
      .toData()
      .map((line) => {
        const { configCodeLov, ...other } = line || {};
        return other?.configCode ? other : null;
      })
      .filter(Boolean);

    if (flag) {
      setSaveLoading(true);
      fetchHandleSave({
        dimValueId: compatibleMachine.dimValueId,
        value: JSON.stringify(data), // json串
      })
        .then(() => {
          dataSet.fetchSingleCart(record);
        })
        .finally(() => {
          setSaveLoading(false);
        });
    }
    if (close) {
      modal.close();
    }
  }

  useEffect(() => {
    modal.update({
      footer: (_, cancelBtn) => {
        return [
          <Button
            color="primary"
            loading={saveLoading}
            onClick={() => handleSave({ close: false })}
          >
            {intl.get('mallf.common.button.save').d('保存')}
          </Button>,
          <Button loading={saveLoading} onClick={() => handleSave({ close: true })}>
            {intl.get('mallf.common.button.saveAndClose').d('保存并关闭')}
          </Button>,
          cancelBtn,
        ];
      },
    });
  }, [saveLoading]);

  useEffect(() => {
    fetchConfigList().then((res) => {
      let data;
      try {
        data = JSON.parse(compatibleMachine.value);
      } catch {
        data = [];
      }
      const newData = res
        .sort((a, b) => a.orderSeq - b.orderSeq)
        .map((line, index) => {
          const find = data.find((p) => p.configTypeValue === line.value);
          if (find) {
            return find;
          }
          return {
            orderSeq: index + 1,
            configTypeName: line.meaning,
            configTypeValue: line.value,
          };
        });
      initDs.loadData(newData);
    });
  }, []);
  return (
    <Spin spinning={saveLoading}>
      <Table columns={columns} dataSet={initDs} />
    </Spin>
  );
};

function openConfig({ record, dataSet }) {
  Modal.open({
    title: intl.get(`mallf.cart.view.button.jianrongjiConfig`).d('兼容机配置'),
    style: { width: 742 },
    children: <ConfigList record={record} dataSet={dataSet} />,
    drawer: true,
    footer: (okBtn, cancelBtn) => [
      okBtn,
      <Button>{intl.get('mallf.common.button.saveAndClose').d('保存并关闭')}</Button>,
      cancelBtn,
    ],
  });
}

export default function optionsRender({ record, dataSet }) {
  const qtHeaderNo = +record.get('qtHeaderNo');
  const invalidFlag = +record.get('invalidFlag');
  const manualFlag = +record.get('manualFlag');
  const compatibleMachineFlag = +record.get('compatibleMachineFlag');
  const templateUpdateFlag = record.get('templateUpdateFlag');
  return (
    <div className={styles['sku-options-wrapper']}>
      <a
        r-if={manualFlag && compatibleMachineFlag}
        className="option-btn"
        onClick={() => openConfig({ record, dataSet })}
      >
        {intl.get(`mallf.cart.view.button.jianrongjiConfig`).d('兼容机配置')}
      </a>
      <a
        r-if={!!invalidFlag && !qtHeaderNo && !manualFlag}
        className="option-btn"
        onClick={() => dataSet.collectCartSku({ record })}
      >
        {intl.get(`mallf.cart.view.add.favorites`).d('加入收藏')}
      </a>
      <a
        className="option-btn"
        onClick={() => {
          SwalAlert(
            intl.get(`mallf.cart.model.confirm.deleteProduct`).d('确认删除该商品？'),
            true
          ).then((res) => {
            if (res.value) {
              dataSet.deleteCartRecords([record], true);
            }
          });
        }}
      >
        {intl.get(`mallf.cart.view.cart.delete.product`).d('删除商品')}
      </a>
      {!!invalidFlag && (
        <ProductAllocation
          callBack={() =>
            templateUpdateFlag ? dataSet.queryCartData() : dataSet.fetchSingleCart(record)
          }
          product={record.toJSONData()}
          noAction={!!record.get('manualFlag')}
        />
      )}
    </div>
  );
}
